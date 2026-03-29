export interface TempLog {
    id: string;
    createdAt: string;
    temperature: number;
    timeChecked: string;
    initials: string;
    equipment: { name: string };
}

export interface CookingLog {
    id: string;
    createdAt: string;
    foodItem: string;
    initials: string;
    cookTemp?: number;
    reheatTemp?: number;
    cookTime?: string;
    reheatTime?: string;
    coolingFinishTime?: string;
}

export interface DeliveryLog {
    id: string;
    createdAt: string;
    supplier: string;
    invoiceNumber?: string;
    temperature: string;
}

export interface CleaningLog {
    id: string;
    createdAt: string;
    area: string;
    initials: string;
    status: string;
}

export type AnyLog = TempLog | CookingLog | DeliveryLog | CleaningLog;
