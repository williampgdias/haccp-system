export interface TemperatureLog {
    id: string;
    equipmentId: string;
    value: number;
    status: 'SAFE' | 'DANGER';
    recordedBy: string;
    createdAt: string;
}
