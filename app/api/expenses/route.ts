import { withMiddleware, createResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { CreateExpenseSchema } from '@/lib/validations';

const getExpenses = async (req: AuthenticatedRequest) => {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get('groupId');
  return createResponse([]);
};

const createExpense = async (req: AuthenticatedRequest & { validatedBody: any }) => {
  return createResponse(req.validatedBody, 201);
};

export const GET = withMiddleware(getExpenses, { auth: true });
export const POST = withMiddleware(createExpense, { 
  auth: true, 
  validation: { schema: CreateExpenseSchema } 
});
