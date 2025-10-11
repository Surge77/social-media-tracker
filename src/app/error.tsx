'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
        <button
          className="rounded bg-primary px-4 py-2 text-white hover:bg-primary/80"
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
    </div>
  );
}