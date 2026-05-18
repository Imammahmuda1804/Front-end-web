'use client';

import * as React from 'react';

import SearchClient from '@/components/search/SearchClient';

const subscribeToHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getServerHydratedSnapshot = () => false;

export function SearchClientBoundary({ fallback }: { fallback: React.ReactNode }) {
  const hasHydrated = React.useSyncExternalStore(subscribeToHydration, getHydratedSnapshot, getServerHydratedSnapshot);

  if (!hasHydrated) return fallback;

  return <SearchClient />;
}
