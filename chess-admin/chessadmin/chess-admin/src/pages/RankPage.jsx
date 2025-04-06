import { useState, useEffect } from "react";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import { FaCrown, FaChessPawn, FaTrophy } from "react-icons/fa";
import backgroundImage from "../assets/1.jpg";

const RankPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://150.95.112.187:8080/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const sortedUsers = data.sort((a, b) => (b.score || 0) - (a.score || 0));
      setUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Unable to load leaderboard. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const totalPages = Math.ceil(users.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

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
    <div
      className="min-h-screen w-screen overflow-hidden relative font-sans bg-black"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-gray-900/40 to-transparent"></div>
      <div className="flex h-screen overflow-hidden relative z-10">
        <SideBar />
        <div className="flex-1 flex flex-col">
          <Header className="fixed top-0 w-full z-20" />

          <main className="flex-1 p-6 mt-16 overflow-auto bg-transparent">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 mb-6 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]">
                Bảng Xếp Hạng
              </h1>

              <div className="bg-gray-200 backdrop-blur-lg rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)] p-6 neon-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaTrophy className="mr-3 text-amber-500" /> Player Rankings
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-700">Season 2025</span>
                  </div>
                </div>

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
                    <p className="text-gray-700 Delegate mt-4">Loading rankings...</p>
                  </div>
                ) : error ? (
                  <p className="text-gray-700 text-center">{error}</p>
                ) : users.length === 0 ? (
                  <p className="text-gray-700 text-center">No players to display.</p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-400">
                            <th className="pb-3 text-center text-blue-900 font-semibold">Rank</th>
                            <th className="pb-3 text-center text-blue-900 font-semibold">Player</th>
                            <th className="pb-3 text-center text-blue-900 font-semibold">Rating</th>
                            <th className="pb-3 text-center text-blue-900 font-semibold">Games</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentUsers.map((user, index) => (
                            <tr
                              key={user.id}
                              className="border-b border-gray-300 bg-gray-50 bg-opacity-90 hover:bg-gray-300 transition-all duration-300"
                            >
                              <td className="py-4 text-center">
                                <div className="flex items-center justify-center text-gray-700">
                                  {startIndex + index === 0 ? (
                                    <FaCrown className="text-amber-500" />
                                  ) : startIndex + index === users.length - 1 ? (
                                    <FaChessPawn className="text-gray-500" />
                                  ) : (
                                    <span>{startIndex + index + 1}</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 text-center text-gray-900">{user.email}</td>
                              <td className="py-4 text-center">
                                <span className="px-3 py-1 rounded-full bg-amber-200 text-amber-800 text-sm shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                                  {user.score || "N/A"}
                                </span>
                              </td>
                              <td className="py-4 text-center text-gray-900">{user.games || "N/A"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 flex justify-between items-center">
                      <div className="text-sm text-gray-700">
                        Showing {startIndex + 1} to {Math.min(endIndex, users.length)} of {users.length} players
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handlePrevPage}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-300 text-gray-900 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)] ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:from-amber-400 hover:to-amber-200 hover:shadow-[0_0_20px_rgba(245,158,11,0.7)]"} transition-all duration-300`}
                        >
                          Previous
                        </button>
                        <button
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-300 text-gray-900 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)] ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:from-amber-400 hover:to-amber-200 hover:shadow-[0_0_20px_rgba(245,158,11,0.7)]"} transition-all duration-300`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes neonGlow {
          0% {
            box-shadow: 0 0 10px #ff8c00, 0 0 20px #ff8c00, 0 0 30px #ff4500;
          }
          50% {
            box-shadow: 0 0 20px #ff4500, 0 0 30px #ff8c00, 0 0 40px #ff4500;
          }
          100% {
            box-shadow: 0 0 10px #ff8c00, 0 0 20px #ff8c00, 0 0 30px #ff4500;
          }
        }
        .neon-border {
          animation: neonGlow 2s infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default RankPage;