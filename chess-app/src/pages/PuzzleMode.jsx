import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import logo from "./1.png";

function PuzzleMode() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [nextPath, setNextPath] = useState(null);
  const [score, setScore] = useState(parseInt(localStorage.getItem("puzzleScore")) || 0);

  // Danh sách thế cờ (đơn giản, chiếu bí trong 1 nước)
  const puzzles = [
    {
      id: 1,
      fen: "6k1/7p/8/8/8/8/5Q2/7K w - - 0 1",
      description: "Trắng đi, chiếu bí trong 1 nước",
      maxMoves: 1,
      points: 10,
      solution: ["Qf8"],
      opponentMoves: [],
      hintDetails: [
        "Nước 1: Qf8#. Hậu trắng từ f2 đến f8, đặt Vua đen ở g8 vào thế chiếu bí. Không có quân nào chặn, và Vua đen không thể di chuyển.",
      ],
    },
    {
      id: 2,
      fen: "6k1/7p/8/8/8/5R2/8/6K1 w - - 0 1",
      description: "Trắng đi, chiếu bí trong 1 nước",
      maxMoves: 1,
      points: 10,
      solution: ["Rh8"],
      opponentMoves: [],
      hintDetails: [
        "Nước 1: Rh8#. Xe trắng từ f6 đến h8, đặt Vua đen ở g8 vào thế chiếu bí. Không có quân nào chặn, và Vua đen không thể di chuyển.",
      ],
    },
    {
      id: 3,
      fen: "6k1/7p/8/8/8/5B2/8/6K1 w - - 0 1",
      description: "Trắng đi, chiếu bí trong 1 nước",
      maxMoves: 1,
      points: 10,
      solution: ["Bh8"],
      opponentMoves: [],
      hintDetails: [
        "Nước 1: Bh8#. Tượng trắng từ f6 đến h8, đặt Vua đen ở g8 vào thế chiếu bí. Không có quân nào chặn, và Vua đen không thể di chuyển.",
      ],
    },
    {
      id: 4,
      fen: "6k1/8/8/8/8/5q2/8/6K1 b - - 0 1",
      description: "Đen đi, chiếu bí trong 1 nước",
      maxMoves: 1,
      points: 10,
      solution: ["Qh2"],
      opponentMoves: [],
      hintDetails: [
        "Nước 1: Qh2#. Hậu đen từ f6 đến h2, đặt Vua trắng ở g1 vào thế chiếu bí. Không có quân nào chặn, và Vua trắng không thể di chuyển.",
      ],
    },
    {
      id: 5,
      fen: "6k1/8/8/8/8/5r2/8/6K1 b - - 0 1",
      description: "Đen đi, chiếu bí trong 1 nước",
      maxMoves: 1,
      points: 10,
      solution: ["Rh1"],
      opponentMoves: [],
      hintDetails: [
        "Nước 1: Rh1#. Xe đen từ f6 đến h1, đặt Vua trắng ở g1 vào thế chiếu bí. Không có quân nào chặn, và Vua trắng không thể di chuyển.",
      ],
    },
  ];

  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [game, setGame] = useState(new Chess(puzzles[0].fen));
  const [status, setStatus] = useState(puzzles[0].description);
  const [moveCount, setMoveCount] = useState(0);
  const [moveHistory, setMoveHistory] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);

  // Kiểm tra trạng thái đăng nhập và xử lý điều hướng
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    console.log(game.fen())

    const handleBeforeUnload = (event) => {
      if (moveHistory.length > 0) {
        const confirmationMessage = "Bạn có chắc muốn rời khỏi trang này? Mọi dữ liệu về thế cờ sẽ bị mất.";
        (event || window.event).returnValue = confirmationMessage;
        return confirmationMessage;
      }
    };

    const handleNavigation = (event, path = null) => {
      if (moveHistory.length > 0) {
        event.preventDefault();
        setNextPath(path || event.target.pathname || "/");
        setShowExitModal(true);
      } else if (path) {
        navigate(path);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handleNavigation);

    const links = document.querySelectorAll("a");
    links.forEach((link) => {
      link.addEventListener("click", (e) => handleNavigation(e, link.getAttribute("href")));
    });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleNavigation);
      links.forEach((link) => {
        link.removeEventListener("click", handleNavigation);
      });
    };
  }, [moveHistory, navigate]);

  // Cập nhật game khi chuyển thế cờ
  useEffect(() => {
    const newGame = new Chess(puzzles[currentPuzzleIndex].fen);
    setGame(newGame);
    setStatus(puzzles[currentPuzzleIndex].description);
    setMoveCount(0);
    setMoveHistory([]);
    setSelectedSquare(null);
    setValidMoves([]);
    setShowHint(false);
    setShowSolutionModal(false);
    setIsPuzzleSolved(false);
  }, [currentPuzzleIndex]);

  // Xử lý nước đi của người chơi và đối thủ tự động đi
  const handleMove = (move, sanMove) => {
    game.move(move);
    setMoveHistory((prev) => [...prev, { move: sanMove, player: "Player" }]);
    setMoveCount((prev) => prev + 1);

    const currentMoveIndex = moveCount;
    const correctMove = puzzles[currentPuzzleIndex].solution[currentMoveIndex];

    if (sanMove === correctMove) {
      if (game.isCheckmate()) {
        setStatus("Chúc mừng! Bạn đã giải đúng thế cờ!");
        setIsPuzzleSolved(true);
        const points = puzzles[currentPuzzleIndex].points;
        setScore((prev) => {
          const newScore = prev + points;
          localStorage.setItem("puzzleScore", newScore);
          return newScore;
        });
      } else if (moveCount + 1 >= puzzles[currentPuzzleIndex].maxMoves) {
        setStatus("Sai rồi! Bạn đã vượt quá số nước đi cho phép.");
        setShowSolutionModal(true);
      } else {
        setStatus("Đúng rồi! Tiếp tục...");
        // Đối thủ tự động đi nếu chưa hết số nước tối đa
        if (currentMoveIndex < puzzles[currentPuzzleIndex].opponentMoves.length) {
          const opponentMove = puzzles[currentPuzzleIndex].opponentMoves[currentMoveIndex];
          game.move(opponentMove);
          setMoveHistory((prev) => [...prev, { move: opponentMove, player: "Opponent" }]);
        }
      }
    } else {
      setStatus("Nước đi sai! Thử lại hoặc xem gợi ý.");
      game.undo();
      setMoveHistory((prev) => prev.slice(0, -1));
      setMoveCount((prev) => prev - 1);
    }
  };

  const onSquareClick = (square) => {
    if (isPuzzleSolved) return;

    if (selectedSquare) {
      const move = { from: selectedSquare, to: square };
      const possibleMoves = game.moves({ square: selectedSquare, verbose: true });
      const foundMove = possibleMoves.find((m) => m.to === square);

      if (foundMove) {
        handleMove(move, foundMove.san);
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
    if (isPuzzleSolved) return false;

    const possibleMoves = game.moves({ square: sourceSquare, verbose: true });
    const move = possibleMoves.find((m) => m.to === targetSquare);

    if (!move) return false;

    handleMove(move, move.san);
    return true;
  };

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

  const showHintHandler = () => {
    setShowHint(true);
    const currentHint = puzzles[currentPuzzleIndex].hintDetails[moveCount];
    setStatus(currentHint);
  };

  const nextPuzzle = () => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex((prev) => prev + 1);
    }
  };

  const prevPuzzle = () => {
    if (currentPuzzleIndex > 0) {
      setCurrentPuzzleIndex((prev) => prev - 1);
    }
  };

  const resetPuzzle = () => {
    const newGame = new Chess(puzzles[currentPuzzleIndex].fen);
    setGame(newGame);
    setStatus(puzzles[currentPuzzleIndex].description);
    setMoveCount(0);
    setMoveHistory([]);
    setSelectedSquare(null);
    setValidMoves([]);
    setShowHint(false);
    setShowSolutionModal(false);
    setIsPuzzleSolved(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    setIsLoggedIn(false);
    setDropdownOpen(false);
  };

  const handleViewProfile = () => {
    navigate("/profile");
    setDropdownOpen(false);
  };

  const confirmExit = () => {
    if (nextPath) {
      navigate(nextPath);
    }
    setShowExitModal(false);
    setNextPath(null);
  };

  return (
    <div className="relative overflow-x-hidden min-h-screen font-sans bg-gradient-to-br from-gray-900 via-rose-950 to-black">
      {/* Navbar */}
      <nav className="bg-rose-900/90 shadow-[0_0_15px_rgba(251,113,133,0.5)] py-3 z-50 rounded-b-xl max-w-7xl mx-auto mt-2 backdrop-blur-md transition-colors duration-500 ease-in-out">
        <ul className="flex justify-between items-center list-none px-4 md:px-6">
          <li>
            <Link to="/">
              <img src={logo} alt="Chess Logo" className="h-12 md:h-16 w-auto transition-transform duration-300 hover:scale-110" style={{ filter: `drop-shadow(0_0_10px_rgba(251,113,133,0.8))` }} />
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
                <img
                  src="https://store.playstation.com/store/api/chihiro/00_09_000/container/IE/en/99/EP4037-SLES51630_00-AVPLAYITCH000002/0/image?_version=00_09_000&platform=chihiro&bg_color=000000&opacity=100&w=720&h=720"
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full cursor-pointer transition-all duration-300 hover:scale-110"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                />
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50">
                    <button onClick={handleViewProfile} className="block w-full text-left px-4 py-2 text-rose-200 hover:bg-rose-800 hover:text-rose-100 transition-all duration-300">
                      View Profile
                    </button>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-rose-200 hover:bg-rose-800 hover:text-rose-100 transition-all duration-300">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-4">
                <Link to="/register" className="text-rose-400 hover:text-rose-200 hover:drop-shadow-[0_0_8px_rgba(251,113,133,0.8)] font-semibold text-base md:text-lg transition-all duration-300">
                  Register
                </Link>
                <Link to="/login" className="text-rose-400 hover:text-rose-200 hover:drop-shadow-[0_0_8px_rgba(251,113,133,0.8)] font-semibold text-base md:text-lg transition-all duration-300">
                  Login
                </Link>
              </div>
            )}
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center min-h-screen p-4">
        <h1 className="text-xl font-semibold text-rose-300 mb-6 drop-shadow-[0_0_10px_rgba(251,113,133,0.7)]">Chế độ giải thế cờ</h1>

        {/* Hiển thị điểm số */}
        <div className="mb-4 text-lg text-rose-200">
          Điểm của bạn: <span className="font-bold">{score}</span>
        </div>

        {/* Bảng cờ */}
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick}
          boardWidth={600}
          customSquareStyles={customSquareStyles()}
          customBoardStyle={{ position: "static", zIndex: 10, margin: "0 auto" }}
        />

        {/* Nút điều khiển */}
        <div className="mt-4 flex gap-4">
          <button
            onClick={prevPuzzle}
            disabled={currentPuzzleIndex === 0}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-lg shadow-[0_0_15px_rgba(251,113,133,0.7)] hover:from-rose-700 hover:to-rose-600 hover:scale-105 hover:shadow-[0_0_25px_rgba(251,113,133,0.9)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Thế cờ trước
          </button>
          <button
            onClick={resetPuzzle}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-lg shadow-[0_0_15px_rgba(251,113,133,0.7)] hover:from-rose-700 hover:to-rose-600 hover:scale-105 hover:shadow-[0_0_25px_rgba(251,113,133,0.9)] transition-all duration-300"
          >
            Chơi lại
          </button>
          <button
            onClick={showHintHandler}
            disabled={showHint || isPuzzleSolved}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-lg shadow-[0_0_15px_rgba(251,113,133,0.7)] hover:from-rose-700 hover:to-rose-600 hover:scale-105 hover:shadow-[0_0_25px_rgba(251,113,133,0.9)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Gợi ý
          </button>
          <button
            onClick={nextPuzzle}
            disabled={currentPuzzleIndex === puzzles.length - 1}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-lg shadow-[0_0_15px_rgba(251,113,133,0.7)] hover:from-rose-700 hover:to-rose-600 hover:scale-105 hover:shadow-[0_0_25px_rgba(251,113,133,0.9)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Thế cờ tiếp theo
          </button>
        </div>

        {/* Trạng thái và lịch sử nước đi */}
        <div className="mt-4 text-lg text-rose-200">{status}</div>
        <div className="w-full max-w-5xl mt-6 bg-gray-900/80 rounded-xl shadow-[0_0_15px_rgba(251,113,133,0.5)] backdrop-blur-lg border border-rose-500/50 p-4 h-48 overflow-y-auto">
          <h3 className="text-xl font-bold text-rose-300 mb-2 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]">Lịch sử nước đi</h3>
          <div className="grid grid-cols-1 gap-2">
            {moveHistory.map((move, index) => (
              <div key={index} className="text-rose-200 text-sm">
                Nước {index + 1}: {move.move} ({move.player})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal hiển thị đáp án nếu sai */}
      {showSolutionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900/80 border border-rose-500/50 rounded-2xl shadow-[0_0_20px_rgba(251,113,133,0.6)] p-6 max-w-md w-full backdrop-blur-lg">
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowSolutionModal(false)} className="text-rose-200 hover:text-rose-100 transition-colors duration-300">
                ×
              </button>
            </div>
            <h2 className="text-2xl font-bold text-rose-300 mb-4 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]">Đáp án</h2>
            <p className="text-rose-200 mb-6">
              Các nước đi đúng là: {puzzles[currentPuzzleIndex].solution.join(", ")}.
            </p>
            <button
              onClick={() => {
                setShowSolutionModal(false);
                resetPuzzle();
              }}
              className="bg-gradient-to-r from-rose-600 to-rose-500 text-white py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(251,113,133,0.7)] hover:from-rose-700 hover:to-rose-600 hover:scale-105 hover:shadow-[0_0_25px_rgba(251,113,133,0.9)] transition-all duration-300"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Modal xác nhận thoát */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900/80 border border-rose-500/50 rounded-2xl shadow-[0_0_20px_rgba(251,113,133,0.6)] p-6 max-w-md w-full backdrop-blur-lg">
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowExitModal(false)} className="text-rose-200 hover:text-rose-100 transition-colors duration-300">
                ×
              </button>
            </div>
            <h2 className="text-2xl font-bold text-rose-300 mb-4 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]">Cảnh Báo</h2>
            <p className="text-rose-200 mb-6">Bạn có chắc muốn rời khỏi trang này? Mọi dữ liệu về thế cờ sẽ bị mất.</p>
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

export default PuzzleMode;