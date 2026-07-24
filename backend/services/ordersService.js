// 📄 backend/services/ordersService.js
// Order history operations with Supabase

async function getOrders(supabase, userId) {
  if (!userId) throw new Error('User ID required');

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
  return data || [];
}

// Insert หรือ update order ทีเดียว (id เดียวกับที่ frontend generate ไว้อยู่แล้ว
// ใช้เป็น primary key ตรงๆ เหมือน addressesService.upsertAddress เพื่อให้ id ไม่เปลี่ยน
// ระหว่าง localStorage cache กับ DB)
async function upsertOrder(supabase, userId, order) {
  if (!userId) throw new Error('User ID required');
  if (!order?.id) throw new Error('Order ID required');

  const row = {
    id: order.id,
    user_id: userId,
    items: order.items || [],
    subtotal: order.subtotal || 0,
    discount: order.discount || 0,
    shipping_fee: order.shippingFee || 0,
    total: order.total || 0,
    applied_coupon: order.appliedCoupon || null,
    status: order.status || 'รอดำเนินการ',
    payment_method: order.paymentMethod || null,
    card_info: order.cardInfo || null,
    shipping_address: order.shippingAddress || null,
    address_id: order.addressId || null,
    customer_name: order.customerName || '',
    customer_email: order.customerEmail || '',
    carrier: order.carrier || null,
    tracking_number: order.trackingNumber || null,
    tracking_url: order.trackingUrl || null,
    estimated_delivery: order.estimatedDelivery || null,
    status_history: order.statusHistory || [],
    created_at: order.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('orders')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new Error(`Failed to save order: ${error.message}`);
  return data;
}

// อัปเดตบางฟิลด์ของ order ที่มีอยู่แล้ว (สถานะ / เลข tracking หลังสร้างออเดอร์ไปแล้ว)
async function updateOrder(supabase, userId, id, patch = {}) {
  if (!userId || !id) throw new Error('Invalid parameters');

  const row = { updated_at: new Date().toISOString() };
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.trackingNumber !== undefined) row.tracking_number = patch.trackingNumber;
  if (patch.trackingUrl !== undefined) row.tracking_url = patch.trackingUrl;
  if (patch.estimatedDelivery !== undefined) row.estimated_delivery = patch.estimatedDelivery;
  if (patch.carrier !== undefined) row.carrier = patch.carrier;
  if (patch.statusHistory !== undefined) row.status_history = patch.statusHistory;

  const { data, error } = await supabase
    .from('orders')
    .update(row)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update order: ${error.message}`);
  return data;
}

module.exports = {
  getOrders,
  upsertOrder,
  updateOrder,
};
