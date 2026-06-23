'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import CartSidebar from './CartSidebar';

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      <Header />
      <CartSidebar />
    </>
  );
}
