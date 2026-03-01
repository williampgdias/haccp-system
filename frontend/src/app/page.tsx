import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen p-4 mx-auto max-w-5xl">
            <header className="mb-10 mt-8 md:mt-12 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
                    HACCP App
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                    Daily Kitchen Records
                </p>
            </header>

            {/* Navigation Menu */}
            <nav className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Link to Daily Temperatures Form */}
                <Link
                    href="/temperatures"
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md active:scale-95 transition-all min-h-30"
                >
                    <span className="font-semibold text-xl text-slate-700 mb-4">
                        🌡️ Daily Temperatures
                    </span>
                    <span className="text-blue-500 font-bold self-end mt-auto flex items-center gap-2">
                        Open Form ➔
                    </span>
                </Link>

                {/* Link to Deliveries Form */}
                <Link
                    href="/deliveries"
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md active:scale-95 transition-all min-h-[120px]"
                >
                    <span className="font-semibold text-xl text-slate-700 mb-4">
                        📦 Delivery Records
                    </span>
                    <span className="text-blue-500 font-bold self-end mt-auto flex items-center gap-2">
                        Open Form ➔
                    </span>
                </Link>

                {/* Link to Cleaning Schedule Form */}
                <Link
                    href="/cleaning"
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md active:scale-95 transition-all min-h-[120px]"
                >
                    <span className="font-semibold text-xl text-slate-700 mb-4">
                        ✨ Cleaning Schedule
                    </span>
                    <span className="text-blue-500 font-bold self-end mt-auto flex items-center gap-2">
                        Open Form ➔
                    </span>
                </Link>
            </nav>
        </main>
    );
}
