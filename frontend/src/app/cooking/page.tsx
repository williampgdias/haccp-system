/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function CookingPage() {
    const { data: session } = useSession();
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [processType, setProcessType] = useState<'Cooking' | 'Reheating'>(
        'Cooking',
    );
    const [coolingTargetId, setCoolingTargetId] = useState<string | null>(null);

    const restaurantId = (session?.user as any)?.restaurantId;

    const getInitials = (name: string | null | undefined) => {
        if (!name) return '';
        const names = name.trim().split(' ');
        return (
            names[0][0] +
            (names.length > 1 ? names[names.length - 1][0] : names[0][1])
        ).toUpperCase();
    };

    const format12h = (time24: string) => {
        if (!time24) return '';
        const [h, m] = time24.split(':');
        const hours = parseInt(h, 10);
        const suffix = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        return `${hours12}:${m} ${suffix}`;
    };

    const fetchLogs = useCallback(async () => {
        if (!restaurantId) return;
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/logs/cooking/${restaurantId}`,
            );
            if (res.ok) setLogs(await res.json());
        } catch (err) {
            console.error(err);
        }
    }, [restaurantId]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    async function saveCookingLog(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
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
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/logs/cooking`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                },
            );
            if (res.ok) {
                toast.success('Cooking record saved!');
                (e.target as HTMLFormElement).reset();
                fetchLogs();
            }
        } catch (error) {
            toast.error('Error saving.');
        } finally {
            setIsLoading(false);
        }
    }

    async function saveCoolingUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!coolingTargetId) return;
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/logs/cooking/${coolingTargetId}/cooling`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        coolingFinishTime: formData.get('coolingFinishTime'),
                        coolingFinishTemp: formData.get('coolingFinishTemp'),
                    }),
                },
            );
            if (res.ok) {
                setCoolingTargetId(null);
                toast.success('Cooling logged!');
                fetchLogs();
            }
        } catch (error) {
            toast.error('Error.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 font-sans">
            <header className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Cooking & Cooling 👨‍🍳
                </h2>
                <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
                    Critical temperature control.
                </p>
            </header>

            {coolingTargetId ? (
                <form
                    onSubmit={saveCoolingUpdate}
                    className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-10"
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                                Cooling Finish Time
                            </label>
                            <input
                                name="coolingFinishTime"
                                type="time"
                                required
                                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                                Cooling Finish Temp
                            </label>
                            <input
                                name="coolingFinishTemp"
                                type="number"
                                step="0.1"
                                required
                                placeholder="5"
                                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="submit"
                            className="w-full bg-slate-950 text-white font-semi-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
                        >
                            Save Cooling Log
                        </button>

                        <button
                            type="button"
                            onClick={() => setCoolingTargetId(null)}
                            className="w-full bg-slate-100 font-semi-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <form
                    onSubmit={saveCookingLog}
                    className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-10"
                >
                    <div>
                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                            Process
                        </label>
                        <div className="flex gap-3 sm:gap-4">
                            <button
                                type="button"
                                onClick={() => setProcessType('Cooking')}
                                className={`flex-1 p-2.5 sm:p-3 rounded-lg text-xs font-black transition-all border-2 
                                ${processType === 'Cooking' ? 'border-slate-900 bg-slate-100 text-slate-900' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                            >
                                🔥 COOKING
                            </button>
                            <button
                                type="button"
                                onClick={() => setProcessType('Reheating')}
                                className={`flex-1 p-2.5 sm:p-3 rounded-lg text-xs font-black transition-all border-2 
                                ${processType === 'Reheating' ? 'border-slate-900 bg-slate-100 text-slate-900' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                            >
                                ♨️ REHEATING
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                            Food Item
                        </label>
                        <input
                            name="foodItem"
                            required
                            placeholder="Ex: Roast Chicken"
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                                Core Temp
                            </label>
                            <input
                                name="coreTemp"
                                type="number"
                                step="0.1"
                                required
                                placeholder="75.0"
                                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                                Time
                            </label>
                            <input
                                name="timeChecked"
                                type="time"
                                required
                                defaultValue={new Date()
                                    .toTimeString()
                                    .substring(0, 5)}
                                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                                Initials
                            </label>
                            <input
                                name="initials"
                                required
                                defaultValue={getInitials(session?.user?.name)}
                                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-slate-950 text-white font-semi-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
                    >
                        Save Cooking Log
                    </button>
                </form>
            )}

            <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                    Active Flow
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {logs.slice(0, 10).map((log) => {
                    const isCooking = !!log.cookTemp;
                    const temp = isCooking ? log.cookTemp : log.reheatTemp;
                    const isSafe = temp >= 75;
                    const isCoolingPending = !log.coolingFinishTime;

                    return (
                        <div
                            key={log.id}
                            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-orange-200"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black text-slate-800">
                                            {log.foodItem}
                                        </span>
                                        <span
                                            className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${isCooking ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-red-50 text-red-600 border-red-100'}`}
                                        >
                                            {isCooking
                                                ? 'COOKING'
                                                : 'REHEATING'}
                                        </span>
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">
                                        By {log.initials} •{' '}
                                        {format12h(
                                            isCooking
                                                ? log.cookTime
                                                : log.reheatTime,
                                        )}
                                    </p>
                                </div>
                                <div
                                    className={`px-4 py-2 rounded-xl border font-black text-xl shadow-inner ${isSafe ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}
                                >
                                    {temp}°C
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50">
                                {isCoolingPending ? (
                                    <div className="flex justify-between items-center bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                        <p className="text-[10px] font-black text-blue-700 uppercase tracking-tight">
                                            Cooling Process Required
                                        </p>
                                        <button
                                            onClick={() =>
                                                setCoolingTargetId(log.id)
                                            }
                                            className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-lg shadow-md"
                                        >
                                            RECORD COOLING
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-700 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                                        ❄️ COOLED TO {log.coolingFinishTemp}°C
                                        AT {format12h(log.coolingFinishTime)}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                </div>
            </div>
        </div>
    );
}
