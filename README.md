# Secure Vault

A premium, secure document approval system.

## Project Structure

- `/client`: React + Vite frontend
- `/server`: Node.js + Express + Prisma (SQLite) backend

## Quick Start

1. **Install Dependencies**
   ```bash
   npm run install-all
   ```

2. **Set up Environment**
   - Backend: Create `server/.env` (see `server/.env.example` OR use current `.env`)
   - Ensure you have `JWT_SECRET` and `DATABASE_URL` set.

3. **Database Setup**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   ```

4. **Run Application**
   From the root directory:
   ```bash
   npm start
   ```

## Admin Setup

Use the Master Key system implemented in the admin controller to bootstrap the first administrator account if needed.
