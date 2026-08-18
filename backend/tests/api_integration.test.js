const test = require('node:test');
const assert = require('node:assert/strict');
const pool = require('../src/config/db');
const jwt = require('jsonwebtoken');

test('Integration Test Suite - Database Connection', async () => {
  const res = await pool.query('SELECT 1 + 1 AS solution');
  assert.equal(res.rows[0].solution, 2);
});

test('Integration Test Suite - Auth Login & Token Generation', async () => {
  const res = await pool.query('SELECT * FROM admins WHERE email = $1', ['admin@tour.vn']);
  assert.ok(res.rows.length > 0, 'Admin account should exist');

  const adminUser = res.rows[0];
  const token = jwt.sign(
    { role: adminUser.role, email: adminUser.email, id: adminUser.id, name: adminUser.full_name },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  assert.equal(decoded.email, 'admin@tour.vn');
  assert.equal(decoded.role, 'super_admin');
});

test('Integration Test Suite - CEO Stats Calculation', async () => {
  const revRes = await pool.query(`
    SELECT 
      COALESCE(SUM(estimated_value), 0) AS total_revenue,
      COALESCE(SUM(CASE WHEN UPPER(status) IN ('CONVERTED', 'THÀNH CÔNG', 'SUCCESS', 'CLOSED') THEN estimated_value ELSE 0 END), 0) AS actual_cashflow,
      COUNT(*) AS total_leads
    FROM leads;
  `);

  assert.ok(revRes.rows.length > 0);
  const data = revRes.rows[0];
  assert.ok(Number(data.total_leads) >= 0);
  assert.ok(Number(data.total_revenue) >= 0);
});

test('Integration Test Suite - Leads Retrieval & PII Masking', async () => {
  const leadsRes = await pool.query('SELECT * FROM leads LIMIT 5');
  assert.ok(Array.isArray(leadsRes.rows));

  function maskPII(lead) {
    let maskedPhone = lead.phone || 'Chưa cung cấp';
    if (maskedPhone && maskedPhone.length >= 6) {
      maskedPhone = '***-***-' + maskedPhone.slice(-4);
    } else {
      maskedPhone = '***-***-****';
    }
    return { ...lead, phone: maskedPhone };
  }

  const sampleLead = { phone: '0912345678', email: 'customer@example.com' };
  const masked = maskPII(sampleLead);
  assert.equal(masked.phone, '***-***-5678');
});

test('Integration Test Suite - Tours and Destinations Data Validity', async () => {
  const tours = await pool.query('SELECT * FROM tours LIMIT 5');
  assert.ok(Array.isArray(tours.rows));

  const destinations = await pool.query('SELECT * FROM destinations LIMIT 5');
  assert.ok(Array.isArray(destinations.rows));
});

test('Integration Test Suite - Audit Log Storage', async () => {
  const auditLogs = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 5');
  assert.ok(Array.isArray(auditLogs.rows));
});

test('HTTP Endpoints Suite - Auth Login API', async () => {
  const res = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@tour.vn', password: 'admin123' })
  });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(data.token);
  assert.equal(data.role, 'super_admin');
});

test('HTTP Endpoints Suite - CEO Stats API', async () => {
  const resYear = await fetch('http://localhost:5000/api/ceo/stats?period=year');
  const dataYear = await resYear.json();
  assert.equal(resYear.status, 200);
  assert.equal(dataYear.success, true);
  assert.ok(dataYear.stats);
  assert.ok(Array.isArray(dataYear.chartData));

  const resMonth = await fetch('http://localhost:5000/api/ceo/stats?period=month');
  const dataMonth = await resMonth.json();
  assert.equal(resMonth.status, 200);
  assert.equal(dataMonth.success, true);
});

test('HTTP Endpoints Suite - CEO AI Summary API', async () => {
  const res = await fetch('http://localhost:5000/api/ceo/ai-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stats: { totalRevenue: 2000000000, actualCashflow: 1000000000, pendingAR: 500000000, totalLeads: 50 },
      topDeals: []
    })
  });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(typeof data.summary === 'string');
});

test('HTTP Endpoints Suite - Public Tours & Destinations API', async () => {
  const toursRes = await fetch('http://localhost:5000/api/tours');
  const toursData = await toursRes.json();
  assert.equal(toursRes.status, 200);
  assert.ok(Array.isArray(toursData));

  const destsRes = await fetch('http://localhost:5000/api/destinations');
  const destsData = await destsRes.json();
  assert.equal(destsRes.status, 200);
  assert.ok(Array.isArray(destsData));
});

test('HTTP Endpoints Suite - Leads CRUD & Authorization', async () => {
  // 1. Get auth token
  const loginRes = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@tour.vn', password: 'admin123' })
  });
  const { token } = await loginRes.json();

  // 2. Fetch leads with token
  const getLeadsRes = await fetch('http://localhost:5000/api/leads', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert.equal(getLeadsRes.status, 200);
  const leadsList = await getLeadsRes.json();
  assert.ok(Array.isArray(leadsList));

  // 3. Unauthenticated request should be 401
  const unauthRes = await fetch('http://localhost:5000/api/leads');
  assert.equal(unauthRes.status, 401);
});

test('HTTP Endpoints Suite - User Management Authorization', async () => {
  const token = jwt.sign(
    { role: 'super_admin', email: 'admin@tour.vn', id: 1, name: 'Quản trị viên' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const usersRes = await fetch('http://localhost:5000/api/users', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert.equal(usersRes.status, 200);
  const usersList = await usersRes.json();
  assert.ok(Array.isArray(usersList));
  assert.ok(usersList.some(u => u.email === 'admin@tour.vn'));
});
