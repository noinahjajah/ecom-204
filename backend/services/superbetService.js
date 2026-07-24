// 📄 backend/services/superbetService.js
// Superbet shipping integration — runs server-side only so the API key never
// reaches the browser bundle (previously called directly from frontend/src/cart.js
// using a VITE_ prefixed env var, which is inlined into the client JS bundle).

const SUPERBET_KEY = process.env.SUPERBET_API_KEY;
const SUPERBET_ENDPOINT = process.env.SUPERBET_ENDPOINT || 'https://api.superbet.com/v1';

async function createTracking(orderData) {
  if (!SUPERBET_KEY) return null;

  try {
    const res = await fetch(`${SUPERBET_ENDPOINT}/shipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPERBET_KEY}`,
      },
      body: JSON.stringify({
        order_id: orderData.id,
        recipient: {
          name: orderData.shippingAddress?.fullName,
          phone: orderData.shippingAddress?.phone,
          address: orderData.shippingAddress?.address,
          district: orderData.shippingAddress?.district,
          province: orderData.shippingAddress?.province,
          postcode: orderData.shippingAddress?.postcode,
        },
        items: (orderData.items || []).map((item) => ({
          name: item.name,
          qty: item.qty,
          value: item.price,
        })),
        cod_amount: orderData.total,
      }),
    });

    if (!res.ok) throw new Error(`Superbet tracking failed: ${res.status}`);
    const data = await res.json();
    return {
      trackingNumber: data.tracking_number,
      trackingUrl: data.tracking_url || `https://superbet.com/track?code=${data.tracking_number}`,
      carrier: 'Superbet Express',
      estimatedDelivery: data.estimated_delivery,
    };
  } catch (err) {
    console.warn('[Superbet] Tracking creation failed (non-critical):', err.message);
    return null;
  }
}

async function getStatus(trackingNumber) {
  if (!SUPERBET_KEY || !trackingNumber) return null;

  try {
    const res = await fetch(`${SUPERBET_ENDPOINT}/shipments/${encodeURIComponent(trackingNumber)}/status`, {
      headers: { 'Authorization': `Bearer ${SUPERBET_KEY}` },
    });

    if (!res.ok) throw new Error(`Superbet status failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Superbet] Status check failed:', err.message);
    return null;
  }
}

module.exports = { createTracking, getStatus };
