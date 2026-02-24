import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

type TabBarItem = {
  key: string;
  label: string;
  icon?: ReactNode;
};

type TabBarProps = {
  items: TabBarItem[];
  activeKey: string;
  onChange: (key: string) => void;
};

export function TabBar({ items, activeKey, onChange }: TabBarProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1">
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.icon && (
                <span className="mb-0.5 text-lg leading-none">{item.icon}</span>
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

