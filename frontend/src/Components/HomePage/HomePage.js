import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Import CSS file for styling
//import logo from './logo.png'; // Import your logo image

const Home = () => {
    return (
        <div className="home-container">
            {/* Navbar */}
            <nav className="navbar">
                {/* Logo and name */}
                <div className="logo-container">
                    {/* <img src={logo} alt="Logo" className="logo" /> */}
                    <span className="logo-text">Automated Self Service System</span>
                </div>
                {/* Navigation Links */}
                <div className="nav-links">
                   
                    <Link to="/admin/login" className="nav-link">Admin</Link>
                </div>
            </nav>

            {/* Main content */}
            <div className="main-content">
                <h1>Welcome to Automated Self Service Restuarant</h1>
                <p>Start  app  here!</p>
                <Link to="/app">
                    <button className="camera-button">Camera</button>
                </Link>
            </div>
        </div>
    );
};

export default Home;