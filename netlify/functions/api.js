import serverless from 'serverless-http';
import app from '../../server/index.js';
import { connectDB } from '../../server/config/db.js';

let isConnected = false;
const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.warn('[Netlify Function] DB connect warning:', err.message);
    }
  }
  try {
    return await serverlessHandler(event, context);
  } catch (err) {
    console.error('[Netlify Function] Execution error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Internal function execution error: ' + (err.message || String(err)),
      }),
    };
  }
};
