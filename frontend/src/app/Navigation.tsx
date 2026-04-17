'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react'; // Import to access session data

/**
 * Navigation Component (Sidebar)
 * Implements Role-Based Access Control (RBAC) to hide/show links
 * based on the user's role (ADMIN vs STAFF).
 */
export default function Navigation() {
    const pathname = usePathname();
    const { data: session } = useSession();

    // Extract user role from session
    // Since we added next-auth.d.ts, TypeScript should recognize .role
    const userRole = session?.user?.role;

    // Base links available to all kitchen staff
    const links = [
        { href: '/', label: 'Dashboard' },
        { href: '/temperatures', label: 'Temperatures' },
        { href: '/cooking', label: 'Cooking' },
        { href: '/deliveries', label: 'Deliveries' },
        { href: '/cleaning', label: 'Cleaning' },
    ];

    /**
     * RBAC LOGIC:
     * Only push the Settings link if the user is an ADMIN.
     * This prevents Staff members from even seeing the management area.
     */
    if (userRole === 'ADMIN') {
        links.push({ href: '/settings', label: 'Settings' });
    }

    return (
        <aside className="bg-[#020617] text-white flex flex-col w-full lg:w-64 lg:min-h-screen border-b lg:border-b-0 lg:border-r border-slate-800 shrink-0">
            {/* BRANDING SECTION */}
            <div className="p-4 lg:p-6">
                <h1 className="text-xl font-black italic leading-none">
                    HACCP Pro
                </h1>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">
                    Kitchen Management
                </p>
            </div>

            {/* NAVIGATION BAR */}
            {/* Mobile: Horizontal Scroll | Desktop: Vertical List */}
            <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-hidden px-4 lg:px-4 pb-4 lg:pb-0 gap-2 scrollbar-hide">
                {links.map((link) => {
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                                isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
