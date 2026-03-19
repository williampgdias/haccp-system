'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function CleaningPage() {
    const { data: session } = useSession();

    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingLogs, setIsFetchingLogs] = useState(true);
    const [status, setStatus] = useState<'CLEAN' | 'PENDING'>('CLEAN');

    // Professional Initials Logic ("William Dias" -> "WD")
    const getInitials = (name: string | null | undefined) => {
        if (!name) return '';
        const names = name.trim().split(' ');
        if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    };

    const defaultInitials = getInitials(session?.user?.name);

    // Helper: ISO to 12h AM/PM format
    const formatIsoTo12h = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    // Fetch recent cleaning logs
    const fetchLogs = useCallback(async (restaurantId: string) => {
        try {
            setIsFetchingLogs(true);
            const res = await fetch(
                `http://localhost:3001/api/logs/cleaning/${restaurantId}`,
            );
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (err) {
            console.error('Error fetching cleaning logs:', err);
        } finally {
            setIsFetchingLogs(false);
        }
    }, []);

    // Initial Data Fetch
    useEffect(() => {
        const restaurantId = (session?.user as any)?.restaurantId;
        if (restaurantId) fetchLogs(restaurantId);
    }, [session, fetchLogs]);

    // Form Submit
    async function saveCleaningLog(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const restaurantId = (session?.user as any)?.restaurantId;

        try {
            const res = await fetch('http://localhost:3001/api/logs/cleaning', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantId,
                    area: formData.get('area'),
                    status: status,
                    initials: formData.get('initials'),
                    comments: formData.get('comments') || '',
                }),
            });

            if (res.ok) {
                form.reset();
                setStatus('CLEAN');
                toast.success('Cleaning task recorded!');
                if (restaurantId) await fetchLogs(restaurantId);
            } else {
                toast.error('Error recording cleaning task.');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Server connection error.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 font-sans relative">
            <header className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Cleaning Schedule ✨
                </h2>
                <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
                    Track daily hygiene and sanitation tasks.
                </p>
            </header>

            {/* INPUT FORM */}
            <form
                onSubmit={saveCleaningLog}
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-10"
            >
                {/* STATUS SELECTOR */}
                <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
                        Task Status
                    </label>
                    <div className="flex gap-3 sm:gap-4">
                        <label className="flex-1 cursor-pointer">
                            <input
                                type="radio"
                                name="statusToggle"
                                value="CLEAN"
                                checked={status === 'CLEAN'}
                                onChange={() => setStatus('CLEAN')}
                                className="peer sr-only"
                            />
                            <div className="text-center p-2.5 sm:p-3 rounded-lg border-2 border-slate-100 bg-slate-50 text-sm sm:text-base font-bold text-slate-400 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 transition-all hover:bg-slate-100">
                                ✨ Cleaned
                            </div>
                        </label>
                        <label className="flex-1 cursor-pointer">
                            <input
                                type="radio"
                                name="statusToggle"
                                value="PENDING"
                                checked={status === 'PENDING'}
                                onChange={() => setStatus('PENDING')}
                                className="peer sr-only"
                            />
                            <div className="text-center p-2.5 sm:p-3 rounded-lg border-2 border-slate-100 bg-slate-50 text-sm sm:text-base font-bold text-slate-400 peer-checked:border-yellow-500 peer-checked:bg-yellow-50 peer-checked:text-yellow-700 transition-all hover:bg-slate-100">
                                ⏳ Pending
                            </div>
                        </label>
                    </div>
                </div>

                {/* AREA / EQUIPMENT */}
                <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                        Area / Equipment
                    </label>
                    <input
                        type="text"
                        name="area"
                        required
                        placeholder="Ex: Preparation Table, Floor, Dishwasher..."
                        className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
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
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 uppercase font-bold"
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
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 sm:py-3.5 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-lg shadow-md"
                >
                    {isLoading ? 'Saving...' : 'Save Cleaning Task'}
                </button>
            </form>

            {/* RECENT RECORDS HISTORY */}
            <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">
                    Recent Cleaning Logs
                </h3>

                {isFetchingLogs ? (
                    <p className="text-slate-400 text-xs sm:text-sm animate-pulse font-medium">
                        Loading history...
                    </p>
                ) : logs.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-6 sm:p-8 text-center">
                        <p className="text-slate-500 font-medium text-sm">
                            No cleaning tasks found for today.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {logs.slice(0, 10).map((log) => {
                            const isClean = log.status === 'CLEAN';

                            return (
                                <div
                                    key={log.id}
                                    className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition-all hover:shadow-md"
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-bold text-slate-800 text-base sm:text-lg leading-none">
                                                {log.area}
                                            </p>
                                            <span
                                                className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${isClean ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}
                                            >
                                                {log.status}
                                            </span>
                                        </div>
                                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider">
                                            By{' '}
                                            <span className="font-bold text-slate-500">
                                                {log.initials}
                                            </span>{' '}
                                            • {formatIsoTo12h(log.createdAt)}
                                        </p>
                                        {log.comments && (
                                            <p className="text-[10px] sm:text-xs text-slate-500 italic mt-1.5 flex items-center gap-1">
                                                <span className="text-blue-400">
                                                    💬
                                                </span>{' '}
                                                {log.comments}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
