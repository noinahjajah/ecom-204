const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Belle Aura API',
      version: '1.0.0',
      description: 'API สำหรับระบบ login ของ Belle Aura (Maison Véra)',
    },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: ['./routes/*.js'], // อ่าน comment แบบ JSDoc จากไฟล์ใน routes/
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;