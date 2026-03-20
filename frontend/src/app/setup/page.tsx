/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SetupPage() {
    const router = useRouter();

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                toast.success('Account created! Please sign in.');
                router.push('/login');
            } else {
                toast.error('Registration failed. Email might be in use.');
            }
        } catch (error) {
            toast.error('Server connection error.');
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 font-sans">
            <div className="bg-white w-full max-w-110 p-8 sm:p-10 rounded-4xl shadow-2xl">
                <header className="text-center mb-10">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">
                        HACCP Pro
                    </h1>
                    <p className="text-slate-500 font-bold text-sm mt-2">
                        Create your Restaurant & Admin account
                    </p>
                </header>

                <form onSubmit={handleRegister} className="space-y-5">
                    {/* RESTAURANT NAME - HIGHLIGHTED */}
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mb-2">
                        <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1.5">
                            Restaurant Name
                        </label>
                        <input
                            name="restaurantName"
                            required
                            placeholder="Ex: Caireen Early Years"
                            className="w-full bg-transparent text-slate-900 font-bold placeholder:text-blue-300 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 px-1">
                            Full Name
                        </label>
                        <input
                            name="name"
                            required
                            placeholder="Ex: William Dias"
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 px-1">
                            Email Address
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="chef@restaurant.com"
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 px-1">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] mt-2"
                    >
                        Create Account
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="text-blue-600 font-bold hover:underline"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
