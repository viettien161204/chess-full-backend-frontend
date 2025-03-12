import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import logo from './1.png';
import chessBackground from './2.jpg';
import offlineBackground from './3.jpg';
import onlineBackground from './4.jpg';
import botBackground from './5.jpg';

const HomePage = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State cho dropdown menu
  const [showLoginModal, setShowLoginModal] = useState(false); // State cho modal đăng nhập

  const sectionsCount = 5;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isAnimating) return;

      if (event.key === 'ArrowLeft' && currentSection > 0) {
        goToPrevious();
      } else if (event.key === 'ArrowRight' && currentSection < sectionsCount - 1) {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSection, isAnimating]);

  useEffect(() => {
    if (currentSection === 4) {
      setFooterVisible(true);
    } else {
      setFooterVisible(false);
    }
  }, [currentSection]);

  const goToPrevious = () => {
    if (isAnimating || currentSection === 0) return;
    setIsAnimating(true);
    setCurrentSection((prev) => prev - 1);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const goToNext = () => {
    if (isAnimating || currentSection === sectionsCount - 1) return;
    setIsAnimating(true);
    setCurrentSection((prev) => prev + 1);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const goToSection = (index) => {
    if (isAnimating || index === currentSection) return;
    setIsAnimating(true);
    setCurrentSection(index);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const toggleExpand = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Xóa token khi đăng xuất
    setIsDropdownOpen(false); // Đóng dropdown sau khi đăng xuất
    window.location.reload(); // Tải lại trang để cập nhật giao diện
  };

  // Kiểm tra xem người dùng đã đăng nhập chưa (dựa vào token trong localStorage)
  const isLoggedIn = !!localStorage.getItem('token');

  // Hàm xử lý khi nhấp vào "Play Now" trong section "Play Online"
  const handlePlayOnline = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true); // Hiển thị modal nếu chưa đăng nhập
    } else {
      navigate('/chessonline'); // Điều hướng đến trang Play Online nếu đã đăng nhập
    }
  };

  const navColors = [
    'bg-orange-900/90 shadow-[0_0_15px_rgba(255,140,0,0.5)]',
    'bg-gray-900/90 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    'bg-gray-900/90 shadow-[0_0_15px_rgba(147,51,234,0.5)]',
    'bg-gray-900/90 shadow-[0_0_15px_rgba(244,63,94,0.5)]',
    'bg-blue-900/90 shadow-[0_0_15px_rgba(59,130,246,0.5)]',
  ];

  const textColors = [
    'text-orange-400 hover:text-orange-200 hover:drop-shadow-[0_0_8px_rgba(255,140,0,0.8)]',
    'text-emerald-400 hover:text-emerald-200 hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    'text-purple-400 hover:text-purple-200 hover:drop-shadow-[0_0_8px_rgba(147,51,234,0.8)]',
    'text-rose-400 hover:text-rose-200 hover:drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]',
    'text-blue-400 hover:text-blue-200 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]',
  ];

  const separatorColors = [
    'text-orange-600',
    'text-emerald-600',
    'text-purple-600',
    'text-rose-600',
    'text-blue-600',
  ];

  const sectionDetails = {
    offline: (
      <div className="text-emerald-200 p-6 flex-1 space-y-4 flex flex-col justify-start mt-16">
        <h3 className="text-2xl font-bold text-emerald-300 mb-4 drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]">Play Offline</h3>
        <p className="text-base leading-relaxed text-emerald-100">
          "Play Offline" mode allows two players to compete directly on the same computer. It’s a perfect choice when you want to test your skills against friends or family without needing an internet connection.
        </p>
        <ul className="list-disc list-inside text-emerald-200 text-base leading-relaxed">
          <li><span className="font-semibold text-emerald-300">How to Play:</span> Players take turns moving pieces on a virtual chessboard using a mouse or keyboard.</li>
          <li><span className="font-semibold text-emerald-300">Key Features:</span> No login required, simple interface, instant play anytime, anywhere.</li>
          <li><span className="font-semibold text-emerald-300">Benefits:</span> Enhances tactical thinking and fosters direct interaction between players.</li>
        </ul>
        <p className="text-base italic text-emerald-300 mt-2">
          Click "Play Now" to start a strategic showdown right away!
        </p>
      </div>
    ),
    online: (
      <div className="text-purple-200 p-6 flex-1 space-y-4 flex flex-col justify-start mt-16">
        <h3 className="text-2xl font-bold text-purple-300 mb-4 drop-shadow-[0_0_8px_rgba(147,51,234,0.7)]">Play Online</h3>
        <p className="text-base leading-relaxed text-purple-100">
          "Play Online" mode connects you to a global chess community. Challenge friends or random players from around the world over the internet.
        </p>
        <ul className="list-disc list-inside text-purple-200 text-base leading-relaxed">
          <li><span className="font-semibold text-purple-300">How to Play:</span> Log in, choose an opponent, or join an auto-matched game room.</li>
          <li><span className="font-semibold text-purple-300">Key Features:</span> Player rankings, live chat, match history saving.</li>
          <li><span className="font-semibold text-purple-300">Benefits:</span> Face diverse opponents, improve skills through matches, and connect with the chess community.</li>
        </ul>
        <p className="text-base italic text-purple-300 mt-2">
          Hit "Play Now" to dive into thrilling online battles!
        </p>
      </div>
    ),
    bot: (
      <div className="text-rose-200 p-6 flex-1 space-y-4 flex flex-col justify-start mt-16">
        <h3 className="text-2xl font-bold text-rose-300 mb-4 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]">Play With Bot</h3>
        <p className="text-base leading-relaxed text-rose-100">
          "Play With Bot" mode lets you test your skills against a powerful AI. It’s an excellent way to practice and enhance your chess abilities without a human opponent.
        </p>
        <ul className="list-disc list-inside text-rose-200 text-base leading-relaxed">
          <li><span className="font-semibold text-rose-300">How to Play:</span> Select the bot’s difficulty (easy, medium, hard) and start the game.</li>
          <li><span className="font-semibold text-rose-300">Key Features:</span> Smart AI adapts to your level, post-game move analysis available.</li>
          <li><span className="font-semibold text-rose-300">Benefits:</span> Learn new strategies, sharpen calculation skills, play anytime.</li>
        </ul>
        <p className="text-base italic text-rose-300 mt-2">
          Press "Play Now" to challenge the AI today!
        </p>
      </div>
    ),
  };

  const navigate = useNavigate(); // Thêm useNavigate để điều hướng

  return (
    <div className="relative overflow-x-hidden h-screen font-sans bg-black">
      <nav className={`${navColors[currentSection]} py-3 fixed top-0 left-4 right-4 z-20 rounded-b-xl max-w-7xl mx-auto mt-2 backdrop-blur-md transition-colors duration-500 ease-in-out`}>
        <ul className="flex justify-between items-center list-none px-4 md:px-6">
          <li>
            <Link to="/">
              <img src={logo} alt="Chess Logo" className="h-12 md:h-16 w-auto transition-transform duration-300 hover:scale-110" style={{ filter: `drop-shadow(0 0 10px ${textColors[currentSection].split('hover:drop-shadow-')[1].slice(11, -1)})` }} />
            </Link>
          </li>
          <li className="flex-1 text-center">
            <Link to="/" className={`${textColors[currentSection]} font-semibold text-base md:text-lg transition-all duration-300`}>
              Home
            </Link>
          </li>
          <li className="text-right">
            {isLoggedIn ? (
              <div className="relative">
                {/* Avatar (ảnh đại diện mặc định) */}
                <img
                  src="https://store.playstation.com/store/api/chihiro/00_09_000/container/IE/en/99/EP4037-SLES51630_00-AVPLAYITCH000002/0/image?_version=00_09_000&platform=chihiro&bg_color=000000&opacity=100&w=720&h=720" // Ảnh đại diện mặc định (một hình tròn với biểu tượng người dùng)
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full cursor-pointer transition-all duration-300 hover:scale-110"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                />
                {/* Dropdown menu khi nhấp vào avatar */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800/90 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] backdrop-blur-md border border-blue-800/50 transition-all duration-300">
                    <ul className="py-2 text-sm text-blue-300">
                      <li>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 hover:bg-blue-900/50 hover:text-blue-200 transition-all duration-300"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          View Profile
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 hover:bg-blue-900/50 hover:text-blue-200 transition-all duration-300"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/register" className={`${textColors[currentSection]} font-semibold text-base md:text-lg transition-all duration-300`}>
                  Register
                </Link>
                <span className={`${separatorColors[currentSection]}`}>|</span>
                <Link to="/login" className={`${textColors[currentSection]} font-semibold text-base md:text-lg transition-all duration-300`}>
                  Login
                </Link>
              </>
            )}
          </li>
        </ul>
      </nav>

      <div
        className="flex w-[500vw] h-full transition-transform duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ transform: `translateX(-${currentSection * 100}vw)` }}
      >
        {/* Section 1: Welcome */}
        <section
          className={`w-screen h-screen flex justify-center items-start flex-col text-center bg-cover bg-center text-white relative transition-opacity duration-500 ${isAnimating ? 'opacity-70' : 'opacity-100'}`}
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

        {/* Section 2: Play Offline */}
        <section
          className={`w-screen h-screen flex justify-center items-center text-center bg-cover bg-center relative transition-opacity duration-500 ${isAnimating ? 'opacity-70' : 'opacity-100'}`}
          style={{ backgroundImage: `url(${offlineBackground})`, backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-emerald-900/40 to-transparent"></div>
          <div className="relative z-10 w-full h-full flex justify-center items-center">
            <div
              className={`bg-gray-900/80 border border-emerald-500/50 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.6)] backdrop-blur-lg transition-all duration-500 ease-in-out ${expandedSection === 'offline' ? 'w-10/12 max-w-4xl h-3/4 flex flex-row' : 'w-5/6 max-w-sm'}`}
            >
              <div
                className={`p-6 text-emerald-200 flex-1 transition-all duration-300 text-center ${expandedSection === 'offline' ? 'w-4/12 flex items-center' : 'w-full'}`}
              >
                <div className="w-full">
                  <h2 className="mb-4 text-3xl md:text-4xl font-bold text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.7)]">
                    Play Offline
                  </h2>
                  <p className="mb-6 text-base md:text-lg text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
                    Two people play on one computer.
                  </p>
                  <div className="flex flex-col items-center gap-4">
                    <Link
                      to="/chess"
                      className="inline-block bg-gradient-to-r from-emerald-700 to-teal-600 text-white py-2 md:py-3 px-6 md:px-8 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)] transition-all duration-300 hover:from-emerald-800 hover:to-teal-700 hover:scale-110 hover:shadow-[0_0_25px_rgba(16,185,129,0.9)]"
                    >
                      Play Now
                    </Link>
                    <button
                      onClick={() => toggleExpand('offline')}
                      className="text-emerald-300 hover:text-emerald-200 underline transition-colors duration-300"
                    >
                      {expandedSection === 'offline' ? 'Close' : 'Learn More'}
                    </button>
                  </div>
                </div>
              </div>
              {expandedSection === 'offline' && (
                <div className="w-8/12 p-6 text-emerald-200 border-l border-emerald-500/50">
                  {sectionDetails.offline}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 3: Play Online */}
        <section
          className={`w-screen h-screen flex justify-center items-center text-center bg-cover bg-center relative transition-opacity duration-500 ${isAnimating ? 'opacity-70' : 'opacity-100'}`}
          style={{ backgroundImage: `url(${onlineBackground})`, backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-purple-900/40 to-transparent"></div>
          <div className="relative z-10 w-full h-full flex justify-center items-center">
            <div
              className={`bg-gray-900/80 border border-purple-500/50 rounded-2xl shadow-[0_0_20px_rgba(147,51,234,0.6)] backdrop-blur-lg transition-all duration-500 ease-in-out ${expandedSection === 'online' ? 'w-10/12 max-w-4xl h-3/4 flex flex-row' : 'w-5/6 max-w-sm'}`}
            >
              <div
                className={`p-6 text-purple-200 flex-1 transition-all duration-300 text-center ${expandedSection === 'online' ? 'w-4/12 flex items-center' : 'w-full'}`}
              >
                <div className="w-full">
                  <h2 className="mb-4 text-3xl md:text-4xl font-bold text-purple-300 drop-shadow-[0_0_10px_rgba(147,51,234,0.7)]">
                    Play Online
                  </h2>
                  <p className="mb-6 text-base md:text-lg text-purple-400 drop-shadow-[0_0_5px_rgba(147,51,234,0.5)]">
                    Challenge friends or players worldwide.
                  </p>
                  <div className="flex flex-col items-center gap-4">
                    <button
                      onClick={handlePlayOnline}
                      className="inline-block bg-gradient-to-r from-purple-700 to-indigo-600 text-white py-2 md:py-3 px-6 md:px-8 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.6)] transition-all duration-300 hover:from-purple-800 hover:to-indigo-700 hover:scale-110 hover:shadow-[0_0_25px_rgba(147,51,234,0.9)]"
                    >
                      Play Now
                    </button>
                    <button
                      onClick={() => toggleExpand('online')}
                      className="text-purple-300 hover:text-purple-200 underline transition-colors duration-300"
                    >
                      {expandedSection === 'online' ? 'Close' : 'Learn More'}
                    </button>
                  </div>
                </div>
              </div>
              {expandedSection === 'online' && (
                <div className="w-8/12 p-6 text-purple-200 border-l border-purple-500/50">
                  {sectionDetails.online}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 4: Play With Bot */}
        <section
          className={`w-screen h-screen flex justify-center items-center text-center bg-cover bg-center relative transition-opacity duration-500 ${isAnimating ? 'opacity-70' : 'opacity-100'}`}
          style={{ backgroundImage: `url(${botBackground})`, backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-rose-900/40 to-transparent"></div>
          <div className="relative z-10 w-full h-full flex justify-center items-center">
            <div
              className={`bg-gray-900/80 border border-rose-500/50 rounded-2xl shadow-[0_0_20px_rgba(244,63,94,0.6)] backdrop-blur-lg transition-all duration-500 ease-in-out ${expandedSection === 'bot' ? 'w-10/12 max-w-4xl h-3/4 flex flex-row' : 'w-5/6 max-w-sm'}`}
            >
              <div
                className={`p-6 text-rose-200 flex-1 transition-all duration-300 text-center ${expandedSection === 'bot' ? 'w-4/12 flex items-center' : 'w-full'}`}
              >
                <div className="w-full">
                  <h2 className="mb-4 text-3xl md:text-4xl font-bold text-rose-300 drop-shadow-[0_0_10px_rgba(244,63,94,0.7)]">
                    Play With Bot
                  </h2>
                  <p className="mb-6 text-base md:text-lg text-rose-400 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]">
                    Challenge AI to improve your skills.
                  </p>
                  <div className="flex flex-col items-center gap-4">
                    <Link
                      to="/chessbot"
                      className="inline-block bg-gradient-to-r from-rose-700 to-red-600 text-white py-2 md:py-3 px-6 md:px-8 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.6)] transition-all duration-300 hover:from-rose-800 hover:to-red-700 hover:scale-110 hover:shadow-[0_0_25px_rgba(244,63,94,0.9)]"
                    >
                      Play Now
                    </Link>
                    <button
                      onClick={() => toggleExpand('bot')}
                      className="text-rose-300 hover:text-rose-200 underline transition-colors duration-300"
                    >
                      {expandedSection === 'bot' ? 'Close' : 'Learn More'}
                    </button>
                  </div>
                </div>
              </div>
              {expandedSection === 'bot' && (
                <div className="w-8/12 p-6 text-rose-200 border-l border-rose-500/50">
                  {sectionDetails.bot}
                </div>
              )}
            </div>
          </div>
        </section>
        

        {/* Section 5: Footer */}
        <section
          className={`w-screen h-screen bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden flex flex-col justify-center transition-opacity duration-500 ${isAnimating ? 'opacity-70' : 'opacity-100'}`}
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] opacity-30"></div>
          <div className={`max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-8 relative z-10 ${footerVisible ? 'animate-footerReveal' : 'opacity-0'}`}>
            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-black/80 border border-blue-800/50 shadow-[0_0_20px_rgba(59,130,246,0.5)] backdrop-blur-md transition-all duration-500 hover:scale-105 hover:shadow-[0_0_35px_rgba(59,130,246,0.8)]">
              <h3 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200 mb-4 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                Chess Realm
              </h3>
              <p className="text-sm md:text-base text-blue-300/80 leading-relaxed drop-shadow-[0_0_6px_rgba(59,130,246,0.4)]">
                Conquer the board in a shadowy chess dominion.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-black/80 border border-blue-800/50 shadow-[0_0_20px_rgba(59,130,246,0.5)] backdrop-blur-md transition-all duration-500 hover:scale-105 hover:shadow-[0_0_35px_rgba(59,130,246,0.8)]">
              <h3 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200 mb-4 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                Quick Links
              </h3>
              <ul className="text-sm md:text-base space-y-4">
                <li>
                  <Link to="/puzzlemode" className="flex items-center text-blue-300/80 hover:text-blue-200 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">
                    <span className="mr-3">🏠</span> Home
                  </Link>
                </li>
                <li>
                  <Link to="/chess" className="flex items-center text-blue-300/80 hover:text-blue-200 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">
                    <span className="mr-3">♟️</span> Play Now
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="flex items-center text-blue-300/80 hover:text-blue-200 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">
                    <span className="mr-3">📝</span> Register
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="flex items-center text-blue-300/80 hover:text-blue-200 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">
                    <span className="mr-3">🔑</span> Login
                  </Link>
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-black/80 border border-blue-800/50 shadow-[0_0_20px_rgba(59,130,246,0.5)] backdrop-blur-md transition-all duration-500 hover:scale-105 hover:shadow-[0_0_35px_rgba(59,130,246,0.8)]">
              <h3 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200 mb-4 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                Contact
              </h3>
              <p className="text-sm md:text-base mb-3 text-blue-300/80 flex items-center drop-shadow-[0_0_6px_rgba(59,130,246,0.4)]">
                <span className="mr-3">📧</span>
                <a href="mailto:support@chesswebsite.com" className="hover:text-blue-200 transition-all duration-300">support@chesswebsite.com</a>
              </p>
              <p className="text-sm md:text-base mb-6 text-blue-300/80 flex items-center drop-shadow-[0_0_6px_rgba(59,130,246,0.4)]">
                <span className="mr-3">📞</span>
                <a href="tel:0123456789" className="hover:text-blue-200 transition-all duration-300">0123 456 789</a>
              </p>
              <div className="flex space-x-6 md:space-x-8">
                <a href="#" className="text-blue-300/80 hover:text-blue-200 transform hover:scale-125 transition-all duration-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                  <i className="fab fa-facebook-f text-2xl md:text-3xl"></i>
                </a>
                <a href="#" className="text-blue-300/80 hover:text-blue-200 transform hover:scale-125 transition-all duration-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                  <i className="fab fa-twitter text-2xl md:text-3xl"></i>
                </a>
                <a href="#" className="text-blue-300/80 hover:text-blue-200 transform hover:scale-125 transition-all duration-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                  <i className="fab fa-instagram text-2xl md:text-3xl"></i>
                </a>
              </div>
            </div>
          </div>
          <div className={`text-center text-sm md:text-base text-blue-300/70 drop-shadow-[0_0_6px_rgba(59,130,246,0.5)] py-6 ${footerVisible ? 'animate-footerReveal' : 'opacity-0'}`}>
            <p className="flex items-center justify-center gap-2">
              © 2025 Chess Website. All rights reserved.
              <span className="text-blue-400">|</span>
              Forged in twilight with <span className="text-blue-500 animate-pulse">🌙</span> by Moonlit Masters
            </p>
          </div>
        </section>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className={`fixed left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-20 w-10 md:w-12 h-10 md:h-12 rounded-full bg-gray-900/80 shadow-[0_0_10px_rgba(16,185,129,0.5)] flex items-center justify-center transition-all duration-300 ${currentSection === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-900/90 hover:scale-110 hover:shadow-[0_0_15px_rgba(16,185,129,0.7)]'}`}
      >
        <svg className="w-5 md:w-6 h-5 md:h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className={`fixed right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-20 w-10 md:w-12 h-10 md:h-12 rounded-full bg-gray-900/80 shadow-[0_0_10px_rgba(16,185,129,0.5)] flex items-center justify-center transition-all duration-300 ${currentSection === sectionsCount - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-900/90 hover:scale-110 hover:shadow-[0_0_15px_rgba(16,185,129,0.7)]'}`}
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
            className={`w-2 md:w-3 h-2 md:h-3 rounded-full transition-all duration-300 ${currentSection === index ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]' : 'bg-emerald-800/50 hover:bg-emerald-600 hover:shadow-[0_0_5px_rgba(16,185,129,0.5)]'}`}
          />
        ))}
      </div>

      {/* Modal đăng nhập cho Play Online */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900/80 border border-purple-500/50 rounded-2xl shadow-[0_0_20px_rgba(147,51,234,0.6)] p-6 max-w-md w-full backdrop-blur-lg">
            <div className="flex justify-end">
              <button
                onClick={() => setShowLoginModal(false)} // Đóng modal khi nhấp vào nút Close
                className="text-purple-200 hover:text-purple-100 transition-colors duration-300"
              >
                &times; {/* Biểu tượng đóng (X) */}
              </button>
            </div>
            <h2 className="text-2xl font-bold text-purple-300 mb-4 drop-shadow-[0_0_8px_rgba(147,51,234,0.5)]">Yêu Cầu Đăng Nhập</h2>
            <p className="text-purple-200 mb-6">Bạn cần đăng nhập để chơi chế độ này.</p>
            <button
              onClick={() => {
                navigate('/login'); // Điều hướng đến trang login
                setShowLoginModal(false); // Đóng modal
              }}
              className="bg-purple-600 text-white py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(147,51,234,0.7)] hover:bg-purple-700 hover:scale-105 hover:shadow-[0_0_25px_rgba(147,51,234,0.9)] transition-all duration-300"
            >
              Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS cho animation
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

  @keyframes footerReveal {
    0% {
      opacity: 0;
      transform: translateY(50px);
      filter: blur(5px);
    }
    50% {
      opacity: 0.6;
      transform: translateY(-10px);
      filter: blur(2px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0);
    }
  }

  .animate-footerReveal {
    animation: footerReveal 1.2s ease-out forwards;
  }
`;

export default HomePage;