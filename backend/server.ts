import express, { type Request, type Response } from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// --- TYPES & INTERFACES ---
interface DailyTemperature {
    id: string;
    createdAt: string;
    unitName: string;
    timeChecked: string;
    temperature: number;
}

interface DeliveryRecord {
    id: string;
    createdAt: string;
    deliveryDate: string;
    foodItem: string;
    batchCode: string;
    supplierName: string;
    useByDate: string;
    temperature: number;
    isAppearanceAcceptable: boolean;
    isVanChecked: boolean;
    comments: string;
    signature: string;
}

interface CleaningRecord {
    id: string;
    createdAt: string;
    weekEndingDate: string;
    dateCleaned: string;
    equipmentName: string;
    cleanedBy: string;
}

// --- IN-MEMORY DATABASE (MVP) ---
let dailyTemperatures: DailyTemperature[] = [];
let deliveryRecords: DeliveryRecord[] = [];
let cleaningRecords: CleaningRecord[] = [];

// --- ROUTES FOR DAILY TEMPERATURES ---

/**
 * GET /api/daily-temperatures
 */
app.get('/api/daily-temperatures', (req: Request, res: Response) => {
    res.status(200).json(dailyTemperatures);
});

/**
 * POST /api/daily-temperatures
 */
app.post('/api/daily-temperatures', (req: Request, res: Response) => {
    const newRecord: Partial<DailyTemperature> = req.body;

    if (!newRecord || Object.keys(newRecord).length === 0) {
        res.status(400).json({ error: 'Missing record data' });
        return;
    }

    //Creating the final object strictly following the DailyTemperature interface
    const recordToSave: DailyTemperature = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        unitName: newRecord.unitName || 'Unknown Unit',
        timeChecked: newRecord.timeChecked || '00:00',
        temperature: newRecord.temperature || 0,
    };

    dailyTemperatures.push(recordToSave);
    res.status(201).json(recordToSave);
});

// --- ROUTES FOR DELIVERIES ---

/**
 * GET /api/deliveries
 * Retrieves all saved delivery records.
 */
app.get('/api/deliveries', (req: Request, res: Response) => {
    res.status(200).json(deliveryRecords);
});

/**
 * POST /api/deliveries
 * Receives a new delivery record from the frontend and saves it.
 */
app.post('/api/deliveries', (req: Request, res: Response) => {
    const newRecord: Partial<DeliveryRecord> = req.body;

    if (!newRecord || Object.keys(newRecord).length === 0) {
        res.status(400).json({ error: 'Missing delivery data' });
        return;
    }

    const recordToSave: DeliveryRecord = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        deliveryDate: newRecord.deliveryDate || '',
        foodItem: newRecord.foodItem || '',
        batchCode: newRecord.batchCode || '',
        supplierName: newRecord.supplierName || '',
        useByDate: newRecord.useByDate || '',
        temperature: newRecord.temperature || 0,
        isAppearanceAcceptable: newRecord.isAppearanceAcceptable || false,
        isVanChecked: newRecord.isVanChecked || false,
        comments: newRecord.comments || '',
        signature: newRecord.signature || '',
    };

    deliveryRecords.push(recordToSave);
    res.status(201).json(recordToSave);
});

// --- ROUTES FOR CLEANING SCHEDULE ---

/**
 * GET /api/cleaning
 * Retrieves all saved cleaning records.
 */
app.get('/api/cleaning', (req: Request, res: Response) => {
    res.status(200).json(cleaningRecords);
});

/**
 * POST /api/cleaning
 * Receives a new cleaning record from the frontend and saves it.
 */
app.post('/api/cleaning', (req: Request, res: Response) => {
    const newRecord: Partial<CleaningRecord> = req.body;

    if (!newRecord || Object.keys(newRecord).length === 0) {
        res.status(400).json({ error: 'Missing cleaning data' });
        return;
    }

    const recordToSave: CleaningRecord = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        weekEndingDate: newRecord.weekEndingDate || '',
        dateCleaned: newRecord.dateCleaned || '',
        equipmentName: newRecord.equipmentName || 'Unknown Equipment',
        cleanedBy: newRecord.cleanedBy || '',
    };

    cleaningRecords.push(recordToSave);
    res.status(201).json(recordToSave);
});

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'API is running properly' });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
