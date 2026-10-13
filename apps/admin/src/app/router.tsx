import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { AdminLayout } from '@/layouts/AdminLayout/AdminLayout';
import { RouteError } from './RouteError';

// Har bir sahifa alohida chunk — boshlang'ich yuklanish yengil
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const ProductsPage = lazy(() => import('@/features/products/pages/ProductsPage'));
const ProductCreatePage = lazy(() => import('@/features/products/pages/ProductCreatePage'));
const ProductEditPage = lazy(() => import('@/features/products/pages/ProductEditPage'));
const OrdersPage = lazy(() => import('@/features/orders/pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/features/orders/pages/OrderDetailPage'));
const CustomersPage = lazy(() => import('@/features/customers/pages/CustomersPage'));
const CategoriesPage = lazy(() => import('@/features/categories/pages/CategoriesPage'));
const CouponsPage = lazy(() => import('@/features/coupons/pages/CouponsPage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./NotFoundPage'));

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    errorElement: <RouteError />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            errorElement: <RouteError />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: 'products', element: <ProductsPage /> },
              { path: 'products/new', element: <ProductCreatePage /> },
              { path: 'products/:id/edit', element: <ProductEditPage /> },
              { path: 'orders', element: <OrdersPage /> },
              { path: 'orders/:no', element: <OrderDetailPage /> },
              { path: 'customers', element: <CustomersPage /> },
              { path: 'categories', element: <CategoriesPage /> },
              { path: 'coupons', element: <CouponsPage /> },
              { path: 'settings', element: <SettingsPage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
