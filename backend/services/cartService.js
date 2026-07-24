// 📄 backend/services/cartService.js
// Cart operations with Supabase

async function getCart(supabase, userId) {
  if (!userId) throw new Error('User ID required');

  const { data, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch cart: ${error.message}`);
  return data || [];
}

async function addToCart(supabase, userId, { productId, productName, category, variant, price, quantity, imageUrl }) {
  if (!userId) throw new Error('User ID required');
  if (!productId || quantity <= 0) throw new Error('Invalid product data');

  // Try to upsert (if same product+variant exists, increment qty)
  const { data: existing } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .eq('variant', variant || '')
    .single();

  if (existing) {
    // Update quantity
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update cart: ${error.message}`);
    return data;
  }

  // Insert new item
  const { data, error } = await supabase
    .from('cart_items')
    .insert([{
      user_id: userId,
      product_id: productId,
      product_name: productName,
      category: category || '',
      variant: variant || '',
      price: price,
      quantity: quantity,
      image_url: imageUrl || null,
    }])
    .select()
    .single();

  if (error) throw new Error(`Failed to add to cart: ${error.message}`);
  return data;
}

async function updateQty(supabase, userId, itemId, quantity) {
  if (!userId || !itemId || quantity < 1) throw new Error('Invalid parameters');

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity: quantity })
    .eq('id', itemId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update quantity: ${error.message}`);
  return data;
}

async function removeFromCart(supabase, userId, itemId) {
  if (!userId || !itemId) throw new Error('Invalid parameters');

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to remove from cart: ${error.message}`);
}

async function clearCart(supabase, userId) {
  if (!userId) throw new Error('User ID required');

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to clear cart: ${error.message}`);
}

module.exports = {
  getCart,
  addToCart,
  updateQty,
  removeFromCart,
  clearCart,
};
