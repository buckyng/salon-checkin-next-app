'use client';
import localFont from 'next/font/local';
import '@shared/styles/global.css';
import { UserProvider } from '@shared/contexts/UserContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SidebarProvider, SidebarTrigger } from '@shared/components/ui/sidebar';
import { AppSidebar } from '@shared/components/ui/app-sidebar';
import { usePathname } from 'next/navigation';
import { Building, Settings } from 'lucide-react';

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

// Sidebar items with access control
const sidebarItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Building, key: 'dashboard' },
  { title: 'Settings', url: '/settings', icon: Settings, key: 'settings' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const publicPages = ['/login', '/signup'];
  const isPublicPage = publicPages.includes(pathname);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          {isPublicPage ? (
            // Public pages
            <main>{children}</main>
          ) : (
            <SidebarProvider>
              <AppSidebar items={sidebarItems} />
              <main>
                <SidebarTrigger />
                {children}
              </main>
            </SidebarProvider>
          )}
          <ToastContainer position="top-right" autoClose={3000} />
        </UserProvider>
      </body>
    </html>
  );
}
