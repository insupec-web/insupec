'use client';

import { usePageVisit } from '@/hooks/usePageVisit';

export default function PageTracker() {
  usePageVisit();
  return null;
}
