import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import logo from './1.png';
import chessBackground from './2.jpg';
import offlineBackground from './3.jpg';
import onlineBackground from './4.jpg';
import botBackground from './5.jpg';

const HomePage = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const sectionsCount = 5;

  const goToPrevious = () => {
    if (isAnimating || currentSection === 0) return;
    setIsAnimating(true);
    setCurrentSection((prev) => prev - 1);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const goToNext = () => {
    if (isAnimating || currentSection === sectionsCount - 1) return;
    setIsAnimating(true);
    setCurrentSection((prev) => prev + 1);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const goToSection = (index) => {
    if (isAnimating || index === currentSection) return;
    setIsAnimating(true);
    setCurrentSection(index);
    setTimeout(() => setIsAnimating(false), 800);
  };

  return (
    <div className="relative overflow-x-hidden h-screen font-sans bg-black">
      {/* Navigation Bar */}
      <nav className="bg-gray-900/90 py-3 fixed top-0 left-4 right-4 z-20 shadow-[0_0_15px_rgba(16,185,129,0.5)] rounded-b-xl max-w-7xl mx-auto mt-2 backdrop-blur-md">
        <ul className="flex justify-between items-center list-none px-4 md:px-6">
          <li>
            <Link to="/">
              <img src={logo} alt="Chess Logo" className="h-10 md:h-12 w-auto transition-transform duration-300 hover:scale-110 hover:drop-shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
            </Link>
          </li>
          <li className="flex-1 text-center">
            <Link to="/" className="text-emerald-400 font-semibold text-base md:text-lg transition-all duration-300 hover:text-emerald-200 hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
              Home
            </Link>
          </li>
          <li className="text-right space-x-2 md:space-x-4">
            <Link to="/register" className="text-emerald-400 font-semibold text-base md:text-lg transition-all duration-300 hover:text-emerald-200 hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
              Register
            </Link>
            <span className="text-emerald-600">|</span>
            <Link to="/login" className="text-emerald-400 font-semibold text-base md:text-lg transition-all duration-300 hover:text-emerald-200 hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
              Login
            </Link>
          </li>
        </ul>
      </nav>

      {/* Sections Container */}
      <div
        className="flex w-[500vw] h-full transition-all duration-800 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateX(-${currentSection * 100}vw)` }}
      >
        {/* Section 1: Welcome (Giữ nguyên gốc) */}
        <section
          className="w-screen h-screen flex justify-center items-start flex-col text-center bg-cover bg-center text-white relative"
          style={{ backgroundImage: `url(${chessBackground})`, backgroundPosition: 'center 40%' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 py-4 md:py-6 lg:py-8 mt-[calc(100vh-30rem)] md:mt-[calc(100vh-28rem)] lg:mt-[calc(100vh-26rem)]">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold animate-chessUnfold drop-shadow-[0_0_15px_rgba(255,140,0,0.9)]"
              style={{
                fontFamily: 'Playfair Display, serif',
                background: 'linear-gradient(to right, #ff8c00, #ffa500)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 5px 10px rgba(0, 0, 0, 0.4), 0 0 25px rgba(255, 140, 0, 0.8)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Welcome To The World Of Chess!
            </h1>
            <p
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl mt-2 md:mt-3 drop-shadow-[0_0_10px_rgba(255,69,0,0.7)] animate-chessUnfold delay-400"
              style={{
                fontFamily: 'Roboto, sans-serif',
                background: 'linear-gradient(to right, #ff4500, #ff8c00)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 3px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 69, 0, 0.6)',
                letterSpacing: '0.05em',
              }}
            >
              Enter The Ultimate Chess Realm!
            </p>
            <p className="text-sm md:text-base lg:text-lg mt-4 md:mt-5 text-blue-200 animate-pulse drop-shadow-[0_0_5px_rgba(0,0,255,0.5)]">
              Use arrows to explore
            </p>
          </div>
        </section>

        {/* Section 2: Play Offline (Xanh lục ma mị) */}
        <section
          className="w-screen h-screen flex justify-center items-center text-center bg-cover bg-center relative"
          style={{ backgroundImage: `url(${offlineBackground})`, backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-emerald-900/40 to-transparent"></div>
          <div className="relative bg-gray-900/80 border border-emerald-500/50 rounded-2xl p-6 text-emerald-200 w-11/12 max-w-md shadow-[0_0_20px_rgba(16,185,129,0.6)] backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.8)] hover:border-emerald-400">
            <h2 className="mb-4 text-3xl md:text-4xl font-bold text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.7)]">
              Play Offline
            </h2>
            <p className="mb-6 text-base md:text-lg text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
              Two people play on one computer.
            </p>
            <Link
              to="/chess"
              className="inline-block bg-gradient-to-r from-emerald-700 to-teal-600 text-white py-2 md:py-3 px-6 md:px-8 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)] transition-all duration-300 hover:from-emerald-800 hover:to-teal-700 hover:scale-110 hover:shadow-[0_0_25px_rgba(16,185,129,0.9)]"
            >
              Play Now
            </Link>
          </div>
        </section>

        {/* Section 3: Play Online (Tím đậm huyền bí) */}
        <section
          className="w-screen h-screen flex justify-center items-center text-center bg-cover bg-center relative"
          style={{ backgroundImage: `url(${onlineBackground})`, backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-purple-900/40 to-transparent"></div>
          <div className="relative bg-gray-900/70 border border-purple-500/50 rounded-2xl p-6 text-purple-200 w-11/12 max-w-md shadow-[0_0_20px_rgba(147,51,234,0.6)] backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(147,51,234,0.8)] hover:border-purple-400">
            <h2 className="mb-4 text-3xl md:text-4xl font-bold text-purple-300 drop-shadow-[0_0_10px_rgba(147,51,234,0.7)]">
              Play Online
            </h2>
            <p className="mb-6 text-base md:text-lg text-purple-400 drop-shadow-[0_0_5px_rgba(147,51,234,0.5)]">
              Challenge friends or players worldwide.
            </p>
            <Link
              to="/"
              className="inline-block bg-gradient-to-r from-purple-700 to-indigo-600 text-white py-2 md:py-3 px-6 md:px-8 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.6)] transition-all duration-300 hover:from-purple-800 hover:to-indigo-700 hover:scale-110 hover:shadow-[0_0_25px_rgba(147,51,234,0.9)]"
            >
              Play Now
            </Link>
          </div>
        </section>

        {/* Section 4: Play With Bot (Đỏ huyết bí ẩn) */}
        <section
          className="w-screen h-screen flex justify-center items-center text-center bg-cover bg-center relative"
          style={{ backgroundImage: `url(${botBackground})`, backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-rose-900/40 to-transparent"></div>
          <div className="relative bg-gray-900/60 border border-rose-500/50 rounded-2xl p-6 text-rose-200 w-11/12 max-w-md shadow-[0_0_20px_rgba(244,63,94,0.6)] backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(244,63,94,0.8)] hover:border-rose-400">
            <h2 className="mb-4 text-3xl md:text-4xl font-bold text-rose-300 drop-shadow-[0_0_10px_rgba(244,63,94,0.7)]">
              Play With Bot
            </h2>
            <p className="mb-6 text-base md:text-lg text-rose-400 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]">
              Challenge AI to improve your skills.
            </p>
            <Link
              to="/chessbot"
              className="inline-block bg-gradient-to-r from-rose-700 to-red-600 text-white py-2 md:py-3 px-6 md:px-8 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.6)] transition-all duration-300 hover:from-rose-800 hover:to-red-700 hover:scale-110 hover:shadow-[0_0_25px_rgba(244,63,94,0.9)]"
            >
              Play Now
            </Link>
          </div>
        </section>

        {/* Section 5: Footer (Xanh dương sâu thẳm) */}
        <section className="w-screen h-screen bg-gradient-to-br from-gray-900 to-teal-950 text-white py-12 px-4 md:px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')] opacity-20"></div>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="p-4 md:p-6 rounded-xl bg-gray-800/50 border border-teal-600/30 shadow-[0_0_15px_rgba(20,184,166,0.4)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(20,184,166,0.6)]">
              <h3 className="text-xl md:text-2xl font-bold text-teal-300 mb-4 bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(20,184,166,0.5)]">
                Chess Website
              </h3>
              <p className="text-xs md:text-sm text-teal-400">Explore the chess world with friends, AI, and global players.</p>
            </div>
            <div className="p-4 md:p-6 rounded-xl bg-gray-800/50 border border-teal-600/30 shadow-[0_0_15px_rgba(20,184,166,0.4)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(20,184,166,0.6)]">
              <h3 className="text-xl md:text-2xl font-bold text-teal-300 mb-4 bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(20,184,166,0.5)]">
                Quick Links
              </h3>
              <ul className="text-xs md:text-sm space-y-2 md:space-y-3">
                <li><Link to="/" className="text-teal-400 hover:text-teal-200 transition-all duration-300 hover:drop-shadow-[0_0_5px_rgba(20,184,166,0.5)]">🏠 Home</Link></li>
                <li><Link to="/chess" className="text-teal-400 hover:text-teal-200 transition-all duration-300 hover:drop-shadow-[0_0_5px_rgba(20,184,166,0.5)]">♟️ Play Now</Link></li>
                <li><Link to="/register" className="text-teal-400 hover:text-teal-200 transition-all duration-300 hover:drop-shadow-[0_0_5px_rgba(20,184,166,0.5)]">📝 Register</Link></li>
                <li><Link to="/login" className="text-teal-400 hover:text-teal-200 transition-all duration-300 hover:drop-shadow-[0_0_5px_rgba(20,184,166,0.5)]">🔑 Login</Link></li>
              </ul>
            </div>
            <div className="p-4 md:p-6 rounded-xl bg-gray-800/50 border border-teal-600/30 shadow-[0_0_15px_rgba(20,184,166,0.4)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(20,184,166,0.6)]">
              <h3 className="text-xl md:text-2xl font-bold text-teal-300 mb-4 bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(20,184,166,0.5)]">
                Contact
              </h3>
              <p className="text-xs md:text-sm mb-2 text-teal-400">📧 Email: support@chesswebsite.com</p>
              <p className="text-xs md:text-sm mb-4 text-teal-400">📞 Phone: 0123 456 789</p>
              <div className="flex space-x-3 md:space-x-4">
                <a href="#" className="text-teal-400 hover:text-teal-200 transition-all duration-300 hover:drop-shadow-[0_0_5px_rgba(20,184,166,0.5)]"><i className="fab fa-facebook-f text-lg md:text-xl"></i></a>
                <a href="#" className="text-teal-400 hover:text-teal-200 transition-all duration-300 hover:drop-shadow-[0_0_5px_rgba(20,184,166,0.5)]"><i className="fab fa-twitter text-lg md:text-xl"></i></a>
                <a href="#" className="text-teal-400 hover:text-teal-200 transition-all duration-300 hover:drop-shadow-[0_0_5px_rgba(20,184,166,0.5)]"><i className="fab fa-instagram text-lg md:text-xl"></i></a>
              </div>
            </div>
          </div>
          <div className="mt-8 md:mt-12 text-center text-xs md:text-sm text-teal-400 drop-shadow-[0_0_5px_rgba(20,184,166,0.3)]">
            <p>© 2025 Chess Website. All rights reserved. | Designed with ❤️ by Chess Team</p>
          </div>
        </section>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className={`fixed left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-20 w-10 md:w-12 h-10 md:h-12 rounded-full bg-gray-900/80 shadow-[0_0_10px_rgba(16,185,129,0.5)] flex items-center justify-center transition-all duration-300 ${
          currentSection === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-900/90 hover:scale-110 hover:shadow-[0_0_15px_rgba(16,185,129,0.7)]'
        }`}
      >
        <svg className="w-5 md:w-6 h-5 md:h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className={`fixed right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-20 w-10 md:w-12 h-10 md:h-12 rounded-full bg-gray-900/80 shadow-[0_0_10px_rgba(16,185,129,0.5)] flex items-center justify-center transition-all duration-300 ${
          currentSection === sectionsCount - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-900/90 hover:scale-110 hover:shadow-[0_0_15px_rgba(16,185,129,0.7)]'
        }`}
      >
        <svg className="w-5 md:w-6 h-5 md:h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Navigation Dots */}
      <div className="fixed bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2 md:space-x-3">
        {Array.from({ length: sectionsCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSection(index)}
            className={`w-2 md:w-3 h-2 md:h-3 rounded-full transition-all duration-300 ${
              currentSection === index
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]'
                : 'bg-emerald-800/50 hover:bg-emerald-600 hover:shadow-[0_0_5px_rgba(16,185,129,0.5)]'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// CSS cho animation (thêm vào file CSS hoặc Tailwind config nếu cần)
const styles = `
  @keyframes chessUnfold {
    0% {
      opacity: 0;
      transform: translateY(30px) scale(0.5) rotate(-10deg);
      filter: blur(5px);
    }
    50% {
      opacity: 0.7;
      transform: translateY(10px) scale(1.1) rotate(5deg);
      filter: blur(2px);
    }
    70% {
      transform: translateY(0) scale(1.05) rotate(0deg);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1) rotate(0deg);
      filter: blur(0);
    }
  }

  .animate-chessUnfold {
    animation: chessUnfold 1.8s ease-out forwards;
  }

  .delay-400 {
    animation-delay: 0.4s;
  }

  @keyframes chessReveal {
    0% {
      opacity: 0;
      transform: translateY(50px) scale(0.8);
      filter: blur(10px);
    }
    50% {
      opacity: 0.5;
      transform: translateY(20px) scale(1.1);
      filter: blur(5px);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0);
    }
  }

  .animate-chessReveal {
    animation: chessReveal 1.5s ease-out forwards;
  }

  @keyframes fadeInDrop {
    from {
      opacity: 0;
      transform: translateY(-20px);
      filter: blur(3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0);
    }
  }

  .animate-fadeInDrop {
    animation: fadeInDrop 1.5s ease-out;
  }

  .delay-200 {
    animation-delay: 0.2s;
  }

  .delay-300 {
    animation-delay: 0.3s;
  }
`;

export default HomePage;