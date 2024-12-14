'use client';

import localFont from 'next/font/local';
import '@shared/styles/global.css';
import { UserProvider } from '@shared/contexts/UserContext';
import { SidebarProvider, SidebarTrigger } from '@shared/components/ui/sidebar';
import { AppSidebar } from '@shared/components/ui/app-sidebar';
import { Home, Building, User as UserIcon, Settings } from 'lucide-react';
import { withAuth } from '@shared/components/hoc/withAuth';
import { usePathname } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

// Define menu items for the sidebar
const sidebarItems = [
  {
    title: 'Home',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Organizations',
    url: '/organization',
    icon: Building,
  },
  {
    title: 'Users',
    url: '/user',
    icon: UserIcon,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
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
  )
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Define public pages
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
