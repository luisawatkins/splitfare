export async function resolvePrivyAccessToken(
  getAccessToken: () => Promise<string | null>
): Promise<string | null> {
  let token = await getAccessToken();
  if (!token && typeof window !== "undefined") {
    token = sessionStorage.getItem("api_token");
  }
  return token;
}

export const SIGN_IN_REQUIRED = "SIGN_IN_REQUIRED";
