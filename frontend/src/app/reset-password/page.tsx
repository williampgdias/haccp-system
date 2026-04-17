'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/services/api';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <h2 className="text-lg font-black text-slate-900">Invalid Link</h2>
                <p className="text-slate-500 text-sm">This reset link is missing or invalid.</p>
                <Link href="/forgot-password" className="block w-full text-center bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all mt-4">
                    Request a New Link
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setIsLoading(true);

        try {
            const res = await apiFetch('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, password }),
            });

            if (res.ok) {
                router.push('/login?reset=success');
            } else {
                const data = await res.json();
                setError(data.error || 'Something went wrong.');
            }
        } catch {
            setError('Server connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-black text-center mb-6 border border-red-100 uppercase tracking-wide">
                    {error}
                </div>
            )}

            <p className="text-slate-500 text-sm mb-6">Enter your new password below.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 px-1">
                        New Password
                    </label>
                    <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 px-1">
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] disabled:opacity-70"
                >
                    {isLoading ? 'Saving...' : 'Set New Password'}
                </button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 font-sans">
            <div className="bg-white w-full max-w-110 p-8 sm:p-10 rounded-4xl shadow-2xl">
                <header className="text-center mb-10">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">
                        HACCP Pro
                    </h1>
                    <p className="text-slate-500 font-bold text-sm mt-2">
                        Set a new password
                    </p>
                </header>

                <Suspense fallback={<p className="text-center text-slate-400 text-sm">Loading...</p>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
