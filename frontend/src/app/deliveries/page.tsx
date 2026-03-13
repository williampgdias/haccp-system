'use client';

import { useEffect, useState } from 'react';

interface DeliveryRecord {
    id: string;
    createdAt: string;
    deliveryDate: string;
    supplierName: string;
    foodItem: string;
    batchCode: string;
    useByDate: string;
    temperature: number;
    isAppearanceAcceptable: boolean;
    isVanChecked: boolean;
    comments: string;
    signature: string;
}

export default function DeliveriesPage() {
    const API_BASE_URL = 'https://haccp-backend-djev.onrender.com/api';

    const [formData, setFormData] = useState({
        deliveryDate: '',
        supplierName: '',
        foodItem: '',
        batchCode: '',
        useByDate: '',
        temperature: '',
        isAppearanceAcceptable: false,
        isVanChecked: false,
        comments: '',
        signature: '',
    });

    const [statusMessage, setStatusMessage] = useState('');
    const [records, setRecords] = useState<DeliveryRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRecords = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/deliveries`, {
                cache: 'no-store',
            });
            if (response.ok) {
                const data = await response.json();
                const sortedData = data.sort(
                    (a: DeliveryRecord, b: DeliveryRecord) =>
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
        const offset = today.getTimezoneOffset() * 60000;
        const localDate = new Date(today.getTime() - offset)
            .toISOString()
            .split('T')[0];
        setFormData((prev) => ({ ...prev, deliveryDate: localDate }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage('Saving...');

        try {
            const response = await fetch(`${API_BASE_URL}/deliveries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    temperature: parseFloat(formData.temperature) || 0,
                }),
            });

            if (response.ok) {
                setStatusMessage('✅ Success! Delivery record saved.');
                setFormData((prev) => ({
                    ...prev,
                    foodItem: '',
                    batchCode: '',
                    useByDate: '',
                    temperature: '',
                    comments: '',
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
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-4 space-y-8">
            {/* FORM */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    📦 Log Delivery Record
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Delivery Date
                            </label>
                            <input
                                type="date"
                                name="deliveryDate"
                                value={formData.deliveryDate}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Supplier Name
                            </label>
                            <input
                                type="text"
                                name="supplierName"
                                value={formData.supplierName}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Tesco"
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Food Item
                            </label>
                            <input
                                type="text"
                                name="foodItem"
                                value={formData.foodItem}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Fresh Chicken"
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Batch Code
                            </label>
                            <input
                                type="text"
                                name="batchCode"
                                value={formData.batchCode}
                                onChange={handleChange}
                                required
                                placeholder="e.g. L12345"
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Use By Date
                            </label>
                            <input
                                type="date"
                                name="useByDate"
                                value={formData.useByDate}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Temperature (°C)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                name="temperature"
                                value={formData.temperature}
                                onChange={handleChange}
                                required
                                placeholder="e.g. 4.0"
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                            />
                        </div>
                    </div>

                    <div className="flex justify-around flex-col sm:flex-row gap-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isAppearanceAcceptable"
                                checked={formData.isAppearanceAcceptable}
                                onChange={handleChange}
                                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-semibold text-slate-700">
                                Appearance Acceptable?
                            </span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isVanChecked"
                                checked={formData.isVanChecked}
                                onChange={handleChange}
                                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-semibold text-slate-700">
                                Van Checked & Clean?
                            </span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Comments / Corrective Actions
                        </label>
                        <textarea
                            name="comments"
                            value={formData.comments}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Any issues with the delivery?"
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 resize-none"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Signature (Initials)
                        </label>
                        <input
                            type="text"
                            name="signature"
                            value={formData.signature}
                            onChange={handleChange}
                            required
                            placeholder="e.g. WD"
                            maxLength={3}
                            className="w-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 uppercase"
                        />
                    </div>

                    <div className="mt-2 text-center">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors active:scale-95"
                        >
                            Save Delivery Record
                        </button>

                        {statusMessage && (
                            <p
                                className={`mt-3 font-medium ${statusMessage.includes('Success') ? 'text-green-600' : 'text-red-600'}`}
                            >
                                {statusMessage}
                            </p>
                        )}
                    </div>
                </form>
            </div>

            {/* Records List */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-6">
                    📋 Recent Deliveries
                </h3>

                {isLoading ? (
                    <p className="text-slate-500 text-sm text-center oy-4">
                        Loading records...
                    </p>
                ) : records.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">
                        No deliveries logged yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {records.map((record) => (
                            <div
                                key={record.id}
                                className="border border-slate-200 rounded-xl p-5 bg-slate-50 hover:shadow-sm transition-shadow"
                            >
                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h5 className="font-bold text-slate-700">
                                            {record.supplierName}
                                        </h5>
                                        <p className="text-sm font-medium text-slate-800">
                                            {record.foodItem}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Delivered:{' '}
                                            {new Date(
                                                record.deliveryDate,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2.5 py-1 rounded-md text-sm font-bold shadow-sm ${record.temperature > 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                                    >
                                        {record.temperature}ºC
                                    </span>
                                </div>

                                {/* Secondary Info */}
                                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-100 mb-4">
                                    <p>
                                        <span className="text-slate-400 block text-xs">
                                            Batch Code
                                        </span>
                                        <span className="font-semibold">
                                            {record.batchCode}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="text-slate-400 block text-xs">
                                            Use By
                                        </span>
                                        <span className="font-semibold">
                                            {new Date(
                                                record.useByDate,
                                            ).toLocaleDateString()}
                                        </span>
                                    </p>
                                </div>

                                {/* Status Labels */}
                                <div className="flex flex-wrap gap-2 text-xs font-medium mb-3">
                                    {/* Appearance */}
                                    <span
                                        className={`px-2 py-1 rounded-md ${record.isAppearanceAcceptable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                    >
                                        {record.isAppearanceAcceptable
                                            ? '✅ Appearance OK'
                                            : '❌ Bad Appearance'}
                                    </span>
                                    {/* Van Checked */}
                                    <span
                                        className={`px-2 py-1 rounded-md ${record.isVanChecked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                    >
                                        {record.isVanChecked
                                            ? '✅ Van Clean'
                                            : '❌ Van Dirty'}
                                    </span>
                                </div>
                                {/* Comments */}
                                {record.comments && (
                                    <p className="text-sm text-slate-500 italic border-t border-slate-200 pt-3">
                                        &quot;{record.comments}&quot;
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
