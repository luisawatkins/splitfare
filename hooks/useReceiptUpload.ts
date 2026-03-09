"use client";

import { useState, useCallback } from "react";
import { uploadReceipt, type UploadProgress } from "@/services/receipt-upload";

export function useReceiptUpload() {
  const [progress, setProgress] = useState<UploadProgress>({
    status: "idle",
    progress: 0,
  });

  const upload = useCallback(async (file: File) => {
    setProgress({ status: "idle", progress: 0 });
    
    try {
      const cid = await uploadReceipt(file, (p) => {
        setProgress(p);
      });
      return cid;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setProgress({ status: "idle", progress: 0 });
  }, []);

  return {
    upload,
    reset,
    status: progress.status,
    progress: progress.progress,
    error: progress.error,
    cid: progress.cid,
  };
}
