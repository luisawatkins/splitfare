"use client";

import { useExpenses, ExpenseWithDetails } from "@/hooks/useExpenses";
import { ExpenseCard } from "@/components/expense-card";
import { ExpenseFilters } from "@/components/expense-filters";
import { 
  format, isToday, isYesterday, 
  isThisWeek, startOfWeek, subDays 
} from "date-fns";
import { useState, useMemo, useEffect, useRef } from "react";
import { Loader2, Receipt, ArrowDown, RefreshCcw, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";

interface ExpenseListProps {
  groupId: string;
  currentUserId: string;
}

type GroupedExpenses = {
  title: string;
  items: ExpenseWithDetails[];
};

export function ExpenseList({ groupId, currentUserId }: ExpenseListProps) {
  const [filters, setFilters] = useState<{
    category?: string;
    search?: string;
    paidBy?: string;
  }>({});

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching
  } = useExpenses({
    groupId,
    category: filters.category,
    paidBy: filters.paidBy,
  });

  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const groupedExpenses = useMemo(() => {
    if (!data?.pages) return [];

    let allItems = data.pages.flatMap(page => page.items as ExpenseWithDetails[]);
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      allItems = allItems.filter(item => 
        item.description.toLowerCase().includes(search)
      );
    }

    const groups: Record<string, ExpenseWithDetails[]> = {};
    
    allItems.forEach(expense => {
      const date = new Date(expense.created_at);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      
      if (!groups[dayStart]) groups[dayStart] = [];
      groups[dayStart].push(expense);
    });

    return Object.keys(groups)
      .map(Number)
      .sort((a, b) => b - a)
      .map(timestamp => {
        const date = new Date(timestamp);
        let title = "";
        
        if (isToday(date)) title = "Today";
        else if (isYesterday(date)) title = "Yesterday";
        else if (isThisWeek(date)) title = "This Week";
        else title = format(date, "MMMM d, yyyy");

        return { title, items: groups[timestamp] };
      });
  }, [data?.pages, filters.search]);

  if (isLoading) {
    return (
      <div className="space-y-6 pt-4">
        <div className="h-32 bg-muted/50 animate-pulse rounded-3xl" />
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-3">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-20 w-full bg-muted animate-pulse rounded-2xl" />
            <div className="h-20 w-full bg-muted animate-pulse rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  const isEmpty = groupedExpenses.length === 0;

  return (
    <div className="space-y-6 pb-20">
      <ExpenseFilters 
        currentUserId={currentUserId}
        onFilterChange={setFilters} 
      />

      <div className="flex justify-center -mb-2 overflow-hidden h-6">
        {isRefetching && (
          <motion.div 
            initial={{ y: -20 }} 
            animate={{ y: 0 }} 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary"
          >
            <RefreshCcw className="h-3 w-3 animate-spin" />
            Refreshing...
          </motion.div>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <SearchX className="h-10 w-10 text-muted-foreground opacity-20" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tighter">No expenses found</h3>
            <p className="text-xs text-muted-foreground font-medium px-10 leading-relaxed">
              {Object.keys(filters).length > 0 
                ? "Try adjusting your filters to find what you're looking for." 
                : "Your group hasn't logged any expenses yet. Use the '+' button to get started!"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {groupedExpenses.map((group) => (
              <div key={group.title} className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">
                  {group.title}
                </h3>
                <div className="grid gap-3">
                  {group.items.map((expense) => (
                    <motion.div
                      key={expense.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ExpenseCard 
                        expense={expense} 
                        currentUserId={currentUserId} 
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </AnimatePresence>

          <div ref={loadMoreRef} className="flex justify-center py-4">
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading more...
              </div>
            ) : hasNextPage ? (
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                Scroll to load more
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                End of history
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
