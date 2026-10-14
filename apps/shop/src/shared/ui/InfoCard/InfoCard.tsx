import type { ReactNode } from 'react';
import { IconTile, type IconName } from '../Icon/Icon';
import './InfoCard.css';

interface Props {
  icon: IconName;
  title: string;
  children: ReactNode;
}

export function InfoCard({ icon, title, children }: Props) {
  return (
    <div className="info-card">
      <IconTile name={icon} className="e" />
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export function InfoCardGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className ? `cards3 ${className}` : 'cards3'}>{children}</div>;
}
