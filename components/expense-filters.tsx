"use client";

import { CATEGORIES } from "@/lib/validations/expense";
import type { ExpenseFilter } from "@/lib/validations/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Filter, Calendar as CalendarIcon, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { useState, useRef, useEffect } from "react";

type ExpenseCategoryId = NonNullable<ExpenseFilter["category"]>;

interface ExpenseFiltersProps {
  onFilterChange: (filters: Pick<ExpenseFilter, "category" | "paidBy"> & { search?: string }) => void;
  currentUserId: string;
}

export function ExpenseFilters({ onFilterChange, currentUserId }: ExpenseFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryId | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMyExpenses, setShowMyExpenses] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        paidBy: showMyExpenses ? currentUserId : undefined,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, showMyExpenses, currentUserId, onFilterChange]);

  const handleCategoryClick = (categoryId: ExpenseCategoryId) => {
    setSelectedCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  return (
    <div className="space-y-6">
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-primary/10 group-focus-within:bg-primary/20 transition-colors">
          <Search size={16} className="text-primary" />
        </div>
        <Input
          placeholder="Search expenses..."
          className="pl-12 h-12 bg-muted/50 border-none rounded-2xl focus-visible:ring-primary/20 focus-visible:bg-muted transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
            onClick={() => setSearchQuery("")}
          >
            <X size={14} />
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Categories</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "h-7 text-[10px] font-black uppercase tracking-widest rounded-full gap-2",
              showMyExpenses ? "text-primary bg-primary/10 hover:bg-primary/20" : "text-muted-foreground"
            )}
            onClick={() => setShowMyExpenses(!showMyExpenses)}
          >
            <User size={12} className={showMyExpenses ? "fill-primary" : ""} />
            My Expenses
          </Button>
        </div>

        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide sm:gap-3.5 md:gap-4 mask-fade-right">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all",
                  isSelected 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105" 
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:border-border"
                )}
              >
                <span className="text-sm">{isSelected ? "✓" : ""}</span>
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
