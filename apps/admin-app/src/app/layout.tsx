'use client';

import localFont from 'next/font/local';
import '@shared/styles/global.css';
import { UserProvider } from '@shared/contexts/UserContext';
import { SidebarProvider, SidebarTrigger } from '@shared/components/ui/sidebar';
import { AppSidebar } from '@shared/components/ui/app-sidebar';
import { Home, Building, User as UserIcon, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { withAuth } from '@shared/components/hoc/withAuth';

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
const adminItems = [
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Determine if the current page is public
  const isPublicPage = pathname === '/login';

  // Render layout with hooks always called in the same order
  const layout = isPublicPage ? (
    <main>
      <UserProvider>{children}</UserProvider>
    </main>
  ) : (
    withAuth({
      children: (
        <SidebarProvider>
          <AppSidebar items={adminItems} />
          <main>
            <SidebarTrigger />
            <UserProvider>{children}</UserProvider>
          </main>
        </SidebarProvider>
      ),
      redirectTo: '/login',
    })
  );

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {layout}
      </body>
    </html>
  );
}
