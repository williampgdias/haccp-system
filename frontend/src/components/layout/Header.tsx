'use client';

import { useSession, signOut } from 'next-auth/react';

/**
 * Global Executive Header
 * Layout: Welcome & Name (Horizontal) with Date (Underneath) on the right side.
 */
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

    return (
        <header className="bg-white border-b border-slate-200 p-4 flex justify-end items-center sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-4">
                {/* 📝 Text Group: Name and Date stacked vertically */}
                <div className="flex flex-col items-end">
                    {/* Top Line: Welcome + Name side-by-side */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Welcome back,
                        </span>
                        <span className="text-sm font-bold text-slate-950">
                            {userName}
                        </span>
                    </div>

                    {/* Bottom Line: Small Date */}
                    <span className="text-[10px] font-medium text-slate-400 mt-0.5 tabular-nums">
                        {formattedDate}
                    </span>
                </div>

                {/* 👤 Identity Group: Avatar + Logout */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm border-2 border-white ring-2 ring-slate-100 shadow-sm">
                        {userInitials}
                    </div>

                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Sign Out"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
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
