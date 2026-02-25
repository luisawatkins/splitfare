import { withMiddleware, createResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { supabaseAdmin } from '@/supabase/admin';
import { CreateUserSchema } from '@/lib/validations';

const handler = async (req: AuthenticatedRequest & { validatedBody: any }) => {
  try {
    const { email, name, username, wallet_address } = req.validatedBody;
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return createResponse(req.validatedBody, 201);
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: req.user.id,
        email,
        name,
        username,
        wallet_address,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return createResponse(null, 400);
    }

    return createResponse(user, 201);
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return createResponse(null, 500);
  }
};

export const POST = withMiddleware(handler, { 
  auth: true, 
  validation: { schema: CreateUserSchema } 
});
