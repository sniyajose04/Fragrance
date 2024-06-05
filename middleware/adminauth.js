
const isLogout = async(req,res,next)=>{
    try {
        if(!req.session.admin_id){
          return  res.redirect('/admin/adminLogout')
        }
        next();
    } catch (error) {
        console.log(error)
    }
}


module.exports = isLogout