const Offer = require('../models/offerModel')
const Product = require('../models/productModel');
const Category = require('../models/categoryModel')

const offerList = async (req, res) => {
  try {
    const offer = await Offer.find({}).populate('category')
    const category = await Category.find({ is_list: true })
    res.render('offerList', { offer, category });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}


const addOffers = async (req, res) => {
  try {
    const { category, discount, start, end } = req.body;
    console.log('Request Body:', req.body);
    const offerCategory = await Category.findOne({ name: category.trim() });
    console.log('offerCategory:', offerCategory);
    const existingOffer = await Offer.findOne({ category: offerCategory._id });
    console.log('existingOffer:', existingOffer);
    if (existingOffer) {
      return res.status(400).send('Offer already added in this category');
    }
    const offerData = await Offer.create({
      category: offerCategory._id,
      discount: discount,
      start: start,
      end: end
    });
    console.log('offerData:', offerData);
    const offerProducts = await Product.find({ productCategory: offerCategory._id });
    console.log('offerProducts:', offerProducts);
    for (const product of offerProducts) {
      const offerPrice = Math.floor(product.regularPrice * (1 - discount / 100));
      product.offerPrice = offerPrice;
      product.discountApplied = true;
      console.log('offerPrice:', offerPrice);
      await product.save();
    }
    // res.status(200).json({ message: 'Offer created successfully' });
    res.redirect('/admin/offerList')
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).send('Internal Server Error');
  }
};




const deleteOffer = async (req, res) => {
  try {
    const id = req.query.id;
    const offerData = await Offer.findById(id);
    if (!offerData) {
      console.error('Offer not found');
      return res.status(404).send('Offer not found');
    }
    const offerCategory = offerData.category;
    if (!offerCategory) {
      console.error('Category not found for the offer');
      return res.status(404).send('Category not found for the offer');
    }
    const offerProducts = await Product.find({ category: offerCategory._id });
    for (const product of offerProducts) {
      product.offerPrice = 0;
      product.discountApplied = false;
      await product.save();
    }
    await Offer.findByIdAndDelete(id);
    res.status(200).send('Offer deleted successfully');
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).send('Internal Server Error');
  }
};



module.exports = {
  offerList,
  addOffers,
  deleteOffer
}