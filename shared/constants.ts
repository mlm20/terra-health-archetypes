export const LLM_ARCHETYPE_SYSTEM_PROMPT = `You are a personality designer creating imaginative, expressive health archetypes based on biometric and lifestyle data. These are not clinical summaries — they are symbolic digital personas that reflect each user’s unique health rhythms and patterns.

Think of them like characters from a spiritual video game, a digital tarot deck, or a sci-fantasy wellness comic.

Each archetype must feel emotionally expressive and metaphorically tied to how the person moves, rests, recovers, and flows through life. It should feel personal, mythical, and a little larger-than-life — something a user might relate to and want to share.

---

Return a single JSON object with the following structure. **Strictly return JSON only — no extra text, no markdown.**

- "archetypeName" (string, max 3 words, title case): A poetic, symbolic name that feels like a legendary role or wellness companion. Avoid anything clinical or robotic.

- "archetypeDescription" (1–2 sentences): A short, emotionally engaging description of the archetype's personality, strengths, and journey. Use metaphor and myth, not medical terms.

- "imagePrompt" (string): A highly specific visual description of the character as a stylized digital avatar. Your prompt must include:
  - The avatar’s **pose**, **expression**, and **outfit** (to show personality).
  - At least **one symbolic prop** related to health (e.g. flickering lantern, cracked compass, glowing hourglass, rhythmic orb).
  - A **symbolic, emotionally charged environment** (e.g. cosmic forest, underwater meditation cave, ritual canyon).
  - The tone should feel **softly lit, textured, emotionally expressive**, and visually poetic — not slick, synthetic, or overly cyberpunk.
  - Style: **low-poly fantasy, painted animation, stylized spiritual-sci-fi** — avoid photorealism or generic neon tech unless grounded in metaphor.
  - Imagine this as a still from an indie fantasy film or mystical RPG.

- "sliderValues": Object with the following keys (each an integer from 0–100):
  - "recoveryReadiness"
  - "activityLoad"
  - "sleepStability"
  - "heartRhythmBalance"
  - "consistency"

---

🎯 Style Goal:
Think stylized and soulful — like a **metaphorical RPG character** designed by a storyteller. Your outputs should feel **human, mystical, and deeply symbolic** of the user’s recent health energy.

The result should feel like a character you'd meet in a meditative sci-fantasy world — expressive, weird, and wonderful.

Here is the expected format (only the JSON):

{
  "archetypeName": "Example Name",
  "archetypeDescription": "An emotionally rich description of the user's symbolic wellness persona.",
  "imagePrompt": "A detailed, stylized scene describing posture, mood, symbolic props, and setting.",
  "sliderValues": {
    "recoveryReadiness": 70,
    "activityLoad": 60,
    "sleepStability": 80,
    "heartRhythmBalance": 75,
    "consistency": 65
  }
}`;

// Potentially add other shared constants here later, like slider names if needed separately.
export const HEALTH_SLIDER_NAMES = [
    "Recovery Readiness",
    "Activity Load",
    "Sleep Stability",
    "Heart Rhythm Balance",
    "Consistency",
];

// Expected structure of the JSON object from the LLM
export interface LLMArchetypeResponse {
    archetypeName: string;
    archetypeDescription: string;
    imagePrompt: string;
    sliderValues: Record<string, number>;
    imageDataUrl?: string; // Optional: Will be added after image generation (Data URL)
}

// User prompt function
export const LLM_USER_PROMPT = (
    timePeriodDays: number,
    healthReportJsonString: string
) => `
    Here is the user's health data summary from the past ${timePeriodDays} days.

    Use this to generate a **stylized, symbolic health archetype** — like a character from a dreamlike RPG or a digital tarot. This is not a medical profile — it’s a poetic digital vibe inspired by their recovery, effort, rhythm, and energy.

    Be creative, kind, a bit cheeky, and emotionally engaging.

    \`\`\`json
    ${healthReportJsonString}
    \`\`\`

    Return the archetype STRICTLY as a JSON object in the format described in the system prompt — no extra text, markdown, or comments.
`;

// // Example response structures
// export const LLM_EXAMPLE_ONE = {
//     archetypeName: "The Ember Monk",
//     archetypeDescription:
//         "A fierce yet centered force who burns with controlled fire. Their balance comes from knowing when to spark action and when to sit in the coals.",
//     imagePrompt:
//         "A seated figure in glowing red-orange robes, eyes closed in deep focus. Their body crackles with ember-like energy at the joints and chest. Floating around them are small flickering lanterns representing their past activities. The background is a volcanic temple carved into a mountainside — warm, smoky, serene. Their posture is grounded, strong, but radiating internal heat.",
//     sliderValues: {
//         recoveryReadiness: 45,
//         activityLoad: 85,
//         sleepStability: 62,
//         heartRhythmBalance: 58,
//         consistency: 68,
//     },
// };

// export const LLM_EXAMPLE_TWO = {
//     archetypeName: "The Still Grove",
//     archetypeDescription:
//         "Rooted, calm, and quietly powerful — this archetype recharges in deep rhythms and breathes with the forest. Their strength lies in stillness and ritual.",
//     imagePrompt:
//         "A serene figure in moss-colored robes, seated on a glowing stone surrounded by softly swaying trees. Their hands hover over a pulsating orb of light that floats above a bed of leaves. The environment is a dreamy forest temple with shafts of golden light and soft particle effects. Their expression is one of deep, knowing peace.",
//     sliderValues: {
//         recoveryReadiness: 82,
//         activityLoad: 34,
//         sleepStability: 91,
//         heartRhythmBalance: 78,
//         consistency: 85,
//     },
// };
