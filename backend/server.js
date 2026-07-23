require('dotenv').config();
const express = require('express');
const cors = require('cors');

const loginRoutes = require('./routes/login_router');
const productsRoutes = require('./routes/products_router'); // 🆕 products REST API

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

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});