import { Link } from 'react-router-dom';
import { useToastStore } from './toastStore';
import { cn } from '@/shared/lib/cn';
import './Toaster.css';

export function Toaster() {
  const { message, link, visible, hide } = useToastStore();
  return (
    <div className={cn('toast', visible && 'on', !link && 'plain')} role="status" aria-live="polite">
      <span>{message}</span>
      {link && (
        <Link to={link.to} onClick={hide}>
          {link.label}
        </Link>
      )}
    </div>
  );
}
