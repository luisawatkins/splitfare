"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { ExpenseFilter } from "@/lib/validations/expense";

export interface ExpenseWithDetails {
  id: string;
  description: string;
  total_amount: number;
  category: string;
  split_type: string;
  created_at: string;
  paidBy: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  splits: Array<{
    user_id: string;
    amount_owed: number;
    percentage_owed: number | null;
    shares: number | null;
  }>;
  receipts?: Array<{
    cid: string;
    media_type: string;
  }>;
}

interface UseExpensesOptions extends Partial<ExpenseFilter> {
  groupId: string;
}

export function useExpenses({ groupId, ...filters }: UseExpensesOptions) {
  const { getAccessToken } = usePrivy();

  return useInfiniteQuery({
    queryKey: ["expenses", groupId, filters],
    queryFn: async ({ pageParam }) => {
      const token = await getAccessToken();
      const params = new URLSearchParams();
      
      if (filters.category) params.set("category", filters.category);
      if (filters.paidBy) params.set("paidBy", filters.paidBy);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
      if (filters.limit) params.set("limit", filters.limit.toString());
      if (pageParam) params.set("cursor", pageParam as string);

      const res = await fetch(`/api/groups/${groupId}/expenses?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to fetch expenses");
      return result.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    enabled: !!groupId,
  });
}
