

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUtensils, faHome, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import './FoodItems.css'; // Main CSS file

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

function FoodItems() {
  const [foodItems, setFoodItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [message, setMessage] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  const fetchFoodItems = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/food-items');
      setFoodItems(Array.isArray(response.data) ? response.data : []);
      console.log('Food items fetched successfully:', response.data);
    } catch (error) {
      console.error('Error fetching food items:', error);
      setFoodItems([]);
    }
  };

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/api/food-items', {
        name: itemName,
        price: parseFloat(itemPrice)
      });
      setMessage(response.data.message);
      setItemName('');
      setItemPrice('');
      fetchFoodItems();
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  const handleEdit = (id) => {
    setEditingItem(id); // Set the id of the item being edited
    // You can implement further logic here to open a modal or a form for editing
    // You can prefill the form with the current price of the food item
  };

  const handleSaveEdit = async (id, newPrice) => {
    try {
      await axios.put(`http://localhost:4000/api/food-items/${id}`, { price: newPrice });
      fetchFoodItems(); // Fetch food items again to update the list
      setEditingItem(null); // Reset editing state
    } catch (error) {
      console.error('Error editing food item:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:4000/api/food-items/${id}`);
      if (response.status === 200) {
        fetchFoodItems();
      }
    } catch (error) {
      console.error('Error deleting food item:', error);
    }
  };

  return (
    <div className="full-page">
      <Navbar />
      <div className="food-item-container">
      
        <div className="food-item-list">
          <h2>Food Items</h2>
          <table className="food-item-table">
            <thead>
              <tr>
                <th>index</th>
                <th>Name</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {foodItems.map((foodItem, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{foodItem.name}</td>
                  <td>
                    {editingItem === foodItem._id ? ( // Check if the item is being edited
                      <input
                        type="number"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                        step="0.01"
                        required
                      />
                    ) : (
                      `$${foodItem.price}`
                    )}
                  </td>
                  <td>
                    {editingItem === foodItem._id ? ( // Show save button when editing
                      <button onClick={() => handleSaveEdit(foodItem._id, itemPrice)}>Save</button>
                    ) : (
                      <button className="edit" onClick={() => handleEdit(foodItem._id)}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    )}
                    <button className="delete" onClick={() => handleDelete(foodItem._id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        <div className="add-food-item">
          <h2>Add Food Item</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="itemName">Name:</label>
              <input
                type="text"
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="itemPrice">Price: </label>
              <input
                type="number"
                id="itemPrice"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                step="0.01"
                required
              />
            </div>
            <button type="submit">Add Food Item</button>
          </form>
          {message && <p>{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default FoodItems;