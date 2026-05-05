# Restaurant Reservation System

Sistema de reservas para restaurantes com painel administrativo.

## Stack

- **Frontend:** React 18 + React Router + Vite
- **Backend:** Express + SQLite (better-sqlite3)
- **Auth:** JWT + Google OAuth

## Funcionalidades

- Cadastro e login (email + Google)
- Reserva em 3 etapas: data/pessoas → horário → mesa
- Visualização e cancelamento de reservas
- Painel admin: gerenciar reservas, mesas e configurações

## Como rodar

```bash
# Server
cd server
cp .env.example .env  # configure GOOGLE_CLIENT_ID
npm install
npm run dev

# Client (outro terminal)
cd client
cp .env.example .env  # configure VITE_GOOGLE_CLIENT_ID
npm install
npm run dev
```

O Vite faz proxy de `/api` para `localhost:4000`.

## Credenciais padrão

| Papel  | Email                 | Senha    |
|--------|-----------------------|----------|
| Admin  | admin@restaurante.com | admin123 |
| Usuário| joao@teste.com        | 123456   |
