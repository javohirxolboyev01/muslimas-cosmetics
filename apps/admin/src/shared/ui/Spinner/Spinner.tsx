import styles from './Spinner.module.css';

export const Spinner = ({ size = 18, label }: { size?: number; label?: string }) => (
  <span className={styles.spinner} style={{ width: size, height: size }} role={label ? 'status' : undefined}>
    {label && <span className="sr-only">{label}</span>}
  </span>
);
