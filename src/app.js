const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const retailerRoutes = require('./routes/retailerRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));

app.get('/', (req, res) => {
  res.send('Welcome to Fresh Produce Platform');
});

// Use routes
app.use('/api/v1/admins', adminRoutes);
app.use('/api/v1/retailers', retailerRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);

module.exports = app;