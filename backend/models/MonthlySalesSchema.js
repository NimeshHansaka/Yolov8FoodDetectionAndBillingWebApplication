const mongoose = require('mongoose');

// Define schema for monthly sales details
const MonthlySalesSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    totalSalePrice: {
        type: Number,
        required: true
    },
    totalExpenditure: {
        type: Number,
        required: true
    },
    totalProfit: {
        type: Number,
        required: true
    },
  
}, { timestamps: true }); 
// Create a Mongoose model for monthly sales details
const MonthlySales = mongoose.model('MonthlySales', MonthlySalesSchema);

module.exports = MonthlySales;