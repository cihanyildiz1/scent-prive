/* ─── Scent Privé — Orderbekräftelse via Resend ─── */
// api/send-confirmation.js
// Anropas från checkout-success.html efter lyckad betalning.

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function sendEmail({ to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Scent Privé <info@scentprive.se>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
  return res.json();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { sessionId } = req.body || {};
  if (!sessionId) return res.status(400).json({ error: 'sessionId saknas' });

  try {
    // Hämta session från Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Betalning ej genomförd' });
    }

    const customerEmail = session.customer_details?.email || '';
    const customerName  = session.customer_details?.name  || 'Kund';
    const amountTotal   = (session.amount_total / 100).toFixed(0);
    const orderId       = session.id.slice(-8).toUpperCase();
    const shipping      = session.customer_details?.address || {};
    const shippingLine  = [shipping.line1, shipping.postal_code, shipping.city]
                          .filter(Boolean).join(', ');

    const items = session.line_items?.data || [];
    const itemRowsCustomer = items.map(i => `
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #2a2a2a; color:#ccc; font-family:Jost,sans-serif; font-size:14px;">${i.description || 'Produkt'}</td>
        <td style="padding:8px 0; border-bottom:1px solid #2a2a2a; color:#ccc; text-align:center;">${i.quantity}×</td>
        <td style="padding:8px 0; border-bottom:1px solid #2a2a2a; color:#c9a96e; text-align:right;">${(i.amount_total/100).toFixed(0)} kr</td>
      </tr>`).join('');

    const itemRowsStore = items.map(i => `
      <tr>
        <td style="padding:6px 0; border-bottom:1px solid #eee; font-size:14px;">${i.description || 'Produkt'}</td>
        <td style="padding:6px 0; border-bottom:1px solid #eee; text-align:center;">${i.quantity}×</td>
        <td style="padding:6px 0; border-bottom:1px solid #eee; text-align:right;">${(i.amount_total/100).toFixed(0)} kr</td>
      </tr>`).join('');

    // ── E-post till kunden ──────────────────────────────────────────────────
    if (customerEmail && process.env.RESEND_API_KEY) {
      await sendEmail({
        to: customerEmail,
        subject: `Orderbekräftelse #${orderId} — Scent Privé`,
        html: `<!DOCTYPE html>
<html lang="sv"><head><meta charset="UTF-8">
<style>
  body { background:#111; margin:0; padding:0; font-family:Georgia,serif; }
  .wrap { max-width:560px; margin:0 auto; background:#1a1a1a; border-radius:8px; overflow:hidden; }
  .header { background:linear-gradient(135deg,#1a1a1a,#2a2a2a); padding:40px 40px 32px; text-align:center; border-bottom:1px solid #c9a96e33; }
  .logo { font-family:Georgia,serif; font-size:22px; letter-spacing:.2em; color:#c9a96e; text-transform:uppercase; }
  .body { padding:36px 40px; }
  h1 { font-family:Georgia,serif; font-weight:300; font-size:26px; color:#f0ece4; margin:0 0 8px; }
  p { font-family:Helvetica,sans-serif; font-size:14px; color:#aaa; line-height:1.7; margin:0 0 20px; }
  table { width:100%; border-collapse:collapse; margin:20px 0; }
  .total-row td { padding:12px 0; color:#c9a96e; font-size:15px; font-weight:bold; }
  .info-box { background:#111; border-radius:6px; padding:16px 20px; margin:20px 0; }
  .info-box p { margin:4px 0; color:#888; font-size:13px; }
  .footer { padding:24px 40px; text-align:center; border-top:1px solid #222; }
  .footer p { font-size:12px; color:#555; margin:0; }
</style>
</head><body>
<div class="wrap">
  <div class="header">
    <div class="logo">Scent Privé</div>
  </div>
  <div class="body">
    <h1>Tack för din beställning, ${customerName.split(' ')[0]}!</h1>
    <p>Vi har mottagit din order och börjar förbereda den direkt. Du kan förvänta dig leverans inom 1–3 vardagar.</p>

    <table>
      <thead><tr>
        <th style="text-align:left; padding:8px 0; color:#666; font-size:12px; letter-spacing:.1em; text-transform:uppercase; border-bottom:1px solid #333;">Produkt</th>
        <th style="text-align:center; padding:8px 0; color:#666; font-size:12px; border-bottom:1px solid #333;">Antal</th>
        <th style="text-align:right; padding:8px 0; color:#666; font-size:12px; border-bottom:1px solid #333;">Pris</th>
      </tr></thead>
      <tbody>${itemRowsCustomer}</tbody>
      <tfoot><tr class="total-row">
        <td colspan="2">Totalt</td>
        <td style="text-align:right;">${amountTotal} kr</td>
      </tr></tfoot>
    </table>

    <div class="info-box">
      <p>📦 <strong style="color:#c9a96e;">Ordernummer:</strong> #${orderId}</p>
      ${shippingLine ? `<p>📍 <strong style="color:#c9a96e;">Leveransadress:</strong> ${shippingLine}</p>` : ''}
    </div>

    <p>Har du frågor? Svara på detta mail eller kontakta oss på Instagram <a href="https://instagram.com/scentprive.se" style="color:#c9a96e;">@scentprive.se</a></p>
  </div>
  <div class="footer">
    <p>© 2026 Scent Privé &nbsp;·&nbsp; <a href="https://www.scentprive.se" style="color:#555;">scentprive.se</a></p>
  </div>
</div>
</body></html>`,
      });
    }

    // ── E-post till butiken ─────────────────────────────────────────────────
    if (process.env.RESEND_API_KEY) {
      await sendEmail({
        to: 'info@scentprive.se',
        subject: `🛍 Ny order #${orderId} — ${amountTotal} kr från ${customerName}`,
        html: `<!DOCTYPE html>
<html lang="sv"><head><meta charset="UTF-8">
<style>
  body { background:#f5f5f5; margin:0; padding:20px; font-family:Helvetica,sans-serif; }
  .wrap { max-width:560px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.1); }
  .header { background:#1a1a1a; padding:24px 32px; }
  .header h2 { color:#c9a96e; margin:0; font-size:18px; letter-spacing:.1em; }
  .body { padding:28px 32px; }
  h3 { margin:0 0 16px; font-size:15px; color:#333; border-bottom:1px solid #eee; padding-bottom:8px; }
  table { width:100%; border-collapse:collapse; margin:12px 0 20px; font-size:14px; }
  .info { background:#f9f9f9; border-radius:6px; padding:14px 16px; margin:16px 0; font-size:14px; line-height:2; }
  .total { font-size:16px; font-weight:bold; color:#1a1a1a; }
</style>
</head><body>
<div class="wrap">
  <div class="header"><h2>NY BESTÄLLNING — SCENT PRIVÉ</h2></div>
  <div class="body">
    <h3>Kunduppgifter</h3>
    <div class="info">
      <strong>Namn:</strong> ${customerName}<br>
      <strong>E-post:</strong> ${customerEmail}<br>
      ${shippingLine ? `<strong>Adress:</strong> ${shippingLine}` : ''}
    </div>

    <h3>Produkter</h3>
    <table>
      <thead><tr>
        <th style="text-align:left; padding:6px 0; color:#666; font-size:12px; border-bottom:1px solid #ddd;">Produkt</th>
        <th style="text-align:center; padding:6px 0; color:#666; font-size:12px; border-bottom:1px solid #ddd;">Antal</th>
        <th style="text-align:right; padding:6px 0; color:#666; font-size:12px; border-bottom:1px solid #ddd;">Pris</th>
      </tr></thead>
      <tbody>${itemRowsStore}</tbody>
      <tfoot><tr>
        <td colspan="2" style="padding:10px 0; font-weight:bold;" class="total">Totalt</td>
        <td style="text-align:right; padding:10px 0; font-weight:bold;" class="total">${amountTotal} kr</td>
      </tr></tfoot>
    </table>

    <p style="font-size:13px; color:#888;">Ordernummer: #${orderId} &nbsp;·&nbsp; Stripe session: ${sessionId}</p>
  </div>
</div>
</body></html>`,
      });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('send-confirmation error:', err);
    return res.status(500).json({ error: err.message });
  }
};
