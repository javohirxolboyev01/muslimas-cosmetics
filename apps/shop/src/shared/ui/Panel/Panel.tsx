import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import './Panel.css';

interface Props extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  as?: ElementType;
  title?: ReactNode;
}

export function Panel({ as: Tag = 'div', title, className, children, ...rest }: Props) {
  return (
    <Tag className={cn('panel', className)} {...rest}>
      {title && <h3>{title}</h3>}
      {children}
    </Tag>
  );
}
