'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/services/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await apiFetch('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setSent(true);
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
        <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 font-sans">
            <div className="bg-white w-full max-w-110 p-8 sm:p-10 rounded-4xl shadow-2xl">
                <header className="text-center mb-10">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">
                        HACCP Pro
                    </h1>
                    <p className="text-slate-500 font-bold text-sm mt-2">
                        Reset your password
                    </p>
                </header>

                {sent ? (
                    <div className="text-center space-y-4">
                        <div className="text-4xl">📧</div>
                        <h2 className="text-lg font-black text-slate-900">Check your email</h2>
                        <p className="text-slate-500 text-sm">
                            If an account exists for <strong>{email}</strong>, we&apos;ve sent a reset link. It expires in 1 hour.
                        </p>
                        <Link
                            href="/login"
                            className="block w-full text-center bg-slate-950 text-white font-black py-4 rounded-2xl hover:opacity-90 transition-all mt-4"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-black text-center mb-6 border border-red-100 uppercase tracking-wide">
                                ⚠️ {error}
                            </div>
                        )}

                        <p className="text-slate-500 text-sm mb-6">
                            Enter your email and we&apos;ll send you a link to reset your password.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 px-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="chef@restaurant.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] disabled:opacity-70"
                            >
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link href="/login" className="text-sm text-blue-600 font-bold hover:underline">
                                Back to Sign In
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
