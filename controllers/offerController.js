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
    const offerCategory = await Category.findOne({ name: category.trim() });
    const existingOffer = await Offer.findOne({ category: offerCategory._id });
    if (existingOffer) {
      return res.status(400).send('Offer already added in this category');
    }
    const offerData = await Offer.create({
      category: offerCategory._id,
      discount: discount,
      start: start,
      end: end
    });
    const offerProducts = await Product.find({ productCategory: offerCategory._id });
    for (const product of offerProducts) {
      const offerPrice = Math.floor(product.regularPrice * (1 - discount / 100));
      product.offerPrice = offerPrice;
      product.discountApplied = true;
      await product.save();
    }
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