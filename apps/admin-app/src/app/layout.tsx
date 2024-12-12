'use client';

import localFont from 'next/font/local';
import '@shared/styles/global.css';
import { UserProvider } from '@shared/contexts/UserContext';
import { SidebarProvider, SidebarTrigger } from '@shared/components/ui/sidebar';
import { AppSidebar } from '@shared/components/ui/app-sidebar';
import { Home, Building, User as UserIcon, Settings } from 'lucide-react';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@shared/services/firebase';

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null); // Add correct type for `user`
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set authenticated user
      } else {
        setUser(null);
        router.push('/login'); // Redirect to login if unauthenticated
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {user ? (
          <SidebarProvider open={open} onOpenChange={setOpen}>
            <AppSidebar items={adminItems} />
            <main>
              <SidebarTrigger />
              <UserProvider>{children}</UserProvider>
            </main>
          </SidebarProvider>
        ) : (
          <main>
            <UserProvider>{children}</UserProvider>
          </main>
        )}
      </body>
    </html>
  );
}
