export default function Home() {
    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-8 mt-4 md:mt-0">
                <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
                <p className="text-slate-500 mt-1">
                    Your Kitchen overview for today.
                </p>
            </header>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 text-sm font-semibold mb-2 uppercase tracking-wider">
                        Today&apos;s Temps
                    </h3>
                    <p className="text-4xl font-bold text-slate-800">12</p>
                    <span className="text-green-500 text-sm font-medium mt-2 block">
                        All units checked
                    </span>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 text-sm font-semibold mb-2 uppercase tracking-wider">
                        Deliveries
                    </h3>
                    <p className="text-4xl font-bold text-slate-800">3</p>
                    <span className="text-blue-500 text-sm font-medium mt-2 block">
                        Logged this week
                    </span>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 text-sm font-semibold mb-2 uppercase tracking-wider">
                        Cleaning Status
                    </h3>
                    <p className="text-4xl font-bold text-slate-800">5</p>
                    <span className="text-amber-500 text-sm font-medium mt-2 block">
                        Pending tasks
                    </span>
                </div>
            </div>

            {/* Placeholder for Recent Activity List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-75">
                <h3 className="text-lg font-bold text-slate-800 mb-4">
                    Recent Activity
                </h3>

                <div className="divide-y divide-slate-100">
                    <div className="py-3 flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-slate-700">
                                Kitchen Fridge 1
                            </p>
                            <p className="text-sm text-slate-500">
                                Temperature logged
                            </p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            3.5°C
                        </span>
                    </div>

                    <div className="py-3 flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-slate-700">
                                Tesco Delivery
                            </p>
                            <p className="text-sm text-slate-500">
                                Oat Milk, Fresh Produce
                            </p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            Checked
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
