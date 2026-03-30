import * as StorachaClient from "@storacha/client";
import { formatCidUrl, normalizeCid } from "./cid-utils";

type BlobLike = Blob;

type StorachaClientType = {
  uploadFile(file: BlobLike, options?: Record<string, unknown>): Promise<{ toString(): string }>;
  uploadCAR(car: BlobLike, options?: Record<string, unknown>): Promise<{ toString(): string }>;
  createSpace(name?: string, options?: Record<string, unknown>): Promise<{ did(): string }>;
  createDelegation?(
    audience: { did(): string },
    abilities: string[],
    options?: Record<string, unknown>
  ): Promise<{ archive(): Promise<Uint8Array> }>;
};

type StorachaServiceOptions = {
  gatewayHost?: string;
};

function cidToString(value: unknown): string {
  if (typeof value === "string") {
    return normalizeCid(value);
  }
  if (value && typeof value === "object" && "toString" in value) {
    const result = (value as { toString: () => string }).toString();
    return normalizeCid(result);
  }
  return normalizeCid(String(value));
}

export class StorachaService {
  private readonly client: StorachaClientType;
  private readonly gatewayHost: string;

  constructor(client: StorachaClientType, options?: StorachaServiceOptions) {
    this.client = client;
    this.gatewayHost = options?.gatewayHost ?? "storacha.link";
  }

  async uploadFile(file: BlobLike): Promise<string> {
    const cid = await this.client.uploadFile(file);
    return cidToString(cid);
  }

  async uploadJson(value: unknown): Promise<string> {
    const encoded = JSON.stringify(value);
    const blob = new Blob([encoded], { type: "application/json" });
    return this.uploadFile(blob);
  }

  async uploadCar(car: BlobLike): Promise<string> {
    const cid = await this.client.uploadCAR(car);
    return cidToString(cid);
  }

  gatewayUrl(cid: string, path?: string): string {
    return formatCidUrl(cid, path, this.gatewayHost);
  }

  async createSpace(name?: string, options?: unknown): Promise<unknown> {
    const space = await this.client.createSpace(name, options as never);
    return space;
  }

  async createDelegation(
    audience: unknown,
    abilities: unknown[],
    options?: unknown
  ): Promise<unknown> {
    if (!this.client.createDelegation) {
      throw new Error("Storacha client does not support delegations");
    }
    const delegation = await this.client.createDelegation(
      audience as { did(): string },
      abilities as string[],
      options as Record<string, unknown>
    );
    return delegation;
  }
}

let browserServicePromise: Promise<StorachaService> | undefined;

export async function getBrowserStorachaService(
  options?: StorachaServiceOptions
): Promise<StorachaService> {
  if (!browserServicePromise) {
    const client = (await StorachaClient.create()) as unknown as StorachaClientType;
    browserServicePromise = Promise.resolve(new StorachaService(client, options));
  }
  return browserServicePromise;
}
