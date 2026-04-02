import { useState } from 'react';
import { downloadReport } from '@/services/api';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

type Props = {
    reportType: 'temperatures' | 'deliveries' | 'cleaning' | 'cooking';
};

export default function ExportPDF({ reportType }: Props) {
    const { data: session } = useSession();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    async function handleExportPDF() {
        const restaurantId = session?.user?.restaurantId;
        if (!restaurantId) return;

        try {
            await downloadReport(reportType, restaurantId, startDate, endDate);
        } catch (error) {
            toast.error('Failed to generate PDF.');
        }
    }

    return (
        <div className="flex items-center gap-2 mb-2 sm:mb-4">
            <div className="flex gap-2">
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-slate-300 rounded-lg p-2 text-xs text-slate-600 outline-none focus:ring-2 focus:ring-slate-950"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-slate-300 rounded-lg p-2 text-xs text-slate-600 outline-none focus:ring-2 focus:ring-slate-950"
                />
            </div>
            <button
                onClick={handleExportPDF}
                className="border border-slate-300 text-slate-600 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-slate-50 transition-all"
            >
                Download PDF
            </button>
        </div>
    );
}
