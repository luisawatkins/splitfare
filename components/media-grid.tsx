'use client';

import React, { useState } from 'react';
import { useMedia, SharedMedia } from '@/hooks/useMedia';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { Loader2, FileText, Download, Trash2, Maximize2 } from 'lucide-react';
import { format } from 'date-fns';
import { MediaViewer } from './media-viewer';
import { Button } from './ui/button';
import { useToast } from './ui/toast';
import { usePrivy } from '@privy-io/react-auth';
import { toDbUserId } from '@/lib/privy-utils';

interface MediaGridProps {
  groupId: string;
  isAdmin: boolean;
}

export function MediaGrid({ groupId, isAdmin }: MediaGridProps) {
  const { user } = usePrivy();
  const currentUserId = user ? toDbUserId(user.id) : null;
  const { notify } = useToast();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useMedia({ groupId });

  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);

  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allMedia = data?.pages.flatMap((page) => page.data) || [];

  const handleDelete = async (e: React.MouseEvent, mediaId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      const res = await fetch(`/api/groups/${groupId}/media/${mediaId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete media');

      notify({
        title: 'Success',
        description: 'Media deleted successfully',
        variant: 'success',
      });
      refetch();
    } catch (err) {
      notify({
        title: 'Error',
        description: 'Failed to delete media',
        variant: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (allMedia.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/30 rounded-3xl border border-dashed">
        <div className="p-4 rounded-full bg-muted mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold">No media yet</h3>
        <p className="text-sm text-muted-foreground max-w-[240px]">
          Upload photos or documents to share them with the group.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {allMedia.map((media: SharedMedia, index: number) => {
          const isImage = media.media_type.startsWith('image/');
          const canDelete = isAdmin || media.uploader_id === currentUserId;
          
          return (
            <div
              key={media.id}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-muted border cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={() => setSelectedMediaIndex(index)}
            >
              {isImage ? (
                <img
                  src={`https://storacha.link/ipfs/${media.cid}`}
                  alt={media.title || 'Media'}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center p-4 gap-2">
                  <FileText className="h-10 w-10 text-primary" />
                  <p className="text-[10px] font-bold text-center line-clamp-2 uppercase">
                    {media.title || 'Document'}
                  </p>
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="h-8 w-8 rounded-full"
                  asChild
                >
                  <a href={`https://storacha.link/ipfs/${media.cid}`} download={media.title} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                {canDelete && (
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => handleDelete(e, media.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Maximize2 className="absolute top-2 right-2 h-4 w-4 text-white" />
              </div>

              <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-[10px] text-white font-medium truncate">
                  {media.uploader.name}
                </p>
                <p className="text-[8px] text-white/70">
                  {format(new Date(media.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
      </div>

      {selectedMediaIndex !== null && (
        <MediaViewer
          mediaList={allMedia}
          initialIndex={selectedMediaIndex}
          onClose={() => setSelectedMediaIndex(null)}
          onDelete={(id) => {
            setSelectedMediaIndex(null);
            refetch();
          }}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
