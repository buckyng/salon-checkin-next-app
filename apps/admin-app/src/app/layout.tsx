'use client';

import localFont from 'next/font/local';
import '@shared/styles/global.css';
import { UserProvider } from '@shared/contexts/UserContext';
import { SidebarProvider, SidebarTrigger } from '@shared/components/ui/sidebar';
import { AppSidebar } from '@shared/components/ui/app-sidebar';
import { Home, Building, User as UserIcon, Menu } from 'lucide-react';
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
];

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
                    <AppSidebar items={sidebarItems} />
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
