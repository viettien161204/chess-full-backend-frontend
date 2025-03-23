import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import logo from './1.png';

function PlayOfflinePage() {
  const [game, setGame] = useState(new Chess());
  const [gamePosition, setGamePosition] = useState('start');
  const [status, setStatus] = useState("Trắng đi trước");
  const [promotionMove, setPromotionMove] = useState(null);
  const [showPromotionOptions, setShowPromotionOptions] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [nextPath, setNextPath] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const handleBeforeUnload = (event) => {
      if (moveHistory.length > 0 || game.fen() !== 'start') {
        const confirmationMessage = "Bạn có chắc muốn rời khỏi trang này? Mọi dữ liệu về ván đấu sẽ bị mất.";
        (event || window.event).returnValue = confirmationMessage;
        return confirmationMessage;
      }
    };

    const handleNavigation = (event, path = null) => {
      if (moveHistory.length > 0 || game.fen() !== 'start') {
        event.preventDefault();
        setNextPath(path || event.target.pathname || '/');
        setShowExitModal(true);
      } else if (path) {
        navigate(path);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleNavigation);
    const links = document.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', (e) => handleNavigation(e, link.getAttribute('href')));
    });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleNavigation);
      links.forEach(link => link.removeEventListener('click', handleNavigation));
    };
  }, [moveHistory, game]);

  const updateStatusAndHistory = (moveData = null) => {
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        setStatus(`Chiếu hết! ${game.turn() === "w" ? "Đen thắng" : "Trắng thắng"}`);
      } else if (game.isDraw()) {
        setStatus("Hòa!");
      }
    } else {
      setStatus(`Lượt đi của ${game.turn() === "w" ? "Trắng" : "Đen"}`);
    }
    if (moveData) {
      const moveNotation = `${moveData.san}`;
      const player = moveData.color === 'w' ? 'Player 1' : 'Player 2';
      setMoveHistory(prev => [...prev, { move: moveNotation, player }]);
    }
  };

  const onSquareClick = (square) => {
    if (showPromotionOptions) return;

    if (selectedSquare) {
      const move = { from: selectedSquare, to: square };
      const possibleMoves = game.moves({ square: selectedSquare, verbose: true });
      const foundMove = possibleMoves.find(m => m.to === square);

      if (foundMove && foundMove.promotion) {
        setPromotionMove(move);
        setShowPromotionOptions(true);
      } else if (foundMove) {
        game.move(move);
        setGamePosition(game.fen());
        updateStatusAndHistory(foundMove);
      }
      setSelectedSquare(null);
      setValidMoves([]);
    } else {
      const moves = game.moves({ square, verbose: true });
      if (moves.length > 0) {
        setSelectedSquare(square);
        setValidMoves(moves.map(m => m.to));
      }
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    const possibleMoves = game.moves({ square: sourceSquare, verbose: true });
    const move = possibleMoves.find(m => m.to === targetSquare);
    if (!move) return false;

    if (move.promotion) {
      setPromotionMove({ from: sourceSquare, to: targetSquare });
      setShowPromotionOptions(true);
      return false;
    }
    game.move({ from: sourceSquare, to: targetSquare });
    setGamePosition(game.fen());
    updateStatusAndHistory(move);
    return true;
  };

  const promotePawn = (piece) => {
    if (!promotionMove) return;
    game.move({ from: promotionMove.from, to: promotionMove.to, promotion: piece });
    setShowPromotionOptions(false);
    setPromotionMove(null);
    setGamePosition(game.fen());
    updateStatusAndHistory(game.history({ verbose: true }).slice(-1)[0]);
  };

  const newGame = () => {
    if (moveHistory.length > 0 || game.fen() !== 'start') {
      setShowResetModal(true);
    } else {
      resetGame();
    }
  };

  const resetGame = () => {
    game.reset();
    setGamePosition('start');
    setStatus("Trắng đi trước");
    setMoveHistory([]);
    setShowResetModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    setIsLoggedIn(false);
    setDropdownOpen(false);
  };

  const handleViewProfile = () => {
    navigate('/profile');
    setDropdownOpen(false);
  };

  const customSquareStyles = () => {
    const styles = {};
    validMoves.forEach(square => styles[square] = { backgroundColor: "rgba(0, 255, 0, 0.4)" });
    if (selectedSquare) styles[selectedSquare] = { backgroundColor: "rgba(255, 255, 0, 0.4)" };
    return styles;
  };

  const confirmExit = () => {
    if (nextPath) navigate(nextPath);
    setShowExitModal(false);
    setNextPath(null);
  };

  return (
    <div className="relative overflow-x-hidden min-h-screen font-sans bg-gradient-to-b from-teal-900 to-emerald-900">
      <nav className="bg-teal-950/90 shadow-[0_0_15px_rgba(4,47,46,0.5)] py-3 z-50 rounded-b-xl max-w-7xl mx-auto mt-2 backdrop-blur-md">
        <ul className="flex justify-between items-center list-none px-4 md:px-6">
          <li>
            <Link to="/">
              <img src={logo} alt="Chess Logo" className="h-12 md:h-16 w-auto transition-transform duration-300 hover:scale-110" style={{ filter: `drop-shadow(0 0 10px rgba(4,47,46,0.8))` }} />
            </Link>
          </li>
          <li className="flex-1 text-center">
            <Link to="/" className="text-emerald-400 hover:text-emerald-200 hover:drop-shadow-[0_0_8px_rgba(4,47,46,0.8)] font-semibold text-base md:text-lg transition-all duration-300">
              Home
            </Link>
          </li>
          <li className="text-right">
            {isLoggedIn ? (
              <div className="relative">
                <img
                  src="https://store.playstation.com/store/api/chihiro/00_09_000/container/IE/en/99/EP4037-SLES51630_00-AVPLAYITCH000002/0/image?_version=00_09_000&platform=chihiro&bg_color=000000&opacity=100&w=720&h=720"
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full cursor-pointer transition-all duration-300 hover:scale-110"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                />
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50">
                    <button onClick={handleViewProfile} className="block w-full text-left px-4 py-2 text-emerald-200 hover:bg-emerald-800 hover:text-emerald-100 transition-all duration-300">
                      View Profile
                    </button>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-emerald-200 hover:bg-emerald-800 hover:text-emerald-100 transition-all duration-300">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-4">
                <Link to="/register" className="text-emerald-200 hover:text-emerald-100 hover:underline transition-all duration-300">Register</Link>
                <Link to="/login" className="text-emerald-200 hover:text-emerald-100 hover:underline transition-all duration-300">Login</Link>
              </div>
            )}
          </li>
        </ul>
      </nav>

      <div className="flex flex-col items-center min-h-screen p-4">
        <h1 className="text-xl font-semibold text-emerald-300 mb-6 drop-shadow-[0_0_10px_rgba(20,83,45,0.7)]">Offline Chess</h1>

        <div style={{ width: '600px', height: '600px' }}>
          <Chessboard
            position={gamePosition}
            onPieceDrop={onDrop}
            onSquareClick={onSquareClick}
            boardWidth={550}
            customSquareStyles={customSquareStyles()}
            customBoardStyle={{ pointerEvents: showPromotionOptions ? 'none' : 'auto', position: 'static', zIndex: 10, margin: '0 auto' }}
            animationDuration={300}
            draggable={true}
          />
        </div>

        {showPromotionOptions && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg flex gap-2 z-20">
            {["q", "r", "b", "n"].map((piece) => (
              <button
                key={piece}
                onClick={() => promotePawn(piece)}
                className="px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-all duration-300"
              >
                {piece === "q" ? "Hậu" : piece === "r" ? "Xe" : piece === "b" ? "Tượng" : "Mã"}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 flex gap-4">
          <button
            onClick={newGame}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-[0_0_15px_rgba(20,83,45,0.7)] hover:bg-emerald-700 hover:scale-105 hover:shadow-[0_0_25px_rgba(20,83,45,1)] transition-all duration-300"
          >
            Game mới
          </button>
        </div>
        <div className="mt-4 text-lg text-emerald-200">{status}</div>

        <div className="w-full max-w-5xl mt-6 bg-gray-900/80 rounded-xl shadow-[0_0_15px_rgba(20,83,45,0.5)] backdrop-blur-lg border border-emerald-500/50 p-4 h-48 overflow-y-auto">
          <h3 className="text-xl font-bold text-emerald-300 mb-2 drop-shadow-[0_0_8px_rgba(20,83,45,0.5)]">Move History</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-emerald-200 font-semibold">White</div>
            <div className="text-emerald-200 font-semibold">Black</div>
            {moveHistory.map((move, index) => {
              const isWhiteMove = move.player === 'Player 1';
              return (
                <React.Fragment key={index}>
                  <div className="text-emerald-200 text-sm">{isWhiteMove ? `Move ${index + 1}: ${move.move}` : ''}</div>
                  <div className="text-emerald-200 text-sm">{!isWhiteMove ? `Move ${index + 1}: ${move.move}` : ''}</div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900/80 border border-emerald-500/50 rounded-2xl shadow-[0_0_20px_rgba(20,83,45,0.6)] p-6 max-w-md w-full backdrop-blur-lg">
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowResetModal(false)} className="text-emerald-200 hover:text-emerald-100 transition-colors duration-300">×</button>
            </div>
            <h2 className="text-2xl font-bold text-emerald-300 mb-4 drop-shadow-[0_0_8px_rgba(20,83,45,0.5)]">Xác Nhận</h2>
            <p className="text-emerald-200 mb-6">Bạn có chắc, mọi dữ liệu về ván đấu sẽ bị xóa.</p>
            <button
              onClick={resetGame}
              className="bg-emerald-600 text-white py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(20,83,45,0.7)] hover:bg-emerald-700 hover:scale-105 hover:shadow-[0_0_25px_rgba(20,83,45,0.9)] transition-all duration-300"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900/80 border border-emerald-500/50 rounded-2xl shadow-[0_0_20px_rgba(20,83,45,0.6)] p-6 max-w-md w-full backdrop-blur-lg">
            <div className="flex justify-end mb-4">
              <button onClick={() => { setShowExitModal(false); setNextPath(null); }} className="text-emerald-200 hover:text-emerald-100 transition-colors duration-300">×</button>
            </div>
            <h2 className="text-2xl font-bold text-emerald-300 mb-4 drop-shadow-[0_0_8px_rgba(20,83,45,0.5)]">Cảnh Báo</h2>
            <p className="text-emerald-200 mb-6">Bạn có chắc muốn rời khỏi trang này? Mọi dữ liệu về ván đấu sẽ bị mất.</p>
            <button
              onClick={confirmExit}
              className="bg-emerald-600 text-white py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(20,83,45,0.7)] hover:bg-emerald-700 hover:scale-105 hover:shadow-[0_0_25px_rgba(20,83,45,0.9)] transition-all duration-300"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayOfflinePage;