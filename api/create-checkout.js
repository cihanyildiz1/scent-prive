/* ─── Scent Privé — Vercel Serverless Function ─── */
// api/create-checkout.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Tillåtna storlekar och deras priser (i kr)
const VALID_SIZES = {
  '6ml':  129,
  '12ml': 199,
};

module.exports = async (req, res) => {
  // CORS-headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // Kontrollera att Stripe-nyckeln finns
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY saknas!');
    return res.status(500).json({ error: 'Serverkonfigurationsfel. Kontakta support.' });
  }

  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Varukorgen är tom.' });
    }

    // Bygg Stripe-rader med validerade priser från servern (ignorerar klientens pris)
    const lineItems = [];
    for (const item of items) {
      const name = String(item.name || '').trim();
      const size = String(item.size || '').trim();
      const qty  = Math.max(1, Math.min(99, parseInt(item.qty, 10) || 1));

      if (!name) {
        return res.status(400).json({ error: 'Produktnamn saknas.' });
      }

      const unitPrice = VALID_SIZES[size];
      if (!unitPrice) {
        return res.status(400).json({ error: `Ogiltig storlek: "${size}". Tillåtna: 6ml, 12ml.` });
      }

      lineItems.push({
        price_data: {
          currency: 'sek',
          product_data: {
            name: name,
            description: `Roll-on doftolja · ${size}`,
          },
          unit_amount: unitPrice * 100, // kr → öre
        },
        quantity: qty,
      });
    }

    // Bygg korrekt site-URL
    // SITE_URL = den du sätter manuellt på Vercel (t.ex. https://scent-prive.vercel.app)
    // VERCEL_URL sätts automatiskt av Vercel per deployment
    let siteUrl = process.env.SITE_URL;
    if (!siteUrl && process.env.VERCEL_URL) {
      siteUrl = `https://${process.env.VERCEL_URL}`;
    }
    if (!siteUrl) {
      siteUrl = 'http://localhost:3000';
    }

    console.log('Creating Stripe session with siteUrl:', siteUrl);
    console.log('Items:', JSON.stringify(lineItems));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      locale: 'sv',

      shipping_address_collection: {
        allowed_countries: ['SE'],
      },

      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'sek' },
            display_name: 'Standardfrakt (fri)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 3 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 4900, currency: 'sek' },
            display_name: 'Expressfrakt',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 1 },
            },
          },
        },
      ],

      success_url: `${siteUrl}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${siteUrl}/kollektion.html`,
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    // Logga hela felet på servern (syns i Vercel Logs)
    console.error('Stripe error type:', err.type);
    console.error('Stripe error message:', err.message);
    console.error('Full error:', JSON.stringify(err, null, 2));

    // Ge användaren ett meningsfullt felmeddelande
    if (err.type === 'StripeAuthenticationError') {
      return res.status(500).json({ error: 'Betalningsinställningar saknas. Kontakta support.' });
    }
    if (err.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ error: `Betalningsfel: ${err.message}` });
    }

    return res.status(500).json({ error: 'Betalning misslyckades. Försök igen.' });
  }
};
