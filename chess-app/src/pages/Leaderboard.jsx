import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "./1.png";

function Leaderboard() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10; // Số người chơi mỗi trang
  const userEmail = localStorage.getItem("userEmail");

  // Hàm lấy danh sách người chơi từ API
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://api.chessvn.io.vn/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Sắp xếp người chơi theo score giảm dần
      const sortedUsers = data.sort((a, b) => b.score - a.score);
      setUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Unable to load leaderboard. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

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

  // Lấy danh sách người chơi khi trang được tải
  useEffect(() => {
    fetchUsers();
  }, []);

  // Tính toán dữ liệu phân trang
  const totalPages = Math.ceil(users.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  // Xử lý chuyển trang
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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
          <li className="flex-1 text-center space-x-6">
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

      {/* Main Content */}
      <div className="flex flex-col items-center min-h-screen p-4">
        <h1 className="text-5xl font-bold text-[#FFD700] mb-6 drop-shadow-[0_0_10px_rgba(255,215,0,0.7)]">
          Leaderboard
        </h1>

        {isLoading ? (
          <div className="flex flex-col items-center">
            <div
              style={{
                width: "48px",
                height: "48px",
                border: "4px solid #C0C0C0",
                borderTop: "4px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <p className="text-[#D3D3D3] mt-4">Loading leaderboard...</p>
          </div>
        ) : error ? (
          <p className="text-[#D3D3D3]">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-[#D3D3D3]">No players to display.</p>
        ) : (
          <div className="w-full max-w-3xl">
            <div className="bg-gradient-to-br from-[#2E2E2E] to-[#1C2526] rounded-xl shadow-[0_0_15px_rgba(192,192,192,0.5)] border border-[#C0C0C0] p-4">
              <table className="w-full text-[#D3D3D3] text-left">
                <thead>
                  <tr className="border-b border-[#FFD700]">
                    <th className="py-3 px-4 text-[#FFD700] font-semibold">Rank</th>
                    <th className="py-3 px-4 text-[#FFD700] font-semibold">Email</th>
                    <th className="py-3 px-4 text-[#FFD700] font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-[#C0C0C0]/50 ${
                        user.email === userEmail && isLoggedIn
                          ? "bg-[#FFD700] bg-opacity-20"
                          : ""
                      } hover:bg-[#3C3C3C] transition-all duration-300`}
                    >
                      <td className="py-3 px-4">{startIndex + index + 1}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{user.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-[#1C2526] font-semibold transition-all duration-300 ${
                    currentPage === 1
                      ? "bg-[#C0C0C0] cursor-not-allowed"
                      : "bg-[#FFD700] hover:bg-[#E5C100] hover:shadow-[0_0_15px_rgba(255,215,0,0.7)]"
                  }`}
                >
                  Previous
                </button>
                <span className="text-[#D3D3D3]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg text-[#1C2526] font-semibold transition-all duration-300 ${
                    currentPage === totalPages
                      ? "bg-[#C0C0C0] cursor-not-allowed"
                      : "bg-[#FFD700] hover:bg-[#E5C100] hover:shadow-[0_0_15px_rgba(255,215,0,0.7)]"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <section className="w-screen h-auto bg-gradient-to-b from-[#2E2E2E] to-[#1C2526] text-white relative overflow-hidden flex flex-col transition-opacity duration-500 opacity-100 py-12">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] opacity-30"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-8 relative z-10">
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
        <div className="text-center text-sm md:text-base text-[#D3D3D3]/70 drop-shadow-[0_0_6px_rgba(192,192,192,0.5)] py-6">
          <p className="flex items-center justify-center gap-2">
            © 2025 Chess Website. All rights reserved.
            <span className="text-[#C0C0C0]">|</span>
            Forged in twilight with <span className="text-[#C0C0C0] animate-pulse">🌙</span> by Moonlit Masters
          </p>
        </div>
      </section>

      <style>
        {`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}

export default Leaderboard;