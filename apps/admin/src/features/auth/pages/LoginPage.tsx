import { env } from '@/shared/config/env';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate, type Location } from 'react-router-dom';
import { z } from 'zod';
import { getErrorMessage } from '@/shared/api/ApiError';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { Button, Field, Input } from '@/shared/ui';
import { useAuth } from '../AuthProvider';
import styles from './LoginPage.module.css';

const schema = z.object({
  email: z.string().trim().email("To'g'ri email kiriting"),
  password: z.string().min(4, 'Parol kamida 4 belgi'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  useDocumentTitle('Kirish');
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: Location } | null)?.from?.pathname ?? '/';

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    // Demo ma'lumotlar faqat dev/mock rejimida oldindan to'ldiriladi
    defaultValues: env.useMock || env.isDev ? { email: 'admin@muslima.uz', password: 'admin123' } : { email: '', password: '' },
  });

  if (isAuthenticated && !login.isPending) return <Navigate to={from} replace />;

  const onSubmit = handleSubmit((values) => {
    if (login.isPending) return;
    login.mutate(values, { onSuccess: () => navigate(from, { replace: true }) });
  });

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={onSubmit} noValidate>
        <span className={styles.logo}>Muslima's Cosmetics</span>
        <h1 className={styles.title}>Admin panelga kirish</h1>
        {(env.useMock || env.isDev) && <p className={styles.hint}>Demo: <b>admin@muslima.uz</b> / <b>admin123</b></p>}

        {login.isError && <p className={styles.error} role="alert">{getErrorMessage(login.error)}</p>}

        <Field label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="username" {...register('email')} />
        </Field>
        <Field label="Parol" error={errors.password?.message}>
          <Input type="password" autoComplete="current-password" {...register('password')} />
        </Field>
        <Button type="submit" block loading={login.isPending}>Kirish</Button>
      </form>
    </main>
  );
}
