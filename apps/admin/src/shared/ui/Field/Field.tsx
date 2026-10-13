import {
  cloneElement, forwardRef, isValidElement, useId,
  type InputHTMLAttributes, type ReactElement, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/shared/lib/cn';
import styles from './Field.module.css';

interface FieldProps {
  label: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
  /** Bitta form elementi: Input, Select yoki Textarea */
  children: ReactElement<{ id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }>;
}

/** Label, xato va yordamchi matnni har qanday input bilan accessibility qoidalariga mos bog'laydi */
export function Field({ label, error, hint, className, children }: FieldProps) {
  const autoId = useId();
  const id = children.props.id ?? autoId;
  const msgId = `${id}-msg`;
  const control = isValidElement(children)
    ? cloneElement(children, { id, 'aria-invalid': !!error || undefined, 'aria-describedby': error || hint ? msgId : undefined })
    : children;

  return (
    <div className={cn(styles.field, className)}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      {control}
      {error ? (
        <span id={msgId} className={styles.error} role="alert">{error}</span>
      ) : hint ? (
        <span id={msgId} className={styles.hint}>{hint}</span>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest }, ref,
) {
  return <input ref={ref} className={cn(styles.control, className)} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, ...rest }, ref,
) {
  return <select ref={ref} className={cn(styles.control, styles.select, className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...rest }, ref,
) {
  return <textarea ref={ref} className={cn(styles.control, styles.textarea, className)} {...rest} />;
});
