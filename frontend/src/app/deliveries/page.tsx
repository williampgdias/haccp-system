/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function DeliveriesPage() {
    const { data: session } = useSession();
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [category, setCategory] = useState<'Meat' | 'Dairy'>('Meat');

    const restaurantId = (session?.user as any)?.restaurantId;

    const getInitials = (name: string | null | undefined) => {
        if (!name) return '';
        const names = name.trim().split(' ');
        return (
            names[0][0] +
            (names.length > 1 ? names[names.length - 1][0] : names[0][1])
        ).toUpperCase();
    };

    const formatIsoTo12h = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const fetchData = useCallback(async () => {
        if (!restaurantId) return;
        try {
            setIsFetching(true);
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/logs/delivery/${restaurantId}`,
            );
            if (res.ok) setLogs(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setIsFetching(false);
        }
    }, [restaurantId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/logs/delivery`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        restaurantId,
                        category,
                        productName: formData.get('productName'),
                        supplier: formData.get('supplier'),
                        invoiceNumber: formData.get('invoiceNumber'),
                        temperature: parseFloat(
                            formData.get('temperature') as string,
                        ),
                        initials: (
                            formData.get('initials') as string
                        ).toUpperCase(),
                        comments: formData.get('comments') || '',
                    }),
                },
            );

            if (res.ok) {
                toast.success('Delivery recorded!');
                (e.target as HTMLFormElement).reset();
                fetchData();
            }
        } catch (err) {
            toast.error('Connection error.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 font-sans">
            <header className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Deliveries 📦
                </h2>
                <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
                    High-risk goods traceability.
                </p>
            </header>

            <form
                onSubmit={handleSubmit}
                className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-10"
            >
                <div>
                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                        Category
                    </label>
                    <div className="flex gap-3 sm:gap-4">
                        {['Meat', 'Dairy'].map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat as any)}
                                className={`flex-1 p-2.5 sm:p-3 rounded-lg text-xs font-black transition-all border-2 
                                ${category === cat ? 'border-slate-900 bg-slate-100 text-slate-900' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                            >
                                {cat === 'Meat' ? '🥩 MEAT' : '🥛 DAIRY'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                            Product
                        </label>
                        <input
                            name="productName"
                            required
                            placeholder="Ex: Chicken"
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                            Supplier
                        </label>
                        <input
                            name="supplier"
                            required
                            placeholder="Ex: Sysco"
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                            Invoice #
                        </label>
                        <input
                            name="invoiceNumber"
                            required
                            placeholder="INV-001"
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                            Temp (°C)
                        </label>
                        <input
                            name="temperature"
                            type="number"
                            step="0.1"
                            required
                            placeholder="3.5"
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                            Initials
                        </label>
                        <input
                            name="initials"
                            required
                            defaultValue={getInitials(session?.user?.name)}
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold uppercase"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                            Comments
                        </label>
                        <input
                            name="comments"
                            placeholder="Optional..."
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-slate-950 text-white font-semi-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
                >
                    {isLoading ? 'SAVING...' : 'Save Delivery Record'}
                </button>
            </form>

            <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                    Recent History
                </h3>
                {logs.map((log) => {
                    const isSafe = log.temperature <= 5;
                    return (
                        <div
                            key={log.id}
                            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-blue-200 transition-all"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-slate-800">
                                        {log.productName}
                                    </span>
                                    <span
                                        className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${log.category === 'Meat' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}
                                    >
                                        {log.category.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                    {log.supplier} • {log.invoiceNumber}
                                </p>
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest pt-1">
                                    BY {log.initials} •{' '}
                                    {formatIsoTo12h(log.createdAt)}
                                </p>
                            </div>
                            <div
                                className={`px-4 py-2 rounded-xl border font-black text-xl shadow-inner ${isSafe ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}
                            >
                                {log.temperature.toFixed(1)}°C
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
