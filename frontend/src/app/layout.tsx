// frontend/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'HACCP Pro',
    description: 'Kitchen Management System',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body
                className={`${inter.className} bg-slate-50 text-slate-900 flex flex-col lg:flex-row min-h-screen`}
            >
                {/* Sidebar / Top bar */}
                <aside className="w-full lg:w-64 bg-slate-950 text-slate-300 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 shadow-xl z-10 shrink-0">
                    <div className="pt-5 px-6 lg:p-6">
                        <h1 className="text-2xl font-bold text-white tracking-wide">
                            HACCP Pro
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Kitchen Management
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-row lg:flex-col justify-center lg:justify-start gap-2 p-4 lg:p-6 overflow-x-auto lg:overflow-visible w-full">
                        <Link
                            href="/"
                            className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium whitespace-nowrap transition-colors"
                        >
                            📊 Dashboard
                        </Link>
                        <Link
                            href="/temperatures"
                            className="px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white text-sm font-medium transition-colors whitespace-nowrap"
                        >
                            🌡️ Temperatures
                        </Link>
                        <Link
                            href="/deliveries"
                            className="px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white text-sm font-medium transition-colors whitespace-nowrap"
                        >
                            📦 Deliveries
                        </Link>
                        <Link
                            href="/cleaning"
                            className="px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white text-sm font-medium transition-colors whitespace-nowrap"
                        >
                            ✨ Cleaning
                        </Link>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </body>
        </html>
    );
}
