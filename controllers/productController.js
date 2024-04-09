const Product = require('../models/productModel');
const Category=require('../models/categoryModel')
const path = require('path')



const productDetail = async(req,res)=>{
    try {
        const page = req.query.page || 1;
        const pageSize = 10; // Adjust page size as needed
        const skip = (page - 1) * pageSize;
        const productsCount = await Product.countDocuments({});
        const totalPages = Math.ceil(productsCount / pageSize);

        const products = await Product.find({}).skip(skip).limit(pageSize);
        res.render('product',{products,totalPages, currentPage: page});

    } catch (error) {
        console.log(error)
    }
}

const addProductpage = async(req,res)=>{
    try{
     
        const products = await Product.find()
        // console.log('products : ', products)
        const category=await Category.find()
    
        res.render('productAdd',{category,products})
    }catch(error){
        console.error(error);
        res.status(500).json({ success: false, error: "An error occurred " });
    }
}

const publish  = async (req, res) => {
    try {
        const ProductID = req.params.id;
        await Product.findByIdAndUpdate(ProductID, {
            is_block: true
        });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "An error occurred " });
    }
}

const unpublish  = async (req, res) => {
    try {
        const ProductID = req.params.id;
        await Product.findByIdAndUpdate(ProductID, {
            is_block: false
        });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "An error occurred " });
    }
}
const addproduct = async (req, res) => {
    try {
      const {
        product_title,
        Description,
        Stock,
        regularPrice,
        promotionalPrice,
        category
      } = req.body;
  
      // Check if the product already exists
      const existingProduct = await Product.findOne({ product_title });
      if (existingProduct) {
        return res.render("productAdd", { message: "Product already exists" });
      }
  
      // Find category ID
      const categoryData = await Category.findOne({ name: category }, { _id: 1 });
      if (!categoryData) {
        return res.status(400).json({ success: false, error: "Category not found" });
      }
  
      // Process uploaded images
      const imageData = req.files.map(file => ({
        filename: file.filename,
        path: file.path // You might want to store the file path for reference
      }));
  
      // Create new product
      const newProduct = new Product({
        product_title,
        Description,
        Stock,
        regularPrice,
        promotionalPrice,
        Category: categoryData._id,
        images: imageData
      });
  
      await newProduct.save();
      res.redirect('/admin/product');
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "An error occurred" });
    }
  }


const editProductPage = async (req, res) => {
    try {

        const productId = req.params.id;
        console.log('Product id:',productId)
        const product = await Product.findOne({_id:productId});
       console.log(product)

        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.render('editProduct',{Product:product});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const updateProduct = async (req, res) => {
    try {
        const productId = req.query.id;
        console.log(req.body);
        const {producttitle,Description,Stock,regularPrice,promotionalPrice,images,category,is_block} = req.body;

        const updateProduct = await Product.findByIdAndUpdate(productId,{producttitle,Description,Stock,regularPrice,promotionalPrice,images,category,is_block}, { new: true });

        if (!updateProduct) {
            return res.status(404).send('Product not found');
        
        }else{

        res.redirect('/admin/product'); // Redirect to a page displaying all categories or any other appropriate page
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};


const productView = async(req,res)=>{
    try {
        const productId = req.query.id;
        const product = await Product.findOne({_id:productId})

         return res.json({success:true,product});
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}
module.exports = {
    productDetail,
    addProductpage,
    publish,
    unpublish,
    addproduct,
    editProductPage,
    updateProduct,
    productView
}