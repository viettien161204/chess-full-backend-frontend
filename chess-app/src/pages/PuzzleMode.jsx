import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import logo from "./1.png";

function PuzzleMode() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [nextPath, setNextPath] = useState(null);
  const [score, setScore] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);

  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [game, setGame] = useState(null);
  const [status, setStatus] = useState("Đang tải thế cờ...");
  const [moveCount, setMoveCount] = useState(0);
  const [moveHistory, setMoveHistory] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const [playerColor, setPlayerColor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMoveGuide, setShowMoveGuide] = useState(false);
  const [arrows, setArrows] = useState([]);
  const [usedHintOrGuide, setUsedHintOrGuide] = useState(false);

  // Hàm lấy thông tin người dùng từ backend
  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    if (!token || !userEmail) {
      setScore(null);
      setIsLoadingScore(false);
      return;
    }

    setIsLoadingScore(true);
    try {
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const users = await response.json();
      console.log("Dữ liệu người dùng từ API:", users);
      const user = users.find((u) => u.email === userEmail);
      if (user) {
        setUserId(user.id);
        setScore(user.score || 100);
      } else {
        throw new Error("Không tìm thấy thông tin người dùng với email: " + userEmail);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      setScore(null);
    } finally {
      setIsLoadingScore(false);
    }
  };

  // Hàm cập nhật điểm số lên backend (Thay đổi từ PATCH sang PUT)
  const updateUserScore = async (newScore) => {
    const token = localStorage.getItem("token");
    if (!token || !userId) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT", // Thay đổi từ PATCH sang PUT
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score: newScore }),
      });
      if (!response.ok) throw new Error("Không thể cập nhật điểm số");
      setScore(newScore);
    } catch (error) {
      console.error("Lỗi khi cập nhật điểm số:", error);
    }
  };

  const fetchRandomPuzzle = async () => {
    setIsLoading(true);
    let validPuzzle = false;
    let puzzle, chess;

    while (!validPuzzle) {
      try {
        const offset = Math.floor(Math.random() * 4800453);
        const response = await fetch(
          `https://datasets-server.huggingface.co/rows?dataset=Lichess/chess-puzzles&config=default&split=train&offset=${offset}&length=1`
        );
        if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu từ Hugging Face");
        const data = await response.json();
        const row = data.rows[0].row;

        const moves = row.Moves.split(" ");
        chess = new Chess(row.FEN);

        for (let i = 0; i < moves.length; i++) {
          chess.move({ from: moves[i].slice(0, 2), to: moves[i].slice(2, 4) });
        }

        if (chess.isCheckmate()) {
          validPuzzle = true;

          chess = new Chess(row.FEN);
          const opponentFirstMove = moves[0];
          try {
            chess.move({ from: opponentFirstMove.slice(0, 2), to: opponentFirstMove.slice(2, 4) });
          } catch (error) {
            console.error("Nước đi đầu tiên không hợp lệ:", error);
            validPuzzle = false;
            continue;
          }

          const remainingMoves = moves.slice(1);
          const playerMoves = remainingMoves.filter((_, i) => i % 2 === 0);
          const opponentMoves = remainingMoves.filter((_, i) => i % 2 !== 0);

          puzzle = {
            id: row.PuzzleId,
            initialFen: row.FEN,
            fen: chess.fen(),
            description: `${row.Rating} rating - Giải trong ${playerMoves.length} nước`,
            maxMoves: playerMoves.length,
            points: Math.floor(row.Rating / 100) * 5,
            solution: remainingMoves,
            opponentMoves,
            playerMoves,
            hintDetails: [`Gợi ý: Bắt đầu bằng ${playerMoves[0]}`],
          };
        }
      } catch (error) {
        console.error("Lỗi khi lấy puzzle từ Hugging Face:", error);
        setStatus("Không thể tải thế cờ. Vui lòng thử lại.");
        setIsLoading(false);
        return;
      }
    }

    setCurrentPuzzle(puzzle);
    setGame(chess);
    setPlayerColor(chess.turn());
    setStatus(
      `${puzzle.description.split(" - ")[0]} - Bạn đi quân ${
        chess.turn() === "w" ? "Trắng" : "Đen"
      } - Cần ${puzzle.maxMoves} nước để chiếu bí`
    );
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUserData();
    fetchRandomPuzzle();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (moveHistory.length > 0) {
        event.returnValue = "Bạn có chắc muốn rời khỏi trang này? Mọi dữ liệu về thế cờ sẽ bị mất.";
        return event.returnValue;
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
      links.forEach((link) => link.removeEventListener("click", handleNavigation));
    };
  }, [moveHistory, navigate]);

  const getOpponentMove = () => {
    const possibleMoves = game.moves({ verbose: true });
    if (possibleMoves.length === 0) return null;
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  };

  const handleMove = (move, sanMove) => {
    if (!game || !currentPuzzle || isPuzzleSolved) return;

    game.move(move);
    setMoveHistory((prev) => [...prev, { move: sanMove, player: "Player" }]);
    setMoveCount((prev) => prev + 1);

    const currentPlayerMoveIndex = moveCount;
    const correctMove = currentPuzzle.playerMoves[currentPlayerMoveIndex];
    const remainingMoves = currentPuzzle.maxMoves - currentPlayerMoveIndex - 1;

    if (move.from + move.to === correctMove) {
      if (game.isCheckmate()) {
        setStatus("Chúc mừng! Bạn đã giải đúng thế cờ!");
        setIsPuzzleSolved(true);
        if (!usedHintOrGuide && isLoggedIn) {
          const points = currentPuzzle.points;
          const newScore = (score || 100) + points;
          updateUserScore(newScore);
        }
      } else {
        let opponentMove = currentPuzzle.opponentMoves[currentPlayerMoveIndex];
        if (!opponentMove) {
          const autoMove = getOpponentMove();
          if (autoMove) {
            opponentMove = autoMove.from + autoMove.to;
            currentPuzzle.opponentMoves[currentPlayerMoveIndex] = opponentMove;
          } else {
            setStatus("Đối thủ không còn nước đi hợp lệ!");
            setIsPuzzleSolved(true);
            return;
          }
        }

        setTimeout(() => {
          game.move({ from: opponentMove.slice(0, 2), to: opponentMove.slice(2, 4) });
          setMoveHistory((prev) => [...prev, { move: opponentMove, player: "Opponent" }]);
          if (game.isCheckmate()) {
            setStatus("Chúc mừng! Bạn đã giải đúng thế cờ!");
            setIsPuzzleSolved(true);
            if (!usedHintOrGuide && isLoggedIn) {
              const points = currentPuzzle.points;
              const newScore = (score || 100) + points;
              updateUserScore(newScore);
            }
          } else {
            setStatus(
              `Đúng rồi! Đến lượt bạn... - Cần ${remainingMoves} nước để chiếu bí`
            );
          }
        }, 500);
      }
    } else {
      setStatus("Nước đi sai! Thử lại hoặc xem gợi ý.");
      game.undo();
      setMoveHistory((prev) => prev.slice(0, -1));
      setMoveCount((prev) => prev - 1);
    }
  };

  const onSquareClick = (square) => {
    if (isPuzzleSolved || !game) return;

    if (selectedSquare) {
      const move = { from: selectedSquare, to: square };
      const possibleMoves = game.moves({ square: selectedSquare, verbose: true });
      const foundMove = possibleMoves.find((m) => m.to === square);

      if (foundMove) {
        handleMove(foundMove, foundMove.san);
      }
      setSelectedSquare(null);
      setValidMoves([]);
      setArrows([]);
    } else {
      const moves = game.moves({ square, verbose: true });
      if (moves.length > 0) {
        setSelectedSquare(square);
        setValidMoves(moves.map((m) => m.to));
      }
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    if (isPuzzleSolved || !game) return false;

    const possibleMoves = game.moves({ square: sourceSquare, verbose: true });
    const move = possibleMoves.find((m) => m.to === targetSquare);

    if (!move) return false;

    handleMove(move, move.san);
    setArrows([]);
    return true;
  };

  const onSquareRightClick = (square) => {
    if (selectedSquare) {
      setArrows([[selectedSquare, square]]);
    }
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
    setUsedHintOrGuide(true);
    setStatus(currentPuzzle.hintDetails[moveCount]);
  };

  const showMoveGuideHandler = () => {
    setShowMoveGuide(true);
    setUsedHintOrGuide(true);
  };

  const nextPuzzle = () => {
    fetchRandomPuzzle();
    setMoveCount(0);
    setMoveHistory([]);
    setSelectedSquare(null);
    setValidMoves([]);
    setShowHint(false);
    setShowSolutionModal(false);
    setIsPuzzleSolved(false);
    setShowMoveGuide(false);
    setArrows([]);
    setUsedHintOrGuide(false);
  };

  const resetPuzzle = () => {
    if (!currentPuzzle) return;

    const chess = new Chess(currentPuzzle.initialFen);
    const opponentFirstMove = currentPuzzle.solution[0];
    try {
      chess.move({ from: opponentFirstMove.slice(0, 2), to: opponentFirstMove.slice(2, 4) });
    } catch (error) {
      console.error("Không thể áp dụng nước đi đầu tiên:", error);
      setStatus("Lỗi khi reset thế cờ. Vui lòng thử thế cờ mới.");
      return;
    }

    setGame(chess);
    setStatus(
      `${currentPuzzle.description.split(" - ")[0]} - Bạn đi quân ${
        chess.turn() === "w" ? "Trắng" : "Đen"
      } - Cần ${currentPuzzle.maxMoves} nước để chiếu bí`
    );
    setMoveCount(0);
    setMoveHistory([]);
    setSelectedSquare(null);
    setValidMoves([]);
    setShowHint(false);
    setShowSolutionModal(false);
    setIsPuzzleSolved(false);
    setPlayerColor(chess.turn());
    setShowMoveGuide(false);
    setArrows([]);
    setUsedHintOrGuide(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setScore(null);
    setUserId(null);
    setDropdownOpen(false);
    navigate("/login");
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

  const renderMoveGuide = () => {
    if (!currentPuzzle || !showMoveGuide) return null;

    const allMoves = [];
    currentPuzzle.playerMoves.forEach((playerMove, index) => {
      allMoves.push({ move: playerMove, player: "Player" });
      if (currentPuzzle.opponentMoves[index]) {
        allMoves.push({ move: currentPuzzle.opponentMoves[index], player: "Opponent" });
      }
    });

    return (
      <div className="relative w-full max-w-[48%] bg-gradient-to-br from-[#2E2E2E] to-[#1C2526] rounded-xl shadow-[0_0_15px_rgba(192,192,192,0.5)] border border-[#C0C0C0] p-4 h-48 overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-[#E5E4E2] drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]">
            Hướng dẫn từng bước
          </h3>
          <button
            onClick={() => setShowMoveGuide(false)}
            className="text-[#C0C0C0] hover:text-[#E5E4E2] transition-colors duration-300"
          >
            ×
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {allMoves.map((step, index) => (
            <div
              key={index}
              className={`text-[#D3D3D3] text-sm ${
                index === moveHistory.length && !isPuzzleSolved
                  ? "bg-[#C0C0C0]/20 p-1 rounded"
                  : ""
              }`}
            >
              Bước {index + 1}: {step.move} ({step.player === "Player" ? "Bạn" : "Đối thủ"})
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative overflow-x-hidden min-h-screen font-sans bg-gradient-to-br from-[#1C2526] to-[#000000]">
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

      <div className="flex flex-col items-center min-h-screen p-4">
        <h1 className="text-5xl font-bold text-[#E5E4E2] mb-6 drop-shadow-[0_0_10px_rgba(192,192,192,0.7)]">
          Chế độ giải thế cờ
        </h1>
        <div className="mb-4 text-lg text-[#D3D3D3]">
          Điểm của bạn:{" "}
          {isLoggedIn ? (
            isLoadingScore ? (
              "Đang tải điểm..."
            ) : score !== null ? (
              <span className="font-bold">{score}</span>
            ) : (
              "Không thể tải điểm"
            )
          ) : (
            "Xin hãy đăng nhập để lưu điểm"
          )}
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
            <p className="text-[#D3D3D3] mt-4">Đang tải bàn cờ...</p>
          </div>
        ) : game ? (
          <div style={{ width: "550px", height: "550px" }}>
            <Chessboard
              position={game.fen()}
              onPieceDrop={onDrop}
              onSquareClick={onSquareClick}
              onSquareRightClick={onSquareRightClick}
              boardWidth={550}
              customSquareStyles={customSquareStyles()}
              customBoardStyle={{ position: "static", zIndex: 10, margin: "0 auto" }}
              boardOrientation={playerColor === "b" ? "black" : "white"}
              customArrows={arrows}
              customDarkSquareStyle={{ backgroundColor: "#4B7399" }}
              customLightSquareStyle={{ backgroundColor: "#EBECD0" }}
            />
          </div>
        ) : (
          <p className="text-[#D3D3D3]">Không thể tải bàn cờ.</p>
        )}

        <div className="mt-4 flex gap-4">
          <button
            onClick={resetPuzzle}
            className="px-4 py-2 bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9] text-[#1C2526] rounded-lg shadow-[0_0_15px_rgba(192,192,192,0.7)] hover:from-[#D3D3D3] hover:to-[#C0C0C0] hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.9)] transition-all duration-300"
          >
            Chơi lại
          </button>
          <button
            onClick={showHintHandler}
            disabled={showHint || isPuzzleSolved}
            className="px-4 py-2 bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9] text-[#1C2526] rounded-lg shadow-[0_0_15px_rgba(192,192,192,0.7)] hover:from-[#D3D3D3] hover:to-[#C0C0C0] hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.9)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Gợi ý
          </button>
          <button
            onClick={showMoveGuideHandler}
            disabled={showMoveGuide}
            className="px-4 py-2 bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9] text-[#1C2526] rounded-lg shadow-[0_0_15px_rgba(192,192,192,0.7)] hover:from-[#D3D3D3] hover:to-[#C0C0C0] hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.9)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hiển thị từng bước
          </button>
          <button
            onClick={nextPuzzle}
            className="px-4 py-2 bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9] text-[#1C2526] rounded-lg shadow-[0_0_15px_rgba(192,192,192,0.7)] hover:from-[#D3D3D3] hover:to-[#C0C0C0] hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.9)] transition-all duration-300"
          >
            Thế cờ tiếp theo
          </button>
        </div>

        <div className="mt-4 text-lg text-[#D3D3D3]">{status}</div>

        <div className="w-full max-w-5xl mt-6 flex gap-4">
          <div className="w-full max-w-[48%] bg-gradient-to-br from-[#2E2E2E] to-[#1C2526] rounded-xl shadow-[0_0_15px_rgba(192,192,192,0.5)] border border-[#C0C0C0] p-4 h-48 overflow-y-auto">
            <h3 className="text-xl font-bold text-[#E5E4E2] mb-2 drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]">
              Lịch sử nước đi
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {moveHistory.map((move, index) => (
                <div key={index} className="text-[#D3D3D3] text-sm">
                  Nước {index + 1}: {move.move} ({move.player})
                </div>
              ))}
            </div>
          </div>
          {renderMoveGuide()}
        </div>
      </div>

      {showSolutionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gradient-to-br from-[#2E2E2E] to-[#1C2526] border border-[#C0C0C0] rounded-2xl shadow-[0_0_20px_rgba(192,192,192,0.6)] p-6 max-w-md w-full backdrop-blur-lg">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowSolutionModal(false)}
                className="text-[#C0C0C0] hover:text-[#E5E4E2] transition-colors duration-300"
              >
                ×
              </button>
            </div>
            <h2 className="text-2xl font-bold text-[#E5E4E2] mb-4 drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]">
              Đáp án
            </h2>
            <p className="text-[#D3D3D3] mb-6">
              Các nước đi đúng là: {currentPuzzle.playerMoves.join(", ")}.
            </p>
            <button
              onClick={() => {
                setShowSolutionModal(false);
                resetPuzzle();
              }}
              className="bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9] text-[#1C2526] py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(192,192,192,0.7)] hover:from-[#D3D3D3] hover:to-[#C0C0C0] hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.9)] transition-all duration-300"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gradient-to-br from-[#2E2E2E] to-[#1C2526] border border-[#C0C0C0] rounded-2xl shadow-[0_0_20px_rgba(192,192,192,0.6)] p-6 max-w-md w-full backdrop-blur-lg">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowExitModal(false)}
                className="text-[#C0C0C0] hover:text-[#E5E4E2] transition-colors duration-300"
              >
                ×
              </button>
            </div>
            <h2 className="text-2xl font-bold text-[#E5E4E2] mb-4 drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]">
              Cảnh Báo
            </h2>
            <p className="text-[#D3D3D3] mb-6">
              Bạn có chắc muốn rời khỏi trang này? Mọi dữ liệu về thế cờ sẽ bị mất.
            </p>
            <button
              onClick={confirmExit}
              className="bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9] text-[#1C2526] py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(192,192,192,0.7)] hover:from-[#D3D3D3] hover:to-[#C0C0C0] hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.9)] transition-all duration-300"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default PuzzleMode;