import { promises as fs } from 'fs';

// Simple in-memory mutex per file to avoid concurrent writes
const locks = new Map();
const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function acquireLock(key, timeoutMs = 2000) {
  const start = Date.now();
  while (locks.get(key)) {
    if (Date.now() - start > timeoutMs) throw new Error('Lock timeout');
    await wait(10);
  }
  locks.set(key, true);
}

function releaseLock(key) {
  locks.delete(key);
}

export async function readJson(path, fallback) {
  try {
    const data = await fs.readFile(path, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT' && fallback !== undefined) {
      await writeJson(path, fallback);
      return fallback;
    }
    throw err;
  }
}

export async function writeJson(path, data) {
  const key = path;
  await acquireLock(key);
  try {
    const tmp = JSON.stringify(data, null, 2);
    await fs.writeFile(path, tmp, 'utf-8');
  } finally {
    releaseLock(key);
  }
}
