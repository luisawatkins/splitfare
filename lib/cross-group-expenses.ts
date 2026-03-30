export type CrossGroupExpenseRow = {
  id: string;
  groupId: string;
  groupName: string;
  currency: string;
  description: string;
  category: string;
  total_amount: number;
  created_at: string;
  paidByName: string | null;
};

export async function fetchExpensesAcrossGroups(
  token: string,
  groups: { id: string; name: string; currency?: string | null }[],
  baseUrl: string = typeof window !== 'undefined' ? window.location.origin : ''
): Promise<CrossGroupExpenseRow[]> {
  const rows: CrossGroupExpenseRow[] = [];

  await Promise.all(
    groups.map(async (g) => {
      if (!g.id) return;
      try {
        const res = await fetch(
          `${baseUrl}/api/groups/${g.id}/expenses?limit=100&sortBy=date&sortOrder=desc`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        if (!res.ok || !json.success || !json.data?.items) return;

        for (const e of json.data.items as Array<{
          id: string;
          description: string | null;
          category: string | null;
          total_amount: number | string;
          created_at: string;
          paidBy?: { name?: string } | null;
        }>) {
          rows.push({
            id: e.id,
            groupId: g.id,
            groupName: g.name,
            currency: g.currency ?? "USDC",
            description: e.description?.trim() || "Expense",
            category: e.category || "other",
            total_amount: Number(e.total_amount),
            created_at: e.created_at,
            paidByName: e.paidBy?.name ?? null,
          });
        }
      } catch {
        /* skip group */
      }
    })
  );

  return rows.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
