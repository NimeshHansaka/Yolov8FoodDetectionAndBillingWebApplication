


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUtensils, faHome, faCheckCircle, faTimesCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import './Details.css';

function Navbar() {
  return (
    <nav className="navbar">
      <ul>
        <li><FontAwesomeIcon icon={faHome} /><a href="/">Home</a></li>
      </ul>
      <ul>
          <li><FontAwesomeIcon icon={faShoppingCart} /><a href="/about">About</a></li>
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

function Details() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [totalSalePrice, setTotalSalePrice] = useState(0);

  useEffect(() => {
    const fetchOrdersByDate = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/orders/date/${selectedDate}`);
        setOrders(response.data.orders);
        setTotalSalePrice(response.data.totalSalePrice);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchOrdersByDate();
  }, [selectedDate]);

  const deleteOrder = async (orderIndex) => {
    try {
      const response = await axios.delete(`http://localhost:4000/api/orders/${orders[orderIndex]._id}`);
      if (response.status === 200) {
        const updatedOrders = [...orders];
        updatedOrders.splice(orderIndex, 1);
        setOrders(updatedOrders);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
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
      <h2>Total Sale Price for {selectedDate}: ${totalSalePrice}</h2>
      <h1>Orders</h1>
      <div className="container orders-container">

        {orders.length === 0 && <p>No orders available for {selectedDate}.</p>}
        {orders.map((order, index) => (
          <div key={index} className="order-item">
            <h2>Order {index + 1}</h2>
            <p>Total Bill: ${order.totalBill}</p>
            <p>Reference Number: {order.referenceNumber}</p>
            <p>Order Date and Time: {new Date(order.orderDateTime).toLocaleString()}</p>
            <h3>Detected Items:</h3>
            <ul>
              {order.detectedItems.map((item, itemIndex) => (
                <li key={itemIndex}>
                  Name: {item.name}, Quantity: {item.quantity}
                </li>
              ))}
            </ul>
            <p>Payment Status:
              {order.paid ?
                <FontAwesomeIcon icon={faCheckCircle} className="paid-icon" /> :
                <FontAwesomeIcon icon={faTimesCircle} className="pending-icon" />}
              {order.paid ? 'Paid' : 'Pending'}
            </p>
            <button className="delete-button" onClick={() => deleteOrder(index)}><FontAwesomeIcon icon={faTrash} /></button>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Details;