import { v4 as uuidv4 } from 'uuid';
import { TemperatureLog } from '../entities/TemperatureLog.js';
import { TemperatureRepository } from '../repositories/TemperatureRepository.js';

export class TemperatureService {
    private repository = new TemperatureRepository();

    async createLog(
        equipmentId: string,
        value: number,
        user: string,
    ): Promise<TemperatureLog> {
        // HACCP Rule: Above 5°C in cooling equipment is a critical limit (Danger)
        const status = value > 5 ? 'DANGER' : 'SAFE';

        const newLog: TemperatureLog = {
            id: uuidv4(),
            equipmentId,
            value,
            status,
            recordedBy: user,
            createdAt: new Date().toISOString(),
        };

        await this.repository.save(newLog);
        return newLog;
    }

    async getAllLogs(): Promise<TemperatureLog[]> {
        return await this.repository.findAll();
    }
}
