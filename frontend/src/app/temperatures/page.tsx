// frontend/src/app/temperatures/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface TemperatureRecord {
    id: string;
    createdAt: string;
    unitName: string;
    timeChecked: string;
    temperature: number;
}

export default function TemperaturesPage() {
    const [formData, setFormData] = useState({
        unitName: '',
        timeChecked: '',
        temperature: '',
    });

    const [statusMessage, setStatusMessage] = useState('');
    const [records, setRecords] = useState<TemperatureRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRecords = async () => {
        try {
            const response = await fetch(
                'http://localhost:3001/api/daily-temperatures',
                { cache: 'no-store' },
            );
            if (response.ok) {
                const data = await response.json();
                const sortedData = data.sort(
                    (a: TemperatureRecord, b: TemperatureRecord) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                );
                setRecords(sortedData);
            }
        } catch (error) {
            console.error('Failed to fetch records', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const inputHour = parseInt(formData.timeChecked.split(':')[0]);
        const isMorningInput = inputHour < 12;
        const todayStr = new Date().toLocaleDateString();

        const hasDuplicate = records.some((record) => {
            const recordDateStr = new Date(
                record.createdAt,
            ).toLocaleDateString();

            if (recordDateStr !== todayStr) return false;
            if (record.unitName !== formData.unitName) return false;

            const recordHour = parseInt(record.timeChecked.split(':')[0]);
            const isRecordMorning = recordHour < 12;

            return isMorningInput === isRecordMorning;
        });

        if (hasDuplicate) {
            const periodName = isMorningInput ? 'Morning' : 'Afternoon';
            setStatusMessage(
                `⚠️ ${periodName} temp for ${formData.unitName} is already logged today!`,
            );
            return;
        }

        setStatusMessage('Saving...');

        try {
            const response = await fetch(
                'http://localhost:3001/api/daily-temperatures',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        unitName: formData.unitName,
                        timeChecked: formData.timeChecked,
                        temperature: parseFloat(formData.temperature),
                    }),
                },
            );

            if (response.ok) {
                setStatusMessage('✅ Success! Record saved.');
                setFormData({ unitName: '', timeChecked: '', temperature: '' });
                fetchRecords();
                setTimeout(() => setStatusMessage(''), 3000);
            } else {
                setStatusMessage('❌ Error saving record. Try again.');
            }
        } catch (error) {
            setStatusMessage(
                '❌ Failed to connect to server. Is the backend running?',
            );
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        setStatusMessage('');
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const groupedRecords = records.reduce(
        (acc, record) => {
            const date = new Date(record.createdAt).toLocaleDateString();

            if (!acc[date]) acc[date] = {};

            if (!acc[date][record.unitName]) {
                acc[date][record.unitName] = { morning: null, afternoon: null };
            }

            const hour = parseInt(record.timeChecked.split(':')[0]);

            if (hour < 12 && !acc[date][record.unitName].morning) {
                acc[date][record.unitName].morning = record;
            } else if (hour >= 12 && !acc[date][record.unitName].afternoon) {
                acc[date][record.unitName].afternoon = record;
            }

            return acc;
        },
        {} as Record<
            string,
            Record<
                string,
                {
                    morning: TemperatureRecord | null;
                    afternoon: TemperatureRecord | null;
                }
            >
        >,
    );

    return (
        <div className="max-w-4xl mx-auto mt-4 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    🌡️ Log Daily Temperature
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Equipment Unit
                        </label>
                        <select
                            name="unitName"
                            value={formData.unitName}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                        >
                            <option value="">Select a unit...</option>
                            <option value="Kitchen Fridge 1">
                                Kitchen Fridge 1
                            </option>
                            <option value="Kitchen Fridge 2">
                                Kitchen Fridge 2
                            </option>
                            <option value="Undercounter Fridge">
                                Undercounter Fridge
                            </option>
                            <option value="Kitchen Freezer">
                                Kitchen Freezer
                            </option>
                            <option value="Dishwasher - Wash Cycle">
                                Dishwasher - Wash Cycle
                            </option>
                            <option value="Dishwasher - Rinse Cycle">
                                Dishwasher - Rinse Cycle
                            </option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Time Checked
                            </label>
                            <input
                                type="time"
                                name="timeChecked"
                                value={formData.timeChecked}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Temp (°C)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                name="temperature"
                                value={formData.temperature}
                                onChange={handleChange}
                                required
                                placeholder="e.g. 3.5"
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors active:scale-95"
                    >
                        Save Record
                    </button>

                    {statusMessage && (
                        <p
                            className={`text-center font-medium mt-2 ${statusMessage.includes('Success') ? 'text-green-600' : statusMessage.includes('⚠️') ? 'text-amber-600' : 'text-red-600'}`}
                        >
                            {statusMessage}
                        </p>
                    )}
                </form>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-6">
                    📋 Temperature Log Overview
                </h3>

                {isLoading ? (
                    <p className="text-slate-500 text-sm text-center py-4">
                        Loading records...
                    </p>
                ) : records.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">
                        No temperatures logged yet.
                    </p>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedRecords).map(([date, units]) => (
                            <div key={date}>
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                                    {date === new Date().toLocaleDateString()
                                        ? '📅 Today'
                                        : `📅 ${date}`}
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(units).map(
                                        ([unitName, checks]) => (
                                            <div
                                                key={unitName}
                                                className="border border-slate-200 rounded-xl p-5 bg-slate-50 hover:shadow-sm transition-shadow"
                                            >
                                                <h5 className="font-bold text-slate-700 mb-4">
                                                    {unitName}
                                                </h5>

                                                <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-3 mb-3">
                                                    <span className="text-slate-500 font-medium">
                                                        ☀️ Morning
                                                    </span>
                                                    {checks.morning ? (
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs text-slate-400 font-medium">
                                                                {
                                                                    checks
                                                                        .morning
                                                                        .timeChecked
                                                                }
                                                            </span>
                                                            <span
                                                                className={`px-2.5 py-1 rounded-md text-sm font-bold shadow-sm ${checks.morning.temperature > 8 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                                                            >
                                                                {
                                                                    checks
                                                                        .morning
                                                                        .temperature
                                                                }
                                                                ºC
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic bg-slate-100 px-2 py-1 rounded">
                                                            Pending
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500 font-medium">
                                                        🌙 Afternoon
                                                    </span>
                                                    {checks.afternoon ? (
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs text-slate-400 font-medium">
                                                                {
                                                                    checks
                                                                        .afternoon
                                                                        .timeChecked
                                                                }
                                                            </span>
                                                            <span
                                                                className={`px-2.5 py-1 rounded-md text-sm font-bold shadow-sm ${checks.afternoon.temperature > 8 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                                                            >
                                                                {
                                                                    checks
                                                                        .afternoon
                                                                        .temperature
                                                                }
                                                                ºC
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic bg-slate-100 px-2 py-1 rounded">
                                                            Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
