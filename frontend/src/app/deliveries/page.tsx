'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../services/api';

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
    
    // State for editing mode
    const [editingId, setEditingId] = useState<string | null>(null);

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

    const getTodayLocalString = () => {
        const today = new Date();
        const offset = today.getTimezoneOffset() * 60000;
        return new Date(today.getTime() - offset).toISOString().split('T')[0];
    };

    useEffect(() => {
        fetchRecords();
        setFormData((prev) => ({ ...prev, deliveryDate: getTodayLocalString() }));
    }, []);

    // Enter Edit Mode
    const handleEditClick = (record: DeliveryRecord) => {
        setEditingId(record.id);
        
        // Extract YYYY-MM-DD for date inputs
        const formatForInput = (dateString: string) => {
            const d = new Date(dateString);
            return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        };

        setFormData({
            deliveryDate: formatForInput(record.deliveryDate),
            supplierName: record.supplierName,
            foodItem: record.foodItem,
            batchCode: record.batchCode,
            useByDate: formatForInput(record.useByDate),
            temperature: record.temperature.toString(),
            isAppearanceAcceptable: record.isAppearanceAcceptable,
            isVanChecked: record.isVanChecked,
            comments: record.comments || '',
            signature: record.signature,
        });
        
        setStatusMessage('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Cancel Edit Mode
    const cancelEdit = () => {
        setEditingId(null);
        setFormData({
            deliveryDate: getTodayLocalString(),
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
        setStatusMessage('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage(editingId ? 'Updating...' : 'Saving...');

        try {
            const method = editingId ? 'PUT' : 'POST';
            const endpoint = editingId 
                ? `${API_BASE_URL}/deliveries/${editingId}` 
                : `${API_BASE_URL}/deliveries`;

            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    temperature: parseFloat(formData.temperature) || 0,
                }),
            });

            if (response.ok) {
                setStatusMessage(editingId ? '✅ Success! Delivery record updated.' : '✅ Success! Delivery record saved.');
                cancelEdit();
                fetchRecords();
                setTimeout(() => setStatusMessage(''), 3000);
            } else {
                setStatusMessage('❌ Error saving record. Try again.');
            }
        } catch (error) {
            setStatusMessage('❌ Failed to connect to server. Is the backend running?');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setStatusMessage('');

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-4 space-y-8">
            <div className={`p-6 md:p-8 rounded-xl shadow-sm border ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    {editingId ? '✏️ Edit Delivery Record' : '📦 Log Delivery Record'}
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
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-around flex-col sm:flex-row gap-6 p-4 bg-white border border-slate-300 rounded-lg">
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

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        <div className="md:col-span-3">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Comments / Corrective Actions
                            </label>
                            <textarea
                                name="comments"
                                value={formData.comments}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Any issues with the delivery?"
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white resize-none"
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
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white uppercase"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 mt-2">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors active:scale-95"
                        >
                            {editingId ? 'Update Delivery Record' : 'Save Delivery Record'}
                        </button>
                        
                        {editingId && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-8 rounded-lg transition-colors active:scale-95"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    {statusMessage && (
                        <p className={`mt-3 font-medium text-center ${statusMessage.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
                            {statusMessage}
                        </p>
                    )}
                </form>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-6">
                    📋 Recent Deliveries
                </h3>

                {isLoading ? (
                    <p className="text-slate-500 text-sm text-center py-4">Loading records...</p>
                ) : records.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">No deliveries logged yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {records.map((record) => (
                            <div
                                key={record.id}
                                className="border border-slate-200 rounded-xl p-5 bg-slate-50 hover:shadow-sm transition-shadow relative"
                            >
                                <button 
                                    onClick={() => handleEditClick(record)}
                                    className="absolute top-5 right-5 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                                    title="Edit Record"
                                >
                                    ✏️
                                </button>
                                
                                <div className="flex justify-between items-start mb-4 pr-8">
                                    <div>
                                        <h5 className="font-bold text-slate-700">
                                            {record.supplierName}
                                        </h5>
                                        <p className="text-sm font-medium text-slate-800">
                                            {record.foodItem}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Delivered:{' '}
                                            {new Date(record.deliveryDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2.5 py-1 rounded-md text-sm font-bold shadow-sm ${record.temperature > 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                                    >
                                        {record.temperature}ºC
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-100 mb-4">
                                    <p>
                                        <span className="text-slate-400 block text-xs">Batch Code</span>
                                        <span className="font-semibold">{record.batchCode}</span>
                                    </p>
                                    <p>
                                        <span className="text-slate-400 block text-xs">Use By</span>
                                        <span className="font-semibold">{new Date(record.useByDate).toLocaleDateString()}</span>
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 text-xs font-medium mb-3">
                                    <span className={`px-2 py-1 rounded-md ${record.isAppearanceAcceptable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {record.isAppearanceAcceptable ? '✅ Appearance OK' : '❌ Bad Appearance'}
                                    </span>
                                    <span className={`px-2 py-1 rounded-md ${record.isVanChecked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {record.isVanChecked ? '✅ Van Clean' : '❌ Van Dirty'}
                                    </span>
                                </div>
                                
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