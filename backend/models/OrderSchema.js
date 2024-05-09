// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//     totalBill: { type: Number, required: true },
//     referenceNumber: { type: String, required: true, unique: true },
//     detectedItems: [{ name: String, quantity: Number }],
//     paymentDetails: { type: Object, default: {} },
//     paid: { type: Boolean, default: false },
//     orderDateTime: { type: Date, required: true }, // Add order date and time field
//     phoneNumber: { type: String } // Add phone number field
// });

// const Order = mongoose.model('Order', orderSchema);

// module.exports = Order;


const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    totalBill: { type: Number, required: true },
    referenceNumber: { type: String, required: true, unique: true },
    detectedItems: [{ name: String, quantity: Number }],
    paymentDetails: { type: Object, default: {} },
    paid: { type: Boolean, default: false },
    orderDateTime: { type: Date, required: true },
    phoneNumber: { type: String }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;