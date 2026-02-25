import { withMiddleware, createResponse, AuthenticatedRequest } from '@/lib/api-utils';

const handler = async (req: AuthenticatedRequest) => {
  const mockUser = {
    id: req.user.id,
    email: 'user@example.com',
    name: 'Mock User',
    username: 'mockuser',
  };
  
  return createResponse(mockUser);
};

export const GET = withMiddleware(handler, { auth: true });
