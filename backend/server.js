import 'dotenv/config';
import app from './app.js';
import { ensureAppSettings } from './config/prisma.js';

const PORT = process.env.PORT || 5000;

// Set NODE_ENV to production if not set (for Railway)
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

ensureAppSettings()
  .then(() => {
    // Bind to 0.0.0.0 so Railway can reach the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Our Watchlist server running on 0.0.0.0:${PORT}`);
      console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database settings:', error);
    process.exit(1);
  });
