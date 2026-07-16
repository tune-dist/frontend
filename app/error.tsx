'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-white/70 text-sm">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
