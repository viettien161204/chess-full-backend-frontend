import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { Chess } from "chess.js";
import logo from "./1.png";
import { BASE_URL, WEBSOCKET_BASE_URL } from "../apis/api";

const PlayOnlinePage = () => {
  const [gamePosition, setGamePosition] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [player1, setPlayer1] = useState("Player 1");
  const [player2, setPlayer2] = useState("Player 2");
  const [player1Score, setPlayer1Score] = useState(null);
  const [player2Score, setPlayer2Score] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomId, setRoomId] = useState("");
  const [moveHistory, setMoveHistory] = useState([]);
  const [currentTurn, setCurrentTurn] = useState("WHITE");
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [promotionMove, setPromotionMove] = useState(null);
  const [showPromotionOptions, setShowPromotionOptions] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [boardWidth, setBoardWidth] = useState(550);
  const [myColor, setMyColor] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [showGameEndModal, setShowGameEndModal] = useState(false);
  const [gameResult, setGameResult] = useState("");
  const [chess, setChess] = useState(new Chess());
  const [activeTab, setActiveTab] = useState("moveHistory");
  const [lastMove, setLastMove] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false); // Thêm state cho tin nhắn mới
  const navigate = useNavigate();

  useEffect(() => {
    const updateBoardWidth = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setBoardWidth(Math.min(width - 40, 350));
      } else if (width < 1024) {
        setBoardWidth(450);
      } else {
        setBoardWidth(550);
      }
    };

    updateBoardWidth();
    window.addEventListener("resize", updateBoardWidth);
    return () => window.removeEventListener("resize", updateBoardWidth);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const socket = new SockJS(`${WEBSOCKET_BASE_URL}/chess-websocket`);
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log("Connected to WebSocket");
      setStompClient(client);

      client.subscribe("/topic/rooms", (message) => {
        const rooms = JSON.parse(message.body);
        console.log("Received available rooms from /topic/rooms:", rooms);
        setAvailableRooms(rooms);
      });

      client.publish({
        destination: "/app/getAllRooms",
        body: "{}",
        headers: { Authorization: `Bearer ${token}` },
      });
    };

    client.onStompError = (frame) => {
      console.error("WebSocket connection error:", frame);
      alert("Failed to connect to the game server. Please try again later.");
    };

    client.activate();

    return () => {
      if (client) {
        client.deactivate();
        console.log("Disconnected from WebSocket");
      }
    };
  }, [navigate]);

  useEffect(() => {
    if (stompClient && stompClient.connected && roomId) {
      console.log(`Subscribing to /topic/game/${roomId}`);
      const subscription = stompClient.subscribe(`/topic/game/${roomId}`, (message) => {
        const gameState = JSON.parse(message.body);
        console.log("Received GameState:", gameState);
        updateGameFromState(gameState);
      });

      const token = localStorage.getItem("token");
      stompClient.publish({
        destination: `/app/getState/${roomId}`,
        body: "{}",
        headers: { Authorization: `Bearer ${token}` },
      });

      return () => {
        subscription.unsubscribe();
        console.log(`Unsubscribed from /topic/game/${roomId}`);
      };
    }
  }, [stompClient, roomId]);

  useEffect(() => {
    if (gamePosition) {
      try {
        const newChess = new Chess();
        newChess.load(gamePosition);
        setChess(newChess);
      } catch (error) {
        console.error("Failed to load FEN into chess.js:", error.message);
        setChess(new Chess());
      }
    }
  }, [gamePosition]);

  useEffect(() => {
    if (gameState && gameState.status) {
      if (gameState.status === "WHITE_WINS") {
        setGameResult("White Wins!");
        setShowGameEndModal(true);
      } else if (gameState.status === "BLACK_WINS") {
        setGameResult("Black Wins!");
        setShowGameEndModal(true);
      } else if (gameState.status === "DRAW") {
        setGameResult("Draw!");
        setShowGameEndModal(true);
      }
    }
  }, [gameState]);

  useEffect(() => {
    const fetchPlayerScores = async () => {
      if (gameState?.whitePlayer?.email && gameState?.blackPlayer?.email) {
        try {
          const response = await fetch("https://api.chessvn.io.vn/api/users");
          const users = await response.json();
          const whitePlayer = users.find(user => user.email === gameState.whitePlayer.email);
          const blackPlayer = users.find(user => user.email === gameState.blackPlayer.email);
          setPlayer1Score(whitePlayer?.score || 0);
          setPlayer2Score(blackPlayer?.score || 0);
        } catch (error) {
          console.error("Failed to fetch player scores:", error);
          setPlayer1Score(0);
          setPlayer2Score(0);
        }
      }
    };
    fetchPlayerScores();
  }, [gameState]);

  const updateGameFromState = (newGameState) => {
    if (!newGameState) {
      console.log("Received null GameState");
      return;
    }

    console.log("Updating game state with:", newGameState);
    setGameState(newGameState);

    const token = localStorage.getItem("token");
    const email = parseJwt(token).sub;
    console.log("Current user email:", email);

    if (newGameState.whitePlayer && newGameState.whitePlayer.email === email) {
      setMyColor("WHITE");
      console.log("Set myColor to WHITE");
    } else if (newGameState.blackPlayer && newGameState.blackPlayer.email === email) {
      setMyColor("BLACK");
      console.log("Set myColor to BLACK");
    } else {
      console.log("Could not determine myColor");
    }

    setPlayer1(newGameState.whitePlayer ? `${newGameState.whitePlayer.firstName || "Player"} ${newGameState.whitePlayer.lastName || "1"}` : "Player 1");
    setPlayer2(newGameState.blackPlayer ? `${newGameState.blackPlayer.firstName || "Player"} ${newGameState.blackPlayer.lastName || "2"}` : "Player 2");

    const fen = newGameState.chessBoard.fen;
    console.log("Received FEN from backend:", fen);
    setGamePosition(fen);

    if (newGameState.currentPlayer) {
      setCurrentTurn(newGameState.currentPlayer);
      console.log("Set currentTurn to:", newGameState.currentPlayer);
    }

    console.log("Move history data:", newGameState.moveHistory);
    const updatedMoveHistory = newGameState.moveHistory
      ? newGameState.moveHistory.map((move) => ({
          move: `${move.fromRow}${move.fromCol}-${move.toRow}${move.toCol}${move.promotion ? ` (${move.promotion})` : ""}`,
          player: move.player === "WHITE" ? player1 : player2,
        }))
      : [];
    setMoveHistory(updatedMoveHistory);

    if (newGameState.moveHistory && newGameState.moveHistory.length > 0) {
      const lastMoveData = newGameState.moveHistory[newGameState.moveHistory.length - 1];
      const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
      const fromSquare = `${files[lastMoveData.fromCol]}${8 - lastMoveData.fromRow}`;
      const toSquare = `${files[lastMoveData.toCol]}${8 - lastMoveData.toRow}`;
      setLastMove({ from: fromSquare, to: toSquare });
    } else {
      setLastMove(null);
    }

    const newMessages = newGameState.chatMessages
      ? newGameState.chatMessages.map((msg) => {
          const senderPlayer =
            msg.senderId === newGameState.whitePlayer?.id ? newGameState.whitePlayer : newGameState.blackPlayer;
          const senderName = senderPlayer
            ? `${senderPlayer.firstName || "Player"} ${senderPlayer.lastName || (senderPlayer === newGameState.whitePlayer ? "1" : "2")}`
            : "Unknown";
          return {
            sender: senderName,
            text: msg.text,
          };
        })
      : [];
    
    // Kiểm tra tin nhắn mới từ người chơi khác
    if (newMessages.length > messages.length && activeTab !== "chat") {
      const latestMessage = newMessages[newMessages.length - 1];
      const myId = newGameState.whitePlayer?.email === email ? newGameState.whitePlayer?.id : newGameState.blackPlayer?.id;
      if (latestMessage.sender !== "Unknown" && newGameState.chatMessages[newGameState.chatMessages.length - 1].senderId !== myId) {
        setHasNewMessage(true);
      }
    }
    setMessages(newMessages);
  };

  const parseJwt = (token) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  };

  const getPieceAtSquare = (square) => {
    if (!gamePosition) return null;
    const fen = gamePosition.split(" ")[0];
    const rows = fen.split("/");
    const row = 8 - parseInt(square[1]);
    const col = square.charCodeAt(0) - "a".charCodeAt(0);
    const rowData = rows[row];
    let colIndex = 0;
    for (let i = 0; i < rowData.length; i++) {
      if (colIndex === col) {
        const char = rowData[i];
        if (isNaN(char)) {
          return char === char.toUpperCase() ? `w${char.toLowerCase()}` : `b${char.toLowerCase()}`;
        }
      }
      if (isNaN(rowData[i])) {
        colIndex++;
      } else {
        colIndex += parseInt(rowData[i]);
      }
    }
    return null;
  };

  const createRoom = () => {
    if (!stompClient || !stompClient.connected) {
      alert("Not connected to the game server. Please try again.");
      return;
    }
    const newRoomId = `ROOM-${Math.random().toString(36).substr(2, 9)}`;
    setRoomId(newRoomId);

    const token = localStorage.getItem("token");
    if (roomId) {
      setAvailableRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.roomId === roomId ? { ...room, playerCount: 0 } : room
        )
      );
    }

    stompClient.publish({
      destination: `/app/create/${newRoomId}`,
      body: "{}",
      headers: { Authorization: `Bearer ${token}` },
    });

    setAvailableRooms((prevRooms) => [
      ...prevRooms,
      { roomId: newRoomId, playerCount: 1 }
    ]);

    alert(`Room created with ID: ${newRoomId}`);
  };

  const joinRoom = (roomIdToJoin = roomId) => {
    if (!roomIdToJoin.trim()) {
      alert("Please enter or select a room ID");
      return;
    }
    if (!stompClient || !stompClient.connected) {
      alert("Not connected to the game server. Please try again.");
      return;
    }

    const token = localStorage.getItem("token");
    if (roomId && roomId !== roomIdToJoin) {
      setAvailableRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.roomId === roomId ? { ...room, playerCount: 0 } : room
        )
      );
    }

    setRoomId(roomIdToJoin);
    stompClient.publish({
      destination: `/app/join/${roomIdToJoin}`,
      body: "{}",
      headers: { Authorization: `Bearer ${token}` },
    });
    alert(`Joining room with ID: ${roomIdToJoin}`);
  };

  const resetGame = () => {
    if (!stompClient || !stompClient.connected || !roomId) {
      alert("Cannot reset the game. Please check your connection or room ID.");
      return;
    }

    const token = localStorage.getItem("token");
    stompClient.publish({
      destination: `/app/create/${roomId}`,
      body: "{}",
      headers: { Authorization: `Bearer ${token}` },
    });

    setTimeout(() => {
      stompClient.publish({
        destination: `/app/getState/${roomId}`,
        body: "{}",
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowGameEndModal(false);
      setLastMove(null);
    }, 500);

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const leaveRoom = () => {
    if (roomId) {
      setAvailableRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.roomId === roomId ? { ...room, playerCount: 0 } : room
        )
      );
    }
    setLastMove(null);
    setRoomId("");
    window.location.reload();
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !stompClient || !stompClient.connected || !roomId) return;

    const token = localStorage.getItem("token");
    stompClient.publish({
      destination: `/app/chat/${roomId}`,
      body: JSON.stringify(newMessage),
      headers: { Authorization: `Bearer ${token}` },
    });
    setNewMessage("");
  };

  const onSquareClick = (square) => {
    console.log("onSquareClick called with square:", square);
    console.log("myColor:", myColor, "currentTurn:", currentTurn);
    if (showPromotionOptions || !myColor || currentTurn !== myColor) {
      console.log("Cannot move: Not your turn or myColor not set");
      return;
    }

    if (selectedSquare) {
      const move = { from: selectedSquare, to: square };
      const fromRow = 8 - parseInt(move.from[1]);
      const toRow = 8 - parseInt(move.to[1]);
      const pieceAtSquare = getPieceAtSquare(move.from);
      console.log("Piece at square:", pieceAtSquare, "toRow:", toRow);
      if (pieceAtSquare === (myColor === "WHITE" ? "wP" : "bP") && (toRow === 0 || toRow === 7)) {
        console.log("Pawn promotion detected, showing options");
        setPromotionMove(move);
        setShowPromotionOptions(true);
      } else {
        sendMove(move);
      }
      setSelectedSquare(null);
      setValidMoves([]);
    } else {
      setSelectedSquare(square);
      const moves = chess.moves({ square: square, verbose: true });
      const validSquares = moves.map((move) => move.to);
      console.log("Valid moves from chess.js:", validSquares);
      setValidMoves(validSquares);
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    console.log("onDrop called with source:", sourceSquare, "target:", targetSquare);
    console.log("myColor:", myColor, "currentTurn:", currentTurn);
    if (showPromotionOptions || !myColor || currentTurn !== myColor) {
      console.log("Cannot move: Not your turn or myColor not set");
      return false;
    }

    const move = { from: sourceSquare, to: targetSquare };
    const fromRow = 8 - parseInt(move.from[1]);
    const toRow = 8 - parseInt(move.to[1]);
    const pieceAtSquare = getPieceAtSquare(move.from);
    console.log("Piece at square:", pieceAtSquare, "toRow:", toRow);
    if (pieceAtSquare === (myColor === "WHITE" ? "wP" : "bP") && (toRow === 0 || toRow === 7)) {
      console.log("Pawn promotion detected, showing options");
      setPromotionMove(move);
      setShowPromotionOptions(true);
      return false;
    }
    sendMove(move);
    setSelectedSquare(null);
    setValidMoves([]);
    return true;
  };

  const sendMove = (move) => {
    console.log("sendMove called with move:", move);
    if (!stompClient || !stompClient.connected || !roomId) {
      console.log("Cannot send move: stompClient not connected or roomId not set");
      return;
    }

    const fromRow = 8 - parseInt(move.from[1]);
    const fromCol = move.from.charCodeAt(0) - "a".charCodeAt(0);
    const toRow = 8 - parseInt(move.to[1]);
    const toCol = move.to.charCodeAt(0) - "a".charCodeAt(0);

    const movePayload = {
      fromRow,
      fromCol,
      toRow,
      toCol,
      player: myColor,
      piece: "",
      promotion: move.promotion || null,
    };

    console.log("Sending move payload:", movePayload);
    const token = localStorage.getItem("token");
    stompClient.publish({
      destination: `/app/move/${roomId}`,
      body: JSON.stringify(movePayload),
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const promotePawn = (piece) => {
    if (!promotionMove) return;
    const move = { ...promotionMove, promotion: piece.toUpperCase() };
    console.log("Promoting pawn with move:", move);
    sendMove(move);
    setShowPromotionOptions(false);
    setPromotionMove(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    setDropdownOpen(false);
  };

  const handleViewProfile = () => {
    navigate("/profile");
    setDropdownOpen(false);
  };

  const customSquareStyles = () => {
    const styles = {};
    console.log("Applying customSquareStyles with validMoves:", validMoves);
    validMoves.forEach((square) => (styles[square] = { backgroundColor: "rgba(0, 255, 0, 0.4)" }));
    if (selectedSquare) styles[selectedSquare] = { backgroundColor: "rgba(255, 255, 0, 0.4)" };
    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: "rgba(0, 255, 0, 0.6)" };
      styles[lastMove.to] = { backgroundColor: "rgba(0, 255, 0, 0.6)" };
    }
    return styles;
  };

  const convertToChessNotation = (fromRow, fromCol, toRow, toCol) => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const fromSquare = `${files[fromCol]}${8 - fromRow}`;
    const toSquare = `${files[toCol]}${8 - toRow}`;
    return `${fromSquare}-${toSquare}`;
  };

  const [boardOrientation, setBoardOrientation] = useState("white");
  useEffect(() => {
    setBoardOrientation(myColor === "WHITE" ? "white" : "black");
    console.log("Updated boardOrientation:", myColor === "WHITE" ? "white" : "black");
  }, [myColor]);

  return (
    <div className="relative overflow-x-hidden min-h-screen font-sans bg-gradient-to-b from-purple-950 to-fuchsia-950">
      <nav className="bg-fuchsia-900/90 shadow-[0_0_15px_rgba(217,70,239,0.5)] py-3 top-0 left-0 right-0 z-50 rounded-b-xl max-w-7xl mx-auto mt-2 backdrop-blur-md">
        <ul className="flex justify-between items-center list-none px-4 md:px-6">
          <li>
            <Link to="/">
              <img
                src={logo}
                alt="Chess Logo"
                className="h-12 md:h-16 w-auto transition-transform duration-300 hover:scale-110"
                style={{ filter: `drop-shadow(0_0_10px_rgba(217,70,239,0.8))` }}
              />
            </Link>
          </li>
          <li className="flex-1 text-center">
            <Link
              to="/"
              className="text-purple-400 hover:text-purple-200 hover:drop-shadow-[0_0_8px_rgba(217,70,239,0.8)] font-semibold text-base md:text-lg transition-all duration-300"
            >
              Home
            </Link>
          </li>
          <li className="text-right relative">
            <div className="relative">
              <img
                src="https://store.playstation.com/store/api/chihiro/00_09_000/container/IE/en/99/EP4037-SLES51630_00-AVPLAYITCH000002/0/image?_version=00_09_000&platform=chihiro&bg_color=000000&opacity=100&w=720&h=720"
                alt="User Avatar"
                className="w-10 h-10 rounded-full cursor-pointer transition-all duration-300 hover:scale-110"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-fuchsia-900 rounded-md shadow-lg py-1 z-50 border border-fuchsia-500/50">
                  <button
                    onClick={handleViewProfile}
                    className="block w-full text-left px-4 py-2 text-purple-200 hover:bg-fuchsia-700 hover:text-fuchsia-100 transition-all duration-300"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-purple-200 hover:bg-fuchsia-700 hover:text-fuchsia-100 transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </li>
        </ul>
      </nav>

      <div className="flex flex-col items-center min-h-screen p-4 mt-2">
        <h1 className="text-5xl font-bold text-fuchsia-300 mb-6 drop-shadow-[0_0_10px_rgba(217,70,239,0.7)]">
          Online Chess
        </h1>

        <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-2/3 flex flex-col items-center">
            <div className="w-full text-center mb-2" style={{ width: boardWidth }}>
              <div className="bg-fuchsia-900/80 border border-fuchsia-500/50 rounded-lg p-2 shadow-[0_0_10px_rgba(217,70,239,0.5)]">
                <p className="text-fuchsia-200 text-lg">
                  {boardOrientation === "white"
                    ? `${player2} (Black) - Score: ${player2Score !== null ? player2Score : "Loading..."}`
                    : `${player1} (White) - Score: ${player1Score !== null ? player1Score : "Loading..."}`}
                </p>
              </div>
            </div>

            <div style={{ width: boardWidth, height: boardWidth }}>
              <Chessboard
                key={gamePosition}
                position={gamePosition}
                onPieceDrop={onDrop}
                onSquareClick={onSquareClick}
                boardWidth={boardWidth}
                customSquareStyles={customSquareStyles()}
                customLightSquareStyle={{ backgroundColor: "#E9D8FD" }}
                customDarkSquareStyle={{ backgroundColor: "#6B21A8" }}
                animationDuration={300}
                draggable={true}
                boardOrientation={boardOrientation}
              />
            </div>

            <div className="w-full text-center mt-2" style={{ width: boardWidth }}>
              <div className="bg-fuchsia-900/80 border border-fuchsia-500/50 rounded-lg p-2 shadow-[0_0_10px_rgba(217,70,239,0.5)]">
                <p className="text-fuchsia-200 text-lg">
                  {boardOrientation === "white"
                    ? `${player1} (White) - Score: ${player1Score !== null ? player1Score : "Loading..."}`
                    : `${player2} (Black) - Score: ${player2Score !== null ? player2Score : "Loading..."}`}
                </p>
              </div>
            </div>

            <div className="text-lg text-fuchsia-200 mt-2">
              Current Turn: {currentTurn === "WHITE" ? "White" : "Black"}
            </div>
          </div>

          <div className="w-full lg:w-1/3 flex flex-col gap-2">
            <div
              className="bg-fuchsia-900/80 rounded-2xl shadow-[0_0_15px_rgba(217,70,239,0.5)] border border-fuchsia-500/50 p-4"
              style={{ height: boardWidth }}
            >
              <div className="flex border-b border-fuchsia-500/50 mb-4">
                <button
                  onClick={() => setActiveTab("moveHistory")}
                  className={`flex-1 py-2 text-center text-fuchsia-200 font-semibold ${
                    activeTab === "moveHistory" ? "border-b-2 border-fuchsia-300 text-fuchsia-300" : ""
                  }`}
                >
                  Move History
                </button>
                <button
                  onClick={() => {
                    setActiveTab("chat");
                    setHasNewMessage(false); // Reset dấu chấm đỏ khi vào tab Chat
                  }}
                  className={`flex-1 py-2 text-center text-fuchsia-200 font-semibold relative ${
                    activeTab === "chat" ? "border-b-2 border-fuchsia-300 text-fuchsia-300" : ""
                  }`}
                >
                  Chat
                  {hasNewMessage && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("joinCreateRoom")}
                  className={`flex-1 py-2 text-center text-fuchsia-200 font-semibold ${
                    activeTab === "joinCreateRoom" ? "border-b-2 border-fuchsia-300 text-fuchsia-300" : ""
                  }`}
                >
                  Room
                </button>
              </div>

              {activeTab === "moveHistory" && (
                <div className="text-fuchsia-200 text-sm overflow-y-auto" style={{ height: boardWidth - 100 }}>
                  <div className="grid grid-cols-3 gap-2 font-semibold mb-2">
                    <div>Move</div>
                    <div>White</div>
                    <div>Black</div>
                  </div>
                  {moveHistory.reduce((acc, move, index) => {
                    const moveNumber = Math.floor(index / 2) + 1;
                    const isWhiteMove = index % 2 === 0;
                    if (isWhiteMove) {
                      acc.push({
                        number: moveNumber,
                        white: move.move,
                        black: moveHistory[index + 1]?.move || "",
                      });
                    }
                    return acc;
                  }, []).map((pair, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2">
                      <div>{pair.number}</div>
                      <div>
                        {convertToChessNotation(
                          pair.white.split("-")[0][0],
                          pair.white.split("-")[0][1],
                          pair.white.split("-")[1][0],
                          pair.white.split("-")[1][1]
                        )}
                        {pair.white.includes("(") ? pair.white.match(/\((.*?)\)/)[0] : ""}
                      </div>
                      <div>
                        {pair.black
                          ? convertToChessNotation(
                              pair.black.split("-")[0][0],
                              pair.black.split("-")[0][1],
                              pair.black.split("-")[1][0],
                              pair.black.split("-")[1][1]
                            )
                          : ""}
                        {pair.black.includes("(") ? pair.black.match(/\((.*?)\)/)[0] : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "chat" && (
                <div>
                  <div className="overflow-y-auto mb-4 text-fuchsia-200 text-sm space-y-2" style={{ height: boardWidth - 150 }}>
                    {messages.map((msg, index) => (
                      <div key={index} className="flex flex-col">
                        <span className="font-semibold">{msg.sender}</span>
                        <span>{msg.text}</span>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full px-3 py-2 bg-fuchsia-800/80 border border-fuchsia-500/50 rounded-lg text-fuchsia-100 placeholder-fuchsia-400/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:bg-fuchsia-700/80 transition-all duration-300 shadow-[inset_0_0_8px_rgba(217,70,239,0.3)]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-fuchsia-600 text-white rounded-lg shadow-[0_0_15px_rgba(217,70,239,0.7)] hover:bg-fuchsia-700 hover:scale-105 hover:shadow-[0_0_25px_rgba(217,70,239,1)] transition-all duration-300"
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "joinCreateRoom" && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Enter Room ID"
                    className="w-full px-3 py-1 bg-fuchsia-800/80 border border-fuchsia-500/50 rounded-lg text-fuchsia-100 placeholder-fuchsia-400/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:bg-fuchsia-700/80 transition-all duration-300 shadow-[inset_0_0_8px_rgba(217,70,239,0.3)]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => joinRoom()}
                      className="w-1/2 px-3 py-1 bg-fuchsia-600 text-white rounded-lg shadow-[0_0_15px_rgba(217,70,239,0.7)] hover:bg-fuchsia-700 hover:scale-105 hover:shadow-[0_0_25px_rgba(217,70,239,1)] transition-all duration-300"
                    >
                      Join Room
                    </button>
                    <button
                      onClick={createRoom}
                      className="w-1/2 px-3 py-1 bg-fuchsia-600 text-white rounded-lg shadow-[0_0_15px_rgba(217,70,239,0.7)] hover:bg-fuchsia-700 hover:scale-105 hover:shadow-[0_0_25px_rgba(217,70,239,1)] transition-all duration-300"
                    >
                      Create Room
                    </button>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-fuchsia-200 font-semibold">Rooms:</h3>
                      <button
                        onClick={() => setShowRoomModal(true)}
                        className="px-3 py-1 bg-fuchsia-600 text-white rounded-lg shadow-[0_0_10px_rgba(217,70,239,0.7)] hover:bg-fuchsia-700 hover:scale-105 transition-all duration-300"
                      >
                        Show Rooms
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-fuchsia-900/80 border border-fuchsia-500/50 rounded-2xl shadow-[0_0_20px_rgba(217,70,239,0.6)] p-6 w-full max-w-4xl backdrop-blur-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-fuchsia-300 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]">
                Available Rooms
              </h2>
              <button
                onClick={() => setShowRoomModal(false)}
                className="px-3 py-1 bg-fuchsia-600 text-white rounded-lg shadow-[0_0_10px_rgba(217,70,239,0.7)] hover:bg-fuchsia-700 hover:scale-105 transition-all duration-300"
              >
                Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {availableRooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_0.5fr] gap-4">
                  {/* Tiêu đề cột */}
                  <div className="font-semibold text-fuchsia-200 bg-fuchsia-800/70 p-2 rounded-lg">Room ID</div>
                  <div className="font-semibold text-fuchsia-200 bg-fuchsia-800/70 p-2 rounded-lg">Players</div>
                  <div className="font-semibold text-fuchsia-200 bg-fuchsia-800/70 p-2 rounded-lg">Action</div>
                  {/* Dữ liệu phòng */}
                  {availableRooms.map((room, index) => (
                    <React.Fragment key={index}>
                      <div className="p-4 bg-fuchsia-800/70 rounded-lg border border-fuchsia-500/40 text-fuchsia-100 hover:bg-fuchsia-700/70 transition-all duration-300">
                        <p className="font-semibold text-lg">{room.roomId}</p>
                      </div>
                      <div className="p-4 bg-fuchsia-800/70 rounded-lg border border-fuchsia-500/40 text-fuchsia-100 hover:bg-fuchsia-700/70 transition-all duration-300">
                        <p className="text-sm">
                          Players: {room.playerCount}/2
                          {room.whitePlayer && ` - White: ${room.whitePlayer}`}
                          {room.blackPlayer && ` - Black: ${room.blackPlayer}`}
                        </p>
                      </div>
                      <div className="p-2 bg-fuchsia-800/70 rounded-lg border border-fuchsia-500/40 text-fuchsia-100 hover:bg-fuchsia-700/70 transition-all duration-300 flex items-center justify-center">
                        {room.playerCount < 2 ? (
                          <button
                            onClick={() => {
                              joinRoom(room.roomId);
                              setShowRoomModal(false);
                            }}
                            className="px-2 py-1 bg-fuchsia-600 text-white rounded-lg shadow-[0_0_10px_rgba(217,70,239,0.7)] hover:bg-fuchsia-700 hover:scale-105 transition-all duration-300 text-sm"
                          >
                            Join
                          </button>
                        ) : (
                          <span className="text-fuchsia-400 text-sm">Full</span>
                        )}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <p className="text-fuchsia-400 text-center">No rooms available</p>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  if (stompClient && stompClient.connected) {
                    const token = localStorage.getItem("token");
                    console.log("Sending /app/getAllRooms request");
                    stompClient.publish({
                      destination: "/app/getAllRooms",
                      body: "{}",
                      headers: { Authorization: `Bearer ${token}` },
                    });
                  } else {
                    console.log("Cannot refresh: WebSocket not connected");
                    alert("Not connected to the game server. Please try again.");
                  }
                }}
                className="px-3 py-1 bg-fuchsia-600 text-white rounded-lg shadow-[0_0_10px_rgba(217,70,239,0.7)] hover:bg-fuchsia-700 hover:scale-105 transition-all duration-300"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {showPromotionOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-fuchsia-900/80 border border-fuchsia-500/50 rounded-2xl shadow-[0_0_20px_rgba(217,70,239,0.6)] p-6 max-w-md w-full backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-fuchsia-300 mb-4 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]">
              Promote Pawn
            </h2>
            <div className="flex gap-2">
              {["q", "r", "b", "n"].map((piece) => (
                <button
                  key={piece}
                  onClick={() => promotePawn(piece)}
                  className="px-3 py-2 bg-fuchsia-600 text-white rounded hover:bg-fuchsia-700 transition-all duration-300"
                >
                  {piece === "q" ? "Queen" : piece === "r" ? "Rook" : piece === "b" ? "Bishop" : "Knight"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showGameEndModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-fuchsia-900/80 border border-fuchsia-500/50 rounded-2xl shadow-[0_0_20px_rgba(217,70,239,0.6)] p-6 max-w-md w-full backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-fuchsia-300 mb-4 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]">
              Game Over
            </h2>
            <p className="text-lg text-fuchsia-200 mb-6">{gameResult}</p>
            <div className="flex gap-2">
              <button
                onClick={leaveRoom}
                className="w-1/2 px-4 py-2 bg-fuchsia-600 text-white rounded-lg shadow-[0_0_15px_rgba(217,70,239,0.7)] hover:bg-fuchsia-700 hover:scale-105 hover:shadow-[0_0_25px_rgba(217,70,239,1)] transition-all duration-300"
              >
                Leave Room
              </button>
              {myColor === "WHITE" && (
                <button
                  onClick={resetGame}
                  className="w-1/2 px-4 py-2 bg-fuchsia-600 text-white rounded-lg shadow-[0_0_15px_rgba(217,70,239,0.7)] hover:bg-fuchsia-700 hover:scale-105 hover:shadow-[0_0_25px_rgba(217,70,239,1)] transition-all duration-300"
                >
                  Play Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayOnlinePage;