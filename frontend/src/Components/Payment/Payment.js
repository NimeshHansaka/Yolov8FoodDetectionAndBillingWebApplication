// import React, { useEffect, useState, useCallback } from 'react';
// import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
// import QRCode from 'qrcode.react';
// import axios from 'axios';
// import './Payment.css';
// import successSound from './success.mp3';
// import errorSound from './error.mp3';
// import { getDatabase, ref, push, set } from "firebase/database";
// import { app } from '../../firebaseConfig.js';

// const Payment = ({ totalBill, referenceNumber, clientId, phoneNumber }) => {
//     const [paymentSuccess, setPaymentSuccess] = useState(false);
//     const [paymentError, setPaymentError] = useState(null);
//     const [qrCodeValue, setQRCodeValue] = useState('');

//     const generateQRCodeValue = useCallback(() => {
//         // Generate QR code value with only the amount parameter
//         return `${totalBill}`;
//     }, [totalBill]);

//     const checkPaymentStatus = useCallback(async () => {
//         try {
//             const response = await axios.get(`http://localhost:4000/api/payment/status/${referenceNumber}`);
//             console.log("Checking payment status:", response.data);

//             const { success, paid } = response.data;

//             if (success && paid) {
//                 setPaymentSuccess(true);
//                 // Reload the window after payment success
//                 setTimeout(() => {
//                     window.location.reload();
//                 }, 3000); // Restart after 3 seconds

//                 // Trigger server restart upon successful payment
//                 try {
//                     await axios.post('http://localhost:4000/api/restartServer', {});
//                 } catch (error) {
//                     console.error('Error triggering server restart:', error);
//                 }
//             } else if (!success) {
//                 setPaymentError('Failed to check payment status');
//             }
//         } catch (error) {
//             console.error('Error checking payment status:', error);
//             setPaymentError('Failed to check payment status');
//         }
//     }, [referenceNumber]);

//     useEffect(() => {
//         const qrCodeValue = generateQRCodeValue();
//         setQRCodeValue(qrCodeValue);
//     }, [generateQRCodeValue]);

//     useEffect(() => {
//         const interval = setInterval(() => {
//             checkPaymentStatus();
//         }, 5000); // Polling interval: check every 5 seconds

//         return () => clearInterval(interval); // Cleanup function to clear interval

//     }, [checkPaymentStatus]);

//     const handlePaymentSuccess = async (details, data) => {
//         console.log("Payment successful!");
//         setPaymentSuccess(true);

//         try {
//             const response = await axios.post('http://localhost:4000/api/payment/success', {
//                 referenceNumber: referenceNumber,
//                 paymentDetails: details,
//                 clientId: clientId,
//                 phoneNumber: phoneNumber
//             });
//             console.log("Order updated in MongoDB:", response.data);

//             const audio = new Audio(successSound);
//             audio.play();

//              // Send payment details to Firebase Realtime Database
//              const database = getDatabase(app);
//              const paymentsRef = ref(database, 'payments');
//              const newPaymentRef = push(paymentsRef);
//              await set(newPaymentRef, {
//                  referenceNumber: referenceNumber,
//                  paymentDetails: details,
//                  phoneNumber: phoneNumber
//              });
 
//             console.log("Payment details sent to Firestore");

//         } catch (error) {
//             console.error('Error updating order in MongoDB:', error);
//             setPaymentError(error.message || 'Error updating order in MongoDB. Please contact support.');
//             playErrorSound();
//         }
//     };

//     const handlePaymentError = (err) => {
//         console.error("Payment failed:", err);
//         setPaymentError('Payment failed. Please try again later.');

//         setTimeout(() => {
//             playErrorSound();
//         }, 60000);
//     };

//     const playErrorSound = () => {
//         const errorAudio = new Audio(errorSound);
//         errorAudio.play();
//     };

//     return (
//         <PayPalScriptProvider options={{ 'client-id': 'AWG795VHTb_d1tsRKfMZ4_-K2J93C5fy_pTV5Vgz99igeQJTQXgcZOuosUyqoKDkydCllw1R4uf95tPv' }}>
//             <div className="payment-information-container">
//                 <h2 className="payment-title">Payment Information</h2>
//                 <p className="total-bill">Total Bill: ${totalBill}</p>
//                 <p className="reference-number">Reference Number: {referenceNumber}</p>
//                 <PayPalButtons
//                     style={{ layout: 'horizontal' }}
//                     createOrder={(data, actions) => {
//                         return actions.order.create({
//                             purchase_units: [{
//                                 amount: {
//                                     value: totalBill,
//                                     currency_code: 'USD'
//                                 }
//                             }]
//                         });
//                     }}
//                     onApprove={(data, actions) => {
//                         return actions.order.capture().then(function (details) {
//                             handlePaymentSuccess(details, data);
//                         });
//                     }}
//                     onError={handlePaymentError}
//                 />
//                 {paymentSuccess && (
//                     <p className="payment-success">
//                         <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
//                         Payment Successful!
//                     </p>
//                 )}
//                 {paymentError && (
//                     <div className="payment-error-container">
//                         <p className="payment-error">{paymentError}</p>
//                     </div>
//                 )}
//                 <div className="qr-code-container">
//                     <h3>Scan QR Code to Make Payment</h3>
//                     {qrCodeValue && <QRCode value={qrCodeValue} />}
//                 </div>
//             </div>
//         </PayPalScriptProvider>
//     );
// };

// export default Payment;


import React, { useEffect, useState, useCallback } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import QRCode from 'qrcode.react';
import axios from 'axios';
import './Payment.css';
import successSound from './success.mp3';
import errorSound from './error.mp3';
import { getDatabase, ref, push, set } from "firebase/database";
import { app } from '../../firebaseConfig.js';

const Payment = ({ totalBill, referenceNumber, clientId, phoneNumber }) => {
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [qrCodeValue, setQRCodeValue] = useState('');

    const generateQRCodeValue = useCallback(() => {
        // Generate QR code value with only the amount parameter
        return `${totalBill}`;
    }, [totalBill]);

    const checkPaymentStatus = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/payment/status/${referenceNumber}`);
            console.log("Checking payment status:", response.data);

            const { success, paid } = response.data;

            if (success && paid) {
                setPaymentSuccess(true);
                // Reload the window after payment success
                setTimeout(() => {
                    window.location.reload();
                }, 3000); // Restart after 3 seconds

                // Trigger server restart upon successful payment
                // try {
                //     await axios.post('http://localhost:4000/api/restartServer', {});
                // } catch (error) {
                //     console.error('Error triggering server restart:', error);
                // }
            } else if (!success) {
                setPaymentError('Failed to check payment status');
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
            setPaymentError('Failed to check payment status');
        }
    }, [referenceNumber]);

    useEffect(() => {
        const qrCodeValue = generateQRCodeValue();
        setQRCodeValue(qrCodeValue);
    }, [generateQRCodeValue]);

    useEffect(() => {
        const interval = setInterval(() => {
            checkPaymentStatus();
        }, 5000); // Polling interval: check every 5 seconds

        return () => clearInterval(interval); // Cleanup function to clear interval

    }, [checkPaymentStatus]);

    const handlePaymentSuccess = async (details, data) => {
        console.log("Payment successful!");
        setPaymentSuccess(true);
    
        try {
            const response = await axios.post('http://localhost:4000/api/payment/success', {
                referenceNumber: referenceNumber,
                paymentDetails: details,
                clientId: clientId,
                phoneNumber: phoneNumber
            });
            console.log("Order updated in MongoDB:", response.data);
    
            const audio = new Audio(successSound);
            audio.play();
    
            // Send payment details to Firebase Realtime Database
            const database = getDatabase(app);
            const paymentsRef = ref(database, 'payments');
            const newPaymentRef = push(paymentsRef);
            await set(newPaymentRef, {
                referenceNumber: referenceNumber,
                paymentDetails: details,
                phoneNumber: phoneNumber
            });
    
            console.log("Payment details sent to Firestore");
    
            // Reload the window after payment success
            setTimeout(() => {
                window.location.reload();
            }, 3000); // Restart after 3 seconds
    
        } catch (error) {
            console.error('Error updating order in MongoDB:', error);
            setPaymentError(error.message || 'Error updating order in MongoDB. Please contact support.');
            playErrorSound();
        }
    };

    const handlePaymentError = (err) => {
        console.error("Payment failed:", err);
        setPaymentError('Payment failed. Please try again later.');

        setTimeout(() => {
            playErrorSound();
        }, 60000);
    };

    const playErrorSound = () => {
        const errorAudio = new Audio(errorSound);
        errorAudio.play();
    };

    return (
        <PayPalScriptProvider options={{ 'client-id': 'AWG795VHTb_d1tsRKfMZ4_-K2J93C5fy_pTV5Vgz99igeQJTQXgcZOuosUyqoKDkydCllw1R4uf95tPv' }}>
            <div className="payment-information-container">
                <h2 className="payment-title">Payment Information</h2>
                <p className="total-bill">Total Bill: ${totalBill}</p>
                <p className="reference-number">Reference Number: {referenceNumber}</p>
                <PayPalButtons
                    style={{ layout: 'horizontal' }}
                    createOrder={(data, actions) => {
                        return actions.order.create({
                            purchase_units: [{
                                amount: {
                                    value: totalBill,
                                    currency_code: 'USD'
                                }
                            }]
                        });
                    }}
                    onApprove={(data, actions) => {
                        return actions.order.capture().then(function (details) {
                            handlePaymentSuccess(details, data);
                        });
                    }}
                    onError={handlePaymentError}
                />
                {paymentSuccess && (
                    <p className="payment-success">
                        <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
                        Payment Successful!
                    </p>
                )}
                {paymentError && (
                    <div className="payment-error-container">
                        <p className="payment-error">{paymentError}</p>
                    </div>
                )}
                <div className="qr-code-container">
                    <h3>Scan QR Code to Make Payment</h3>
                    {qrCodeValue && <QRCode value={qrCodeValue} />}
                </div>
            </div>
        </PayPalScriptProvider>
    );
};

export default Payment;