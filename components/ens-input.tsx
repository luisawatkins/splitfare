'use client';

import React from 'react';
import { Input } from './ui/input';
import { useENS } from '@/hooks/useENS';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ENSInputProps {
  onValidSubdomain?: (subdomain: string) => void;
  className?: string;
}

export function ENSInput({ onValidSubdomain, className }: ENSInputProps) {
  const { 
    subdomain, 
    setSubdomain, 
    isAvailable, 
    isChecking, 
    validation 
  } = useENS();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSubdomain(value);
  };

  React.useEffect(() => {
    if (isAvailable && validation.valid) {
      onValidSubdomain?.(subdomain);
    } else {
      onValidSubdomain?.('');
    }
  }, [isAvailable, validation.valid, subdomain, onValidSubdomain]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Input
          placeholder="yourname"
          value={subdomain}
          onChange={handleChange}
          className={cn(
            "pr-32 text-lg font-medium",
            subdomain && !validation.valid && "border-red-500 focus-visible:ring-red-500",
            subdomain && validation.valid && isAvailable && "border-green-500 focus-visible:ring-green-500"
          )}
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <span className="text-muted-foreground font-semibold mr-2">.splitfare.eth</span>
          {isChecking ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : subdomain && validation.valid ? (
            isAvailable ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )
          ) : null}
        </div>
      </div>
      
      {subdomain && !validation.valid && (
        <p className="text-xs text-red-500 font-medium">
          {validation.error}
        </p>
      )}
      
      {subdomain && validation.valid && !isChecking && (
        <p className={cn(
          "text-xs font-medium",
          isAvailable ? "text-green-500" : "text-red-500"
        )}>
          {isAvailable ? "Available!" : "Already taken"}
        </p>
      )}
    </div>
  );
}
