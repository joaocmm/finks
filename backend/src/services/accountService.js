import { v4 as uuid } from 'uuid';
import { config } from '../config.js';
import { readJson, writeJson } from '../utils/fileDb.js';
import { findUserByEmail } from './userService.js';

export async function createAccount({ name, ownerId }) {
  const db = await readJson(config.dataPaths.accounts, { accounts: [] });
  const account = { id: uuid(), name, owners: [ownerId], members: [], createdAt: new Date().toISOString() };
  db.accounts.push(account);
  await writeJson(config.dataPaths.accounts, db);
  return account;
}

export async function listAccountsForUser(userId) {
  const db = await readJson(config.dataPaths.accounts, { accounts: [] });
  return db.accounts.filter(a => a.owners.includes(userId) || a.members.includes(userId));
}

export async function getAccount(accountId) {
  const db = await readJson(config.dataPaths.accounts, { accounts: [] });
  return db.accounts.find(a => a.id === accountId) || null;
}

export async function addMember(accountId, requesterId, email) {
  const db = await readJson(config.dataPaths.accounts, { accounts: [] });
  const acc = db.accounts.find(a => a.id === accountId);
  if (!acc) throw new Error('Conta não encontrada');
  if (!acc.owners.includes(requesterId)) throw new Error('Apenas donos podem adicionar membros');

  const user = await findUserByEmail(email);
  if (!user) throw new Error('Usuário não encontrado');  if (!acc.members.includes(user.id) && !acc.owners.includes(user.id)) {
    acc.members.push(user.id);
    await writeJson(config.dataPaths.accounts, db);
  }
  return acc;
}
