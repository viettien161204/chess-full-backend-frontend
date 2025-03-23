import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "./1.png"; // Logo của bạn
import offlineBackground from './3.jpg'; // Hình nền cho Play Offline
import onlineBackground from './4.jpg'; // Hình nền cho Play Online
import botBackground from './5.jpg'; // Hình nền cho Play with Bot

function GameModes() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [footerVisible, setFooterVisible] = useState(true); // Để hiển thị footer ngay từ đầu

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setDropdownOpen(false);
    navigate("/login");
  };

  // Xử lý xem hồ sơ
  const handleViewProfile = () => {
    navigate("/profile");
    setDropdownOpen(false);
  };

  // Xử lý khi nhấp vào nút "Play"
  const handlePlayClick = (path) => {
    // Chỉ yêu cầu đăng nhập cho chế độ Play Online
    if (path === "/chessonline" && !isLoggedIn) {
      setShowLoginModal(true);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="relative min-h-screen font-sans bg-gradient-to-br from-[#1C2526] to-[#000000]">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-[#2E2E2E] to-[#1C2526] shadow-[0_0_15px_rgba(192,192,192,0.5)] py-3 z-50 rounded-b-xl max-w-7xl mx-auto mt-2 backdrop-blur-md transition-colors duration-500 ease-in-out">
        <ul className="flex justify-between items-center list-none px-4 md:px-6">
          <li>
            <Link to="/">
              <img
                src={logo}
                alt="Chess Logo"
                className="h-12 md:h-16 w-auto transition-transform duration-300 hover:scale-110"
                style={{ filter: `drop-shadow(0_0_10px_rgba(192,192,192,0.8))` }}
              />
            </Link>
          </li>
          <li className="flex-1 text-center">
            <Link
              to="/"
              className="text-[#C0C0C0] hover:text-[#E5E4E2] hover:drop-shadow-[0_0_8px_rgba(192,192,192,0.8)] font-semibold text-base md:text-lg transition-all duration-300"
            >
              Home
            </Link>
          </li>
          <li className="text-right">
            {isLoggedIn ? (
              <div className="relative">
                <img
                  src="https://store.playstation.com/store/api/chihiro/00_09_000/container/IE/en/99/EP4037-SLES51630_00-AVPLAYITCH000002/0/image?_version=00_09_000&platform=chihiro&bg_color=000000&opacity=100&w=720&h=720"
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 border-2 border-[#C0C0C0]"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                />
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#2E2E2E] rounded-md shadow-lg py-1 z-50 border border-[#C0C0C0]">
                    <button
                      onClick={handleViewProfile}
                      className="block w-full text-left px-4 py-2 text-[#C0C0C0] hover:bg-[#3C3C3C] hover:text-[#E5E4E2] transition-all duration-300"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-[#C0C0C0] hover:bg-[#3C3C3C] hover:text-[#E5E4E2] transition-all duration-300"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-4">
                <Link
                  to="/register"
                  className="text-[#C0C0C0] hover:text-[#E5E4E2] hover:drop-shadow-[0_0_8px_rgba(192,192,192,0.8)] font-semibold text-base md:text-lg transition-all duration-300"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="text-[#C0C0C0] hover:text-[#E5E4E2] hover:drop-shadow-[0_0_8px_rgba(192,192,192,0.8)] font-semibold text-base md:text-lg transition-all duration-300"
                >
                  Login
                </Link>
              </div>
            )}
          </li>
        </ul>
      </nav>

      {/* Nội dung chính */}
      <div className="flex flex-col items-center min-h-screen p-8 pb-20">
        <h1 className="text-5xl font-bold text-[#E5E4E2] mb-12 drop-shadow-[0_0_10px_rgba(192,192,192,0.7)]">
          Choose a Game Mode
        </h1>

        {/* Danh sách chế độ chơi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl w-full">
          {/* Puzzle Mode */}
          <div
            className="relative bg-gradient-to-br from-[#2E2E2E] to-[#1C2526] rounded-xl shadow-[0_0_15px_rgba(192,192,192,0.5)] border border-[#C0C0C0] p-12 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.8)] min-h-[400px] flex flex-col justify-between"
            style={{
              backgroundImage: `url('https://platform.polygon.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/22292574/Little_Nightmares_2_chapter_2_chess_piece_puzzle_6.jpg?quality=90&strip=all&crop=0,0,100,100')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundBlendMode: "overlay",
              backgroundColor: "rgba(44, 44, 44, 0.8)",
            }}
          >
            <div>
              <h2 className="text-3xl font-semibold text-[#E5E4E2] mb-4 drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]">
                Puzzle Mode
              </h2>
              <p className="text-[#D3D3D3] mb-3 text-base">
                Challenge your mind with chess puzzles from easy to hard.
              </p>
              <p className="text-[#D3D3D3] text-sm">
                Test your chess skills by solving puzzles of varying difficulty. Solve correctly to earn points and improve your tactical abilities. Perfect for players of all levels looking to sharpen their game!
              </p>
            </div>
            <button
              onClick={() => handlePlayClick("/puzzlemode")}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9] text-[#1C2526] rounded-lg shadow-[0_0_15px_rgba(192,192,192,0.7)] hover:from-[#D3D3D3] hover:to-[#C0C0C0] hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.9)] transition-all duration-300 font-semibold text-lg"
            >
              Play
            </button>
          </div>

          {/* Daily Challenge */}
          <div
            className="relative bg-gradient-to-br from-[#2E2E2E] to-[#1C2526] rounded-xl shadow-[0_0_15px_rgba(192,192,192,0.5)] border border-[#C0C0C0] p-12 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.8)] min-h-[400px] flex flex-col justify-between"
            style={{
              backgroundImage: `url('https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/SamCopeland/phpbi1UiI.jpeg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundBlendMode: "overlay",
              backgroundColor: "rgba(44, 44, 44, 0.8)",
            }}
          >
            <div>
              <h2 className="text-3xl font-semibold text-[#E5E4E2] mb-4 drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]">
                Daily Challenge
              </h2>
              <p className="text-[#D3D3D3] mb-3 text-base">
                A new puzzle every day! Solve it quickly to earn bonus points.
              </p>
              <p className="text-[#D3D3D3] text-sm">
                Take on a unique chess puzzle every day. Solve it within the time limit to earn extra points and compete with friends on the leaderboard. Don’t miss your daily dose of chess fun!
              </p>
            </div>
            <button
              onClick={() => handlePlayClick("/dailymode")}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9] text-[#1C2526] rounded-lg shadow-[0_0_15px_rgba(192,192,192,0.7)] hover:from-[#D3D3D3] hover:to-[#C0C0C0] hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.9)] transition-all duration-300 font-semibold text-lg"
            >
              Play
            </button>
          </div>

          {/* Blitz Puzzle Mode */}
          <div
            className="relative bg-gradient-to-br from-[#2E2E2E] to-[#1C2526] rounded-xl shadow-[0_0_15px_rgba(192,192,192,0.5)] border border-[#C0C0C0] p-12 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.8)] min-h-[400px] flex flex-col justify-between"
            style={{
              backgroundImage: `url('https://chesswizards.com/images/content/5b90dbbda1.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundBlendMode: "overlay",
              backgroundColor: "rgba(44, 44, 44, 0.8)",
            }}
          >
            <div>
              <h2 className="text-3xl font-semibold text-[#E5E4E2] mb-4 drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]">
                Blitz Puzzle Mode
              </h2>
              <p className="text-[#D3D3D3] mb-3 text-base">
                Solve as many puzzles as you can in a limited time!
              </p>
              <p className="text-[#D3D3D3] text-sm">
                Race against the clock to solve as many chess puzzles as possible in 5 minutes. Test your speed and accuracy under pressure. Can you climb to the top of the leaderboard?
              </p>
            </div>
            <button
              onClick={() => handlePlayClick("/leaderboard")}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9] text-[#1C2526] rounded-lg shadow-[0_0_15px_rgba(192,192,192,0.7)] hover:from-[#D3D3D3] hover:to-[#C0C0C0] hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.9)] transition-all duration-300 font-semibold text-lg"
            >
              Play
            </button>
          </div>

          {/* Endgame Practice Mode */}
          <div
            className="relative bg-gradient-to-br from-[#2E2E2E] to-[#1C2526] rounded-xl shadow-[0_0_15px_rgba(192,192,192,0.5)] border border-[#C0C0C0] p-12 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.8)] min-h-[400px] flex flex-col justify-between"
            style={{
              backgroundImage: `url('https://media.istockphoto.com/id/1589828270/photo/victory-white-king-lies-defeated-at-foot-of-winning-black-queen.jpg?s=612x612&w=0&k=20&c=Sr3wj_gNuHT5gu9XGFittKxhs6j32jTGjCdIKwmfjQM=')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundBlendMode: "overlay",
              backgroundColor: "rgba(44, 44, 44, 0.8)",
            }}
          >
            <div>
              <h2 className="text-3xl font-semibold text-[#E5E4E2] mb-4 drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]">
                Endgame Practice Mode
              </h2>
              <p className="text-[#D3D3D3] mb-3 text-base">
                Master classic endgame scenarios and improve your skills.
              </p>
              <p className="text-[#D3D3D3] text-sm">
                Practice essential endgame techniques with classic scenarios like King and Queen vs. King or King and Two Bishops vs. King. Learn to checkmate or secure a draw in challenging positions.
              </p>
            </div>
            <button
              onClick={() => handlePlayClick("/inDev")}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9] text-[#1C2526] rounded-lg shadow-[0_0_15px_rgba(192,192,192,0.7)] hover:from-[#D3D3D3] hover:to-[#C0C0C0] hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.9)] transition-all duration-300 font-semibold text-lg"
            >
              Play
            </button>
          </div>

          {/* Play Offline */}
          <div
            className="relative bg-gradient-to-br from-[#2E2E2E] to-[#1C2526] rounded-xl shadow-[0_0_15px_rgba(192,192,192,0.5)] border border-[#C0C0C0] p-12 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.8)] min-h-[400px] flex flex-col justify-between"
            style={{
              backgroundImage: `url(${offlineBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundBlendMode: "overlay",
              backgroundColor: "rgba(44, 44, 44, 0.8)",
            }}
          >
            <div>
              <h2 className="text-3xl font-semibold text-[#E5E4E2] mb-4 drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]">
                Play Offline
              </h2>
              <p className="text-[#D3D3D3] mb-3 text-base">
                Enjoy a classic chess match without an internet connection.
              </p>
              <p className="text-[#D3D3D3] text-sm">
                Play chess anytime, anywhere, even without internet access. Challenge yourself or a friend on the same device in a traditional chess match. Perfect for offline practice or casual play!
              </p>
            </div>
            <button
              onClick={() => handlePlayClick("/chess")}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9] text-[#1C2526] rounded-lg shadow-[0_0_15px_rgba(192,192,192,0.7)] hover:from-[#D3D3D3] hover:to-[#C0C0C0] hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.9)] transition-all duration-300 font-semibold text-lg"
            >
              Play
            </button>
          </div>

          {/* Play Online */}
          <div
            className="relative bg-gradient-to-br from-[#2E2E2E] to-[#1C2526] rounded-xl shadow-[0_0_15px_rgba(192,192,192,0.5)] border border-[#C0C0C0] p-12 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.8)] min-h-[400px] flex flex-col justify-between"
            style={{
              backgroundImage: `url(${onlineBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundBlendMode: "overlay",
              backgroundColor: "rgba(44, 44, 44, 0.8)",
            }}
          >
            <div>
              <h2 className="text-3xl font-semibold text-[#E5E4E2] mb-4 drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]">
                Play Online
              </h2>
              <p className="text-[#D3D3D3] mb-3 text-base">
                Compete with players from around the world in real-time.
              </p>
              <p className="text-[#D3D3D3] text-sm">
                Join the global chess community and play against opponents online. Match with players of your skill level, chat during the game, and climb the leaderboard. Test your strategies in real-time battles!
              </p>
            </div>
            <button
              onClick={() => handlePlayClick("/chessonline")}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9] text-[#1C2526] rounded-lg shadow-[0_0_15px_rgba(192,192,192,0.7)] hover:from-[#D3D3D3] hover:to-[#C0C0C0] hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.9)] transition-all duration-300 font-semibold text-lg"
            >
              Play
            </button>
          </div>

          {/* Play with Bot */}
          <div
            className="relative bg-gradient-to-br from-[#2E2E2E] to-[#1C2526] rounded-xl shadow-[0_0_15px_rgba(192,192,192,0.5)] border border-[#C0C0C0] p-12 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.8)] min-h-[400px] flex flex-col justify-between"
            style={{
              backgroundImage: `url(${botBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundBlendMode: "overlay",
              backgroundColor: "rgba(44, 44, 44, 0.8)",
            }}
          >
            <div>
              <h2 className="text-3xl font-semibold text-[#E5E4E2] mb-4 drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]">
                Play with Bot
              </h2>
              <p className="text-[#D3D3D3] mb-3 text-base">
                Test your skills against an AI opponent.
              </p>
              <p className="text-[#D3D3D3] text-sm">
                Challenge a chess bot with adjustable difficulty levels, from beginner to grandmaster. Perfect for practicing strategies, learning new openings, or simply enjoying a quick game against a smart opponent!
              </p>
            </div>
            <button
              onClick={() => handlePlayClick("/chessbot")}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9] text-[#1C2526] rounded-lg shadow-[0_0_15px_rgba(192,192,192,0.7)] hover:from-[#D3D3D3] hover:to-[#C0C0C0] hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.9)] transition-all duration-300 font-semibold text-lg"
            >
              Play
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <section
        className={`w-screen h-auto bg-gradient-to-b from-[#2E2E2E] to-[#1C2526] text-white relative overflow-hidden flex flex-col transition-opacity duration-500 opacity-100 py-12`}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] opacity-30"></div>
        <div className={`max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-8 relative z-10 animate-footerReveal`}>
          <div className="p-6 rounded-xl bg-gradient-to-br from-[#2E2E2E]/80 to-[#1C2526]/80 border border-[#C0C0C0]/50 shadow-[0_0_20px_rgba(192,192,192,0.5)] backdrop-blur-md transition-all duration-500 hover:scale-105 hover:shadow-[0_0_35px_rgba(192,192,192,0.8)]">
            <h3 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#C0C0C0] to-[#E5E4E2] mb-4 drop-shadow-[0_0_10px_rgba(192,192,192,0.8)]">
              Chess Realm
            </h3>
            <p className="text-sm md:text-base text-[#D3D3D3]/80 leading-relaxed drop-shadow-[0_0_6px_rgba(192,192,192,0.4)]">
              Conquer the board in a shadowy chess dominion.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-[#2E2E2E]/80 to-[#1C2526]/80 border border-[#C0C0C0]/50 shadow-[0_0_20px_rgba(192,192,192,0.5)] backdrop-blur-md transition-all duration-500 hover:scale-105 hover:shadow-[0_0_35px_rgba(192,192,192,0.8)]">
            <h3 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#C0C0C0] to-[#E5E4E2] mb-4 drop-shadow-[0_0_10px_rgba(192,192,192,0.8)]">
              Quick Links
            </h3>
            <ul className="text-sm md:text-base space-y-4">
              <li>
                <Link to="/" className="flex items-center text-[#D3D3D3]/80 hover:text-[#E5E4E2] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(192,192,192,0.6)]">
                  <span className="mr-3">🏠</span> Home
                </Link>
              </li>
              <li>
                <Link to="/chess" className="flex items-center text-[#D3D3D3]/80 hover:text-[#E5E4E2] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(192,192,192,0.6)]">
                  <span className="mr-3">♟️</span> Play Now
                </Link>
              </li>
              <li>
                <Link to="/register" className="flex items-center text-[#D3D3D3]/80 hover:text-[#E5E4E2] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(192,192,192,0.6)]">
                  <span className="mr-3">📝</span> Register
                </Link>
              </li>
              <li>
                <Link to="/login" className="flex items-center text-[#D3D3D3]/80 hover:text-[#E5E4E2] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(192,192,192,0.6)]">
                  <span className="mr-3">🔑</span> Login
                </Link>
              </li>
            </ul>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-[#2E2E2E]/80 to-[#1C2526]/80 border border-[#C0C0C0]/50 shadow-[0_0_20px_rgba(192,192,192,0.5)] backdrop-blur-md transition-all duration-500 hover:scale-105 hover:shadow-[0_0_35px_rgba(192,192,192,0.8)]">
            <h3 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#C0C0C0] to-[#E5E4E2] mb-4 drop-shadow-[0_0_10px_rgba(192,192,192,0.8)]">
              Contact
            </h3>
            <p className="text-sm md:text-base mb-3 text-[#D3D3D3]/80 flex items-center drop-shadow-[0_0_6px_rgba(192,192,192,0.4)]">
              <span className="mr-3">📧</span>
              <a href="mailto:support@chesswebsite.com" className="hover:text-[#E5E4E2] transition-all duration-300">
                support@chesswebsite.com
              </a>
            </p>
            <p className="text-sm md:text-base mb-6 text-[#D3D3D3]/80 flex items-center drop-shadow-[0_0_6px_rgba(192,192,192,0.4)]">
              <span className="mr-3">📞</span>
              <a href="tel:0356566213" className="hover:text-[#E5E4E2] transition-all duration-300">
                0356566213
              </a>
            </p>
            <div className="flex space-x-6 md:space-x-8">
              <a href="#" className="text-[#D3D3D3]/80 hover:text-[#E5E4E2] transform hover:scale-125 transition-all duration-300 drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]">
                <i className="fab fa-facebook-f text-2xl md:text-3xl"></i>
              </a>
              <a href="#" className="text-[#D3D3D3]/80 hover:text-[#E5E4E2] transform hover:scale-125 transition-all duration-300 drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]">
                <i className="fab fa-twitter text-2xl md:text-3xl"></i>
              </a>
              <a href="#" className="text-[#D3D3D3]/80 hover:text-[#E5E4E2] transform hover:scale-125 transition-all duration-300 drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]">
                <i className="fab fa-instagram text-2xl md:text-3xl"></i>
              </a>
            </div>
          </div>
        </div>
        <div className={`text-center text-sm md:text-base text-[#D3D3D3]/70 drop-shadow-[0_0_6px_rgba(192,192,192,0.5)] py-6 animate-footerReveal`}>
          <p className="flex items-center justify-center gap-2">
            © 2025 Chess Website. All rights reserved.
            <span className="text-[#C0C0C0]">|</span>
            Forged in twilight with <span className="text-[#C0C0C0] animate-pulse">🌙</span> by Moonlit Masters
          </p>
        </div>
      </section>

      {/* Modal yêu cầu đăng nhập */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gradient-to-br from-[#2E2E2E] to-[#1C2526] border border-[#C0C0C0] rounded-2xl shadow-[0_0_20px_rgba(192,192,192,0.6)] p-6 max-w-md w-full backdrop-blur-lg">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-[#C0C0C0] hover:text-[#E5E4E2] transition-colors duration-300"
              >
                ×
              </button>
            </div>
            <h2 className="text-2xl font-bold text-[#E5E4E2] mb-4 drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]">
              Login Required
            </h2>
            <p className="text-[#D3D3D3] mb-6">
              You need to log in to play this mode. Please log in or register an account.
            </p>
            <div className="flex gap-4">
              <Link to="/login">
                <button
                  className="bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9] text-[#1C2526] py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(192,192,192,0.7)] hover:from-[#D3D3D3] hover:to-[#C0C0C0] hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.9)] transition-all duration-300"
                  onClick={() => setShowLoginModal(false)}
                >
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button
                  className="bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9] text-[#1C2526] py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(192,192,192,0.7)] hover:from-[#D3D3D3] hover:to-[#C0C0C0] hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.9)] transition-all duration-300"
                  onClick={() => setShowLoginModal(false)}
                >
                  Register
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameModes;