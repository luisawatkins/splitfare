'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SharedMedia } from '@/hooks/useMedia';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Trash2, 
  ExternalLink, 
  FileText, 
  User, 
  Calendar, 
  Link as LinkIcon,
  Tag
} from 'lucide-react';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/cn';

interface MediaViewerProps {
  mediaList: SharedMedia[];
  initialIndex: number;
  onClose: () => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  currentUserId: string | null;
}

export function MediaViewer({
  mediaList,
  initialIndex,
  onClose,
  onDelete,
  isAdmin,
  currentUserId,
}: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);

  const currentMedia = mediaList[currentIndex];
  const isImage = currentMedia.media_type.startsWith('image/');
  const canDelete = isAdmin || currentMedia.uploader_id === currentUserId;

  const next = useCallback(() => {
    if (currentIndex < mediaList.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, mediaList.length]);

  const prev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [next, prev, onClose]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
            <X className="h-6 w-6" />
          </Button>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-white truncate max-w-[200px]">
              {currentMedia.title || 'Media'}
            </p>
            <p className="text-[10px] text-white/60">
              {currentIndex + 1} / {mediaList.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" asChild>
            <a href={`https://storacha.link/ipfs/${currentMedia.cid}`} download={currentMedia.title} target="_blank" rel="noopener noreferrer">
              <Download className="h-5 w-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" asChild>
            <a href={`https://storacha.link/ipfs/${currentMedia.cid}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-5 w-5" />
            </a>
          </Button>
          {canDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-red-400 hover:bg-red-400/10"
              onClick={() => {
                if (confirm('Are you sure you want to delete this media?')) {
                  onDelete(currentMedia.id);
                }
              }}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Viewer */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500;
              if (swipe && offset.x > 0) prev();
              else if (swipe && offset.x < 0) next();
            }}
            className="absolute inset-0 flex items-center justify-center p-4"
          >
            {isImage ? (
              <img
                src={`https://storacha.link/ipfs/${currentMedia.cid}`}
                alt={currentMedia.title || 'Media'}
                className="max-h-full max-w-full object-contain shadow-2xl"
              />
            ) : (
              <div className="flex flex-col items-center gap-6 p-12 bg-white/5 rounded-3xl border border-white/10 max-w-md w-full">
                <div className="p-8 rounded-full bg-primary/20">
                  <FileText className="h-16 w-16 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-white">{currentMedia.title || 'Document'}</h3>
                  <p className="text-sm text-white/60 uppercase tracking-widest">{currentMedia.media_type}</p>
                </div>
                <Button className="w-full" asChild>
                  <a href={`https://storacha.link/ipfs/${currentMedia.cid}`} target="_blank" rel="noopener noreferrer">
                    Open in Browser
                  </a>
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {currentIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 z-50 text-white hover:bg-white/10 hidden sm:flex"
            onClick={prev}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}
        {currentIndex < mediaList.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 z-50 text-white hover:bg-white/10 hidden sm:flex"
            onClick={next}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}
      </div>

      <div className="bg-black/40 border-t border-white/10 p-6 z-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-1.5">
              <User className="h-3 w-3" /> Uploader
            </span>
            <p className="text-sm font-bold text-white">{currentMedia.uploader.name}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-1.5">
              <Calendar className="h-3 w-3" /> Date
            </span>
            <p className="text-sm font-bold text-white">
              {format(new Date(currentMedia.created_at), 'MMMM d, yyyy h:mm a')}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-1.5">
              <Tag className="h-3 w-3" /> IPFS CID
            </span>
            <p className="text-sm font-mono font-bold text-primary truncate" title={currentMedia.cid}>
              {currentMedia.cid}
            </p>
          </div>
          {currentMedia.expense && (
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-1.5">
                <LinkIcon className="h-3 w-3" /> Linked Expense
              </span>
              <div className="flex items-center gap-2 group cursor-pointer">
                <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                  {currentMedia.expense.description}
                </p>
                <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                  {currentMedia.expense.currency} {currentMedia.expense.total_amount}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
