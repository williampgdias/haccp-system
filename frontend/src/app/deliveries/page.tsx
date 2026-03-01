'use client';

import { useState } from 'react';

export default function DeliveriesPage() {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage('Saving...');

        try {
            const response = await fetch(
                'http://localhost:3001/api/deliveries',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...formData,
                        temperature: parseFloat(formData.temperature) || 0,
                    }),
                },
            );

            if (response.ok) {
                setStatusMessage('✅ Success! Delivery record saved.');
                setFormData({
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
        <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 mt-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
                📦 Log Delivery Record
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div
                    className="
                grid grid-col-1 md:grid-cols-2 gap-5"
                >
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

                {/* Checkboxes Area */}
                <div className="flex flex-col justify-around sm:flex-row gap-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
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

                {/* Full width inputs */}
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

                {/* Submit Area */}
                <div className="mt-2">
                    <button
                        type="submit"
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors active:scale-95"
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
    );
}
