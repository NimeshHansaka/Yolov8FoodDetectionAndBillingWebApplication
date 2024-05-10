

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        // Check admin credentials (You can replace this with your authentication logic)
        if (username === 'admin' && password === 'password') {
            // If credentials are correct, navigate to admin dashboard
            navigate('/about');
        } else {
            alert('Invalid username or password');
        }
    };

    return (
        <div className="admin-login-container"> {/* Apply class for container */}
            <h1>Admin Login</h1>
            <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
            />
            <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default AdminLogin;