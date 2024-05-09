const mongoose = require('mongoose');

const DailySalesSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    sales: [
        {
            foodItem: String,
            totalQuantitySold: Number,
            totalSale: Number
        }
    ],
    totalSalePrice: {
        type: Number,
        required: true
    },
    totalExpenditure: {
        type: Number,
        required: true
    },
    profit: {
        type: Number,
        required: true
    },
    expenditure: [
        {
            description: String,
            amount: Number
        }
    ]
});

const DailySales = mongoose.model('DailySales', DailySalesSchema);

module.exports = DailySales;