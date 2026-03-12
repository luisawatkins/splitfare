import { withMiddleware, createResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { supabaseAdmin } from '@/supabase/admin';
import { CreateUserSchema } from '@/lib/validations';
import { toDbUserId } from '@/lib/privy-utils';
import { sendEmail } from '@/lib/email';
import { WelcomeEmail } from '@/components/email/WelcomeEmail';
import * as React from 'react';

const handler = async (req: AuthenticatedRequest & { validatedBody: any }) => {
  try {
    const { email, name, username, wallet_address } = req.validatedBody;
    const dbId = toDbUserId(req.user.id);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return createResponse(req.validatedBody, 201);
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .upsert({
        id: dbId,
        email,
        name,
        username,
        wallet_address,
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return createResponse(null, 400);
    }

    sendEmail({
      to: email,
      subject: 'Welcome to SplitFare!',
      react: React.createElement(WelcomeEmail, { userFirstname: name.split(' ')[0] }),
    }).catch(err => console.error('Failed to send welcome email:', err));

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
