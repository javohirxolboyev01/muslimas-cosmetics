import styles from './Switch.module.css';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Label faqat ekran o'quvchilar uchun */
  hideLabel?: boolean;
  disabled?: boolean;
}

export const Switch = ({ checked, onChange, label, hideLabel, disabled }: SwitchProps) => (
  <label className={styles.wrap}>
    <input
      type="checkbox"
      role="switch"
      className={styles.input}
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span className={styles.track} aria-hidden="true" />
    <span className={hideLabel ? 'sr-only' : styles.text}>{label}</span>
  </label>
);
