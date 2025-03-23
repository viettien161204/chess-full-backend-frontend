import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from './1.png'; // Thay bằng đường dẫn logo của bạn

const Tournaments = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const tournamentsPerPage = 10; // Số giải đấu mỗi trang
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [games, setGames] = useState([]);
  const [currentGamesPage, setCurrentGamesPage] = useState(1); // Trang hiện tại của bảng trận đấu
  const gamesPerPage = 10; // Số trận đấu mỗi trang
  const [selectedGameVideoId, setSelectedGameVideoId] = useState(null);
  const [liveVideoId, setLiveVideoId] = useState(null);
  const [replayVideoId, setReplayVideoId] = useState(null);

  // Lấy danh sách giải đấu từ Lichess API
  const fetchTournaments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://lichess.org/api/tournament');
      const allTournaments = [
        ...(response.data.current || []),
        ...(response.data.finished || []),
      ];
      setTournaments(allTournaments);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      setError('Unable to load tournaments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Lấy video trực tiếp và replay từ YouTube cho giải đấu
  const fetchYouTubeVideos = async (tournamentName) => {
    if (!tournamentName) {
      console.warn('Tournament name is undefined, skipping YouTube API call.');
      return;
    }

    const apiKey = 'YOUR_YOUTUBE_API_KEY'; // Thay bằng API key của bạn
    try {
      const liveResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&eventType=live&q=${tournamentName}+chess+live&type=video&key=${apiKey}`
      );
      if (liveResponse.data.items.length > 0) {
        setLiveVideoId(liveResponse.data.items[0].id.videoId);
      }

      const replayResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${tournamentName}+chess+replay&type=video&key=${apiKey}`
      );
      if (replayResponse.data.items.length > 0) {
        setReplayVideoId(replayResponse.data.items[0].id.videoId);
      }
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
    }
  };

  // Lấy video YouTube cho một trận đấu cụ thể
  const fetchGameVideo = async (whitePlayer, blackPlayer, tournamentName) => {
    const apiKey = 'YOUR_YOUTUBE_API_KEY'; // Thay bằng API key của bạn
    const query = `${whitePlayer}+vs+${blackPlayer}+${tournamentName}+chess+match`;
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=${apiKey}`
      );
      if (response.data.items.length > 0) {
        setSelectedGameVideoId(response.data.items[0].id.videoId);
      } else {
        setSelectedGameVideoId(null);
      }
    } catch (error) {
      console.error('Error fetching game video:', error);
      setSelectedGameVideoId(null);
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setDropdownOpen(false);
    navigate('/login');
  };

  // Xử lý xem hồ sơ
  const handleViewProfile = () => {
    navigate('/profile');
    setDropdownOpen(false);
  };

  // Lấy danh sách giải đấu khi trang được tải
  useEffect(() => {
    fetchTournaments();
  }, []);

  // Tính toán dữ liệu phân trang cho bảng giải đấu
  const totalPages = Math.ceil(tournaments.length / tournamentsPerPage);
  const startIndex = (currentPage - 1) * tournamentsPerPage;
  const endIndex = startIndex + tournamentsPerPage;
  const currentTournaments = tournaments.slice(startIndex, endIndex);

  // Tính toán dữ liệu phân trang cho bảng trận đấu
  const totalGamesPages = Math.ceil(games.length / gamesPerPage);
  const startGamesIndex = (currentGamesPage - 1) * gamesPerPage;
  const endGamesIndex = startGamesIndex + gamesPerPage;
  const currentGames = games.slice(startGamesIndex, endGamesIndex);

  // Xử lý chuyển trang cho bảng giải đấu
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

  // Xử lý chuyển trang cho bảng trận đấu
  const handleNextGamesPage = () => {
    if (currentGamesPage < totalGamesPages) {
      setCurrentGamesPage(currentGamesPage + 1);
    }
  };

  const handlePrevGamesPage = () => {
    if (currentGamesPage > 1) {
      setCurrentGamesPage(currentGamesPage - 1);
    }
  };

  // Khi chọn một giải đấu
  const handleSelectTournament = async (tournament) => {
    setSelectedTournament(tournament);
    setGames([]);
    setCurrentGamesPage(1); // Reset trang trận đấu về 1
    setSelectedGameVideoId(null);
    setLiveVideoId(null);
    setReplayVideoId(null);

    const tournamentName = tournament.fullName || tournament.name;
    fetchYouTubeVideos(tournamentName);

    try {
      const response = await axios.get(`https://lichess.org/api/tournament/${tournament.id}/games`, {
        responseType: 'text', // NDJSON
      });
      const gamesData = response.data
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line) => JSON.parse(line));
      console.log('Games data:', gamesData); // Ghi log để kiểm tra dữ liệu
      setGames(gamesData);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  // Khi chọn một trận đấu
  const handleSelectGame = (game) => {
    const whitePlayer = game.players?.white?.user?.name || game.white || 'Unknown';
    const blackPlayer = game.players?.black?.user?.name || game.black || 'Unknown';
    const tournamentName = selectedTournament?.fullName || selectedTournament?.name || '';
    fetchGameVideo(whitePlayer, blackPlayer, tournamentName);
  };

  return (
    <div className="relative min-h-screen font-sans bg-gradient-to-br from-[#1C2526] to-[#000000]">
      {/* Navbar (giữ nguyên như Leaderboard) */}
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
            <Link
              to="/leaderboard"
              className="text-[#C0C0C0] hover:text-[#E5E4E2] hover:drop-shadow-[0_0_8px_rgba(192,192,192,0.8)] font-semibold text-base md:text-lg transition-all duration-300"
            >
              Leaderboard
            </Link>
            <Link
              to="/tournaments"
              className="text-[#C0C0C0] hover:text-[#E5E4E2] hover:drop-shadow-[0_0_8px_rgba(192,192,192,0.8)] font-semibold text-base md:text-lg transition-all duration-300"
            >
              Tournaments
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
          Tournaments
        </h1>

        {isLoading ? (
          <div className="flex flex-col items-center">
            <div
              style={{
                width: '48px',
                height: '48px',
                border: '4px solid #C0C0C0',
                borderTop: '4px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            ></div>
            <p className="text-[#D3D3D3] mt-4">Loading tournaments...</p>
          </div>
        ) : error ? (
          <p className="text-[#D3D3D3]">{error}</p>
        ) : tournaments.length === 0 ? (
          <p className="text-[#D3D3D3]">No tournaments to display.</p>
        ) : (
          <div className="w-full max-w-7xl flex flex-col md:flex-row gap-6">
            {/* Bảng danh sách giải đấu (bên trái) */}
            <div className="w-full md:w-1/2 bg-gradient-to-br from-[#2E2E2E] to-[#1C2526] rounded-xl shadow-[0_0_15px_rgba(192,192,192,0.5)] border border-[#C0C0C0] p-4">
              <table className="w-full text-[#D3D3D3] text-left">
                <thead>
                  <tr className="border-b border-[#FFD700]">
                    <th className="py-3 px-4 text-[#FFD700] font-semibold">No.</th>
                    <th className="py-3 px-4 text-[#FFD700] font-semibold">Name</th>
                    <th className="py-3 px-4 text-[#FFD700] font-semibold">Status</th>
                    <th className="py-3 px-4 text-[#FFD700] font-semibold">Players</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTournaments.map((tournament, index) => (
                    <tr
                      key={tournament.id}
                      className={`border-b border-[#C0C0C0]/50 hover:bg-[#3C3C3C] transition-all duration-300 cursor-pointer ${
                        selectedTournament?.id === tournament.id ? 'bg-[#4B7399]' : ''
                      }`}
                      onClick={() => handleSelectTournament(tournament)}
                    >
                      <td className="py-3 px-4">{startIndex + index + 1}</td>
                      <td className="py-3 px-4">{tournament.fullName || tournament.name || 'Unnamed Tournament'}</td>
                      <td className="py-3 px-4">{tournament.status}</td>
                      <td className="py-3 px-4">{tournament.nbPlayers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls cho bảng giải đấu */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-[#1C2526] font-semibold transition-all duration-300 ${
                    currentPage === 1
                      ? 'bg-[#C0C0C0] cursor-not-allowed'
                      : 'bg-[#FFD700] hover:bg-[#E5C100] hover:shadow-[0_0_15px_rgba(255,215,0,0.7)]'
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
                      ? 'bg-[#C0C0C0] cursor-not-allowed'
                      : 'bg-[#FFD700] hover:bg-[#E5C100] hover:shadow-[0_0_15px_rgba(255,215,0,0.7)]'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Bảng chi tiết giải đấu và trận đấu (bên phải) */}
            {selectedTournament && (
              <div className="w-full md:w-1/2 bg-gradient-to-br from-[#2E2E2E] to-[#1C2526] rounded-xl shadow-[0_0_15px_rgba(192,192,192,0.5)] border border-[#C0C0C0] p-6">
                <h2 className="text-3xl font-bold text-[#FFD700] mb-4 drop-shadow-[0_0_10px_rgba(255,215,0,0.7)]">
                  {selectedTournament.fullName || selectedTournament.name || 'Unnamed Tournament'}
                </h2>
                <p className="text-[#D3D3D3] mb-2">Status: {selectedTournament.status}</p>
                <p className="text-[#D3D3D3] mb-2">Players: {selectedTournament.nbPlayers}</p>
                <p className="text-[#D3D3D3] mb-4">
                  Date: {new Date(selectedTournament.startsAt).toLocaleString()} -{' '}
                  {new Date(selectedTournament.finishesAt).toLocaleString()}
                </p>

                {/* Video trực tiếp */}
                {liveVideoId && (
                  <div className="mb-6">
                    <h3 className="text-xl text-[#FFD700] mb-2">Watch Live</h3>
                    <iframe
                      width="100%"
                      height="315"
                      src={`https://www.youtube.com/embed/${liveVideoId}?autoplay=1`}
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}

                {/* Danh sách trận đấu */}
                <h3 className="text-xl text-[#FFD700] mb-4">Games</h3>
                {games.length > 0 ? (
                  <>
                    <table className="w-full text-[#D3D3D3] text-left mb-6">
                      <thead>
                        <tr className="border-b border-[#FFD700]">
                          <th className="py-3 px-4 text-[#FFD700] font-semibold">No.</th>
                          <th className="py-3 px-4 text-[#FFD700] font-semibold">White</th>
                          <th className="py-3 px-4 text-[#FFD700] font-semibold">Black</th>
                          <th className="py-3 px-4 text-[#FFD700] font-semibold">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentGames.map((game, index) => (
                          <tr
                            key={index}
                            className="border-b border-[#C0C0C0]/50 hover:bg-[#3C3C3C] transition-all duration-300 cursor-pointer"
                            onClick={() => handleSelectGame(game)}
                          >
                            <td className="py-3 px-4">{startGamesIndex + index + 1}</td>
                            <td className="py-3 px-4">{game.players?.white?.user?.name || game.white || 'Unknown'}</td>
                            <td className="py-3 px-4">{game.players?.black?.user?.name || game.black || 'Unknown'}</td>
                            <td className="py-3 px-4">{game.status || 'Unknown'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination Controls cho bảng trận đấu */}
                    <div className="flex justify-between items-center mb-6">
                      <button
                        onClick={handlePrevGamesPage}
                        disabled={currentGamesPage === 1}
                        className={`px-4 py-2 rounded-lg text-[#1C2526] font-semibold transition-all duration-300 ${
                          currentGamesPage === 1
                            ? 'bg-[#C0C0C0] cursor-not-allowed'
                            : 'bg-[#FFD700] hover:bg-[#E5C100] hover:shadow-[0_0_15px_rgba(255,215,0,0.7)]'
                        }`}
                      >
                        Previous
                      </button>
                      <span className="text-[#D3D3D3]">
                        Page {currentGamesPage} of {totalGamesPages}
                      </span>
                      <button
                        onClick={handleNextGamesPage}
                        disabled={currentGamesPage === totalGamesPages}
                        className={`px-4 py-2 rounded-lg text-[#1C2526] font-semibold transition-all duration-300 ${
                          currentGamesPage === totalGamesPages
                            ? 'bg-[#C0C0C0] cursor-not-allowed'
                            : 'bg-[#FFD700] hover:bg-[#E5C100] hover:shadow-[0_0_15px_rgba(255,215,0,0.7)]'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-[#D3D3D3] mb-6">No games available for this tournament.</p>
                )}

                {/* Video của trận đấu được chọn */}
                {selectedGameVideoId ? (
                  <div className="mb-6">
                    <h3 className="text-xl text-[#FFD700] mb-2">Watch Game</h3>
                    <iframe
                      width="100%"
                      height="315"
                      src={`https://www.youtube.com/embed/${selectedGameVideoId}`}
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : selectedGameVideoId === null && games.length > 0 ? (
                  <p className="text-[#D3D3D3] mb-6">No video found for this game.</p>
                ) : null}

                {/* Video replay của giải đấu */}
                {replayVideoId && (
                  <div>
                    <h3 className="text-xl text-[#FFD700] mb-2">Watch Replay</h3>
                    <iframe
                      width="100%"
                      height="315"
                      src={`https://www.youtube.com/embed/${replayVideoId}`}
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer (giữ nguyên như Leaderboard) */}
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
};

export default Tournaments;