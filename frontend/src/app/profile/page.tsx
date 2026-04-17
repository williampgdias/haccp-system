'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/services/api';

export default function ProfilePage() {
    const { data: session, update } = useSession();

    const [name, setName] = useState(session?.user?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingProfile(true);

        try {
            const res = await apiFetch('/auth/profile', {
                method: 'PATCH',
                body: JSON.stringify({ name }),
            });

            if (res.ok) {
                await update({ name });
                toast.success('Name updated!');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to update name.');
            }
        } catch {
            toast.error('Server connection error.');
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match.');
            return;
        }

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters.');
            return;
        }

        setIsLoadingPassword(true);

        try {
            const res = await apiFetch('/auth/profile', {
                method: 'PATCH',
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (res.ok) {
                toast.success('Password updated! Please sign in again.');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => signOut({ callbackUrl: '/login' }), 1500);
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to update password.');
            }
        } catch {
            toast.error('Server connection error.');
        } finally {
            setIsLoadingPassword(false);
        }
    };

    const inputClass = 'w-full p-3 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-medium';
    const labelClass = 'text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1';

    return (
        <div className="max-w-xl mx-auto p-4 md:p-8 font-sans">
            <header className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    My Profile
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                    Update your name and password.
                </p>
            </header>

            {/* ACCOUNT INFO */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-lg shrink-0">
                    {session?.user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                    <p className="font-black text-slate-900">{session?.user?.name}</p>
                    <p className="text-sm text-slate-500">{session?.user?.email}</p>
                </div>
            </div>

            {/* UPDATE NAME */}
            <form
                onSubmit={handleUpdateName}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-4"
            >
                <h3 className="font-black text-slate-800 mb-4">Update Name</h3>
                <div className="mb-4">
                    <label className={labelClass}>Full Name</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoadingProfile}
                    className="w-full bg-slate-950 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60"
                >
                    {isLoadingProfile ? 'Saving...' : 'Save Name'}
                </button>
            </form>

            {/* CHANGE PASSWORD */}
            <form
                onSubmit={handleUpdatePassword}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"
            >
                <h3 className="font-black text-slate-800 mb-4">Change Password</h3>
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Current Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>New Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Confirm New Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isLoadingPassword}
                    className="w-full bg-slate-950 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60 mt-4"
                >
                    {isLoadingPassword ? 'Updating...' : 'Change Password'}
                </button>
            </form>
        </div>
    );
}
