// 📄 backend/services/addressesService.js
// Saved shipping address operations with Supabase

const rouvoService = require('./rouvoService');

async function getAddresses(supabase, userId) {
  if (!userId) throw new Error('User ID required');

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to fetch addresses: ${error.message}`);
  return data || [];
}

function genId() {
  return `addr-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// Insert หรือ update ที่อยู่ทีเดียว (id เดียวกับที่ frontend generate ไว้อยู่แล้ว
// ใช้เป็น primary key ตรงๆ เพื่อให้ id ไม่เปลี่ยนระหว่าง localStorage cache กับ DB)
async function upsertAddress(supabase, userId, addr) {
  if (!userId) throw new Error('User ID required');

  const id = addr.id || genId();
  const isDefault = !!addr.isDefault;

  // ที่อยู่ default ได้ทีละอันต่อ user — เคลียร์ default เดิมก่อนถ้าอันนี้จะกลายเป็น default
  if (isDefault) {
    const { error: clearErr } = await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
      .neq('id', id);
    if (clearErr) throw new Error(`Failed to clear previous default address: ${clearErr.message}`);
  }

  const row = {
    id,
    user_id: userId,
    full_name: addr.fullName || '',
    phone: addr.phone || '',
    email: addr.email || '',
    address: addr.address || '',
    district: addr.district || '',
    province: addr.province || '',
    postcode: addr.postcode || '',
    preferred_carrier: addr.preferredCarrier || 'superbet',
    is_default: isDefault,
    note: addr.note || '',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('addresses')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new Error(`Failed to save address: ${error.message}`);

  // 🔄 Sync กับ Rouvo CRM (non-blocking, ไม่กระทบผลลัพธ์ที่ส่งกลับให้ frontend)
  rouvoService.syncAddress(data).catch(() => {});

  return data;
}

async function removeAddress(supabase, userId, id) {
  if (!userId || !id) throw new Error('Invalid parameters');

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to remove address: ${error.message}`);
}

async function setDefaultAddress(supabase, userId, id) {
  if (!userId || !id) throw new Error('Invalid parameters');

  const { error: clearErr } = await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', userId);
  if (clearErr) throw new Error(`Failed to clear previous default address: ${clearErr.message}`);

  const { data, error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to set default address: ${error.message}`);
  return data;
}

module.exports = {
  getAddresses,
  upsertAddress,
  removeAddress,
  setDefaultAddress,
};
