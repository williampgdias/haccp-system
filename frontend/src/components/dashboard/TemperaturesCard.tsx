import type { TempLog } from '@/types/dashboard';

interface Props {
    isLoading: boolean;
    activity: Record<string, TempLog[]>;
}

export default function TemperaturesCard({ isLoading, activity }: Props) {
    const renderDateHeader = (dateStr: string) => {
        const todayStr = new Date().toLocaleDateString();
        return (
            <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3 mt-4 first:mt-0">
                📅 {dateStr === todayStr ? 'Today' : dateStr}
            </h4>
        );
    };

    // Helper for ISO Date objects
    const formatIsoTo12h = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 flex flex-col h-80 sm:h-96">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                🌡️ Recent Temperatures
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                    <p className="text-slate-400 text-xs sm:text-sm animate-pulse">
                        Loading...
                    </p>
                ) : Object.keys(activity).length === 0 ? (
                    <p className="text-slate-400 text-xs sm:text-sm">
                        No records found.
                    </p>
                ) : (
                    Object.entries(activity).map(([date, items]) => (
                        <div key={date}>
                            {renderDateHeader(date)}
                            <div className="space-y-2 sm:space-y-3">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between items-center bg-slate-50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-100 hover:shadow-sm transition-shadow"
                                    >
                                        <div>
                                            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                                                <p className="font-bold text-slate-700 text-sm">
                                                    {item.equipment?.name ||
                                                        'Equipment'}
                                                </p>
                                                <span
                                                    className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${item.timeChecked === 'Afternoon' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}
                                                >
                                                    {item.timeChecked ||
                                                        'Morning'}
                                                </span>
                                            </div>
                                            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                                By{' '}
                                                <span className="font-bold text-slate-500">
                                                    {item.initials}
                                                </span>{' '}
                                                •{' '}
                                                {formatIsoTo12h(item.createdAt)}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2 sm:px-2.5 py-1 rounded-md text-xs sm:text-sm font-black shadow-sm ${item.temperature > 8 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}
                                        >
                                            {item.temperature}°C
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
