import type { ReactNode } from 'react';
import { Button } from '../Button/Button';
import { IconTile, type IconName } from '../Icon/Icon';
import './EmptyState.css';

interface Props {
  icon: IconName;
  title: string;
  text?: ReactNode;
  action?: { label: string; to: string } | { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, text, action }: Props) {
  return (
    <div className="empty">
      <IconTile name={icon} className="e" />
      <b>{title}</b>
      {text && <p>{text}</p>}
      {action && ('to' in action
        ? <Button to={action.to}>{action.label}</Button>
        : <Button onClick={action.onClick}>{action.label}</Button>)}
    </div>
  );
}
