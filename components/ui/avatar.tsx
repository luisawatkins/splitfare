import * as RadixAvatar from "@radix-ui/react-avatar";
import { cn } from "@/lib/cn";

type AvatarProps = RadixAvatar.AvatarProps & {
  src?: string;
  alt?: string;
  fallback?: string;
};

export function Avatar({ className, src, alt, fallback, ...props }: AvatarProps) {
  return (
    <RadixAvatar.Root
      className={cn(
        "relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <RadixAvatar.Image 
        src={src} 
        alt={alt} 
        className="h-full w-full object-cover" 
      />
      <RadixAvatar.Fallback className="flex h-full w-full items-center justify-center text-xs font-medium uppercase text-muted-foreground">
        {fallback}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}

