// 📄 backend/services/rouvoService.js
// Rouvo CRM integration — runs server-side only so the API key never reaches
// the browser bundle (previously frontend/src/cart.js called Rouvo directly
// using a VITE_ prefixed env var, which Vite inlines into the client JS and
// exposes to anyone inspecting the page).

const ROUVO_KEY = process.env.ROUVO_API_KEY;
const ROUVO_ENDPOINT = process.env.ROUVO_ENDPOINT || 'https://api.rouvo.com/v1';

async function syncAddress(address) {
  if (!ROUVO_KEY) return null; // ยังไม่ได้ตั้งค่า → ข้าม

  try {
    const res = await fetch(`${ROUVO_ENDPOINT}/customers/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ROUVO_KEY}`,
      },
      body: JSON.stringify({
        address_id: address.id,
        name: address.fullName || address.name,
        phone: address.phone,
        email: address.email,
        line1: address.address || address.line1,
        city: address.district || address.city,
        state: address.province || address.state,
        postal_code: address.postcode,
        country: 'TH',
        preferred_carrier: address.preferredCarrier || 'superbet',
        is_default: address.isDefault || false,
      }),
    });

    if (!res.ok) throw new Error(`Rouvo sync failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Rouvo] Address sync failed (non-critical):', err.message);
    return null;
  }
}

async function createOrder(orderData) {
  if (!ROUVO_KEY) return null;

  try {
    const res = await fetch(`${ROUVO_ENDPOINT}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ROUVO_KEY}`,
      },
      body: JSON.stringify({
        order_id: orderData.id,
        customer_email: orderData.customerEmail,
        customer_name: orderData.customerName,
        items: orderData.items,
        subtotal: orderData.subtotal,
        discount: orderData.discount,
        shipping_fee: orderData.shippingFee,
        total: orderData.total,
        status: orderData.status,
        payment_method: orderData.paymentMethod,
        shipping_address: orderData.shippingAddress,
        carrier: orderData.carrier || 'superbet',
      }),
    });

    if (!res.ok) throw new Error(`Rouvo order failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Rouvo] Order sync failed (non-critical):', err.message);
    return null;
  }
}

module.exports = { syncAddress, createOrder };
