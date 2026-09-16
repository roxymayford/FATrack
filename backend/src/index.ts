import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { subscriptionRouter } from './routes/subscription.js';
import { midtransRouter } from './routes/midtrans.js';
import { errorHandler } from './middleware/errorHandler.js';
import { isSupabaseConfigured } from './lib/supabase.js';
import { isMidtransConfigured } from './lib/midtrans.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'FATrack Financial Advisor API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    features: {
      supabaseConnected: isSupabaseConfigured,
      midtransConnected: isMidtransConfigured,
    },
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/subscription', subscriptionRouter);
app.use('/api/midtrans', midtransRouter);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Kontor API] Server running at http://localhost:${PORT}`);
});
