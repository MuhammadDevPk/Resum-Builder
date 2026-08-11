import pdf from 'pdf-parse';

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

  try {
    let buffer;
    if (Buffer.isBuffer(req.body)) {
      buffer = req.body;
    } else if (typeof req.body === 'string') {
      buffer = Buffer.from(req.body, 'binary');
    } else {
      // Concatenate raw chunks if the body stream was not pre-parsed by middleware
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      buffer = Buffer.concat(chunks);
    }

    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ error: 'Empty PDF payload. Please upload a valid PDF.' });
    }

    // Parse the PDF buffer
    const data = await pdf(buffer);

    return res.status(200).json({
      text: data.text,
      numpages: data.numpages || 1,
      info: data.info || {}
    });
  } catch (error) {
    console.error('PDF parsing error:', error);
    return res.status(500).json({
      error: 'Failed to extract text from PDF resume.',
      details: error.message
    });
  }
}
