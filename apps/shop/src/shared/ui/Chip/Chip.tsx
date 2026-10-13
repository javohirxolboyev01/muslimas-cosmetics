import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import './Chip.css';

type Props = { active?: boolean; children: ReactNode; className?: string } & (
  | ({ to: string } & { replace?: boolean })
  | ({ to?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
);

export function Chip(props: Props) {
  const cls = cn('chip', props.active && 'on', props.className);
  if (props.to !== undefined) {
    return (
      <Link to={props.to} replace={props.replace} className={cls} aria-current={props.active ? 'true' : undefined}>
        {props.children}
      </Link>
    );
  }
  const { active: _a, className: _c, to: _t, ...rest } = props;
  return <button type="button" {...rest} className={cls} />;
}

export function ChipGroup({ children, ...rest }: { children: ReactNode; role?: string; 'aria-label'?: string }) {
  return (
    <div className="chips" {...rest}>
      {children}
    </div>
  );
}
