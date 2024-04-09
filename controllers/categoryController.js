const categoryModel = require('../models/categoryModel')
const Category = require('../models/categoryModel')

const addCategoryPage = async (req, res) => {
    try {
        res.render('addcategory' ,{errorMessage:""})
    } catch (error) {
        console.log(error)
    }
}

const categoryDetail = async (req, res) => {
    try {
        const categoryData = await Category.find()
        res.render('categorylist', { Category: categoryData })
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
            // Pass the error message and other form data to the view
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
        console.log('Category id:',categoryId)
        const category = await Category.findOne({_id:categoryId});
       console.log(category)

        if (!category) {
            return res.status(404).send('Category not found');
        }

        res.render('editCategory', {Category: category });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


const updateCategory = async (req, res) => {
    try {
        const categoryId = req.query.id;
        console.log(req.body);
        const { name ,is_list,description} = req.body; // Assuming the input field name is "categoryName"

        const updatedCategory = await Category.findByIdAndUpdate(categoryId, { name,is_list,description }, { new: true });

        if (!updatedCategory) {
            return res.status(404).send('Category not found');
        }

        res.redirect('/admin/categorylist'); // Redirect to a page displaying all categories or any other appropriate page
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