import OpenAI from 'openai';
import { LLM_ARCHETYPE_SYSTEM_PROMPT, LLMArchetypeResponse } from '@shared/constants'; // Use path mapping
import { LLMReadyHealthReport } from './terraService'; // Assuming this relative path is okay within services
// Import model configurations from root config file
import {
    TEXT_MODEL,
    IMAGE_MODEL,
    DALL_E_3_IMAGE_SIZE,
    DALL_E_3_IMAGE_QUALITY,
    DALL_E_3_IMAGE_STYLE 
} from '../../../llm.config'; // Adjusted relative path

// Initialize OpenAI Client
// The api key will be read automatically from the OPENAI_API_KEY env var by the library
const openai = new OpenAI(); 

// const OPENAI_MODEL = 'gpt-4.1-mini'; // Now imported as TEXT_MODEL
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
            console.log(`Attempt ${attempts + 1} to call OpenAI API for text generation using model: ${TEXT_MODEL}...`);
            
            const completion = await openai.chat.completions.create({
                model: TEXT_MODEL, // Use imported TEXT_MODEL
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

// --- NEW FUNCTION FOR IMAGE GENERATION ---

// const IMAGE_MODEL_HARDCODED = 'dall-e-3'; // Now imported as IMAGE_MODEL
// const IMAGE_SIZE_HARDCODED = '1024x1024'; // Now imported from config
// const IMAGE_QUALITY_HARDCODED = 'hd'; // Now imported from config
const IMAGE_RESPONSE_FORMAT = 'b64_json'; 

/**
 * Generates an image using the OpenAI API based on the provided prompt.
 * Returns a data URL (e.g., data:image/png;base64,...).
 * 
 * @param imagePrompt The prompt to generate the image from.
 * @returns A promise that resolves to the data URL of the generated image.
 * @throws Throws an error if the OpenAI API call fails.
 */
export async function generateArchetypeImage(
    imagePrompt: string
): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
        console.error('OpenAI API key is missing for image generation.');
        throw new Error('OpenAI API key is not configured.');
    }

    // Basic check for prompt length, though OpenAI has its own limits
    if (!imagePrompt || imagePrompt.trim().length === 0) {
        console.error('Image prompt is empty.');
        throw new Error('Image prompt cannot be empty.');
    }

    // Simple retry logic for image generation (can be expanded similar to text generation if needed)
    let attempts = 0;
    while (attempts <= MAX_RETRIES) { // Using MAX_RETRIES from text generation for consistency
        try {
            console.log(`Attempt ${attempts + 1} to call OpenAI Image API with model: ${IMAGE_MODEL}, prompt: "${imagePrompt.substring(0, 100)}..."`);
            
            const imageParams: OpenAI.Images.ImageGenerateParams = {
                model: IMAGE_MODEL, // Use imported IMAGE_MODEL
                prompt: imagePrompt,
                n: 1,
                size: DALL_E_3_IMAGE_SIZE, // Use imported DALL_E_3_IMAGE_SIZE
                quality: DALL_E_3_IMAGE_QUALITY, // Use imported DALL_E_3_IMAGE_QUALITY
                response_format: IMAGE_RESPONSE_FORMAT,
            };

            // Add style only if model is dall-e-3, as other models might not support it
            if (IMAGE_MODEL === 'dall-e-3') {
                imageParams.style = DALL_E_3_IMAGE_STYLE; // Use imported DALL_E_3_IMAGE_STYLE
            }
            
            const response = await openai.images.generate(imageParams);

            // Check if data array exists and has elements
            if (!response.data || response.data.length === 0) {
                console.error('Invalid response structure from OpenAI Image API: Missing data array or data array is empty.', response);
                throw new Error('Invalid response structure from OpenAI Image API: Missing or empty data array.');
            }

            const imageBase64 = response.data[0]?.b64_json;

            if (!imageBase64) {
                console.error('Invalid response structure from OpenAI Image API: Missing image b64_json data.', response);
                throw new Error('Invalid response structure from OpenAI Image API: Missing image b64_json data.');
            }

            const imageDataUrl = `data:image/png;base64,${imageBase64}`;

            console.log('Successfully received image data from OpenAI and constructed data URL.');
            return imageDataUrl;

        } catch (error) {
            console.error(`Error during OpenAI Image API call attempt ${attempts + 1}:`, error);
            if (attempts < MAX_RETRIES) {
                let isRetryable = false;
                if (error instanceof OpenAI.APIError) {
                     if (error.status === 429 || (error.status && error.status >= 500)) {
                        isRetryable = true;
                        console.warn(`OpenAI Image API Error (${error.status}). Retrying after ${RETRY_DELAY_MS}ms...`);
                     }
                } else if (error instanceof Error && (error.message.includes('ETIMEDOUT') || error.message.includes('ECONNRESET'))) {
                    isRetryable = true;
                    console.warn(`Network error during OpenAI Image call. Retrying after ${RETRY_DELAY_MS}ms...`);
                }

                if (isRetryable) {
                    attempts++;
                    await delay(RETRY_DELAY_MS);
                    continue; 
                } else {
                    throw error;
                }
            } else {
                throw error; 
            }
        }
    }
    throw new Error('Failed to generate image after multiple retries.');
} 