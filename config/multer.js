
const multer = require('multer');
const path = require('path');

// Multer configuration for storing product images
const storeProductImage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/public/productImage');
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + path.extname(file.originalname);
    cb(null, fileName);
  }
});

// Exported object with Multer configuration
module.exports = {
  uploadProduct: multer({ storage: storeProductImage }).array('images') // 'images' is the field name expected in the form
};