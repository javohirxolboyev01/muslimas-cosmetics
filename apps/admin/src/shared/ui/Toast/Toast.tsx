import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Icon } from '../Icon/Icon';
import styles from './Toast.module.css';

type ToastType = 'success' | 'error' | 'info';
interface ToastItem { id: number; type: ToastType; message: string }

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
const MAX_VISIBLE = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback((type: ToastType, message: string) => {
    const id = ++idRef.current;
    // Bir xil xabar ketma-ket bir necha marta chiqmasin
    setItems((list) => [...list.filter((t) => t.message !== message), { id, type, message }].slice(-MAX_VISIBLE));
    setTimeout(() => dismiss(id), type === 'error' ? 5000 : 3000);
  }, [dismiss]);

  // API obyekti barqaror — iste'molchilar keraksiz qayta render bo'lmaydi
  const api = useMemo<ToastApi>(() => ({
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={cn(styles.toast, styles[t.type])}>
            <Icon name={t.type === 'error' ? 'alert' : 'check'} size={18} />
            <span className={styles.msg}>{t.message}</span>
            <button type="button" className={styles.close} onClick={() => dismiss(t.id)} aria-label="Yopish">
              <Icon name="close" size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast ToastProvider ichida ishlatilishi kerak');
  return ctx;
}
