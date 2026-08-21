console.log("===== GEMINI CONFIG =====");
console.log("API key loaded:", !!process.env.GEMINI_API_KEY);
console.log(
    "API key prefix:",
    process.env.GEMINI_API_KEY
        ? process.env.GEMINI_API_KEY.substring(0, 53) + "..."
        : "NOT FOUND"
);
console.log(
    "API key length:",
    process.env.GEMINI_API_KEY?.length || 0
);
console.log(
    "Model:",
    process.env.GEMINI_MODEL || "NOT SET"
);
console.log("=========================");
import { GoogleGenAI } from '@google/genai';

const getAI = () => {
    if (!process.env.GEMINI_API_KEY) {
        return null;
    }

    return new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    });
};

const fallbackResponse = (message, lang, contextData = {}) => {
    const hindi = lang === 'hi';

    if (/suppl|kit|supply/i.test(message)) {
        return hindi
            ? 'आपातकालीन किट में पानी, सूखा भोजन, दवाइयाँ, टॉर्च, पावर बैंक, रेडियो, फर्स्ट-एड और जरूरी दस्तावेज रखें।'
            : 'Keep water, non-perishable food, medicines, a torch, power bank, radio, first-aid supplies, and copies of essential documents in your emergency kit.';
    }

    if (/heat/i.test(message)) {
        return hindi
            ? 'दोपहर 12–4 बजे बाहर जाने से बचें, पानी पीते रहें और हल्के कपड़े पहनें।'
            : 'Avoid outdoor activity from 12–4 PM, stay hydrated, and wear light clothing.';
    }

    if (/flood/i.test(message)) {
        const risk = contextData?.risks?.floodRisk ?? 72;

        return hindi
            ? `आपके क्षेत्र में बाढ़ का जोखिम ${risk}% है। निचले इलाकों से बचें, फोन चार्ज रखें और स्थानीय अलर्ट देखें।`
            : `Current flood risk is ${risk}%. Avoid low-lying areas, keep your phone charged, and monitor official local alerts.`;
    }

    return hindi
        ? 'मैं आपकी आपदा तैयारी में मदद कर सकता हूँ। अपना क्षेत्र और चिंता बताएं।'
        : 'I can help you prepare. Tell me your area and concern.';
};


export async function chatWithGemini(
    messages,
    lang = 'en',
    contextData = {}
) {
    const ai = getAI();
    const lastMessage = messages.at(-1)?.content || '';

    // If Gemini API key is not available
    if (!ai) {
        return fallbackResponse(
            lastMessage,
            lang,
            contextData
        );
    }

    try {
        const systemInstruction = `
You are ResQAI, an AI disaster preparedness and community safety assistant.

Help citizens with:
- Disaster risks
- Emergency procedures
- Safety recommendations
- Preparedness
- Shelter information

Be concise, empathetic and actionable.

Current context:
${JSON.stringify(contextData)}

${lang === 'hi'
    ? 'Respond in Hindi.'
    : 'Respond in English.'}
`;

        const prompt = `${systemInstruction}

Conversation:
${messages
    .map(message => `${message.role}: ${message.content}`)
    .join('\n')}

assistant:`;

        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
            contents: prompt
        });

        return response.text;

    } catch (error) {
        console.error('Gemini API error:', error);

        // Don't allow Gemini failure to crash /api/chat
        return lang === 'hi'
            ? 'अभी AI सेवा उपलब्ध नहीं है। कृपया कुछ समय बाद पुनः प्रयास करें।'
            : 'The AI service is temporarily unavailable. Please try again in a moment.';
    }
}


export async function analyzeImage(
    buffer,
    mimeType,
    incidentType
) {
    const ai = getAI();

    if (!ai) {
        return {
            detected: incidentType || 'Reported incident',
            severity:
                incidentType === 'Fire' || incidentType === 'Flooding'
                    ? 'High'
                    : 'Medium',
            suggested_action:
                'Keep a safe distance, warn others nearby, and follow emergency authority instructions.'
        };
    }

    try {
        const prompt = `
Analyze this disaster/incident image.

Return only valid JSON:

{
  "detected": "string",
  "severity": "Low|Medium|High",
  "suggested_action": "string"
}
`;

        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
            contents: [
                {
                    text: prompt
                },
                {
                    inlineData: {
                        data: buffer.toString('base64'),
                        mimeType
                    }
                }
            ]
        });

        const text = response.text
            .replace(/```json|```/g, '')
            .trim();

        return JSON.parse(text);

    } catch (error) {
        console.error('Gemini image analysis error:', error);

        return {
            detected: incidentType || 'Reported incident',
            severity: 'Medium',
            suggested_action:
                'Keep a safe distance and follow official emergency instructions.'
        };
    }
}


export async function getRecommendation(risks) {
    const ai = getAI();

    if (!ai) {
        const maxRisk = Object.entries(risks)
            .sort((a, b) => b[1] - a[1])[0];

        return `${maxRisk[0].replace(
            'Risk',
            ''
        )} risk is the main concern. Pre-position response teams, publish a ward-level advisory, and reassess conditions in two hours.`;
    }

    try {
        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
            contents: `Give a concise operational disaster recommendation based on:

${JSON.stringify(risks)}`
        });

        return response.text;

    } catch (error) {
        console.error('Gemini recommendation error:', error);

        return 'Prioritize the highest-risk area, alert affected communities, and reassess conditions regularly.';
    }
}