


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUtensils, faHome } from '@fortawesome/free-solid-svg-icons';
import './MonthlySale.css'; // Import CSS file

// Navbar component
function Navbar() {
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

function MonthlySalesDetails() {
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [monthlySales, setMonthlySales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalSalePrice, setTotalSalePrice] = useState(0);
    const [totalExpenditure, setTotalExpenditure] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);

    useEffect(() => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear().toString();
        const currentMonth = (currentDate.getMonth() + 1).toString(); // Month is zero-based

        setYear(currentYear);
        setMonth(currentMonth);
    }, []);

    useEffect(() => {
        const fetchMonthlySales = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`http://localhost:4000/api/monthly-sales/details?year=${year}&month=${month}`);
                setMonthlySales(response.data.monthlySales);

                let totalSalePrice = 0;
                let totalExpenditure = 0;
                let totalProfit = 0;
                response.data.monthlySales.forEach(sale => {
                    totalSalePrice += sale.totalSalePrice;
                    totalExpenditure += sale.totalExpenditure;
                    totalProfit += sale.profit;
                });
                setTotalSalePrice(totalSalePrice);
                setTotalExpenditure(totalExpenditure);
                setTotalProfit(totalProfit);
            } catch (error) {
                setError(error.message || 'Failed to fetch monthly sales data');
            }

            setLoading(false);
        };

        if (year && month) {
            fetchMonthlySales();
        }
    }, [year, month]);

    useEffect(() => {
        const saveMonthlySalesAtEndOfMonth = () => {
            const currentDate = new Date();
            const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
            if (currentDate.getDate() === lastDayOfMonth) {
                saveMonthlySales();
            }
        };

        const interval = setInterval(saveMonthlySalesAtEndOfMonth, 86400000); // Check every day
        return () => clearInterval(interval);
    }, []);

    const handleYearChange = (event) => {
        setYear(event.target.value);
    };

    const handleMonthChange = (event) => {
        setMonth(event.target.value);
    };

    const saveMonthlySales = async () => {
        try {
            await axios.post(`http://localhost:4000/api/monthly-sales/save`, {
                year,
                month,
                totalSalePrice,
                totalExpenditure,
                totalProfit
                // TODO: Add the rest of the fields

            });
            console.log('Monthly sales details saved successfully.');
        } catch (error) {
            console.error('Error saving monthly sales details:', error);
        }
    };

    return (
        <div className="container">
            <Navbar />
            <h2>Monthly Sales Details</h2>
            <div className="date-picker">
                <label>Year:</label>
                <select value={year} onChange={handleYearChange}>
                    <option value="">Select Year</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                </select>
                <label>Month:</label>
                <select value={month} onChange={handleMonthChange}>
                    <option value="">Select Month</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                </select>
            </div>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {monthlySales.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Total Sale Price</th>
                            <th>Total Expenditure</th>
                            <th>Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthlySales.map((sale, index) => (
                            <tr key={index}>
                                <td>{sale.date}</td>
                                <td>{sale.totalSalePrice}</td>
                                <td>{sale.totalExpenditure}</td>
                                <td>{sale.profit}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="total-row">
                            <td>Total:</td>
                            <td>{totalSalePrice}</td>
                            <td>{totalExpenditure}</td>
                            <td>{totalProfit}</td>
                        </tr>
                    </tfoot>
                </table>
            )}
        </div>
    );
}

export default MonthlySalesDetails;