'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../services/api';

// Interface matches the Prisma Schema
interface CookingLog {
    id: string;
    foodItem: string;
    initials: string;
    cookTemp?: number;
    cookTime?: string;
    reheatTemp?: number;
    reheatTime?: string;
    coolingStartTime?: string;
    coolingFinishTime?: string;
    coolingFinalTemp?: number;
}

export default function CookingPage() {
    const [logs, setLogs] = useState<CookingLog[]>([]);
    const [formData, setFormData] = useState({
        foodItem: '',
        initials: '',
        temp: '',
        type: 'cook',
    });

    const [coolingTemps, setCoolingTemps] = useState<Record<string, string>>(
        {},
    );

    const API_URL = `${API_BASE_URL}/cooking-logs`;

    // Fetch logs from the backend
    const fetchLogs = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setLogs(data);
        } catch (err) {
            console.error('Failed to load logs', err);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // Handle new cooking or reheating entry
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const now = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
        const payload = {
            foodItem: formData.foodItem,
            initials: formData.initials,
            [formData.type === 'cook' ? 'cookTemp' : 'reheatTemp']: parseFloat(
                formData.temp,
            ),
            [formData.type === 'cook' ? 'cookTime' : 'reheatTime']: now,
        };

        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            setFormData({ ...formData, foodItem: '', temp: '' });
            fetchLogs();
        }
    };

    // Start the cooling process
    const startCooling = async (id: string) => {
        const now = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coolingStartTime: now }),
        });

        if (res.ok) fetchLogs();
    };

    // Finish the cooling process and save final temperature
    const finishCooling = async (id: string) => {
        const finalTemp = parseFloat(coolingTemps[id]);
        if (isNaN(finalTemp)) {
            alert('Please enter a valid final temperature.');
            return;
        }

        const now = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                coolingFinishTime: now,
                coolingFinalTemp: finalTemp,
            }),
        });

        if (res.ok) fetchLogs();
    };

    return (
        <div className="max-w-4xl mx-auto mt-4 space-y-8">
            {/* ========================================= */}
            {/* MAIN FORM */}
            {/* ========================================= */}
            <div className="p-6 md:p-8 rounded-xl shadow-sm border bg-white border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    👨‍🍳 Cooking & Cooling Control
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Food Item
                            </label>
                            <input
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                placeholder="Ex: Roast Beef"
                                value={formData.foodItem}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        foodItem: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Initials
                            </label>
                            <input
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase bg-white"
                                placeholder="WD"
                                maxLength={3}
                                value={formData.initials}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        initials: e.target.value.toUpperCase(),
                                    })
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Process
                            </label>
                            <select
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={formData.type}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        type: e.target.value,
                                    })
                                }
                            >
                                <option value="cook">Cook (≥75°C)</option>
                                <option value="reheat">Reheat (≥70°C)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Core Temp (°C)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                placeholder="e.g. 75.0"
                                value={formData.temp}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        temp: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 mt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors active:scale-95"
                        >
                            Save Record
                        </button>
                    </div>
                </form>
            </div>

            {/* ========================================= */}
            {/* ACTIVITY LIST  */}
            {/* ========================================= */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-6">
                    📋 Today's Activity
                </h3>

                {logs.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">
                        No cooking activity logged yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className="border border-slate-200 rounded-xl p-5 bg-slate-50 hover:shadow-sm transition-shadow flex flex-col justify-between"
                            >
                                {/* CARD HEADER */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        {/* EXACT FONT SIZE MATCH: Removed text-lg, added mb-1 for spacing parity */}
                                        <h5 className="font-bold text-slate-700 mb-1">
                                            {log.foodItem}
                                        </h5>
                                        <div className="flex gap-2">
                                            <span className="text-[10px] bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">
                                                By {log.initials}
                                            </span>
                                            <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded font-bold uppercase">
                                                {log.cookTemp
                                                    ? 'Cooked'
                                                    : 'Reheated'}
                                                :{' '}
                                                {log.cookTime || log.reheatTime}
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-2.5 py-1 rounded-md text-sm font-bold shadow-sm whitespace-nowrap ${(log.cookTemp && log.cookTemp >= 75) || (log.reheatTemp && log.reheatTemp >= 70) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                    >
                                        {log.cookTemp || log.reheatTemp}ºC
                                    </span>
                                </div>

                                {/* COOLING LOGIC */}
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    {/* STATE 1: NOT STARTED */}
                                    {!log.coolingStartTime && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                                                Status: Hot 🔥
                                            </span>
                                            <button
                                                onClick={() =>
                                                    startCooling(log.id)
                                                }
                                                className="bg-blue-100 text-blue-700 px-3 py-1.5 text-xs font-bold rounded hover:bg-blue-200 transition-colors"
                                            >
                                                Start Cooling ❄️
                                            </button>
                                        </div>
                                    )}

                                    {/* STATE 2: IN PROGRESS */}
                                    {log.coolingStartTime &&
                                        !log.coolingFinishTime && (
                                            <div className="bg-blue-50/50 rounded p-3 border border-blue-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-bold text-blue-700 uppercase tracking-tight flex items-center gap-1">
                                                        ⏳ Cooling Started at{' '}
                                                        {log.coolingStartTime}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        placeholder="Final Temp (≤ 5°C)"
                                                        className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                                        value={
                                                            coolingTemps[
                                                                log.id
                                                            ] || ''
                                                        }
                                                        onChange={(e) =>
                                                            setCoolingTemps({
                                                                ...coolingTemps,
                                                                [log.id]:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            finishCooling(
                                                                log.id,
                                                            )
                                                        }
                                                        className="bg-blue-600 text-white px-4 py-2 text-sm font-bold rounded hover:bg-blue-700 transition-colors"
                                                    >
                                                        Finish
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                    {/* STATE 3: COMPLETED */}
                                    {log.coolingFinishTime && (
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-xs font-bold text-green-600 uppercase tracking-tight block">
                                                    ✅ Cooling Complete
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-medium mt-1">
                                                    {log.coolingStartTime} ➔{' '}
                                                    {log.coolingFinishTime}
                                                </span>
                                            </div>
                                            <span
                                                className={`px-2.5 py-1 rounded-md text-sm font-bold shadow-sm whitespace-nowrap ${(log.coolingFinalTemp ?? 10) <= 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                            >
                                                {log.coolingFinalTemp}ºC
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
