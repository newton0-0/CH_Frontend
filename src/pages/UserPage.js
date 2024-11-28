import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';

const UserPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [empId, setEmpId] = useState('');
    const [error, setError] = useState('');
    const [redirect, setRedirect] = useState(false);
    const [userType, setUserType] = useState('user');

    // Redirect if already logged in
    useEffect(() => {
        if (Cookies.get('auth')) {
            setRedirect(true);
        }
    }, []);

    const handleRegister = async () => {
        if(!name || !email || !password || !empId || !confirmPassword) {
            setError('All fields are required.');
            return;
        }

        if(password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const response = await axios.post(process.env.REACT_APP_BASE_URL + '/user/register', {
                name,
                email,
                password,
                empId
            });
            if(response.data.code === 200) {
                Cookies.set('auth', response.data.token);
                alert('Congratulations! You have been registered for now and will be provided acces post approval.');
                return;
            }
            window.location.href = '/';
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred. Please try again.');
        }
    }

    const handleLogin = async () => {
        try {
            const response = await axios.post(process.env.REACT_APP_BASE_URL + '/user/login', {
                email,
                password
            });
            
            if(response.data.role === 'emp') {
                Cookies.set('auth', response.data.token);
                setRedirect(true);
                return;
            }
            if(response.data.role === 'admin') {
                Cookies.set('auth', response.data.token);
                window.location.href = '/admin-dashboard';
                return;
            }

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
            <div className="d-flex justify-content-between mb-3">
                <button className={`btn ${userType === 'new' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setUserType('new')}>New</button>
                <button className={`btn ${userType === 'user' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setUserType('user')}>Employee</button>
            </div>
            {(userType === 'user') &&
            <div> 
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
            }
            {(userType === 'new') &&
            <div> 
            <h2 className="text-center mb-4">New User Registration</h2>
            <form className="w-100">
                <div className="form-group mb-3">
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        required
                    />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="name">empId:</label>
                    <input
                        type="text"
                        id="name"
                        className="form-control"
                        value={empId}
                        onChange={(e) => setEmpId(e.target.value)}
                        placeholder="Enter your empId"
                        required
                    />
                </div>
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
                <div className="form-group mb-3">
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                    />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={handleRegister}
                >
                    Register
                </button>
            </form>
            </div>            
            }
        </div>
    );
};

export default UserPage;