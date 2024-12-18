'use client';

import localFont from 'next/font/local';
import '@shared/styles/global.css';
import { UserProvider, useAuth } from '@shared/contexts/UserContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SidebarProvider, SidebarTrigger } from '@shared/components/ui/sidebar';
import { AppSidebar } from '@shared/components/ui/app-sidebar';
import { usePathname } from 'next/navigation';
import { Building, Settings, BarChart, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchUserRolesByOrganization } from '@shared/services/organizationService';
import { sidebarAccess } from './configs/sidebarConfig';

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
  { title: 'Reports', url: '/reports', icon: BarChart, key: 'reports' },
  { title: 'Settings', url: '/settings', icon: Settings, key: 'settings' },
];

const SidebarWithAccess = () => {
  const { user } = useAuth();
  const [filteredItems, setFilteredItems] = useState(sidebarItems);

  useEffect(() => {
    const filterItems = async () => {
      if (!user?.uid) return;

      const organizationId = localStorage.getItem('selectedOrganizationId');
      if (!organizationId) return;

      try {
        const userRoles = await fetchUserRolesByOrganization(
          user.uid,
          organizationId
        );
        const roles = userRoles.map((role) => role.roles).flat();

        const allowedItems = sidebarItems.filter((item) => {
          const allowedRoles = sidebarAccess[item.key];
          return allowedRoles?.some((role) => roles.includes(role));
        });

        setFilteredItems(allowedItems);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    filterItems();
  }, [user]);

  return <AppSidebar items={filteredItems} />;
};

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
              <div className="flex flex-col min-h-screen">
                {/* Header for Mobile */}
                <header className="flex items-center justify-between p-4 text-white bg-blue-500 md:hidden">
                  <SidebarTrigger>
                    <Menu className="w-6 h-6" />
                  </SidebarTrigger>
                </header>

                {/* Sidebar & Content */}
                <div className="flex flex-1">
                  {/* Sidebar (Mobile slide-in and Desktop fixed) */}
                  <div className="hidden md:block">
                    <SidebarWithAccess />
                  </div>

                  {/* Main Content */}
                  <main className="flex-1 p-4">{children}</main>
                </div>
              </div>
            </SidebarProvider>
          )}
          <ToastContainer position="top-right" autoClose={3000} />
        </UserProvider>
      </body>
    </html>
  );
}
