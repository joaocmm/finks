import express from 'express';
import { validate } from '../middleware/validate.js';
import { EntrySchema, QueryFiltersSchema } from '../models/schemas.js';
import { authRequired } from '../middleware/auth.js';
import { getAccount } from '../services/accountService.js';
import { addEntry, listEntries, updateEntry, deleteEntry } from '../services/entryService.js';

export const router = express.Router();

router.post('/:accountId/entries', authRequired, validate(EntrySchema), async (req, res) => {
  const account = await getAccount(req.params.accountId);
  if (!account) return res.status(404).json({ error: 'Conta não encontrada' });
  try {
    const entry = await addEntry({ account, userId: req.user.sub, data: req.body });
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:accountId/entries', authRequired, async (req, res) => {
  const account = await getAccount(req.params.accountId);
  if (!account) return res.status(404).json({ error: 'Conta não encontrada' });
  const filtersResult = QueryFiltersSchema.safeParse(req.query);
  if (!filtersResult.success) return res.status(400).json({ error: filtersResult.error.flatten() });
  try {
    const items = await listEntries({ account, userId: req.user.sub, filters: filtersResult.data });
    res.json(items);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:accountId/entries/:entryId', authRequired, async (req, res) => {
  const account = await getAccount(req.params.accountId);
  if (!account) return res.status(404).json({ error: 'Conta não encontrada' });
  try {
    const updated = await updateEntry({ account, userId: req.user.sub, entryId: req.params.entryId, patch: req.body });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:accountId/entries/:entryId', authRequired, async (req, res) => {
  const account = await getAccount(req.params.accountId);
  if (!account) return res.status(404).json({ error: 'Conta não encontrada' });
  try {
    await deleteEntry({ account, userId: req.user.sub, entryId: req.params.entryId });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
