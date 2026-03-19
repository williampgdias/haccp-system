/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function TemperaturesPage() {
    const { data: session } = useSession();

    const [equipments, setEquipments] = useState<any[]>([]);
    const [groupedLogs, setGroupedLogs] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingLogs, setIsFetchingLogs] = useState(true);

    // Helper: Format Initials
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

    // Helper: Fetch and group logs
    const fetchLogs = useCallback(async (restaurantId: string) => {
        try {
            setIsFetchingLogs(true);
            const res = await fetch(
                `http://localhost:3001/api/logs/temperatures/${restaurantId}`,
            );
            if (res.ok) {
                const data = await res.json();

                const todayStr = new Date().toLocaleDateString();
                const todayLogs = data.filter(
                    (log: any) =>
                        new Date(log.createdAt).toLocaleDateString() ===
                        todayStr,
                );

                const grouped = {} as Record<string, any>;
                todayLogs.forEach((log: any) => {
                    const eqName = log.equipment?.name || 'Unknown Equipment';
                    if (!grouped[eqName]) {
                        grouped[eqName] = { morning: null, afternoon: null };
                    }
                    if (log.timeChecked === 'Afternoon') {
                        grouped[eqName].afternoon = log;
                    } else {
                        grouped[eqName].morning = log;
                    }
                });

                setGroupedLogs(grouped);
            }
        } catch (err) {
            console.error('Error fetching logs:', err);
        } finally {
            setIsFetchingLogs(false);
        }
    }, []);

    useEffect(() => {
        const restaurantId = (session?.user as any)?.restaurantId;
        if (restaurantId) {
            fetch(`http://localhost:3001/api/logs/equipment/${restaurantId}`)
                .then((res) => res.json())
                .then((data) => setEquipments(data));
            fetchLogs(restaurantId);
        }
    }, [session, fetchLogs]);

    async function saveTemperature(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const restaurantId = (session?.user as any)?.restaurantId;

        try {
            const res = await fetch(
                'http://localhost:3001/api/logs/temperatures',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        restaurantId,
                        equipmentId: formData.get('equipmentId'),
                        temperature: formData.get('temperature'),
                        initials: formData.get('initials'),
                        timeChecked: formData.get('timeChecked'),
                    }),
                },
            );

            if (res.ok) {
                form.reset();
                toast.success('Temperature recorded!');
                if (restaurantId) await fetchLogs(restaurantId);
            } else {
                const errorData = await res.json();
                toast.error(errorData.error);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Server connection error.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 font-sans">
            <header className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Daily Temperatures 🌡️
                </h2>
                <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
                    Record your morning and afternoon checks.
                </p>
            </header>

            {/* INPUT FORM */}
            <form
                onSubmit={saveTemperature}
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-10"
            >
                {/* SHIFT SELECTOR */}
                <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
                        Shift
                    </label>
                    <div className="flex gap-3 sm:gap-4">
                        <label className="flex-1 cursor-pointer">
                            <input
                                type="radio"
                                name="timeChecked"
                                value="Morning"
                                defaultChecked
                                className="peer sr-only"
                            />
                            <div className="text-center p-2.5 sm:p-3 rounded-lg border-2 border-slate-100 bg-slate-50 text-sm sm:text-base font-bold text-slate-400 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 transition-all hover:bg-slate-100">
                                🌅 Morning
                            </div>
                        </label>
                        <label className="flex-1 cursor-pointer">
                            <input
                                type="radio"
                                name="timeChecked"
                                value="Afternoon"
                                className="peer sr-only"
                            />
                            <div className="text-center p-2.5 sm:p-3 rounded-lg border-2 border-slate-100 bg-slate-50 text-sm sm:text-base font-bold text-slate-400 peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:text-orange-700 transition-all hover:bg-slate-100">
                                🌇 Afternoon
                            </div>
                        </label>
                    </div>
                </div>

                {/* EQUIPMENT DROPDOWN */}
                <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                        Equipment
                    </label>
                    <select
                        name="equipmentId"
                        required
                        className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                    >
                        <option value="">Select a fridge/freezer...</option>
                        {equipments.map((eq) => (
                            <option key={eq.id} value={eq.id}>
                                {eq.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                            Temp (°C)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            name="temperature"
                            required
                            placeholder="Ex: 3.5"
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        />
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                            Initials
                        </label>
                        <input
                            type="text"
                            name="initials"
                            required
                            placeholder="Ex: WD"
                            defaultValue={defaultInitials}
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 uppercase font-bold"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || equipments.length === 0}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-3.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-lg shadow-md"
                >
                    {isLoading ? 'Saving...' : 'Save Record'}
                </button>
            </form>

            {/* GROUPED DUAL-CARDS UI */}
            <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">
                    Today&apos;s Overview
                </h3>

                {isFetchingLogs ? (
                    <p className="text-slate-400 text-xs sm:text-sm animate-pulse font-medium">
                        Loading history...
                    </p>
                ) : Object.keys(groupedLogs).length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-6 sm:p-8 text-center">
                        <p className="text-slate-500 font-medium text-sm">
                            No temperature records found for today.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {Object.entries(groupedLogs).map(([eqName, shifts]) => (
                            <div
                                key={eqName}
                                className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3 sm:gap-4 hover:shadow-md transition-all"
                            >
                                <h4 className="font-black text-slate-800 text-base sm:text-lg border-b border-slate-100 pb-2">
                                    {eqName}
                                </h4>

                                <div className="flex flex-col gap-2.5 sm:gap-3">
                                    {/* MORNING SLOT */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
                                                Morning
                                            </span>
                                            {shifts.morning && (
                                                <span className="text-[10px] sm:text-xs font-medium text-slate-400">
                                                    {shifts.morning.initials} •{' '}
                                                    {formatIsoTo12h(
                                                        shifts.morning
                                                            .createdAt,
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        {shifts.morning ? (
                                            <span
                                                className={`px-2 sm:px-2.5 py-1 rounded-md text-xs sm:text-sm font-black shadow-sm ${shifts.morning.temperature > 8 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}
                                            >
                                                {shifts.morning.temperature}°C
                                            </span>
                                        ) : (
                                            <span className="text-[10px] sm:text-xs text-slate-300 font-medium italic">
                                                Pending
                                            </span>
                                        )}
                                    </div>

                                    {/* AFTERNOON SLOT */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-1 rounded-md">
                                                Afternoon
                                            </span>
                                            {shifts.afternoon && (
                                                <span className="text-[10px] sm:text-xs font-medium text-slate-400">
                                                    {shifts.afternoon.initials}{' '}
                                                    •{' '}
                                                    {formatIsoTo12h(
                                                        shifts.afternoon
                                                            .createdAt,
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        {shifts.afternoon ? (
                                            <span
                                                className={`px-2 sm:px-2.5 py-1 rounded-md text-xs sm:text-sm font-black shadow-sm ${shifts.afternoon.temperature > 8 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}
                                            >
                                                {shifts.afternoon.temperature}°C
                                            </span>
                                        ) : (
                                            <span className="text-[10px] sm:text-xs text-slate-300 font-medium italic">
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
