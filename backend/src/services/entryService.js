import { v4 as uuid } from 'uuid';
import { config } from '../config.js';
import { readJson, writeJson } from '../utils/fileDb.js';
import { isWithinInterval, parseISO } from 'date-fns';

function canAccess(account, userId) {
  return account.owners.includes(userId) || account.members.includes(userId);
}

export async function addEntry({ account, userId, data }) {
  if (!canAccess(account, userId)) throw new Error('Sem acesso a esta conta');
  const db = await readJson(config.dataPaths.entries, { entries: [] });
  const entry = {
    id: uuid(),
    accountId: account.id,
    createdBy: userId,
    ...data,
    amount: Number(data.amount),
    date: new Date(data.date || Date.now()).toISOString(),
    createdAt: new Date().toISOString()
  };
  db.entries.push(entry);
  await writeJson(config.dataPaths.entries, db);
  return entry;
}

export async function listEntries({ account, userId, filters = {} }) {
  if (!canAccess(account, userId)) throw new Error('Sem acesso a esta conta');
  const db = await readJson(config.dataPaths.entries, { entries: [] });
  let result = db.entries.filter(e => e.accountId === account.id);

  if (filters.type) result = result.filter(e => e.type === filters.type);
  if (filters.category) result = result.filter(e => (e.category || '') === filters.category);
  const from = filters.from ? parseISO(filters.from) : null;
  const to = filters.to ? parseISO(filters.to) : null;
  if (from && to) {
    result = result.filter(e => isWithinInterval(parseISO(e.date), { start: from, end: to }));
  } else if (from) {
    result = result.filter(e => parseISO(e.date) >= from);
  } else if (to) {
    result = result.filter(e => parseISO(e.date) <= to);
  }
  return result.sort((a,b) => new Date(b.date) - new Date(a.date));
}

export async function updateEntry({ account, userId, entryId, patch }) {
  if (!canAccess(account, userId)) throw new Error('Sem acesso a esta conta');
  const db = await readJson(config.dataPaths.entries, { entries: [] });
  const idx = db.entries.findIndex(e => e.id === entryId && e.accountId === account.id);
  if (idx === -1) throw new Error('Lançamento não encontrado');
  db.entries[idx] = { ...db.entries[idx], ...patch, updatedAt: new Date().toISOString() };
  await writeJson(config.dataPaths.entries, db);
  return db.entries[idx];
}

export async function deleteEntry({ account, userId, entryId }) {
  if (!canAccess(account, userId)) throw new Error('Sem acesso a esta conta');
  const db = await readJson(config.dataPaths.entries, { entries: [] });
  const before = db.entries.length;
  db.entries = db.entries.filter(e => !(e.id === entryId && e.accountId === account.id));
  if (db.entries.length === before) throw new Error('Lançamento não encontrado');
  await writeJson(config.dataPaths.entries, db);
  return true;
}
