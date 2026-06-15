import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dist = path.join(__dirname, 'dist');
const port = process.env.PORT || 5173;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, `http://localhost:${port}`).pathname);
  const requested = path.normalize(path.join(dist, urlPath));
  const filePath = requested.startsWith(dist) && existsSync(requested) && !requested.endsWith(path.sep)
    ? requested
    : path.join(dist, 'index.html');

  try {
    res.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(await readFile(path.join(dist, 'index.html'), 'utf-8'));
  }
}).listen(port, () => {
  console.log(`Our Watchlist frontend running on http://localhost:${port}`);
});
