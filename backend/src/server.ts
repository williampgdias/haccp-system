import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ==========================================
// ROUTES REGISTER
// ==========================================
app.use('/api', authRoutes);

// ==========================================
// STARTING THE SERVER
// ==========================================
app.listen(port, () => {
    console.log(`🚀 HACCP Pro Server running on port ${port}`);
});
