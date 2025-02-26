import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import logo from './1.png';
import chessBackground from './2.jpg';
import offlineBackground from './3.jpg';
import onlineBackground from './4.jpg';
import botBackground from './5.jpg';

const HomePage = () => {
  const [isScrolling, setIsScrolling] = useState(false); // Biến kiểm soát việc cuộn
  const [currentSection, setCurrentSection] = useState(0); // Biến lưu section hiện tại

  useEffect(() => {
    const sections = document.querySelectorAll('section');

    const handleWheel = (e) => {
      if (isScrolling) return; // Nếu đang cuộn thì không làm gì cả

      setIsScrolling(true); // Đánh dấu đang cuộn

      if (e.deltaY > 0) {
        // Cuộn xuống
        if (currentSection < sections.length - 1) {
          setCurrentSection((prev) => prev + 1); // Tăng section hiện tại
        }
      } else {
        // Cuộn lên
        if (currentSection > 0) {
          setCurrentSection((prev) => prev - 1); // Giảm section hiện tại
        }
      }

      // Di chuyển đến section mới
      sections.forEach((section, index) => {
        section.style.transform = `translateY(-${currentSection * 100}vh)`;
      });

      // Đặt lại trạng thái cuộn sau 800ms (thời gian transition)
      setTimeout(() => {
        setIsScrolling(false);
      }, 800); // Thay đổi thời gian này nếu cần
    };

    window.addEventListener('wheel', handleWheel, { passive: false }); // Chặn scroll mặc định
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [currentSection, isScrolling]); // Theo dõi thay đổi của currentSection và isScrolling

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', overflow: 'hidden' }}>
      {/* Navigation */}
      <nav className="bg-white py-[15px] fixed top-0 left-0 right-0 z-10 w-full shadow-md rounded-[15px] border-[1px] border-gray-300 mx-auto mt-[10px] max-w-[1200px]">
        <ul className="flex justify-between items-center list-none px-[20px]">
          {/* Logo ở góc trái */}
          <li>
            <Link to="/">
              <img src={logo} alt="Mine Store Logo" className="h-[50px] w-auto" />
            </Link>
          </li>

          {/* Home ở chính giữa */}
          <li className="flex-1 text-center">
            <Link to="/" className="text-black font-bold text-[18px] no-underline ml-[100px] transition-colors duration-300 hover:text-blue-600">
              Home
            </Link>
          </li>

          {/* Register và Login ở góc phải */}
          <li className="text-right">
            <Link to="/register" className="text-black font-bold text-[18px] no-underline mx-[5px] transition-colors duration-300 hover:text-blue-600">
              Register
            </Link>
            <Link to="/login" className="text-black font-bold text-[18px] no-underline mx-[5px] transition-colors duration-300 hover:text-blue-600">
              | Login
            </Link>
          </li>
        </ul>
      </nav>

      {/* Sections */}
      <section
        className="h-[110vh] flex justify-start items-center flex-col text-center transition-transform ease-in-out duration-500 bg-cover bg-center text-white pt-[100px] pl-[30px]"
        style={{ backgroundImage: `url(${chessBackground})` }}
      >
        <h1 className="text-7xl font-extrabold" style={{ fontFamily: 'Cinzel, serif' }}>Chess</h1>
        <p className="text-4xl mt-[10px]" style={{ fontFamily: 'Cinzel, serif' }}>Welcome To The World Of Chess!</p>
      </section>

      {/* Section Chơi Offline */}
      <section
        className="relative h-[110vh] flex justify-center items-center text-center transition-transform ease-in-out duration-500 bg-cover bg-center"
        style={{ backgroundImage: `url(${offlineBackground})` }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative bg-white/50 border border-gray-100 rounded-[20px] p-4 text-[#333] w-3/5 max-w-[300px] shadow-lg backdrop-blur-xl transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)]">
          <h2 className="mb-[10px] text-3xl font-bold text-[#2c3e50]">Play Offline</h2>
          <p className="mb-[15px] text-base text-[#555]">Two people play on one computer.</p>
          <Link
            to="/chess"
            className="inline-block bg-gradient-to-r from-[#6a11cb] to-[#2575fc] text-white py-[8px] px-[25px] no-underline rounded-full shadow-md transition-all duration-300 hover:shadow-xl hover:from-[#4e54c8] hover:to-[#3f86ed] hover:-translate-y-[3px] hover:scale-105"
          >
            Play Now
          </Link>
        </div>
      </section>

      {/* Section Chơi Online */}
      <section
        className="relative h-[110vh] flex justify-center items-center text-center transition-transform ease-in-out duration-500 bg-cover bg-center"
        style={{ backgroundImage: `url(${onlineBackground})` }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative bg-white/25 border border-white/30 rounded-[20px] p-4 text-[#333] w-3/5 max-w-[280px] shadow-lg backdrop-blur-md transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)]">
          <h2 className="mb-[10px] text-3xl font-bold text-white drop-shadow-lg">Play Online</h2>
          <p className="mb-[15px] text-base text-gray-200 drop-shadow-md">Challenge friends or random players worldwide.</p>
          <Link
            to="/"
            className="inline-block bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] text-white py-[8px] px-[20px] no-underline rounded-full shadow-md transition-all duration-300 hover:shadow-xl hover:from-[#feb47b] hover:to-[#ff7e5f] hover:-translate-y-[3px] hover:scale-105"
          >
            Play Now
          </Link>
        </div>
      </section>

      {/* Section Chơi Với Bot */}
      <section
        className="relative h-[110vh] flex justify-center items-center text-center transition-transform ease-in-out duration-500 bg-cover bg-center"
        style={{ backgroundImage: `url(${botBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#2c3e50cc] to-[#4b6584cc]"></div>
        <div className="relative bg-white/15 border border-white/20 rounded-[30px] p-6 text-[#333] w-3/5 max-w-[280px] shadow-2xl backdrop-blur-xl transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          <h2 className="mb-[10px] text-3xl font-bold text-white drop-shadow-lg">Play With Bot</h2>
          <p className="mb-[15px] text-base text-gray-200 drop-shadow-md">Challenge AI to improve your skills.</p>
          <Link
            to="/chessbot"
            className="inline-block bg-gradient-to-r from-[#43cea2] to-[#185a9d] hover:from-[#185a9d] hover:to-[#43cea2] text-white py-[8px] px-[25px] no-underline rounded-full shadow-md transition-all duration-300 hover:shadow-xl hover:from-[#4e54c8] hover:to-[#3f86ed] hover:-translate-y-[3px] hover:scale-105"
          >
            Play Now
          </Link>
        </div>
      </section>

      <footer className="bg-gradient-to-b from-[#1a1a1d] to-[#0d0d0f] text-gray-400 h-[110vh] py-20 px-5 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-stripes.png')] opacity-10"></div>

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
          {/* Column 1: Introduction */}
          <div className="bg-white/5 border border-white/20 p-6 rounded-lg transform transition-all duration-300 hover:shadow-xl hover:scale-105">
            <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-[#6a11cb] to-[#2575fc] bg-clip-text text-transparent">
              Chess Website
            </h3>
            <p className="text-sm leading-relaxed">
              Welcome to the chess world. Challenge friends, smart AI, and players from around the globe.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="bg-white/5 border border-white/20 p-6 rounded-lg transform transition-all duration-300 hover:shadow-xl hover:scale-105">
            <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] bg-clip-text text-transparent">
              Quick Links
            </h3>
            <ul className="text-sm space-y-3">
              <li>
                <Link to="/" className="hover:text-white transition-colors duration-300 hover:underline flex items-center">
                  <span className="mr-2">🏠</span> Home
                </Link>
              </li>
              <li>
                <Link to="/chess" className="hover:text-white transition-colors duration-300 hover:underline flex items-center">
                  <span className="mr-2">♟️</span> Play Now
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors duration-300 hover:underline flex items-center">
                  <span className="mr-2">📝</span> Register
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors duration-300 hover:underline flex items-center">
                  <span className="mr-2">🔑</span> Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="bg-white/5 border border-white/20 p-6 rounded-lg transform transition-all duration-300 hover:shadow-xl hover:scale-105">
            <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-[#43cea2] to-[#185a9d] bg-clip-text text-transparent">
              Contact
            </h3>
            <p className="text-sm mb-2">📧 Email: support@chesswebsite.com</p>
            <p className="text-sm mb-4">📞 Phone: 0123 456 789</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#6a11cb] transition-colors duration-300 transform hover:scale-110">
                <i className="fab fa-facebook-f text-2xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#1da1f2] transition-colors duration-300 transform hover:scale-110">
                <i className="fab fa-twitter text-2xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#e1306c] transition-colors duration-300 transform hover:scale-110">
                <i className="fab fa-instagram text-2xl"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 text-center text-sm text-gray-600 border-t border-gray-700 pt-6 relative z-10">
          <p className="text-gray-500">
            © 2025 Chess Website. All rights reserved. | 
            <span className="text-gray-400"> Designed with ❤️ by Chess Team</span>
          </p>
        </div>

        {/* Animation: Floating chess pieces */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute w-10 h-10 bg-white/10 rounded-full animate-float" style={{ top: '10%', left: '5%', animationDelay: '0s' }}></div>
          <div className="absolute w-8 h-8 bg-white/10 rounded-full animate-float" style={{ top: '20%', left: '80%', animationDelay: '2s' }}></div>
          <div className="absolute w-12 h-12 bg-white/10 rounded-full animate-float" style={{ top: '50%', left: '30%', animationDelay: '4s' }}></div>
          <div className="absolute w-9 h-9 bg-white/10 rounded-full animate-float" style={{ top: '70%', left: '60%', animationDelay: '6s' }}></div>
        </div>

        {/* Additional subtle glow effect at the bottom */}
        <div className="absolute bottom-0 left-0 w-full h-[400px] bg-gradient-to-t from-[#1a1a1d] to-transparent opacity-20"></div>
      </footer>
    </div>
  );
};

export default HomePage;