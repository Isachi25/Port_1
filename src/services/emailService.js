const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const logger = require('../utils/logger');
require('dotenv').config();

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to send email
async function sendEmail(mailOptions) {
  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to: ${mailOptions.to}`);
  } catch (err) {
    logger.error(`Error sending email: ${err.message}`);
    throw new Error('Error sending email');
  }
}

// Function to generate order confirmation email template
function generateOrderConfirmationEmail(orders) {
  console.log('Generating order confirmation email, ', orders);
  const templatePath = path.join(__dirname, '../utils/orderTemplate.html');
  const htmlTemplate = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(htmlTemplate);

  const emailData = {
    clientName: orders[0].clientName,
    address: orders[0].address,
    status: orders[0].status,
    orders: orders.map(order => ({
      productId: order.productId,
      productName: order.product.name,
      productDescription: order.product.description,
      quantity: order.quantity,
      price: order.product.price,
      totalPrice: order.totalPrice
    }))
  };

  const htmlToSend = template(emailData);

  return {
    from: process.env.EMAIL_USER,
    to: orders[0].email,
    subject: 'Order Confirmation',
    html: htmlToSend
  };
}

module.exports = {
  sendEmail,
  generateOrderConfirmationEmail
};