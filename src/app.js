const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

// Import routes
// const retailerRoutes = require('./routes/retailers');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined')); // Use morgan for logging requests

app.get('/', (req, res) => {
  res.send('Welcome to Fresh Produce Platform');
});

// app.use('/api/retailers', retailerRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);

module.exports = app;
