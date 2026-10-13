import type { ReactNode } from 'react';
import './RadioCard.css';

interface Props {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  aside?: ReactNode;
}

export function RadioCard({ name, value, checked, onChange, title, subtitle, aside }: Props) {
  return (
    <label className="opt">
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} />
      <span className="dot" />
      <span>
        <b>{title}</b>
        {subtitle && <small>{subtitle}</small>}
      </span>
      {aside != null && <span className="pr">{aside}</span>}
    </label>
  );
}

export function RadioGroup({ children }: { children: ReactNode }) {
  return <div className="opts" role="radiogroup">{children}</div>;
}
