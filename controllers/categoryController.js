
const Category = require('../models/categoryModel')

const addCategoryPage = async (req, res) => {
    try {
        res.render('addcategory', { errorMessage: "" })
    } catch (error) {
        console.log(error)
    }
}


const categoryDetail = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = 5;
        const skip = (page - 1) * pageSize;
        const totalCategories = await Category.countDocuments();
        const totalPages = Math.ceil(totalCategories / pageSize);
        const categoryData = await Category.find().skip(skip).limit(pageSize);
        res.render('categorylist', { Category: categoryData, totalPages: totalPages, currentPage: page })
    } catch (error) {
        console.log(error)
    }
}


const addcategory = async (req, res) => {
    try {
        const { name, is_list, description } = req.body;
        const existingCategory = await Category.findOne({ name: name });
        console.log(req.body);
        if (existingCategory) {
            return res.render("addcategory", { errorMessage: "Category already exists", name, is_list, description });
        }
        const newcategory = new Category({
            name, is_list, description
        })
        await newcategory.save();
        res.redirect('/admin/categorylist')
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "An error occurred while adding the category" });
    }
}


const list = async (req, res) => {
    try {
        const categoryID = req.params.id;
        await Category.findByIdAndUpdate(categoryID, {
            is_list: true
        });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "An error occurred while blocking the user" });
    }
}


const Unlist = async (req, res) => {
    try {
        const categoryID = req.params.id;
        await Category.findByIdAndUpdate(categoryID, {
            is_list: false
        });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "An error occurred" });
    }
}


const editCategoryPage = async (req, res) => {
    try {
        const categoryId = req.params.id;
        console.log('Category id:', categoryId)
        const category = await Category.findOne({ _id: categoryId });
        console.log(category)
        if (!category) {
            return res.status(404).send('Category not found');
        }
        res.render('editCategory', { Category: category });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


const updateCategory = async (req, res) => {
    try {
        const categoryId = req.query.id;
        console.log(req.body);
        const { name, is_list, description } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(categoryId, { name, is_list, description }, { new: true });
        if (!updatedCategory) {
            return res.status(404).send('Category not found');
        }
        res.redirect('/admin/categorylist');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = {
    addCategoryPage,
    categoryDetail,
    addcategory,
    list,
    Unlist,
    editCategoryPage,
    updateCategory
}