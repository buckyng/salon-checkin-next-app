'use client';

import localFont from 'next/font/local';
import '@shared/styles/global.css';
import { UserProvider } from '@shared/contexts/UserContext';
import { withAuth } from '@shared/components/hoc/withAuth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { validateClientRole } from '@shared/services/organizationService';
import NavBar from '@shared/components/ui/NavBar';
import { usePathname } from 'next/navigation';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

const ProtectedLayout = withAuth(
  ({ children }: { children: React.ReactNode }) => (
    <>
      <main className="pb-16">{children}</main>
      <NavBar homepagePath="/organizations" />
    </>
  ),
  { validateRole: validateClientRole }
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Public pages (e.g., login)
  const publicPages = ['/login', '/signup'];
  const isPublicPage = publicPages.includes(pathname);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          {isPublicPage ? (
            <main>{children}</main>
          ) : (
            <ProtectedLayout>{children}</ProtectedLayout>
          )}
          {/* ToastContainer to show toast notifications */}
          <ToastContainer position="top-right" autoClose={3000} />
        </UserProvider>
      </body>
    </html>
  );
}
