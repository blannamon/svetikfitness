import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { createBrotliCompress, createGzip } from 'node:zlib';

const port = Number(process.env.PORT || 3000);
const root = process.cwd();
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.avif': 'image/avif',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
};

const compressibleTypes = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.svg',
]);

createServer((request, response) => {
  const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
  const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  const filePath = normalize(join(root, relativePath));

  if (!filePath.startsWith(root) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  const extension = extname(filePath);
  const headers = {
    'Content-Type': mimeTypes[extension] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
  };

  const acceptEncoding = request.headers['accept-encoding'] || '';
  let stream = createReadStream(filePath);

  if (compressibleTypes.has(extension) && /\bbr\b/.test(acceptEncoding)) {
    headers['Content-Encoding'] = 'br';
    headers.Vary = 'Accept-Encoding';
    stream = stream.pipe(createBrotliCompress());
  } else if (compressibleTypes.has(extension) && /\bgzip\b/.test(acceptEncoding)) {
    headers['Content-Encoding'] = 'gzip';
    headers.Vary = 'Accept-Encoding';
    stream = stream.pipe(createGzip());
  }

  response.writeHead(200, headers);
  stream.pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`Svetlana hero: http://localhost:${port}`);
});
