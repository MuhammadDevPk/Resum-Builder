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
      model: 'gemini-3.5-flash-lite',
      generationConfig: {
        temperature: 0.1,
        // NOTE: No responseMimeType — constrained JSON mode causes truncation on lite models.
        // We parse JSON manually from the raw text response instead.
      }
    });

    // Use compact JSON (not pretty-printed) to save input tokens
    const resumeJson = JSON.stringify(tailoredResume);

    const numExperiences = tailoredResume.experience?.length || 0;
    const numProjects = tailoredResume.projects?.length || 0;

    const systemPrompt = `You are a professional Resume Editor. Your task is to update a resume JSON based on the user's instruction.

CURRENT RESUME JSON:
${resumeJson}

USER INSTRUCTION:
${prompt}

OUTPUT RULES (follow strictly):
- Output ONLY a single valid JSON object. No markdown, no explanation, no code fences.
- The JSON must have exactly these top-level keys: personal, summary, skills, experience, projects, education.
- PRESERVE all sections unchanged unless the instruction explicitly targets them.
- UNIQUE ENTRIES ONLY: Output each experience exactly once (there are ${numExperiences} in the input). Output each project exactly once (there are ${numProjects} in the input, plus any new ones the user asks to add). Never repeat or duplicate items.
- If adding a new project: append it to the projects array.
- If updating an experience's bullets: only change that company's bullets, leave all other experience entries identical.
- NEVER output any text outside the JSON object. Start your response with { and end with }.`;

    console.log(`[REFINE] Calling gemini-3.5-flash-lite | resume: ${resumeJson.length} chars | prompt: ${prompt.length} chars`);

    const result = await model.generateContent(systemPrompt);
    const candidate = result.response.candidates?.[0];
    const finishReason = candidate?.finishReason;
    const responseText = result.response.text();

    console.log(`[REFINE] finishReason: ${finishReason} | response length: ${responseText.length} chars`);

    // If the model stopped because it hit the token limit, the JSON will be truncated.
    if (finishReason === 'MAX_TOKENS') {
      console.error('[REFINE] Model hit MAX_TOKENS — response is incomplete JSON. Prompt may be too complex.');
      if (!res.headersSent) {
        return res.status(500).json({
          error: 'AI Refinement Failed',
          details: 'The AI response was too long and got cut off. Try breaking your request into smaller edits.'
        });
      }
      return;
    }

    // Extract the JSON object from the response (handles cases where the model
    // accidentally wraps its output in markdown fences or adds surrounding text)
    let jsonText = responseText.trim();

    // Strip markdown code fences if present
    const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonText = fenceMatch[1].trim();
    }

    // Find the outermost JSON object (from first { to last })
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    }

    const parsedData = JSON.parse(jsonText);

    console.log(`[REFINE] Success — experiences: ${parsedData.experience?.length}, projects: ${parsedData.projects?.length}`);

    if (!res.headersSent) {
      return res.status(200).json(parsedData);
    }
  } catch (error) {
    console.error('[REFINE] Error:', error.message);
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'AI Refinement Failed',
        details: error.message
      });
    }
  }
}
