import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // Load environment variables from root .env file

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON bodies

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('Health Archetypes API is running!');
});

// Placeholder for future routes
// app.use('/api/terra', terraRoutes);
// app.use('/api/archetype', archetypeRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
}); 