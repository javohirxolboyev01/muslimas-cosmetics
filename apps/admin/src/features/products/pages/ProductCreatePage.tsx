import { useNavigate } from 'react-router-dom';
import { getErrorMessage, isApiError } from '@/shared/api/ApiError';
import { PageHeader, useToast } from '@/shared/ui';
import { ProductForm } from '../components/ProductForm';
import { useCreateProduct } from '../queries';
import { emptyProduct, toInput } from '../schema';

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const create = useCreateProduct();

  return (
    <>
      <PageHeader title="Yangi mahsulot" backTo="/products" />
      <ProductForm
        defaultValues={emptyProduct}
        submitText="Yaratish"
        submitting={create.isPending}
        serverErrors={isApiError(create.error) ? create.error.details : undefined}
        onSubmit={(values) =>
          create.mutate(toInput(values), {
            onSuccess: (p) => {
              toast.success(`"${p.name}" qo'shildi`);
              navigate('/products');
            },
            onError: (e) => toast.error(getErrorMessage(e)),
          })
        }
      />
    </>
  );
}
