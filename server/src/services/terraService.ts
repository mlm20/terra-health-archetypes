import fetch from 'node-fetch'; // Or use global fetch if your Node version supports it natively (18+)

const TERRA_API_BASE_URL = 'https://api.tryterra.co/v2'; // Ensure this is the correct base URL

// This is the direct, potentially summarized, data from Terra for each category
export interface TerraHealthData {
    daily: any[]; 
    sleep: any[];
    activity: any[];
    body: any[];
}

// Represents the structured summary we want to send to the LLM.
// It primarily packages the raw Terra data along with some metadata.
export interface LLMReadyHealthReport {
    timePeriodDays: number;
    healthData: TerraHealthData; // Contains the direct arrays from Terra
    dataAvailabilityNotes: string[];
}

// Define an interface for the expected structure of Terra API responses
// This helps handle cases where the actual data array might be nested
interface TerraApiResponseData {
    data?: any[] | { data?: any[] }; // The data property can be an array or an object containing another data array
    // Add other potential top-level properties if known, e.g., status, message, etc.
    status?: string;
    message?: string;
    // ... any other fields that might appear at the top level of the JSON response
}

interface FetchOptions {
    headers: {
        'dev-id': string;
        'x-api-key': string;
    };
}

async function fetchTerraData(endpoint: string, userId: string, startDate: string, endDate: string, options: FetchOptions): Promise<any[]> {
    const url = `${TERRA_API_BASE_URL}${endpoint}?user_id=${userId}&start_date=${startDate}&end_date=${endDate}&to_webhook=false&with_samples=false`;
    try {
        const response = await fetch(url, { method: 'GET', headers: options.headers });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Terra API Error (${endpoint}, ${response.status}): ${errorBody}`);
            return []; 
        }
        // Assert the type of jsonData after parsing
        const jsonData = await response.json() as TerraApiResponseData;
        
        // Updated Parsing Logic with type safety:
        // Check for the nested structure first (e.g., dashboard-like response)
        if (jsonData.data && typeof jsonData.data === 'object' && !Array.isArray(jsonData.data) && jsonData.data.data && Array.isArray(jsonData.data.data)) {
            return jsonData.data.data;
        } 
        // Check for direct data array (e.g., some webhook-like structures or simpler API responses)
        else if (jsonData.data && Array.isArray(jsonData.data)) {
            return jsonData.data; 
        }
        // Handle cases where data might be at the top level (less common for list endpoints but possible)
        // This case is unusual since the original code implied jsonData itself could be an array if it was the direct data source
        // However, our TerraApiResponseData models 'data' as a property. If the entire response IS an array, this interface needs adjustment
        // For now, sticking to the pattern that 'data' is a property.
        // else if (Array.isArray(jsonData)) { // This check is problematic if jsonData is TerraApiResponseData
        //      console.warn(`Terra API response for ${endpoint} was directly an array. This is unexpected with TerraApiResponseData type.`);
        //      return jsonData; // This would be a type error if jsonData is TerraApiResponseData unless type is 'any[] | TerraApiResponseData'
        // }

        // Log unexpected structure but return empty array to avoid breaking Promise.all
        // console.warn(`Unexpected Terra API response structure for ${endpoint}. Could not find data array:`, JSON.stringify(jsonData));
        // The previous check for Array.isArray(jsonData) is removed to align with TerraApiResponseData structure.
        // If the API can return a direct array, then the type of jsonData needs to be `TerraApiResponseData | any[]`
        // and the logic below needs to handle that. For now, assuming data is always under a property.

        // More robust check based on the defined interface:
        const outerData = jsonData.data;
        if (outerData) {
            if (Array.isArray(outerData)) {
                return outerData; // Direct data array: { "data": [...] }
            } else if (typeof outerData === 'object' && outerData.data && Array.isArray(outerData.data)) {
                return outerData.data; // Nested data array: { "data": { "data": [...] } }
            }
        }

        // If neither of the above, log and return empty.
        console.warn(`Unexpected Terra API response structure for ${endpoint}. Could not find data array in expected locations:`, JSON.stringify(jsonData));
        return [];
    } catch (error) {
        console.error(`Error calling Terra API for ${endpoint}:`, error);
        return []; 
    }
}

export async function getUserHealthData(
    terraUserId: string,
    startDateStr: string, 
    endDateStr: string    
): Promise<TerraHealthData> {
    const devId = process.env.TERRA_DEV_ID;
    const apiKey = process.env.TERRA_API_KEY;
    if (!devId || !apiKey) {
        console.error('Terra API credentials (TERRA_DEV_ID or TERRA_API_KEY) are missing from environment variables.');
        throw new Error('Terra API credentials are not configured.');
    }
    const fetchOptions: FetchOptions = { headers: { 'dev-id': devId, 'x-api-key': apiKey } };    
    
    const [dailyData, sleepData, activityData, bodyData] = await Promise.all([
        fetchTerraData('/daily', terraUserId, startDateStr, endDateStr, fetchOptions),
        fetchTerraData('/sleep', terraUserId, startDateStr, endDateStr, fetchOptions),
        fetchTerraData('/activity', terraUserId, startDateStr, endDateStr, fetchOptions),
        fetchTerraData('/body', terraUserId, startDateStr, endDateStr, fetchOptions),
    ]);
    return { daily: dailyData, sleep: sleepData, activity: activityData, body: bodyData };
}

/**
 * Packages the raw health data from Terra into a structure for the LLM.
 * According to the user, Terra API already provides normalized/summarized data, 
 * so this function mainly structures it and adds availability notes.
 */
export function packageHealthDataForLLM(
    rawData: TerraHealthData,
    startDate: Date, 
    endDate: Date
): LLMReadyHealthReport {
    const dataAvailabilityNotes: string[] = [];
    const timePeriodDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    if (!rawData.daily || rawData.daily.length === 0) {
        dataAvailabilityNotes.push('Daily summary data not available or empty for the period.');
    }
    if (!rawData.sleep || rawData.sleep.length === 0) {
        dataAvailabilityNotes.push('Sleep summary data not available or empty for the period.');
    }
    if (!rawData.activity || rawData.activity.length === 0) {
        dataAvailabilityNotes.push('Activity summary data not available or empty for the period.');
    }
    if (!rawData.body || rawData.body.length === 0) {
        dataAvailabilityNotes.push('Body composition data not available or empty for the period.');
    }

    if (dataAvailabilityNotes.length === 0) {
        dataAvailabilityNotes.push('Data from all expected categories (daily, sleep, activity, body) appears to be present for the period.');
    }
    
    // The LLM will receive the direct (but hopefully already summarized by Terra) arrays of data.
    return {
        timePeriodDays,
        healthData: rawData, // Pass the raw (but summarized by Terra) data directly
        dataAvailabilityNotes,
    };
} 