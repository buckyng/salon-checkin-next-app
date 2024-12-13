'use client';

import localFont from 'next/font/local';
import '@shared/styles/global.css';
import { UserProvider, useUser } from '@shared/contexts/UserContext';
import { SidebarProvider, SidebarTrigger } from '@shared/components/ui/sidebar';
import { AppSidebar } from '@shared/components/ui/app-sidebar';
import { Home, Building, User as UserIcon, Settings } from 'lucide-react';

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

// Menu items.
const adminItems = [
  { title: 'Home', url: '/dashboard', icon: Home },
  { title: 'Organizations', url: '/organization', icon: Building },
  { title: 'Users', url: '/', icon: UserIcon },
  { title: 'Settings', url: '/', icon: Settings },
];

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  if (!user) {
    return <main>{children}</main>;
  }

  return (
    <SidebarProvider>
      <AppSidebar items={adminItems} />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <LayoutContent>{children}</LayoutContent>
        </UserProvider>
      </body>
    </html>
  );
}
