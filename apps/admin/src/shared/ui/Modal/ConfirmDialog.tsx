import type { ReactNode } from 'react';
import { Button } from '../Button/Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog = ({
  open, title, message, confirmText = 'Tasdiqlash', danger = true, loading, onConfirm, onClose,
}: ConfirmDialogProps) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    size="sm"
    locked={loading}
    footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={loading}>Bekor qilish</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>{confirmText}</Button>
      </>
    }
  >
    <p className="muted">{message}</p>
  </Modal>
);
