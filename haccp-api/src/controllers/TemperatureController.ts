import { Request, Response } from 'express';
import { TemperatureService } from '../services/TemperatureService.js';

export class TemperatureController {
    // Instantiate the service
    private tempService = new TemperatureService();

    createLog = async (req: Request, res: Response): Promise<void> => {
        try {
            const { equipmentId, value, user } = req.body;

            const log = await this.tempService.createLog(
                equipmentId,
                value,
                user,
            );
            res.status(201).json(log);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to save temperature log' });
        }
    };

    getAllLogs = async (req: Request, res: Response): Promise<void> => {
        try {
            const logs = await this.tempService.getAllLogs();
            res.json(logs);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch temperature los' });
        }
    };
}
