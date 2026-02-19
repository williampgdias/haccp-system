import express from 'express';
import cors from 'cors';
import temperatureRoutes from './routes/temperature.routes.js';

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'OK', uptime: process.uptime() });
});

// Register API Routes
app.use('/logs/temperature', temperatureRoutes);

// Start Server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 HACCP API running on http://localhost:${PORT}`);
});
