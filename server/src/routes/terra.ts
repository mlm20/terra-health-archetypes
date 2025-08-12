import express, { Request, Response } from 'express';
import { TerraClient } from 'terra-api';
import { getSession, setTerraUserId, getTerraUserId, clearTerraUserId } from '../utils/sessionManager';

const router = express.Router();

// Initialize Terra client
const client = new TerraClient({
    apiKey: process.env.TERRA_API_KEY!,
    devId: process.env.TERRA_DEV_ID!
});

// POST /api/terra/widget-session
// Generate Terra widget session URL for user authentication
router.post('/widget-session', async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.body;

    if (!sessionId) {
        res.status(400).json({ error: 'Session ID is required in request body.' });
        return;
    }

    try {
        console.log(`Terra Widget Session: Creating for session ${sessionId}`);
        
        // Generate widget session with callback URLs
        const response = await client.authentication.generatewidgetsession({
            reference_id: sessionId,
            auth_success_redirect_url: `http://localhost:5174/api/terra/callback?session_id=${sessionId}`,
            auth_failure_redirect_url: `http://localhost:5174/api/terra/callback?session_id=${sessionId}&error=auth_failed`
        });

        if (response.status === 'success') {
            res.status(200).json({ 
                sessionUrl: response.url,
                sessionId: response.session_id,
                expiresIn: response.expires_in
            });
        } else {
            throw new Error('Failed to create widget session');
        }

    } catch (error) {
        console.error('Error creating Terra widget session:', error);
        res.status(500).json({ 
            error: 'Failed to create Terra widget session',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// GET /api/terra/callback
// Handle Terra OAuth callback after user connects
router.get('/callback', async (req: Request, res: Response): Promise<void> => {
    const { session_id, user_id, error } = req.query;

    console.log('Terra callback received:', { session_id, user_id, error });

    if (!session_id || typeof session_id !== 'string') {
        res.status(400).send('Session ID is required');
        return;
    }

    if (error) {
        // Authentication failed
        console.log(`Terra auth failed for session ${session_id}: ${error}`);
        res.redirect(`http://18.170.33.156:3000/?connected=false&error=${encodeURIComponent(String(error))}`);
        return;
    }

    if (!user_id || typeof user_id !== 'string') {
        res.status(400).send('User ID is required for successful authentication');
        return;
    }

    try {
        // Store Terra user ID in session
        setTerraUserId(session_id, user_id);
        console.log(`Terra user ${user_id} connected to session ${session_id}`);
        
        // Redirect back to frontend with success
        res.redirect(`http://18.170.33.156:3000/?connected=true`);

    } catch (error) {
        console.error('Error handling Terra callback:', error);
        res.redirect(`http://18.170.33.156:3000/?connected=false&error=callback_error`);
    }
});

// GET /api/terra/status
// Check if current session has a connected Terra user ID
router.get('/status', (req: Request, res: Response): void => {
    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== 'string') {
        res.status(400).json({ error: 'Session ID is required' });
        return;
    }

    const terraUserId = getTerraUserId(sessionId);
    const isConnected = !!terraUserId;

    res.status(200).json({ 
        connected: isConnected,
        terraUserId: isConnected ? terraUserId : null
    });
});

// POST /api/terra/fetch-data
// Fetch all available health data from Terra
router.post('/fetch-data', async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.body;

    if (!sessionId) {
        res.status(400).json({ error: 'Session ID is required in request body.' });
        return;
    }

    const terraUserId = getTerraUserId(sessionId);
    if (!terraUserId) {
        res.status(400).json({ error: 'No Terra user connected for this session.' });
        return;
    }

    try {
        console.log(`Terra Data Fetch: Fetching data for user ${terraUserId}`);

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
            menstruationData
        ] = await Promise.allSettled([
            client.activity.fetch({ user_id: terraUserId, start_date: startDateTimestamp, end_date: endDateTimestamp }),
            client.sleep.fetch({ user_id: terraUserId, start_date: startDateTimestamp, end_date: endDateTimestamp }),
            client.body.fetch({ user_id: terraUserId, start_date: startDateTimestamp, end_date: endDateTimestamp }),
            client.daily.fetch({ user_id: terraUserId, start_date: startDateTimestamp, end_date: endDateTimestamp }),
            client.nutrition.fetch({ user_id: terraUserId, start_date: startDateTimestamp, end_date: endDateTimestamp }),
            client.menstruation.fetch({ user_id: terraUserId, start_date: startDateTimestamp, end_date: endDateTimestamp })
        ]);

        // Process results and extract data
        const aggregatedData = {
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
            { name: 'Menstruation', result: menstruationData },
        ];

        dataTypes.forEach(({ name, result }) => {
            if (result.status === 'rejected') {
                console.warn(`Failed to fetch ${name} data:`, result.reason);
                aggregatedData.dataAvailabilityNotes.push(`${name} data could not be retrieved.`);
            } else if (result.status === 'fulfilled' && 'data' in result.value && result.value.data && result.value.data.length === 0) {
                aggregatedData.dataAvailabilityNotes.push(`No ${name} data available for the selected period.`);
            }
        });

        if (aggregatedData.dataAvailabilityNotes.length === 0) {
            aggregatedData.dataAvailabilityNotes.push('All requested data types were successfully retrieved.');
        }

        console.log(`Terra Data Fetch: Successfully aggregated data for user ${terraUserId}`);
        res.status(200).json(aggregatedData);

    } catch (error) {
        console.error('Error fetching Terra data:', error);
        res.status(500).json({
            error: 'Failed to fetch Terra health data',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// POST /api/terra/disconnect
// Disconnect user from Terra and clear session data
router.post('/disconnect', async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.body;

    if (!sessionId) {
        res.status(400).json({ error: 'Session ID is required in request body.' });
        return;
    }

    const terraUserId = getTerraUserId(sessionId);
    if (!terraUserId) {
        res.status(400).json({ error: 'No Terra user connected for this session.' });
        return;
    }

    try {
        console.log(`Terra Disconnect: Disconnecting user ${terraUserId} from session ${sessionId}`);
        
        // Deauthenticate user from Terra
        await client.authentication.deauthenticateuser({ user_id: terraUserId });
        
        // Clear Terra user ID from session
        clearTerraUserId(sessionId);
        
        console.log(`Terra user ${terraUserId} successfully disconnected`);
        res.status(200).json({ message: 'User successfully disconnected from Terra' });

    } catch (error) {
        console.error('Error disconnecting Terra user:', error);
        
        // Clear local session data even if Terra deauth fails
        clearTerraUserId(sessionId);
        
        res.status(500).json({
            error: 'Failed to disconnect from Terra',
            details: error instanceof Error ? error.message : 'Unknown error',
            message: 'Local session data has been cleared'
        });
    }
});

export default router;