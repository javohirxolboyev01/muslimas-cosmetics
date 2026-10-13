import { ButtonLink, Card, EmptyState, PageHeader } from '@/shared/ui';

export default function NotFoundPage() {
  return (
    <>
      <PageHeader title="Sahifa topilmadi" />
      <Card>
        <EmptyState title="Bunday sahifa yo'q" description="Manzil noto'g'ri yoki sahifa ko'chirilgan."
          action={<ButtonLink to="/">Bosh sahifaga</ButtonLink>} />
      </Card>
    </>
  );
}
