const OTP = require('../models/otpModels');
const otpgenerator =require('otp-generator');
 
const generateOtp = () => {
    const otp = otpgenerator.generate(6, { digits: true, upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    return otp
  }

const createotp = async(email)=>{
    const otp =generateOtp();
    const saveotp = new OTP({
      email,otp
    })
    await saveotp.save();
}

module.exports = createotp;
