require('dotenv').config()

const mongoose = require('mongoose');
const express = require("express");
const session = require("express-session");
const bodyParser = require('body-parser');
const nocache = require('nocache');

const config = require("./config/config");
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');
const productdetailController = require('./controllers/productdetailController');

mongoose.connect(process.env.MONGO_URL || "mongodb+srv://sniyajose18:sniya*2004@cluster0.olylo1a.mongodb.net/FraGrAnce", { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Connection error', err));


const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(nocache());
app.use(session({
    secret: "secret key",
    resave: false,
    saveUninitialized: true,
}));

app.get('/addToCart', productdetailController.addToCart); 


app.use('/', userRoute); 
app.use('/admin', adminRoute);
app.use(express.json())

app.use(express.static('uploads'));

const port = process.env.PORT || 3005;
app.listen(port, () => {
    console.log(`Server is running... http://localhost:${port}`);
});
