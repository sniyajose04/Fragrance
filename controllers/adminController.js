const Admin = require('../models/userModels');
const bcrypt = require('bcrypt')
const User = require('../models/userModels')



const adminDashboard = async (req,res)=>{
    try {
        res.render('adminpanel')
    } catch (error) {
        console.log(error)
    }
}

const adminlogin = async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error)
    }
}

const verifyadmin = async(req,res)=>{
    try {
        const Email=req.body.email
        const password=req.body.password

        const userdata = await Admin.findOne({email:Email})
        
        if(userdata){
             const passwordMatch = await bcrypt.compare(password,userdata.password)

             if(passwordMatch){
                req.session.admin_id = userdata._id;
                res.redirect('/admin/adminpanel')
             }else{
                return res.render('login', { message: "Password is incorrect" });
             }
        }else{
            return res.render('login', { message: "Email is incorrect" });
        }

    } catch (error) {
        console.error("Error in verifyadmin:", error);
        res.status(500).send("Internal Server Error");
    }
}




const orderDetail = async(req,res)=>{
    try{
        res.render('orderlist')
    }catch(error){
        console.log(error)
    }
}

const userDetail = async(req,res)=>{
    try{
        const page = req.query.page || 1;
        const pageSize = 5;
        const skip = (page - 1) * pageSize;
        const usersCount = await User.countDocuments({});
        totalPages = Math.ceil(usersCount/pageSize);

        const userdata = await Admin.find({is_admin:false}).skip(skip).limit(pageSize);
        
        res.render('Userlist',{userdata, totalPages,currentPage:page})
    }catch(error){
        console.log(error)
    }
}



    const userBlock = async (req, res) => {
        try {
            const userID = req.params.id;
           const updateData= await User.findByIdAndUpdate(userID, {
                is_blocked: true
            });
            const userData=await User.findOne({_id:userID})
            res.status(200).json({ success: true,block:userData.is_blocked });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: "An error occurred while blocking the user" });
        }
    }
    
    const userUnblock = async(req,res)=>{
        try {
            const userID =req.params.id;
           const upadateData= await User.findByIdAndUpdate(userID,{
                is_blocked:false
            });
            const userData=await User.findOne({_id:userID})
            res.status(200).json({success:true,block:userData.is_blocked});
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: "An error occurred while Unblocking the user" });
        }
    }


    
    
    

    const adminLogout = (req,res)=>{
        try {
            req.session.admin_id=undefined;
            res.redirect('/admin')
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    }  
    
module.exports = {
    adminDashboard,
    adminlogin,
    verifyadmin,
    orderDetail,
    userDetail,
    userBlock,
    userUnblock,
    adminLogout,
}
