// frontend/src/app/Navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
    const pathname = usePathname();

    const links = [
        { href: '/', label: '📊 Dashboard' },
        { href: '/temperatures', label: '🌡️ Temperatures' },
        { href: '/cooking', label: '👨‍🍳 Cooking' },
        { href: '/deliveries', label: '📦 Deliveries' },
        { href: '/cleaning', label: '✨ Cleaning' },
        { href: '/settings', label: '⚙️ Settings' },
    ];

    return (
        <nav className="flex flex-row lg:flex-col justify-center lg:justify-start gap-2 p-4 lg:p-6 overflow-x-auto lg:overflow-visible w-full">
            {links.map((link) => {
                const isActive = pathname === link.href;

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                            isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}
