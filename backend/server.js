require('dotenv').config();
const express = require('express');
const cors = require('cors');

const loginRoutes = require('./routes/login_router');
const productsRoutes = require('./routes/products_router'); // 🆕 products REST API
const cartRoutes = require('./routes/cart_router'); // 🆕 cart REST API
const addressesRoutes = require('./routes/addresses_router'); // 🆕 saved shipping addresses REST API
const ordersRoutes = require('./routes/orders_router'); // 🆕 order history REST API
const cardsRoutes = require('./routes/cards_router'); // 🆕 saved cards REST API
const integrationsRoutes = require('./routes/integrations_router'); // 🆕 Rouvo/Superbet proxy REST API

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // TODO: จำกัด origin ให้เป็นโดเมนของหน้าบ้านจริงตอน deploy
// ⚠️ Default express.json() limit is 100kb. AddEditProduct.jsx's gallery/
// main image are base64 data URLs (resized to ~1000px JPEG, but that's
// still often 200KB–1MB+ as base64 text), so the default limit silently
// rejects any product save that includes a photo — the request never
// even reaches products_router.js. Raised to 10mb to cover that.
app.use(express.json({ limit: "20mb" }));

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.use('/api', loginRoutes);
app.use('/api', productsRoutes); // 🆕 mounts GET/POST/PATCH/DELETE /api/products...
app.use('/api', cartRoutes); // 🆕 mounts GET/POST/PATCH/DELETE /api/cart...
app.use('/api', addressesRoutes); // 🆕 mounts GET/POST/PATCH/DELETE /api/addresses...
app.use('/api', ordersRoutes); // 🆕 mounts GET/POST/PATCH /api/orders...
app.use('/api', cardsRoutes); // 🆕 mounts GET/POST/DELETE /api/cards...
app.use('/api', integrationsRoutes); // 🆕 mounts POST /api/integrations/rouvo/... , /api/integrations/superbet/...

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});