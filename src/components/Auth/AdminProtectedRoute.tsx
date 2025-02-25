'use client';

import { type ReactNode, useEffect } from 'react';
import { db } from '@/config/firebase';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface AdminProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'superadmin';
}

const AdminProtectedRoute = ({ children, requiredRole = 'admin' }: AdminProtectedRouteProps) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    let isMounted = true;

    async function checkUserRole() {
      if (!loading) {
        if (!user) {
          router.push('/admin/login');
          return;
        }

        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (!isMounted) return;

          const userData = userDoc.data();
          if (!userData || (userData.role !== 'admin' && userData.role !== 'superadmin')) {
            router.push('/admin/dashboard');
            return;
          }

          if (requiredRole === 'superadmin' && userData.role !== 'superadmin') {
            router.push('/admin/dashboard');
            return;
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          if (isMounted) {
            router.push('/admin/login');
          }
        }
      }
    }

    checkUserRole();

    return () => {
      isMounted = false;
    };
  }, [user, loading, router, requiredRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;