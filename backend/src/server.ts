import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { authenticate, authorizeRestaurant } from './middleware/auth.js';

import authRoutes from './routes/authRoutes.js';
import logRoutes from './routes/logRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ==========================================
// PUBLIC ROUTES (no auth needed)
// ==========================================
app.use('/api/auth', authRoutes);

// ==========================================
// PROTECTED ROUTES (auth required)
// ==========================================
app.use('/api/logs', authenticate, authorizeRestaurant, logRoutes);
app.use('/api/team', authenticate, authorizeRestaurant, teamRoutes);
app.use('/api/dashboard', authenticate, authorizeRestaurant, dashboardRoutes);
app.use('/api/reports', authenticate, authorizeRestaurant, reportRoutes);

// ==========================================
// STARTING THE SERVER
// ==========================================
app.listen(port, () => {
    console.log(`🚀 HACCP Pro Server running on port ${port}`);
});
