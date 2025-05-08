// LLM Configuration for Health Archetypes Demo

// --------------------------
// Text Generation Model
// --------------------------
// Specifies the model used for generating the archetype name, description, image prompt, and sliders.
export const TEXT_MODEL = 'gpt-4.1-mini';
// Other possible options (ensure your API key has access and check pricing/capabilities):
// - 'gpt-4o'
// - 'gpt-4-turbo'
// - 'gpt-3.5-turbo'

// --------------------------
// Image Generation Model
// --------------------------
// Specifies the model used for generating the archetype avatar image.
export const IMAGE_MODEL = 'dall-e-3';
// Other possible options (ensure your API key has access and check pricing/capabilities):
// - 'dall-e-2'
// - 'gpt-image-1' (Note: As per recent OpenAI docs, may require org verification & has different API specifics)

// --- DALL-E 3 Specific Settings (if IMAGE_MODEL is 'dall-e-3') ---
export const DALL_E_3_IMAGE_SIZE = '1024x1024'; // Options: '1024x1024', '1792x1024', '1024x1792'
export const DALL_E_3_IMAGE_QUALITY = 'hd';    // Options: 'standard', 'hd'
export const DALL_E_3_IMAGE_STYLE = 'vivid';   // Options: 'vivid', 'natural'

// Note: For gpt-image-1, parameters like 'output_format', 'output_compression', 'background' can be specified.
// For DALL-E models, 'response_format: b64_json' is used in the service to get base64 data. 