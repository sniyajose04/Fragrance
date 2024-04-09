const User = require('../models/userModels');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel')
const bcrypt = require('bcrypt');
const Otp = require('../models/otpModels');
const createOtp = require('../config/otp');
const sendMail = require('../config/nodemailer');


const renderhome = async (req, res) => {
    try {
        const categoryData = await Category.find({ is_list: true }, { _id: 1 })
        const productData = await Product.find({ is_block: false, Category: { $in: categoryData } })
        const user = await User.findOne({ _id: req.session.user_id })
       
        return res.render('home', { productData, user })
    } catch (error) {
        console.log(error)
    }
}


const loadregister = async (req, res) => {
    try {

        return res.render('registration')
    } catch (error) {
        console.log(error)
    }
}


const insertUser = async (req, res) => {
    try {
        const { username, email, mno, password } = req.body
        const spassword = await securePassword(password);
        await createOtp(email);
        const otpdata = await Otp.findOne({ email: email }).sort({ _id: -1 });
        const sendemail = await sendMail(username, email, otpdata.otp);
        req.session.tempUser = { username, email, mno, spassword };
        if (otpdata) {
            req.session.otpdata = otpdata
            return res.render('otp')
            
        } else {
            return res.render('registration', { message: "your registration has been failed." })
        }
    } catch (error) {
        console.log(error.message);
    }
}


const securePassword = async (Password) => {
    try {

        const passwordHash = await bcrypt.hash(Password, 10);
        return passwordHash;

    } catch (error) {
        console.log(error)
    }
}


const loginLoad = async (req, res) => {
    try {
        return res.render('login');

    } catch (error) {
        console.log(error)
    }
}


const verifyLogin = async (req, res) => {
    try {
        
        const { email, password } = req.body;

        // Find user by email
        const userData = await User.findOne({ email:email })
        if (userData) {
            // Compare passwords
            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {
                // Set session user_id
                req.session.user_id = userData._id;

                return res.redirect('/');
            } else {
                return res.render('login', { message: "Password is incorrect" });
            }
        } else {
            return res.render('login', { message: "Email is incorrect" });
        }
    } catch (error) {
        console.error("Error in verifyLogin:", error);
        return res.status(500).send("Internal Server Error");
    }
}


const verifyotp = async (req, res) => {
  
    const { otp } = req.body;
    const { email } = req.session.tempUser;
    console.log(otp, email);

    try {
        // Find the latest OTP data associated with the email
        // const otpData = await Otp.findOne({ email }).sort({ _id: -1 });
        const otpData =req.session.otpdata
console.log(otpData);
        if (!otpData) {
            return res.status(200).render("otp", { message: "OTP expired", email })
        }

        
        if (otp == otpData.otp) {
            // OTP matches, create a new user using session data
            const { username, email, mno, spassword } = req.session.tempUser;
            const newUser = new User({ name: username, email, mobile: mno, password: spassword });
            await newUser.save();
            const userData = await User.findOne({email:email})
            // Set session user_id
            // req.session.user = email;
            req.session.user_id = userData._id;

            return res.status(200).redirect('/');
        } else {
            // Incorrect OTP
            return res.status(400).render('otp', { message: "Incorrect OTP", email });
        }
        
    } catch (error) {
        // Handle any potential errors
        console.error("Error occurred during OTP verification:", error);
        return res.status(500).send("Internal Server Error");
    }
};


const renderforgotpasswordpage = (req, res) => {
    try {
        res.render('forgotPassword');
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}


const emailverify = async (req, res) => {
    try {
        const email = req.query.email
        await createOtp(email);
        const otpdata = await Otp.findOne({ email: email }).sort({ _id: -1 });
        const sendemail = await sendMail("forgotten email", email, otpdata.otp);
        return res.json({ success: true, message: 'Email sent successfully' })
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}


const otpVerify = async (req, res) => {
    try {
        
        const otp = req.query.otp;
        const email = req.query.email; // Assuming you also need the email to verify OTP
        
        // Find the OTP data associated with the provided email
        const otpData = await Otp.findOne({ email: email }).sort({ _id: -1 });

        if (!otpData) {
            return res.json({ success: false, message: 'No OTP found for this email' });
        }

        // Check if the provided OTP matches the stored OTP
        if (otp == otpData.otp) {
            // If OTP matches, redirect to the password page
            return res.status(200).json({success:true,message:"Entered correct Otp",email:email})
           
        } else {
            return res.json({ success: false, message: 'Incorrect OTP' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}


const newPasswordPage = (req,res)=>{
    try {
        const email=req.query.email
        return res.render('password',{email})
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}

const updatePassword = async(req,res)=>{
    try {
        
        const {email,pass}= req.body;

        const spassword=await securePassword(pass)
        const userdata = await User.updateOne({ email: email }, { $set: { password: spassword } });
      
        return res.status(200).redirect('/login')
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error')
    }
}

const userLogout = (req, res) => {
    try {
       
        req.session.user_id = undefined;
        res.redirect('/')
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}


module.exports = {
    renderhome,
    loadregister,
    insertUser,
    loginLoad,
    verifyLogin,
    verifyotp,
    renderforgotpasswordpage,
    userLogout,
    emailverify,
    otpVerify ,
    newPasswordPage ,
    updatePassword
   
}