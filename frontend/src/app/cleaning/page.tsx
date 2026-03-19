/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function CleaningPage() {
    const { data: session } = useSession();

    // --- State Management ---
    const [logs, setLogs] = useState<any[]>([]);
    const [areas, setAreas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingLogs, setIsFetchingLogs] = useState(true);
    const [status, setStatus] = useState<'CLEAN' | 'PENDING'>('CLEAN');

    // Generate user initials (e.g., "William Dias" -> "WD")
    const getInitials = (name: string | null | undefined) => {
        if (!name) return '';
        const names = name.trim().split(' ');
        if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    };

    const defaultInitials = getInitials(session?.user?.name);

    // Format ISO dates to a clean 12h AM/PM string
    const formatIsoTo12h = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    /**
     * FETCH DATA: Syncs logs and pre-registered areas from the backend
     */
    const fetchData = useCallback(async (restaurantId: string) => {
        try {
            setIsFetchingLogs(true);
            const [resLogs, resAreas] = await Promise.all([
                fetch(
                    `http://localhost:3001/api/logs/cleaning/${restaurantId}`,
                ),
                fetch(
                    `http://localhost:3001/api/logs/cleaning-areas/${restaurantId}`,
                ),
            ]);

            if (resLogs.ok) setLogs(await resLogs.json());
            if (resAreas.ok) setAreas(await resAreas.json());
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setIsFetchingLogs(false);
        }
    }, []);

    useEffect(() => {
        const restaurantId = (session?.user as any)?.restaurantId;
        if (restaurantId) fetchData(restaurantId);
    }, [session, fetchData]);

    /**
     * FORM SUBMIT: Records a new cleaning event linked to a specific area ID
     */
    async function saveCleaningLog(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const restaurantId = (session?.user as any)?.restaurantId;

        // Extract the selected Area ID from the dropdown
        const selectedAreaId = formData.get('areaId') as string;
        // Find the area name in our local state to save it as a string too (for history)
        const selectedAreaObj = areas.find((a) => a.id === selectedAreaId);

        try {
            const res = await fetch('http://localhost:3001/api/logs/cleaning', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantId,
                    cleaningAreaId: selectedAreaId, // Essential for Prisma Relation
                    area: selectedAreaObj?.name, // Display name for history
                    status: status,
                    initials: formData.get('initials'),
                    comments: formData.get('comments') || '',
                }),
            });

            if (res.ok) {
                form.reset();
                setStatus('CLEAN');
                toast.success('Cleaning task recorded!');
                if (restaurantId) await fetchData(restaurantId);
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || 'Failed to save log.');
            }
        } catch (error) {
            toast.error('Server error connection.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 font-sans">
            <header className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Cleaning Schedule ✨
                </h2>
                <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
                    Track daily hygiene and sanitation tasks.
                </p>
            </header>

            {/* FORM SECTION */}
            <form
                onSubmit={saveCleaningLog}
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4 sm:gap-6 mb-8"
            >
                {/* STATUS TOGGLE */}
                <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
                        Task Status
                    </label>
                    <div className="flex gap-3">
                        <label className="flex-1 cursor-pointer">
                            <input
                                type="radio"
                                name="statusToggle"
                                checked={status === 'CLEAN'}
                                onChange={() => setStatus('CLEAN')}
                                className="peer sr-only"
                            />
                            <div className="text-center p-2.5 rounded-lg border-2 border-slate-100 bg-slate-50 text-sm font-bold text-slate-400 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 transition-all">
                                ✨ Cleaned
                            </div>
                        </label>
                        <label className="flex-1 cursor-pointer">
                            <input
                                type="radio"
                                name="statusToggle"
                                checked={status === 'PENDING'}
                                onChange={() => setStatus('PENDING')}
                                className="peer sr-only"
                            />
                            <div className="text-center p-2.5 rounded-lg border-2 border-slate-100 bg-slate-50 text-sm font-bold text-slate-400 peer-checked:border-yellow-500 peer-checked:bg-yellow-50 peer-checked:text-yellow-700 transition-all">
                                ⏳ Pending
                            </div>
                        </label>
                    </div>
                </div>

                {/* DYNAMIC SELECT: Loaded from Settings */}
                <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                        Area / Equipment
                    </label>
                    <select
                        name="areaId"
                        required
                        className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                    >
                        <option value="">Select an area...</option>
                        {areas.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                            Your Initials
                        </label>
                        <input
                            type="text"
                            name="initials"
                            required
                            defaultValue={defaultInitials}
                            className="w-full p-2.5 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 uppercase font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                            Comments{' '}
                            <span className="text-slate-400 font-normal">
                                (Optional)
                            </span>
                        </label>
                        <input
                            type="text"
                            name="comments"
                            placeholder="Ex: Sanitized with Blue Spray"
                            className="w-full p-2.5 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || areas.length === 0}
                    className="mt-2 bg-slate-900 text-white font-bold py-3 sm:py-3.5 rounded-lg transition-colors text-sm sm:text-base shadow-md disabled:opacity-50"
                >
                    {isLoading
                        ? 'Saving...'
                        : areas.length === 0
                          ? 'No Areas Registered'
                          : 'Save Cleaning Task'}
                </button>
            </form>

            {/* LIST HISTORY */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 px-1">
                    Recent Cleaning Logs
                </h3>
                {isFetchingLogs ? (
                    <p className="text-slate-400 text-xs animate-pulse font-medium">
                        Loading history...
                    </p>
                ) : logs.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center">
                        <p className="text-slate-500 font-medium text-sm">
                            No tasks recorded today.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {logs.slice(0, 10).map((log) => (
                            <div
                                key={log.id}
                                className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center transition-all hover:shadow-md"
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold text-slate-800 text-sm">
                                            {log.area}
                                        </p>
                                        <span
                                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${log.status === 'CLEAN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}
                                        >
                                            {log.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                        By {log.initials} •{' '}
                                        {formatIsoTo12h(log.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
