import dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); // Load environment variables FIRST

import express, { Express, Request, Response } from 'express';
import terraRouter from './routes/terra'; // Import Terra routes
import archetypeRouter from './routes/archetype'; // Import Archetype routes

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON bodies

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('Health Archetypes API is running!');
});

// API routes
app.use('/api/terra', terraRouter); // Use Terra routes
app.use('/api/archetype', archetypeRouter); // Use Archetype routes

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
}); 