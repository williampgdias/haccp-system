import { TemperatureLog } from '../entities/TemperatureLog';
import { TemperatureRepository } from '../repositories/TemperatureRepository';
import { v4 as uuidv4 } from 'uuid';

export class TemperatureService {
    private repository = new TemperatureRepository();

    async createLog(
        equipmentId: string,
        value: number,
        user: string,
    ): Promise<TemperatureLog> {
        const status = value > 5 ? 'DANGER' : 'SAFE';

        const newLog: TemperatureLog = {
            id: Math.random().toString(36).substr(2, 9),
            equipmentId,
            value,
            status,
            recordedBy: user,
            createdAt: new Date(),
        };

        await this.repository.save(newLog);
        return newLog;
    }

    async getAllLogs() {
        return await this.repository.findAll();
    }
}
