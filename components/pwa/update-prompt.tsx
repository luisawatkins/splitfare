'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const handleServiceWorkerUpdate = () => {
      setShowUpdate(true);
    };

    window.addEventListener('sw-update', handleServiceWorkerUpdate);

    return () => {
      window.removeEventListener('sw-update', handleServiceWorkerUpdate);
    };
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  const dismissUpdate = () => {
    setShowUpdate(false);
  };

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
        >
          <Card className="p-4 shadow-xl border-primary/20 bg-background/95 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-primary">Update Available!</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  A new version of SplitFare is available. Refresh to get the latest features.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={handleUpdate} className="flex-1 h-8 text-xs">
                    Update Now
                  </Button>
                  <Button size="sm" variant="ghost" onClick={dismissUpdate} className="h-8 w-8 p-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
