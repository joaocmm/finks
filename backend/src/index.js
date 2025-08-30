import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';

import { router as authRouter } from './routes/auth.js';
import { router as accountsRouter } from './routes/accounts.js';
import { router as entriesRouter } from './routes/entries.js';
import { router as reportsRouter } from './routes/reports.js';

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors({ origin: '*'}));
app.use(express.json());
app.use(morgan('dev'));

// Healthcheck
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/accounts', entriesRouter);
app.use('/api/accounts', reportsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Budget backend running on http://localhost:${PORT}`);
});
