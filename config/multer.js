
const multer = require('multer');
const path = require('path');


const storeProductImage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/productImages'); 
  },
  filename: function (req, file, cb) { 
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${timestamp}${fileExtension}`;
    cb(null, fileName);
  }
});



module.exports = {
  uploadProduct: multer({ storage: storeProductImage }).array('images') 
};