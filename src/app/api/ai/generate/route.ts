import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface FAQEntry {
  q?: string;
  a?: string;
  question?: string;
  answer?: string;
}

export interface AIGenerationResponse {
  description: string;
  tagline: string;
  whatsapp_caption: string;
  instagram_caption: string;
  faq: FAQEntry[];
  rsvp_confirmation: string;
}

const CANDIDATE_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite-preview',
  'gemini-3.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
];

function generateCuratedFallback(
  eventName: string,
  location: string,
  dateTime: string,
  brief: string,
  tone: string
): AIGenerationResponse {
  const city = location.split(',')[0].trim() || 'Bengaluru';
  const displayTitle = eventName.trim() || 'Curated Gathering';

  return {
    description: `Join us for ${displayTitle}, an exclusively curated gathering bringing together passionate minds, creators, and leaders in ${city}. Designed for meaningful dialogue, genuine community, and unforgettable shared moments, this salon promises an intimate atmosphere with thoughtful hospitality.${
      brief ? ` Centered around ${brief}, every aspect of the experience has been crafted with intention.` : ''
    }`,
    tagline: `An intimate evening of connection, conversation, and culture in ${city}.`,
    whatsapp_caption: `✨ You're invited to *${displayTitle}*!\n\n📍 ${
      location || 'Curated Venue'
    }\n🗓 ${dateTime || 'Upcoming'}\n\nJoin us for an exclusive evening of high-signal conversations and curated connections. Reserve your pass here: {{link}}`,
    instagram_caption: `An intimate evening where serendipity meets intention. ${displayTitle} brings together creators, founders, and cultural leaders in ${city} for an evening of shared perspectives and warm hospitality.\n\nReserve your pass via the link in bio.\n\n#VibeBySwaniki #${city.replace(
      /\s+/g,
      ''
    )}Events #CuratedSalons #FoundersGathering #IndiaCulture`,
    faq: [
      {
        q: 'What is the dress code?',
        a: 'Smart casual and comfortable. We prioritize thoughtful conversation in relaxed yet elevated surroundings.',
        question: 'What is the dress code?',
        answer: 'Smart casual and comfortable. We prioritize thoughtful conversation in relaxed yet elevated surroundings.',
      },
      {
        q: 'Can I bring a guest?',
        a: 'Admission is curated and by confirmation only. If you wish to bring a plus-one, please register them during RSVP.',
        question: 'Can I bring a guest?',
        answer: 'Admission is curated and by confirmation only. If you wish to bring a plus-one, please register them during RSVP.',
      },
      {
        q: 'Is parking available at the venue?',
        a: 'Valet and dedicated parking are available on-site at the venue.',
        question: 'Is parking available at the venue?',
        answer: 'Valet and dedicated parking are available on-site at the venue.',
      },
    ],
    rsvp_confirmation: `Your RSVP for ${displayTitle} has been received! We look forward to hosting you in ${city}. Detailed access instructions and host notes will be delivered to your inbox shortly before the gathering.`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventName = body.name || '',
      eventType = 'in-person',
      dateTime = '',
      location = '',
      brief = '',
      tone = 'Warm',
      field = null, // if specified, regenerate only this field
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found in environment, using curated fallback generator.');
      const fallback = generateCuratedFallback(eventName, location, dateTime, brief, tone);
      if (field && (fallback as any)[field] !== undefined) {
        return NextResponse.json({ [field]: (fallback as any)[field] });
      }
      return NextResponse.json(fallback);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const promptContext = `
Event Name: "${eventName}"
Event Type: "${eventType}"
Date & Time: "${dateTime}"
Location/Venue: "${location}"
Organizer Brief/Theme Notes: "${brief}"
Tone: "${tone}" (Warm / Professional / Casual / Exciting)
`;

    const systemInstruction = `
You are the AI Event Architect for "Vibe by Swaniki", a luxury, India-first curated gathering platform.
Generate captivating, authentic event copy based on the event details:
${promptContext}

Requirements:
- description: 150-200 word event description explaining why attendees must come, the curated experience, and hospitality.
- tagline: 8-12 word evocative tagline.
- whatsapp_caption: 50-word WhatsApp message with emojis, key details, and RSVP placeholder {{link}}.
- instagram_caption: 60-word Instagram caption with storytelling and exactly 5 hashtags (e.g. #VibeBySwaniki, #IndiaGatherings, etc.).
- faq: Array of 3 FAQ objects with exact keys "q" and "a" (e.g. [{"q": "Question text", "a": "Answer text"}]).
- rsvp_confirmation: 40-word confirmation message thanking the guest and detailing arrival expectations.
${field ? `Regenerate strictly and return ONLY the field "${field}".` : 'Generate all fields according to the schema.'}

Output STRICTLY valid JSON with this exact schema:
{
  "description": "150-200 word event description",
  "tagline": "8-12 word tagline",
  "whatsapp_caption": "50-word WhatsApp message with emojis",
  "instagram_caption": "60-word Instagram caption with 5 hashtags",
  "faq": [
    {"q": "Question text", "a": "Answer text"}
  ],
  "rsvp_confirmation": "40-word confirmation message"
}
`;

    let generatedData: any = null;
    let lastError: Error | null = null;

    // Attempt generation across available models in order of speed and stability
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: systemInstruction }] }],
        });

        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        generatedData = JSON.parse(cleanJson);
        if (generatedData) {
          break; // Successfully generated content
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini API] Model ${modelName} notice: ${err.message}. Retrying candidate models...`);
      }
    }

    // Fallback if all Google models are temporarily unavailable or busy
    if (!generatedData) {
      console.warn('All Gemini candidate models returned errors, activating curated fallback:', lastError?.message);
      const fallback = generateCuratedFallback(eventName, location, dateTime, brief, tone);
      if (field && (fallback as any)[field] !== undefined) {
        return NextResponse.json({ [field]: (fallback as any)[field] });
      }
      return NextResponse.json(fallback);
    }

    // Normalize FAQ to support both {q, a} and {question, answer}
    if (Array.isArray(generatedData.faq)) {
      generatedData.faq = generatedData.faq.map((item: any) => ({
        q: item.q || item.question || '',
        a: item.a || item.answer || '',
        question: item.q || item.question || '',
        answer: item.a || item.answer || '',
      }));
    }

    if (field && generatedData[field] !== undefined) {
      return NextResponse.json({ [field]: generatedData[field] });
    }

    return NextResponse.json(generatedData);
  } catch (error: any) {
    console.error('AI Generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate event content',
      },
      { status: 500 }
    );
  }
}
