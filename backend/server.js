require('dotenv').config();
const express = require('express');
const cors = require('cors');

const loginRoutes = require('./routes/login_router');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // TODO: จำกัด origin ให้เป็นโดเมนของหน้าบ้านจริงตอน deploy
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.use('/api', loginRoutes);

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
