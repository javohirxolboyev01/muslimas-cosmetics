import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { Icon, type IconName } from '../Icon/Icon';
import { Spinner } from '../Spinner/Spinner';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';
type Size = 'sm' | 'md';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  block?: boolean;
  /** Faqat ikonka ko'rinadi (matn ekran o'quvchilar uchun qoladi) */
  iconOnly?: boolean;
  children?: ReactNode;
}

const classes = ({ variant = 'primary', size = 'md', block, iconOnly }: CommonProps, extra?: string) =>
  cn(styles.btn, styles[variant], styles[size], block && styles.block, iconOnly && styles.iconOnly, extra);

const Content = ({ icon, iconOnly, children, loading }: CommonProps & { loading?: boolean }) => (
  <>
    {loading ? <Spinner size={16} /> : icon && <Icon name={icon} size={18} />}
    {iconOnly ? <span className="sr-only">{children}</span> : children}
  </>
);

interface ButtonProps extends CommonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, icon, block, iconOnly, loading, disabled, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={classes({ variant, size, block, iconOnly }, className)}
      // loading paytida qayta bosish — takroriy so'rovning oldini oladi
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      title={iconOnly && typeof children === 'string' ? children : undefined}
      {...rest}
    >
      <Content icon={icon} iconOnly={iconOnly} loading={loading}>{children}</Content>
    </button>
  );
});

type ButtonLinkProps = CommonProps & Omit<LinkProps, 'children'>;

export const ButtonLink = ({ variant, size, icon, block, iconOnly, className, children, ...rest }: ButtonLinkProps) => (
  <Link className={classes({ variant, size, block, iconOnly }, className)} {...rest}>
    <Content icon={icon} iconOnly={iconOnly}>{children}</Content>
  </Link>
);
