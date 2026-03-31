export function resolveMediaUrl(cidOrUrl: string): string {
  const value = (cidOrUrl || "").trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:") || value.startsWith("/")) {
    return value;
  }
  return `https://storacha.link/ipfs/${value}`;
}

