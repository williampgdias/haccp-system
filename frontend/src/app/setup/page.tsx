'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SetupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Handles the form submission for the initial SaaS setup.
     * This function sends the payload to create the first Tenant (Restaurant)
     * and its associated Admin User (Head Chef/Manager) simultaneously;
     */
    async function createAccount(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const restaurantName = formData.get('restaurantName') as string;
        const userName = formData.get('userName') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const role = formData.get('role') as string;

        try {
            // Dispatching the nested write request to our Express backend
            const res = await fetch('http://localhost:3001/api/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantName,
                    userName,
                    email,
                    password,
                    role,
                }),
            });

            if (res.ok) {
                // Redirecting to the authentication gateway upon success
                router.push('/login');
            } else {
                toast.error(
                    'Failed to create account. Please check the backend terminal for logs.',
                );
            }
        } catch (error) {
            console.error('Setup error:', error);
            toast.error(
                'Server connection error. Please ensure the backend is running on port 3001',
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md overflow-y-auto max-h-[90vh]">
                <h1 className="text-2xl font-black text-slate-800 mb-2">
                    SaaS Setup 🏢
                </h1>
                <p className="text-slate-500 text-sm mb-6">
                    Create your Restaurant and Admin account.
                </p>

                <form onSubmit={createAccount} className="flex flex-col gap-4">
                    {/* Tenant (Restaurant) Data Section */}
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-2">
                        <label className="block text-sm font-bold text-blue-900 mb-1">
                            Restaurant Name
                        </label>
                        <input
                            name="restaurantName"
                            required
                            placeholder="Ex: Gordon Ramsay Steakhouse"
                            className="w-full p-3 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </div>

                    {/* Admin User Data Section */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            Your Full Name
                        </label>
                        <input
                            name="userName"
                            required
                            placeholder="Ex: Gordon Ramsay"
                            className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="chef@restaurant.com"
                            className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            Role
                        </label>
                        <select
                            name="role"
                            className="w-full p-3 border border-slate-300 rounded-lg outline-none bg-white"
                        >
                            <option value="CHEF">Head Chef</option>
                            <option value="MANAGER">Manager</option>
                        </select>
                    </div>

                    {/* Submit Action */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-4 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Creating Empire...' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}
