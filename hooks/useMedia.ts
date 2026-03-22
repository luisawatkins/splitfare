import { useInfiniteQuery } from '@tanstack/react-query';

export interface SharedMedia {
  id: string;
  group_id: string;
  expense_id?: string;
  uploader_id: string;
  cid: string;
  media_type: string;
  title?: string;
  created_at: string;
  uploader: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  expense?: {
    id: string;
    description: string;
    total_amount: number;
    currency: string;
  };
}

interface UseMediaOptions {
  groupId: string;
  limit?: number;
}

export function useMedia({ groupId, limit = 20 }: UseMediaOptions) {
  return useInfiniteQuery({
    queryKey: ['media', groupId],
    queryFn: async ({ pageParam }) => {
      const url = new URL(`/api/groups/${groupId}/media`, window.location.origin);
      url.searchParams.set('limit', limit.toString());
      if (pageParam) {
        url.searchParams.set('cursor', pageParam as string);
      }
      
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch media');
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
  });
}
