"use client";

import { useState } from "react";
import { ExternalLink, Maximize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { resolveMediaUrl } from "@/lib/media-url";

interface ReceiptViewerProps {
  cid: string;
  className?: string;
}

export function ReceiptViewer({ cid, className }: ReceiptViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const gatewayUrl = resolveMediaUrl(cid);
  const ipfsUrl = resolveMediaUrl(cid);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1));
  const resetZoom = () => setZoom(1);

  return (
    <div className={cn("space-y-4", className)}>
      <div className={cn(
        "relative rounded-xl overflow-hidden border bg-muted transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 bg-black flex items-center justify-center" : "aspect-[3/4]"
      )}>
        <div 
          className="relative w-full h-full transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          <Image
            src={gatewayUrl}
            alt="Receipt from Storacha"
            fill
            className={cn(
              "object-contain",
              isFullscreen ? "p-4" : "p-2"
            )}
            priority
          />
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/20">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-white rounded-full" 
            onClick={zoomOut}
            disabled={zoom <= 1}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-[10px] text-white font-black w-8 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-white rounded-full" 
            onClick={zoomIn}
            disabled={zoom >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-white rounded-full" 
            onClick={resetZoom}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-white rounded-full" 
            onClick={toggleFullscreen}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {isFullscreen && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-6 right-6 text-white h-10 w-10 bg-white/10 rounded-full backdrop-blur-sm"
            onClick={toggleFullscreen}
          >
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
            Storage Provider
          </span>
          <span className="text-xs font-bold text-primary">Storacha / IPFS</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 h-8 rounded-full border-primary/20 text-xs font-bold"
          asChild
        >
          <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3" />
            Verify on IPFS
          </a>
        </Button>
      </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
