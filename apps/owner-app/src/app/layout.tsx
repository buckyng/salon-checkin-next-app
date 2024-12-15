'use client';

import localFont from 'next/font/local';
import '@shared/styles/global.css';
import { SidebarProvider, SidebarTrigger } from '@shared/components/ui/sidebar';
import { AppSidebar } from '@shared/components/ui/app-sidebar';
import { UserProvider } from '@shared/contexts/UserContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePathname } from 'next/navigation';
import {  Building, Settings } from 'lucide-react';
import { withAuth } from '@shared/components/hoc/withAuth';
import { validateOwnerRole } from '@shared/services/organizationService';

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

// Sidebar menu items for owner-app
const sidebarItems = [
  { title: 'Home', url: '/organizations', icon: Building },
  { title: 'Settings', url: '/settings', icon: Settings },
];

const ProtectedLayout = withAuth(
  ({ children }: { children: React.ReactNode }) => (
    <SidebarProvider>
      <AppSidebar items={sidebarItems} />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  ),
  { validateRole: validateOwnerRole }
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Public pages (e.g., login)
  const publicPages = ['/login'];
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
