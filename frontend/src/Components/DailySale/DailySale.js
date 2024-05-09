import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUtensils, faHome } from '@fortawesome/free-solid-svg-icons';
import './DailySale.css'; // Import the CSS file

// Navbar component
const Navbar = () => {
    return (
        <nav className="navbar">
            <ul>
                <li><FontAwesomeIcon icon={faHome} /><a href="/">Home</a></li>
            </ul>
            <ul>
                <li><FontAwesomeIcon icon={faShoppingCart} /><a href="/details">Orders</a></li>
            </ul>
            <ul>
                <li><FontAwesomeIcon icon={faShoppingCart} /><a href="/dailysale">Daily Sale</a></li>
            </ul>
            <ul>
                <li><FontAwesomeIcon icon={faShoppingCart} /><a href="/monthlysale">Monthly Sale</a></li>
            </ul>
            <ul>
                <li><FontAwesomeIcon icon={faUtensils} /><a href="/admin/fooditems">Food Items</a></li>
            </ul>
        </nav>
    );
}

// DailySale component
const DailySale = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [dailySales, setDailySales] = useState([]);
    const [expenditure, setExpenditure] = useState([]);
    const [totalSalePrices, setTotalSalePrices] = useState({});
    const [totalExpenditure, setTotalExpenditure] = useState(0);
    const [profit, setProfit] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newExpenditure, setNewExpenditure] = useState({
        description: '',
        amount: ''
    });
    const [foodItemPrices, setFoodItemPrices] = useState({});

    const calculateTotalSalePrice = useCallback(() => {
        let totalSalePrice = 0;
        Object.values(totalSalePrices).forEach(sale => {
            totalSalePrice += sale.totalPrice;
        });
        return totalSalePrice;
    }, [totalSalePrices]);

    useEffect(() => {
        const fetchFoodItemPrices = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/food-item-prices');
                setFoodItemPrices(response.data.reduce((acc, item) => {
                    acc[item.name] = item.price;
                    return acc;
                }, {}));
                console.log('Food Item Prices:', response.data); // Log food item prices
            } catch (error) {
                console.error('Error fetching food item prices:', error);
            }
        };

        fetchFoodItemPrices();
    }, []);

    useEffect(() => {
        const fetchDailySales = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/daily-sale?date=${selectedDate}`);
                setDailySales(response.data.dailySales);
    
                // Ensure food item prices are available before calculation
                if (Object.keys(foodItemPrices).length === 0) {
                    return;
                }
    
                // Calculate total sale prices for each food item
                const totalSalePrices = {};
                response.data.dailySales.forEach(sale => {
                    // Check if the food item exists in the food item prices
                    if (foodItemPrices[sale.foodItem]) {
                        const totalPrice = foodItemPrices[sale.foodItem] * sale.totalQuantitySold;
                        if (!totalSalePrices[sale.foodItem]) {
                            totalSalePrices[sale.foodItem] = {
                                totalQuantitySold: sale.totalQuantitySold,
                                totalPrice: totalPrice
                            };
                        } else {
                            totalSalePrices[sale.foodItem].totalQuantitySold += sale.totalQuantitySold;
                            totalSalePrices[sale.foodItem].totalPrice += totalPrice;
                        }
                    } else {
                        console.error(`Price not found for food item: ${sale.foodItem}`);
                        // Provide a default price if the price is not found
                        totalSalePrices[sale.foodItem] = {
                            totalQuantitySold: 0,
                            totalPrice: 0
                        };
                    }
                });
                setTotalSalePrices(totalSalePrices);
    
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };
    
        fetchDailySales();
    }, [selectedDate, foodItemPrices]);

    useEffect(() => {
        fetchExpenditures(selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        const totalExpenditure = expenditure.reduce((total, item) => total + parseFloat(item.amount), 0);
        setTotalExpenditure(totalExpenditure);
        const totalProfit = calculateTotalProfit(calculateTotalSalePrice(), totalExpenditure);
        setProfit(totalProfit);
    }, [expenditure, totalExpenditure, calculateTotalSalePrice]);

    const calculateTotalProfit = (totalSalePrice, totalExpenditure) => {
        return totalSalePrice - totalExpenditure;
    };

    const addExpenditure = async () => {
        try {
            await axios.post('http://localhost:4000/api/expenditures', {
                date: selectedDate,
                description: newExpenditure.description,
                amount: parseFloat(newExpenditure.amount)
            });
            fetchExpenditures(selectedDate);
            setNewExpenditure({ description: '', amount: '' });
        } catch (error) {
            console.error('Error adding expenditure:', error);
        }
    };

    const addSales = async () => {
        try {
            // Extracting relevant fields from dailySales objects
            const salesData = dailySales.map(({ foodItem, totalQuantitySold, totalSale }) => ({
                foodItem,
                totalQuantitySold,
                totalSale
            }));

            const totalSalePrice = calculateTotalSalePrice();

            await axios.post('http://localhost:4000/api/daily-sales', {
                date: selectedDate,
                sales: salesData, // Send relevant sales data without _id field
                totalSalePrice,
                totalExpenditure,
                profit,
                expenditure
            });
            console.log('Sales data saved successfully');
        } catch (error) {
            console.error('Error saving sales data:', error);
        }
    };

    const removeExpenditure = async (id) => {
        try {
            await axios.delete(`http://localhost:4000/api/expenditures/${id}`);
            fetchExpenditures(selectedDate);
        } catch (error) {
            console.error('Error removing expenditure:', error);
        }
    };

    const fetchExpenditures = async (date) => {
        try {
            const response = await axios.get(`http://localhost:4000/api/expenditures?date=${date}`);
            setExpenditure(response.data.expenditures);
            setTotalExpenditure(response.data.totalExpenditure);
        } catch (error) {
            console.error('Error fetching expenditures:', error);
        }
    };

    if (loading) return <p>Loading...</p>;

    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className="full-page">
            <Navbar />
            <div className="date-picker">
                <label htmlFor="date">Select Date:</label>
                <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>
            <div className="expenditure">
                <h2 className="section-title">Expenditure</h2>
                <div className="expenditure-item">
                    <input
                        type="text"
                        value={newExpenditure.description}
                        onChange={(e) => setNewExpenditure({ ...newExpenditure, description: e.target.value })}
                        placeholder="New Description"
                    />
                    <input
                        type="number"
                        value={newExpenditure.amount}
                        onChange={(e) => setNewExpenditure({ ...newExpenditure, amount: e.target.value })}
                        placeholder="New Amount"
                    />
                    <button className="blue-button" onClick={addExpenditure}>
                        Add
                    </button>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenditure.map((item, index) => (
                            <tr key={index}>
                                <td>{item.description}</td>
                                <td>${item.amount}</td>
                                <td>
                                    <button
                                        className="remove-button"
                                        onClick={() => removeExpenditure(item._id)}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                        <tr className="total-expenditure-row">
                            <td colSpan="2">Total Expenditure:</td>
                            <td>${totalExpenditure}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="daily-sales">
                <h2 className="section-title">Daily Sales</h2>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Food Item</th>
                            <th>Total Quantity Sold</th>
                            <th>Total Sale</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(totalSalePrices).map(([foodItem, sale], index) => (
                            <tr key={index}>
                                <td>{foodItem}</td>
                                <td>{sale.totalQuantitySold}</td>
                                <td>${sale.totalPrice}</td>
                            </tr>
                        ))}
                        <tr className="total-sale-row">
                            <td colSpan="2">Total Sale Price</td>
                            <td>${calculateTotalSalePrice()}</td>
                        </tr>
                        <tr className="total-expenditure-row">
                            <td colSpan="2">Total Expenditure:</td>
                            <td>${totalExpenditure}</td>
                        </tr>
                        <tr className="profit-row">
                            <td colSpan="2">Profit:</td>
                            <td>${profit}</td>
                        </tr>
                    </tbody>
                </table>
                <button className="save-button save-sales-button" onClick={addSales}>Save Sales</button>
            </div>
        </div>
    );
}

export default DailySale;
