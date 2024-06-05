
const Cart = require('../models/cartModel');
const { ObjectId } = require('mongodb');

const cartPage = async (req, res) => {
    try {
        const user = req.session.user_id;
        const cartData = await Cart.findOne({ userId: user }).populate("products.productId");
        console.log(cartData)
        res.render('cart', { cartData, user });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}


const removeFromCart = async (req, res) => {
    try {
        const productId = req.query.id;
        const userId = req.session.user_id;
        console.log('Received userId:', userId);
        console.log('Received productId:', productId);
        if (!userId) {
            return res.status(401).send('Unauthorized');
        }
        const userCart = await Cart.findOne({ userId: userId });
        if (!userCart) {
            console.log('Wishlist not found for user:', userId);
            return res.status(404).send('cart not found');
        }
        console.log('cart data:', JSON.stringify(userCart, null, 2));
        // Find the index of the product using _id instead of productId
        const index = userCart.products.findIndex(item => item._id.toString() === productId);
        console.log('Product index:', index);
        if (index !== -1) {
            userCart.products.splice(index, 1);
            await userCart.save();
            console.log('Product removed successfully');
            return res.redirect('/cart');
        } else {
            console.log('Product not found in wishlist');
            return res.status(404).send('Product not found in wishlist');
        }
    } catch (error) {
        console.error('Error removing product from wishlist:', error);
        res.status(500).send('Internal Server Error');
    }
};


const updateQuantity = async (req, res) => {
    try {
        const { productId, direction } = req.body;
        console.log(req.body, 'req body in cart');
        if (!productId || !direction) {
            return res.status(404).json({ success: false, message: 'credentials not found !' })
        }
        const userCart = await Cart.findOne({ userId: req.session.user_id }).populate("products.productId");
        console.log('userCart:', userCart);
        if (!userCart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }
        const productIndex = userCart.products.findIndex(item => item.productId._id.toString() == productId);
        const maxStock = userCart.products[productIndex].productId.Stock
        console.log(productIndex, ' productIndex');
        console.log(maxStock, ' maxStock');
        if (productIndex === -1) {
            return res.status(404).json({ success: false, message: 'Product not found in cart' });
        }
        const cartQty = userCart.products[productIndex].quantity
        if (direction == 'up' && cartQty < maxStock) {
            userCart.products[productIndex].quantity += 1;
        } else if (direction == 'down' && cartQty > 0) {
            userCart.products[productIndex].quantity -= 1;
        }
        await userCart.save();
        res.status(200).json({ success: true, message: 'Quantity updated successfully' });
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


module.exports = {
    cartPage,
    removeFromCart,
    updateQuantity,

}