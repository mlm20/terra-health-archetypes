import OpenAI from 'openai';
import { LLM_ARCHETYPE_SYSTEM_PROMPT, LLMArchetypeResponse } from '@shared/constants'; // Use path mapping
import { LLMReadyHealthReport } from './terraService'; // Assuming this relative path is okay within services

// Initialize OpenAI Client
// The api key will be read automatically from the OPENAI_API_KEY env var by the library
const openai = new OpenAI(); 

const OPENAI_MODEL = 'gpt-4.1-mini'; // Or specify a newer version like 'gpt-3.5-turbo-0125'
const MAX_RETRIES = 1; // Number of retries on specific errors
const RETRY_DELAY_MS = 1000; // Delay between retries

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates a health archetype using the OpenAI library based on the provided health data report.
 * Instructs the model to return a JSON object.
 * 
 * @param healthReport The packaged health data report.
 * @returns A promise that resolves to the parsed LLMArchetypeResponse.
 * @throws Throws an error if the OpenAI API call fails after retries or returns invalid data.
 */
export async function generateArchetypeFromHealthData(
    healthReport: LLMReadyHealthReport
): Promise<LLMArchetypeResponse> {
    
    // Check if API key is set (library reads it, but good to check existence for clarity)
    if (!process.env.OPENAI_API_KEY) {
        console.error('OpenAI API key is missing from environment variables.');
        throw new Error('OpenAI API key is not configured.');
    }

    const healthReportJsonString = JSON.stringify(healthReport, null, 2);
    const userPrompt = `Here is the user's health data report for the last ${healthReport.timePeriodDays} days:\n\n\`\`\`json\n${healthReportJsonString}\n\`\`\`\n\nPlease generate the health archetype based on this data, following the JSON format instructions precisely.`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: LLM_ARCHETYPE_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
    ];

    let attempts = 0;
    while (attempts <= MAX_RETRIES) {
        try {
            console.log(`Attempt ${attempts + 1} to call OpenAI API using library...`);
            
            const completion = await openai.chat.completions.create({
                model: OPENAI_MODEL,
                messages: messages,
                temperature: 0.7, 
                response_format: { type: "json_object" } 
            });

            const messageContent = completion.choices[0]?.message?.content;

            if (!messageContent) {
                 // Log the full response for debugging if content is missing
                console.error('Invalid response structure from OpenAI API (Library): Missing content.', completion);
                throw new Error('Invalid response structure from OpenAI API: Missing content.');
            }
            
            try {
                const parsedJson = JSON.parse(messageContent) as LLMArchetypeResponse;
                if (!parsedJson.archetypeName || !parsedJson.archetypeDescription || !parsedJson.imagePrompt || !parsedJson.sliderValues) {
                    throw new Error('Parsed JSON from OpenAI is missing required fields.');
                }
                console.log('Successfully received and parsed archetype from OpenAI via library.');
                return parsedJson;

            } catch (parseError) {
                console.error('Failed to parse JSON response from OpenAI content (Library):', parseError);
                console.error('LLM Response Content was:', messageContent);
                throw new Error(`Failed to parse valid JSON from OpenAI response. Content: ${messageContent}`);
            }

        } catch (error) {
            console.error(`Error during OpenAI API call attempt ${attempts + 1} (Library):`, error);
            if (attempts < MAX_RETRIES) {
                // Check if the error is an APIError and potentially retryable
                let isRetryable = false;
                if (error instanceof OpenAI.APIError) {
                     // Example: Retry on rate limits (429) or server errors (5xx)
                     if (error.status === 429 || (error.status && error.status >= 500)) {
                        isRetryable = true;
                        console.warn(`OpenAI API Error (${error.status}). Retrying after ${RETRY_DELAY_MS}ms...`);
                     }
                } else if (error instanceof Error && (error.message.includes('ETIMEDOUT') || error.message.includes('ECONNRESET'))) {
                    // Retry on potential network errors
                    isRetryable = true;
                    console.warn(`Network error during OpenAI call. Retrying after ${RETRY_DELAY_MS}ms...`);
                }

                if (isRetryable) {
                    attempts++;
                    await delay(RETRY_DELAY_MS);
                    continue; 
                } else {
                    // Non-retryable API error or other exception
                    throw error;
                }
            } else {
                // Max retries reached
                throw error; 
            }
        }
    } // End while loop

    // Should not be reached
    throw new Error('Failed to generate archetype after multiple retries.');
} 