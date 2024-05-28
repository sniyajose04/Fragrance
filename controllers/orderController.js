const Order = require('../models/orderModel')
const Product = require('../models/productModel');
const Wallet = require('../models/walletModel')



const orderList = async (req, res) => {
    try {
      
       
       const order = await Order.find().populate('userId')
      
        res.render('orderlist',{order});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


const orderDetail = async(req,res)=>{
    try {
const orderId = req.query.orderId
console.log('orderId',orderId)
const orderData = await Order.findById(orderId)
.populate('userId') 
.populate('products.productId')
.populate('address');
        
        res.render('orderDetail',{orderData})
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error'); 
    }
}


const cancelOrder = async (req, res) => {
    try {
        const orderId = req.query.OID;
        console.log('orderId',orderId)
        const newStatus = "Cancelled";
        

       
        const result = await Order.updateOne(
            { _id: orderId, orderStatus: { $in: ["Order Placed", "Shipped", "Delivered", "Cancelled", "Returned"] } },
            { $set: { orderStatus: newStatus } }
        );
        console.log('result',result)
         //  if (order.paymentStatus === 'Success' && (newStatus === 'Returned' || newStatus==='Cancelled')) {
        //     await User.findByIdAndUpdate(
        //         order.userId,
        //         { $inc: { wallet: order.discountedAmount } },
        //         );
        //         order.paymentStatus = 'Refunded';
        //         await order.save()     
        // }

        // Handle if the order was not found or if the status couldn't be updated
        if (result.nModified === 0) {
            return res.status(404).json({ message: "Order not found or cannot be cancelled." });
        }

        // Send a success response
        res.json({ message: "Order cancelled successfully." });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal server error." });
    }
};

const orderDetailChange = async (req, res) => {
    try {
        const orderID = req.body.orderID;
        const status = req.body.statusID;

        const order = await Order.findOne({ _id: orderID });

        if (order) {
            const changeOrder = await Order.findByIdAndUpdate(orderID, { $set: { orderStatus: status } }, { new: true });

            if (changeOrder.orderStatus === "Cancelled" || changeOrder.orderStatus === "Returned") {
                // Your logic for handling cancelled or returned orders here
                // Ensure that this logic executes only if the order status was indeed changed
            }

           
            res.status(200).json({ success: true });
        } else {
          
            res.status(404).json({ success: false, message: 'Order not found.' });
        }
    } catch (error) {
        console.error('Error:', error);
      
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};


module.exports={
    orderList,
    orderDetail,
    cancelOrder,
    orderDetailChange
}
          
     