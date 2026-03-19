/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function DeliveriesPage() {
    const { data: session } = useSession();

    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingLogs, setIsFetchingLogs] = useState(true);
    const [condition, setCondition] = useState<'ACCEPT' | 'REJECT'>('ACCEPT');

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

    // Fetch recent delivery logs
    const fetchLogs = useCallback(async (restaurantId: string) => {
        try {
            setIsFetchingLogs(true);
            const res = await fetch(
                `http://localhost:3001/api/logs/delivery/${restaurantId}`,
            );
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (err) {
            console.error('Error fetching delivery logs:', err);
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
    async function saveDeliveryLog(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const restaurantId = (session?.user as any)?.restaurantId;

        const tempValue = formData.get('temperature') as string;

        const payload = {
            restaurantId,
            supplier: formData.get('supplier'),
            invoiceNumber: formData.get('invoiceNumber') || 'N/A',
            temperature: tempValue ? parseFloat(tempValue) : null, // Temp is optional (e.g., dry goods)
            condition: condition,
            initials: formData.get('initials'),
        };

        try {
            const res = await fetch('http://localhost:3001/api/logs/delivery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                form.reset();
                setCondition('ACCEPT'); // Reset toggle
                toast.success('Delivery record saved!');
                if (restaurantId) await fetchLogs(restaurantId);
            } else {
                toast.error('Error recording delivery.');
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
                    Deliveries 📦
                </h2>
                <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
                    Record incoming goods and traceability.
                </p>
            </header>

            {/* ========================================= */}
            {/* INPUT FORM                                  */}
            {/* ========================================= */}
            <form
                onSubmit={saveDeliveryLog}
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-10"
            >
                {/* CONDITION SELECTOR (Accept / Reject) */}
                <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
                        Delivery Status
                    </label>
                    <div className="flex gap-3 sm:gap-4">
                        <label className="flex-1 cursor-pointer">
                            <input
                                type="radio"
                                name="conditionToggle"
                                value="ACCEPT"
                                checked={condition === 'ACCEPT'}
                                onChange={() => setCondition('ACCEPT')}
                                className="peer sr-only"
                            />
                            <div className="text-center p-2.5 sm:p-3 rounded-lg border-2 border-slate-100 bg-slate-50 text-sm sm:text-base font-bold text-slate-400 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 transition-all hover:bg-slate-100">
                                ✅ Accept
                            </div>
                        </label>
                        <label className="flex-1 cursor-pointer">
                            <input
                                type="radio"
                                name="conditionToggle"
                                value="REJECT"
                                checked={condition === 'REJECT'}
                                onChange={() => setCondition('REJECT')}
                                className="peer sr-only"
                            />
                            <div className="text-center p-2.5 sm:p-3 rounded-lg border-2 border-slate-100 bg-slate-50 text-sm sm:text-base font-bold text-slate-400 peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:text-red-700 transition-all hover:bg-slate-100">
                                ❌ Reject
                            </div>
                        </label>
                    </div>
                </div>

                {/* SUPPLIER & INVOICE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                            Supplier
                        </label>
                        <input
                            type="text"
                            name="supplier"
                            required
                            placeholder="Ex: Sysco, Musgrave..."
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                            Invoice / PO Number
                        </label>
                        <input
                            type="text"
                            name="invoiceNumber"
                            placeholder="Ex: INV-12345 (Optional)"
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium uppercase"
                        />
                    </div>
                </div>

                {/* TEMP & INITIALS */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                        <label className="block text-[11px] sm:text-sm font-bold text-slate-700 mb-1">
                            Goods Temp (°C)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            name="temperature"
                            placeholder="Optional"
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] sm:text-sm font-bold text-slate-700 mb-1">
                            Initials
                        </label>
                        <input
                            type="text"
                            name="initials"
                            required
                            defaultValue={defaultInitials}
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 uppercase font-bold"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 sm:py-3.5 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-lg shadow-md"
                >
                    {isLoading ? 'Saving...' : 'Save Delivery Record'}
                </button>
            </form>

            {/* ========================================= */}
            {/* RECENT RECORDS HISTORY                      */}
            {/* ========================================= */}
            <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">
                    Recent Deliveries
                </h3>

                {isFetchingLogs ? (
                    <p className="text-slate-400 text-xs sm:text-sm animate-pulse font-medium">
                        Loading history...
                    </p>
                ) : logs.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-6 sm:p-8 text-center">
                        <p className="text-slate-500 font-medium text-sm">
                            No delivery records found today.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {logs.slice(0, 10).map((log) => {
                            const isAccepted = log.condition === 'ACCEPT';

                            return (
                                <div
                                    key={log.id}
                                    className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition-all hover:shadow-md"
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-bold text-slate-800 text-base sm:text-lg leading-none">
                                                {log.supplier}
                                            </p>
                                            <span
                                                className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${isAccepted ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                                            >
                                                {isAccepted
                                                    ? 'Received'
                                                    : 'Rejected'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider">
                                            Inv:{' '}
                                            <span className="font-bold text-slate-500">
                                                {log.invoiceNumber || 'N/A'}
                                            </span>{' '}
                                            • By {log.initials} •{' '}
                                            {formatIsoTo12h(log.createdAt)}
                                        </p>
                                    </div>

                                    {log.temperature !== null && (
                                        <span className="self-start sm:self-auto px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-black shadow-sm border bg-slate-50 text-slate-700 border-slate-200">
                                            {log.temperature}°C
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
