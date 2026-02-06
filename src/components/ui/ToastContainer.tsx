'use client';

import { AnimatePresence } from 'framer-motion';
import { useToastStore } from '@/store/toast-store';
import Toast from './Toast';

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={remove} />
        ))}
      </AnimatePresence>
    </div>
  );
}
