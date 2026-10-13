import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import './FormField.css';

interface Props {
  label: string;
  htmlFor: string;
  error?: string | false;
  children: ReactNode;
  className?: string;
}

/** Label + input + xato matnini birlashtiradi. Inputni children sifatida bering. */
export function FormField({ label, htmlFor, error, children, className }: Props) {
  return (
    <div className={cn('field', error && 'bad', className)}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error && <span className="err" id={`${htmlFor}-err`}>{error}</span>}
    </div>
  );
}

export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="row2">{children}</div>;
}
