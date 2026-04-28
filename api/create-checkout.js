/* ─── Scent Privé — Vercel Serverless Function ─── */
// api/create-checkout.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Tillåtna storlekar och deras priser (i kr)
const VALID_SIZES = {
  '6ml':  129,
  '12ml': 199,
};

const FREE_SHIPPING_THRESHOLD = 39900; // 399 kr i öre

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

    // Bygg Stripe-rader med validerade priser från servern
    const lineItems = [];
    for (const item of items) {
      const name = String(item.name || '').trim();
      const size = String(item.size || '').trim();
      const qty  = Math.max(1, Math.min(99, parseInt(item.qty, 10) || 1));

      if (!name) {
        return res.status(400).json({ error: 'Produktnamn saknas.' });
      }

      // Fallback till 6ml om storleken inte känns igen
      const unitPrice = VALID_SIZES[size] || VALID_SIZES['6ml'];

      lineItems.push({
        price_data: {
          currency: 'sek',
          product_data: {
            name: name,
            description: `Roll-on doftolja · ${size || '6ml'}`,
          },
          unit_amount: unitPrice * 100, // kr → öre
        },
        quantity: qty,
      });
    }

    // Beräkna ordervärde för frakt
    const orderTotal = lineItems.reduce(
      (sum, item) => sum + item.price_data.unit_amount * item.quantity, 0
    );

    const shippingOptions = orderTotal >= FREE_SHIPPING_THRESHOLD
      ? [{
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'sek' },
            display_name: 'Standardfrakt (fri över 399 kr)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 3 },
            },
          },
        }]
      : [{
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 4900, currency: 'sek' },
            display_name: 'Standardfrakt',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 3 },
            },
          },
        }];

    // Bygg site-URL
    let siteUrl = process.env.SITE_URL;
    if (!siteUrl && process.env.VERCEL_URL) {
      siteUrl = `https://${process.env.VERCEL_URL}`;
    }
    if (!siteUrl) siteUrl = 'http://localhost:3000';

    console.log('siteUrl:', siteUrl, '| orderTotal:', orderTotal, '| items:', lineItems.length);

    const session = await stripe.checkout.sessions.create({
      automatic_payment_methods: { enabled: true },
      line_items: lineItems,
      mode: 'payment',
      locale: 'sv',
      billing_address_collection: 'auto',

      shipping_address_collection: {
        allowed_countries: ['SE'],
      },

      shipping_options: shippingOptions,

      success_url: `${siteUrl}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${siteUrl}/kollektion.html`,
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('Stripe error type:', err.type);
    console.error('Stripe error message:', err.message);

    if (err.type === 'StripeAuthenticationError') {
      return res.status(500).json({ error: 'Betalningsinställningar saknas. Kontakta support.' });
    }
    if (err.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ error: `Betalningsfel: ${err.message}` });
    }

    return res.status(500).json({ error: 'Betalning misslyckades. Försök igen.' });
  }
};
