'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  message: string;
  tone: Tone;
}

const ToastContext = createContext<{ push: (message: string, tone?: Tone) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: Tone = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 pb-safe sm:bottom-auto sm:top-0 sm:items-end sm:p-6">
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-surface px-4 py-3.5 shadow-[0_18px_50px_-24px_rgba(20,32,26,0.4)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        toast.tone === 'error' ? 'border-danger/25' : 'border-line'
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
          toast.tone === 'error' ? 'bg-danger-tint text-danger' : 'bg-emerald-tint text-emerald'
        )}
      >
        {toast.tone === 'error' ? <AlertCircle size={12} /> : <Check size={12} strokeWidth={3} />}
      </span>
      <p className="flex-1 text-sm leading-relaxed text-ink">{toast.message}</p>
      <button onClick={onClose} className="mt-0.5 text-ink-faint transition-colors hover:text-ink" aria-label="Dismiss">
        <X size={15} />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
