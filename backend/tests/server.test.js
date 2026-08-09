const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/server');

function createMockRes() {
  let statusCode = 200;
  let jsonResponse = null;
  const headers = {};

  return {
    get statusCode() { return statusCode; },
    get jsonResponse() { return jsonResponse; },
    status(code) {
      statusCode = code;
      return this;
    },
    setHeader(name, value) {
      headers[name.toLowerCase()] = value;
      return this;
    },
    getHeader(name) {
      return headers[name.toLowerCase()];
    },
    getHeaderNames() {
      return Object.keys(headers);
    },
    json(body) {
      jsonResponse = body;
      return this;
    }
  };
}

test('GET / returns 200 success message', () => {
  const req = { method: 'GET', url: '/', headers: {} };
  const res = createMockRes();

  app(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.jsonResponse.success, true);
  assert.equal(res.jsonResponse.message, 'Touris Vietnam API Server is running');
});

test('GET /api returns 200 success message', () => {
  const req = { method: 'GET', url: '/api', headers: {} };
  const res = createMockRes();

  app(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.jsonResponse.success, true);
  assert.equal(res.jsonResponse.message, 'Touris Vietnam API Endpoints');
});

test('GET /api/non-existent-endpoint returns 404 Not Found', () => {
  const req = { method: 'GET', url: '/api/non-existent-endpoint', headers: {} };
  const res = createMockRes();

  app(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.jsonResponse.success, false);
  assert.equal(res.jsonResponse.message, 'API Endpoint Not Found');
});
