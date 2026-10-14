import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { EmptyState } from '@/shared/ui';

export default function NotFoundPage() {
  useDocumentTitle('Sahifa topilmadi');
  return (
    <div className="wrap">
      <EmptyState icon="searchX" title="Sahifa topilmadi" text="Bunday sahifa yo'q yoki ko'chirilgan." action={{ label: 'Bosh sahifaga qaytish', to: '/' }} />
    </div>
  );
}
