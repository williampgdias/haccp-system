import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NextAuthProvider from '@/components/providers/NextAuthProvider';
import Navigation from './Navigation';
import Header from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'HACCP Pro - Kitchen Management',
    description: 'Secure Digital HACCP Records for Professional Kitchens',
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body
                className={`${inter.className} bg-slate-50 text-slate-900 flex flex-col lg:flex-row min-h-screen`}
                suppressHydrationWarning
            >
                <NextAuthProvider>
                    {/* Sidebar / Top bar (Fixed Background) */}
                    <aside className="w-full lg:w-64 bg-slate-950 text-slate-300 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 shadow-xl z-10 shrink-0">
                        <div className="pt-5 px-6 lg:p-6">
                            <h1 className="text-2xl font-bold text-white tracking-wide italic">
                                HACCP Pro
                            </h1>
                            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">
                                Kitchen Management
                            </p>
                        </div>
                        <Navigation />
                    </aside>

                    {/* Main Content Area Wrapper */}
                    <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
                        {/* The Global Header */}
                        <Header />

                        {/* Page Content */}
                        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                            {children}
                        </main>
                    </div>
                </NextAuthProvider>
            </body>
        </html>
    );
}
