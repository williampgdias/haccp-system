/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/services/api';
import ExportPDF from '@/components/ui/ExportPDF';

export default function DeliveriesPage() {
    const { data: session } = useSession();
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [category, setCategory] = useState<'Meat' | 'Dairy'>('Meat');
    const [editingLog, setEditingLog] = useState<any | null>(null);

    const [productName, setProductName] = useState('');
    const [supplier, setSupplier] = useState('');
    const [batchCode, setBatchCode] = useState('');
    const [useByDate, setUseByDate] = useState('');
    const [temperature, setTemperature] = useState('');
    const [initialsOverride, setInitialsOverride] = useState('');
    const [commentsInput, setCommentsInput] = useState('');

    const restaurantId = (session?.user as any)?.restaurantId;

    const getInitials = (name: string | null | undefined) => {
        if (!name) return '';
        const names = name.trim().split(' ');
        return (
            names[0][0] +
            (names.length > 1 ? names[names.length - 1][0] : names[0][1])
        ).toUpperCase();
    };

    // Derived at render time — no useEffect needed
    const sessionInitials = session?.user?.name ? getInitials(session.user.name) : '';
    const initialsInput = initialsOverride || sessionInitials;
    const setInitialsInput = setInitialsOverride;

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
            const res = await apiFetch(`/logs/delivery/${restaurantId}`);
            if (res.ok) setLogs(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setIsFetching(false);
        }
    }, [restaurantId]);

    useEffect(() => {
        void fetchData();
    }, [restaurantId]);

    const startEdit = (log: any) => {
        setEditingLog(log);
        setCategory(log.category);
        setProductName(log.productName);
        setSupplier(log.supplier);
        setBatchCode(log.batchCode || '');
        setUseByDate(log.useByDate || '');
        setTemperature(String(log.temperature));
        setInitialsInput(log.initials);
        setCommentsInput(log.comments || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingLog(null);
        setProductName('');
        setSupplier('');
        setBatchCode('');
        setUseByDate('');
        setTemperature('');
        setInitialsInput(getInitials(session?.user?.name));
        setCommentsInput('');
        setCategory('Meat');
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            restaurantId,
            category,
            productName,
            supplier,
            batchCode,
            useByDate: useByDate || null,
            temperature: parseFloat(temperature),
            initials: initialsInput.toUpperCase(),
            comments: commentsInput,
        };

        try {
            const res = editingLog
                ? await apiFetch(`/logs/delivery/${editingLog.id}`, {
                      method: 'PATCH',
                      body: JSON.stringify(payload),
                  })
                : await apiFetch(`/logs/delivery`, {
                      method: 'POST',
                      body: JSON.stringify(payload),
                  });

            if (res.ok) {
                toast.success(
                    editingLog ? 'Delivery updated!' : 'Delivery recorded!',
                );
                cancelEdit();
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
                    Deliveries
                </h2>
                <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
                    High-risk goods traceability.
                </p>
            </header>

            <ExportPDF reportType="deliveries" />

            <form
                onSubmit={handleSubmit}
                className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-10"
            >
                {editingLog && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 flex justify-between items-center">
                        <p className="text-xs font-black text-blue-700 uppercase tracking-wide">
                            Editing: {editingLog.productName}
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
                        Category
                    </label>
                    <div className="flex gap-3 sm:gap-4">
                        {(['Meat', 'Dairy'] as const).map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className={`flex-1 p-2.5 sm:p-3 rounded-lg text-xs font-black transition-all border-2
                                ${category === cat ? 'border-slate-900 bg-slate-100 text-slate-900' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                            >
                                {cat.toUpperCase()}
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
                            required
                            placeholder="Ex: Chicken"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                            Supplier
                        </label>
                        <input
                            required
                            placeholder="Ex: Sysco"
                            value={supplier}
                            onChange={(e) => setSupplier(e.target.value)}
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                            Batch Code
                        </label>
                        <input
                            required
                            placeholder="BC-001"
                            value={batchCode}
                            onChange={(e) => setBatchCode(e.target.value)}
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                            Use By Date
                        </label>
                        <input
                            type="date"
                            value={useByDate}
                            onChange={(e) => setUseByDate(e.target.value)}
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                            Temp (°C)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            required
                            placeholder="3.5"
                            value={temperature}
                            onChange={(e) => setTemperature(e.target.value)}
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
                            onChange={(e) =>
                                setInitialsInput(e.target.value.toUpperCase())
                            }
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-semi-bold uppercase"
                        />
                    </div>
                </div>

                <div className="w-full">
                    <div className="space-y-1 w-full">
                        <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1">
                            Comments
                        </label>
                        <textarea
                            placeholder="Optional..."
                            value={commentsInput}
                            onChange={(e) => setCommentsInput(e.target.value)}
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
                        ? 'SAVING...'
                        : editingLog
                          ? 'Update Delivery Record'
                          : 'Save Delivery Record'}
                </button>
            </form>

            <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 mb-4">
                    Recent History
                </h3>
                {isFetching ? (
                    <p className="text-slate-400 text-xs animate-pulse font-medium">
                        Loading history...
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {logs.map((log) => {
                            const isSafe = log.temperature <= 5;
                            const isBeingEdited = editingLog?.id === log.id;
                            return (
                                <div
                                    key={log.id}
                                    className={`bg-white p-5 rounded-2xl border shadow-sm flex justify-between items-center group transition-all ${isBeingEdited ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-200'}`}
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
                                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                                            {log.supplier} • {log.batchCode}
                                        </p>
                                        {log.useByDate && (
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                                Use by: {log.useByDate}
                                            </p>
                                        )}
                                        <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">
                                            By {log.initials} •{' '}
                                            {formatIsoTo12h(log.createdAt)}
                                        </p>
                                        {log.comments && (
                                            <div className="text-[10px] border-l-2 border-slate-300 pl-2 text-slate-500 italic font-medium tracking-wider">
                                                {log.comments}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div
                                            className={`px-4 py-2 rounded-xl border font-black text-xl shadow-inner ${isSafe ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}
                                        >
                                            {log.temperature.toFixed(1)}°C
                                        </div>
                                        <button
                                            onClick={() => startEdit(log)}
                                            className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-tighter transition-colors"
                                        >
                                            Edit
                                        </button>
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
