const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');
const formidable = require('formidable');

const PORT = 3000;
const uploadRoot = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

async function handleRoot(req, res) {
  const filePath = path.join(__dirname, 'public', 'index.html');
  try {
    const stat = await fsp.stat(filePath);
    if (!stat.isFile()) {
      res.statusCode = 404;
      return res.end('index.html not found');
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const readStream = fs.createReadStream(filePath);
    readStream.on('error', () => {
      res.statusCode = 500;
      res.end('Error reading index.html');
    });
    readStream.pipe(res);
  } catch {
    res.statusCode = 404;
    res.end('index.html not found');
  }
}

function handleUpload(req, res) {
  console.log('Incoming upload request');

  const form = formidable({
    uploadDir: uploadRoot,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    multiples: false
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Parse error:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Error parsing upload: ' + err.message }));
    }

    console.log('Fields:', fields);
    console.log('Files:', files);

    let file = files.file;
    if (!file) {
      const keys = Object.keys(files);
      if (keys.length > 0) {
        file = files[keys[0]];
      }
    }

    if (Array.isArray(file)) {
      file = file[0];
    }

    if (!file) {
      console.error('No file found in parsed data');
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'No file uploaded' }));
    }

    try {
      const relativePath = await saveFileWithUniqueName(file);
      const urlPath = `/files/${relativePath}`;
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          message: 'Upload successful',
          fileName: relativePath,
          url: urlPath,
          size: file.size,
          originalName: file.originalFilename || file.newFilename
        })
      );
    } catch (e) {
      console.error('Save error:', e);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to save file: ' + e.message }));
    }
  });
}

async function saveFileWithUniqueName(file) {
  const originalName = file.originalFilename || file.newFilename || 'file';
  const ext = path.extname(originalName);
  const uniqueName = crypto.randomBytes(16).toString('hex') + ext;

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const dir = path.join(uploadRoot, year, month, day);
  await fsp.mkdir(dir, { recursive: true });

  const finalPath = path.join(dir, uniqueName);
  const tempPath = file.filepath || file.path;

  if (!tempPath) {
    throw new Error('No temp path from formidable');
  }

  await fsp.rename(tempPath, finalPath);

  return path.relative(uploadRoot, finalPath).replace(/\\/g, '/');
}

function handleFileDownload(req, res) {
  const prefix = '/files/';
  const url = req.url;

  let relativePath = url.slice(prefix.length);
  const qIndex = relativePath.indexOf('?');
  if (qIndex !== -1) {
    relativePath = relativePath.slice(0, qIndex);
  }

  const safeRelativePath = path
    .normalize(relativePath)
    .replace(/^(\.\.[/\\])+/, '');

  const filePath = path.resolve(uploadRoot, safeRelativePath);

  if (!filePath.startsWith(uploadRoot)) {
    res.statusCode = 400;
    return res.end('Invalid file path.');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      return res.end('File not found.');
    }

    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.txt') contentType = 'text/plain';
    else if (ext === '.json') contentType = 'application/json';
    else if (ext === '.zip') contentType = 'application/zip';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);

    const readStream = fs.createReadStream(filePath);
    readStream.on('error', () => {
      res.statusCode = 500;
      res.end('Error reading file.');
    });
    readStream.pipe(res);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    return handleRoot(req, res);
  }

  if (req.method === 'GET' && req.url === '/favicon.ico') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method === 'POST' && req.url === '/upload') {
    return handleUpload(req, res);
  }

  if (req.method === 'GET' && req.url.startsWith('/files/')) {
    return handleFileDownload(req, res);
  }

  res.statusCode = 404;
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});