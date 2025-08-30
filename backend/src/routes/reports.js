import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { getAccount } from '../services/accountService.js';
import { buildReport } from '../services/reportsService.js';

export const router = express.Router();

router.get('/:accountId/reports', authRequired, async (req, res) => {
  const account = await getAccount(req.params.accountId);
  if (!account) return res.status(404).json({ error: 'Conta não encontrada' });
  const { range = 'custom', from, to } = req.query;
  try {
    const report = await buildReport({ account, userId: req.user.sub, range, from, to });
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
