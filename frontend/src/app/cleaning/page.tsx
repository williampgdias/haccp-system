'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../services/api';

interface CleaningRecord {
    id: string;
    createdAt: string;
    weekEndingDate: string;
    dateCleaned: string;
    equipmentName: string;
    cleanedBy: string;
}

export default function CleaningPage() {
    const [formData, setFormData] = useState({
        weekEndingDate: '',
        dateCleaned: '',
        equipmentName: '',
        cleanedBy: '',
    });

    const [statusMessage, setStatusMessage] = useState('');
    const [records, setRecords] = useState<CleaningRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRecords = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/cleaning`, {
                cache: 'no-store',
            });
            if (response.ok) {
                const data = await response.json();
                // Ordena para mostrar os mais recentes primeiro
                const sortedData = data.sort(
                    (a: CleaningRecord, b: CleaningRecord) =>
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

        const today = new Date();
        const dayOfWeek = today.getDay();
        const distanceToFriday = (5 - dayOfWeek + 7) % 7;

        const friday = new Date(today);
        friday.setDate(today.getDate() + distanceToFriday);

        const formatYMD = (date: Date) => {
            const offset = date.getTimezoneOffset() * 60000;
            const localDate = new Date(date.getTime() - offset);
            return localDate.toISOString().split('T')[0];
        };

        setFormData((prev) => ({
            ...prev,
            weekEndingDate: formatYMD(friday),
            dateCleaned: formatYMD(today),
        }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage('Saving...');

        try {
            const response = await fetch(`${API_BASE_URL}/cleaning`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatusMessage('✅ Success! Cleaning task recorded.');
                setFormData((prev) => ({
                    ...prev,
                    equipmentName: '',
                    cleanedBy: '',
                }));

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
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-4xl mx-auto mt-4 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    ✨ Log Cleaning Task
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Week Ending (Friday)
                            </label>
                            <input
                                type="date"
                                name="weekEndingDate"
                                value={formData.weekEndingDate}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-100 text-slate-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Date Cleaned
                            </label>
                            <input
                                type="date"
                                name="dateCleaned"
                                value={formData.dateCleaned}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Equipment / Area
                        </label>
                        <select
                            name="equipmentName"
                            value={formData.equipmentName}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                        >
                            <option value="">
                                Select an area or equipment...
                            </option>
                            <option value="Dishwasher">Dishwasher</option>
                            <option value="Combi Oven">Combi Oven</option>
                            <option value="Fridges & Freezers">
                                Fridges & Freezers
                            </option>
                            <option value="Preparation Tables">
                                Preparation Tables
                            </option>
                            <option value="Sinks">Sinks</option>
                            <option value="Floors & Walls">
                                Floors & Walls
                            </option>
                            <option value="Extractor Canopy">
                                Extractor Canopy
                            </option>
                            <option value="Microwaves">Microwaves</option>
                            <option value="Bins & Waste Area">
                                Bins & Waste Area
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Cleaned By (Initials)
                        </label>
                        <input
                            type="text"
                            name="cleanedBy"
                            value={formData.cleanedBy}
                            onChange={handleChange}
                            required
                            placeholder="e.g. WD"
                            maxLength={3}
                            className="w-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 uppercase"
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors active:scale-95"
                    >
                        Save Cleaning Record
                    </button>

                    {statusMessage && (
                        <p
                            className={`text-center font-medium mt-2 ${statusMessage.includes('Success') ? 'text-green-600' : 'text-red-600'}`}
                        >
                            {statusMessage}
                        </p>
                    )}
                </form>
            </div>

            {/* Records List */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-6">
                    📋 Recent Cleaning Tasks
                </h3>

                {isLoading ? (
                    <p className="text-slate-500 text-sm text-center py-4">
                        Loading records...
                    </p>
                ) : records.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">
                        No cleaning tasks logged yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {records.map((record) => (
                            <div
                                key={record.id}
                                className="border border-slate-200 rounded-xl p-5 bg-slate-50 hover:shadow-sm transition-shadow flex flex-col justify-between min-h-[140px]"
                            >
                                <div>
                                    <h5 className="font-bold text-slate-800 text-lg mb-1">
                                        {record.equipmentName}
                                    </h5>
                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                        <span>🧼</span>{' '}
                                        {new Date(
                                            record.dateCleaned,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex justify-between items-end mt-4">
                                    <div className="text-xs text-slate-400">
                                        Week ending:
                                        <br />
                                        <span className="font-medium text-slate-500">
                                            {new Date(
                                                record.weekEndingDate,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-lg border border-blue-200 uppercase">
                                        {record.cleanedBy}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
