import { withMiddleware, createResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { CreateSettlementSchema } from '@/lib/validations';

const getSettlements = async (req: AuthenticatedRequest) => {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get('groupId');
  return createResponse([]);
};

const createSettlement = async (req: AuthenticatedRequest & { validatedBody: any }) => {
  return createResponse(req.validatedBody, 201);
};

export const GET = withMiddleware(getSettlements, { auth: true });
export const POST = withMiddleware(createSettlement, { 
  auth: true, 
  validation: { schema: CreateSettlementSchema } 
});
