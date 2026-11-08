require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const sessions = new Map();

app.use(express.json());

// Add the hero-only atmosphere and visual overrides when serving the homepage.
app.get(['/', '/index.html'], async (req, res, next) => {
  try {
    const html = await fs.promises.readFile(path.join(__dirname, 'public', 'index.html'), 'utf8');
    const withHeroAtmosphere = html.replace(
      '<header class="frame" id="top">',
      '<header class="frame" id="top">\n<div class="hero-atmosphere" aria-hidden="true"></div>'
    );
    res.type('html').send(withHeroAtmosphere.replace('</head>', '  <link rel="stylesheet" href="/overrides.css">\n</head>'));
  } catch (error) {
    next(error);
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/libs/gsap', express.static(path.join(__dirname, 'node_modules/gsap/dist')));
app.use('/libs/motion', express.static(path.join(__dirname, 'node_modules/motion/dist')));

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

  const token = crypto.randomUUID();
  sessions.set(token, Date.now() + 8 * 60 * 60 * 1000);
  res.json({ token });
});

/* admin: check token */
function requireAdmin(req, res, next) {
  const token = req.headers['x-token'];
  const expires = sessions.get(token);
  if (!expires || expires < Date.now()) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Please log in again.' });
  }
  next();
}

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

app.listen(PORT, () => {
  console.log('Website running on http://localhost:' + PORT);
});
