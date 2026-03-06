"use client";

import { QRCodeSVG } from "qrcode.react";

type QRCodeProps = {
  value: string;
  size?: number;
};

export function QRCode({ value, size = 200 }: QRCodeProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm inline-block">
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        includeMargin={false}
        className="w-full h-full"
      />
    </div>
  );
}
