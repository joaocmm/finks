export const config = {
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  dataPaths: {
    users: new URL('../data/usuarios.json', import.meta.url).pathname,
    accounts: new URL('../data/accounts.json', import.meta.url).pathname,
    entries: new URL('../data/entries.json', import.meta.url).pathname,
  }
};
