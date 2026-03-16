import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import authRoutes from './routes/authRoutes.ts';
import groupRoutes from './routes/groupRoutes.ts';
import expenseRoutes from './routes/expenseRoutes.ts';
import settlementRoutes from './routes/settlementRoutes.ts';
import userRoutes from './routes/userRoutes.ts';
import invitationRoutes from './routes/invitationRoutes.ts';
import { errorMiddleware } from './middleware/errorMiddleware.ts';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable trust proxy for secure cookies in production
app.set('trust proxy', 1);

app.use(cookieParser());
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        const allowed = process.env.FRONTEND_URL;
        if (!origin || !allowed) return callback(null, true);
        
        // Remove trailing slashes for comparison
        const normalizedOrigin = origin.replace(/\/$/, '');
        const normalizedAllowed = allowed.replace(/\/$/, '');
        
        if (normalizedOrigin === normalizedAllowed || allowed === '*') {
            callback(null, true);
        } else {
            console.warn(`CORS blocked for origin: ${origin}. Expected: ${allowed}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Server is healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invitations', invitationRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});