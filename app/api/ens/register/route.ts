import { withMiddleware, createResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { supabaseAdmin } from '@/supabase/admin';
import { registerSubdomain, validateSubdomain, DOMAIN } from '@/lib/ens';
import { AppError } from '@/lib/errors';
import { toDbUserId } from '@/lib/privy-utils';
import { z } from 'zod';

/** GET /api/ens/register - health check that the route is registered */
export async function GET() {
  return createResponse({ ok: true, message: 'ENS register endpoint' }, 200);
}

const RegisterENSSchema = z.object({
  subdomain: z.string().min(3).max(20).regex(/^[a-zA-Z0-9]+$/, 'Alphanumeric only'),
  wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Valid Ethereum address required'),
  name: z.string().min(2).max(100),
  email: z.union([z.string().email(), z.literal('')]).optional(),
});

const handler = async (req: AuthenticatedRequest & { validatedBody: z.infer<typeof RegisterENSSchema> }) => {
  if (!process.env.NAMESPACE_API_KEY) {
    throw new AppError('ENS registration is not configured. Set NAMESPACE_API_KEY in your environment. Get your key at https://dev.namespace.ninja', 503);
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new AppError('Database is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.', 503);
  }

  const { subdomain, wallet_address, name, email } = req.validatedBody;
  const privyId = req.user.id;
  const dbId = toDbUserId(privyId);
  const emailOrPlaceholder = email?.trim() || `${privyId}@splitfare.privy`;
  const validation = validateSubdomain(subdomain);
  if (!validation.valid) {
    throw new AppError(validation.error || 'Invalid subdomain', 400);
  }

  let user = await supabaseAdmin
    .from('users')
    .select('id, wallet_address, name, email')
    .eq('id', dbId)
    .single()
    .then(({ data, error }) => (error ? null : data));

  if (!user) {
    const { data: byWallet } = await supabaseAdmin
      .from('users')
      .select('id, wallet_address, name, email')
      .eq('wallet_address', wallet_address)
      .maybeSingle();
    if (byWallet) user = byWallet;
  }

  if (!user) {
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        id: dbId,
        email: emailOrPlaceholder,
        name: name.trim(),
        username: `u_${privyId.replace(/[^a-zA-Z0-9]/g, '').slice(-12)}`,
        wallet_address,
      })
      .select('id, wallet_address, name, email')
      .single();

    if (createError || !newUser) {
      console.error('Failed to create user:', createError);
      throw new AppError(
        'Could not create account. Please sign out, sign in again, then try again.',
        400
      );
    }
    user = newUser;
  }

  const addressToUse = user!.wallet_address || wallet_address;
  if (!addressToUse) {
    throw new AppError('Wallet address required. Please connect your wallet.', 400);
  }

  if (user!.wallet_address && user!.wallet_address.toLowerCase() !== wallet_address.toLowerCase()) {
    await supabaseAdmin
      .from('users')
      .update({ wallet_address })
      .eq('id', user!.id);
  }

  try {
    await registerSubdomain(subdomain.toLowerCase(), addressToUse);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('ENS registration failed:', err);
    throw new AppError(
      msg.includes('Api key') ? 'NAMESPACE_API_KEY is invalid or domain not configured. Register splitfare.eth at https://dev.namespace.ninja' : msg,
      400
    );
  }

  const ensName = `${subdomain.toLowerCase()}.${DOMAIN}`;
  const updateData: Record<string, string> = { ens_name: ensName, name: name.trim(), wallet_address };
  if (email?.trim()) updateData.email = email.trim();

  const updateByWallet = (addr: string) =>
    supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('wallet_address', addr)
      .select('id, ens_name')
      .single();

  const updateById = () =>
    supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', user!.id)
      .select('id, ens_name')
      .single();

  let result = await updateByWallet(wallet_address);
  if (result.error || !result.data) {
    result = await updateByWallet(wallet_address.toLowerCase());
  }
  if (result.error || !result.data) {
    result = await updateById();
  }

  const { data: updatedUser, error: updateError } = result;

  if (updateError) {
    console.error('Failed to update user ens_name:', updateError);
    throw new AppError('Registration succeeded but failed to update profile.', 500);
  }

  if (!updatedUser) {
    console.error('Update matched 0 rows. dbId:', dbId, 'wallet:', wallet_address);
    throw new AppError('Registration succeeded but profile update failed. Please contact support.', 500);
  }

  return createResponse({ ensName, registered: true });
};

export const POST = withMiddleware(handler, {
  auth: true,
  validation: { schema: RegisterENSSchema },
});
