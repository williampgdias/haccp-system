/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/services/api';

/**
 * Interface representing a Team Member from the database.
 */
interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    restaurantId: string;
}

export default function SettingsPage() {
    const { data: session } = useSession();
    const router = useRouter();

    // Auth & Tenant Context
    const userRole = (session?.user as any)?.role;
    const restaurantId = (session?.user as any)?.restaurantId;

    // Infrastructure States
    const [fridges, setFridges] = useState<any[]>([]);
    const [areas, setAreas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Team Management States
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [staffName, setStaffName] = useState('');
    const [staffEmail, setStaffEmail] = useState('');
    const [staffRole, setStaffRole] = useState('STAFF');
    const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);
    const [isFetchingTeam, setIsFetchingTeam] = useState(false);
    const [teamMessage, setTeamMessage] = useState('');

    /**
     * SECURITY: Redirect non-admin users back to dashboard
     */
    useEffect(() => {
        if (session && userRole !== 'ADMIN') {
            toast.error('Access Denied: Admin privileges required.');
            router.push('/');
        }
    }, [session, userRole, router]);

    /**
     * Main data fetcher for the settings page.
     */
    const fetchData = async () => {
        if (!restaurantId || userRole !== 'ADMIN') return;
        setIsFetchingTeam(true);
        try {
            const [resFridges, resAreas, resTeam] = await Promise.all([
                apiFetch(`/logs/equipment/${restaurantId}`),
                apiFetch(`/logs/cleaning-areas/${restaurantId}`),
                apiFetch(`/team/${restaurantId}`),
            ]);

            if (resFridges.ok) setFridges(await resFridges.json());
            if (resAreas.ok) setAreas(await resAreas.json());
            if (resTeam.ok) setTeamMembers(await resTeam.json());
        } catch (err) {
            console.error('Error fetching settings:', err);
            toast.error('Failed to load settings.');
        } finally {
            setIsFetchingTeam(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [restaurantId, userRole]);

    /**
     * Handles adding new Equipment or Cleaning Areas.
     */
    async function handleAdd(
        e: React.FormEvent<HTMLFormElement>,
        type: 'fridge' | 'area',
    ) {
        e.preventDefault();
        setIsLoading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);
        const name = formData.get('name');

        const endpoint =
            type === 'fridge' ? 'logs/equipment' : 'logs/cleaning-areas';
        const body =
            type === 'fridge'
                ? { name, restaurantId, type: 'FRIDGE' }
                : { name, restaurantId };

        try {
            const res = await apiFetch(`/${endpoint}`, {
                method: 'POST',
                body: JSON.stringify(body),
            });

            if (res.ok) {
                toast.success(
                    `${type === 'fridge' ? 'Equipment' : 'Area'} added!`,
                );
                form.reset();
                await fetchData();
            } else {
                toast.error('Failed to save.');
            }
        } catch (err) {
            toast.error('Connection error.');
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Enhanced Delete Handler for Equipment/Areas
     */
    async function handleDelete(id: string, type: 'fridge' | 'area') {
        const warning = `ARE YOU SURE? \n\nDeleting this ${type} will permanently REMOVE all associated historical logs. This cannot be undone.`;
        if (!window.confirm(warning)) return;

        const endpoint =
            type === 'fridge' ? 'logs/equipment' : 'logs/cleaning-areas';
        try {
            const res = await apiFetch(`/${endpoint}/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success('Removed successfully!');
                await fetchData();
            }
        } catch (err) {
            toast.error('Connection error');
        }
    }

    /**
     * TEAM: Adds a new staff member.
     */
    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingTeam(true);
        setTeamMessage('');

        try {
            const res = await apiFetch(`/team`, {
                method: 'POST',
                body: JSON.stringify({
                    name: staffName,
                    email: staffEmail,
                    role: staffRole,
                    restaurantId,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setTeamMessage(`❌ Error: ${data.error}`);
            } else {
                setTeamMessage('✅ Staff added successfully!');
                setStaffName('');
                setStaffEmail('');
                setStaffRole('STAFF');
                await fetchData();
            }
        } catch (error) {
            setTeamMessage('❌ Connection failed');
        } finally {
            setIsSubmittingTeam(false);
        }
    };

    /**
     * TEAM: Toggles user role (ADMIN <-> STAFF)
     */
    const toggleRole = async (memberId: string, currentRole: string) => {
        const newRole = currentRole === 'ADMIN' ? 'STAFF' : 'ADMIN';

        try {
            const res = await apiFetch(`/team/${memberId}/role`, {
                method: 'PATCH',
                body: JSON.stringify({ role: newRole }),
            });

            if (res.ok) {
                toast.success('Role updated!');
                fetchData();
            }
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    /**
     * TEAM: Removes a staff member.
     */
    const handleDeleteTeamMember = async (id: string) => {
        if (!confirm('Permanently remove this team member?')) return;
        try {
            const res = await apiFetch(`/team/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success('Member removed');
                await fetchData();
            }
        } catch (error) {
            toast.error('Connection error');
        }
    };

    // If not admin, don't even render the UI
    if (userRole !== 'ADMIN') return null;

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 font-sans">
            <header className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Kitchen Setup ⚙️
                </h2>
                <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
                    Manage your infrastructure, safety zones, and team access.
                </p>
            </header>

            <div className="space-y-8">
                {/* COLD STORAGE */}
                <section>
                    <h3 className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                        ❄️ Cold Storage
                    </h3>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <form
                            onSubmit={(e) => handleAdd(e, 'fridge')}
                            className="p-3 bg-slate-50/50 border-b border-slate-200 flex gap-2"
                        >
                            <input
                                name="name"
                                required
                                placeholder="New Fridge Name..."
                                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                            />
                            <button
                                disabled={isLoading}
                                className="px-4 py-2 bg-slate-950 text-white font-semi-bold rounded-lg hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
                            >
                                Add
                            </button>
                        </form>
                        <div className="divide-y divide-slate-100">
                            {fridges.map((f) => (
                                <div
                                    key={f.id}
                                    className="flex justify-between items-center p-3 hover:bg-slate-50/30"
                                >
                                    <span className="text-sm font-bold text-slate-600">
                                        {f.name}
                                    </span>
                                    <button
                                        onClick={() =>
                                            handleDelete(f.id, 'fridge')
                                        }
                                        className="text-[10px] font-bold text-slate-300 hover:text-red-500 uppercase tracking-tighter"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CLEANING ZONES */}
                <section>
                    <h3 className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                        ✨ Cleaning Zones
                    </h3>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <form
                            onSubmit={(e) => handleAdd(e, 'area')}
                            className="p-3 bg-slate-50/50 border-b border-slate-200 flex gap-2"
                        >
                            <input
                                name="name"
                                required
                                placeholder="New Area Name..."
                                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                            />
                            <button
                                disabled={isLoading}
                                className="px-4 py-2 bg-slate-950 text-white font-semi-bold rounded-lg hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
                            >
                                Add
                            </button>
                        </form>
                        <div className="divide-y divide-slate-100">
                            {areas.map((a) => (
                                <div
                                    key={a.id}
                                    className="flex justify-between items-center p-3 hover:bg-slate-50/30"
                                >
                                    <span className="text-sm font-bold text-slate-600">
                                        {a.name}
                                    </span>
                                    <button
                                        onClick={() =>
                                            handleDelete(a.id, 'area')
                                        }
                                        className="text-[10px] font-bold text-slate-300 hover:text-red-500 uppercase tracking-tighter"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* TEAM MANAGEMENT */}
                <section>
                    <h3 className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                        👨‍🍳 Team Management
                    </h3>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-3 sm:p-4 border-b border-slate-100">
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                Add staff members. They will log in using their
                                email and default password:{' '}
                                <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                    HaccpPassword123!
                                </span>
                            </p>
                        </div>

                        <form
                            onSubmit={handleAddStaff}
                            className="p-3 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row gap-2"
                        >
                            <input
                                type="text"
                                value={staffName}
                                onChange={(e) => setStaffName(e.target.value)}
                                required
                                placeholder="Staff Name..."
                                className="w-full sm:w-1/3 p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                            />
                            <input
                                type="email"
                                value={staffEmail}
                                onChange={(e) => setStaffEmail(e.target.value)}
                                required
                                placeholder="Email..."
                                className="w-full flex-1 p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                            />
                            <select
                                value={staffRole}
                                onChange={(e) => setStaffRole(e.target.value)}
                                className="w-full sm:w-auto p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold bg-white"
                            >
                                <option value="STAFF">Staff</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                            <button
                                disabled={isSubmittingTeam}
                                className="px-6 py-2 bg-slate-950 text-white font-semi-bold rounded-lg hover:opacity-90 transition-all shadow-lg active:scale-[0.98] whitespace-nowrap"
                            >
                                Add
                            </button>
                        </form>

                        <div className="divide-y divide-slate-100">
                            {isFetchingTeam ? (
                                <p className="text-center p-4 text-xs text-slate-400">
                                    Loading team...
                                </p>
                            ) : teamMembers.length === 0 ? (
                                <p className="text-center p-4 text-xs text-slate-400">
                                    No staff registered yet.
                                </p>
                            ) : (
                                teamMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex justify-between items-center p-3 hover:bg-slate-50/30"
                                    >
                                        <div>
                                            <span className="text-sm font-bold text-slate-600 block leading-tight">
                                                {member.name}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                                                {member.email} •{' '}
                                                <span
                                                    onClick={() =>
                                                        toggleRole(
                                                            member.id,
                                                            member.role,
                                                        )
                                                    }
                                                    className={`uppercase cursor-pointer hover:opacity-80 transition-all tracking-wider ${
                                                        member.role === 'ADMIN'
                                                            ? 'text-blue-500 font-black'
                                                            : 'text-slate-500 font-bold'
                                                    }`}
                                                    title="Click to change role"
                                                >
                                                    {member.role} 🔄
                                                </span>
                                            </span>
                                        </div>
                                        {/* Prevents admin from deleting themselves accidentally */}
                                        {member.email !==
                                            session?.user?.email && (
                                            <button
                                                onClick={() =>
                                                    handleDeleteTeamMember(
                                                        member.id,
                                                    )
                                                }
                                                className="text-[10px] font-bold text-slate-300 hover:text-red-500 uppercase tracking-tighter"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        {teamMessage && (
                            <div className="p-3 bg-white border-t border-slate-50">
                                <p
                                    className={`text-xs font-bold uppercase tracking-wide ${teamMessage.includes('Error') ? 'text-red-500' : 'text-emerald-500'}`}
                                >
                                    {teamMessage}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
