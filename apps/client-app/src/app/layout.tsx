'use client';

import localFont from 'next/font/local';
import '@shared/styles/global.css';
import { UserProvider } from '@shared/contexts/UserContext';
import { SidebarProvider, SidebarTrigger } from '@shared/components/ui/sidebar';
import { AppSidebar } from '@shared/components/ui/app-sidebar';
import { Home, Settings } from 'lucide-react';
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

// Sidebar menu items for client-app
const sidebarItems = [
  {
    title: 'Home',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Define public pages
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
            <SidebarProvider>
              <AppSidebar items={sidebarItems} />
              <main>
                <SidebarTrigger />
                {children}
              </main>
            </SidebarProvider>
          )}
        </UserProvider>
      </body>
    </html>
  );
}
