import app from '../server/index.js';
import { connectDB } from '../server/config/db.js';

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.warn('Vercel serverless connectDB warning:', err.message);
    }
  }

  // 1. Reconstruct original path from Vercel query.path if routed via catch-all
  if (req.query && req.query.path) {
    const segments = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
    const queryIndex = req.url.indexOf('?');
    const queryString = queryIndex !== -1 ? req.url.substring(queryIndex) : '';
    req.url = `/api/${segments}${queryString}`;
  } else if (req.headers['x-vercel-original-url']) {
    req.url = req.headers['x-vercel-original-url'];
  } else if (req.headers['x-matched-path'] && req.headers['x-matched-path'].startsWith('/api/')) {
    req.url = req.headers['x-matched-path'];
  }

  // 2. Strip /api/index.js if Vercel internal rewrite passed the filename
  if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace('/api/index.js', '/api');
  }

  // 3. Ensure the leading /api prefix is present for Express route matching
  if (!req.url.startsWith('/api') && !req.url.startsWith('/uploads') && !req.url.startsWith('/socket.io')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  return app(req, res);
}
