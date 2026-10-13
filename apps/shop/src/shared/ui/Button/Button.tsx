import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import './Button.css';

type Variant = 'pink' | 'soft' | 'navy';

interface BaseProps {
  variant?: Variant;
  block?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined };
type LinkProps = BaseProps & { to: string; onClick?: () => void };

/** `to` berilsa — router Link, aks holda oddiy <button>. */
export function Button(props: ButtonProps | LinkProps) {
  const { variant = 'pink', block, className, children } = props;
  const cls = cn('btn', `btn-${variant}`, block && 'btn-block', className);
  if (props.to !== undefined) {
    return (
      <Link to={props.to} className={cls} onClick={props.onClick}>
        {children}
      </Link>
    );
  }
  const { variant: _v, block: _b, className: _c, to: _t, ...rest } = props;
  return (
    <button type="button" {...rest} className={cls}>
      {children}
    </button>
  );
}
