# 🧬 Health Archetypes - Local Demo

A fast, privacy-first, no-login web demo where users connect their wearable, get a one-of-a-kind **Health Archetype** (text + avatar image), and can copy/download a beautifully generated card to share.

**Core Experience:**
1. User connects their wearable (via Terra).
2. AI analyzes their health data.
3. A custom archetype + avatar is generated.
4. All data is session-based and processed in memory; nothing is saved.

## ✨ Features
- **No Login Required:** Privacy-first, session-based experience.
- **Personalized Archetype:** AI-generated health persona based on real wearable data.
- **Image Generation:** Unique avatar created for each archetype.
- **Data Ephemerality:** User data is processed locally and not stored.
- **Shareable Card:** Download your archetype card as a PNG.

## 🧱 Tech Stack
- **Frontend:** React (Vite), Chakra UI, Framer Motion, TypeScript
- **Backend:** Node.js, Express, TypeScript
- **APIs:** Terra (wearable data), OpenAI (LLM for text and DALL-E 3 for image generation)
- **Data Handling:** In-memory JSON for session management (no database).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- npm (or yarn)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd health-archetypes-demo 
```
(Replace `<repository-url>` with the actual URL of your repository)

### 2. Install Dependencies
Install dependencies for the root, client, and server:
```bash
npm install
npm install --prefix client
npm install --prefix server
```

### 3. Set Up Environment Variables
Create a `.env` file in the project root directory by copying the example file:
```bash
cp .env.example .env
```
Then, open the `.env` file and add your API credentials:
```
# Terra API Credentials
# Get these from your Terra dashboard: https://dashboard.tryterra.co/
DEV_ID=YOUR_TERRA_DEV_ID
API_KEY=YOUR_TERRA_API_KEY

# OpenAI API Credentials
# Get this from your OpenAI dashboard: https://platform.openai.com/api-keys
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```
**Note:** Ensure your OpenAI account has credits and a payment method set up for API usage.

### 4. Running the Application (Development)
To run both the client (Vite) and server (Node.js/Express) concurrently in development mode, use the following command from the project root:
```bash
npm run dev
```
This will typically start:
- The **Frontend (Client)** on `http://localhost:5173` (or the next available port).
- The **Backend (Server)** on `http://localhost:3000` (or as configured in `server/src/index.ts`).

The client application will open in your default browser. If it doesn't, navigate to `http://localhost:5173`.

### 5. How it Works (Local Demo)
- The Terra connection uses a simplified local authentication flow (no webhooks needed).
- All health data and generated archetype information are stored in memory on the server for the duration of the session and are not persisted.

## Building for Production (Optional)

If you need to build the application for a production-like environment:
```bash
npm run build
```
This command typically bundles the frontend and transpiles the backend server code (check `package.json` for specific build script actions).

To start the server after building:
```bash
npm run start:server
```
Refer to your `package.json` scripts for the exact commands if they differ. 