import type { CookingLog } from '@/types/dashboard';

interface Props {
    isLoading: boolean;
    activity: Record<string, CookingLog[]>;
}

export default function CookingCard({ isLoading, activity }: Props) {
    const renderDateHeader = (dateStr: string) => {
        const todayStr = new Date().toLocaleDateString();
        return (
            <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3 mt-4 first:mt-0">
                📅 {dateStr === todayStr ? 'Today' : dateStr}
            </h4>
        );
    };

    const formatTimeStr12h = (time24: string) => {
        if (!time24) return '';
        const [h, m] = time24.split(':');
        const hours = parseInt(h, 10);
        const suffix = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        return `${hours12}:${m} ${suffix}`;
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 flex flex-col h-80 sm:h-96">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                👨‍🍳 Cooking & Cooling
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
                                {items.map((item) => {
                                    const isCooking = !!item.cookTemp;
                                    const temp = isCooking
                                        ? item.cookTemp
                                        : item.reheatTemp;
                                    const time = isCooking
                                        ? item.cookTime
                                        : item.reheatTime;
                                    const isSafe = (temp ?? 0) >= 75;

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex justify-between items-center bg-slate-50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-100 hover:shadow-sm transition-shadow"
                                        >
                                            <div>
                                                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                                                    <p className="font-bold text-slate-700 text-sm">
                                                        {item.foodItem}
                                                    </p>
                                                    <span
                                                        className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${isCooking ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}
                                                    >
                                                        {isCooking
                                                            ? 'Cooking'
                                                            : 'Reheating'}
                                                    </span>
                                                </div>
                                                <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                                    By{' '}
                                                    <span className="font-bold text-slate-500">
                                                        {item.initials}
                                                    </span>{' '}
                                                    •{' '}
                                                    {formatTimeStr12h(
                                                        time ?? '',
                                                    )}
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-end gap-1">
                                                <span
                                                    className={`px-2 sm:px-2.5 py-1 rounded-md text-xs sm:text-sm font-black shadow-sm border ${isSafe ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}
                                                >
                                                    {temp}°C
                                                </span>
                                                {item.coolingFinishTime && (
                                                    <span className="text-[8px] sm:text-[9px] font-bold text-blue-500 uppercase flex items-center gap-1 mt-0.5">
                                                        Cooled ❄️
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
