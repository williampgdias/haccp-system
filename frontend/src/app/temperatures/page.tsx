/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function TemperaturesPage() {
    const { data: session } = useSession();
    const [equipments, setEquipments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // 1. Fetch equipment registered to the restaurant
    useEffect(() => {
        const restaurantId = (session?.user as any)?.restaurantId;
        if (restaurantId) {
            // NOTE: Our simple settings page currently hardcodes 'FRIDGE' for simplicity.
            fetch(`http://localhost:3001/api/logs/equipment/${restaurantId}`)
                .then((res) => res.json())
                .then((data) => setEquipments(data))
                .catch((err) =>
                    console.error('Error fetching equipment:', err),
                );
        }
    }, [session]);

    // 2. Save the temperature to the database
    async function saveTemperature(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const restaurantId = (session?.user as any)?.restaurantId;

        try {
            const res = await fetch(
                'http://localhost:3001/api/logs/temperatures',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        restaurantId,
                        equipmentId: formData.get('equipmentId'),
                        temperature: formData.get('temperature'),
                        initials: formData.get('initials'),
                    }),
                },
            );

            if (res.ok) {
                alert('Temperature recorded successfully! ✅');
                e.currentTarget.reset(); // Clear the form
            } else {
                alert('Error recording temperature.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Server connection error.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8 font-sans">
            <header className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    Daily Temperatures 🌡️
                </h2>
                <p className="text-slate-500 font-medium mt-1">
                    Record your fridge and freezer checks.
                </p>
            </header>

            <form
                onSubmit={saveTemperature}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-5"
            >
                {/* DYNAMIC EQUIPMENT DROPDOWN */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                        Equipment
                    </label>
                    <select
                        name="equipmentId"
                        required
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="">Select a fridge/freezer...</option>
                        {equipments.map((eq) => (
                            <option key={eq.id} value={eq.id}>
                                {eq.name}
                            </option>
                        ))}
                    </select>
                    {equipments.length === 0 && (
                        <p className="text-xs text-orange-500 mt-1 font-bold">
                            ⚠️ No equipment found. Go to Settings to add them
                            first!
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                        Temperature (°C)
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        name="temperature"
                        required
                        placeholder="Ex: 3.5"
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                        Your Initials
                    </label>
                    <input
                        type="text"
                        name="initials"
                        required
                        placeholder="Ex: WD"
                        defaultValue={(session?.user?.name || '')
                            .substring(0, 2)
                            .toUpperCase()}
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || equipments.length === 0}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Saving...' : 'Save Record'}
                </button>
            </form>
        </div>
    );
}
