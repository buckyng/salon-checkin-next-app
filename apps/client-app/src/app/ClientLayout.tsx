'use client';

import { UserProvider } from '@shared/contexts/UserContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SidebarProvider, SidebarTrigger } from '@shared/components/ui/sidebar';
import { AppSidebar } from '@shared/components/ui/app-sidebar';
import { usePathname } from 'next/navigation';
import { Building, Settings } from 'lucide-react';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const publicPages = ['/login', '/signup', '/404'];
  const isPublicPage = publicPages.includes(pathname);

  // Sidebar items with access control
  const sidebarItems = [
    { title: 'Dashboard', url: '/dashboard', icon: Building, key: 'dashboard' },
    { title: 'Settings', url: '/settings', icon: Settings, key: 'settings' },
  ];
  return (
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
  );
}
