const nodemailer = require('nodemailer');
require('dotenv').config(); 

const sendVerifyMail = async (name, email, otp) => {
  try {
    console.log(process.env.ADMIN_EMAIL,email);
    const transporter = nodemailer.createTransport({
  
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: 'pigabo40@gmail.com',
        pass: 'wvcv tpuo eqzo ghle',
      },
    });

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
            <h1 style="color: #4CAF50;">
                <style="width: 50px; height: 50px; vertical-align: middle; margin-right: 10px;">
                FraGrAnce
            </h1>
            <p style="font-size: 18px;">Your OTP for verification is: <strong>${otp}</strong></p>
        </div>
    `;


    const mailOptions = {
      from: 'pigabo40@gmail.com',
      to: email,
      subject: 'For verification purpose',
      html: emailHtml
        };


    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
}

module.exports = sendVerifyMail;
