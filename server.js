require('dotenv').config();
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const SECRET = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || '';

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "frame-ancestors 'none'; base-uri 'self'; object-src 'none'"
  });
  next();
});
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

/* ---------- small in-memory rate limiter (per visitor IP) ---------- */
const hits = new Map();
function limited(key, max, windowMs) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter(t => now - t < windowMs);
  if (list.length >= max) { hits.set(key, list); return true; }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) { for (const [k, v] of hits) if (!v.length || now - v[v.length - 1] > windowMs) hits.delete(k); }
  return false;
}
const ipOf = req => String(req.ip || req.socket.remoteAddress || 'x');

/* ---------- order validation ---------- */
const clean = v => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim();
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s'.\-]{1,79}$/u;
const EMAIL_RE = /^[A-Za-z0-9._%+\-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,24}$/;
const COMPANY_RE = /^[\p{L}\p{M}\p{N}\s&.,'\u2019\-\/()+!]{1,80}$/u;
function validateOrder(b) {
  const o = {
    full_name: clean(b.full_name),
    email: clean(b.email).toLowerCase(),
    phone: String(b.phone || '').replace(/[\s\-().]/g, ''),
    company: clean(b.company)
  };
  if (!NAME_RE.test(o.full_name)) return { code: 'name' };
  if (o.email.length > 160 || !EMAIL_RE.test(o.email) || o.email.includes('..')) return { code: 'email' };
  if (o.phone) {
    if (!/^\+[1-9]\d{6,14}$/.test(o.phone)) return { code: 'phone' };
    if (o.phone.startsWith('+213') && !/^\+213[567]\d{8}$/.test(o.phone)) return { code: 'phone' };
  }
  if (o.company && !COMPANY_RE.test(o.company)) return { code: 'company' };
  return { order: o };
}

/* ---------- signed login token (works on Vercel, no memory needed) ---------- */
function sign(value) {
  return crypto.createHmac('sha256', SECRET).update(value).digest('hex');
}

function makeToken() {
  const exp = String(Date.now() + 8 * 60 * 60 * 1000);
  return exp + '.' + sign(exp);
}

function validToken(token) {
  if (!token || !SECRET) return false;
  const parts = String(token).split('.');
  if (parts.length !== 2) return false;
  const a = Buffer.from(parts[1]);
  const b = Buffer.from(sign(parts[0]));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Number(parts[0]) > Date.now();
}

function requireAdmin(req, res, next) {
  if (!validToken(req.headers['x-token'])) {
    return res.status(401).json({ error: 'Please log in again.' });
  }
  next();
}

/* email me when a new order arrives (Resend). Never blocks or fails the order. */
const esc = v => String(v || '-').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function notifyOrder(o) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.warn('RESEND_API_KEY is not set: order email skipped.'); return; }
  const to = process.env.NOTIFY_EMAIL || 'onecode213@gmail.com';
  const from = process.env.NOTIFY_FROM || 'OneCode+ Orders <onboarding@resend.dev>';
  const row = (k, v) => `<tr><td style="padding:8px 14px;color:#6b7f95">${k}</td><td style="padding:8px 14px;font-weight:600">${esc(v)}</td></tr>`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #dbe6f3;border-radius:16px;overflow:hidden">
<div style="background:linear-gradient(90deg,#2f6bff,#1f3fd0);color:#fff;padding:18px 22px;font-size:18px;font-weight:700">New order on OneCode+</div>
<table style="width:100%;border-collapse:collapse;font-size:15px">${row('Name', o.full_name)}${row('Email', o.email)}${row('Phone', o.phone)}${row('Company', o.company)}</table>
<div style="padding:14px 22px;color:#6b7f95;font-size:13px">Manage it in your dashboard: /admin.html</div></div>`;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: o.email, subject: 'New order from ' + o.full_name, html })
    });
    if (!r.ok) console.error('Order email failed:', r.status, await r.text());
  } catch (e) { console.error('Order email error:', e.message); }
}

/* public: save an order */
app.post('/api/orders', async (req, res) => {
  const b = req.body || {};

  /* bots: the hidden "website" field must stay empty. Pretend it worked. */
  if (b.website) return res.json({ ok: true });

  if (limited('order:' + ipOf(req), 4, 15 * 60 * 1000)) {
    return res.status(429).json({ code: 'rate', error: 'Too many requests. Please try again later.' });
  }

  /* the form must have been open for at least 2.5 seconds (and not be stale) */
  const age = Date.now() - Number(b.ts);
  if (!Number.isFinite(age) || age < 2500 || age > 24 * 60 * 60 * 1000) {
    return res.status(400).json({ code: 'fast', error: 'Please try again.' });
  }

  const v = validateOrder(b);
  if (v.code) return res.status(400).json({ code: v.code, error: 'Please check your details and try again.' });
  const order = v.order;

  /* same email twice within 10 minutes = duplicate */
  if (limited('dup:' + order.email, 1, 10 * 60 * 1000)) {
    return res.status(429).json({ code: 'dup', error: 'We already received your order.' });
  }

  const { error } = await supabase.from('orders').insert(order);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not save your order.' });
  }

  await notifyOrder(order); /* awaited so it also finishes on Vercel */
  res.json({ ok: true });
});

/* admin: login */
app.post('/api/admin/login', (req, res) => {
  if (limited('login:' + ipOf(req), 8, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' });
  }
  const password = String(req.body.password || '');
  const a = Buffer.from(password);
  const b = Buffer.from(String(process.env.ADMIN_PASSWORD || ''));
  const valid = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!valid) {
    return setTimeout(() => res.status(401).json({ error: 'Wrong password.' }), 800);
  }

  res.json({ token: makeToken() });
});

/* admin: list orders */
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not load orders.' });
  }
  res.json(data);
});

/* admin: change status */
app.patch('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  const allowed = ['new', 'in progress', 'done'];
  const status = String(req.body.status || '');
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  const { error } = await supabase.from('orders').update({ status }).eq('id', req.params.id);
  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not update the order.' });
  }
  res.json({ ok: true });
});

/* admin: delete order */
app.delete('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  const { error } = await supabase.from('orders').delete().eq('id', req.params.id);
  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not delete the order.' });
  }
  res.json({ ok: true });
});

/* run locally with: npm start  (Vercel uses the exported app) */
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('Website running on http://localhost:' + PORT);
  });
}

module.exports = app;