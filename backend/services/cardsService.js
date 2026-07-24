// 📄 backend/services/cardsService.js
// Saved card operations with Supabase (เก็บแค่ brand + last4 + expiry, ไม่มีเลขบัตรเต็ม)

async function getCards(supabase, userId) {
  if (!userId) throw new Error('User ID required');

  const { data, error } = await supabase
    .from('saved_cards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to fetch saved cards: ${error.message}`);
  return data || [];
}

// id เดียวกับที่ frontend generate ไว้อยู่แล้ว (`${brand}-${last4}-${expiry}`, deterministic)
// ใช้เป็น primary key ตรงๆ + upsert เหมือน addresses/orders เพื่อกันบันทึกบัตรซ้ำ
async function addCard(supabase, userId, { id, brand, last4, expiry, name }) {
  if (!userId) throw new Error('User ID required');
  if (!id) throw new Error('Card ID required');

  const row = {
    id,
    user_id: userId,
    brand: brand || '',
    last4: last4 || '',
    expiry: expiry || '',
    name: name || '',
  };

  const { data, error } = await supabase
    .from('saved_cards')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new Error(`Failed to save card: ${error.message}`);
  return data;
}

async function removeCard(supabase, userId, id) {
  if (!userId || !id) throw new Error('Invalid parameters');

  const { error } = await supabase
    .from('saved_cards')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to remove card: ${error.message}`);
}

module.exports = {
  getCards,
  addCard,
  removeCard,
};
