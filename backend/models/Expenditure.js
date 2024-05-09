// models/Expenditure.js
const mongoose = require('mongoose');

const expenditureSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
});

const Expenditure = mongoose.model('Expenditure', expenditureSchema);

module.exports = Expenditure;