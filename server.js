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

/* public: save an order */
app.post('/api/orders', async (req, res) => {
  const { full_name, email, phone, company } = req.body;

  if (!full_name || !email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Name and a valid email are required.' });
  }

  const { error } = await supabase.from('orders').insert({
    full_name: String(full_name).trim().slice(0, 120),
    email: String(email).trim().slice(0, 160),
    phone: String(phone || '').trim().slice(0, 40),
    company: String(company || '').trim().slice(0, 120)
  });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not save your order.' });
  }

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