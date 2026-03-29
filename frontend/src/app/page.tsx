'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type {
    TempLog,
    CookingLog,
    DeliveryLog,
    CleaningLog,
    AnyLog,
} from '../types/dashboard';

import TemperaturesCard from '@/components/dashboard/TemperaturesCard';
import CookingCard from '@/components/dashboard/CookingCard';
import DeliveryCard from '@/components/dashboard/DeliveryCard';
import CleaningCard from '@/components/dashboard/CleaningCard';

export default function Home() {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(true);

    const [stats, setStats] = useState({
        tempsToday: 0,
        cookingToday: 0,
        deliveriesToday: 0,
        cleaningsToday: 0,
        highTempAlerts: 0,
        totalEquip: 0,
        totalStaff: 0,
    });

    const [activity, setActivity] = useState({
        temps: {} as Record<string, TempLog[]>,
        cooking: {} as Record<string, CookingLog[]>,
        deliveries: {} as Record<string, DeliveryLog[]>,
        cleanings: {} as Record<string, CleaningLog[]>,
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (
                status !== 'authenticated' ||
                !(session?.user as any)?.restaurantId
            )
                return;

            const restaurantId = (session.user as any).restaurantId;

            try {
                // One single request to get the whole "Kitchen Overview"
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats/${restaurantId}`,
                );

                if (!res.ok) throw new Error('Failed to fetch');

                const data = await res.json(); // This is the { temps, cooking, deliveries, cleanings } object

                const todayStr = new Date().toLocaleDateString();

                setStats({
                    tempsToday: data.temps.filter(
                        (t: TempLog) =>
                            new Date(t.createdAt).toLocaleDateString() ===
                            todayStr,
                    ).length,
                    cookingToday: data.cooking.filter(
                        (c: CookingLog) =>
                            new Date(c.createdAt).toLocaleDateString() ===
                            todayStr,
                    ).length,
                    deliveriesToday: data.deliveries.filter(
                        (d: DeliveryLog) =>
                            new Date(d.createdAt).toLocaleDateString() ===
                            todayStr,
                    ).length,
                    cleaningsToday: data.cleanings.filter(
                        (c: CleaningLog) =>
                            new Date(c.createdAt).toLocaleDateString() ===
                            todayStr,
                    ).length,

                    highTempAlerts: data.temps.filter(
                        (t: TempLog) =>
                            new Date(t.createdAt).toLocaleDateString() ===
                                todayStr && t.temperature > 8,
                    ).length,
                    totalEquip: data.totalEquip,
                    totalStaff: data.totalUsers,
                });

                // 2. Process and Group Activity
                const processAndGroup = (
                    items:
                        | TempLog[]
                        | CookingLog[]
                        | DeliveryLog[]
                        | CleaningLog[],
                ) => {
                    if (!items || items.length === 0) return {};
                    return items.reduce(
                        (acc: Record<string, AnyLog[]>, item: AnyLog) => {
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
                    temps: processAndGroup(data.temps) as Record<
                        string,
                        TempLog[]
                    >,
                    cooking: processAndGroup(data.cooking) as Record<
                        string,
                        CookingLog[]
                    >,
                    deliveries: processAndGroup(data.deliveries) as Record<
                        string,
                        DeliveryLog[]
                    >,
                    cleanings: processAndGroup(data.cleanings) as Record<
                        string,
                        CleaningLog[]
                    >,
                });
            } catch (error) {
                console.error('Failed to load dashboard data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [session, status]);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-slate-400 font-bold animate-pulse text-sm sm:text-base">
                    Loading Kitchen Data...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans">
            <header className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Dashboard
                </h2>
                <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
                    Your kitchen overview and recent activities.
                </p>
            </header>

            {/* SUMMARY STATS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
                {/* TEMPS STAT */}
                <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-400 text-[9px] sm:text-[10px] font-bold mb-1 uppercase tracking-widest">
                        Temps Today
                    </h3>
                    {isLoading ? (
                        <div className="h-6 sm:h-8 w-12 bg-slate-100 animate-pulse rounded"></div>
                    ) : (
                        <div className="flex items-end gap-1.5 sm:gap-2">
                            <p className="text-2xl sm:text-3xl font-black text-slate-800 leading-none">
                                {stats.tempsToday}
                            </p>
                            <span className="text-blue-500 text-[10px] sm:text-xs font-bold mb-0.5 sm:mb-1 block">
                                Logs
                            </span>
                        </div>
                    )}
                </div>

                {/* COOKING STAT */}
                <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-400 text-[9px] sm:text-[10px] font-bold mb-1 uppercase tracking-widest">
                        Cooking Today
                    </h3>
                    {isLoading ? (
                        <div className="h-6 sm:h-8 w-12 bg-slate-100 animate-pulse rounded"></div>
                    ) : (
                        <div className="flex items-end gap-1.5 sm:gap-2">
                            <p className="text-2xl sm:text-3xl font-black text-slate-800 leading-none">
                                {stats.cookingToday}
                            </p>
                            <span className="text-orange-500 text-[10px] sm:text-xs font-bold mb-0.5 sm:mb-1 block">
                                Meals
                            </span>
                        </div>
                    )}
                </div>

                {/* DELIVERIES STAT */}
                <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-400 text-[9px] sm:text-[10px] font-bold mb-1 uppercase tracking-widest">
                        Deliveries Today
                    </h3>
                    {isLoading ? (
                        <div className="h-6 sm:h-8 w-12 bg-slate-100 animate-pulse rounded"></div>
                    ) : (
                        <div className="flex items-end gap-1.5 sm:gap-2">
                            <p className="text-2xl sm:text-3xl font-black text-slate-800 leading-none">
                                {stats.deliveriesToday}
                            </p>
                            <span className="text-indigo-500 text-[10px] sm:text-xs font-bold mb-0.5 sm:mb-1 block">
                                Received
                            </span>
                        </div>
                    )}
                </div>

                {/* CLEANING STAT */}
                <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-400 text-[9px] sm:text-[10px] font-bold mb-1 uppercase tracking-widest">
                        Cleaning Today
                    </h3>
                    {isLoading ? (
                        <div className="h-6 sm:h-8 w-12 bg-slate-100 animate-pulse rounded"></div>
                    ) : (
                        <div className="flex items-end gap-1.5 sm:gap-2">
                            <p className="text-2xl sm:text-3xl font-black text-slate-800 leading-none">
                                {stats.cleaningsToday}
                            </p>
                            <span className="text-emerald-500 text-[10px] sm:text-xs font-bold mb-0.5 sm:mb-1 block">
                                Tasks
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* SECONDARY STATS GRID - THE "INFRASTRUCTURE" ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
                {/* HIGH TEMP ALERTS - DANGER CARD */}
                <div
                    className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border ${stats.highTempAlerts > 0 ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-white border-slate-200'}`}
                >
                    <h3 className="text-slate-400 text-[9px] sm:text-[10px] font-bold mb-1 uppercase tracking-widest">
                        High Temp Alerts ⚠️
                    </h3>
                    <div className="flex items-end gap-2">
                        <p
                            className={`text-2xl sm:text-3xl font-black leading-none ${stats.highTempAlerts > 0 ? 'text-red-600' : 'text-slate-800'}`}
                        >
                            {stats.highTempAlerts}
                        </p>
                        <span className="text-[10px] font-bold mb-1 block text-slate-400">
                            Critical
                        </span>
                    </div>
                </div>

                {/* TOTAL INFRASTRUCTURE */}
                <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-400 text-[9px] sm:text-[10px] font-bold mb-1 uppercase tracking-widest">
                        Total Equipment ❄️
                    </h3>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl sm:text-3xl font-black text-slate-800 leading-none">
                            {stats.totalEquip}
                        </p>
                        <span className="text-slate-400 text-[10px] font-bold mb-1 block">
                            Units
                        </span>
                    </div>
                </div>

                {/* TOTAL STAFF */}
                <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-400 text-[9px] sm:text-[10px] font-bold mb-1 uppercase tracking-widest">
                        Active Team 👨‍🍳
                    </h3>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl sm:text-3xl font-black text-slate-800 leading-none">
                            {stats.totalStaff}
                        </p>
                        <span className="text-slate-400 text-[10px] font-bold mb-1 block">
                            Members
                        </span>
                    </div>
                </div>
            </div>

            {/* ACTIVITY CARDS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* TEMPERATURES CARD */}
                <TemperaturesCard
                    isLoading={isLoading}
                    activity={activity.temps}
                />
                {/* --- COOKING CARD --- */}
                <CookingCard
                    isLoading={isLoading}
                    activity={activity.cooking}
                />

                {/* --- DELIVERIES CARD --- */}
                <DeliveryCard
                    isLoading={isLoading}
                    activity={activity.deliveries}
                />

                {/* --- CLEANING CARD --- */}
                <CleaningCard
                    isLoading={isLoading}
                    activity={activity.cleanings}
                />
            </div>
        </div>
    );
}
