'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const onboarding = searchParams.get('onboarding');
    const resetSuccess = searchParams.get('reset');

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const res = await signIn('credentials', {
            redirect: false,
            email: formData.email,
            password: formData.password,
        });

        if (res?.error) {
            setError('Invalid email or password. Please try again.');
            setIsLoading(false);
        } else {
            router.push(onboarding ? '/onboarding' : '/');
            router.refresh();
        }
    };

    return (
        <>
            {resetSuccess && (
                <div className="bg-green-50 text-green-700 p-4 rounded-2xl text-xs font-black text-center mb-6 border border-green-100 uppercase tracking-wide">
                    Password updated! Please sign in.
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-black text-center mb-6 border border-red-100 uppercase tracking-wide">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 px-1">
                        Email Address
                    </label>
                    <input
                        type="email"
                        required
                        placeholder="chef@restaurant.com"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 px-1">
                            Password
                        </label>
                        <Link href="/forgot-password" className="text-xs text-blue-600 font-bold hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                    <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] mt-2 disabled:opacity-70"
                >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <div className="mt-8 text-center space-y-4">
                <p className="text-sm text-slate-500 font-medium">
                    Don&apos;t have an account?{' '}
                    <Link href="/setup" className="text-blue-600 font-black hover:underline">
                        Sign Up
                    </Link>
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black opacity-60">
                    Secure Kitchen Management System
                </p>
            </div>
        </>
    );
}

export default function LoginPage() {
    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 font-sans">
            <div className="bg-white w-full max-w-110 p-8 sm:p-10 rounded-4xl shadow-2xl">
                <header className="text-center mb-10">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">
                        HACCP Pro
                    </h1>
                    <p className="text-slate-500 font-bold text-sm mt-2">
                        Log in to your kitchen
                    </p>
                </header>

                <Suspense fallback={<p className="text-center text-slate-400 text-sm">Loading...</p>}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}
