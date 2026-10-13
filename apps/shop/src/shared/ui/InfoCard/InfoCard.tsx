import type { ReactNode } from 'react';
import './InfoCard.css';

interface Props {
  emoji: string;
  title: string;
  children: ReactNode;
}

export function InfoCard({ emoji, title, children }: Props) {
  return (
    <div className="info-card">
      <span className="e" aria-hidden="true">{emoji}</span>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export function InfoCardGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className ? `cards3 ${className}` : 'cards3'}>{children}</div>;
}
