# Health Archetypes Demo

A fast, privacy-first, no-login web demo where users connect their wearable, get a one-of-a-kind **Health Archetype**, and copy a beautifully generated card to share with friends.

## Project Setup

1.  **Install root dependencies:**
    ```bash
    npm install
    ```

2.  **Set up environment variables:**
    Copy `.env.example` to `.env` and fill in your API keys:
    ```bash
    cp .env.example .env
    ```

3.  **Install client dependencies:**
    ```bash
    npm install --prefix client
    ```

4.  **Install server dependencies:**
    ```bash
    npm install --prefix server
    ```

## Development

To run both the client (Vite) and server (Node.js/Express) concurrently in development mode:

```bash
npm run dev
```

This will typically start:
- The frontend on `http://localhost:5173` (or next available port)
- The backend on `http://localhost:3000` (or as configured)

## Building for Production

```bash
npm run build
```

This will build the client application and transpile the server code.

To start the server after building:
```bash
npm run start:server
``` 