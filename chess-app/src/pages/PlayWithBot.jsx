import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Thêm useLocation cho điều hướng
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js"; // Import Chess từ chess.js
import logo from './1.png'; // Đảm bảo file logo nằm trong thư mục src hoặc điều chỉnh đường dẫn

function PlayWithBot() {
  const [game] = useState(new Chess());
  const [status, setStatus] = useState("White to move");
  const [promotionMove, setPromotionMove] = useState(null);
  const [showPromotionOptions, setShowPromotionOptions] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [botLevel, setBotLevel] = useState(3); // Default: Hard
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]); // Lịch sử nước đi
  const [dropdownOpen, setDropdownOpen] = useState(false); // State cho dropdown của avatar
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State để kiểm tra trạng thái đăng nhập
  const [showResetModal, setShowResetModal] = useState(false); // State cho modal reset game (nút "New Game")
  const [showExitModal, setShowExitModal] = useState(false); // State cho modal thoát trang/điều hướng
  const [nextPath, setNextPath] = useState(null); // Lưu trữ đường dẫn điều hướng tiếp theo
  const workerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation(); // Theo dõi vị trí hiện tại

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // Nếu có token, người dùng đã đăng nhập

    // Xử lý sự kiện trước khi thoát trang (unload hoặc điều hướng)
    const handleBeforeUnload = (event) => {
      if (moveHistory.length > 0 || game.fen() !== 'start') { // Kiểm tra nếu có dữ liệu ván đấu
        const confirmationMessage = "Bạn có chắc muốn rời khỏi trang này? Mọi dữ liệu về ván đấu sẽ bị mất.";
        (event || window.event).returnValue = confirmationMessage; // Hiển thị thông báo mặc định của trình duyệt
        return confirmationMessage; // Trả về thông báo cho trình duyệt
      }
    };

    // Xử lý điều hướng trong ứng dụng (ví dụ: nhấp vào link hoặc nút điều hướng)
    const handleNavigation = (event, path = null) => {
      if (moveHistory.length > 0 || game.fen() !== 'start') {
        event.preventDefault(); // Ngăn chặn điều hướng ngay lập tức
        setNextPath(path || event.target.pathname || '/'); // Lưu đường dẫn điều hướng
        setShowExitModal(true); // Hiển thị modal xác nhận thoát
      } else if (path) {
        navigate(path); // Điều hướng trực tiếp nếu không có dữ liệu
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleNavigation); // Xử lý nút Back/Forward của trình duyệt

    // Thêm sự kiện cho các liên kết điều hướng trong ứng dụng
    const links = document.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', (e) => handleNavigation(e, link.getAttribute('href')));
    });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleNavigation);
      links.forEach(link => {
        link.removeEventListener('click', handleNavigation);
      });
    };
  }, [moveHistory, game]);

  // Initialize Web Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL("../botWorker.js", import.meta.url));
    workerRef.current.onmessage = (event) => {
      const bestMove = event.data;
      if (bestMove) {
        game.move(bestMove);
        updateStatusAndHistory(bestMove); // Cập nhật lịch sử nước đi cho bot (Black)
      }
      setIsBotThinking(false);
    };

    return () => {
      workerRef.current.terminate();
    };
  }, [game]);

  // Bot move logic
  const makeBotMove = () => {
    setIsBotThinking(true);
    const depth = botLevel === 1 ? 1 : botLevel === 2 ? 2 : botLevel === 3 ? 3 : 4;
    workerRef.current.postMessage({ fen: game.fen(), depth, level: botLevel });
  };

  // Trigger bot move when it's Black's turn
  useEffect(() => {
    if (game.turn() === "b" && !game.isGameOver()) {
      setTimeout(makeBotMove, 500);
    }
  }, [game.fen(), botLevel]);

  // Handle square click
  const onSquareClick = (square) => {
    if (showPromotionOptions) return; // Không xử lý nếu đang hiển thị tùy chọn phong quân

    if (selectedSquare) {
      const move = { from: selectedSquare, to: square };
      const possibleMoves = game.moves({ square: selectedSquare, verbose: true });
      const foundMove = possibleMoves.find((m) => m.to === square);

      if (foundMove && foundMove.promotion) {
        setPromotionMove(move);
        setShowPromotionOptions(true);
      } else if (foundMove) {
        game.move(move);
        updateStatusAndHistory(foundMove); // Cập nhật lịch sử nước đi cho người chơi (White)
      }

      setSelectedSquare(null);
      setValidMoves([]);
    } else {
      const moves = game.moves({ square, verbose: true });
      if (moves.length > 0) {
        setSelectedSquare(square);
        setValidMoves(moves.map((m) => m.to));
      }
    }
  };

  // Handle piece drop
  const onDrop = (sourceSquare, targetSquare) => {
    const possibleMoves = game.moves({ square: sourceSquare, verbose: true });
    const move = possibleMoves.find((m) => m.to === targetSquare);
    if (!move) return false;

    if (move.promotion) {
      setPromotionMove({ from: sourceSquare, to: targetSquare });
      setShowPromotionOptions(true);
      return false;
    }

    game.move({ from: sourceSquare, to: targetSquare });
    updateStatusAndHistory(move); // Cập nhật lịch sử nước đi cho người chơi (White)
    return true;
  };

  // Handle pawn promotion
  const promotePawn = (piece) => {
    if (!promotionMove) return;

    game.move({
      from: promotionMove.from,
      to: promotionMove.to,
      promotion: piece,
    });

    setShowPromotionOptions(false);
    setPromotionMove(null);
    const moves = game.history({ verbose: true });
    const lastMove = moves[moves.length - 1];
    updateStatusAndHistory(lastMove); // Cập nhật lịch sử sau khi phong quân
  };

  // Update game status and move history
  const updateStatusAndHistory = (moveData) => {
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        setStatus(`Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins`);
      } else if (game.isDraw()) {
        setStatus("Draw!");
      }
    } else {
      setStatus(`${game.turn() === "w" ? "White" : "Black"} to move`);
    }
    // Cập nhật lịch sử nước đi
    if (moveData) {
      const moveNotation = `${moveData.san}`; // Sử dụng SAN notation
      const player = moveData.color === 'w' ? 'Player' : 'Bot'; // Người chơi (White) hoặc Bot (Black)
      setMoveHistory(prev => [...prev, { move: moveNotation, player }]);
    }
  };

  // Start new game
  const newGame = () => {
    if (moveHistory.length > 0 || game.fen() !== 'start') { // Kiểm tra nếu có dữ liệu ván đấu
      setShowResetModal(true); // Hiển thị modal xác nhận reset game
    } else {
      resetGame(); // Reset trực tiếp nếu không có dữ liệu
    }
  };

  const resetGame = () => {
    game.reset();
    setStatus("White to move");
    setSelectedSquare(null);
    setValidMoves([]);
    setShowPromotionOptions(false);
    setPromotionMove(null);
    setMoveHistory([]); // Reset lịch sử nước đi
    setShowResetModal(false); // Đóng modal reset
  };

  // Hàm xử lý logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Xóa token khỏi localStorage
    navigate('/login'); // Điều hướng về trang login
    setIsLoggedIn(false); // Cập nhật trạng thái đăng nhập
    setDropdownOpen(false); // Đóng dropdown sau khi logout
  };

  // Hàm xử lý view profile
  const handleViewProfile = () => {
    navigate('/profile'); // Điều hướng về trang profile
    setDropdownOpen(false); // Đóng dropdown sau khi xem profile
  };

  // Highlight valid moves
  const customSquareStyles = () => {
    const styles = {};
    validMoves.forEach((square) => {
      styles[square] = { backgroundColor: "rgba(0, 255, 0, 0.4)" };
    });
    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: "rgba(255, 255, 0, 0.4)" };
    }
    return styles;
  };

  // Hàm xác nhận điều hướng sau khi nhấp OK trong modal thoát
  const confirmExit = () => {
    if (nextPath) {
      navigate(nextPath); // Điều hướng đến đường dẫn đã lưu
    }
    setShowExitModal(false); // Đóng modal thoát
    setNextPath(null); // Reset đường dẫn sau khi điều hướng
  };

  return (
    <div className="relative overflow-x-hidden min-h-screen font-sans bg-gradient-to-br from-gray-900 via-rose-950 to-black">
      {/* Navbar (đặt tĩnh, không fixed, giống Login) */}
      <nav className="bg-rose-900/90 shadow-[0_0_15px_rgba(251,113,133,0.5)] py-3 z-50 rounded-b-xl max-w-7xl mx-auto mt-2 backdrop-blur-md transition-colors duration-500 ease-in-out">
        <ul className="flex justify-between items-center list-none px-4 md:px-6">
          <li>
            <Link to="/">
              <img src={logo} alt="Chess Logo" className="h-12 md:h-16 w-auto transition-transform duration-300 hover:scale-110" style={{ filter: `drop-shadow(0 0 10px rgba(251,113,133,0.8))` }} />
            </Link>
          </li>
          <li className="flex-1 text-center">
            <Link to="/" className="text-rose-400 hover:text-rose-200 hover:drop-shadow-[0_0_8px_rgba(251,113,133,0.8)] font-semibold text-base md:text-lg transition-all duration-300">
              Home
            </Link>
          </li>
          <li className="text-right">
            {isLoggedIn ? (
              <div className="relative">
                {/* Avatar với dropdown (nếu đã đăng nhập) */}
                <img
                  src="https://via.placeholder.com/40?text=👤"
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full cursor-pointer transition-all duration-300 hover:scale-110"
                  onClick={() => setDropdownOpen(!dropdownOpen)} // Mở/đóng dropdown khi nhấp
                />
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={handleViewProfile}
                      className="block w-full text-left px-4 py-2 text-rose-200 hover:bg-rose-800 hover:text-rose-100 transition-all duration-300"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-rose-200 hover:bg-rose-800 hover:text-rose-100 transition-all duration-300"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-4">
                {/* Liên kết Register và Login (nếu chưa đăng nhập) */}
                <Link
                  to="/register"
                  className="text-rose-400 hover:text-rose-200 hover:drop-shadow-[0_0_8px_rgba(251,113,133,0.8)] font-semibold text-base md:text-lg transition-all duration-300"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="text-rose-400 hover:text-rose-200 hover:drop-shadow-[0_0_8px_rgba(251,113,133,0.8)] font-semibold text-base md:text-lg transition-all duration-300"
                >
                  Login
                </Link>
              </div>
            )}
          </li>
        </ul>
      </nav>

      {/* Main Content - Sử dụng flex để căn giữa Chessboard và sắp xếp Move History bên dưới */}
      <div className="flex flex-col items-center min-h-screen p-4">
        <h1 className="text-xl font-semibold text-rose-300 mb-6 drop-shadow-[0_0_10px_rgba(251,113,133,0.7)]">Chess vs Bot</h1>

        <div className="mb-4 flex gap-2">
          <label className="text-rose-200">Bot Level:</label>
          <select
            value={botLevel}
            onChange={(e) => setBotLevel(parseInt(e.target.value))}
            className="p-2 border rounded bg-gray-800/80 border-rose-500/50 text-rose-100 placeholder-rose-400/50 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-gray-700/80 transition-all duration-300 shadow-[inset_0_0_8px_rgba(251,113,133,0.3)]"
          >
            <option value={1}>Easy (Depth 1)</option>
            <option value={2}>Medium (Depth 2)</option>
            <option value={3}>Hard (Depth 3)</option>
            <option value={4}>Expert (Depth 4)</option>
          </select>
        </div>

        {/* Bảng cờ (căn giữa trực tiếp) */}
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick}
          boardWidth={600}
          customSquareStyles={customSquareStyles()}
          customBoardStyle={{ pointerEvents: showPromotionOptions ? 'none' : 'auto', position: 'static', zIndex: 10, margin: '0 auto' }}
        />
        {showPromotionOptions && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg flex gap-2 z-20">
            {["q", "r", "b", "n"].map((piece) => (
              <button
                key={piece}
                onClick={() => promotePawn(piece)}
                className="px-3 py-2 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded shadow-[0_0_15px_rgba(251,113,133,0.7)] hover:from-rose-700 hover:to-rose-600 hover:scale-105 hover:shadow-[0_0_25px_rgba(251,113,133,0.9)] transition-all duration-300"
              >
                {piece === "q" ? "Queen" : piece === "r" ? "Rook" : piece === "b" ? "Bishop" : "Knight"}
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 flex gap-4">
          <button
            onClick={newGame}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-lg shadow-[0_0_15px_rgba(251,113,133,0.7)] hover:from-rose-700 hover:to-rose-600 hover:scale-105 hover:shadow-[0_0_25px_rgba(251,113,133,0.9)] transition-all duration-300"
          >
            New Game
          </button>
        </div>
        <div className="mt-4 text-lg text-rose-200">
          {isBotThinking ? "Bot is thinking..." : status}
        </div>

        {/* Move History (dưới bàn cờ, chia 2 cột White và Black) */}
        <div className="w-full max-w-5xl mt-6 bg-gray-900/80 rounded-xl shadow-[0_0_15px_rgba(251,113,133,0.5)] backdrop-blur-lg border border-rose-500/50 p-4 h-48 overflow-y-auto">
          <h3 className="text-xl font-bold text-rose-300 mb-2 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]">Move History</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-rose-200 font-semibold">White</div>
            <div className="text-rose-200 font-semibold">Black</div>
            {moveHistory.map((move, index) => {
              const isWhiteMove = move.player === 'Player'; // Xác định nước đi của người chơi (White)
              return (
                <React.Fragment key={index}>
                  <div className="text-rose-200 text-sm">{isWhiteMove ? `Move ${index + 1}: ${move.move}` : ''}</div>
                  <div className="text-rose-200 text-sm">{!isWhiteMove ? `Move ${index + 1}: ${move.move}` : ''}</div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal xác nhận reset game (nút "New Game") */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900/80 border border-rose-500/50 rounded-2xl shadow-[0_0_20px_rgba(251,113,133,0.6)] p-6 max-w-md w-full backdrop-blur-lg">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowResetModal(false)} // Đóng modal khi nhấp vào nút Close
                className="text-rose-200 hover:text-rose-100 transition-colors duration-300"
              >
                × {/* Biểu tượng đóng (X) */}
              </button>
            </div>
            <h2 className="text-2xl font-bold text-rose-300 mb-4 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]">Xác Nhận</h2>
            <p className="text-rose-200 mb-6">Bạn có chắc, mọi dữ liệu về ván đấu sẽ bị xóa.</p>
            <button
              onClick={() => {
                resetGame(); // Reset game và đóng modal
              }}
              className="bg-gradient-to-r from-rose-600 to-rose-500 text-white py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(251,113,133,0.7)] hover:from-rose-700 hover:to-rose-600 hover:scale-105 hover:shadow-[0_0_25px_rgba(251,113,133,0.9)] transition-all duration-300"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Modal xác nhận thoát trang hoặc điều hướng */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900/80 border border-rose-500/50 rounded-2xl shadow-[0_0_20px_rgba(251,113,133,0.6)] p-6 max-w-md w-full backdrop-blur-lg">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setShowExitModal(false); // Đóng modal khi nhấp vào nút Close
                  setNextPath(null); // Reset đường dẫn điều hướng
                }}
                className="text-rose-200 hover:text-rose-100 transition-colors duration-300"
              >
                × {/* Biểu tượng đóng (X) */}
              </button>
            </div>
            <h2 className="text-2xl font-bold text-rose-300 mb-4 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]">Cảnh Báo</h2>
            <p className="text-rose-200 mb-6">Bạn có chắc muốn rời khỏi trang này? Mọi dữ liệu về ván đấu sẽ bị mất.</p>
            <button
              onClick={() => {
                confirmExit(); // Xác nhận điều hướng đến đường dẫn đã lưu
              }}
              className="bg-gradient-to-r from-rose-600 to-rose-500 text-white py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(251,113,133,0.7)] hover:from-rose-700 hover:to-rose-600 hover:scale-105 hover:shadow-[0_0_25px_rgba(251,113,133,0.9)] transition-all duration-300"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayWithBot;