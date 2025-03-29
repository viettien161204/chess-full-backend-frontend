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
  const [userData, setUserData] = useState(null); // Thêm state mới
  const [isLoadingScore, setIsLoadingScore] = useState(false);

  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [game, setGame] = useState(null);
  const [status, setStatus] = useState("Loading puzzle...");
  const [moveCount, setMoveCount] = useState(0);
  const [moveHistory, setMoveHistory] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const [playerColor, setPlayerColor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [arrows, setArrows] = useState([]);
  const [hasSolvedToday, setHasSolvedToday] = useState(false);
  const [boardWidth, setBoardWidth] = useState(550);
  const [lastMove, setLastMove] = useState(null);

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
      const response = await fetch("https://api.chessvn.io.vn/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const users = await response.json();
      const user = users.find((u) => u.email === userEmail);
      if (user) {
        setUserId(user.id);
        setScore(user.score || 100);
        setUserData(user);
      } else {
        throw new Error("User not found with email: " + userEmail);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setScore(null);
      setUserData(null);
    } finally {
      setIsLoadingScore(false);
    }
  };

  const updateUserScore = async (newScore) => {
    const token = localStorage.getItem("token");
    if (!token || !userId || !userData) return;

    try {
      const updatedUserData = {
        ...userData,
        score: newScore,
      };

      const response = await fetch(`https://api.chessvn.io.vn/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUserData),
      });
      if (!response.ok) throw new Error("Failed to update score");
      setScore(newScore);
      setUserData(updatedUserData);
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  const uciToMoveObject = (uciMove) => {
    if (typeof uciMove !== "string" || uciMove.length < 4) {
      throw new Error(`Invalid UCI move: ${uciMove}`);
    }
    return {
      from: uciMove.slice(0, 2),
      to: uciMove.slice(2, 4),
    };
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const userEmail = localStorage.getItem("userEmail");
    const dailyChallengeData = JSON.parse(localStorage.getItem("dailyChallenge")) || {};

    if (!userEmail) {
      setStatus("Please log in to play the Daily Challenge.");
      setIsLoading(false);
      return;
    }

    const userChallengeData = dailyChallengeData[userEmail] || {};

    if (userChallengeData.date === today) {
      if (userChallengeData.solved) {
        setHasSolvedToday(true);
        setIsLoading(false);
      }
      if (userChallengeData.puzzle) {
        const { puzzle, fen, playerColor } = userChallengeData;
        const chess = new Chess(fen);
        setCurrentPuzzle(puzzle);
        setGame(chess);
        setPlayerColor(playerColor);
        setStatus(
          `${puzzle.description.split(" - ")[0]} - You play as ${
            chess.turn() === "w" ? "White" : "Black"
          } - Need ${puzzle.maxMoves} moves to checkmate`
        );
        setIsLoading(false);
        return;
      }
    }
    fetchDailyPuzzle();
  }, []);

  const fetchDailyPuzzle = async (offset = Math.floor(Math.random() * 3300000)) => {
    setIsLoading(true);
    let validPuzzle = false;
    let puzzle, chess;

    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      setStatus("Please log in to play the Daily Challenge.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `https://datasets-server.huggingface.co/rows?dataset=Lichess/chess-puzzles&config=default&split=train&offset=${offset}&length=1`
      );
      const data = response.data;

      if (!data || !data.rows || data.rows.length === 0) {
        throw new Error("Invalid data from API: Missing 'rows' field");
      }

      const puzzleData = data.rows[0].row;

      if (!puzzleData.Rating || puzzleData.Rating < 1500 || puzzleData.Rating > 2200) {
        return fetchDailyPuzzle(Math.floor(Math.random() * 3300000));
      }

      const fen = puzzleData.FEN;
      if (!fen) throw new Error("Invalid data from API: Missing 'FEN' field");
      const fenFields = fen.split(" ");
      if (fenFields.length !== 6) throw new Error("Invalid FEN: must contain six space-delimited fields");

      const moves = puzzleData.Moves ? puzzleData.Moves.split(" ") : [];
      if (moves.length === 0) throw new Error("Invalid data from API: Missing 'Moves' field");

      chess = new Chess(fen);
      let isDraw = false;
      for (let i = 0; i < moves.length; i++) {
        const move = uciToMoveObject(moves[i]);
        chess.move(move);
        if (
          chess.isDraw() ||
          chess.isStalemate() ||
          chess.isInsufficientMaterial() ||
          chess.isThreefoldRepetition()
        ) {
          isDraw = true;
          break;
        }
      }

      if (!chess.isCheckmate() || isDraw) {
        return fetchDailyPuzzle(Math.floor(Math.random() * 3300000));
      }

      chess = new Chess(fen);

      if (moves.length > 0) {
        const firstMove = uciToMoveObject(moves[0]);
        chess.move(firstMove);
        setLastMove({ from: firstMove.from, to: firstMove.to });
      }

      const playerMoves = moves.slice(1).filter((_, i) => i % 2 === 0);
      const opponentMoves = moves.slice(1).filter((_, i) => i % 2 !== 0);

      puzzle = {
        id: puzzleData.PuzzleId,
        initialFen: fen,
        fen: chess.fen(),
        description: `${puzzleData.Rating} rating - Solve in ${playerMoves.length} moves`,
        maxMoves: playerMoves.length,
        points: Math.floor(puzzleData.Rating / 100) * 5,
        solution: moves,
        opponentMoves,
        playerMoves,
        themes: puzzleData.Themes,
      };

      validPuzzle = true;
    } catch (error) {
      console.error("Error fetching puzzle from Hugging Face:", error);
      setStatus("Failed to load puzzle. Please try again later.");
      setIsLoading(false);
      return;
    }

    if (validPuzzle) {
      setCurrentPuzzle(puzzle);
      setGame(chess);
      setPlayerColor(chess.turn());
      setStatus(
        `${puzzle.description.split(" - ")[0]} - You play as ${
          chess.turn() === "w" ? "White" : "Black"
        } - Need ${puzzle.maxMoves} moves to checkmate`
      );
      setIsLoading(false);

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

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (moveHistory.length > 0 && !hasSolvedToday) {
        event.returnValue =
          "Are you sure you want to leave this page? All puzzle progress will be lost.";
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

  const getOpponentMove = () => {
    const possibleMoves = game.moves({ verbose: true });
    if (possibleMoves.length === 0) return null;
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  };

  const handleMove = (move, sanMove) => {
    if (!game || !currentPuzzle || isPuzzleSolved) return;

    game.move(move);
    setLastMove({ from: move.from, to: move.to });
    setMoveHistory((prev) => [...prev, { move: sanMove, player: "Player" }]);
    setMoveCount((prev) => prev + 1);

    const currentPlayerMoveIndex = moveCount;
    const correctMove = currentPuzzle.playerMoves[currentPlayerMoveIndex];
    const remainingMoves = currentPuzzle.maxMoves - currentPlayerMoveIndex - 1;

    const moveUCI = move.from + move.to;
    if (moveUCI === correctMove) {
      if (game.isCheckmate()) {
        setStatus("Congratulations! You solved the puzzle!");
        setIsPuzzleSolved(true);
        if (isLoggedIn) {
          const points = currentPuzzle.points;
          const newScore = (score || 100) + points;
          updateUserScore(newScore);
        }
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
            setStatus("Opponent has no valid moves!");
            setIsPuzzleSolved(true);
            if (isLoggedIn) {
              const points = currentPuzzle.points;
              const newScore = (score || 100) + points;
              updateUserScore(newScore);
            }
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
          setLastMove({ from: opponentMoveObj.from, to: opponentMoveObj.to });
          setMoveHistory((prev) => [...prev, { move: opponentMove, player: "Opponent" }]);
          if (game.isCheckmate()) {
            setStatus("Congratulations! You solved the puzzle!");
            setIsPuzzleSolved(true);
            if (isLoggedIn) {
              const points = currentPuzzle.points;
              const newScore = (score || 100) + points;
              updateUserScore(newScore);
            }
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
              `Well done! Your turn... - Need ${remainingMoves} moves to checkmate`
            );
          }
        }, 500);
      }
    } else {
      setStatus("Wrong move! Try again.");
      game.undo();
      setLastMove(null);
      setMoveHistory((prev) => prev.slice(0, -1));
      setMoveCount((prev) => prev - 1);
    }
  };

  const onSquareClick = (square) => {
    if (isPuzzleSolved || !game || hasSolvedToday) return;

    if (selectedSquare) {
      const move = { from: selectedSquare, to: square };
      const possibleMoves = game.moves({ square: selectedSquare, verbose: true });
      const foundMove = possibleMoves.find((m) => m.to === square);

      if (foundMove) {
        setLastMove({ from: selectedSquare, to: square });
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
    if (isPuzzleSolved || !game || hasSolvedToday) return false;

    const possibleMoves = game.moves({ square: sourceSquare, verbose: true });
    const move = possibleMoves.find((m) => m.to === targetSquare);

    if (!move) return false;

    setLastMove({ from: sourceSquare, to: targetSquare });
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
    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: "rgba(0, 255, 0, 0.6)" };
      styles[lastMove.to] = { backgroundColor: "rgba(0, 255, 0, 0.6)" };
    }
    return styles;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setScore(null);
    setUserId(null);
    setUserData(null); // Reset userData
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

  useEffect(() => {
    fetchUserData();
  }, []);

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
          Daily Challenge
        </h1>
        <div className="mb-4 text-lg text-[#D3D3D3]">
          Your Score:{" "}
          {isLoggedIn ? (
            isLoadingScore ? (
              "Loading score..."
            ) : score !== null ? (
              <span className="font-bold">{score}</span>
            ) : (
              "Unable to load score"
            )
          ) : (
            "Please log in to save your score"
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
            <p className="text-[#D3D3D3] mt-4">Loading chessboard...</p>
          </div>
        ) : hasSolvedToday ? (
          <div className="bg-gradient-to-br from-[#2E2E2E] to-[#1C2526] rounded-2xl shadow-[0_0_15px_rgba(192,192,192,0.5)] border border-[#C0C0C0] p-12 max-w-md w-full text-center">
            <h2 className="text-3xl font-semibold text-[#E5E4E2] mb-4 drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]">
              You have completed today's challenge!
            </h2>
            <p className="text-[#D3D3D3] mb-6">Come back tomorrow for a new challenge.</p>
            <Link to="/">
              <button className="px-6 py-3 bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9] text-[#1C2526] rounded-lg shadow-[0_0_15px_rgba(192,192,192,0.7)] hover:from-[#D3D3D3] hover:to-[#C0C0C0] hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.9)] transition-all duration-300 font-semibold text-lg">
                Back to Home
              </button>
            </Link>
          </div>
        ) : game ? (
          <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-0">
            <div className="w-full lg:w-2/3 flex flex-col items-center">
              <div style={{ width: boardWidth, height: boardWidth }}>
                <Chessboard
                  position={game.fen()}
                  onPieceDrop={onDrop}
                  onSquareClick={onSquareClick}
                  onSquareRightClick={onSquareRightClick}
                  boardWidth={boardWidth}
                  customSquareStyles={customSquareStyles()}
                  boardOrientation={playerColor === "b" ? "black" : "white"}
                  customArrows={arrows}
                  customDarkSquareStyle={{ backgroundColor: "#4B7399" }}
                  customLightSquareStyle={{ backgroundColor: "#EBECD0" }}
                />
              </div>
            </div>

            <div className="w-full lg:w-1/3 flex flex-col gap-4">
              <div
                style={{ height: boardWidth / 2 - 16 }}
                className="bg-gradient-to-br from-[#2E2E2E] to-[#1C2526] rounded-2xl shadow-[0_0_15px_rgba(192,192,192,0.5)] border border-[#C0C0C0] p-4 overflow-y-auto transition-all duration-300 hover:shadow-[0_0_20px_rgba(192,192,192,0.7)]"
              >
                <h3 className="text-lg font-semibold text-[#E5E4E2] mb-3 drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]">
                  Move History
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {moveHistory.map((move, index) => (
                    <div key={index} className="text-[#D3D3D3] text-sm">
                      Move {index + 1}: {move.move} ({move.player})
                    </div>
                  ))}
                </div>
              </div>
              {currentPuzzle && (
                <div className="text-md text-[#D3D3D3]">
                  Themes: {currentPuzzle.themes}
                </div>
              )}
              <div className="text-lg text-[#D3D3D3]">{status}</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-[#D3D3D3]">
            <p>Unable to load chessboard.</p>
            <button
              onClick={() => fetchDailyPuzzle()}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9] text-[#1C2526] rounded-lg shadow-[0_0_15px_rgba(192,192,192,0.7)] hover:from-[#D3D3D3] hover:to-[#C0C0C0] hover:scale-105 hover:shadow-[0_0_25px_rgba(192,192,192,0.9)] transition-all duration-300"
            >
              Reload
            </button>
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
                Warning
              </h2>
              <p className="text-[#D3D3D3] mb-6">
                Are you sure you want to leave this page? All puzzle progress will be lost.
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
    </div>
  );
}

export default DailyChallenge;