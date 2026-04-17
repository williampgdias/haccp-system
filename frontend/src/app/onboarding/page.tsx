'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiFetch } from '@/services/api';

const STEPS = [
    { id: 1, title: 'Add Fridges & Freezers', description: 'Register the cold storage units you monitor daily.' },
    { id: 2, title: 'Add Cleaning Zones', description: 'Define the areas that require cleaning records.' },
    { id: 3, title: 'Add Your First Staff Member', description: 'Invite your team. They\'ll receive login credentials by email.' },
];

export default function OnboardingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const restaurantId = session?.user?.restaurantId;

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Step 1 — Equipment
    const [equipmentName, setEquipmentName] = useState('');
    const [equipmentType, setEquipmentType] = useState<'FRIDGE' | 'FREEZER'>('FRIDGE');
    const [equipmentAdded, setEquipmentAdded] = useState<string[]>([]);

    // Step 2 — Cleaning Areas
    const [areaName, setAreaName] = useState('');
    const [areasAdded, setAreasAdded] = useState<string[]>([]);

    // Step 3 — Staff
    const [staffName, setStaffName] = useState('');
    const [staffEmail, setStaffEmail] = useState('');
    const [staffAdded, setStaffAdded] = useState<string[]>([]);

    const handleAddEquipment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restaurantId) return;
        setIsLoading(true);
        try {
            const res = await apiFetch('/logs/equipment', {
                method: 'POST',
                body: JSON.stringify({ name: equipmentName, type: equipmentType, restaurantId }),
            });
            if (res.ok) {
                setEquipmentAdded((prev) => [...prev, `${equipmentName} (${equipmentType})`]);
                setEquipmentName('');
                toast.success('Equipment added!');
            } else {
                toast.error('Failed to add equipment.');
            }
        } catch {
            toast.error('Server connection error.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddArea = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restaurantId) return;
        setIsLoading(true);
        try {
            const res = await apiFetch('/logs/cleaning-areas', {
                method: 'POST',
                body: JSON.stringify({ name: areaName, restaurantId }),
            });
            if (res.ok) {
                setAreasAdded((prev) => [...prev, areaName]);
                setAreaName('');
                toast.success('Area added!');
            } else {
                toast.error('Failed to add area.');
            }
        } catch {
            toast.error('Server connection error.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restaurantId) return;
        setIsLoading(true);
        try {
            const res = await apiFetch('/team', {
                method: 'POST',
                body: JSON.stringify({ name: staffName, email: staffEmail, restaurantId }),
            });
            if (res.ok) {
                setStaffAdded((prev) => [...prev, staffName]);
                setStaffName('');
                setStaffEmail('');
                toast.success('Staff member added! They\'ll receive an email.');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to add staff.');
            }
        } catch {
            toast.error('Server connection error.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = 'w-full p-3 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-950 font-medium';
    const labelClass = 'text-[10px] font-black text-slate-400 ml-1 uppercase tracking-wide block mb-1';
    const progress = Math.round(((step - 1) / STEPS.length) * 100);

    return (
        <div className="min-h-screen bg-slate-50 flex items-start justify-center p-4 md:p-8 font-sans">
            <div className="w-full max-w-lg">
                {/* HEADER */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">HACCP Pro</h1>
                    <p className="text-slate-500 text-sm mt-1">Let&apos;s set up your kitchen in 3 quick steps.</p>
                </div>

                {/* PROGRESS */}
                <div className="mb-6">
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                        <span>Step {step} of {STEPS.length}</span>
                        <span>{progress}% complete</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* STEPS NAV */}
                <div className="flex gap-2 mb-6">
                    {STEPS.map((s) => (
                        <div
                            key={s.id}
                            className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                                s.id === step
                                    ? 'border-blue-600 bg-blue-50'
                                    : s.id < step
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-slate-200 bg-white'
                            }`}
                        >
                            <p className={`text-[10px] font-black uppercase tracking-wide ${s.id === step ? 'text-blue-600' : s.id < step ? 'text-green-600' : 'text-slate-400'}`}>
                                {s.id < step ? '✓ Done' : `Step ${s.id}`}
                            </p>
                            <p className="text-xs font-bold text-slate-700 mt-0.5 leading-tight">{s.title}</p>
                        </div>
                    ))}
                </div>

                {/* STEP CONTENT */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-black text-slate-900 mb-1">{STEPS[step - 1].title}</h2>
                    <p className="text-sm text-slate-500 mb-6">{STEPS[step - 1].description}</p>

                    {/* STEP 1 — EQUIPMENT */}
                    {step === 1 && (
                        <>
                            <form onSubmit={handleAddEquipment} className="space-y-4 mb-4">
                                <div>
                                    <label className={labelClass}>Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: Walk-in Fridge"
                                        value={equipmentName}
                                        onChange={(e) => setEquipmentName(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Type</label>
                                    <div className="flex gap-3">
                                        {(['FRIDGE', 'FREEZER'] as const).map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setEquipmentType(t)}
                                                className={`flex-1 p-2.5 rounded-lg text-xs font-black border-2 transition-all ${equipmentType === t ? 'border-slate-900 bg-slate-100 text-slate-900' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                                            >
                                                {t === 'FRIDGE' ? '🧊 Fridge' : '❄️ Freezer'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-slate-950 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60"
                                >
                                    {isLoading ? 'Adding...' : '+ Add Equipment'}
                                </button>
                            </form>
                            {equipmentAdded.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {equipmentAdded.map((eq) => (
                                        <span key={eq} className="bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-3 py-1 rounded-full">
                                            ✓ {eq}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* STEP 2 — CLEANING AREAS */}
                    {step === 2 && (
                        <>
                            <form onSubmit={handleAddArea} className="space-y-4 mb-4">
                                <div>
                                    <label className={labelClass}>Area Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: Kitchen Floor"
                                        value={areaName}
                                        onChange={(e) => setAreaName(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-slate-950 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60"
                                >
                                    {isLoading ? 'Adding...' : '+ Add Area'}
                                </button>
                            </form>
                            {areasAdded.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {areasAdded.map((area) => (
                                        <span key={area} className="bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-3 py-1 rounded-full">
                                            ✓ {area}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* STEP 3 — STAFF */}
                    {step === 3 && (
                        <>
                            <form onSubmit={handleAddStaff} className="space-y-4 mb-4">
                                <div>
                                    <label className={labelClass}>Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: John Smith"
                                        value={staffName}
                                        onChange={(e) => setStaffName(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Email</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="john@restaurant.com"
                                        value={staffEmail}
                                        onChange={(e) => setStaffEmail(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-slate-950 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60"
                                >
                                    {isLoading ? 'Adding...' : '+ Add Staff Member'}
                                </button>
                            </form>
                            {staffAdded.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {staffAdded.map((name) => (
                                        <span key={name} className="bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-3 py-1 rounded-full">
                                            ✓ {name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* NAVIGATION */}
                    <div className="flex gap-3 mt-2">
                        {step > 1 && (
                            <button
                                onClick={() => setStep((s) => s - 1)}
                                className="flex-1 border border-slate-300 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-all"
                            >
                                Back
                            </button>
                        )}
                        {step < STEPS.length ? (
                            <button
                                onClick={() => setStep((s) => s + 1)}
                                className="flex-1 bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 transition-all"
                            >
                                {step === 1 && equipmentAdded.length === 0 ? 'Skip for now →' : 'Next →'}
                            </button>
                        ) : (
                            <button
                                onClick={() => router.push('/')}
                                className="flex-1 bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 transition-all"
                            >
                                Go to Dashboard →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
