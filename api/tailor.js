import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // Enable CORS/headers for serverless context
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'API Configuration Error',
      details: 'GEMINI_API_KEY is not defined on the server. Please add it to your environment variables.'
    });
  }

  const { resumeText, jobDescription, customInstructions } = req.body;

  if (!resumeText) {
    return res.status(400).json({ error: 'Missing required field: resumeText' });
  }
  if (!jobDescription) {
    return res.status(400).json({ error: 'Missing required field: jobDescription' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using gemini-3.5-flash for high performance, speed, and cost efficiency
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: {
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
                  description: { type: 'STRING' },
                  bullets: {
                    type: 'ARRAY',
                    items: { type: 'STRING' }
                  }
                },
                required: ['name', 'technologies', 'bullets']
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

    const systemPrompt = `You are a seasoned Resume Writer and Technical Recruiter.
Your objective is to tailor the candidate's existing resume to fit a target job description.

CRITICAL RULES:
1. NO HALLUCINATIONS: Do NOT invent, assume, or add any work experiences, roles, projects, certifications, degrees, programming languages, or specific tools that are not present in the original resume. If they do not have it, do not include it.
2. ALIGN & HIGHLIGHT: Identify key matches between the candidate's background and the target job description. Rephrase achievements, bullets, and summaries to emphasize these matching elements using strong action verbs.
3. PROFESSIONAL SUMMARY: Rewrite the summary to directly address the candidate's relevance to the target job description, drawing strictly from their actual experience.
4. WORK EXPERIENCE BULLETS: Rephrase the bullet points under experience. Emphasize the impact, tools, scale, and results relevant to the job description. Keep the metrics and achievements factual to the original.
5. SKILLS GROUPING: Organize their actual skills into clear, relevant categories (e.g., Languages, Frameworks, Cloud, databases) matching the job posting keywords, but only including skills they actually possess.
6. PROJECTS: Highlight matching projects and emphasize the specific technologies used that align with the job requirements.
7. EDUCATION: Keep school details, degrees, and dates accurate.

Original Resume Text:
"""
${resumeText}
"""

Target Job Description:
"""
${jobDescription}
"""

${customInstructions ? `Custom Tweaking Instructions (Adhere to this request as well): \n"""\n${customInstructions}\n"""` : ''}

Output the resume data strictly conforming to the specified JSON schema.`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    
    // Parse to verify JSON structure defensively before returning
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
    console.error('Gemini tailoring error:', error);
    return res.status(500).json({
      error: 'AI Tailoring Failed',
      details: error.message
    });
  }
}
