const Wishlist = require('../models/wishlistModel');
const Cart     = require('../models/cartModel');

const wishlistPage = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const wishlist = await Wishlist.findOne({ userId }).populate("products.productId");
        res.render('wishlist', { wishlist });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}


const removeWishlistProduct = async (req, res) => {
    try {
        const productId = req.query.id;
        const userId = req.session.user_id;
        if (!userId) {
            return res.status(401).send('Unauthorized');
        }
        const wishlistData = await Wishlist.findOne({ userId: userId });
        if (!wishlistData) {
            console.log('Wishlist not found for user:', userId);
            return res.status(404).send('Wishlist not found');
        }
        console.log('Wishlist data:', JSON.stringify(wishlistData, null, 2));
        const index = wishlistData.products.findIndex(item => item._id.toString() === productId);
        console.log('Product index:', index);
        if (index !== -1) {
            wishlistData.products.splice(index, 1);
            await wishlistData.save();
            console.log('Product removed successfully');
            return res.redirect('/wishlist');
        } else {
            console.log('Product not found in wishlist');
            return res.status(404).send('Product not found in wishlist');
        }
    } catch (error) {
        console.error('Error removing product from wishlist:', error);
        res.status(500).send('Internal Server Error');
    }
};


const addtoCartFromWishlist = async(req,res)=>{
    try {
        const {productId,quantity}=req.body;
        const userId = req.session.user_id;
        let userCart = await Cart.findOne({ userId: userId });
        if (!userCart) {
            userCart = new Cart({ userId, products: [] });
        }
        userCart.products.push({ productId, quantity: quantity || 1 });
        await userCart.save();
        let userWishlist = await Wishlist.findOne({userId:userId})
        userWishlist.products = userWishlist.products.filter(product => product.productId.toString() !== productId);
        await userWishlist.save();
        res.status(200).json({ success: true, message: 'Item added to cart successfully' });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).send('Internal Server Error'); 
    }
}

     
module.exports = {
    wishlistPage,
    removeWishlistProduct,
    addtoCartFromWishlist
}
