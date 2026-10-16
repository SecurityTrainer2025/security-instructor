'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createStagingFrontendGate, register } = require('./avs-staging-frontend-routes');

function responseRecorder() {
  return {
    statusCode: null,
    payload: null,
    headers: {},
    contentType: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    type(value) { this.contentType = value; return this; },
    send(value) { this.body = value; return this; }
  };
}

test('staging frontend gate hides preview routes unless workshop is explicitly enabled', () => {
  const gate = createStagingFrontendGate(() => false);
  const res = responseRecorder();
  let nextCalled = false;
  gate({}, res, () => { nextCalled = true; });
  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.payload, { message: 'Not found' });
  assert.equal(nextCalled, false);
});

test('staging frontend gate adds a same-origin-only policy when enabled', () => {
  const gate = createStagingFrontendGate(() => true);
  const res = responseRecorder();
  let nextCalled = false;
  gate({}, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.match(res.headers['content-security-policy'], /connect-src 'self'/);
  assert.match(res.headers['content-security-policy'], /img-src 'self' data:/);
});

test('preview registers only the workshop page, its stylesheet and same-origin API config', () => {
  const routes = new Map();
  const app = {
    get(route, ...handlers) { routes.set(route, handlers); }
  };
  register(app, { isEnabled: () => true });
  assert.deepEqual([...routes.keys()], [
    '/staging/avs-emrg-2026.html',
    '/staging/style.css',
    '/staging/config.js'
  ]);
  const configResponse = responseRecorder();
  routes.get('/staging/config.js').at(-1)({}, configResponse);
  assert.equal(configResponse.contentType, 'application/javascript');
  assert.equal(configResponse.body, 'window.APP_CONFIG={API_BASE:window.location.origin};');
  assert.doesNotMatch(configResponse.body, /security-instructor\.onrender\.com/);
});
