import express, { Request, Response } from 'express';
import OpenAI from 'openai';
import { generateArchetypeFromHealthData, generateArchetypeImage } from '../services/openaiService';
import { LLM_ARCHETYPE_SYSTEM_PROMPT, LLMArchetypeResponse } from "../../../shared/constants";
import { getTerraUserId, clearTerraUserId } from '../utils/sessionManager';
import { TerraClient } from 'terra-api';

const router = express.Router();

// Initialize Terra client
const client = new TerraClient({
    apiKey: process.env.TERRA_API_KEY!,
    devId: process.env.TERRA_DEV_ID!
});

// POST /api/archetype/generate
// Retrieves health data for a session, generates archetype via LLM, returns details.
router.post('/generate', async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.body;

    if (!sessionId) {
        res.status(400).json({ error: 'Session ID is required in request body.' });
        return;
    }

    try {
        // Check if session has Terra user connected
        const terraUserId = getTerraUserId(sessionId);
        
        let healthData: any;
        
        if (terraUserId) {
            console.log(`Archetype Gen: Fetching real Terra data for user ${terraUserId}`);
            
            // Calculate date range (28 days ago to now)
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 28);

            const startDateTimestamp = Math.floor(startDate.getTime() / 1000); // Unix timestamp in seconds
            const endDateTimestamp = Math.floor(endDate.getTime() / 1000);

            // Fetch all data types in parallel
            const [
                activityData,
                sleepData,
                bodyData,
                dailyData,
                nutritionData,
                menstruationData,
            ] = await Promise.allSettled([
                client.activity.fetch({ user_id: terraUserId, start_date: startDateTimestamp, end_date: endDateTimestamp }),
                client.sleep.fetch({ user_id: terraUserId, start_date: startDateTimestamp, end_date: endDateTimestamp }),
                client.body.fetch({ user_id: terraUserId, start_date: startDateTimestamp, end_date: endDateTimestamp }),
                client.daily.fetch({ user_id: terraUserId, start_date: startDateTimestamp, end_date: endDateTimestamp }),
                client.nutrition.fetch({ user_id: terraUserId, start_date: startDateTimestamp, end_date: endDateTimestamp }),
                client.menstruation.fetch({ user_id: terraUserId, start_date: startDateTimestamp, end_date: endDateTimestamp })
            ]);

            // Process results and extract data
            healthData = {
                timePeriodDays: 28,
                healthData: {
                    activity: activityData.status === 'fulfilled' && 'data' in activityData.value ? activityData.value.data || [] : [],
                    sleep: sleepData.status === 'fulfilled' && 'data' in sleepData.value ? sleepData.value.data || [] : [],
                    body: bodyData.status === 'fulfilled' && 'data' in bodyData.value ? bodyData.value.data || [] : [],
                    daily: dailyData.status === 'fulfilled' && 'data' in dailyData.value ? dailyData.value.data || [] : [],
                    nutrition: nutritionData.status === 'fulfilled' && 'data' in nutritionData.value ? nutritionData.value.data || [] : [],
                    menstruation: menstruationData.status === 'fulfilled' && 'data' in menstruationData.value ? menstruationData.value.data || [] : []
                },
                dataAvailabilityNotes: [] as string[]
            };

            // Add notes about failed data fetches
            const dataTypes = [
                { name: 'Activity', result: activityData },
                { name: 'Sleep', result: sleepData },
                { name: 'Body', result: bodyData },
                { name: 'Daily', result: dailyData },
                { name: 'Nutrition', result: nutritionData },
                { name: 'Menstruation', result: menstruationData }
            ];

            dataTypes.forEach(({ name, result }) => {
                if (result.status === 'rejected') {
                    console.warn(`Failed to fetch ${name} data:`, result.reason);
                    healthData.dataAvailabilityNotes.push(`${name} data could not be retrieved.`);
                } else if (result.status === 'fulfilled' && 'data' in result.value && result.value.data && result.value.data.length === 0) {
                    healthData.dataAvailabilityNotes.push(`No ${name} data available for the selected period.`);
                }
            });

            if (healthData.dataAvailabilityNotes.length === 0) {
                healthData.dataAvailabilityNotes.push('All requested data types were successfully retrieved from Terra.');
            }

        } else {
            console.log(`Archetype Gen: No Terra user connected for session ${sessionId}, using mock data`);
            // Fallback to mock data if no Terra user is connected
            healthData = {
                timePeriodDays: 28,
                healthData: {
                    daily: [{ date: '2025-07-15', steps: 10000 }],
                    sleep: [{ date: '2025-07-15', duration_in_bed_seconds: 28800 }],
                    activity: [{ date: '2025-07-15', distance_meters: 5000 }],
                    body: [{ timestamp: '2025-07-15T12:00:00Z', heart_rate_bpm: 60 }],
                },
                dataAvailabilityNotes: ["Mock data is being used as no Terra wearable is connected."],
            };
        }

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
            if (error.message.includes('OpenAI API key is not configured')) {
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
    const { imagePrompt, sessionId } = req.body;

    if (!imagePrompt || typeof imagePrompt !== 'string' || imagePrompt.trim().length === 0) {
        res.status(400).json({ error: 'A valid imagePrompt (string) is required in the request body.' });
        return;
    }

    try {
        console.log(`Image Gen Route: Received request to generate image for prompt: "${imagePrompt.substring(0,100)}..."`);
        const imageUrl = await generateArchetypeImage(imagePrompt);
        
        // Auto-disconnect Terra user after successful image generation
        const { sessionId } = req.body;
        if (sessionId) {
            const terraUserId = getTerraUserId(sessionId);
            if (terraUserId) {
                console.log(`Auto-disconnecting Terra user ${terraUserId} after image generation`);
                try {
                    await client.authentication.deauthenticateuser({ user_id: terraUserId });
                    clearTerraUserId(sessionId);
                    console.log(`Terra user ${terraUserId} automatically disconnected after archetype completion`);
                } catch (disconnectError) {
                    console.error('Error auto-disconnecting Terra user:', disconnectError);
                    // Still clear local session data
                    clearTerraUserId(sessionId);
                }
            }
        }
        
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