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
        highTempAlerts: 0,
        totalEquip: 0,
        totalStaff: 0,
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
                        (t: any) =>
                            new Date(t.createdAt).toLocaleDateString() ===
                            todayStr,
                    ).length,
                    cookingToday: data.cooking.filter(
                        (c: any) =>
                            new Date(c.createdAt).toLocaleDateString() ===
                            todayStr,
                    ).length,
                    deliveriesToday: data.deliveries.filter(
                        (d: any) =>
                            new Date(d.createdAt).toLocaleDateString() ===
                            todayStr,
                    ).length,
                    cleaningsToday: data.cleanings.filter(
                        (c: any) =>
                            new Date(c.createdAt).toLocaleDateString() ===
                            todayStr,
                    ).length,

                    highTempAlerts: data.temps.filter(
                        (t: any) =>
                            new Date(t.createdAt).toLocaleDateString() ===
                                todayStr && t.temperature > 8,
                    ).length,
                    totalEquip: data.totalEquip,
                    totalStaff: data.totalUsers,
                });

                // 2. Process and Group Activity
                const processAndGroup = (items: any[]) => {
                    if (!items || items.length === 0) return {};
                    return items.reduce(
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
                    temps: processAndGroup(data.temps),
                    cooking: processAndGroup(data.cooking),
                    deliveries: processAndGroup(data.deliveries),
                    cleanings: processAndGroup(data.cleanings),
                });
            } catch (error) {
                console.error('Failed to load dashboard data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [session, status]);

    if (!isMounted || status === 'loading') {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-slate-400 font-bold animate-pulse text-sm sm:text-base">
                    Loading Kitchen Data...
                </p>
            </div>
        );
    }

    const renderDateHeader = (dateStr: string) => {
        const todayStr = new Date().toLocaleDateString();
        return (
            <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3 mt-4 first:mt-0">
                📅 {dateStr === todayStr ? 'Today' : dateStr}
            </h4>
        );
    };

    // Helper function to force 12h display for "HH:mm" strings
    const formatTimeStr12h = (time24: string) => {
        if (!time24) return '';
        const [h, m] = time24.split(':');
        const hours = parseInt(h, 10);
        const suffix = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        return `${hours12}:${m} ${suffix}`;
    };

    // Helper for ISO Date objects
    const formatIsoTo12h = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

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
                {/* --- TEMPERATURES CARD --- */}
                <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 flex flex-col h-80 sm:h-96">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                        🌡️ Recent Temperatures
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading ? (
                            <p className="text-slate-400 text-xs sm:text-sm animate-pulse">
                                Loading...
                            </p>
                        ) : Object.keys(activity.temps).length === 0 ? (
                            <p className="text-slate-400 text-xs sm:text-sm">
                                No records found.
                            </p>
                        ) : (
                            Object.entries(activity.temps).map(
                                ([date, items]) => (
                                    <div key={date}>
                                        {renderDateHeader(date)}
                                        <div className="space-y-2 sm:space-y-3">
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex justify-between items-center bg-slate-50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-100 hover:shadow-sm transition-shadow"
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                                                            <p className="font-bold text-slate-700 text-sm">
                                                                {item.equipment
                                                                    ?.name ||
                                                                    'Equipment'}
                                                            </p>
                                                            <span
                                                                className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${item.timeChecked === 'Afternoon' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}
                                                            >
                                                                {item.timeChecked ||
                                                                    'Morning'}
                                                            </span>
                                                        </div>
                                                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                                            By{' '}
                                                            <span className="font-bold text-slate-500">
                                                                {item.initials}
                                                            </span>{' '}
                                                            •{' '}
                                                            {formatIsoTo12h(
                                                                item.createdAt,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`px-2 sm:px-2.5 py-1 rounded-md text-xs sm:text-sm font-black shadow-sm ${item.temperature > 8 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}
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
                <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 flex flex-col h-80 sm:h-96">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                        👨‍🍳 Cooking & Cooling
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading ? (
                            <p className="text-slate-400 text-xs sm:text-sm animate-pulse">
                                Loading...
                            </p>
                        ) : Object.keys(activity.cooking).length === 0 ? (
                            <p className="text-slate-400 text-xs sm:text-sm">
                                No records found.
                            </p>
                        ) : (
                            Object.entries(activity.cooking).map(
                                ([date, items]) => (
                                    <div key={date}>
                                        {renderDateHeader(date)}
                                        <div className="space-y-2 sm:space-y-3">
                                            {items.map((item) => {
                                                const isCooking =
                                                    !!item.cookTemp;
                                                const temp = isCooking
                                                    ? item.cookTemp
                                                    : item.reheatTemp;
                                                const time = isCooking
                                                    ? item.cookTime
                                                    : item.reheatTime;
                                                const isSafe = temp >= 75;

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className="flex justify-between items-center bg-slate-50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-100 hover:shadow-sm transition-shadow"
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                                                                <p className="font-bold text-slate-700 text-sm">
                                                                    {
                                                                        item.foodItem
                                                                    }
                                                                </p>
                                                                <span
                                                                    className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${isCooking ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}
                                                                >
                                                                    {isCooking
                                                                        ? 'Cooking'
                                                                        : 'Reheating'}
                                                                </span>
                                                            </div>
                                                            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                                                By{' '}
                                                                <span className="font-bold text-slate-500">
                                                                    {
                                                                        item.initials
                                                                    }
                                                                </span>{' '}
                                                                •{' '}
                                                                {formatTimeStr12h(
                                                                    time,
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-1">
                                                            <span
                                                                className={`px-2 sm:px-2.5 py-1 rounded-md text-xs sm:text-sm font-black shadow-sm border ${isSafe ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}
                                                            >
                                                                {temp}°C
                                                            </span>
                                                            {item.coolingFinishTime && (
                                                                <span className="text-[8px] sm:text-[9px] font-bold text-blue-500 uppercase flex items-center gap-1 mt-0.5">
                                                                    Cooled ❄️
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ),
                            )
                        )}
                    </div>
                </div>

                {/* --- DELIVERIES CARD --- */}
                <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 flex flex-col h-80 sm:h-96">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                        📦 Recent Deliveries
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading ? (
                            <p className="text-slate-400 text-xs sm:text-sm animate-pulse">
                                Loading...
                            </p>
                        ) : Object.keys(activity.deliveries).length === 0 ? (
                            <p className="text-slate-400 text-xs sm:text-sm">
                                No records found.
                            </p>
                        ) : (
                            Object.entries(activity.deliveries).map(
                                ([date, items]) => (
                                    <div key={date}>
                                        {renderDateHeader(date)}
                                        <div className="space-y-2 sm:space-y-3">
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex justify-between items-center bg-slate-50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-100 hover:shadow-sm transition-shadow"
                                                >
                                                    <div>
                                                        <p className="font-bold text-slate-700 text-sm">
                                                            {item.supplier}
                                                        </p>
                                                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                                                            Inv:{' '}
                                                            <span className="font-bold text-slate-500">
                                                                {item.invoiceNumber ||
                                                                    'N/A'}
                                                            </span>{' '}
                                                            •{' '}
                                                            {formatIsoTo12h(
                                                                item.createdAt,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`px-2 sm:px-2.5 py-1 rounded-md text-xs sm:text-sm font-black shadow-sm border ${
                                                            parseFloat(
                                                                item.temperature,
                                                            ) <= 5
                                                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                                : 'bg-red-100 text-res-700 border-red-200'
                                                        }`}
                                                    >
                                                        {parseFloat(
                                                            item.temperature,
                                                        ) <= 5
                                                            ? 'Accepted'
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
                <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 flex flex-col h-80 sm:h-96">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                        ✨ Cleaning Tasks
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading ? (
                            <p className="text-slate-400 text-xs sm:text-sm animate-pulse">
                                Loading...
                            </p>
                        ) : Object.keys(activity.cleanings).length === 0 ? (
                            <p className="text-slate-400 text-xs sm:text-sm">
                                No records found.
                            </p>
                        ) : (
                            Object.entries(activity.cleanings).map(
                                ([date, items]) => (
                                    <div key={date}>
                                        {renderDateHeader(date)}
                                        <div className="space-y-2 sm:space-y-3">
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex justify-between items-center bg-slate-50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-100 hover:shadow-sm transition-shadow"
                                                >
                                                    <div>
                                                        <p className="font-bold text-slate-700 text-sm">
                                                            {item.area}
                                                        </p>
                                                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                                                            By{' '}
                                                            <span className="font-bold text-slate-500">
                                                                {item.initials}
                                                            </span>{' '}
                                                            •{' '}
                                                            {formatIsoTo12h(
                                                                item.createdAt,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`px-2 sm:px-2.5 py-1 rounded-md text-xs sm:text-sm font-black shadow-sm border ${item.status === 'CLEAN' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}
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
