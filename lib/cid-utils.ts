import { CID } from "multiformats/cid";

export function normalizeCid(value: string): string {
  const trimmed = value.trim();
  const parsed = CID.parse(trimmed);
  return parsed.toString();
}

export function isValidCid(value: string): boolean {
  try {
    normalizeCid(value);
    return true;
  } catch {
    return false;
  }
}

export function formatCidUrl(cid: string, path?: string, gatewayHost = "storacha.link"): string {
  const normalized = normalizeCid(cid);
  const base = `https://${normalized}.ipfs.${gatewayHost}`;
  if (!path) return base;
  const trimmedPath = path.replace(/^\/+/, "");
  return `${base}/${trimmedPath}`;
}

