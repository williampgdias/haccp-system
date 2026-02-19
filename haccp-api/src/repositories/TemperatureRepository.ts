import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { TemperatureLog } from '../entities/TemperatureLog.js';

// Utilitários para simular __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho absoluto para o arquivo de dados
const DATA_PATH = path.resolve(__dirname, '../data/data.json');

export class TemperatureRepository {
    private async ensureDataFile() {
        try {
            await fs.access(DATA_PATH);
        } catch {
            console.log('Creating data directory and file at:', DATA_PATH);
            // Cria a pasta data caso ela não exista
            await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
            // Cria o arquivo com um array de logs vazio
            await fs.writeFile(
                DATA_PATH,
                JSON.stringify({ logs: [] }, null, 2),
            );
        }
    }

    async findAll(): Promise<TemperatureLog[]> {
        await this.ensureDataFile();
        const data = await fs.readFile(DATA_PATH, 'utf-8');
        const parsed = JSON.parse(data);
        return parsed.logs;
    }

    async save(log: TemperatureLog): Promise<void> {
        await this.ensureDataFile();
        const logs = await this.findAll();
        logs.push(log);
        await fs.writeFile(DATA_PATH, JSON.stringify({ logs }, null, 2));
    }
}
