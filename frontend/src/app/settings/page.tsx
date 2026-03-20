/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { data: session } = useSession();
    const [fridges, setFridges] = useState<any[]>([]);
    const [areas, setAreas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const restaurantId = (session?.user as any)?.restaurantId;

    const fetchData = async () => {
        if (!restaurantId) return;
        try {
            const [resFridges, resAreas] = await Promise.all([
                fetch(
                    `http://localhost:3001/api/logs/equipment/${restaurantId}`,
                ),
                fetch(
                    `http://localhost:3001/api/logs/cleaning-areas/${restaurantId}`,
                ),
            ]);
            if (resFridges.ok) setFridges(await resFridges.json());
            if (resAreas.ok) setAreas(await resAreas.json());
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [restaurantId]);

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
            const res = await fetch(`http://localhost:3001/api/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                toast.success(
                    `${type === 'fridge' ? 'Equipment' : 'Area'} added!`,
                );
                form.reset();
                await fetchData();
            } else {
                toast.error('Failed to save. Check backend console.');
            }
        } catch (err) {
            toast.error('Connection error. Is backend running?');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete(id: string, type: 'fridge' | 'area') {
        // AJUSTE AQUI: Adicionamos o "logs" no caminho
        const endpoint =
            type === 'fridge' ? 'logs/equipment' : 'logs/cleaning-areas';
        try {
            const res = await fetch(
                `http://localhost:3001/api/${endpoint}/${id}`,
                {
                    method: 'DELETE',
                },
            );
            if (res.ok) {
                toast.success('Removed');
                await fetchData();
            }
        } catch (err) {
            toast.error('Delete failed');
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 font-sans">
            <header className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Kitchen Setup ⚙️
                </h2>
                <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
                    Manage your infrastructure and safety zones.
                </p>
            </header>

            <div className="space-y-8">
                {/* FRIDGES SECTION */}
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

                {/* CLEANING AREAS SECTION */}
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
                        <div className="divide-y divide-slate-100 py-2">
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
            </div>
        </div>
    );
}
