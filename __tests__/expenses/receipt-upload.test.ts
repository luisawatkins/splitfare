import { describe, expect, it, vi, beforeEach } from "vitest";
import { uploadReceipt, UploadProgress } from "@/services/receipt-upload";
import { getBrowserStorachaService } from "@/lib/storacha";

if (typeof window === "undefined") {
  (global as any).window = {
    navigator: { vibrate: vi.fn() },
    URL: { createObjectURL: vi.fn(() => "mock-url") },
  };
  (global as any).document = {
    createElement: vi.fn((tag) => {
      if (tag === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: () => ({ drawImage: vi.fn() }),
          toBlob: (cb: any) => cb(new Blob(["compressed"], { type: "image/jpeg" })),
        };
      }
      return {};
    }),
  };
  (global as any).Image = class {
    onload: any;
    src: string = "";
    width: number = 100;
    height: number = 100;
    constructor() {
      setTimeout(() => this.onload && this.onload(), 0);
    }
  };
}

vi.mock("@/lib/storacha", () => ({
  getBrowserStorachaService: vi.fn(),
}));

describe("Receipt Upload Service", () => {
  const mockFile = new File(["receipt-content"], "receipt.jpg", { type: "image/jpeg" });
  const mockCid = "bafybeigdyrztxw3r5v7rrf5f2lqf3e7l7xootm5qdn7x6zq7j5l3z5d2uy";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should upload receipt successfully and track progress", async () => {
    const uploadFileMock = vi.fn().mockResolvedValue(mockCid);
    (getBrowserStorachaService as any).mockResolvedValue({
      uploadFile: uploadFileMock,
    });

    const progressUpdates: UploadProgress[] = [];
    const onProgress = (p: UploadProgress) => progressUpdates.push(p);

    const result = await uploadReceipt(mockFile, onProgress);

    expect(result).toBe(mockCid);
    expect(progressUpdates).toContainEqual(expect.objectContaining({ status: "compressing" }));
    expect(progressUpdates).toContainEqual(expect.objectContaining({ status: "uploading" }));
    expect(progressUpdates).toContainEqual(expect.objectContaining({ status: "success", cid: mockCid }));
  });

  it("should throw error for unsupported file types", async () => {
    const invalidFile = new File(["text"], "test.txt", { type: "text/plain" });
    const onProgress = vi.fn();

    await expect(uploadReceipt(invalidFile, onProgress)).rejects.toThrow("Unsupported file type");
    expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ status: "error" }));
  });

  it("should handle upload failures and report error status", async () => {
    const error = new Error("Network failure");
    const uploadFileMock = vi.fn().mockRejectedValue(error);
    (getBrowserStorachaService as any).mockResolvedValue({
      uploadFile: uploadFileMock,
    });

    const progressUpdates: UploadProgress[] = [];
    const onProgress = (p: UploadProgress) => progressUpdates.push(p);

    await expect(uploadReceipt(mockFile, onProgress)).rejects.toThrow("Network failure");
    expect(progressUpdates).toContainEqual(expect.objectContaining({ status: "error", error: "Network failure" }));
  });
});
