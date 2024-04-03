const nodemailer = require('nodemailer')
const asyncHandler = require('../middleware/tryCatch');

exports.sendEmail = asyncHandler(async (email, subject, {url, htmlStr, btn}) => {

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
        html: `
            <div style="text-align: center;">
                <h1 style="color: #333;">
                    CafeX
                </h1>
                ${htmlStr}
                <a href="${url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">${btn}</a>
                <br/><br/>
                <span>This link will expire in an hour. If you did not make this request, please disregard this email.</span>
            </div>
        `,
    });

      console.log("Message sent: %s", info.messageId);
})