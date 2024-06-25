const User = require('../models/userModels');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel')
const Otp = require('../models/otpModels');
const bcrypt = require('bcrypt');
const createOtp = require('../config/otp');
const sendMail = require('../config/nodemailer');
const Wallet = require('../models/walletModel')


const renderhome = async (req, res) => {
    try {
        const pages =req.query.page||1;
        const sizeOfPage = 10;
        const productSkip = (pages-1)*sizeOfPage;
        const productCount = await Product.find({  is_block: false }).count();
        const numofPage = Math.ceil(productCount/sizeOfPage)
        const currentPage = parseInt(pages);
        const categoryData = await Category.find({ is_list: true }, { _id: 1 })
        const productData = await Product.find({ is_block: false, Category: { $in: categoryData } }).skip(productSkip)
        .limit(sizeOfPage);
        const user = await User.findOne({ _id: req.session.user_id })
        return res.render('home', { productData, user,numofPage ,currentPage})
    } catch (error) {
        console.log(error)
    }
}


const loadregister = async (req, res) => {
    try {
        referral = req.query.referralCode;
        return res.render('registration', { referral })
    } catch (error) {
        console.log(error)
    }
}


function RandomReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 6;
    let referralCode = '';
    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referralCode += characters.charAt(randomIndex);
    }
    return referralCode;
}


async function generateUniqueReferralCode() {
    const newReferralCode = RandomReferralCode();
    const referralExists = await User.findOne({ referralCode: newReferralCode });
    if (referralExists) {
        return generateUniqueReferralCode();
    } else {
        return newReferralCode;
    }
}


const insertUser = async (req, res) => {
    try {
        const { username, email, mno, password, referralCode } = req.body;
        console.log(req.body);
        const spassword = await securePassword(password);
        console.log("Secured password:", spassword);
        await createOtp(email);
        console.log("OTP created for email:", email);
        req.session.referralCode = referralCode ? referralCode.trim().toUpperCase() : null;
        console.log("Referral code set in session:", req.session.referralCode);
        const existMail = await User.findOne({ email: email });
        if (existMail) {
            console.log("Email already exists:", email);
            return res.render("registration", { message: "Email already exists.", referral: referralCode });
        }
        if (req.session.referralCode) {
            const referrer = await User.findOne({ referralCode: req.session.referralCode });
            if (!referrer) {
                console.log("Invalid referral code:", req.session.referralCode);
                return res.render("registration", { message: "Invalid referral code.", referral: referralCode });
            }
            if (referrer.userReferred.includes(email)) {
                console.log("Referral code already used by this email:", email);
                return res.render("registration", {
                    message: "Referral code has already been used by this email.",
                    referral: referralCode
                });
            }
        }
        const newReferralCode = await generateUniqueReferralCode();
        const otpdata = await Otp.findOne({ email: email }).sort({ _id: -1 });
        if (otpdata) {
            await sendMail(username, email, otpdata.otp);
            console.log("OTP email sent to:", email);
            req.session.tempUser = { username, email, mno, spassword, newReferralCode };
            req.session.otpdata = otpdata;
            return res.render('otp');
        } else {
            console.log("Failed to find OTP data for email:", email);
            return res.render('registration', { message: "Your registration has failed.", referral: referralCode });
        }
    } catch (error) {
        console.error("Error in insertUser:", error.message);
        res.status(500).send('Internal Server Error.................');
    }
};


const verifyotp = async (req, res) => {
    const { otp } = req.body;
    console.log(req.body)
    const { email } = req.session.tempUser;
    try {
        const otpData = req.session.otpdata;
        if (!otpData) {
            console.log("OTP expired for email:", email);
            return res.status(200).render("otp", { message: "OTP expired", email });
        }
        console.log("OTP entered by user:", otp);
        console.log("OTP stored in session:", otpData.otp);
        if (otp.toString() === otpData.otp.toString()) {
            const { username, email, mno, spassword, newReferralCode } = req.session.tempUser;
            const newUser = new User({ name: username, email, mobile: mno, password: spassword, referralCode: newReferralCode });
            await newUser.save();
            console.log("New user saved:", email);
            const userData = await User.findOne({ email: email });
            req.session.user_id = userData._id;
            if (req.session.referralCode) {
                const referrer = await User.findOne({ referralCode: req.session.referralCode });
                if (referrer) {
                    referrer.userReferred.push(userData.email);
                    await referrer.save();
                    console.log("Referrer updated with new user:", referrer._id);              
                    const walletRefer = await Wallet.findOne({ user: referrer._id });
                    if (walletRefer) {
                        walletRefer.walletBalance += 100;
                        walletRefer.transaction.push({
                            type: "credit",
                            amount: 100,
                        });
                        await walletRefer.save();
                        console.log("Wallet updated for referrer:", referrer._id);
                    } else {
                        const wallet = new Wallet({
                            user: referrer._id,
                            transaction: [{ type: "credit", amount: 100 }],
                            walletBalance: 100,
                        });
                        await wallet.save();
                        console.log("New wallet created for referrer:", referrer._id);
                    }
                }
                const walletData = await Wallet.findOne({ user: req.session.user_id });
                if (walletData) {
                    walletData.walletBalance += 50;
                    walletData.transaction.push({
                        type: "credit",
                        amount: 50,
                    });
                    await walletData.save();
                    console.log("Wallet updated for user:", userData._id);
                } else {
                    const wallet = new Wallet({
                        user: req.session.user_id,
                        transaction: [{ type: "credit", amount: 50 }],
                        walletBalance: 50,
                    });
                    await wallet.save();
                    console.log("New wallet created for user:", userData._id);
                }
            }
            return res.status(200).redirect('/');
        } else {
            console.log("Incorrect OTP for email:", email);
            return res.status(400).render('otp', { message: "Incorrect OTP", email });
        }
    } catch (error) {
        console.error("Error occurred during OTP verification:", error);
        return res.status(500).send("Internal Server Error");
    }
};


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
        const userData = await User.findOne({ email: email })
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
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
        const email = req.query.email;
        const otpData = await Otp.findOne({ email: email }).sort({ _id: -1 });
        if (!otpData) {
            return res.json({ success: false, message: 'No OTP found for this email' });
        }
        if (otp == otpData.otp) {
            return res.status(200).json({ success: true, message: "Entered correct Otp", email: email })
        } else {
            return res.json({ success: false, message: 'Incorrect OTP' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}


const newPasswordPage = (req, res) => {
    try {
        const email = req.query.email
        return res.render('password', { email })
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}


const updatePassword = async (req, res) => {
    try {
        const { email, pass } = req.body;
        const spassword = await securePassword(pass)
        const userdata = await User.updateOne({ email: email }, { $set: { password: spassword } });
        return res.status(200).redirect('/login')
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error')
    }
}


const contactPage = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.session.user_id })
        res.render('contact',{user});
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}


const aboutPage = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.session.user_id })
        res.render('about',{user});
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
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
    otpVerify,
    newPasswordPage,
    updatePassword,
    contactPage,
    aboutPage,
    
}