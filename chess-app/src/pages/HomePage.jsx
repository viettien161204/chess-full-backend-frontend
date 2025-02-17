import { Link } from 'react-router-dom';
import React, { useEffect } from 'react';
import logo from './1.png';
import chessBackground from './2.jpg';
import offlineBackground from './3.jpg';
import onlineBackground from './4.jpg';
import botBackground from './5.jpg';

const HomePage = () => {
  useEffect(() => {
    let currentSection = 0;
    const sections = document.querySelectorAll('section');

    const handleWheel = (e) => {
      if (e.deltaY > 0) {
        // Cuộn xuống
        if (currentSection < sections.length - 1) {
          currentSection++;
        }
      } else {
        // Cuộn lên
        if (currentSection > 0) {
          currentSection--;
        }
      }
      // Di chuyển đến section mới
      sections.forEach((section) => {
        section.style.transform = `translateY(-${currentSection * 100}vh)`;
      });
    };

    window.addEventListener('wheel', handleWheel);
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
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
            <Link to="#" className="text-black font-bold text-[18px] no-underline mx-[5px] transition-colors duration-300 hover:text-blue-600">
              Register
            </Link>
            <Link to="#" className="text-black font-bold text-[18px] no-underline mx-[5px] transition-colors duration-300 hover:text-blue-600">
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
        {/* Overlay mờ giúp chữ dễ đọc hơn */}
        <div className="absolute inset-0 bg-black opacity-50"></div>

        {/* Khung nội dung nhỏ hơn và mờ hơn */}
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
        style={{
          backgroundImage: `url(${onlineBackground})`,
          filter: "brightness(1.2)"  // Làm sáng hình nền
        }}
      >
        {/* Overlay mờ giúp chữ dễ đọc hơn */}
        <div className="absolute inset-0 bg-black opacity-50"></div>

        {/* Khung nội dung nhỏ gọn và tinh tế */}
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
        style={{
          backgroundImage: `url(${botBackground})`,
          filter: "brightness(1.4)"  // Làm sáng hình nền hơn
        }}
      >
        {/* Overlay màu tím đậm giúp chữ dễ đọc hơn */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2c3e50cc] to-[#4b6584cc]"></div>

        {/* Khung nội dung mờ tinh tế và hiện đại */}
        <div className="relative bg-white/15 border border-white/20 rounded-[30px] p-6 text-[#333] w-3/5 max-w-[280px] shadow-2xl backdrop-blur-xl transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          <h2 className="mb-[10px] text-3xl font-bold text-white drop-shadow-lg">Play With Bot</h2>
          <p className="mb-[15px] text-base text-gray-200 drop-shadow-md">Challenge AI to improve your skills.</p>
          <Link
            to="/chess"
            className="inline-block bg-gradient-to-r from-[#43cea2] to-[#185a9d] hover:from-[#185a9d] hover:to-[#43cea2] text-white py-[8px] px-[25px] no-underline rounded-full shadow-md transition-all duration-300 hover:shadow-xl hover:from-[#4e54c8] hover:to-[#3f86ed] hover:-translate-y-[3px] hover:scale-105"
          >
            Play Now
          </Link>
        </div>
      </section>
      

      {/* Footer */}
<footer className="bg-gradient-to-b from-[#1c1c1e] to-[#0a0a0a] text-gray-400 py-12 px-5">
  <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
    {/* Cột 1: Giới thiệu */}
    <div className="transform transition-all duration-300 hover:scale-105">
      <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-[#6a11cb] to-[#2575fc] bg-clip-text text-transparent">
        Website Cờ Vua
      </h3>
      <p className="text-sm leading-relaxed">
        Chào mừng bạn đến với thế giới cờ vua. Nơi bạn có thể thách đấu với bạn bè, AI thông minh và người chơi từ khắp nơi trên thế giới.
      </p>
    </div>

    {/* Cột 2: Liên kết nhanh */}
    <div className="transform transition-all duration-300 hover:scale-105">
      <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] bg-clip-text text-transparent">
        Liên Kết Nhanh
      </h3>
      <ul className="text-sm space-y-3">
        <li>
          <Link to="/" className="hover:text-white transition-colors duration-300 hover:underline hover:underline-offset-4">
            Trang Chủ
          </Link>
        </li>
        <li>
          <Link to="/chess" className="hover:text-white transition-colors duration-300 hover:underline hover:underline-offset-4">
            Chơi Ngay
          </Link>
        </li>
        <li>
          <Link to="#" className="hover:text-white transition-colors duration-300 hover:underline hover:underline-offset-4">
            Đăng Ký
          </Link>
        </li>
        <li>
          <Link to="#" className="hover:text-white transition-colors duration-300 hover:underline hover:underline-offset-4">
            Đăng Nhập
          </Link>
        </li>
      </ul>
    </div>

    {/* Cột 3: Liên hệ */}
    <div className="transform transition-all duration-300 hover:scale-105">
      <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-[#43cea2] to-[#185a9d] bg-clip-text text-transparent">
        Liên Hệ
      </h3>
      <p className="text-sm mb-2">Email: support@chesswebsite.com</p>
      <p className="text-sm mb-4">Điện thoại: 0123 456 789</p>
      <div className="flex space-x-4">
        <a href="#" className="text-gray-400 hover:text-[#6a11cb] transition-colors duration-300">
          <i className="fab fa-facebook-f text-2xl"></i>
        </a>
        <a href="#" className="text-gray-400 hover:text-[#1da1f2] transition-colors duration-300">
          <i className="fab fa-twitter text-2xl"></i>
        </a>
        <a href="#" className="text-gray-400 hover:text-[#e1306c] transition-colors duration-300">
          <i className="fab fa-instagram text-2xl"></i>
        </a>
      </div>
    </div>
  </div>

  {/* Phần bản quyền */}
  <div className="mt-12 text-center text-sm text-gray-600 border-t border-gray-700 pt-6">
    <p className="text-gray-500">
      © 2025 Website Cờ Vua. All rights reserved. | 
      <span className="text-gray-400"> Designed with ❤️ by Chess Team</span>
    </p>
  </div>
</footer>
    </div>
  );
};

export default HomePage;