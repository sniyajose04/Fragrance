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

        switch (req.query.sort) {
            case 'price_low_to_high':
                productData = await Product.find(query).sort('promotionalPrice');
                break;
            case 'price_high_to_low':
                productData = await Product.find(query).sort('-promotionalPrice');
                break;
            case 'avg.rating':
                // Assuming there is some logic here to sort by average rating
                // productData = await Product.find(query).sort({ avgRating: 1 });
                break;
            case 'aA-zZ':
                productData = await Product.find(query).sort({ product_title: 1 });
                break;
            case 'zZ-aA':
                productData = await Product.find(query).sort({ product_title: -1 });
                break;
            default:
                productData = await Product.find(query);
                break;
        }
         
        if(req.query.category){
            console.log(req.query.category);
            productData = await Product.find({is_block: false,Category:req.query.category})
            console.log('dsfasdfasdfasdfasdf',productData)
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


const searchData = async(req,res)=>{
    try {
        const userid = req.session.user;
        const categoryData = await Category.find({is_list:true});
        const user = await User.findOne({ _id: req.session.user_id });
        const searchedData = req.body.query;
        const regex = new RegExp('^'+searchedData,'i')
        const productData = await Product.find({is_block: false,product_title:{$regex:regex}});
        const products = await Product.find({ is_block: false }).sort({ listDate: -1 }).limit(3);
        res.render("shop",{productData,categoryData,user,products})

    } catch (error) {
        console.log(error,'search data error')
        return res.status(500).send('Internal Server Error')
    }
}



module.exports = {
    shopPage,
    searchData
   
}