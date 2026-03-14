/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { API_BASE_URL } from '../services/api';
import { useState, useEffect } from 'react';

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);

    const [stats, setStats] = useState({
        tempsToday: 0,
        totalDeliveries: 0,
        totalCleanings: 0,
    });

    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [tempsRes, deliveriesRes, cleaningsRes] =
                    await Promise.all([
                        fetch(`${API_BASE_URL}/daily-temperatures`, {
                            cache: 'no-store',
                        }),
                        fetch(`${API_BASE_URL}/deliveries`, {
                            cache: 'no-store',
                        }),
                        fetch(`${API_BASE_URL}/cleaning`, {
                            cache: 'no-store',
                        }),
                    ]);

                const temps = await tempsRes.json();
                const deliveries = await deliveriesRes.json();
                const cleanings = await cleaningsRes.json();

                const todayStr = new Date().toLocaleDateString();

                const tempsToday = temps.filter(
                    (t: any) =>
                        new Date(t.createdAt).toLocaleDateString() === todayStr,
                ).length;

                setStats({
                    tempsToday,
                    totalDeliveries: deliveries.length,
                    totalCleanings: cleanings.length,
                });

                const combined = [
                    ...temps.map((t: any) => ({
                        id: `temp-${t.id}`,
                        type: 'Temperature',
                        title: t.unitName,
                        subtitle: `Logged at ${t.timeChecked}`,
                        badge: `${t.temperature}°C`,
                        isWarning: t.temperature > 8,
                        date: t.createdAt,
                    })),
                    ...deliveries.map((d: any) => ({
                        id: `deliv-${d.id}`,
                        type: 'Delivery',
                        title: d.supplierName,
                        subtitle: d.foodItem,
                        badge: 'Received',
                        isWarning: false,
                        date: d.createdAt,
                    })),
                    ...cleanings.map((c: any) => ({
                        id: `clean-${c.id}`,
                        type: 'Cleaning',
                        title: c.equipmentName,
                        subtitle: `Cleaned by ${c.cleanedBy}`,
                        badge: 'Done ✨',
                        isWarning: false,
                        date: c.createdAt,
                    })),
                ];

                combined.sort(
                    (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                );
                setRecentActivity(combined.slice(0, 5));
            } catch (error) {
                console.error('Failed to load dashboard data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-8 mt-4 md:mt-0">
                <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
                <p className="text-slate-500 mt-1">
                    Your kitchen overview for today.
                </p>
            </header>

            {/* --- SUMMARY CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <h3 className="text-slate-500 text-sm font-semibold mb-2 uppercase tracking-wider">
                        Today&apos;s Temps
                    </h3>
                    {isLoading ? (
                        <div className="h-10 w-16 bg-slate-100 animate-pulse rounded"></div>
                    ) : (
                        <>
                            <p className="text-4xl font-bold text-slate-800">
                                {stats.tempsToday}
                            </p>
                            <span className="text-green-500 text-sm font-medium mt-2 block">
                                Logs recorded today
                            </span>
                        </>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <h3 className="text-slate-500 text-sm font-semibold mb-2 uppercase tracking-wider">
                        Total Deliveries
                    </h3>
                    {isLoading ? (
                        <div className="h-10 w-16 bg-slate-100 animate-pulse rounded"></div>
                    ) : (
                        <>
                            <p className="text-4xl font-bold text-slate-800">
                                {stats.totalDeliveries}
                            </p>
                            <span className="text-blue-500 text-sm font-medium mt-2 block">
                                Records in database
                            </span>
                        </>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <h3 className="text-slate-500 text-sm font-semibold mb-2 uppercase tracking-wider">
                        Cleaning Tasks
                    </h3>
                    {isLoading ? (
                        <div className="h-10 w-16 bg-slate-100 animate-pulse rounded"></div>
                    ) : (
                        <>
                            <p className="text-4xl font-bold text-slate-800">
                                {stats.totalCleanings}
                            </p>
                            <span className="text-amber-500 text-sm font-medium mt-2 block">
                                Completed logs
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* --- RECENT ACTIVITY --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-75">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    ⚡ Recent Activity
                </h3>

                {isLoading ? (
                    <p className="text-slate-500 text-sm py-4 animate-pulse">
                        Loading latest kitchen events...
                    </p>
                ) : recentActivity.length === 0 ? (
                    <p className="text-slate-500 text-sm py-4">
                        No activity logged yet.
                    </p>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {recentActivity.map((item) => (
                            <div
                                key={item.id}
                                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors -mx-6 px-6"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Dynamic icon based on record type. */}
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                                            item.type === 'Temperature'
                                                ? 'bg-red-100 text-red-500'
                                                : item.type === 'Delivery'
                                                  ? 'bg-blue-100 text-blue-500'
                                                  : 'bg-amber-100 text-amber-500'
                                        }`}
                                    >
                                        {item.type === 'Temperature'
                                            ? '🌡️'
                                            : item.type === 'Delivery'
                                              ? '📦'
                                              : '✨'}
                                    </div>

                                    <div>
                                        <p className="font-bold text-slate-700">
                                            {item.title}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {item.subtitle}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {new Date(
                                                item.date,
                                            ).toLocaleDateString()}{' '}
                                            at{' '}
                                            {new Date(
                                                item.date,
                                            ).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Dynamic Badge */}
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap self-start sm:self-auto ${
                                        item.isWarning
                                            ? 'bg-red-100 text-red-700'
                                            : item.type === 'Temperature'
                                              ? 'bg-green-100 text-green-700'
                                              : item.type === 'Delivery'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-amber-100 text-amber-700'
                                    }`}
                                >
                                    {item.badge}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
