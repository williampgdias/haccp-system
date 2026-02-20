import { Router } from 'express';
import { TemperatureController } from '../controllers/TemperatureController.js';
import { validate } from '../middlewares/validateResource.js';
import { createTemperatureSchema } from '../schemas/temperature.schema.js';

const router = Router();
const temperatureController = new TemperatureController();

router.post(
    '/',
    validate(createTemperatureSchema),
    temperatureController.createLog,
);

router.get('/', temperatureController.getAllLogs);

export default router;
