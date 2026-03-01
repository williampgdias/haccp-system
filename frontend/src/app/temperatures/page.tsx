'use client';

import { useState } from 'react';

export default function TemperaturesPage() {
    const [formData, setFormData] = useState({
        unitName: '',
        timeChecked: '',
        temperature: '',
    });

    const [statusMessage, setStatusMessage] = useState('');

    // Function triggered when the user click 'Save Record'
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage('Saving...');

        try {
            //Sending the data to Backend
            const response = await fetch(
                'http://localhost:3001/api/daily-temperatures',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        unitName: formData.timeChecked,
                        timeChecked: formData.timeChecked,
                        temperature: parseFloat(formData.temperature),
                    }),
                },
            );

            if (response.ok) {
                setStatusMessage('✅ Success! Record saved.');
                setFormData({ unitName: '', timeChecked: '', temperature: '' });
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
        <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 mt-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
                🌡️ Log Daily Temperature
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Unit Name Dropdown */}
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
                        <option value="Kitchen Freezer">Kitchen Freezer</option>
                        <option value="Dishwasher - Wash Cycle">
                            Dishwasher - Wash Cycle
                        </option>
                        <option value="Dishwasher - Rinse Cycle">
                            Dishwasher - Rinse Cycle
                        </option>
                    </select>
                </div>

                <div className="flex gap-4 justify-between">
                    {/* Time Input */}
                    <div className="w-full">
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

                    {/* Temperature Input */}
                    <div className="w-full">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Temperature (°C)
                        </label>
                        <input
                            type="number"
                            step="0.1" // Allows decimals like 3.5
                            name="temperature"
                            value={formData.temperature}
                            onChange={handleChange}
                            required
                            placeholder="e.g. 3.5"
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors active:scale-95"
                >
                    Save Record
                </button>

                {/* Feedback Message */}
                {statusMessage && (
                    <p
                        className={`text-center font-medium mt-2 ${statusMessage.includes('Success') ? 'text-green-600' : 'text-red-600'}`}
                    >
                        {statusMessage}
                    </p>
                )}
            </form>
        </div>
    );
}
