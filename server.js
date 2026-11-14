require('dotenv').config();
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const SECRET = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || '';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
  const { full_name, email, phone, company } = req.body;

  if (!full_name || !email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Name and a valid email are required.' });
  }

  const order = {
    full_name: String(full_name).trim().slice(0, 120),
    email: String(email).trim().slice(0, 160),
    phone: String(phone || '').trim().slice(0, 40),
    company: String(company || '').trim().slice(0, 120)
  };
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