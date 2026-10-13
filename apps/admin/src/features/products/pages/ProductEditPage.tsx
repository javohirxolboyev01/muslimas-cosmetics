import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage, isApiError } from '@/shared/api/ApiError';
import { ButtonLink, Card, EmptyState, ErrorState, PageHeader, Skeleton, useToast } from '@/shared/ui';
import { ProductForm } from '../components/ProductForm';
import { useProduct, useUpdateProduct } from '../queries';
import { toFormValues, toInput } from '../schema';

export default function ProductEditPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const toast = useToast();
  const { data, isPending, error, refetch, isRefetching } = useProduct(id);
  const update = useUpdateProduct(id);
  const defaults = useMemo(() => (data ? toFormValues(data) : null), [data]);

  if (isPending) {
    return (
      <>
        <PageHeader title="Mahsulotni tahrirlash" backTo="/products" />
        <Card><div className="stack">{[60, 100, 100, 80].map((w, i) => <Skeleton key={i} width={`${w}%`} height={40} />)}</div></Card>
      </>
    );
  }

  if (error || !defaults) {
    const notFound = isApiError(error) && error.status === 404;
    return (
      <>
        <PageHeader title="Mahsulotni tahrirlash" backTo="/products" />
        <Card>
          {notFound ? (
            <EmptyState emoji="📦" title="Mahsulot topilmadi" action={<ButtonLink to="/products">Ro'yxatga qaytish</ButtonLink>} />
          ) : (
            <ErrorState error={error} onRetry={refetch} retrying={isRefetching} />
          )}
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title={data.name} description={`ID: ${data.id}`} backTo="/products" />
      <ProductForm
        // key — boshqa mahsulotga o'tganda forma qayta initsializatsiya qilinadi
        key={data.id}
        defaultValues={defaults}
        submitText="Saqlash"
        requireDirty
        submitting={update.isPending}
        serverErrors={isApiError(update.error) ? update.error.details : undefined}
        onSubmit={(values) =>
          update.mutate(toInput(values), {
            onSuccess: () => {
              toast.success("O'zgarishlar saqlandi");
              navigate('/products');
            },
            onError: (e) => toast.error(getErrorMessage(e)),
          })
        }
      />
    </>
  );
}
