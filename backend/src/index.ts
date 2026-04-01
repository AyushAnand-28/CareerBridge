import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import prisma from './utils/prisma';
import authRouter from './routes/auth';
import jobsRouter from './routes/jobs';
import applicationsRouter from './routes/applications';
import profileRouter from './routes/profile';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map(o => o.trim());

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, Render health checks)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin '${origin}' not allowed`));
        }
    },
    credentials: true,
}));

app.use(express.json());

// ─── Health / Liveness ─────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// ─── Meta ──────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
    res.json({ message: 'CareerBridge API is running', version: '1.0.0' });
});

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/profile', profileRouter);

// ─── 404 ───────────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ──────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Error]', err.message);
    const status = (err as { status?: number }).status ?? 500;
    res.status(status).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
});

// ─── Server ────────────────────────────────────────────────────────────────
const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV ?? 'development'}`);
    console.log(`   CORS origin : ${allowedOrigins.join(', ')}`);
});

// ─── Graceful Shutdown (required by Render / Docker) ──────────────────────
async function shutdown(signal: string) {
    console.log(`\n${signal} received — shutting down gracefully…`);
    server.close(async () => {
        await prisma.$disconnect();
        console.log('Database disconnected. Bye!');
        process.exit(0);
    });
    // Force exit after 10 s if shutdown stalls
    setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
