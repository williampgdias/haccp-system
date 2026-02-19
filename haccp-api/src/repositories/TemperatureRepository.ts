import fs from 'fs/promises';
import path from 'path';
import { TemperatureLog } from 'src/entities/TemperatureLog';

const DATA_PATH = path.resolve(__dirname, '../data/data.json');

export class TemperatureRepository {
    //Initialize JSON file if it doesn't exist
    private async ensureDataFile() {
        try {
            await fs.access(DATA_PATH);
        } catch {
            await fs.writeFile(DATA_PATH, JSON.stringify({ logs: [] }));
        }
    }

    async findAll(): Promise<TemperatureLog[]> {
        await this.ensureDataFile();
        const data = await fs.readFile(DATA_PATH, 'utf-8');
        return JSON.parse(data).logs;
    }

    async save(log: TemperatureLog): Promise<void> {
        await this.ensureDataFile();
        const data = await this.findAll();
        data.push(log);
        await fs.writeFile(DATA_PATH, JSON.stringify({ logs: data }, null, 2));
    }
}
