import { useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { cn } from '@/shared/lib/cn';
import { Icon } from '../Icon/Icon';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  value: string;
  /** Faqat foydalanuvchi yozishni to'xtatgandan keyin chaqiriladi (debounce) */
  onSearch: (value: string) => void;
  placeholder?: string;
  label?: string;
  delay?: number;
  className?: string;
}

export function SearchInput({ value, onSearch, placeholder = 'Qidirish…', label = 'Qidirish', delay = 400, className }: SearchInputProps) {
  const [text, setText] = useState(value);
  const debounced = useDebounce(text, delay);
  const lastEmitted = useRef(value);

  // Tashqaridan (masalan "filtrlarni tozalash") qiymat o'zgarsa — sinxronlash
  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(() => {
    const next = debounced.trim();
    if (next !== lastEmitted.current) {
      lastEmitted.current = next;
      onSearch(next);
    }
  }, [debounced, onSearch]);

  return (
    <div className={cn(styles.wrap, className)}>
      <Icon name="search" size={18} className={styles.icon} />
      <input
        type="search"
        className={styles.input}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        autoComplete="off"
      />
    </div>
  );
}
