import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaUserCircle, FaChessKnight } from "react-icons/fa";

const Header = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();

  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    setDropdownOpen(false);
    setShowLogoutConfirm(false);
    navigate("/login");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const textColor =
    location.pathname === "/rank"
      ? "text-amber-300 hover:text-amber-100 hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]"
      : location.pathname === "/rooms"
      ? "text-pink-300 hover:text-pink-100 hover:drop-shadow-[0_0_10px_rgba(244,63,94,0.9)]"
      : location.pathname === "/server-performance"
      ? "text-green-300 hover:text-green-100 hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.9)]"
      : "text-blue-300 hover:text-blue-100 hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.9)]";

  const buttonGradient =
    location.pathname === "/rank"
      ? "from-amber-600 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.7)] hover:from-amber-500 hover:to-amber-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.9)]"
      : location.pathname === "/rooms"
      ? "from-pink-600 to-red-400 shadow-[0_0_12px_rgba(244,63,94,0.7)] hover:from-pink-500 hover:to-red-300 hover:shadow-[0_0_20px_rgba(244,63,94,0.9)]"
      : location.pathname === "/server-performance"
      ? "from-green-600 to-green-400 shadow-[0_0_12px_rgba(34,197,94,0.7)] hover:from-green-500 hover:to-green-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.9)]"
      : "from-blue-600 to-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.7)] hover:from-blue-500 hover:to-blue-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.9)]";

  const iconColor =
    location.pathname === "/rank"
      ? "text-amber-300"
      : location.pathname === "/rooms"
      ? "text-pink-300"
      : location.pathname === "/server-performance"
      ? "text-green-300"
      : "text-blue-300";

  const neonClass =
    location.pathname === "/rank"
      ? "neon-rank"
      : location.pathname === "/rooms"
      ? "neon-pink"
      : location.pathname === "/server-performance"
      ? "neon-green"
      : "neon-home";

  return (
    <>
      <header
        className={`bg-gray-900/90 backdrop-blur-md border-b border-gray-700 fixed top-0 w-full z-50 px-4 py-3 ${neonClass}`}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className={`p-2 mr-4 ${textColor} rounded-full ${
                location.pathname === "/rooms"
                  ? "hover:bg-pink-900/50 hover:shadow-[0_0_10px_rgba(244,63,94,0.7)]"
                  : location.pathname === "/server-performance"
                  ? "hover:bg-green-900/50 hover:shadow-[0_0_10px_rgba(34,197,94,0.7)]"
                  : "hover:bg-blue-900/50 hover:shadow-[0_0_10px_rgba(59,130,246,0.7)]"
              } transition-all duration-300`}
            >
              <FaBars className="text-xl" />
            </button>
            <div
              className="flex items-center cursor-pointer"
              onClick={() => navigate("/home")}
            >
              <FaChessKnight className={`${iconColor} text-2xl mr-2`} />
              <h1
                className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${buttonGradient.split(" ")[0]} ${
                  buttonGradient.split(" ")[1]
                } ${
                  location.pathname === "/rooms"
                    ? "drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                    : location.pathname === "/server-performance"
                    ? "drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                    : "drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                }`}
              >
                ChessVN
              </h1>
            </div>
          </div>
          <div className="relative">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2 p-1 rounded-full bg-gradient-to-r ${buttonGradient} text-white`}
                >
                  <FaUserCircle className="text-xl" />
                </button>
                {dropdownOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-48 bg-gray-800/90 backdrop-blur-lg rounded-lg ${
                      location.pathname === "/rooms"
                        ? "shadow-[0_0_15px_rgba(244,63,94,0.6)] border-pink-800/50"
                        : location.pathname === "/server-performance"
                        ? "shadow-[0_0_15px_rgba(34,197,94,0.6)] border-green-800/50"
                        : "shadow-[0_0_15px_rgba(59,130,246,0.6)] border-blue-800/50"
                    }`}
                  >
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/30 hover:text-red-200 transition-all duration-300"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className={`px-4 py-2 bg-gradient-to-r ${buttonGradient} text-white rounded-full`}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className={`bg-gray-900 p-6 rounded-lg border ${
              location.pathname === "/rooms"
                ? "border-pink-500/50 shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                : location.pathname === "/server-performance"
                ? "border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.6)]"
                : "border-purple-500/50 shadow-[0_0_20px_rgba(147,51,234,0.6)]"
            }`}
          >
            <h3
              className={`text-lg font-semibold ${
                location.pathname === "/rooms"
                  ? "text-pink-300"
                  : location.pathname === "/server-performance"
                  ? "text-green-300"
                  : "text-purple-300"
              } mb-4`}
            >
              Xác nhận đăng xuất
            </h3>
            <p
              className={`${
                location.pathname === "/rooms"
                  ? "text-pink-200"
                  : location.pathname === "/server-performance"
                  ? "text-green-200"
                  : "text-purple-200"
              } mb-6`}
            >
              Bạn có chắc chắn muốn đăng xuất không?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-all duration-300"
              >
                Hủy
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-400 text-white rounded-full shadow-[0_0_10px_rgba(239,68,68,0.7)] hover:from-red-500 hover:to-red-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.9)] transition-all duration-300"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .neon-home {
          animation: neonGlowHome 2s infinite alternate;
        }

        @keyframes neonGlowHome {
          0% {
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.6), 0 0 20px rgba(59, 130, 246, 0.5),
              0 0 30px rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 30px rgba(59, 130, 246, 0.4),
              0 0 40px rgba(59, 130, 246, 0.3);
          }
          100% {
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.6), 0 0 20px rgba(59, 130, 246, 0.5),
              0 0 30px rgba(59, 130, 246, 0.4);
          }
        }

        .neon-rank {
          animation: neonGlowRank 2s infinite alternate;
        }

        @keyframes neonGlowRank {
          0% {
            box-shadow: 0 0 5px #ff8c00, 0 0 10px #ff8c00, 0 0 15px #ff4500;
          }
          50% {
            box-shadow: 0 0 10px #ff4500, 0 0 15px #ff8c00, 0 0 20px #ff4500;
          }
          100% {
            box-shadow: 0 0 5px #ff8c00, 0 0 10px #ff8c00, 0 0 15px #ff4500;
          }
        }

        .neon-pink {
          animation: neonGlowPink 2s infinite alternate;
        }

        @keyframes neonGlowPink {
          0% {
            box-shadow: 0 0 10px rgba(244, 63, 94, 0.6), 0 0 20px rgba(244, 63, 94, 0.5),
              0 0 30px rgba(244, 63, 94, 0.4);
          }
          50% {
            box-shadow: 0 0 20px rgba(244, 63, 94, 0.5), 0 0 30px rgba(244, 63, 94, 0.4),
              0 0 40px rgba(244, 63, 94, 0.3);
          }
          100% {
            box-shadow: 0 0 10px rgba(244, 63, 94, 0.6), 0 0 20px rgba(244, 63, 94, 0.5),
              0 0 30px rgba(244, 63, 94, 0.4);
          }
        }

        .neon-green {
          animation: neonGlowGreen 2s infinite alternate;
        }

        @keyframes neonGlowGreen {
          0% {
            box-shadow: 0 0 10px rgba(34, 197, 94, 0.6), 0 0 20px rgba(34, 197, 94, 0.5),
              0 0 30px rgba(34, 197, 94, 0.4);
          }
          50% {
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.5), 0 0 30px rgba(34, 197, 94, 0.4),
              0 0 40px rgba(34, 197, 94, 0.3);
          }
          100% {
            box-shadow: 0 0 10px rgba(34, 197, 94, 0.6), 0 0 20px rgba(34, 197, 94, 0.5),
              0 0 30px rgba(34, 197, 94, 0.4);
          }
        }
      `}</style>
    </>
  );
};

export default Header;