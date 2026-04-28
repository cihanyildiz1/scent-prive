/* ─── Scent Privé — Netlify Function: create-checkout.js ─── */
// Runs server-side on Netlify. Never exposed to the browser.
// Requires env variable: STRIPE_SECRET_KEY

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ── Server-side price validation ──────────────────────────────────────────────
// Maps product names + sizes to their allowed prices in SEK.
// This prevents users from manipulating prices on the frontend.
const ALLOWED_PRICES = {
  'Scent Imagination':  { '6ml': 129, '12ml': 199 },
  'Scent Madawi Gold':  { '6ml': 129, '12ml': 199 },
  'Scent 2nd Wife':     { '6ml': 129, '12ml': 199 },
  'Scent Golden Dust':  { '6ml': 129, '12ml': 199 },
  'Scent Althair':      { '6ml': 129, '12ml': 199 },
  'Scent Coco Vanillia':{ '6ml': 129, '12ml': 199 },
};

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // CORS headers so the browser can call this from the same Netlify domain
  const headers = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { items } = JSON.parse(event.body || '{}');

    if (!items || !Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Varukorgen är tom.' }) };
    }

    // Build validated Stripe line items
    const lineItems = [];
    for (const item of items) {
      const productPrices = ALLOWED_PRICES[item.name];
      if (!productPrices) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: `Okänd produkt: ${item.name}` }) };
      }
      const validatedPrice = productPrices[item.size];
      if (!validatedPrice) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: `Okänd storlek: ${item.size}` }) };
      }

      lineItems.push({
        price_data: {
          currency: 'sek',
          product_data: {
            name: `${item.name}`,
            description: `Roll-on doftolja · ${item.size}`,
          },
          unit_amount: validatedPrice * 100, // Stripe uses öre (smallest currency unit)
        },
        quantity: Math.max(1, Math.min(99, parseInt(item.qty, 10) || 1)),
      });
    }

    // Determine the site URL for redirect links
    const siteUrl = process.env.URL || 'http://localhost:8888';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      locale: 'sv',

      // Collect shipping address (Sweden only)
      shipping_address_collection: {
        allowed_countries: ['SE'],
      },

      // Flat-rate shipping options
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'sek' },
            display_name: 'Fri frakt',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 3 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 4900, currency: 'sek' }, // 49 kr
            display_name: 'Expressfrakt',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 1 },
            },
          },
        },
      ],

      // Redirect URLs after payment
      success_url: `${siteUrl}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${siteUrl}/kollektion.html`,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('Stripe error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Betalning misslyckades. Försök igen.' }),
    };
  }
};
