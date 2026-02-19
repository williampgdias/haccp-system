import { Router } from 'express';
import { TemperatureController } from '../controllers/TemperatureController.js';

const router = Router();
const temperatureController = new TemperatureController();

// Map the HTTP methods to the Controller functions
router.post('/', temperatureController.createLog);
router.get('/', temperatureController.getAllLogs);

export default router;
