'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans p-8">
                    <div className="text-center max-w-md">
                        <h1 className="text-3xl font-black italic mb-2">HACCP Pro</h1>
                        <p className="text-slate-400 mb-6">Something went wrong. Our team has been notified.</p>
                        <button
                            onClick={reset}
                            className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-all"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
