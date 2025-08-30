import express from 'express';
import { validate } from '../middleware/validate.js';
import { AccountSchema } from '../models/schemas.js';
import { authRequired } from '../middleware/auth.js';
import { createAccount, listAccountsForUser, getAccount, addMember } from '../services/accountService.js';

export const router = express.Router();

router.post('/', authRequired, validate(AccountSchema), async (req, res) => {
  try {
    const account = await createAccount({ name: req.body.name, ownerId: req.user.sub });
    res.status(201).json(account);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', authRequired, async (req, res) => {
  const accounts = await listAccountsForUser(req.user.sub);
  res.json(accounts);
});

router.get('/:accountId', authRequired, async (req, res) => {
  const account = await getAccount(req.params.accountId);
  if (!account) return res.status(404).json({ error: 'Conta não encontrada' });
  const can = account.owners.includes(req.user.sub) || account.members.includes(req.user.sub);
  if (!can) return res.status(403).json({ error: 'Sem acesso' });
  res.json(account);
});

router.post('/:accountId/members', authRequired, async (req, res) => {
  try {
    const account = await addMember(req.params.accountId, req.user.sub, req.body.email);
    res.json(account);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
