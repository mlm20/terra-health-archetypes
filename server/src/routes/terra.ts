import express, { Request, Response } from 'express';
import { randomUUID } from 'crypto';

import { initializeSession, storeTerraUserId, getTerraUserId } from '../utils/sessionManager';
import { getUserHealthData, packageHealthDataForLLM, TerraHealthData } from '../services/terraService';

const router = express.Router();
const TERRA_API_WIDGET_URL = 'https://api.tryterra.co/v2/auth/generateWidgetSession';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'; // For redirect URLs

// Interface for the expected Terra API response
interface TerraWidgetSessionResponse {
  status: string;
  url?: string; 
  message?: string;
}

// NEW: Endpoint to initiate Terra Widget connection
router.post('/initiate-widget', async (req: Request, res: Response): Promise<void> => {
    const devId = process.env.TERRA_DEV_ID;
    const apiKey = process.env.TERRA_API_KEY;

    if (!devId || !apiKey) {
        console.error('Terra API credentials missing for widget session.');
        res.status(500).json({ error: 'Server configuration error for Terra connection.' });
        return;
    }

    const sessionId = randomUUID();
    initializeSession(sessionId); // Store sessionId to validate later

    const successRedirectUrl = `${FRONTEND_URL}/flow?sessionId=${sessionId}`;
    const failureRedirectUrl = `${FRONTEND_URL}/?error=auth_failed`;

    try {
        const terraApiBody = {
            reference_id: sessionId,
            language: 'en',
            auth_success_redirect_url: successRedirectUrl,
            auth_failure_redirect_url: failureRedirectUrl,
        };

        console.log('Calling Terra generateWidgetSession with body:', terraApiBody);

        const terraResponse = await (await import('node-fetch')).default(TERRA_API_WIDGET_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'dev-id': devId,
                'x-api-key': apiKey,
            },
            body: JSON.stringify(terraApiBody),
        });

        // Assert the type after parsing JSON
        const responseData = await terraResponse.json() as TerraWidgetSessionResponse;

        // Now TypeScript knows the potential shape of responseData
        if (!terraResponse.ok || responseData.status !== 'success' || !responseData.url) {
            console.error('Terra generateWidgetSession API error or missing URL:', responseData);
            // Use optional chaining for message as it might not exist
            res.status(500).json({ error: 'Failed to initiate Terra widget session.', details: responseData?.message || 'Unknown API error' });
            return;
        }

        res.status(200).json({ 
            widgetUrl: responseData.url, // Now safe to access .url
            sessionId: sessionId 
        });

    } catch (error) {
        console.error('Error calling Terra generateWidgetSession API:', error);
        res.status(500).json({ error: 'Internal server error while initiating Terra connection.' });
    }
});

// NEW: Endpoint for frontend to confirm authentication details from redirect
router.post('/confirm-auth', express.json(), (req: Request, res: Response): void => {
    const { sessionId, terraUserIdFromUrl } = req.body;

    if (!sessionId || !terraUserIdFromUrl) {
        console.error('Confirm Auth: Missing sessionId or terraUserIdFromUrl');
        res.status(400).json({ error: 'Session ID and Terra User ID are required.' });
        return;
    }

    // Validate that the session was indeed initiated by us (optional but good practice)
    const existingTerraUserId = getTerraUserId(sessionId);
    if (existingTerraUserId && existingTerraUserId !== terraUserIdFromUrl) {
        // This case is unusual: session exists but with a different Terra User ID.
        // Could be a re-auth attempt or an anomaly. For now, we'll overwrite, 
        // assuming the latest redirect from Terra is authoritative for this specific frontend flow.
        // The webhook for 'user_reauth' handles the more formal re-authentication scenario.
        console.warn(`Confirm Auth: Session ${sessionId} already had Terra User ID ${existingTerraUserId}, overwriting with ${terraUserIdFromUrl} from redirect.`);
    } else if (existingTerraUserId === terraUserIdFromUrl) {
        console.log(`Confirm Auth: Session ${sessionId} already confirmed for Terra User ID ${terraUserIdFromUrl}.`);
        res.status(200).json({ message: 'Authentication already confirmed for this session.' });
        return;
    }
    // If session wasn't initialized or didn't have terraUserId, or we are overwriting (as per above logic)
    storeTerraUserId(sessionId, terraUserIdFromUrl);
    console.log(`Confirm Auth: Stored Terra User ID ${terraUserIdFromUrl} for Session ID ${sessionId} via frontend confirmation.`);
    res.status(200).json({ message: 'Authentication confirmed and Terra User ID stored.' });
});

// Route to handle the Terra widget callback (redirect)
// This is where the user's browser is sent after interacting with the Terra Widget.
router.get('/callback', (req: Request, res: Response) => {
    const { user_id, reference_id, resource, error, reason, widget_session_id } = req.query;

    console.log('Terra Widget Callback Received:');
    if (error) {
        console.error('Authentication failed via widget redirect:', error, reason);
        // The user is already redirected to the failureRedirectUrl set in generateWidgetSession
        // This backend callback doesn't typically redirect again unless it's to a different page.
        // For now, just acknowledge. Frontend will handle display based on URL query params.
        res.status(200).send(`Widget authentication callback processed with error: ${error}. Check the frontend page.`);
        return;
    }
    
    console.log('Widget Callback Success - User ID:', user_id);
    console.log('Widget Callback Success - Reference ID (Session ID):', reference_id);
    console.log('Widget Callback Success - Resource (Provider):', resource);

    // Important: The 'auth' webhook (below) is THE reliable source for confirming authentication and storing user_id.
    // This redirect primarily gets the user back to your app. The sessionId in the URL (from successRedirectUrl)
    // will be used by the frontend to fetch data.
    // For now, just acknowledge. Frontend will handle display based on URL query params.
    res.status(200).send('Widget authentication callback successfully processed. Check the frontend page.');
});

// NEW: Endpoint to fetch the packaged data report
router.get('/data-report/:sessionId', async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.params;
    if (!sessionId) {
        res.status(400).json({ error: 'Session ID is required in path.'});
        return;
    }

    const terraUserId = getTerraUserId(sessionId);
    if (!terraUserId) {
        res.status(404).json({ error: 'Session not found or Terra User ID not associated. Please connect your wearable first.' });
        return;
    }

    try {
        // Define date range, e.g., last 28 days for synchronous processing
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 28); // Fetch 28 days of data

        const formatDate = (date: Date): string => date.toISOString().split('T')[0];
        const startDateStr = formatDate(startDate);
        const endDateStr = formatDate(endDate);

        console.log(`Fetching health data for Terra User ID: ${terraUserId}, Session ID: ${sessionId}, Range: ${startDateStr} to ${endDateStr}`);
        const rawHealthData: TerraHealthData = await getUserHealthData(terraUserId, startDateStr, endDateStr);
        
        const healthReport = packageHealthDataForLLM(rawHealthData, startDate, endDate);
        
        res.status(200).json(healthReport);

    } catch (error) {
        console.error(`Error fetching data report for session ${sessionId}:`, error);
        if (error instanceof Error && error.message.includes('Terra API credentials')) {
            res.status(500).json({ error: 'Server configuration error.' });
        } else {
            res.status(500).json({ error: 'Failed to generate data report.' });
        }
    }
});

export default router; 