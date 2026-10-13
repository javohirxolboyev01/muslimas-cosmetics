import type { ReactNode } from 'react';
import { Button } from '../Button/Button';
import './EmptyState.css';

interface Props {
  emoji: string;
  title: string;
  text?: ReactNode;
  action?: { label: string; to: string } | { label: string; onClick: () => void };
}

export function EmptyState({ emoji, title, text, action }: Props) {
  return (
    <div className="empty">
      <div className="e" aria-hidden="true">{emoji}</div>
      <b>{title}</b>
      {text && <p>{text}</p>}
      {action && ('to' in action
        ? <Button to={action.to}>{action.label}</Button>
        : <Button onClick={action.onClick}>{action.label}</Button>)}
    </div>
  );
}
