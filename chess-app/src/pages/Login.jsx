import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import logo from './1.png';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending request to:", '/api/auth/sign-in');
      console.log("Request data:", { email, password });
      const response = await axios.post('/api/auth/sign-in', {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log("Response:", response.data);
      const token = response.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', email);
      setError('');
      navigate('/');
    } catch (err) {
      console.error("Error:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Login failed. Please check your email and password.');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-rose-950 to-black">
      <nav className="bg-rose-900/90 shadow-[0_0_15px_rgba(251,113,133,0.5)] py-3 fixed top-0 left-0 right-0 z-20 rounded-b-xl max-w-7xl mx-auto mt-2 backdrop-blur-md transition-colors duration-500 ease-in-out">
        <ul className="flex justify-between items-center list-none px-4 md:px-6">
          <li>
            <Link to="/">
              <img src={logo} alt="Chess Logo" className="h-10 md:h-12 lg:h-16 w-auto transition-transform duration-300 hover:scale-110" style={{ filter: `drop-shadow(0 0 10px rgba(251,113,133,0.8))` }} />
            </Link>
          </li>
          <li className="flex-1 text-center">
            <Link to="/" className="text-rose-400 hover:text-rose-200 hover:drop-shadow-[0_0_8px_rgba(251,113,133,0.8)] font-semibold text-sm md:text-base lg:text-lg transition-all duration-300">
              Home
            </Link>
          </li>
          <li className="text-right space-x-2 md:space-x-4">
            <Link to="/register" className="text-rose-400 hover:text-rose-200 hover:drop-shadow-[0_0_8px_rgba(251,113,133,0.8)] font-semibold text-sm md:text-base lg:text-lg transition-all duration-300">
              Register
            </Link>
            <span className="text-rose-600">|</span>
            <Link to="/login" className="text-rose-400 hover:text-rose-200 hover:drop-shadow-[0_0_8px_rgba(251,113,133,0.8)] font-semibold text-sm md:text-base lg:text-lg transition-all duration-300">
              Login
            </Link>
          </li>
        </ul>
      </nav>

      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-lg p-6 md:p-8 bg-gradient-to-br from-gray-900/90 to-rose-950/90 shadow-[0_0_25px_rgba(251,113,133,0.6)] rounded-xl backdrop-blur-lg border border-rose-500/60 transform hover:scale-105 transition-all duration-500">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-center mb-8 text-rose-300 drop-shadow-[0_0_12px_rgba(251,113,133,0.8)] animate-fadeInDrop">Login</h1>
          {error && <p className="text-red-500 text-center mb-4 text-sm md:text-base">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4 md:mb-6">
              <label className="block text-rose-200 text-sm md:text-base font-bold mb-2 drop-shadow-[0_0_4px_rgba(251,113,133,0.5)]">Email</label>
              <input
                type="text"
                className="w-full px-3 py-2 md:px-4 md:py-3 border border-rose-500/50 rounded-lg bg-gray-800/80 text-rose-100 placeholder-rose-400/50 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-gray-700/80 transition-all duration-300 shadow-[inset_0_0_8px_rgba(251,113,133,0.3)] text-sm md:text-base"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4 md:mb-6">
              <label className="block text-rose-200 text-sm md:text-base font-bold mb-2 drop-shadow-[0_0_4px_rgba(251,113,133,0.5)]">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 md:px-4 md:py-3 border border-rose-500/50 rounded-lg bg-gray-800/80 text-rose-100 placeholder-rose-400/50 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-gray-700/80 transition-all duration-300 shadow-[inset_0_0_8px_rgba(251,113,133,0.3)] text-sm md:text-base"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold py-2 md:py-3 rounded-lg shadow-[0_0_15px_rgba(251,113,133,0.7)] hover:from-rose-700 hover:to-rose-600 hover:scale-105 hover:shadow-[0_0_25px_rgba(251,113,133,1)] transition-all duration-300 text-sm md:text-base"
            >
              Login
            </button>
          </form>
          <div className="text-center mt-6">
            <Link to="/register" className="text-rose-300 hover:text-rose-100 hover:drop-shadow-[0_0_8px_rgba(251,113,133,0.8)] transition-all duration-300 text-sm md:text-base">
              Create a new account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;