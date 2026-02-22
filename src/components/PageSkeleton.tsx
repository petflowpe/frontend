/**
 * Skeleton de página para Suspense fallback (mejor UX que solo spinner)
 */

import { Skeleton } from './ui/skeleton';

export function PageSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto" aria-hidden>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
