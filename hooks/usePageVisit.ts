import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function usePageVisit() {
  const pathname = usePathname();

  useEffect(() => {
    const recordVisit = async () => {
      try {
        await supabase.from('page_visits').insert([
          {
            page: pathname,
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            referrer: typeof document !== 'undefined' ? document.referrer : '',
          },
        ]);
      } catch (err) {
        console.error('Error recording page visit:', err);
      }
    };

    recordVisit();
  }, [pathname]);
}
