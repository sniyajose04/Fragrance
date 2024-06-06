const User = require('../models/userModels');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel')

const shopPage = async (req, res) => {
    try {
        let query = { is_block: false };
        if (req.query.category) {
            query.Category = req.query.category;
        }
        let productData;
        const sort = req.query.sort;
        if (sort === 'price_low_to_high') {
            productData = await Product.find(query).sort('promotionalPrice');
        } else if (sort === 'price_high_to_low') {
            productData = await Product.find(query).sort('-promotionalPrice');
        } else if (sort === 'aA-zZ') {
            productData = await Product.find(query).sort({ product_title: 1 });
        } else if (sort === 'zZ-aA') {
            productData = await Product.find(query).sort({ product_title: -1 });
        } else {
            productData = await Product.find(query);
        }
        if (req.query.category) {
            productData = await Product.find({ is_block: false, Category: req.query.category })
        }
        const categoryData = await Category.find({ is_list: true }, { _id: 1, name: 1 });
        const user = await User.findOne({ _id: req.session.user_id });
        const products = await Product.find({ is_block: false }).sort({ listDate: -1 }).limit(3);
        return res.render('shop', { productData, user, categoryData, products });
    } catch (error) {
        console.error('Error in shopPage:', error);
        return res.status(500).send('Internal Server Error: ' + error.message);
    }
};


const searchData = async (req, res) => {
    try {
        const categoryData = await Category.find({ is_list: true });
        const user = await User.findOne({ _id: req.session.user_id });
        const searchedData = req.body.query;
        const regex = new RegExp('^' + searchedData, 'i')
        const productData = await Product.find({ is_block: false, product_title: { $regex: regex } });
        const products = await Product.find({ is_block: false }).sort({ listDate: -1 }).limit(3);
        res.render("shop", { productData, categoryData, user, products })
    } catch (error) {
        console.log(error, 'search data error')
        return res.status(500).send('Internal Server Error')
    }
}


module.exports = {
    shopPage,
    searchData

}