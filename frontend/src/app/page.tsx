import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen p-4 max-w-md mx-auto">
            <header className="mb-8 mt-6 text-center">
                <h1 className="text-3xl font-bold text-slate-800">HACCP App</h1>
                <p className="text-slate-500 mt-2">Daily Kitchen Records</p>
            </header>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-4">
                {/* Link to Daily Temperatures Form */}
                <Link
                    href="/temperatures"
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between active:scale-95 transition-transform"
                >
                    <span className="font-semibold text-lg text-slate-700">
                        🌡️ Daily Temperatures
                    </span>
                    <span className="text-blue-500 font-bold">➔</span>
                </Link>

                {/* Link to Deliveries Form */}
                <Link
                    href="/deliveries"
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between active:scale-95 transition-transform"
                >
                    <span className="font-semibold text-lg text-slate-700">
                        📦 Delivery Records
                    </span>
                    <span className="text-blue-500 font-bold">➔</span>
                </Link>

                {/* Link to Cleaning Schedule Form */}
                <Link
                    href="/cleaning"
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between active:scale-95 transition-transform"
                >
                    <span className="font-semibold text-lg text-slate-700">
                        ✨ Cleaning Schedule
                    </span>
                    <span className="text-blue-500 font-bold">➔</span>
                </Link>
            </nav>
        </main>
    );
}
