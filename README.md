# Ink & Echoes

A premium, production-ready digital sanctuary for poetry, thoughts, essays, and encrypted personal journaling. Built with React (Vite), Node (Express), MongoDB Atlas (Mongoose), and Tailwind CSS.

---

## Features

1. **Ink & Verses**: A public poetry catalog organized by emotional context (Love, Heartbreak, Life, Nature, Philosophy, Dreams, Personal) with customizable reading modes (fonts, sizing, and backdrops).
2. **Prose & Reflections**: Long-form essays with estimated reading times, bookmark saving (via browser storage), and related-reading recommendations.
3. **Admin Desk**: Full CRUD control to manage poems and essays, toggle showcase features, pin posts, and check reader inquiries.
4. **Encrypted Vault (Private Journal)**: A highly private journaling space.
   - **Privacy FIRST**: Protected by session token authentication.
   - **Zero-Knowledge Style Storage**: Title and content are encrypted in a combined payload using **AES-256-GCM** before saving to the database. Even database administrators cannot read your reflections.
   - **Streak & Mood Trackers**: Analyzes emotional logs, charts mood distributions, tracks consecutive days writing, and provides poetic reflections.
   - **Autosave & Export**: Autosaves drafts every 10 seconds and allows downloading entries as standard Markdown files.

---

## Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS v4, Framer Motion, React Router, React Query, Axios.
- **Backend**: Node.js, Express.js.
- **Security**: JWT (HttpOnly, Secure Cookies), AES-256-GCM symmetric encryption, bcrypt password hashing, Helmet headers, Rate Limiting.
- **Database**: MongoDB Atlas (with Mongoose) + **Transparent Local File Fallback** (persisting data locally in `backend/data/*.json` if MongoDB is unavailable).

---

## Local Setup & Execution

### Prerequisites
Ensure [Node.js](https://nodejs.org) is installed on your system.

### Installation
From the root directory, run:
```bash
npm run install:all
```
This installs all dependencies across the root, backend, and frontend directories in one command.

### Environment Setup
The backend and frontend are already configured with developer defaults, but you can inspect or modify their variables inside:
- `backend/.env` (contains JWT secrets, ports, and the AES journal encryption key)
- `frontend/.env` (contains the backend API URL reference)

### Run in Development
Start both the Express backend and Vite frontend concurrently by running:
```bash
npm run dev
```

---

## Default Credentials

When the backend runs for the first time, it checks for active users. If empty, it automatically seeds a default administrator profile for evaluation:

- **Email**: `admin@inkandechoes.com`
- **Password**: `adminpassword123`

You can use these credentials by clicking the **Gate** button in the header navigation.

---

## Cryptographic Security Details

Your private journal entries are encrypted using the built-in Node `crypto` library:
- **Algorithm**: `aes-256-gcm`
- **Encryption Key**: A 32-byte key derived via a `SHA-256` hash of your secret `JOURNAL_ENCRYPTION_KEY`.
- **Integrity Check**: An initialization vector (IV, 12 bytes) and authentication tag (16 bytes) are saved with each entry, protecting the cipher against tampering.

---

## Production Deployment

### Frontend (Vercel)
1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` from the `frontend/` directory.
3. Configure `VITE_API_URL` environment variable pointing to your deployed backend.

### Backend (Render / Railway)
1. Deploy the `backend/` directory.
2. Set the environment variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random secret.
   - `JOURNAL_ENCRYPTION_KEY`: A secure random encryption passphrase.
   - `ADMIN_SECRET`: A key for creating additional admin profiles.
   - `NODE_ENV`: `production`
