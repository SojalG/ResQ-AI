import { GoogleGenerativeAI } from '@google/generative-ai';

const getModel = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-pro' });
};

export async function chatWithGemini(messages, lang, contextData={}) {
  const model = getModel();
  const last = messages.at(-1)?.content || '';
  if (!model) {
    const hindi = lang === 'hi';
    if (/suppl|kit|supply/i.test(last)) return hindi ? 'आपातकालीन किट में पानी, सूखा भोजन, दवाइयाँ, टॉर्च, पावर बैंक, रेडियो और ज़रूरी दस्तावेज़ रखें।' : 'Keep water, non-perishable food, medicines, a torch, power bank, radio, first-aid supplies, and copies of essential documents in your emergency kit.';
    if (/heat/i.test(last)) return hindi ? 'दोपहर 12–4 बजे बाहर जाने से बचें, पानी पीते रहें, हल्के कपड़े पहनें और चक्कर आने पर ठंडी जगह जाएँ।' : 'Avoid outdoor activity from 12–4 PM, hydrate often, wear light clothing, and move to a cool place if you feel dizzy or nauseous.';
    if (/flood/i.test(last)) return hindi ? 'आपके क्षेत्र में बाढ़ का जोखिम ऊँचा है। निचले रास्तों से बचें, फोन चार्ज रखें और स्थानीय अलर्ट देखें।' : `Current flood risk is ${contextData?.risks?.floodRisk ?? 72}%. Avoid low-lying roads, charge your phone, and monitor official local alerts.`;
    return hindi ? 'मैं आपकी आपदा तैयारी में मदद कर सकता हूँ। अपना क्षेत्र और चिंता बताएँ; आपात स्थिति में तुरंत 112 पर कॉल करें।' : 'I can help you prepare. Tell me your area and concern; if this is an immediate emergency, call 112 and move to safety.';
  }
  const system = `You are ResQAI, an AI disaster preparedness and community safety assistant. Help citizens understand disaster risks, emergency procedures, shelter locations, and safety recommendations. Be concise, empathetic, and actionable. Current context: ${JSON.stringify(contextData)}. ${lang === 'hi' ? 'Respond in Hindi.' : 'Respond in English.'}`;
  const prompt = `${system}\n\nConversation:\n${messages.map(m=>`${m.role}: ${m.content}`).join('\n')}\nassistant:`;
  return (await model.generateContent(prompt)).response.text();
}

export async function analyzeImage(buffer, mimeType, incidentType) {
  const model = getModel();
  if (!model) return { detected: incidentType || 'Reported incident', severity: incidentType === 'Fire' || incidentType === 'Flooding' ? 'High' : 'Medium', suggested_action:'Keep a safe distance, warn others nearby, and follow emergency authority instructions.' };
  const prompt = `Analyze this disaster/incident image. Return only valid JSON: {"detected": string, "severity": "Low"|"Medium"|"High", "suggested_action": string}`;
  const text = (await model.generateContent([prompt,{inlineData:{data:buffer.toString('base64'),mimeType}}])).response.text();
  return JSON.parse(text.replace(/```json|```/g,'').trim());
}

export async function getRecommendation(risks) {
  const model = getModel();
  if (!model) {
    const max = Object.entries(risks).sort((a,b)=>b[1]-a[1])[0];
    return `${max[0].replace('Risk','')} risk is the main concern. Pre-position response teams, publish a ward-level advisory, and reassess conditions in two hours.`;
  }
  return (await model.generateContent(`Give a concise operational disaster recommendation based on: ${JSON.stringify(risks)}`)).response.text();
}

