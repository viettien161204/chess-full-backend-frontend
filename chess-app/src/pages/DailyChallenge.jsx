import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import axios from "axios";
import logo from "./1.png";

function DailyChallenge() {
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
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const [playerColor, setPlayerColor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [arrows, setArrows] = useState([]);
  const [hasSolvedToday, setHasSolvedToday] = useState(false);

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

  // Hàm cập nhật điểm số lên backend
  const updateUserScore = async (newScore) => {
    const token = localStorage.getItem("token");
    if (!token || !userId) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
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

  // Hàm chuyển đổi nước đi từ dạng UCI (e2e4) sang dạng đối tượng { from: 'e2', to: 'e4' }
  const uciToMoveObject = (uciMove) => {
    if (typeof uciMove !== "string" || uciMove.length < 4) {
      throw new Error(`Invalid UCI move: ${uciMove}`);
    }
    return {
      from: uciMove.slice(0, 2),
      to: uciMove.slice(2, 4),
    };
  };

  // Kiểm tra xem người chơi đã giải thế cờ hôm nay chưa (theo email)
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // Lấy ngày hiện tại (YYYY-MM-DD)
    const userEmail = localStorage.getItem("userEmail");
    const dailyChallengeData = JSON.parse(localStorage.getItem("dailyChallenge")) || {};

    // Nếu không có userEmail (chưa đăng nhập), không cho chơi
    if (!userEmail) {
      setStatus("Vui lòng đăng nhập để chơi Daily Challenge.");
      setIsLoading(false);
      return;
    }

    // Kiểm tra trạng thái theo email của tài khoản
    const userChallengeData = dailyChallengeData[userEmail] || {};

    if (userChallengeData.date === today) {
      if (userChallengeData.solved) {
        setHasSolvedToday(true);
        setIsLoading(false);
      }
      if (userChallengeData.puzzle) {
        // Nếu đã có puzzle cho ngày hôm nay, sử dụng lại
        const { puzzle, fen, playerColor } = userChallengeData;
        const chess = new Chess(fen);
        setCurrentPuzzle(puzzle);
        setGame(chess);
        setPlayerColor(playerColor);
        setStatus(
          `${puzzle.description.split(" - ")[0]} - Bạn đi quân ${
            chess.turn() === "w" ? "Trắng" : "Đen"
          } - Cần ${puzzle.maxMoves} nước để chiếu bí`
        );
        setIsLoading(false);
        return;
      }
    }
    // Nếu không có puzzle hoặc ngày khác, lấy puzzle mới
    fetchDailyPuzzle();
  }, []);

  // Lấy puzzle từ Hugging Face API và kiểm tra checkmate
  const fetchDailyPuzzle = async (offset = Math.floor(Math.random() * 3300000)) => {
    setIsLoading(true);
    let validPuzzle = false;
    let puzzle, chess;

    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      setStatus("Vui lòng đăng nhập để chơi Daily Challenge.");
      setIsLoading(false);
      return;
    }

    try {
      // Gọi API từ Hugging Face
      const response = await axios.get(
        `https://datasets-server.huggingface.co/rows?dataset=Lichess/chess-puzzles&config=default&split=train&offset=${offset}&length=1`
      );
      const data = response.data;

      // Kiểm tra xem data và data.rows có tồn tại không
      if (!data || !data.rows || data.rows.length === 0) {
        throw new Error("Dữ liệu từ API không hợp lệ: Thiếu trường 'rows'");
      }

      const puzzleData = data.rows[0].row;

      // Kiểm tra độ khó (rating từ 1500-2200)
      if (!puzzleData.Rating || puzzleData.Rating < 1500 || puzzleData.Rating > 2200) {
        return fetchDailyPuzzle(Math.floor(Math.random() * 3300000));
      }

      // Kiểm tra FEN hợp lệ
      const fen = puzzleData.FEN;
      if (!fen) {
        throw new Error("Dữ liệu từ API không hợp lệ: Thiếu trường 'FEN'");
      }
      const fenFields = fen.split(" ");
      if (fenFields.length !== 6) {
        throw new Error("Invalid FEN: must contain six space-delimited fields");
      }

      // Chuyển Moves từ chuỗi sang mảng
      const moves = puzzleData.Moves ? puzzleData.Moves.split(" ") : [];
      if (moves.length === 0) {
        throw new Error("Dữ liệu từ API không hợp lệ: Thiếu trường 'Moves'");
      }

      // Mô phỏng các nước đi để kiểm tra checkmate
      chess = new Chess(fen);
      let isDraw = false;
      for (let i = 0; i < moves.length; i++) {
        const move = uciToMoveObject(moves[i]);
        chess.move(move);

        // Kiểm tra các trường hợp hòa
        if (chess.isDraw() || chess.isStalemate() || chess.isInsufficientMaterial() || chess.isThreefoldRepetition()) {
          isDraw = true;
          break;
        }
      }

      // Nếu không dẫn đến checkmate hoặc có trường hợp hòa, lấy puzzle mới
      if (!chess.isCheckmate() || isDraw) {
        return fetchDailyPuzzle(Math.floor(Math.random() * 3300000));
      }

      // Reset bàn cờ để chuẩn bị cho người chơi
      chess = new Chess(fen);

      // Thực hiện nước đi đầu tiên của đối thủ (nếu có)
      if (moves.length > 0) {
        const firstMove = uciToMoveObject(moves[0]);
        chess.move(firstMove);
      }

      // Tách nước đi của người chơi và đối thủ
      const playerMoves = moves.slice(1).filter((_, i) => i % 2 === 0); // Bắt đầu từ nước thứ 2
      const opponentMoves = moves.slice(1).filter((_, i) => i % 2 !== 0);

      puzzle = {
        id: puzzleData.PuzzleId,
        initialFen: fen,
        fen: chess.fen(),
        description: `${puzzleData.Rating} rating - Giải trong ${playerMoves.length} nước`,
        maxMoves: playerMoves.length,
        points: Math.floor(puzzleData.Rating / 100) * 5,
        solution: moves,
        opponentMoves,
        playerMoves,
        themes: puzzleData.Themes, // Lưu thêm thông tin về chủ đề
      };

      validPuzzle = true;
    } catch (error) {
      console.error("Lỗi khi lấy puzzle từ Hugging Face:", error);
      setStatus("Không thể tải thế cờ. Vui lòng thử lại sau.");
      setIsLoading(false);
      return;
    }

    if (validPuzzle) {
      setCurrentPuzzle(puzzle);
      setGame(chess);
      setPlayerColor(chess.turn());
      setStatus(
        `${puzzle.description.split(" - ")[0]} - Bạn đi quân ${
          chess.turn() === "w" ? "Trắng" : "Đen"
        } - Cần ${puzzle.maxMoves} nước để chiếu bí`
      );
      setIsLoading(false);

      // Lưu puzzle vào localStorage theo email
      const today = new Date().toISOString().split("T")[0];
      const dailyChallengeData = JSON.parse(localStorage.getItem("dailyChallenge")) || {};
      dailyChallengeData[userEmail] = {
        date: today,
        puzzle: puzzle,
        fen: chess.fen(),
        playerColor: chess.turn(),
        solved: false,
      };
      localStorage.setItem("dailyChallenge", JSON.stringify(dailyChallengeData));
    }
  };

  // Xử lý khi người dùng cố gắng rời trang
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (moveHistory.length > 0 && !hasSolvedToday) {
        event.returnValue = "Bạn có chắc muốn rời khỏi trang này? Mọi dữ liệu về thế cờ sẽ bị mất.";
        return event.returnValue;
      }
    };

    const handleNavigation = (event, path = null) => {
      if (moveHistory.length > 0 && !hasSolvedToday) {
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
  }, [moveHistory, navigate, hasSolvedToday]);

  // Lấy nước đi của đối thủ
  const getOpponentMove = () => {
    const possibleMoves = game.moves({ verbose: true });
    if (possibleMoves.length === 0) return null;
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  };

  // Xử lý nước đi của người chơi
  const handleMove = (move, sanMove) => {
    if (!game || !currentPuzzle || isPuzzleSolved) return;

    game.move(move);
    setMoveHistory((prev) => [...prev, { move: sanMove, player: "Player" }]);
    setMoveCount((prev) => prev + 1);

    const currentPlayerMoveIndex = moveCount;
    const correctMove = currentPuzzle.playerMoves[currentPlayerMoveIndex];
    const remainingMoves = currentPuzzle.maxMoves - currentPlayerMoveIndex - 1;

    const moveUCI = move.from + move.to; // Chuyển nước đi của người chơi sang dạng UCI để so sánh
    if (moveUCI === correctMove) {
      if (game.isCheckmate()) {
        setStatus("Chúc mừng! Bạn đã giải đúng thế cờ!");
        setIsPuzzleSolved(true);
        if (isLoggedIn) {
          const points = currentPuzzle.points;
          const newScore = (score || 100) + points;
          updateUserScore(newScore);
        }
        // Lưu trạng thái đã giải hôm nay theo email
        const today = new Date().toISOString().split("T")[0];
        const userEmail = localStorage.getItem("userEmail");
        const dailyChallengeData = JSON.parse(localStorage.getItem("dailyChallenge")) || {};
        dailyChallengeData[userEmail] = {
          date: today,
          puzzle: currentPuzzle,
          fen: game.fen(),
          playerColor: playerColor,
          solved: true,
        };
        localStorage.setItem("dailyChallenge", JSON.stringify(dailyChallengeData));
        setHasSolvedToday(true);
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
            if (isLoggedIn) {
              const points = currentPuzzle.points;
              const newScore = (score || 100) + points;
              updateUserScore(newScore);
            }
            // Lưu trạng thái đã giải hôm nay theo email
            const today = new Date().toISOString().split("T")[0];
            const userEmail = localStorage.getItem("userEmail");
            const dailyChallengeData = JSON.parse(localStorage.getItem("dailyChallenge")) || {};
            dailyChallengeData[userEmail] = {
              date: today,
              puzzle: currentPuzzle,
              fen: game.fen(),
              playerColor: playerColor,
              solved: true,
            };
            localStorage.setItem("dailyChallenge", JSON.stringify(dailyChallengeData));
            setHasSolvedToday(true);
            return;
          }
        }

        setTimeout(() => {
          const opponentMoveObj = uciToMoveObject(opponentMove);
          game.move(opponentMoveObj);
          setMoveHistory((prev) => [...prev, { move: opponentMove, player: "Opponent" }]);
          if (game.isCheckmate()) {
            setStatus("Chúc mừng! Bạn đã giải đúng thế cờ!");
            setIsPuzzleSolved(true);
            if (isLoggedIn) {
              const points = currentPuzzle.points;
              const newScore = (score || 100) + points;
              updateUserScore(newScore);
            }
            // Lưu trạng thái đã giải hôm nay theo email
            const today = new Date().toISOString().split("T")[0];
            const userEmail = localStorage.getItem("userEmail");
            const dailyChallengeData = JSON.parse(localStorage.getItem("dailyChallenge")) || {};
            dailyChallengeData[userEmail] = {
              date: today,
              puzzle: currentPuzzle,
              fen: game.fen(),
              playerColor: playerColor,
              solved: true,
            };
            localStorage.setItem("dailyChallenge", JSON.stringify(dailyChallengeData));
            setHasSolvedToday(true);
          } else {
            setStatus(
              `Đúng rồi! Đến lượt bạn... - Cần ${remainingMoves} nước để chiếu bí`
            );
          }
        }, 500);
      }
    } else {
      setStatus("Nước đi sai! Thử lại.");
      game.undo();
      setMoveHistory((prev) => prev.slice(0, -1));
      setMoveCount((prev) => prev - 1);
    }
  };

  // Xử lý khi người chơi nhấp vào ô trên bàn cờ
  const onSquareClick = (square) => {
    if (isPuzzleSolved || !game || hasSolvedToday) return;

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

  // Xử lý khi người chơi kéo thả quân cờ
  const onDrop = (sourceSquare, targetSquare) => {
    if (isPuzzleSolved || !game || hasSolvedToday) return false;

    const possibleMoves = game.moves({ square: sourceSquare, verbose: true });
    const move = possibleMoves.find((m) => m.to === targetSquare);

    if (!move) return false;

    handleMove(move, move.san);
    setArrows([]);
    return true;
  };

  // Xử lý khi người chơi nhấp chuột phải để vẽ mũi tên
  const onSquareRightClick = (square) => {
    if (selectedSquare) {
      setArrows([[selectedSquare, square]]);
    }
  };

  // Tùy chỉnh kiểu dáng ô trên bàn cờ
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

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setScore(null);
    setUserId(null);
    setDropdownOpen(false);
    navigate("/login");
  };

  // Xử lý xem hồ sơ
  const handleViewProfile = () => {
    navigate("/profile");
    setDropdownOpen(false);
  };

  // Xác nhận thoát trang
  const confirmExit = () => {
    if (nextPath) {
      navigate(nextPath);
    }
    setShowExitModal(false);
    setNextPath(null);
  };

  // Khởi tạo dữ liệu khi trang được tải
  useEffect(() => {
    fetchUserData();
  }, []);

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

      {/* Nội dung chính */}
      <div className="flex flex-col items-center min-h-screen p-4">
        <h1 className="text-5xl font-bold text-[#E5E4E2] mb-6 drop-shadow-[0_0_10px_rgba(192,192,192,0.7)]">
          Daily Challenge
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
        ) : hasSolvedToday ? (
          <div className="bg-gradient-to-br from-[#2E2E2E] to-[#1C2526] rounded-xl shadow-[0_0_15px_rgba(192,192,192,0.5)] border border-[#C0C0C0] p-12 max-w-md w-full text-center">
            <h2 className="text-3xl font-semibold text-[#E5E4E2] mb-4 drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]">
              Bạn đã hoàn thành thử thách hôm nay!
            </h2>
            <p className="text-[#D3D3D3] mb-6">
              Hãy quay lại vào ngày mai để thử thách mới.
            </p>
            <Link to="/">
              <button className="px-6 py-3 bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9] text-[#1C2526] rounded-lg shadow-[0_0_15px_rgba(192,192,192,0.7)] hover:from-[#D3D3D3] hover:to-[#C0C0C0] hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.9)] transition-all duration-300 font-semibold text-lg">
                Về trang chủ
              </button>
            </Link>
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

        {!isLoading && !hasSolvedToday && (
          <div className="mt-4 text-lg text-[#D3D3D3]">{status}</div>
        )}

        {!isLoading && !hasSolvedToday && currentPuzzle && (
          <div className="mt-4 text-md text-[#D3D3D3]">
            Chủ đề: {currentPuzzle.themes}
          </div>
        )}

        {!isLoading && !hasSolvedToday && (
          <div className="w-full max-w-5xl mt-6">
            <div className="w-full bg-gradient-to-br from-[#2E2E2E] to-[#1C2526] rounded-xl shadow-[0_0_15px_rgba(192,192,192,0.5)] border border-[#C0C0C0] p-4 h-48 overflow-y-auto">
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
          </div>
        )}
      </div>

      {/* Modal cảnh báo thoát */}
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

export default DailyChallenge;