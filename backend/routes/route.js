const paypal = require('paypal-rest-sdk');
const express = require("express");
const route = express();
const Order = require('../models/OrderSchema'); // Assuming your Order model is defined in a separate file


// Paypal configuration
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ARWopMisJ32JOcM3fAwz-L4EzF853PLgVSrvGuAPyxwSW2Q2mk73mDvsaWRYX09WcTYagDqT9Wye7gZu',
    'client_secret': 'EIzqFJO1qLx-8jB2rCINv2lyQ6fjCql5apt0nFvpaRf83-BV5Wm04lAEKCC7jx6O3m7FIGUaVasEBiZk'

});

route.get("/createpaypalpayment", async (req, res) => {
    try {
        // Find unpaid orders
        const unpaidOrder = await Order.findOne({ paid: false });

        if (!unpaidOrder) {
            console.error('No unpaid orders found');
            return res.redirect('http://return_url/?status=error&message=No unpaid orders found');
        }

        const orderId = unpaidOrder._id; // Get the order ID
        const amount = unpaidOrder.totalBill;
        const currency = 'USD'; // Assuming currency is USD

        var create_payment_json = {
            intent: "sale",
            payer: {
                payment_method: "paypal"
            },
            redirect_urls: {
                return_url: `http://192.168.1.16:4000/execute?amount=${amount}&orderId=${orderId}`, // Pass order ID as query parameter
                cancel_url: "http://cancel.url"
            },
            transactions: [
                {
                    item_list: {
                        items: [
                            {
                                name: "item",
                                sku: "item",
                                price: amount,
                                currency: currency,
                                quantity: 1
                            }
                        ]
                    },
                    amount: {
                        currency: currency,
                        total: amount
                    },
                    description: "This is the payment description."
                }
            ]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                throw error;
            } else {
                console.log("Create Payment Response");
                console.log(payment);

                for (var index = 0; index < payment.links.length; index++) {
                    // Redirect user to this endpoint for redirect url
                    if (payment.links[index].rel === 'approval_url') {
                        res.redirect(payment.links[index].href);
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching unpaid order:', error);
        res.redirect('http://return_url/?status=error&message=Error fetching unpaid order');
    }
});

route.get("/execute", async(req, res) => {
    const amount = req.query.amount;
    const orderId = req.query.orderId; // Retrieve the order ID from query parameters
    var execute_payment_json = {
        payer_id: req.query.PayerID,
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: amount
                }
            }
        ]
    };

    const paymentId = req.query.paymentId;

    try {
        // Execute the payment using the obtained payment ID
        paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
            if (error) {
                console.error(error.response);
                throw error;
            } else {
                console.log("Payment success");
                console.log(JSON.stringify(payment));

                try {
                    // Update payment status and add payment details in your database
                    const order = await Order.findOneAndUpdate(
                        { _id: orderId, paid: false }, // Update based on order ID and unpaid status
                        { $set: { paid: true, paymentDetails: payment } },
                        { new: true }
                    );

                    if (!order) {
                        console.error('Order not found or already paid');
                        return res.redirect(`http://return_url/?status=error&id=${req.query.PayerID}`);
                    }

                    console.log('Updated paid status and added payment details for order successfully.');

                    // Now, let's redirect the user with a success message
                    res.redirect(`http://return_url/?status=success&id=${req.query.PayerID}&state=${payment.state}`);
                } catch (updateError) {
                    console.error('Error updating payment status and adding payment details:', updateError);
                    // Redirect the user with an error message
                    res.redirect(`http://return_url/?status=error&id=${req.query.PayerID}`);
                }
            }
        });
    } catch (executeError) {
        console.error('Error executing payment:', executeError);
        res.redirect(`http://return_url/?status=error&id=${req.query.PayerID}`);
    }
});

module.exports = route;
