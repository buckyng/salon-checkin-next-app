'use client';

import { UserProvider } from '@shared/contexts/UserContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <main>{children}</main>
      <ToastContainer position="top-right" autoClose={3000} />
    </UserProvider>
  );
}
