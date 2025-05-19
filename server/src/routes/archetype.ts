import express, { Request, Response } from 'express';
import OpenAI from 'openai';
import { getTerraUserId } from '../utils/sessionManager';
import { getUserHealthData, packageHealthDataForLLM, LLMReadyHealthReport, TerraHealthData } from '../services/terraService';
import { generateArchetypeFromHealthData, generateArchetypeImage } from '../services/openaiService';
import { LLM_ARCHETYPE_SYSTEM_PROMPT, LLMArchetypeResponse } from "../../../shared/constants";

const router = express.Router();

// POST /api/archetype/generate
// Retrieves health data for a session, generates archetype via LLM, returns details.
router.post('/generate', async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.body;

    if (!sessionId) {
        res.status(400).json({ error: 'Session ID is required in request body.' });
        return;
    }

    const terraUserId = getTerraUserId(sessionId);
    if (!terraUserId) {
        res.status(404).json({ error: 'Session not found or Terra User ID not associated.' });
        return;
    }

    try {
        console.log(`Archetype Gen: Fetching data for session ${sessionId}, Terra User ${terraUserId}`);
        // Define date range again, or ensure it's passed/retrieved consistently if needed for context
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 28); // Consistent with terra.ts
        const formatDate = (date: Date): string => date.toISOString().split('T')[0];
        const healthData: LLMReadyHealthReport = packageHealthDataForLLM(
            await getUserHealthData(terraUserId, formatDate(startDate), formatDate(endDate)),
            startDate,
            endDate
        );

        console.log(`Archetype Gen: Calling OpenAI for session ${sessionId}`);
        const archetypeDetails: LLMArchetypeResponse = await generateArchetypeFromHealthData(healthData);
        
        // The image generation is now a separate step initiated by the client.
        // This endpoint returns only the text-based archetype details, including the imagePrompt.
        res.status(200).json(archetypeDetails);

    } catch (error) {
        console.error(`Error in /generate archetype route:`, error);
        // More specific error handling based on error type
        if (error instanceof OpenAI.APIError) {
            // Handle OpenAI API errors (e.g., rate limits, auth issues)
            res.status(error.status || 500).json({ error: error.message || 'OpenAI API error.', type: 'OPENAI_API_ERROR' });
        } else if (error instanceof Error) {
            // Handle other known errors (e.g., network issues, our own thrown errors)
            if (error.message.includes('Terra User ID not associated')) {
                res.status(404).json({ error: error.message, type: 'SESSION_ERROR' });
            } else if (error.message.includes('OpenAI API key is not configured')) {
                res.status(500).json({ error: error.message, type: 'CONFIG_ERROR' });
            } else if (error.message.includes('Failed to parse valid JSON')) {
                res.status(502).json({ error: 'Failed to generate archetype due to LLM service error.', details: error.message, type: 'LLM_RESPONSE_PARSE_ERROR' });
            } else {
                res.status(500).json({ 
                    error: 'Failed to generate archetype.', 
                    details: error.message 
                });
            }
        } else {
            // Fallback for unknown errors
            res.status(500).json({ error: 'An unknown error occurred while generating the archetype.', type: 'UNKNOWN_ERROR' });
        }
    }
});

// POST /api/archetype/generate-image
// Takes an image prompt from the request body, calls the new generateArchetypeImage service function, and returns the image URL.
router.post('/generate-image', async (req: Request, res: Response): Promise<void> => {
    const { imagePrompt } = req.body;

    if (!imagePrompt || typeof imagePrompt !== 'string' || imagePrompt.trim().length === 0) {
        res.status(400).json({ error: 'A valid imagePrompt (string) is required in the request body.' });
        return;
    }

    try {
        console.log(`Image Gen Route: Received request to generate image for prompt: "${imagePrompt.substring(0,100)}..."`);
        const imageUrl = await generateArchetypeImage(imagePrompt);
        res.status(200).json({ imageUrl });

    } catch (error) {
        console.error('Error in /generate-image route:', error);
        let statusCode = 500;
        let errorMessage = 'Failed to generate image.';
        let errorDetails: string | undefined = undefined;
        let errorType: string = 'IMAGE_GENERATION_ERROR';

        if (error instanceof OpenAI.APIError) {
            statusCode = error.status || 500;
            errorMessage = error.message || 'OpenAI API error during image generation.';
            errorType = 'OPENAI_API_ERROR';
        } else if (error instanceof Error) {
            errorMessage = error.message;
            errorDetails = error.stack; // Or keep it simple with just message
        } else {
            errorMessage = 'An unknown error occurred during image generation.';
            errorType = 'UNKNOWN_ERROR';
        }

        res.status(statusCode).json({ 
            error: errorMessage,
            details: errorDetails, // Send stack in dev, or a generic message in prod
            type: errorType
        });
    }
});

export default router; 