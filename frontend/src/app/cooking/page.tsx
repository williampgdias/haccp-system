'use client';

import { useState, useEffect } from 'react';

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

    const API_URL = 'http://localhost:3001/cooking-logs';

    const fetchLogs = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setLogs(data);
        } catch (error) {
            console.error('Error to upload logs', error);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

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

    const startCooling = async (id: string) => {
        const now = new Date().toLocaleDateString([], {
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

    const finishCooling = async (id: string) => {
        const finalTemp = parseFloat(coolingTemps[id]);
        if (isNaN(finalTemp)) {
            alert('Please enter a valid final temperature.');
            return;
        }

        const now = new Date().toLocaleDateString([], {
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
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* HEADER */}
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        👨‍🍳 Cooking & Cooling Control
                    </h1>
                </header>

                {/* FORM */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                    <div className="flex items-center gap-2 mb-6 text-slate-800 font-semibold">
                        <span className="text-lg">🍗</span> New Cooking Entry
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-center"
                    >
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Food Item
                            </label>
                            <input
                                className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Initials
                            </label>
                            <input
                                className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none uppercase"
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

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Process
                            </label>
                            <select
                                className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none"
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
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Core Temp (°C)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="75.0"
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

                        <div className="lg:col-span-5 flex justify-end mt-2">
                            <button className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95">
                                Save Record
                            </button>
                        </div>
                    </form>
                </section>

                {/* CARDS LIST */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        📋 Today's Activity
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                            >
                                {/* CARD HEADER */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">
                                            {log.foodItem}
                                        </h3>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">
                                                By {log.initials}
                                            </span>
                                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">
                                                {log.cookTemp
                                                    ? 'Cooked'
                                                    : 'Reheated'}
                                                :
                                                {log.cookTime || log.reheatTime}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-green-50 px-3 py-1 rounded-lg border border-green-100 text-right">
                                        <span className="text-green-700 font-black text-xl">
                                            {log.cookTemp || log.reheatTemp}°C
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    {!log.coolingStartTime && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                                                Status: Hot 🔥
                                            </span>
                                            <button
                                                onClick={() =>
                                                    startCooling(log.id)
                                                }
                                                className="bg-blue-50 text-blue-600 px-4 py-2 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                Start Cooling ❄️
                                            </button>
                                        </div>
                                    )}

                                    {log.coolingStartTime &&
                                        !log.coolingFinishTime && (
                                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-xs font-bold text-blue-700 uppercase tracking-tight flex items-center gap-1">
                                                        ⏳ Cooling Started at{' '}
                                                        {log.coolingStartTime}
                                                    </span>
                                                    <span className="text-[10px] text-blue-500 font-medium">
                                                        Max 120 mins
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        placeholder="Final Temp (≤ 5°C)"
                                                        className="flex-1 p-2 text-sm border border-blue-200 rounded-md outline-none focus:ring-2 focus:ring-blue-400"
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
                                                        className="bg-blue-600 text-white px-4 py-2 text-xs font-bold rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                                                    >
                                                        Finish
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                    {/* COOLING DONE */}
                                    {log.coolingFinishTime && (
                                        <div className="bg-green-50 rounded-lg p-3 border border-green-100 flex justify-between items-center">
                                            <div>
                                                <span className="text-xs font-bold text-green-700 uppercase tracking-tight block">
                                                    ✅ Cooling Complete
                                                </span>
                                                <span className="text-[10px] text-green-600 font-medium">
                                                    {log.coolingStartTime} ➔{' '}
                                                    {log.coolingFinishTime}
                                                </span>
                                            </div>
                                            <div className="bg-white px-3 py-1 rounded border border-green-200 shadow-sm">
                                                <span className="text-green-700 font-black text-lg">
                                                    {log.coolingFinalTemp}ºC
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
