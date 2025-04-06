import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChessKnight, FaChessQueen } from 'react-icons/fa';
import bgImage from "../assets/1.jpg";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_PASSWORD = "admin";

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem("token", "admin-token");
      console.log("Đăng nhập thành công với tài khoản admin");
      navigate("/home");
    } else {
      alert("Email hoặc mật khẩu không đúng. Chỉ tài khoản admin mới được phép đăng nhập.");
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative font-sans"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-purple-900/40 to-transparent"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-purple-500/50 shadow-[0_0_30px_rgba(147,51,234,0.6)] transition-all duration-500">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FaChessQueen className="text-purple-300 text-4xl mr-3 drop-shadow-[0_0_10px_rgba(147,51,234,0.7)]" />
            <h2 
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300 drop-shadow-[0_0_10px_rgba(147,51,234,0.9)]"
            >
              Login
            </h2>
          </div>
          <p className="text-purple-200 text-base drop-shadow-[0_0_5px_rgba(147,51,234,0.5)]">
            ChessVN System Administration
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2 drop-shadow-[0_0_3px_rgba(147,51,234,0.5)]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-white placeholder-purple-300/50 shadow-[0_0_12px_rgba(147,51,234,0.4)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(147,51,234,0.6)]"
              placeholder="Nhập email của bạn"
              required
            />
          </div>
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2 drop-shadow-[0_0_3px_rgba(147,51,234,0.5)]">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-white placeholder-purple-300/50 shadow-[0_0_12px_rgba(147,51,234,0.4)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(147,51,234,0.6)]"
              placeholder="Nhập mật khẩu của bạn"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-400 text-white font-semibold rounded-full shadow-[0_0_15px_rgba(147,51,234,0.7)] hover:from-purple-500 hover:to-pink-300 hover:shadow-[0_0_25px_rgba(147,51,234,0.9)] hover:scale-105 transition-all duration-300"
          >
            Đăng Nhập
          </button>
        </form>

        <div className="absolute -bottom-12 -right-12 text-purple-300/20 animate-pulse">
          <FaChessKnight className="text-9xl" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;