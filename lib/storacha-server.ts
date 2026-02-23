import * as StorachaClient from "@storacha/client";
import { StorachaService } from "./storacha";

type StorachaServiceOptions = {
  gatewayHost?: string;
};

export async function createServerStorachaService(
  options?: StorachaServiceOptions
): Promise<StorachaService> {
  const client = (await StorachaClient.create()) as unknown as {
    uploadFile: (file: Blob, options?: unknown) => Promise<unknown>;
    uploadCAR: (car: Blob, options?: unknown) => Promise<unknown>;
    createSpace: (name?: string, options?: unknown) => Promise<unknown>;
    createDelegation?: (
      audience: unknown,
      abilities: unknown[],
      options?: unknown
    ) => Promise<unknown>;
  };
  return new StorachaService(client, options);
}

