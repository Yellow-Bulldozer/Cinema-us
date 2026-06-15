import 'dotenv/config';
import app from './app.js';
import { ensureAppSettings } from './config/prisma.js';

const PORT = process.env.PORT || 5000;

ensureAppSettings()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Our Watchlist server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database settings:', error);
    process.exit(1);
  });
