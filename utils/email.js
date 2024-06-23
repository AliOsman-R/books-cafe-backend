const nodemailer = require('nodemailer')
const asyncHandler = require('../middleware/tryCatch');
const Token = require('../models/tokenModel');
const crypto = require('crypto');

exports.sendEmail = asyncHandler(async (email, subject, html ) => {

    const transporter = nodemailer.createTransport({
        service:process.env.SERVICE,
        host:process.env.HOST,
        port:Number(process.env.EMAIL_PORT),
        secure:Boolean(process.env.SECURE),
        auth:{
            user:process.env.USER,
            pass:process.env.PASS
        }
    })

    const info = await transporter.sendMail({
        from: '"CafeX" "<support@Cafex.com>"',
        to: email,
        subject: subject,
        text: subject,
        html:html,
    });

      return info.messageId
})

exports.generateEmailTemplate = (title, name, message) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    padding: 0;
                    color: #333;
                }
                .container {
                    background-color: #f9f9f9;
                    border: 1px solid #ddd;
                    padding: 20px;
                }
                .header {
                    background-color: #f59e0b;
                    color: #ffffff;
                    padding: 10px;
                    text-align: center;
                }
                .content {
                    margin-top: 20px;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 0.8em;
                    text-align: center;
                }
  
            </style>
        </head>
          <body>
              <div class="container">
                  <div class="header">
                      ${title}
                  </div>
                  <div class="content">
                      <p>Dear ${name},</p>
                      <p>${message}</p>
                  </div>
                  <div class="footer">
                      This is an automated message. Please do not reply directly to this email.
                  </div>
              </div>
          </body>
        </html>
      `;
  }


exports.generateVerifyEmail = async (user) => {
    const token = await Token.create({
        userId:user._id,
        token:crypto.randomBytes(32).toString("hex"),
        type:"email"
    })

    const url = `${process.env.BASE_URL}/email/${user._id}/verify/${token.token}`

    const htmlStr = `
    <p>To continue setting up your CafeX account, please click the link below:</p>
    <a href="${url}">${url}</a>
    `
    const html = this.generateEmailTemplate('Verify Your Email', user.name, htmlStr)
    
    await this.sendEmail(user.email, 'CafeX - Verify Your Email', html)
}


exports.generateForgotPass = async (user) => {
    const token = await Token.create({
        userId:user._id,
        token:crypto.randomBytes(32).toString("hex"),
        type:"password"
    })

    const url = `${process.env.BASE_URL}/auth/reset-password/${user._id}/${token.token}`

    const htmlStr = `
            <p>To reset your password please click the link below:</p>
            <a href="${url}">${url}</a> <br>
            <span>This link will expire in an hour. If you did not make this request, please disregard this email.</span>
        `

    const html = this.generateEmailTemplate('Verify Your Email', user.name, htmlStr)
    await this.sendEmail(user.email, 'CafeX - Reset Your Password', html)
}


exports.generatePaymentEmail = (order, user) => {
    const productsHtml = order.products.map(product => `
    <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${product.item.name || product.item.title}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${product.price} RM</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${product.quantity}</td>
    </tr>
`).join('');

const htmlStr = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="text-align: center; color: #333;">Your payment has been confirmed: ${order.totalPrice} RM</h2>
        <h3 style="text-align: center; color: #333;">Order Id: ${order.orderId}</h3>
        <p style="text-align: center; color: #333;">The order is pending now, once the cafe confirms it the status will be changed.</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
                <tr>
                    <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Product</th>
                    <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Price</th>
                    <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Quantity</th>
                </tr>
            </thead>
            <tbody>
                ${productsHtml}
            </tbody>
        </table>
        <h3 style="color: #333;">Delivery Details</h3>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Phone Number:</strong> ${order.phoneNumber}</p>
        <p><strong>Address 1:</strong> ${order.firstAddress}</p>
        <p><strong>Address 2:</strong> ${order.secondAddress}</p>
        <p><strong>Special Requests:</strong> ${order.specialRequest}</p>
    </div>
`;

    const html = this.generateEmailTemplate('Payment Confirmation', user.name, htmlStr);

    return html
};


exports.generateOrderDeliveredEmail = (order, user) => {
    const productsHtml = order.products.map(product => `
        <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${product.item.name || product.item.title}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${product.price} RM</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${product.quantity}</td>
        </tr>
    `).join('');

    const htmlStr = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2 style="text-align: center; color: #333;">Your order has been delivered!</h2>
            <h3 style="text-align: center; color: #333;">Order Id: ${order.orderId}</h3>
            <p style="text-align: center; color: #333;">Thank you for choosing CafeX. Your order has been delivered successfully.</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr>
                        <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Product</th>
                        <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Price</th>
                        <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    ${productsHtml}
                </tbody>
            </table>
            <h3 style="color: #333;">Delivery Details</h3>
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Phone Number:</strong> ${order.phoneNumber}</p>
            <p><strong>Address 1:</strong> ${order.firstAddress}</p>
            <p><strong>Address 2:</strong> ${order.secondAddress}</p>
            <p><strong>Special Requests:</strong> ${order.specialRequest}</p>
        </div>
    `;

    const html = this.generateEmailTemplate('Order Delivered', user.name, htmlStr);
    
    return html
};

