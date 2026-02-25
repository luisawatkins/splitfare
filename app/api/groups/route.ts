import { withMiddleware, createResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { CreateGroupSchema } from '@/lib/validations';

const getGroups = async (req: AuthenticatedRequest) => {
  return createResponse([]);
};

const createGroup = async (req: AuthenticatedRequest & { validatedBody: any }) => {
  return createResponse(req.validatedBody, 201);
};

export const GET = withMiddleware(getGroups, { auth: true });
export const POST = withMiddleware(createGroup, { 
  auth: true, 
  validation: { schema: CreateGroupSchema } 
});
