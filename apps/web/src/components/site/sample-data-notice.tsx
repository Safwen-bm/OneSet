'use client';

import { useSyncExternalStore } from 'react';
import { sampleModeStore } from '@/lib/api';

/**
 * Honest empty-ish state: when the API is not reachable the catalog still browses,
 * but the visitor should know what they are looking at.
 */
export function SampleDataNotice() {
  const sample = useSyncExternalStore(
    sampleModeStore.subscribe,
    sampleModeStore.get,
    sampleModeStore.getServerSnapshot,
  );

  if (!sample) return null;

  return (
    <div className="border-b border-hairline bg-accent-soft">
      <p className="container py-2 text-center text-micro text-ink">
        Showing sample data the API is not connected. Start it with{' '}
        <code className="rounded bg-surface px-1.5 py-0.5">npm run dev:api</code>.
      </p>
    </div>
  );
}
