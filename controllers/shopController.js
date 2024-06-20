const User = require('../models/userModels');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel')

const shopPage = async (req, res) => {
    try {
        const pages = req.query.page || 1;
        const sizeOfPage = 6;
        const productSkip = (pages - 1) * sizeOfPage;
        const productCount = await Product.find({ is_block: false }).countDocuments();
        const numofPage = Math.ceil(productCount / sizeOfPage);
        const currentPage = parseInt(pages);

        let query = { is_block: false };
        if (req.query.category) {
            query.Category = req.query.category;
        }

        const sort = req.query.sort;
        let sortOption = {};
        if (sort === 'price_low_to_high') {
            sortOption = { promotionalPrice: 1 };
        } else if (sort === 'price_high_to_low') {
            sortOption = { promotionalPrice: -1 };
        } else if (sort === 'aA-zZ') {
            sortOption = { product_title: 1 };
        } else if (sort === 'zZ-aA') {
            sortOption = { product_title: -1 };
        }

        const productData = await Product.find(query).sort(sortOption).skip(productSkip).limit(sizeOfPage);

        const categoryData = await Category.find({ is_list: true }, { _id: 1, name: 1 });
        const user = await User.findOne({ _id: req.session.user_id });
        const products = await Product.find({ is_block: false }).sort({ listDate: -1 }).limit(3);

        return res.render('shop', { productData, user, categoryData, products, numofPage, currentPage });
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
        const regex = new RegExp(searchedData, 'i');
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