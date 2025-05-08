import express, { Request, Response } from 'express';
import { getTerraUserId } from '../utils/sessionManager';
import { getUserHealthData, packageHealthDataForLLM, LLMReadyHealthReport, TerraHealthData } from '../services/terraService';
import { generateArchetypeFromHealthData } from '../services/openaiService';
import { LLMArchetypeResponse } from '@shared/constants';

const router = express.Router();

// POST /api/archetype/generate
// Retrieves health data for a session, generates archetype via LLM, returns details.
router.post('/generate', async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId } = req.body; 
        if (!sessionId) {
            res.status(400).json({ error: 'Session ID is required.' });
            return;
        }

        // 1. Retrieve Terra User ID from session
        const terraUserId = getTerraUserId(sessionId);
        if (!terraUserId) {
            res.status(404).json({ error: 'Session invalid or expired, or Terra user not associated.' });
            return;
        }

        // 2. Fetch and Package Health Data
        // Define date range (consistent with the fetch during testing)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 28); // Using 28 days as decided earlier
        const formatDate = (date: Date): string => date.toISOString().split('T')[0];
        const startDateStr = formatDate(startDate);
        const endDateStr = formatDate(endDate);
        
        console.log(`Archetype Gen: Fetching data for session ${sessionId}, Terra User ${terraUserId}`);
        const rawHealthData: TerraHealthData = await getUserHealthData(terraUserId, startDateStr, endDateStr);
        const healthReport: LLMReadyHealthReport = packageHealthDataForLLM(rawHealthData, startDate, endDate);

        // 3. Call the archetype generation service (LLM interaction)
        console.log(`Archetype Gen: Calling OpenAI for session ${sessionId}`);
        const archetypeDetails: LLMArchetypeResponse = await generateArchetypeFromHealthData(healthReport);

        // 4. Return the generated details
        res.status(200).json(archetypeDetails);

    } catch (error) {
        console.error(`Error in /generate archetype route:`, error);
        if (error instanceof Error) {
             // More specific error handling based on potential errors from services
            if (error.message.includes('Terra API credentials') || error.message.includes('OpenAI API key')) {
                 res.status(500).json({ error: 'Server configuration error.' });
            } else if (error.message.includes('Session invalid') || error.message.includes('required')) {
                 res.status(400).json({ error: error.message });
            } else if (error.message.includes('OpenAI API request failed') || error.message.includes('Failed to parse valid JSON')){
                res.status(502).json({ error: 'Failed to generate archetype due to LLM service error.', details: error.message });
            } else {
                res.status(500).json({ error: 'Failed to generate archetype due to an internal server error.', details: error.message });
            }
        } else {
             // Fallback for non-Error exceptions
             res.status(500).json({ error: 'An unexpected internal server error occurred.' });
        }
    }
});

export default router; 