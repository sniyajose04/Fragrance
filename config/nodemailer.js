const nodemailer = require('nodemailer');

const sendVerifyMail = async (name, email, otp) => {
    try {
        // Create a Nodemailer transporter using SMTP settings
        const transporter = nodemailer.createTransport({
          service: 'Gmail', // Use your email service provider here
          auth: {
            user: 'mhdrizwanpkd@gmail.com', // Your email address
            pass: 'sgzmnhpoginjuwat' // Your email password
    
          }
        });

 // Configure the email message
 const mailOptions = {
    from: 'mhdrizwanpkd@gmail.com', // Sender address
    to: email, // Recipient address
    subject: 'OTP Verification', // Subject line
    text: `Your OTP for verification is: ${otp}` // Plain text body
  };

  // Send the email
  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.response);
} catch (error) {
  console.error('Error sending OTP email:', error);
  throw error;
}
}

module.exports = sendVerifyMail;