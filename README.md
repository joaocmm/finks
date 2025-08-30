# Sistema de Orçamento Pessoal — Plano + Passo a passo

Este pacote traz um **MVP funcional** com backend em **Node/Express**, autenticação com **JWT**, persistência em **JSON** (arquivos) e um **frontend** simples em HTML/CSS/JS. No final há instruções para **migrar para MariaDB**.

---

## 1) Passo a passo (sem código)

### Pré‑requisitos
- Node.js 18+
- (Opcional) Postman/Insomnia para testar a API
- Navegador moderno

### Como rodar
1. Em um terminal, entre em `backend/` e instale as dependências:
   ```bash
   npm install
   ```
2. Crie um arquivo `.env` dentro de `backend/` com:
   ```env
   JWT_SECRET=troque-esta-chave
   PORT=3001
   ```
3. Inicie o backend:
   ```bash
   npm run dev
   ```
4. Abra o arquivo `frontend/index.html` no navegador (clique duas vezes ou sirva com qualquer servidor estático).  
   Obs.: o frontend espera que a API esteja em `http://localhost:3001`.

### Fluxo de uso
1. Registre um usuário e faça login.
2. Crie uma **conta de orçamento** (ex.: “Família”, “Pessoal”, “Empresa”).  
   - Você será o **owner**.
   - Adicione membros por e-mail (se já estiverem registrados).
3. Lance **despesas**, **receitas** e **investimentos** na conta selecionada.
4. Use os **filtros** e gere **relatórios** diários/semanais/mensais.

### Boas práticas (aplicadas no projeto)
- Camadas separadas: **rotas → serviços → utilitários**.
- **Validação** com Zod em entradas críticas.
- **JWT** para proteger rotas.
- **CORS + Helmet + Morgan** para segurança/observabilidade.
- **Lock** simples para escrita de arquivos sem colisão (MVP).

---

## 2) Planejamento por etapas (para a IA desenvolver)

### Etapa A — Fundamentos
- [x] Estruturar pastas `backend`, `frontend`, `data`.
- [x] Subir servidor Express com middlewares (helmet, cors, morgan).
- [x] Healthcheck `/api/health`.

### Etapa B — Autenticação e Usuários
- [x] Registro e login (`/api/auth/register`, `/api/auth/login`).
- [x] Hash de senha (bcryptjs) e emissão de JWT.

### Etapa C — Contas colaborativas
- [x] Criar/consultar contas; owners e members.
- [x] Adicionar membro por e-mail (se existir).

### Etapa D — Lançamentos
- [x] CRUD de lançamentos por conta: **expense**, **income**, **investment**.
- [x] Filtros por data, tipo, categoria.

### Etapa E — Relatórios
- [x] Resumo e balanço por período **diário**, **semanal**, **mensal**.
- [x] Totais por **categoria** (despesas).

### Etapa F — Frontend
- [x] Formulários de **registro/login**.
- [x] Seleção/criação de **conta** e convite de **membros**.
- [x] Lançamento de itens e listagem com **exclusão**.
- [x] **Filtros** + painel simples de **relatório**.

### Etapa G — Qualidade e Segurança (sugestões adicionais)
- [ ] Adicionar **rate‑limit** e **CSRF** se publicar em produção.
- [ ] Criar **tests** com Vitest/Jest para serviços.
- [ ] Log estruturado (pino) e métricas (Prometheus).

---

## 3) API (resumo rápido)

Base URL: `http://localhost:3001/api`  
Auth: header `Authorization: Bearer <token>`

- `POST /auth/register` `{ name, email, password }`
- `POST /auth/login` `{ email, password }`
- `GET /accounts` → contas do usuário
- `POST /accounts` `{ name }`
- `GET /accounts/:accountId`
- `POST /accounts/:accountId/members` `{ email }`
- `POST /accounts/:accountId/entries` `{ type, title, amount, category?, date }`
- `GET /accounts/:accountId/entries?from&to&type&category`
- `PUT /accounts/:accountId/entries/:entryId` (parcial)
- `DELETE /accounts/:accountId/entries/:entryId`
- `GET /accounts/:accountId/reports?range=daily|weekly|monthly&from&to`

---

## 4) Migração para MariaDB (etapa final)

### Modelo proposto
- **users**(id PK, name, email UNIQUE, password, created_at)
- **accounts**(id PK, name, created_at)
- **account_users**(account_id FK, user_id FK, role ENUM('owner','member'), PK composto)
- **entries**(id PK, account_id FK, user_id FK, type ENUM('expense','income','investment'), title, amount DECIMAL(14,2), category, date DATETIME, created_at, updated_at)

### Passos (sem código)
1. Subir um MariaDB local (Docker ou servidor).
2. Criar o schema e tabelas conforme modelo.
3. Substituir `utils/fileDb` por camada SQL (ex.: `mysql2`/`sequelize`), mantendo **as mesmas interfaces** dos services.
4. Escrever um **script de migração** que:
   - Lê os arquivos JSON (`users`, `accounts`, `entries`).
   - Insere nas tabelas correspondentes.
5. Fazer **testes de regressão**: as rotas devem responder igual.

### Dica técnica
- Encapsule queries em repositórios (`/src/repositories/*.js`) e injete nos services.
- Isso permite trocar JSON ↔ SQL sem tocar nas rotas.

---

## 5) Próximos incrementos sugeridos
- Categorias customizáveis e orçamentos mensais por categoria.
- Importação de OFX/CSV.
- Dashboard com gráficos.
- Notificações (ex.: gastos acima do orçado).
- 2FA e recuperação de senha.
