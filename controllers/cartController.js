
const Cart = require('../models/cartModel');
const { ObjectId } = require('mongodb');

const cartPage = async (req, res) => {
    try {
        const user = req.session.user_id;
        const cartData = await Cart.findOne({ userId: user }).populate("products.productId");
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
        if (!userId) {
            return res.status(401).send('Unauthorized');
        }
        const userCart = await Cart.findOne({ userId: userId });
        if (!userCart) {
            return res.status(404).send('cart not found');
        }
        const index = userCart.products.findIndex(item => item._id.toString() === productId);
        if (index !== -1) {
            userCart.products.splice(index, 1);
            await userCart.save();
            return res.redirect('/cart');
        } else {
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
        if (!productId || !direction) {
            return res.status(404).json({ success: false, message: 'credentials not found !' })
        }
        const userCart = await Cart.findOne({ userId: req.session.user_id }).populate("products.productId");
        if (!userCart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }
        const productIndex = userCart.products.findIndex(item => item.productId._id.toString() == productId);
        const maxStock = userCart.products[productIndex].productId.Stock
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