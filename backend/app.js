import express from 'express';
import cors from 'cors';
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

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
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

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

export default app;
