import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';

const UserPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [redirect, setRedirect] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (Cookies.get('auth')) {
            setRedirect(true);
        }
    }, []);

    const handleLogin = async () => {
        try {
            const response = await axios.post(process.env.REACT_APP_BASE_URL + '/user/login', {
                email,
                password
            });
            console.log("data hain?  :", response.data.data.wishlist);

            Cookies.set('auth', response.data.token);

            setRedirect(true);
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred. Please try again.');
        }
    };

    if (redirect) {
        return <Navigate to="/employee-dashboard" />;
    }

    return (
        <div
            className="container mt-5 d-flex flex-column align-items-center justify-content-center"
            style={{
                maxWidth: '500px',
                backgroundColor: '#f8f9fa',
                padding: '2rem',
                borderRadius: '10px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
            }}
        >
            <h2 className="text-center mb-4">User Login</h2>
            <form className="w-100">
                <div className="form-group mb-3">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={handleLogin}
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default UserPage;