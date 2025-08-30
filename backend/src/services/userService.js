import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { config } from '../config.js';
import { readJson, writeJson } from '../utils/fileDb.js';
import { hashPassword, comparePassword } from '../security/password.js';

export async function findUserByEmail(email) {
  const db = await readJson(config.dataPaths.users, { users: [] });
  return db.users.find(u => u.email.toLowerCase() == email.toLowerCase()) || null;
}

export async function createUser({ name, email, password }) {
  const db = await readJson(config.dataPaths.users, { users: [] });
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('E-mail já cadastrado');
  }
  const user = { id: uuid(), name, email, password: await hashPassword(password), createdAt: new Date().toISOString() };
  db.users.push(user);
  await writeJson(config.dataPaths.users, db);
  return { id: user.id, name: user.name, email: user.email };
}

export function issueToken(user) {
  const payload = { sub: user.id, name: user.name, email: user.email };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '8h' });
  return token;
}

export async function login({ email, password }) {
  const db = await readJson(config.dataPaths.users, { users: [] });
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error('Credenciais inválidas');
  const ok = await comparePassword(password, user.password);
  if (!ok) throw new Error('Credenciais inválidas');
  return { id: user.id, name: user.name, email: user.email };
}
