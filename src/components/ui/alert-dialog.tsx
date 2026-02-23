'use client';

/**
 * Alert Dialog Component
 * Modal dialog for confirmations and alerts
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: AlertDialogProps) {
  const [mounted, setMounted] = React.useState(false);
  const [isConfirming, setIsConfirming] = React.useState(false);

  // Track mount state for portal
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Lock body scroll when dialog is open
  React.useEffect(() => {
    if (open) {
      // Save current overflow style
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;

      // Get scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Lock scroll
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      // Cleanup: restore original styles when dialog closes
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [open]);

  const handleConfirm = async () => {
    if (onConfirm) {
      setIsConfirming(true);
      try {
        // Wrap in Promise.resolve to handle both sync and async callbacks
        await Promise.resolve(onConfirm());
        onOpenChange(false);
      } catch (error) {
        // Keep dialog open on error so user sees error message
        console.error('Error in confirm action:', error);
      } finally {
        setIsConfirming(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  if (!open || !mounted) return null;

  const dialogContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-md"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        onClick={isConfirming ? undefined : handleCancel}
      />

      {/* Dialog */}
      <div className="fixed left-[50%] top-[50%] z-[9999] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] p-4">
        <div className="bg-card border border-border rounded-lg shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={handleCancel}
              disabled={isConfirming}
              className="rounded-sm opacity-70 hover:opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 bg-card">
            {description && (
              <p className="text-sm text-muted-foreground mb-4">{description}</p>
            )}
            {children}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 bg-card border-t border-border">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isConfirming}
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === 'destructive' ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={isConfirming}
            >
              {isConfirming && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(dialogContent, document.body);
}
