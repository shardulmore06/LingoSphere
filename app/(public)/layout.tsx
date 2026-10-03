'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { PublicNavbar } from '@/components/public-navbar';
import { Footer } from '@/components/footer';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathnamesafe();
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && profile && isAuthPage(pathname)) {
      router.push(profile.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, profile, loading, pathname, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function isAuthPage(pathname: string) {
  return ['/login', '/register', '/forgot-password'].includes(pathname);
}

function usePathnamesafe() {
  return usePathname();
}
