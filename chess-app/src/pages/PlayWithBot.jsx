import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import logo from './1.png';

function PlayWithBot() {
  const [game] = useState(new Chess());
  const [status, setStatus] = useState("White to move");
  const [promotionMove, setPromotionMove] = useState(null);
  const [showPromotionOptions, setShowPromotionOptions] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [skillLevel, setSkillLevel] = useState(10);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showBotWinsModal, setShowBotWinsModal] = useState(false); // Thêm state cho modal khi bot thắng
  const [nextPath, setNextPath] = useState(null);
  const [boardWidth, setBoardWidth] = useState(550);
  const [selectedBot, setSelectedBot] = useState('stockfish');
  const [stockfishError, setStockfishError] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const workerRef = useRef(null);
  const stockfishRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const calculateEloAndDifficulty = (skillLevel) => {
    const elo = 800 + (skillLevel * 120);
    let difficulty = '';
    if (elo <= 1400) difficulty = 'Easy';
    else if (elo <= 2000) difficulty = 'Medium';
    else if (elo <= 2600) difficulty = 'Hard';
    else difficulty = 'Expert';
    return { elo, difficulty };
  };

  const { elo, difficulty } = calculateEloAndDifficulty(skillLevel);

  useEffect(() => {
    const loadStockfish = async () => {
      try {
        const stockfish = new Worker('/stockfish/stockfish.js');
        stockfishRef.current = stockfish;

        stockfish.onmessage = (event) => {
          const message = event.data;
          if (message.startsWith('bestmove')) {
            const bestMove = message.split(' ')[1];
            if (bestMove) {
              const move = game.move({
                from: bestMove.substring(0, 2),
                to: bestMove.substring(2, 4),
                promotion: bestMove.length > 4 ? bestMove.substring(4, 5) : undefined,
              });
              if (move) {
                setLastMove({ from: move.from, to: move.to });
                updateStatusAndHistory(move);
              } else {
                console.error("Stockfish returned an invalid move:", bestMove);
                setStatus("Stockfish failed to find a valid move");
              }
            }
            setIsBotThinking(false);
          }
        };

        stockfish.onerror = (error) => {
          console.error("Stockfish Worker error:", error);
          setStockfishError("Failed to communicate with Stockfish Worker.");
        };

        stockfish.postMessage('uci');
        stockfish.postMessage(`setoption name Skill Level value ${skillLevel}`);
        stockfish.postMessage('setoption name UCI_LimitStrength value true');
        stockfish.postMessage('isready');

        return () => {
          if (stockfishRef.current) stockfishRef.current.terminate();
        };
      } catch (error) {
        console.error("Error loading Stockfish:", error);
        setStockfishError("Error loading Stockfish: " + error.message);
      }
    };

    loadStockfish();
  }, [game, skillLevel]);

  useEffect(() => {
    workerRef.current = new Worker(new URL("../botWorker.worker.js", import.meta.url));
    workerRef.current.onmessage = (event) => {
      const bestMove = event.data;
      if (bestMove) {
        game.move(bestMove);
        setLastMove({ from: bestMove.from, to: bestMove.to });
        updateStatusAndHistory(bestMove);
      } else {
        console.error("Bot failed to return a valid move");
        setStatus("Bot failed to find a move");
      }
      setIsBotThinking(false);
    };
    return () => workerRef.current.terminate();
  }, [game]);

  useEffect(() => {
    const updateBoardWidth = () => {
      const width = window.innerWidth;
      if (width < 640) setBoardWidth(Math.min(width - 40, 350));
      else if (width < 1024) setBoardWidth(450);
      else setBoardWidth(550);
    };

    updateBoardWidth();
    window.addEventListener("resize", updateBoardWidth);
    return () => window.removeEventListener("resize", updateBoardWidth);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const handleBeforeUnload = (event) => {
      if (moveHistory.length > 0 || game.fen() !== 'start') {
        const confirmationMessage = "Are you sure you want to leave this page? All game progress will be lost.";
        (event || window.event).returnValue = confirmationMessage;
        return confirmationMessage;
      }
    };

    const handleNavigation = (event, path = null) => {
      if (moveHistory.length > 0 || game.fen() !== 'start') {
        event.preventDefault();
        setNextPath(path || event.target.pathname || '/');
        setShowExitModal(true);
      } else if (path) navigate(path);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleNavigation);
    const links = document.querySelectorAll('a');
    links.forEach(link => link.addEventListener('click', (e) => handleNavigation(e, link.getAttribute('href'))));

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleNavigation);
      links.forEach(link => link.removeEventListener('click', handleNavigation));
    };
  }, [moveHistory, game]);

  const makeBotMove = () => {
    setIsBotThinking(true);
    if (selectedBot === 'custom') {
      console.log("Sending FEN to worker:", game.fen());
      workerRef.current.postMessage({ fen: game.fen() });
    } else if (stockfishRef.current) {
      stockfishRef.current.postMessage('position fen ' + game.fen());
      stockfishRef.current.postMessage(`go depth ${Math.floor(skillLevel / 4) + 1}`);
    } else {
      setIsBotThinking(false);
      setStatus("Stockfish is not available. Please select Custom Bot.");
    }
  };

  useEffect(() => {
    if (game.turn() === "b" && !game.isGameOver()) setTimeout(makeBotMove, 500);
  }, [game.fen(), selectedBot, skillLevel]);

  const onSquareClick = (square) => {
    if (showPromotionOptions || isBotThinking || game.turn() === "b") return;

    if (selectedSquare) {
      const move = { from: selectedSquare, to: square };
      const possibleMoves = game.moves({ square: selectedSquare, verbose: true });
      const foundMove = possibleMoves.find((m) => m.to === square);

      if (foundMove && foundMove.promotion) {
        setPromotionMove(move);
        setShowPromotionOptions(true);
      } else if (foundMove) {
        game.move(move);
        setLastMove({ from: selectedSquare, to: square });
        updateStatusAndHistory(foundMove);
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

  const onDrop = (sourceSquare, targetSquare) => {
    if (isBotThinking || game.turn() === "b") return false;

    const possibleMoves = game.moves({ square: sourceSquare, verbose: true });
    const move = possibleMoves.find((m) => m.to === targetSquare);
    if (!move) return false;

    if (move.promotion) {
      setPromotionMove({ from: sourceSquare, to: targetSquare });
      setShowPromotionOptions(true);
      return false;
    }
    game.move({ from: sourceSquare, to: targetSquare });
    setLastMove({ from: sourceSquare, to: targetSquare });
    updateStatusAndHistory(move);
    return true;
  };

  const promotePawn = (piece) => {
    if (!promotionMove) return;
    game.move({ from: promotionMove.from, to: promotionMove.to, promotion: piece });
    setLastMove({ from: promotionMove.from, to: promotionMove.to });
    setShowPromotionOptions(false);
    setPromotionMove(null);
    updateStatusAndHistory(game.history({ verbose: true }).slice(-1)[0]);
  };

  const updateStatusAndHistory = (moveData) => {
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        const winner = game.turn() === "w" ? "Black" : "White";
        setStatus(`Checkmate! ${winner} wins`);
        if (winner === "Black") {
          setShowBotWinsModal(true); // Hiển thị modal khi bot (đen) thắng
        }
      } else if (game.isDraw()) {
        setStatus("Draw!");
      }
    } else {
      setStatus(`${game.turn() === "w" ? "White" : "Black"} to move`);
    }
    if (moveData) {
      const moveNotation = `${moveData.san}`;
      const player = moveData.color === 'w' ? 'Player' : 'Bot';
      setMoveHistory(prev => [...prev, { move: moveNotation, player }]);
    }
  };

  const newGame = () => {
    if (moveHistory.length > 0 || game.fen() !== 'start') setShowResetModal(true);
    else resetGame();
  };

  const resetGame = () => {
    game.reset();
    setStatus("White to move");
    setSelectedSquare(null);
    setValidMoves([]);
    setShowPromotionOptions(false);
    setPromotionMove(null);
    setMoveHistory([]);
    setLastMove(null);
    setShowResetModal(false);
    if (selectedBot === 'stockfish' && stockfishRef.current) {
      stockfishRef.current.postMessage('ucinewgame');
      stockfishRef.current.postMessage('isready');
    }
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
    validMoves.forEach((square) => styles[square] = { backgroundColor: "rgba(0, 255, 0, 0.4)" });
    if (selectedSquare) styles[selectedSquare] = { backgroundColor: "rgba(255, 255, 0, 0.4)" };
    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: "rgba(0, 255, 0, 0.6)" };
      styles[lastMove.to] = { backgroundColor: "rgba(0, 255, 0, 0.6)" };
    }
    return styles;
  };

  const confirmExit = () => {
    if (nextPath) navigate(nextPath);
    setShowExitModal(false);
    setNextPath(null);
  };

  const handleSkillLevelChange = (level) => {
    setSkillLevel(level);
    if (selectedBot === 'stockfish' && stockfishRef.current) {
      stockfishRef.current.postMessage(`setoption name Skill Level value ${level}`);
    }
  };

  const closeBotWinsModal = () => {
    setShowBotWinsModal(false);
  };

  return (
    <div className="relative overflow-x-hidden min-h-screen font-sans bg-gradient-to-br from-gray-900 via-rose-950 to-black">
      {/* Navbar */}
      <nav className="bg-rose-900/90 shadow-[0_0_15px_rgba(251,113,133,0.5)] py-3 z-50 rounded-b-xl max-w-7xl mx-auto mt-2 backdrop-blur-md">
        <ul className="flex justify-between items-center list-none px-4 md:px-6">
          <li>
            <Link to="/">
              <img
                src={logo}
                alt="Chess Logo"
                className="h-12 md:h-16 w-auto transition-transform duration-300 hover:scale-110"
                style={{ filter: `drop-shadow(0 0 10px rgba(251,113,133,0.8))` }}
              />
            </Link>
          </li>
          <li className="flex-1 text-center">
            <Link
              to="/"
              className="text-rose-400 hover:text-rose-200 hover:drop-shadow-[0_0_8px_rgba(251,113,133,0.8)] font-semibold text-base md:text-lg transition-all duration-300"
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
                  className="w-10 h-10 rounded-full cursor-pointer transition-all duration-300 hover:scale-110"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                />
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-rose-900 rounded-md shadow-lg py-1 z-50 border border-rose-500/50">
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

      {/* Main Content */}
      <div className="flex flex-col items-center min-h-screen p-4">
        <h1 className="text-5xl font-bold text-rose-300 mb-6 drop-shadow-[0_0_10px_rgba(251,113,133,0.7)]">
          Chess vs Bot
        </h1>

        {stockfishError && (
          <div className="mb-4 text-rose-200 bg-rose-900/80 p-4 rounded-lg shadow-[0_0_15px_rgba(251,113,133,0.5)]">
            {stockfishError}
          </div>
        )}

        <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-0">
          <div className="w-full lg:w-2/3 flex flex-col items-center">
            <div style={{ width: boardWidth, height: boardWidth }}>
              <Chessboard
                position={game.fen()}
                onPieceDrop={onDrop}
                onSquareClick={onSquareClick}
                boardWidth={boardWidth}
                customSquareStyles={customSquareStyles()}
                customLightSquareStyle={{ backgroundColor: "white" }}
                customDarkSquareStyle={{ backgroundColor: "#BA5536" }}
                animationDuration={300}
                draggable={true}
              />
            </div>
          </div>

          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <div
              style={{ height: boardWidth / 1.3 }}
              className="bg-rose-900/80 rounded-2xl shadow-[0_0_15px_rgba(251,113,133,0.5)] border border-rose-500/50 p-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(251,113,133,0.7)]"
            >
              {/* Select Bot và Bot Level */}
              <div className="mb-4 flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <label className="text-rose-200">Select Bot:</label>
                  <select
                    value={selectedBot}
                    onChange={(e) => {
                      setSelectedBot(e.target.value);
                      if (e.target.value === 'stockfish' && stockfishRef.current) {
                        stockfishRef.current.postMessage(`setoption name Skill Level value ${skillLevel}`);
                      }
                    }}
                    className="p-2 border rounded bg-rose-800/80 border-rose-500/50 text-rose-100 placeholder-rose-400/50 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-rose-700/80 transition-all duration-300 shadow-[inset_0_0_8px_rgba(251,113,133,0.3)]"
                  >
                    <option value="custom">Custom Bot</option>
                    <option value="stockfish" disabled={!!stockfishError}>
                      Stockfish {stockfishError ? "(Unavailable)" : ""}
                    </option>
                  </select>
                </div>
                {selectedBot === 'stockfish' && !stockfishError && (
                  <div className="flex flex-col gap-2">
                    <label className="text-rose-200">Bot Level (Elo: {elo})</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={skillLevel}
                      onChange={(e) => handleSkillLevelChange(parseInt(e.target.value))}
                      className="w-full h-2 bg-rose-800 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #f87171 ${skillLevel * 5}%, #4b5563 ${skillLevel * 5}%)`,
                      }}
                    />
                    <div className="text-rose-200 text-sm">Difficulty: {difficulty}</div>
                  </div>
                )}
              </div>

              {/* Move History */}
              <h3 className="text-lg font-semibold text-rose-300 mb-3 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]">
                Move History
              </h3>
              <div className="grid grid-cols-2 gap-2 overflow-y-auto" style={{ maxHeight: (boardWidth / 2 - 16) - 120 }}>
                <div className="text-rose-200 font-semibold">White</div>
                <div className="text-rose-200 font-semibold">Black</div>
                {moveHistory.map((move, index) => {
                  const isWhiteMove = move.player === 'Player';
                  return (
                    <React.Fragment key={index}>
                      <div className="text-rose-200 text-sm">
                        {isWhiteMove ? `Move ${Math.floor(index / 2) + 1}: ${move.move}` : ''}
                      </div>
                      <div className="text-rose-200 text-sm">
                        {!isWhiteMove ? `Move ${Math.floor(index / 2) + 1}: ${move.move}` : ''}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            <div className="text-lg text-rose-200">{isBotThinking ? "Bot is thinking..." : status}</div>
            <button
              onClick={newGame}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-lg shadow-[0_0_15px_rgba(251,113,133,0.7)] hover:from-rose-700 hover:to-rose-600 hover:scale-105 hover:shadow-[0_0_25px_rgba(251,113,133,0.9)] transition-all duration-300"
            >
              New Game
            </button>
          </div>
        </div>
      </div>

      {/* Modal khi bot thắng */}
      {showBotWinsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-rose-900/80 border border-rose-500/50 rounded-2xl shadow-[0_0_20px_rgba(251,113,133,0.6)] p-6 max-w-md w-full backdrop-blur-lg">
            <div className="flex justify-end mb-4">
              <button
                onClick={closeBotWinsModal}
                className="text-rose-200 hover:text-rose-100 transition-colors duration-300"
              >
                ×
              </button>
            </div>
            <h2 className="text-2xl font-bold text-rose-300 mb-4 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]">
              Bot Wins!
            </h2>
            <p className="text-rose-200 mb-6  text-center">
              Bot: I knew you couldn’t beat me!
            </p>
            <div className="flex justify-center mb-6">
              <img
                src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/18DogKnight/phpXLOHUb.jpg" // Thay bằng link ảnh meme của bạn
                alt="Bot Wins Meme"
                className="max-w-full h-auto rounded-lg shadow-[0_0_15px_rgba(251,113,133,0.5)]"
                style={{ maxHeight: '200px' }}
              />
            </div>
            <button
              onClick={closeBotWinsModal}
              className="bg-gradient-to-r from-rose-600 to-rose-500 text-white py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(251,113,133,0.7)] hover:from-rose-700 hover:to-rose-600 hover:scale-105 hover:shadow-[0_0_25px_rgba(251,113,133,0.9)] transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal Promotion */}
      {showPromotionOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-rose-900/80 border border-rose-500/50 rounded-2xl shadow-[0_0_20px_rgba(251,113,133,0.6)] p-6 max-w-md w-full backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-rose-300 mb-4 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]">
              Promote Pawn
            </h2>
            <div className="flex gap-2">
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
          </div>
        </div>
      )}

      {/* Modal Reset */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-rose-900/80 border border-rose-500/50 rounded-2xl shadow-[0_0_20px_rgba(251,113,133,0.6)] p-6 max-w-md w-full backdrop-blur-lg">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowResetModal(false)}
                className="text-rose-200 hover:text-rose-100 transition-colors duration-300"
              >
                ×
              </button>
            </div>
            <h2 className="text-2xl font-bold text-rose-300 mb-4 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]">
              Confirm Reset
            </h2>
            <p className="text-rose-200 mb-6">
              Are you sure? All game progress will be lost.
            </p>
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-rose-600 to-rose-500 text-white py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(251,113,133,0.7)] hover:from-rose-700 hover:to-rose-600 hover:scale-105 hover:shadow-[0_0_25px_rgba(251,113,133,0.9)] transition-all duration-300"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Modal Exit */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-rose-900/80 border border-rose-500/50 rounded-2xl shadow-[0_0_20px_rgba(251,113,133,0.6)] p-6 max-w-md w-full backdrop-blur-lg">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => { setShowExitModal(false); setNextPath(null); }}
                className="text-rose-200 hover:text-rose-100 transition-colors duration-300"
              >
                ×
              </button>
            </div>
            <h2 className="text-2xl font-bold text-rose-300 mb-4 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]">
              Warning
            </h2>
            <p className="text-rose-200 mb-6">
              Are you sure you want to leave this page? All game progress will be lost.
            </p>
            <button
              onClick={confirmExit}
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