/**
 * Extract display name and email from Privy user for pre-filling forms.
 * Wallet-only users may have neither.
 */
export function getPrivyProfile(user: unknown): { name: string; email: string } {
  if (!user || typeof user !== 'object') return { name: '', email: '' };
  const u = user as Record<string, unknown>;
  let name = '';
  let email = '';

  const emailObj = u.email as { address?: string } | undefined;
  if (emailObj?.address) email = emailObj.address;
  const googleObj = u.google as { name?: string | null; email?: string | null } | undefined;
  if (googleObj?.name) name = googleObj.name;
  if (googleObj?.email && !email) email = googleObj.email;

  const accounts = u.linkedAccounts as Array<{ type?: string; address?: string; email?: string; name?: string }> | undefined;
  if (accounts) {
    for (const acc of accounts) {
      if (acc.type === 'email' && acc.address && !email) email = acc.address;
      if ((acc.type === 'google' || acc.type === 'google_oauth') && (acc as { name?: string }).name && !name) {
        name = (acc as { name?: string }).name ?? '';
      }
      if (acc.type === 'google' && (acc as { email?: string }).email && !email) {
        email = (acc as { email?: string }).email ?? '';
      }
    }
  }
  return { name: name || '', email: email || '' };
}
