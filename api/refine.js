import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured on the server.' });
  }

  const { tailoredResume, prompt } = req.body;

  if (!tailoredResume) {
    return res.status(400).json({ error: 'Missing required field: tailoredResume' });
  }
  if (!prompt) {
    return res.status(400).json({ error: 'Missing required field: prompt' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            personal: {
              type: 'OBJECT',
              properties: {
                name: { type: 'STRING' },
                email: { type: 'STRING' },
                phone: { type: 'STRING' },
                website: { type: 'STRING' },
                github: { type: 'STRING' },
                linkedin: { type: 'STRING' },
                location: { type: 'STRING' }
              },
              required: ['name', 'email', 'phone']
            },
            summary: { type: 'STRING' },
            skills: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  category: { type: 'STRING' },
                  values: {
                    type: 'ARRAY',
                    items: { type: 'STRING' }
                  }
                },
                required: ['category', 'values']
              }
            },
            experience: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  role: { type: 'STRING' },
                  company: { type: 'STRING' },
                  duration: { type: 'STRING' },
                  bullets: {
                    type: 'ARRAY',
                    items: { type: 'STRING' }
                  }
                },
                required: ['role', 'company', 'duration', 'bullets']
              }
            },
            projects: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING' },
                  technologies: {
                    type: 'ARRAY',
                    items: { type: 'STRING' }
                  },
                  duration: { type: 'STRING' },
                  description: { type: 'STRING' },
                  bullets: {
                    type: 'ARRAY',
                    items: { type: 'STRING' }
                  }
                },
                required: ['name', 'technologies', 'duration', 'bullets']
              }
            },
            education: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  degree: { type: 'STRING' },
                  school: { type: 'STRING' },
                  duration: { type: 'STRING' }
                },
                required: ['degree', 'school', 'duration']
              }
            }
          },
          required: ['personal', 'summary', 'skills', 'experience', 'projects', 'education']
        }
      }
    });

    const systemPrompt = `You are a seasoned Resume Editor and Technical Recruiter.
Your objective is to modify the candidate's existing tailored resume JSON structure according to the user's specific editing instructions.

CURRENT TAILORED RESUME JSON:
${JSON.stringify(tailoredResume, null, 2)}

USER EDITING INSTRUCTION:
"${prompt}"

CRITICAL RULES:
1. STRICT SCHEMATIC INTEGRITY: Output ONLY the updated resume data, strictly conforming to the specified JSON schema. Do not change the JSON structure or keys.
2. PRESERVE UNTOUCHED CONTENT: Keep all sections, bullets, and details that are not affected by the user's instruction exactly as they were in the original JSON.
3. FOLLOW INSTRUCTIONS PRECISELY: Apply the user's edits accurately. For example, if the user asks to restructure or format certain bullets (like grouping projects under experience), update those bullets accordingly. If they ask to add/remove a skill, rewrite a summary, or rephrase a bullet, apply it precisely.
4. NO HALLUCINATIONS: Do not invent any new work experience details, degrees, or facts unless explicitly requested by the user's editing instruction.
`;

    console.log('[REFINE DEBUG] Input JSON length:', JSON.stringify(tailoredResume).length);
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    
    console.log('[REFINE DEBUG] Response text length:', responseText.length);
    console.log('[REFINE DEBUG] End of response text:', responseText.substring(Math.max(0, responseText.length - 300)));

    let cleanText = responseText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();
    
    const parsedData = JSON.parse(cleanText);

    return res.status(200).json(parsedData);
  } catch (error) {
    console.error('Gemini refinement error:', error);
    return res.status(500).json({
      error: 'AI Refinement Failed',
      details: error.message
    });
  }
}
