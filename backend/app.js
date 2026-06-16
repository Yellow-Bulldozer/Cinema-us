import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import watchlistRoutes from './routes/watchlist.routes.js';
import exportRoutes from './routes/export.routes.js';
import importRoutes from './routes/import.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import shareRoutes from './routes/share.routes.js';
import statsRoutes from './routes/stats.routes.js';
import timelineRoutes from './routes/timeline.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// In production, allow same-origin requests (frontend served from same server)
// In development, allow localhost origins
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin, mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow any .railway.app domain
    if (origin.endsWith('.railway.app')) return callback(null, true);
    // Allow listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow all in production (frontend is served from same server)
    if (process.env.NODE_ENV === 'production') return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/watchlist', watchlistRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/import', importRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/upload', uploadRoutes);

// Serve static frontend assets if they exist
const frontendDist = path.join(__dirname, '../frontend/dist');
const indexHtmlPath = path.join(frontendDist, 'index.html');

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

// Fallback for SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'Route not found' });
  }
  if (fs.existsSync(indexHtmlPath)) {
    res.sendFile(indexHtmlPath);
  } else {
    res.status(503).json({ success: false, message: 'Frontend not built yet' });
  }
});

app.use(errorHandler);

export default app;
