/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/services/api';
import ExportPDF from '@/components/ui/ExportPDF';

export default function CookingPage() {
    const { data: session } = useSession();
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [processType, setProcessType] = useState<'Cooking' | 'Reheating'>('Cooking');
    const [coolingTargetId, setCoolingTargetId] = useState<string | null>(null);
    const [editingLog, setEditingLog] = useState<any | null>(null);

    const [foodItem, setFoodItem] = useState('');
    const [coreTemp, setCoreTemp] = useState('');
    const [timeChecked, setTimeChecked] = useState('');
    const [initialsInput, setInitialsInput] = useState('');

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

    const defaultTime = new Date().toTimeString().substring(0, 5);

    useEffect(() => {
        if (session?.user?.name) {
            setInitialsInput(getInitials(session.user.name));
            setTimeChecked(defaultTime);
        }
    }, [session]);

    const fetchLogs = useCallback(async () => {
        if (!restaurantId) return;
        try {
            const res = await apiFetch(`/logs/cooking/${restaurantId}`);
            if (res.ok) setLogs(await res.json());
        } catch (err) {
            console.error(err);
        }
    }, [restaurantId]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const startEdit = (log: any) => {
        const isCooking = !!log.cookTemp;
        setEditingLog(log);
        setProcessType(isCooking ? 'Cooking' : 'Reheating');
        setFoodItem(log.foodItem);
        setCoreTemp(String(isCooking ? log.cookTemp : log.reheatTemp));
        setTimeChecked(isCooking ? log.cookTime : log.reheatTime);
        setInitialsInput(log.initials);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingLog(null);
        setFoodItem('');
        setCoreTemp('');
        setTimeChecked(defaultTime);
        setInitialsInput(getInitials(session?.user?.name));
        setProcessType('Cooking');
    };

    async function saveCookingLog(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const payload: any = {
            restaurantId,
            foodItem,
            initials: initialsInput,
        };

        if (editingLog) {
            const isCooking = processType === 'Cooking';
            payload.cookTemp = isCooking ? parseFloat(coreTemp) : null;
            payload.cookTime = isCooking ? timeChecked : null;
            payload.reheatTemp = !isCooking ? parseFloat(coreTemp) : null;
            payload.reheatTime = !isCooking ? timeChecked : null;
        } else {
            if (processType === 'Cooking') {
                payload.cookTemp = parseFloat(coreTemp);
                payload.cookTime = timeChecked;
            } else {
                payload.reheatTemp = parseFloat(coreTemp);
                payload.reheatTime = timeChecked;
            }
        }

        try {
            const res = editingLog
                ? await apiFetch(`/logs/cooking/${editingLog.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                  })
                : await apiFetch(`/logs/cooking`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                  });

            if (res.ok) {
                toast.success(editingLog ? 'Cooking record updated!' : 'Cooking record saved!');
                cancelEdit();
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
            const res = await apiFetch(
                `/logs/cooking/${coolingTargetId}/cooling`,
                {
                    method: 'PUT',
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
                    Cooking & Cooling
                </h2>
                <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
                    Critical temperature control.
                </p>
            </header>

            <ExportPDF reportType="cooking" />

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
                    {editingLog && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 flex justify-between items-center">
                            <p className="text-xs font-black text-blue-700 uppercase tracking-wide">
                                Editing: {editingLog.foodItem}
                            </p>
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="text-xs font-bold text-blue-500 hover:text-blue-700"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

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
                                COOKING
                            </button>
                            <button
                                type="button"
                                onClick={() => setProcessType('Reheating')}
                                className={`flex-1 p-2.5 sm:p-3 rounded-lg text-xs font-black transition-all border-2
                                ${processType === 'Reheating' ? 'border-slate-900 bg-slate-100 text-slate-900' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                            >
                                REHEATING
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                            Food Item
                        </label>
                        <input
                            required
                            placeholder="Ex: Roast Chicken"
                            value={foodItem}
                            onChange={(e) => setFoodItem(e.target.value)}
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                                Core Temp
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                placeholder="75.0"
                                value={coreTemp}
                                onChange={(e) => setCoreTemp(e.target.value)}
                                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                                Time
                            </label>
                            <input
                                type="time"
                                required
                                value={timeChecked}
                                onChange={(e) => setTimeChecked(e.target.value)}
                                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                                Initials
                            </label>
                            <input
                                required
                                value={initialsInput}
                                onChange={(e) => setInitialsInput(e.target.value.toUpperCase())}
                                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-slate-950 text-white font-semi-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
                    >
                        {isLoading
                            ? 'Saving...'
                            : editingLog
                              ? 'Update Cooking Record'
                              : 'Save Cooking Log'}
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
                        const isBeingEdited = editingLog?.id === log.id;

                        return (
                            <div
                                key={log.id}
                                className={`bg-white p-5 rounded-2xl border shadow-sm transition-all ${isBeingEdited ? 'border-blue-400 ring-2 ring-blue-100' : 'hover:border-orange-200 border-slate-200'}`}
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
                                                {isCooking ? 'COOKING' : 'REHEATING'}
                                            </span>
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">
                                            By {log.initials} •{' '}
                                            {format12h(isCooking ? log.cookTime : log.reheatTime)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div
                                            className={`px-4 py-2 rounded-xl border font-black text-xl shadow-inner ${isSafe ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}
                                        >
                                            {temp}°C
                                        </div>
                                        <button
                                            onClick={() => startEdit(log)}
                                            className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-tighter transition-colors"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50">
                                    {isCoolingPending ? (
                                        <div className="flex justify-between items-center bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                            <p className="text-[10px] font-black text-blue-700 uppercase tracking-tight">
                                                Cooling Process Required
                                            </p>
                                            <button
                                                onClick={() => setCoolingTargetId(log.id)}
                                                className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-lg shadow-md"
                                            >
                                                RECORD COOLING
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-700 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                                            COOLED TO {log.coolingFinishTemp}
                                            °C AT{' '}
                                            {format12h(log.coolingFinishTime)}
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
