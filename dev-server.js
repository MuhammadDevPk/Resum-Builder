import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Middleware for body parsing:
// JSON and URL-encoded parsed automatically (like Vercel does)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// For PDF stream parsing, we accept raw binary buffers
app.use(express.raw({ type: 'application/pdf', limit: '10mb' }));

// Endpoint router emulating serverless routes
app.all('/api/:endpoint', async (req, res) => {
  const { endpoint } = req.params;
  const handlerPath = path.join(__dirname, 'api', `${endpoint}.js`);

  try {
    // Dynamic import mapping for local execution
    const moduleUrl = `file://${handlerPath}`;
    const module = await import(moduleUrl);
    const handler = module.default;

    if (typeof handler === 'function') {
      await handler(req, res);
    } else {
      res.status(500).json({ error: `Handler for /api/${endpoint} is not a default exported function.` });
    }
  } catch (err) {
    console.error(`Error loading API endpoint /api/${endpoint}:`, err);
    res.status(404).json({
      error: `API endpoint /api/${endpoint} not found or failed to load.`,
      details: err.message
    });
  }
});

app.listen(port, () => {
  console.log(`[Dev Backend] Simulator running on http://localhost:${port}`);
});
