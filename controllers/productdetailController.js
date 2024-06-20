
const Product = require('../models/productModel');
const User = require('../models/userModels');
const Cart = require('../models/cartModel');
const Wishlist = require('../models/wishlistModel');

const productDetail = async (req, res) => {
  try {
    const productId = req.query.id;
    const productData = await Product.findById(productId);
    const user = await User.findOne({ _id: req.session.user_id });
    const wishlist = await Wishlist.findOne({ userId: req.session.user_id });
    res.render('productDetail', { productData, user, wishlist });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};


const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.session.user_id;
    let userCart = await Cart.findOne({ userId: userId });
    if (!userCart) {
      userCart = new Cart({ userId, products: [] });
    }
    const existingProduct = userCart.products.find(p => p.productId.toString() === productId);
    if (existingProduct) {
      return res.status(200).json({ success: false, message: 'Product is already in the cart' });
    }
    userCart.products.push({ productId, quantity: quantity || 1 });
    await userCart.save();
    res.status(200).json({ success: true, message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).send('Internal Server Error');
  }
}


const addWishlist = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.session.user_id;
    let userWishlist = await Wishlist.findOne({ userId: userId });
    if (!userWishlist) {
      userWishlist = new Wishlist({ userId, products: [] });
    }
    const existingProduct = userWishlist.products.find(p => p.productId.toString() === productId);
    if (existingProduct) {
      return res.status(200).json({ success: false, message: 'Product is already in the wishlist' });
    }
    userWishlist.products.push({ productId, quantity: quantity || 1 });
    await userWishlist.save();
    res.status(200).json({ success: true, message: 'Item added to wishlist successfully' });
  } catch (error) {
    console.error('Error adding product to wishlist:', error);
    res.status(500).send('Internal Server Error');
  }
};


module.exports = {
  productDetail,
  addToCart,
  addWishlist
}