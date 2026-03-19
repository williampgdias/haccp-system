/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SettingPage() {
    const { data: session } = useSession();
    const [equipmentName, setEquipmentName] = useState('');

    async function addEquipment(e: React.FormEvent) {
        e.preventDefault();
        if (!session?.user) return;

        const res = await fetch('http://localhost:3001/api/logs/equipment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: equipmentName,
                type: 'FRIDGE',
                restaurantId: (session.user as any).restaurantId,
            }),
        });

        if (res.ok) {
            toast.success('Equipment added successfully!');
            setEquipmentName('');
        }
    }

    return (
        <div className="p-8 mx-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Kitchen Setup ⚙️</h1>
            <form
                onSubmit={addEquipment}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
            >
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Add New Fridge/Freezer
                </label>
                <div className="flex gap-2">
                    <input
                        value={equipmentName}
                        onChange={(e) => setEquipmentName(e.target.value)}
                        placeholder="Ex: Dairy Fridge"
                        className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">
                        Add
                    </button>
                </div>
            </form>
        </div>
    );
}
