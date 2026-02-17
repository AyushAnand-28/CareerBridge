import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prisma from './utils/prisma';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/', (req, res) => {
    res.send('CareerBridge API is running');
});

// Test DB Connection
app.get('/test-db', async (req, res) => {
    try {
        const userCount = await prisma.user.count();
        res.json({ message: 'Database connection successful', userCount });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
