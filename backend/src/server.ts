import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import logRoutes from './routes/logRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ==========================================
// ROUTES REGISTER
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ==========================================
// STARTING THE SERVER
// ==========================================
app.listen(port, () => {
    console.log(`🚀 HACCP Pro Server running on port ${port}`);
});
