import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prisma from './utils/prisma';
import authRouter from './routes/auth';
import jobsRouter from './routes/jobs';
import applicationsRouter from './routes/applications';
import profileRouter from './routes/profile';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// Health Check
app.get('/', (_req, res) => {
    res.json({ message: 'CareerBridge API is running', version: '1.0.0' });
});

// Test DB Connection
app.get('/test-db', async (_req, res) => {
    try {
        const userCount = await prisma.user.count();
        res.json({ message: 'Database connection successful', userCount });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/profile', profileRouter);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
