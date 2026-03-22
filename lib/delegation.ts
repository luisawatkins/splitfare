import { StorachaService } from "@/lib/storacha";
import { UCANService } from "@/services/ucan";

export async function createDelegation(
  storacha: StorachaService,
  spaceDid: string,
  audienceDid: string,
  role: "member" | "admin" | "owner" = "member"
) {
  const ucan = new UCANService(storacha);
  return await ucan.delegateAccess(spaceDid, audienceDid, role);
}

export async function verifyDelegation(
  storacha: StorachaService,
  proofs: any[],
  requiredAbilities: string[]
) {
  const ucan = new UCANService(storacha);
  return await ucan.verifyAccess(proofs, requiredAbilities);
}
