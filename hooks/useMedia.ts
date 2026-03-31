import { useInfiniteQuery } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';

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
  const { getAccessToken, authenticated } = usePrivy();

  return useInfiniteQuery({
    queryKey: ['media', groupId],
    queryFn: async ({ pageParam }) => {
      const url = new URL(`/api/groups/${groupId}/media`, window.location.origin);
      url.searchParams.set('limit', limit.toString());
      if (pageParam) {
        url.searchParams.set('cursor', pageParam as string);
      }
      
      const token = await getAccessToken();
      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch media');
      const payload = await res.json();
      return payload.data;
    },
    enabled: !!groupId && authenticated,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
  });
}
