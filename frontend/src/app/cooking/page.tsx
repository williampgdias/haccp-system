/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export default function CookingPage() {
    const { data: session } = useSession();

    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingLogs, setIsFetchingLogs] = useState(true);
    const [processType, setProcessType] = useState<'Cooking' | 'Reheating'>(
        'Cooking',
    );

    // State to control the Cooling Modal
    const [coolingTargetId, setCoolingTargetId] = useState<string | null>(null);

    const getInitials = (name: string | null | undefined) => {
        if (!name) return '';
        const names = name.trim().split(' ');
        if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    };

    const defaultInitials = getInitials(session?.user?.name);

    const fetchLogs = useCallback(async (restaurantId: string) => {
        try {
            setIsFetchingLogs(true);
            const res = await fetch(
                `http://localhost:3001/api/logs/cooking/${restaurantId}`,
            );
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (err) {
            console.error('Error fetching cooking logs:', err);
        } finally {
            setIsFetchingLogs(false);
        }
    }, []);

    useEffect(() => {
        const restaurantId = (session?.user as any)?.restaurantId;
        if (restaurantId) fetchLogs(restaurantId);
    }, [session, fetchLogs]);

    // STEP 1: Save Initial Cooking Record
    async function saveCookingLog(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const restaurantId = (session?.user as any)?.restaurantId;

        const payload: any = {
            restaurantId,
            foodItem: formData.get('foodItem'),
            initials: formData.get('initials'),
        };

        if (processType === 'Cooking') {
            payload.cookTemp = parseFloat(formData.get('coreTemp') as string);
            payload.cookTime = formData.get('timeChecked');
        } else {
            payload.reheatTemp = parseFloat(formData.get('coreTemp') as string);
            payload.reheatTime = formData.get('timeChecked');
        }

        try {
            const res = await fetch('http://localhost:3001/api/logs/cooking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                form.reset();
                if (restaurantId) await fetchLogs(restaurantId);
            } else {
                alert('❌ Error recording cooking log.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Server connection error.');
        } finally {
            setIsLoading(false);
        }
    }

    // STEP 2: Save Cooling Update via Modal
    async function saveCoolingUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!coolingTargetId) return;

        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const restaurantId = (session?.user as any)?.restaurantId;

        try {
            const res = await fetch(
                `http://localhost:3001/api/logs/cooking/${coolingTargetId}/cooling`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        coolingFinishTime: formData.get('coolingFinishTime'),
                        coolingFinishTemp: formData.get('coolingFinishTemp'), // <-- Ajustado aqui
                    }),
                },
            );

            if (res.ok) {
                setCoolingTargetId(null); // Close Modal
                if (restaurantId) await fetchLogs(restaurantId); // Refresh List
            } else {
                alert('❌ Error updating cooling log.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Server connection error.');
        } finally {
            setIsLoading(false);
        }
    }

    const getCurrentTimeStr = () => new Date().toTimeString().substring(0, 5);

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 font-sans relative">
            <header className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    Cooking & Cooling 👨‍🍳
                </h2>
                <p className="text-slate-500 font-medium mt-1">
                    Record core temperatures and manage blast chilling.
                </p>
            </header>

            {/* ========================================= */}
            {/* STEP 1: INITIAL COOKING FORM              */}
            {/* ========================================= */}
            <form
                onSubmit={saveCookingLog}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-6 mb-10"
            >
                {/* PROCESS SELECTOR */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        Process
                    </label>
                    <div className="flex gap-4">
                        <label className="flex-1 cursor-pointer">
                            <input
                                type="radio"
                                name="processType"
                                value="Cooking"
                                checked={processType === 'Cooking'}
                                onChange={() => setProcessType('Cooking')}
                                className="peer sr-only"
                            />
                            <div className="text-center p-3 rounded-lg border-2 border-slate-100 bg-slate-50 font-bold text-slate-400 peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:text-orange-700 transition-all hover:bg-slate-100">
                                🔥 Cooking
                            </div>
                        </label>
                        <label className="flex-1 cursor-pointer">
                            <input
                                type="radio"
                                name="processType"
                                value="Reheating"
                                checked={processType === 'Reheating'}
                                onChange={() => setProcessType('Reheating')}
                                className="peer sr-only"
                            />
                            <div className="text-center p-3 rounded-lg border-2 border-slate-100 bg-slate-50 font-bold text-slate-400 peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:text-red-700 transition-all hover:bg-slate-100">
                                ♨️ Reheating
                            </div>
                        </label>
                    </div>
                </div>

                {/* FOOD ITEM */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                        Food Item
                    </label>
                    <input
                        type="text"
                        name="foodItem"
                        required
                        placeholder="Ex: Roast Chicken, Beef Stew..."
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            Core Temp
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            name="coreTemp"
                            required
                            placeholder="75.5"
                            className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-red-600"
                        />
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
                            Target: &gt;75°C
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            Time
                        </label>
                        <input
                            type="time"
                            name="timeChecked"
                            required
                            defaultValue={getCurrentTimeStr()}
                            className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            Initials
                        </label>
                        <input
                            type="text"
                            name="initials"
                            required
                            defaultValue={defaultInitials}
                            className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 uppercase font-bold"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-lg transition-colors disabled:opacity-50 text-lg shadow-md"
                >
                    {isLoading ? 'Saving...' : 'Save Cooking Record'}
                </button>
            </form>

            {/* ========================================= */}
            {/* RECENT ACTIVITY & COOLING ACTIONS           */}
            {/* ========================================= */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                    Active Kitchen Flow
                </h3>

                {isFetchingLogs ? (
                    <p className="text-slate-400 text-sm animate-pulse font-medium">
                        Loading history...
                    </p>
                ) : logs.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center">
                        <p className="text-slate-500 font-medium">
                            No cooking records found today.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {logs.slice(0, 10).map((log) => {
                            const isCooking = !!log.cookTemp;
                            const temp = isCooking
                                ? log.cookTemp
                                : log.reheatTemp;
                            const time = isCooking
                                ? log.cookTime
                                : log.reheatTime;
                            const isSafe = temp >= 75;
                            const isCoolingPending = !log.coolingFinishTime; // Check if finish time exists

                            return (
                                <div
                                    key={log.id}
                                    className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4 transition-all hover:shadow-md"
                                >
                                    {/* TOP ROW: Cooking Info */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-bold text-slate-800 text-lg leading-none">
                                                    {log.foodItem}
                                                </p>
                                                <span
                                                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${isCooking ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                                                >
                                                    {isCooking
                                                        ? 'Cooking'
                                                        : 'Reheating'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                                By{' '}
                                                <span className="font-bold text-slate-500">
                                                    {log.initials}
                                                </span>{' '}
                                                •{' '}
                                                {new Date(
                                                    log.createdAt,
                                                ).toLocaleDateString(
                                                    'en-GB',
                                                )}{' '}
                                                at {time}
                                            </p>
                                        </div>

                                        <span
                                            className={`px-3 py-1.5 rounded-lg text-sm font-black shadow-sm border ${isSafe ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}
                                        >
                                            {temp}°C
                                        </span>
                                    </div>

                                    {/* BOTTOM ROW: Cooling Action or Result */}
                                    <div className="pt-3 border-t border-slate-100">
                                        {isCoolingPending ? (
                                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-700">
                                                        Cooling Required
                                                    </p>
                                                    <p className="text-[10px] font-medium text-slate-500">
                                                        Must reach 0-5°C within
                                                        120 mins.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        setCoolingTargetId(
                                                            log.id,
                                                        )
                                                    }
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-md transition-colors shadow-sm"
                                                >
                                                    ❄️ Record Cooling
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200">
                                                    ❄️ Cooled to{' '}
                                                    {log.coolingFinishTemp}°C at{' '}
                                                    {log.coolingFinishTime}{' '}
                                                    {/* Ajustado aqui */}
                                                </span>
                                                {log.coolingFinishTemp > 5 && ( // Ajustado aqui
                                                    <span className="text-[10px] font-bold text-red-600 uppercase">
                                                        ⚠️ Target Missed
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ========================================= */}
            {/* STEP 2: COOLING MODAL                       */}
            {/* ========================================= */}
            {coolingTargetId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-blue-50/50">
                            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                ❄️ Log Cooling Process
                            </h3>
                            <p className="text-xs font-medium text-slate-500 mt-1">
                                Target: 0°C - 5°C within 2 hours.
                            </p>
                        </div>

                        <form
                            onSubmit={saveCoolingUpdate}
                            className="p-5 flex flex-col gap-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Final Temp (°C)
                                    </label>
                                    {/* name ajustado aqui: */}
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="coolingFinishTemp"
                                        required
                                        placeholder="Ex: 3.5"
                                        className="w-full p-2.5 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Finish Time
                                    </label>
                                    <input
                                        type="time"
                                        name="coolingFinishTime"
                                        required
                                        defaultValue={getCurrentTimeStr()}
                                        className="w-full p-2.5 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setCoolingTargetId(null)}
                                    className="flex-1 py-2.5 rounded-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md"
                                >
                                    {isLoading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
