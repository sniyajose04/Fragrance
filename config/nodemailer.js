const nodemailer = require('nodemailer');

const sendVerifyMail = async (name, email, otp) => {
    try {
      console.log(otp,'hgdhjfghjs');
        const transporter = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'mhdrizwanpkd@gmail.com', 
            pass: 'sgzmnhpoginjuwat' 
    
          }
        });

 
 const mailOptions = {
    from: 'mhdrizwanpkd@gmail.com', 
    to: email, 
    subject: 'OTP Verification', 
    text: `Your OTP for verification is: ${otp}` 
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.response);
} catch (error) {
  console.error('Error sending OTP email:', error);
  throw error;
}
}

module.exports = sendVerifyMail;