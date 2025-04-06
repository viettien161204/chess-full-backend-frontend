import { FaHome, FaChessKnight, FaDoorOpen, FaServer } from "react-icons/fa"; // Thêm FaServer
import { useNavigate, useLocation } from "react-router-dom";

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <FaHome className="text-xl" />, path: "/home", label: "Trang chủ" },
    { icon: <FaChessKnight className="text-xl" />, path: "/rank", label: "Xếp hạng" },
    { icon: <FaDoorOpen className="text-xl" />, path: "/rooms", label: "Phòng chơi" },
    { icon: <FaServer className="text-xl" />, path: "/server-performance", label: "Hiệu suất Server" }, // Mục mới
  ];

  const isActive = (path) => location.pathname === path;

  const textColor =
    location.pathname === "/rank"
      ? "text-amber-300 hover:text-amber-100 hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]"
      : location.pathname === "/rooms"
      ? "text-pink-300 hover:text-pink-100 hover:drop-shadow-[0_0_10px_rgba(244,63,94,0.9)]"
      : location.pathname === "/server-performance"
      ? "text-green-300 hover:text-green-100 hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.9)]" // Màu xanh cho Server Performance
      : "text-blue-300 hover:text-blue-100 hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.9)]";

  const neonClass =
    location.pathname === "/rank"
      ? "neon-rank"
      : location.pathname === "/rooms"
      ? "neon-pink"
      : location.pathname === "/server-performance"
      ? "neon-green" // Neon xanh cho Server Performance
      : "neon-home";

  return (
    <div
      className={`h-screen w-16 fixed top-0 left-0 z-30 bg-gray-900/90 backdrop-blur-lg border-r ${
        location.pathname === "/rooms"
          ? "border-pink-500/50"
          : location.pathname === "/server-performance"
          ? "border-green-500/50" // Viền xanh
          : "border-blue-500/50"
      } ${neonClass}`}
    >
      <div
        className={`p-4 border-b ${
          location.pathname === "/rooms"
            ? "border-pink-500/50"
            : location.pathname === "/server-performance"
            ? "border-green-500/50"
            : "border-blue-500/50"
        } flex items-center justify-center animate-chessUnfold`}
      >
        {process.env.PUBLIC_URL + "/logo.png" ? (
          <img src="/logo.png" alt="Logo" className="w-8 h-8" />
        ) : (
          <FaChessKnight
            className={
              location.pathname === "/rooms"
                ? "text-pink-300 text-2xl"
                : location.pathname === "/server-performance"
                ? "text-green-300 text-2xl"
                : "text-blue-300 text-2xl"
            }
          />
        )}
      </div>
      <nav className="mt-6">
        <ul className="space-y-4 px-2">
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={`py-3 px-2 rounded-lg flex items-center justify-center cursor-pointer ${textColor} transition-all duration-300 ${
                location.pathname === "/rooms"
                  ? "hover:bg-pink-900/50 hover:shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                  : location.pathname === "/server-performance"
                  ? "hover:bg-green-900/50 hover:shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  : "hover:bg-blue-900/50 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              } ${
                isActive(item.path)
                  ? `${
                      location.pathname === "/rooms"
                        ? "border-l-4 border-pink-300 bg-pink-900/40"
                        : location.pathname === "/server-performance"
                        ? "border-l-4 border-green-300 bg-green-900/40"
                        : "border-l-4 border-blue-300 bg-blue-900/40"
                    }`
                  : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              <span
                className={
                  location.pathname === "/rooms"
                    ? "drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]"
                    : location.pathname === "/server-performance"
                    ? "drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]"
                    : "drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]"
                }
              >
                {item.icon}
              </span>
              <div
                className={`absolute left-full ml-2 px-3 py-1 bg-gray-800 rounded shadow-lg text-sm ${
                  location.pathname === "/rooms"
                    ? "text-pink-200"
                    : location.pathname === "/server-performance"
                    ? "text-green-200"
                    : "text-blue-200"
                } whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-300`}
              >
                {item.label}
              </div>
            </li>
          ))}
        </ul>
      </nav>

      <style jsx>{`
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
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
            filter: blur(0);
          }
        }
        .animate-chessUnfold {
          animation: chessUnfold 1.8s ease-out forwards;
        }

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
    </div>
  );
};

export default SideBar;