
// Import necessary modules
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { exec } = require('child_process');
const app = express();
const cookieParser = require('cookie-parser');
//const env = require("dotenv");
//env.config();

const Order = require('./models/OrderSchema');
const FoodItem = require('./models/FoodItmesSchema');
const Expenditure = require('./models/Expenditure');
const DailySales = require('./models/DailySalesSchema');
const MonthlySales = require('./models/MonthlySalesSchema');
const cron = require('node-cron');


// Cron job to save monthly sales details at the end of each month
cron.schedule('0 0 0 1 * *', async () => {
    try {
        // Get the current year and month
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        // Send a POST request to save monthly sales details
        await axios.post('http://localhost:4000/api/monthly-sales/save', {
            year,
            month
        });

        console.log('Monthly sales details saved successfully.');
    } catch (error) {
        console.error('Error saving monthly sales details:', error.message);
    }
}, {
    timezone: 'Asia/Colombo' // Replace 'Your-Timezone' with your actual timezone
});


app.use(cookieParser());
//env.config({ path: "./config.env" });


app.use(require("./routes/route"))

// Middleware
app.use(cors());
app.use(express.json());



//const URL =  process.env.MONGODB_URL;





// MongoDB connection setup
mongoose.connect('mongodb://localhost:27017/RestaurantData', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true
  
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// // Function to restart the server
// const restartServer = () => {
//     exec('pm2 restart server', (error, stdout, stderr) => {
//         if (error) {
//             console.error(`Error restarting server: ${error.message}`);
//             return;
//         }
//         if (stderr) {
//             console.error(`stderr: ${stderr}`);
//             return;
//         }
//         console.log(`Server restarted: ${stdout}`);
//     });
// };

// API endpoint for storing order details
app.post('/api/orders', async (req, res) => {
    try {
        const { totalBill, referenceNumber, detectedItems, paymentDetails, orderDateTime, phoneNumber } = req.body; // Include order date and time

        const newOrder = new Order({
            totalBill,
            referenceNumber,
            detectedItems,
            paymentDetails,
            orderDateTime, // Include order date and time
            phoneNumber // Include phone number
        });

        await newOrder.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error storing order:', error);
        res.status(500).json({ error: 'Failed to store order' });
    }
});



// Other API endpoints...
// API endpoint for updating order after payment success
app.post('/api/payment/success', async (req, res) => {
    try {
        const { referenceNumber, paymentDetails, phoneNumber } = req.body;

        // Check if payment was successful
        const paymentStatus = paymentDetails.status === 'COMPLETED';

        // If payment was successful, update the order including the phone number
        if (paymentStatus) {
            const order = await Order.findOneAndUpdate(
                { referenceNumber: referenceNumber, paid: false }, // Ensure the order is not already paid
                { $set: { paymentDetails: paymentDetails, paid: true, phoneNumber: phoneNumber } },
                { new: true }
            );

            if (!order) {
                return res.status(404).json({ error: 'Order not found or already paid' });
            }

            // Restart the server
           // restartServer();

            return res.json({ success: true });
        } else {
            // If payment was not successful, return an error response
            return res.status(400).json({ error: 'Payment was not successful' });
        }
    } catch (error) {
        console.error('Error updating order after payment success:', error);
        return res.status(500).json({ error: 'Failed to update order' });
    }
});
// Route to check payment status
app.get("/api/payment/status/:referenceNumber", async (req, res) => {
    try {
        const { referenceNumber } = req.params;
        const order = await Order.findOne({ referenceNumber });

        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, paid: order.paid });
    } catch (error) {
        console.error("Error checking payment status:", error);
        res.status(500).json({ error: "Failed to check payment status" });
    }
});
// Route to trigger server restart
app.post('/api/restartServer', (req, res) => {
    try {
        restartServer();
        res.json({ success: true });
    } catch (error) {
        console.error('Error restarting server:', error);
        res.status(500).json({ error: 'Failed to restart server' });
    }
});
// API endpoint for fetching all orders from MongoDB
app.get('/api/orders', async (req, res) => {
    try {
        // Fetch all orders from MongoDB
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});
// API endpoint for fetching orders by date
app.get('/api/orders/date/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1); // Next day
        const orders = await Order.find({
            orderDateTime: {
                $gte: startDate,
                $lt: endDate
            }
        });
        
        // Calculate total sale price
        const totalSalePrice = orders.reduce((total, order) => total + order.totalBill, 0);
        
        res.json({ orders, totalSalePrice });
    } catch (error) {
        console.error('Error fetching orders by date:', error);
        res.status(500).json({ error: 'Failed to fetch orders by date' });
    }
});
// API endpoint for deleting an order
app.delete('/api/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const deletedOrder = await Order.findByIdAndDelete(orderId);

        if (!deletedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});
app.get('/api/sale-receipt/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        const orders = await Order.find({
            orderDateTime: {
                $gte: startDate,
                $lt: endDate
            }
        });
        const foodItemSales = {};
        orders.forEach(order => {
            order.detectedItems.forEach(item => {
                if (!foodItemSales[item.name]) {
                    foodItemSales[item.name] = {
                        totalSale: item.price * item.quantity,
                        totalQuantity: item.quantity
                    };
                } else {
                    foodItemSales[item.name].totalSale += item.price * item.quantity;
                    foodItemSales[item.name].totalQuantity += item.quantity;
                }
            });
        });
        res.json(foodItemSales);
    } catch (error) {
        console.error('Error fetching daily sale receipt:', error);
        res.status(500).json({ error: 'Failed to fetch daily sale receipt' });
    }
});

// API endpoint for fetching food items with prices
app.get('/api/food-items', async (req, res) => {
    try {
        const foodItems = await FoodItem.find();
        res.json(foodItems); // Send food items with prices as JSON response
    } catch (error) {
        console.error('Error fetching food items:', error);
        res.status(500).json({ error: 'Failed to fetch food items' });
    }
});
// API endpoint to add a food item with price
app.post('/api/food-items', async (req, res) => {
    try {
        const { name, price } = req.body;
        // Check if the food item already exists
        const existingFoodItem = await FoodItem.findOne({ name });
        if (existingFoodItem) {
            return res.status(400).json({ error: 'Food item already exists' });
        }
        // Create a new food item with the provided name and price
        const newFoodItem = new FoodItem({ name, price });
        await newFoodItem.save();
        res.json({ message: 'Food item added successfully' });
    } catch (error) {
        console.error('Error adding food item:', error);
        res.status(500).json({ error: 'Failed to add food item' });
    }
});
// API endpoint for updating a food item
app.put('/api/food-items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price } = req.body;
        
        const updatedFoodItem = await FoodItem.findByIdAndUpdate(id, { name, price }, { new: true });

        if (!updatedFoodItem) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        res.json({ message: 'Food item updated successfully' });
    } catch (error) {
        console.error('Error updating food item:', error);
        res.status(500).json({ error: 'Failed to update food item' });
    }
});
// API endpoint for fetching all food items prices
  app.get('/api/food-items-prices', async (req, res) => {
    try {
      const foodItems = await FoodItem.find({}, 'name price'); // Projection to only get name and price fields
      res.json(foodItems);
    } catch (error) {
      console.error('Error fetching food items prices:', error);
      res.status(500).json({ error: 'Failed to fetch food items prices' });
    }
  });

// API endpoint for deleting a food item
app.delete('/api/food-items/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deletedFoodItem = await FoodItem.findByIdAndDelete(id);

        if (!deletedFoodItem) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        res.json({ message: 'Food item deleted successfully' });
    } catch (error) {
        console.error('Error deleting food item:', error);
        res.status(500).json({ error: 'Failed to delete food item' });
    }
});


// API endpoint for fetching daily sales data
app.get('/api/daily-sale', async (req, res) => {
    try {
        const selectedDate = req.query.date;
        
        // Fetch food item prices
        const foodItemPrices = await FoodItem.find({}, { name: 1, price: 1 });

        // Group food item prices by name for easy access
        const foodItemPricesMap = foodItemPrices.reduce((map, item) => {
            map[item.name] = item.price;
            return map;
        }, {});

        const dailySales = await Order.aggregate([
            {
                $match: {
                    orderDateTime: {
                        $gte: new Date(selectedDate),
                        $lt: new Date(new Date(selectedDate).getTime() + 24 * 60 * 60 * 1000)
                    }
                }
            },
            {
                $unwind: "$detectedItems"
            },
            {
                $group: {
                    _id: "$detectedItems.name",
                    foodItem: { $first: "$detectedItems.name" }, // Include food item name
                    totalQuantitySold: { $sum: "$detectedItems.quantity" },
                    totalSale: { 
                        $sum: { 
                            $multiply: [
                                "$detectedItems.quantity", 
                                { $arrayElemAt: [Object.values(foodItemPricesMap), 0] }
                            ] 
                        } 
                    } // Calculate total sale using food item price from the map
                }
            }
        ]);

        // Calculate total sale price of all food items
        let totalSalePrice = 0;
        dailySales.forEach(item => {
            totalSalePrice += item.totalSale;
        });

        res.json({ dailySales, totalSalePrice, foodItemPrices }); // Include foodItemPrices in the response

    } catch (error) {
        console.error('Error fetching daily sales data:', error);
        res.status(500).json({ error: 'Failed to fetch daily sales data' });
    }
});


// Fetch food item prices
app.get('/api/food-item-prices', async (req, res) => {
    try {
        const foodItemPrices = await FoodItem.find({}, { name: 1, price: 1 });
        res.json(foodItemPrices);
    } catch (error) {
        console.error('Error fetching food item prices:', error);
        res.status(500).json({ error: 'Failed to fetch food item prices' });
    }
});


// Define route to handle GET request for fetching daily sales data by date
app.get('/api/daily-sales', async (req, res) => {
    try {
        const { date } = req.query;

        // Fetch daily sales data from the database based on the provided date
        const dailySalesData = await DailySales.findOne({ date });

        if (!dailySalesData) {
            return res.status(404).json({ error: 'Daily sales data not found for the provided date' });
        }

        res.status(200).json(dailySalesData);
    } catch (error) {
        console.error('Error fetching daily sales data:', error);
        res.status(500).json({ error: 'Failed to fetch daily sales data' });
    }
});


// Define route to handle POST request for saving daily sales data
app.post('/api/daily-sales', async (req, res) => {
    try {
        const { date, sales, totalSalePrice, totalExpenditure, profit, expenditure } = req.body;

        // Check if details already saved for the provided date
        const existingDailySales = await DailySales.findOne({ date });

        if (existingDailySales) {
            // If details already exist for the provided date, update the existing data
            existingDailySales.sales = sales;
            existingDailySales.totalSalePrice = totalSalePrice;
            existingDailySales.totalExpenditure = totalExpenditure;
            existingDailySales.profit = profit;
            existingDailySales.expenditure = expenditure;

            await existingDailySales.save();
            return res.status(200).json({ message: 'Daily sales data updated successfully' });
        }

        // If details not already saved, proceed to save new data
        const dailySales = new DailySales({
            date,
            sales,
            totalSalePrice,
            totalExpenditure,
            profit,
            expenditure
        });

        await dailySales.save();
        res.status(201).json({ message: 'Daily sales data and expenditure details saved successfully' });
    } catch (error) {
        console.error('Error saving daily sales data:', error);
        res.status(500).json({ error: 'Failed to save daily sales data' });
    }
});


app.get('/api/expenditures', async (req, res) => {
    try {
        const selectedDate = req.query.date;
        const expenditures = await Expenditure.find({ date: selectedDate });
        
        // Calculate total expenditure
        const totalExpenditure = expenditures.reduce((total, item) => total + item.amount, 0);
        
        res.json({ expenditures, totalExpenditure });
    } catch (error) {
        console.error('Error fetching expenditures:', error);
        res.status(500).json({ error: 'Failed to fetch expenditures' });
    }
});

// Add new expenditure
app.post('/api/expenditures', async (req, res) => {
    try {
        const { date, description, amount } = req.body;
        const expenditure = new Expenditure({
            date,
            description,
            amount,
        });
        await expenditure.save();
        res.json({ message: 'Expenditure added successfully' });
    } catch (error) {
        console.error('Error adding expenditure:', error);
        res.status(500).json({ error: 'Failed to add expenditure' });
    }
});

// Delete expenditure
app.delete('/api/expenditures/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Expenditure.findByIdAndDelete(id);
        res.json({ message: 'Expenditure deleted successfully' });
    } catch (error) {
        console.error('Error deleting expenditure:', error);
        res.status(500).json({ error: 'Failed to delete expenditure' });
    }
});


app.get('/api/monthly-sales/details', async (req, res) => {
    try {
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({ error: 'Year and month parameters are required' });
        }

        const parsedYear = parseInt(year);
        const parsedMonth = parseInt(month);

        if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
            return res.status(400).json({ error: 'Invalid year or month' });
        }

        let monthlySales = await DailySales.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: [{ $year: '$date' }, parsedYear] },
                            { $eq: [{ $month: '$date' }, parsedMonth] }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    date: { $first: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } },
                    totalSalePrice: { $first: "$totalSalePrice" }, // Assuming totalSalePrice is stored in the documents
                    totalExpenditure: { $first: "$totalExpenditure" },
                    profit: { $first: "$profit" }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: 1,
                    totalSalePrice: 1,
                    totalExpenditure: 1,
                    profit: 1
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        res.json({ monthlySales });
    } catch (error) {
        console.error('Error fetching monthly sales data with details:', error);
        res.status(500).json({ error: 'Failed to fetch monthly sales data with details' });
    }
});

app.post('/api/monthly-sales/save', async (req, res) => {
    try {
        const { year, month, totalSalePrice, totalExpenditure, totalProfit } = req.body;

        // Create a new instance of MonthlySales with the provided data
        const monthlySales = new MonthlySales({
            year,
            month,
            totalSalePrice,
            totalExpenditure,
            totalProfit
        });

        // Save the instance to your MongoDB database
        await monthlySales.save();

        res.json({ message: 'Monthly sales details saved successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});













// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const app = express();
// const cookieParser = require('cookie-parser');
// const env = require("dotenv");
// const cron = require('node-cron');

// // Import routers
// const ordersRouter = require('./routes/orders');
// const paymentsRouter = require('./routes/payments');
// const dailySalesRouter = require('./routes/dailySales');
// const monthlySalesRouter = require('./routes/monthlySales');
// const expendituresRouter = require('./routes/expenditures');

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(cookieParser());
// env.config({ path: "./config.env" });

// // MongoDB connection setup
// mongoose.connect('mongodb://localhost:27017/Restaurant', { 
//     useNewUrlParser: true, 
//     useUnifiedTopology: true
// })
//     .then(() => console.log('Connected to MongoDB'))
//     .catch(err => console.error('MongoDB connection error:', err));

// // Mount routers
// app.use('/api/orders', ordersRouter);
// app.use('/api/payments', paymentsRouter);
// app.use('/api/daily-sales', dailySalesRouter);
// app.use('/api/monthly-sales', monthlySalesRouter);
// app.use('/api/expenditures', expendituresRouter);

// // Start the server
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });