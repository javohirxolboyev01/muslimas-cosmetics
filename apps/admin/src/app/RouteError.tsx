import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Button, Card, EmptyState } from '@/shared/ui';

/** Render paytidagi kutilmagan xatolar — butun ilova emas, faqat shu sahifa "yiqiladi" */
export function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error) ? error.statusText : error instanceof Error ? error.message : '';
  // Yangi deploy'dan keyin eski chunk topilmasa — sahifani yangilash kifoya
  const isChunkError = /dynamically imported module|Failed to fetch/i.test(message);

  return (
    <div style={{ padding: 'var(--gutter)' }}>
      <Card>
        <EmptyState
          emoji="😿"
          title={isChunkError ? 'Ilova yangilangan' : 'Kutilmagan xatolik'}
          description={isChunkError ? 'Davom etish uchun sahifani yangilang.' : message}
          action={<Button icon="refresh" onClick={() => window.location.reload()}>Sahifani yangilash</Button>}
        />
      </Card>
    </div>
  );
}
