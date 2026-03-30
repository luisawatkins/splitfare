"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Modal } from "@/components/ui/modal";
import { QRCode } from "@/components/qr-code";
import { Copy, Share2, QrCode as QrCodeIcon, Check } from "lucide-react";

type InviteShareProps = {
  inviteCode: string;
  groupName: string;
};

export function InviteShare({ inviteCode, groupName }: InviteShareProps) {
  const { notify } = useToast();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const inviteLink = `${window.location.origin}/join/${inviteCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setHasCopied(true);
      notify({
        title: "Link copied!",
        description: "Invite link copied to clipboard.",
        variant: "success",
      });
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      notify({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "error",
      });
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${groupName} on SplitFare`,
          text: `Join my group "${groupName}" on SplitFare to start splitting expenses!`,
          url: inviteLink,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Card className="w-full space-y-4 border-2 border-slate-200 bg-white p-6 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Invite members
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Share this link with your friends to join the group.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <div className="relative min-w-0 flex-1">
          <Input
            value={inviteLink}
            readOnly
            className="h-11 border-slate-200 bg-slate-50 pr-10 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={copyToClipboard}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            {hasCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex shrink-0 gap-2 sm:gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            onClick={() => setIsQrModalOpen(true)}
            title="Show QR Code"
          >
            <QrCodeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={shareNative}
            title="Share Link"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Modal
        open={isQrModalOpen}
        onOpenChange={setIsQrModalOpen}
        title="Group Invite QR Code"
        description={`Scan this code to join ${groupName}`}
      >
        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          <QRCode value={inviteLink} size={240} />
          <Button variant="outline" onClick={copyToClipboard} className="w-full">
            {hasCopied ? "Copied!" : "Copy Link"}
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
