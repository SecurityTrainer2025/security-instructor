// Launch behind the owner's authenticated Cloud HTTP Preview on port 8815.
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const express = require('../backend/node_modules/express');

const frontend = path.resolve(__dirname, '../frontend');
const slug = 'traffic-management-vehicle-control';
const testEmail = (process.env.SI_QA_TEST_EMAIL || '').trim().toLowerCase();
const previewOrigin = process.env.SI_QA_PREVIEW_ORIGIN || '';
const stagingOrigin = 'https://si-staging-ui.onrender.com';
const mailReady = Boolean(process.env.BREVO_API_KEY && process.env.MAIL_FROM && testEmail && previewOrigin);
if (previewOrigin) {
  const url = new URL(previewOrigin);
  if (url.protocol !== 'https:' || url.origin !== previewOrigin ||
      url.hostname === 'localhost' || url.hostname.endsWith('.onrender.com')) {
    throw new Error('Use the exact HTTPS origin from the authenticated Cloud HTTP Preview.');
  }
}
if (testEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(testEmail)) {
  throw new Error('SI_QA_TEST_EMAIL must be one test mailbox.');
}

// Enforce isolation even if a production Mongo URI or flags are inherited.
Object.assign(process.env, {
  MONGODB_URI: 'mongodb://127.0.0.1:27027/si_traffic_staging_phone',
  SI_TRAFFIC_STAGING_DB_NAME: 'si_traffic_staging_phone',
  SI_DEPLOYMENT_ENV: 'staging',
  TRAFFIC_PILOT_ENABLED: 'true',
  TRAFFIC_CERTIFICATES_ENABLED: 'false',
  TRAFFIC_STAGING_FRONTEND_URL: stagingOrigin + '/traffic-self-study.html',
  PORT: '5512',
});
const originalFetch = global.fetch;
global.fetch = (input, options) => {
  if (String(input) !== 'https://api.brevo.com/v3/smtp/email' || !mailReady) {
    throw new Error('Outbound requests from this QA application are disabled.');
  }
  const body = JSON.parse(options.body);
  if (body.to?.length !== 1 || body.to[0].email.toLowerCase() !== testEmail ||
      body.cc?.length || body.bcc?.length) {
    throw new Error('Only the configured test mailbox can receive mail.');
  }
  for (const field of ['textContent', 'htmlContent']) {
    body[field] = body[field].replaceAll(stagingOrigin, previewOrigin);
  }
  return originalFetch(input, {...options, body: JSON.stringify(body), redirect: 'error'});
};
require('../backend/server.js');

const app = express();
app.disable('x-powered-by');
app.use(express.json({limit: '16kb'}));
app.use((req, res, next) => {
  res.set('Referrer-Policy', 'no-referrer');
  res.set('Cache-Control', 'no-store');
  next();
});
app.get('/', (_req, res) => res.redirect('/traffic-self-study-register.html'));
app.get('/traffic-staging-config.js', (_req, res) => {
  res.type('js').send(fs.readFileSync(path.join(frontend, 'traffic-staging-config.js'), 'utf8') +
    '\nwindow.SI_TRAFFIC_STAGING_API = location.origin;\n');
});

const readable = new RegExp('^/api/self-study/(?:me|final-assessment|traffic-feedback|courses/' +
  slug + '(?:/screens)?|screens/tm[1-5]s[12])$');
const writable = /^\/api\/self-study\/(?:register|access\/request|session\/exchange|heartbeat|final-assessment|traffic-feedback|screens\/tm[1-5]s[12]\/assessment)$/;
app.use('/api', (req, res) => {
  const pathname = req.baseUrl + req.path;
  if (!(req.method === 'GET' && readable.test(pathname)) &&
      !(req.method === 'POST' && writable.test(pathname))) {
    return res.sendStatus(404);
  }
  if (/\/(?:register|access\/request)$/.test(pathname)) {
    if (!mailReady) return res.status(503).json({message: 'Staging mail is not configured.'});
    if (req.body?.courseSlug !== slug || String(req.body.email).trim().toLowerCase() !== testEmail) {
      return res.status(400).json({message: 'Use the approved staging test mailbox.'});
    }
  }
  const body = req.method === 'POST' ? JSON.stringify(req.body ?? {}) : '';
  const upstream = http.request({
    host:'127.0.0.1', port:5512, path:req.originalUrl, method:req.method,
    headers:{
      authorization:req.headers.authorization || '',
      'content-type':'application/json',
      'content-length':Buffer.byteLength(body),
    },
  }, reply => {
    res.status(reply.statusCode);
    if (reply.headers['content-type']) res.set('Content-Type', reply.headers['content-type']);
    reply.pipe(res);
  });
  upstream.on('error', () => res.sendStatus(502));
  upstream.end(body);
});
app.use((req, res, next) => {
  if (['/traffic-self-study-register.html', '/traffic-self-study.html'].includes(req.path) ||
      /^\/(?:style\.css|bilingual\.css|assets\/traffic-videos\/[a-z0-9_-]+\.(?:mp4|en\.vtt))$/i.test(req.path)) {
    return next();
  }
  return res.sendStatus(404);
});
app.use(express.static(frontend, {index:false, redirect:false}));
app.listen(8815, '0.0.0.0', () => console.log('Traffic phone QA: port 8815; real mail '+(mailReady?'enabled for one test mailbox':'disabled')));
