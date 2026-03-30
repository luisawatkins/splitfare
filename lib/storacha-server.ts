import * as StorachaClient from "@storacha/client";
import { StorachaService } from "./storacha";

type StorachaServiceOptions = {
  gatewayHost?: string;
};

export async function createServerStorachaService(
  options?: StorachaServiceOptions
): Promise<StorachaService> {
  const client = (await StorachaClient.create()) as unknown as {
    uploadFile: (file: Blob, options?: Record<string, unknown>) => Promise<{ toString(): string }>;
    uploadCAR: (car: Blob, options?: Record<string, unknown>) => Promise<{ toString(): string }>;
    createSpace: (name?: string, options?: Record<string, unknown>) => Promise<{ did(): string }>;
    createDelegation?: (
      audience: { did(): string },
      abilities: string[],
      options?: Record<string, unknown>
    ) => Promise<{ archive(): Promise<Uint8Array> }>;
  };
  return new StorachaService(client, options);
}

