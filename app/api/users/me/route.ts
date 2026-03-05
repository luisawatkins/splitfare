import { withMiddleware, createResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { supabaseAdmin } from '@/supabase/admin';
import { toDbUserId } from '@/lib/privy-utils';

const handler = async (req: AuthenticatedRequest) => {
  try {
    const dbId = toDbUserId(req.user.id);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return createResponse({
        id: dbId,
        email: 'user@example.com',
        name: 'Mock User',
        username: 'mockuser',
      }, 200);
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', dbId)
      .single();

    if (error || !user) {
      return createResponse(null, 404);
    }

    return createResponse(user);
  } catch (error) {
    console.error('Error in /api/users/me:', error);
    return createResponse(null, 500);
  }
};

export const GET = withMiddleware(handler, { auth: true });
