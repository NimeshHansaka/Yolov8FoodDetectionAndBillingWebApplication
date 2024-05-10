import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUtensils, faHome, faCheckCircle, faTimesCircle, faTrash } from '@fortawesome/free-solid-svg-icons';




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





function About() {
  return (
    <div>
       <Navbar />


       <h1>Hi Admin</h1>

<h2>About US</h2>




<h2>Features:</h2>
<ul>
  <li>You Can check Order and Pyment  Details in Orders</li>
  <li>View daily sales reports  in  Daily Sales</li>
  <li>View monthly sale reports in MOnthly Sales</li>
  <li>Manage food items in Food items</li>
  {/* Add more features here */}
</ul>






    </div>
  )
}

export default About





