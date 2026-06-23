'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useNavigation() {
  const router = useRouter();

  const go = useCallback((route) => router.push(route), [router]);
  const back = useCallback(() => router.back(), [router]);

  return { go, back, router };
}
