/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Header() {
    const { data: session } = useSession();

    // 1. Date Logic
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    // 2. Initials Logic
    const getInitials = (name: string | null | undefined) => {
        if (!name) return '??';
        const names = name.split(' ');
        if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    };

    const userName = session?.user?.name || 'Chef';
    const userInitials = getInitials(session?.user?.name);

    // 3. Dynamic Restaurant Name
    const restaurantName =
        (session?.user as any)?.restaurantName || 'Kitchen Management';

    return (
        <header className="bg-white border-b border-slate-200 p-3 sm:p-4 flex justify-between items-center sticky top-0 z-20 shadow-sm w-full">
            {/* 👈 LEFT: The Restaurant Brand + CONDITIONAL MOBILE DATE */}
            {/* Changes container to flex-col on mobile, flex-row items-center on Tablet (sm) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 min-w-0 pr-2">
                {/* Wrapper for Bar + Name to always keep horizontal alignment */}
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-blue-600 rounded-full shrink-0"></div>
                    <h2 className="text-sm sm:text-lg font-black text-slate-800 tracking-tight truncate">
                        {restaurantName}
                    </h2>
                </div>

                {/* ✅ NEW MOBILE DATE: Only visible on mobile, appears below name */}
                {/* Added ml-3.5 to align with the name, past the blue accent bar */}
                <p className="block sm:hidden text-[10px] font-medium text-slate-400 mt-0.5 ml-3.5 tabular-nums">
                    {formattedDate}
                </p>
            </div>

            {/* 👉 RIGHT: User Identity & Date (TABLET VIEW) */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                {/* Stacked Text Group - STANDARD TABLET VIEW */}
                {/* Hidden on mobile (xs), shown on Tablet+ (sm) */}
                <div className="hidden sm:flex flex-col items-end">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Welcome back,
                        </span>
                        <span className="text-sm font-black text-slate-800 italic">
                            {userName}
                        </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 mt-0.5 tabular-nums">
                        {formattedDate}
                    </span>
                </div>

                {/* Action Group: Avatar + Profile + Logout */}
                <div className="flex items-center gap-2 sm:gap-3 sm:pl-4 sm:border-l sm:border-slate-100">
                    <Link href="/profile" title="My Profile">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm border-2 border-white ring-2 ring-slate-100 shadow-sm shrink-0 hover:opacity-80 transition-opacity cursor-pointer">
                            {userInitials}
                        </div>
                    </Link>

                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Sign Out"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
}
