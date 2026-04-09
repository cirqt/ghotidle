const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BUILD_DIR = path.join(__dirname, 'build');
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// Read and cache index.html with the runtime API URL injected
const indexPath = path.join(BUILD_DIR, 'index.html');
let indexHtml = null;
try {
  indexHtml = fs.readFileSync(indexPath, 'utf8').replace(
    'RUNTIME_API_URL_PLACEHOLDER',
    API_URL
  );
  console.log(`API URL injected: ${API_URL}`);
} catch (e) {
  console.error('Could not read index.html:', e.message);
}

const server = http.createServer((req, res) => {
  let filePath = path.join(BUILD_DIR, req.url === '/' ? 'index.html' : req.url);

  // Remove query strings
  filePath = filePath.split('?')[0];

  const ext = path.extname(filePath);

  // If no extension or file doesn't exist, serve index.html (React Router support)
  if (!ext || !fs.existsSync(filePath)) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(indexHtml || 'App not built');
    return;
  }

  // Serve index.html with injected API URL
  if (filePath === indexPath) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(indexHtml || 'App not built');
    return;
  }

  const mime = mimeTypes[path.extname(filePath)] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
