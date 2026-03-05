import { createHash } from 'crypto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Converts Privy user ID (DID format like did:privy:xxx) to a valid UUID
 * for storage in PostgreSQL uuid columns.
 */
export function toDbUserId(privyId: string): string {
  if (!privyId) return privyId;
  if (UUID_REGEX.test(privyId)) return privyId;
  const hash = createHash('sha256').update(privyId).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}
