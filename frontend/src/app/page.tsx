/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';
import { useSession } from 'next-auth/react';

export default function Home() {
    const { data: session, status } = useSession();
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [stats, setStats] = useState({
        tempsToday: 0,
        cookingToday: 0,
        deliveriesToday: 0,
        cleaningsToday: 0,
    });

    const [activity, setActivity] = useState({
        temps: {} as Record<string, any[]>,
        cooking: {} as Record<string, any[]>,
        deliveries: {} as Record<string, any[]>,
        cleanings: {} as Record<string, any[]>,
    });

    useEffect(() => {
        setIsMounted(true);

        const fetchDashboardData = async () => {
            // 🛡️ SAAS GUARD: Only fetch if authenticated and we have a Restaurant ID
            if (
                status !== 'authenticated' ||
                !(session?.user as any)?.restaurantId
            ) {
                return;
            }

            const restaurantId = (session.user as any).restaurantId;

            try {
                const safeFetch = async (endpoint: string) => {
                    try {
                        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                            cache: 'no-store',
                        });
                        if (!res.ok) return [];
                        const data = await res.json();
                        return Array.isArray(data) ? data : [];
                    } catch (e) {
                        console.error(`Failed fetching ${endpoint}:`, e);
                        return [];
                    }
                };

                // 🌐 MULTI-TENANT FETCH: Requesting data ONLY for this specific restaurant
                const [temps, cooking, deliveries, cleanings] =
                    await Promise.all([
                        safeFetch(`/logs/temperatures/${restaurantId}`),
                        safeFetch(`/logs/cooking/${restaurantId}`),
                        safeFetch(`/logs/delivery/${restaurantId}`),
                        safeFetch(`/logs/cleaning/${restaurantId}`),
                    ]);

                const todayStr = new Date().toLocaleDateString();

                setStats({
                    tempsToday: temps.filter(
                        (t: any) =>
                            new Date(t.createdAt).toLocaleDateString() ===
                            todayStr,
                    ).length,
                    cookingToday: cooking.filter(
                        (c: any) =>
                            new Date(c.createdAt).toLocaleDateString() ===
                            todayStr,
                    ).length,
                    deliveriesToday: deliveries.filter(
                        (d: any) =>
                            new Date(d.createdAt).toLocaleDateString() ===
                            todayStr,
                    ).length,
                    cleaningsToday: cleanings.filter(
                        (c: any) =>
                            new Date(c.createdAt).toLocaleDateString() ===
                            todayStr,
                    ).length,
                });

                const processAndGroup = (data: any[]) => {
                    if (!data || data.length === 0) return {};

                    const sorted = data.sort(
                        (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime(),
                    );
                    const limited = sorted.slice(0, 10);

                    return limited.reduce(
                        (acc: Record<string, any[]>, item: any) => {
                            const dateStr = new Date(
                                item.createdAt,
                            ).toLocaleDateString();
                            if (!acc[dateStr]) acc[dateStr] = [];
                            acc[dateStr].push(item);
                            return acc;
                        },
                        {},
                    );
                };

                setActivity({
                    temps: processAndGroup(temps),
                    cooking: processAndGroup(cooking),
                    deliveries: processAndGroup(deliveries),
                    cleanings: processAndGroup(cleanings),
                });
            } catch (error) {
                console.error('Failed to load dashboard data', error);
            } finally {
                setIsLoading(false);
            }
        };

        // Re-run fetch if session status changes
        fetchDashboardData();
    }, [session, status]);

    if (!isMounted || status === 'loading') {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-slate-400 font-bold animate-pulse">
                    Loading Kitchen Data...
                </p>
            </div>
        );
    }

    const renderDateHeader = (dateStr: string) => {
        const todayStr = new Date().toLocaleDateString();
        return (
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3 mt-4 first:mt-0">
                📅 {dateStr === todayStr ? 'Today' : dateStr}
            </h4>
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans">
            <header className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    Dashboard
                </h2>
                <p className="text-slate-500 font-medium mt-1">
                    Your kitchen overview and recent activities.
                </p>
            </header>

            {/* SUMMARY STATS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {/* TEMPS STAT */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-400 text-[10px] font-bold mb-1 uppercase tracking-widest">
                        Temps Today
                    </h3>
                    {isLoading ? (
                        <div className="h-8 w-12 bg-slate-100 animate-pulse rounded"></div>
                    ) : (
                        <div className="flex items-end gap-2">
                            <p className="text-3xl font-black text-slate-800 leading-none">
                                {stats.tempsToday}
                            </p>
                            <span className="text-blue-500 text-xs font-bold mb-1 block">
                                Logs
                            </span>
                        </div>
                    )}
                </div>

                {/* COOKING STAT */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-400 text-[10px] font-bold mb-1 uppercase tracking-widest">
                        Cooking Today
                    </h3>
                    {isLoading ? (
                        <div className="h-8 w-12 bg-slate-100 animate-pulse rounded"></div>
                    ) : (
                        <div className="flex items-end gap-2">
                            <p className="text-3xl font-black text-slate-800 leading-none">
                                {stats.cookingToday}
                            </p>
                            <span className="text-orange-500 text-xs font-bold mb-1 block">
                                Meals
                            </span>
                        </div>
                    )}
                </div>

                {/* DELIVERIES STAT */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-400 text-[10px] font-bold mb-1 uppercase tracking-widest">
                        Deliveries Today
                    </h3>
                    {isLoading ? (
                        <div className="h-8 w-12 bg-slate-100 animate-pulse rounded"></div>
                    ) : (
                        <div className="flex items-end gap-2">
                            <p className="text-3xl font-black text-slate-800 leading-none">
                                {stats.deliveriesToday}
                            </p>
                            <span className="text-indigo-500 text-xs font-bold mb-1 block">
                                Received
                            </span>
                        </div>
                    )}
                </div>

                {/* CLEANING STAT */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-400 text-[10px] font-bold mb-1 uppercase tracking-widest">
                        Cleaning Today
                    </h3>
                    {isLoading ? (
                        <div className="h-8 w-12 bg-slate-100 animate-pulse rounded"></div>
                    ) : (
                        <div className="flex items-end gap-2">
                            <p className="text-3xl font-black text-slate-800 leading-none">
                                {stats.cleaningsToday}
                            </p>
                            <span className="text-emerald-500 text-xs font-bold mb-1 block">
                                Tasks
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ACTIVITY CARDS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* --- TEMPERATURES CARD --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-96">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        🌡️ Recent Temperatures
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading ? (
                            <p className="text-slate-400 text-sm animate-pulse">
                                Loading...
                            </p>
                        ) : Object.keys(activity.temps).length === 0 ? (
                            <p className="text-slate-400 text-sm">
                                No records found.
                            </p>
                        ) : (
                            Object.entries(activity.temps).map(
                                ([date, items]) => (
                                    <div key={date}>
                                        {renderDateHeader(date)}
                                        <div className="space-y-3">
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100"
                                                >
                                                    <div>
                                                        <p className="font-bold text-slate-700 text-sm">
                                                            {item.equipment
                                                                ?.name ||
                                                                'Equipment'}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-medium">
                                                            By {item.initials} •{' '}
                                                            {new Date(
                                                                item.createdAt,
                                                            ).toLocaleTimeString(
                                                                [],
                                                                {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                },
                                                            )}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-sm ${item.temperature > 8 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                                                    >
                                                        {item.temperature}°C
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ),
                            )
                        )}
                    </div>
                </div>

                {/* --- COOKING CARD --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-96">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        👨‍🍳 Cooking & Cooling
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading ? (
                            <p className="text-slate-400 text-sm animate-pulse">
                                Loading...
                            </p>
                        ) : Object.keys(activity.cooking).length === 0 ? (
                            <p className="text-slate-400 text-sm">
                                No records found.
                            </p>
                        ) : (
                            Object.entries(activity.cooking).map(
                                ([date, items]) => (
                                    <div key={date}>
                                        {renderDateHeader(date)}
                                        <div className="space-y-3">
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100"
                                                >
                                                    <div>
                                                        <p className="font-bold text-slate-700 text-sm">
                                                            {item.foodItem}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-medium">
                                                            By {item.initials} •{' '}
                                                            {item.cookTime ||
                                                                item.reheatTime}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="px-2.5 py-1 rounded-md text-xs font-bold shadow-sm bg-orange-100 text-orange-700">
                                                            {item.cookTemp ||
                                                                item.reheatTemp}
                                                            °C
                                                        </span>
                                                        {item.coolingFinishTime && (
                                                            <span className="text-[9px] font-bold text-blue-500 uppercase">
                                                                Cooling Done ❄️
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ),
                            )
                        )}
                    </div>
                </div>

                {/* --- DELIVERIES CARD --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-96">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        📦 Recent Deliveries
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading ? (
                            <p className="text-slate-400 text-sm animate-pulse">
                                Loading...
                            </p>
                        ) : Object.keys(activity.deliveries).length === 0 ? (
                            <p className="text-slate-400 text-sm">
                                No records found.
                            </p>
                        ) : (
                            Object.entries(activity.deliveries).map(
                                ([date, items]) => (
                                    <div key={date}>
                                        {renderDateHeader(date)}
                                        <div className="space-y-3">
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100"
                                                >
                                                    <div>
                                                        <p className="font-bold text-slate-700 text-sm">
                                                            {item.supplier}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-medium">
                                                            Inv:{' '}
                                                            {item.invoiceNumber ||
                                                                'N/A'}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-sm ${item.condition === 'ACCEPT' ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'}`}
                                                    >
                                                        {item.condition ===
                                                        'ACCEPT'
                                                            ? 'Received'
                                                            : 'Rejected'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ),
                            )
                        )}
                    </div>
                </div>

                {/* --- CLEANING CARD --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-96">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        ✨ Cleaning Tasks
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading ? (
                            <p className="text-slate-400 text-sm animate-pulse">
                                Loading...
                            </p>
                        ) : Object.keys(activity.cleanings).length === 0 ? (
                            <p className="text-slate-400 text-sm">
                                No records found.
                            </p>
                        ) : (
                            Object.entries(activity.cleanings).map(
                                ([date, items]) => (
                                    <div key={date}>
                                        {renderDateHeader(date)}
                                        <div className="space-y-3">
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100"
                                                >
                                                    <div>
                                                        <p className="font-bold text-slate-700 text-sm">
                                                            {item.area}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-medium">
                                                            By {item.initials}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-sm ${item.status === 'CLEAN' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ),
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
