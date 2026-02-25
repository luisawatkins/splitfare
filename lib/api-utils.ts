import { NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { PrivyClient } from '@privy-io/node';
import { AppError, ValidationError, AuthenticationError } from './errors';

const privy = new PrivyClient(
  process.env.PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export type ApiResponse<T = any> = {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
} | {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
};

export const createResponse = <T>(
  data: T,
  statusCode: number = 200,
  meta?: any
): NextResponse<ApiResponse<T>> => {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    },
    { status: statusCode }
  );
};

export const createErrorResponse = (error: unknown): NextResponse<ApiResponse> => {
  if (error instanceof AppError) {
    return NextResponse.json(error.toJSON(), { status: error.statusCode });
  }

  if (error instanceof ZodError) {
    const validationError = new ValidationError('Validation failed', error.errors);
    return NextResponse.json(validationError.toJSON(), { status: 400 });
  }

  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  const internalError = new AppError(message);
  return NextResponse.json(internalError.toJSON(), { status: 500 });
};

export const logger = (
  method: string,
  path: string,
  status: number,
  duration: number
) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${path} ${status} - ${duration}ms`);
};

export type AuthenticatedRequest = Request & {
  user: {
    id: string;
    [key: string]: any;
  };
};

export type ApiHandler<T = Request> = (req: T, context?: any) => Promise<NextResponse> | NextResponse;

export const withAuth = (handler: ApiHandler<AuthenticatedRequest>) => {
  return async (req: Request, context?: any) => {
    try {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AuthenticationError('Missing or invalid authorization header');
      }

      const token = authHeader.split(' ')[1];
      const verifiedClaims = await privy.verifyAuthToken(token);

      const authReq = req as AuthenticatedRequest;
      authReq.user = {
        id: verifiedClaims.userId,
      };

      return await handler(authReq, context);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
};


export const withValidation = <T>(schema: ZodSchema<T>, handler: ApiHandler<Request & { validatedBody: T }>) => {
  return async (req: Request, context?: any) => {
    try {
      const body = await req.json();
      const validatedBody = schema.parse(body);
      
      const validatedReq = req as Request & { validatedBody: T };
      validatedReq.validatedBody = validatedBody;
      
      return await handler(validatedReq, context);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
};

import { checkRateLimit } from './rate-limit';


export const withMiddleware = <T = Request>(handler: ApiHandler<T>, options?: { auth?: boolean; validation?: { schema: ZodSchema }; rateLimit?: boolean }) => {
  return async (req: Request, context?: any) => {
    const start = Date.now();
    let response: NextResponse;

    try {
      if (options?.rateLimit !== false) {
        const identifier = req.headers.get('x-forwarded-for') || '127.0.0.1';
        await checkRateLimit(identifier);
      }

      let finalHandler: ApiHandler<any> = handler;

      if (options?.validation) {
        finalHandler = withValidation(options.validation.schema, finalHandler);
      }

      if (options?.auth) {
        finalHandler = withAuth(finalHandler);
      }

      response = await (finalHandler as ApiHandler<Request>)(req, context);
    } catch (error) {
      response = createErrorResponse(error);
    }

    const duration = Date.now() - start;
    const { pathname } = new URL(req.url);
    logger(req.method, pathname, response.status, duration);

    return response;
  };
};
