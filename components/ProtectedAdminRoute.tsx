'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (!data.session?.user?.id) {
          router.replace('/admin/login');
          return;
        }

        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', data.session.user.id)
          .single();

        if (adminUser) {
          setAuthorized(true);
        } else {
          await supabase.auth.signOut();
          router.replace('/admin/login');
        }
      } catch (err) {
        router.replace('/admin/login');
      } finally {
        setIsChecking(false);
      }
    };

    checkAdmin();
  }, [router]);

  if (isChecking || !authorized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
