module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  // Honeypot: bot akan mengisi field tersembunyi 'company'.
  // Diamkan seolah sukses agar bot tidak tahu dirinya ditolak.
  if (body.company) return res.status(200).json({ ok: true });

  const clamp = (v, n) => String(v || '').trim().slice(0, n);
  const name = clamp(body.name, 120);
  const email = clamp(body.email, 200);
  const message = clamp(body.message, 5000);

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const key = (process.env.RESEND_API_KEY || '').trim();
  const to = (process.env.CONTACT_TO || 'pajarcoding@gmail.com').trim();
  if (!key) return res.status(500).json({ error: 'Server not configured' });

  let r;
  try {
    r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Portfolio <onboarding@resend.dev>',
        to: [to],
        reply_to: email,
        subject: `Inquiry from ${name}`,
        text: `${message}\n\n—\nFrom: ${name} <${email}>`,
      }),
    });
  } catch (err) {
    return res.status(502).json({ error: 'Send failed' });
  }

  if (!r.ok) {
    const errData = await r.json().catch(() => ({}));
    return res.status(502).json({
      error: 'Send failed',
      status: r.status,
      detail: errData.message || errData.name || 'Resend rejected request'
    });
  }
  return res.status(200).json({ ok: true });
};
