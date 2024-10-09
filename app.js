const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome to Fresh Produce Platform');
});

// Import routes
// const retailerRoutes = require('./routes/retailers');
// const productRoutes = require('./routes/products');
// const orderRoutes = require('./routes/orders');

// app.use('/api/retailers', retailerRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);

module.exports = app;