import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import HomePage from '@/pages/home/HomePage';
import NotFoundPage from '@/pages/not-found/NotFoundPage';

// Bosh sahifadan boshqa barcha sahifalar alohida chunk'da yuklanadi
const ShopPage = lazy(() => import('@/pages/shop/ShopPage'));
const ProductPage = lazy(() => import('@/pages/product/ProductPage'));
const WishlistPage = lazy(() => import('@/pages/wishlist/WishlistPage'));
const CartPage = lazy(() => import('@/pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/checkout/CheckoutPage'));
const OrderPage = lazy(() => import('@/pages/orders/OrderPage'));
const OrdersPage = lazy(() => import('@/pages/orders/OrdersPage'));
const AboutPage = lazy(() => import('@/pages/info/AboutPage'));
const ContactPage = lazy(() => import('@/pages/info/ContactPage'));
const DeliveryPage = lazy(() => import('@/pages/info/DeliveryPage'));

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'product/:id', element: <ProductPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'order/:no', element: <OrderPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'delivery', element: <DeliveryPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
