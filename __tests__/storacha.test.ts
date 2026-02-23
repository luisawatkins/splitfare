import { describe, expect, it, vi, beforeEach } from "vitest";
import { StorachaService } from "../lib/storacha";
import { formatCidUrl, isValidCid, normalizeCid } from "../lib/cid-utils";

const uploadFileMock = vi.fn();
const uploadCarMock = vi.fn();
const createSpaceMock = vi.fn();
const createDelegationMock = vi.fn();

vi.mock("@storacha/client", () => {
  return {
    create: async () => ({
      uploadFile: uploadFileMock,
      uploadCAR: uploadCarMock,
      createSpace: createSpaceMock,
      createDelegation: createDelegationMock
    })
  };
});

function createService() {
  return new StorachaService({
    uploadFile: uploadFileMock,
    uploadCAR: uploadCarMock,
    createSpace: createSpaceMock,
    createDelegation: createDelegationMock
  });
}

beforeEach(() => {
  uploadFileMock.mockReset();
  uploadCarMock.mockReset();
  createSpaceMock.mockReset();
  createDelegationMock.mockReset();
});

describe("CID utilities", () => {
  it("normalizes and validates CIDs", () => {
    const cid = "bafybeigdyrztxw3r5v7rrf5f2lqf3e7l7xootm5qdn7x6zq7j5l3z5d2uy";
    expect(isValidCid(cid)).toBe(true);
    expect(normalizeCid(cid)).toBe(cid);
  });

  it("formats gateway URLs", () => {
    const cid = "bafybeigdyrztxw3r5v7rrf5f2lqf3e7l7xootm5qdn7x6zq7j5l3z5d2uy";
    const url = formatCidUrl(cid, "hello.txt");
    expect(url).toBe(
      `https://${cid}.ipfs.storacha.link/hello.txt`
    );
  });
});

describe("StorachaService", () => {
  it("uploads files and returns CIDs", async () => {
    const cid = "bafybeigdyrztxw3r5v7rrf5f2lqf3e7l7xootm5qdn7x6zq7j5l3z5d2uy";
    uploadFileMock.mockResolvedValueOnce(cid);

    const service = createService();
    const blob = new Blob(["hello"], { type: "text/plain" });

    const result = await service.uploadFile(blob);

    expect(uploadFileMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(cid);
  });

  it("uploads JSON and returns CIDs", async () => {
    const cid = "bafybeigdyrztxw3r5v7rrf5f2lqf3e7l7xootm5qdn7x6zq7j5l3z5d2uy";
    uploadFileMock.mockResolvedValueOnce(cid);

    const service = createService();
    const result = await service.uploadJson({ foo: "bar" });

    expect(uploadFileMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(cid);
  });

  it("uploads CAR files", async () => {
    const cid = "bafybeigdyrztxw3r5v7rrf5f2lqf3e7l7xootm5qdn7x6zq7j5l3z5d2uy";
    uploadCarMock.mockResolvedValueOnce(cid);

    const service = createService();
    const blob = new Blob(["car-bytes"], { type: "application/vnd.ipld.car" });

    const result = await service.uploadCar(blob);

    expect(uploadCarMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(cid);
  });

  it("builds gateway URLs from CIDs", () => {
    const cid = "bafybeigdyrztxw3r5v7rrf5f2lqf3e7l7xootm5qdn7x6zq7j5l3z5d2uy";
    const service = createService();

    const url = service.gatewayUrl(cid, "file.png");

    expect(url).toBe(
      `https://${cid}.ipfs.storacha.link/file.png`
    );
  });

  it("creates spaces via client", async () => {
    createSpaceMock.mockResolvedValueOnce({ did: "did:example:space" });

    const service = createService();
    const result = await service.createSpace("SplitFare Trip");

    expect(createSpaceMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ did: "did:example:space" });
  });

  it("delegates via UCAN", async () => {
    createDelegationMock.mockResolvedValueOnce({ cid: "bafydelegation" });

    const service = createService();
    const result = await service.createDelegation("aud", [], { expiresAt: Date.now() });

    expect(createDelegationMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ cid: "bafydelegation" });
  });
});
