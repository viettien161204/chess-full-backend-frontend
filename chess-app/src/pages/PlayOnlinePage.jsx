import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import logo from './1.png';

const PlayOnlinePage = () => {
  const [game, setGame] = useState(new Chess());
  const [gamePosition, setGamePosition] = useState('start');
  const [player1, setPlayer1] = useState('Player 1');
  const [player2, setPlayer2] = useState('Player 2');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomId, setRoomId] = useState('');
  const [moveHistory, setMoveHistory] = useState([]);
  const [currentTurn, setCurrentTurn] = useState('w');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [promotionMove, setPromotionMove] = useState(null);
  const [showPromotionOptions, setShowPromotionOptions] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { sender: 'You', text: newMessage, time: new Date().toLocaleTimeString() }]);
      setNewMessage('');
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
        const moveNotation = `${selectedSquare}-${square}`;
        setMoveHistory([...moveHistory, { move: moveNotation, player: currentTurn === 'w' ? player1 : player2 }]);
        setCurrentTurn(currentTurn === 'w' ? 'b' : 'w');
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
    if (showPromotionOptions) return false;

    const move = { from: sourceSquare, to: targetSquare };
    const possibleMoves = game.moves({ square: sourceSquare, verbose: true });
    const foundMove = possibleMoves.find(m => m.to === targetSquare);

    if (!foundMove) return false;

    if (foundMove.promotion) {
      setPromotionMove(move);
      setShowPromotionOptions(true);
      return false;
    }
    game.move(move);
    setGamePosition(game.fen());
    const moveNotation = `${sourceSquare}-${targetSquare}`;
    setMoveHistory([...moveHistory, { move: moveNotation, player: currentTurn === 'w' ? player1 : player2 }]);
    setCurrentTurn(currentTurn === 'w' ? 'b' : 'w');
    setSelectedSquare(null);
    setValidMoves([]);
    return true;
  };

  const promotePawn = (piece) => {
    if (!promotionMove) return;
    game.move({ from: promotionMove.from, to: promotionMove.to, promotion: piece });
    setGamePosition(game.fen());
    const moveNotation = `${promotionMove.from}-${promotionMove.to} (${piece.toUpperCase()})`;
    setMoveHistory([...moveHistory, { move: moveNotation, player: currentTurn === 'w' ? player1 : player2 }]);
    setCurrentTurn(currentTurn === 'w' ? 'b' : 'w');
    setShowPromotionOptions(false);
    setPromotionMove(null);
  };

  const createRoom = () => {
    const newRoomId = `ROOM-${Math.random().toString(36).substr(2, 9)}`;
    setRoomId(newRoomId);
    alert(`Room created with ID: ${newRoomId}`);
  };

  const joinRoom = () => {
    if (roomId.trim()) alert(`Joining room with ID: ${roomId}`);
    else alert('Please enter a room ID');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
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

  return (
    <div className="relative overflow-x-hidden min-h-screen font-sans bg-gradient-to-b from-purple-900 to-fuchsia-900">
      <nav className="bg-fuchsia-900/90 shadow-[0_0_15px_rgba(217,70,239,0.5)] py-3 top-0 left-0 right-0 z-50 rounded-b-xl max-w-7xl mx-auto mt-2 backdrop-blur-md">
        <ul className="flex justify-between items-center list-none px-4 md:px-6">
          <li>
            <Link to="/">
              <img src={logo} alt="Chess Logo" className="h-12 md:h-16 w-auto transition-transform duration-300 hover:scale-110" style={{ filter: `drop-shadow(0 0 10px rgba(217,70,239,0.8))` }} />
            </Link>
          </li>
          <li className="flex-1 text-center">
            <Link to="/" className="text-purple-400 hover:text-purple-200 hover:drop-shadow-[0_0_8px_rgba(217,70,239,0.8)] font-semibold text-base md:text-lg transition-all duration-300">
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
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50">
                  <button onClick={handleViewProfile} className="block w-full text-left px-4 py-2 text-purple-200 hover:bg-fuchsia-700 hover:text-fuchsia-100 transition-all duration-300">
                    View Profile
                  </button>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-purple-200 hover:bg-fuchsia-700 hover:text-fuchsia-100 transition-all duration-300">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </li>
        </ul>
      </nav>

      <div className="flex flex-col items-center min-h-screen p-4 mt-2">
        <h1 className="text-xl font-semibold text-fuchsia-300 mb-6 drop-shadow-[0_0_10px_rgba(217,70,239,0.7)]">Online Chess</h1>

        <div style={{ width: '600px', height: '600px' }}>
          <Chessboard
            position={gamePosition}
            onPieceDrop={onDrop}
            onSquareClick={onSquareClick}
            boardWidth={600}
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
                className="px-3 py-2 bg-fuchsia-600 text-white rounded hover:bg-fuchsia-700 transition-all duration-300"
              >
                {piece === "q" ? "Hậu" : piece === "r" ? "Xe" : piece === "b" ? "Tượng" : "Mã"}
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 text-lg text-fuchsia-200">Current Turn: {currentTurn === 'w' ? 'White' : 'Black'}</div>

        <div className="w-full max-w-5xl mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/80 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.5)] backdrop-blur-lg border border-fuchsia-500/50 p-4">
            <h3 className="text-xl font-bold text-fuchsia-300 mb-2 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]">Players</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src="https://via.placeholder.com/30?text=P1" alt="Player 1" className="w-8 h-8 rounded-full" />
                <p className="text-fuchsia-200">{player1} (White)</p>
              </div>
              <div className="flex items-center gap-2">
                <img src="https://via.placeholder.com/30?text=P2" alt="Player 2" className="w-8 h-8 rounded-full" />
                <p className="text-fuchsia-200">{player2} (Black)</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/80 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.5)] backdrop-blur-lg border border-fuchsia-500/50 p-4 h-48 overflow-y-auto">
            <h3 className="text-xl font-bold text-fuchsia-300 mb-2 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]">Move History</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-fuchsia-200 font-semibold">White</div>
              <div className="text-fuchsia-200 font-semibold">Black</div>
              {moveHistory.map((move, index) => {
                const isWhiteMove = move.player === player1;
                return (
                  <React.Fragment key={index}>
                    <div className="text-fuchsia-200 text-sm">{isWhiteMove ? `Move ${index + 1}: ${move.move}` : ''}</div>
                    <div className="text-fuchsia-200 text-sm">{!isWhiteMove ? `Move ${index + 1}: ${move.move}` : ''}</div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-900/80 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.5)] backdrop-blur-lg border border-fuchsia-500/50 p-4">
            <h3 className="text-xl font-bold text-fuchsia-300 mb-2 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]">Chat</h3>
            <div className="h-40 overflow-y-auto mb-4 text-fuchsia-200 text-sm space-y-2">
              {messages.map((msg, index) => (
                <div key={index} className="flex flex-col">
                  <span className="font-semibold">{msg.sender}</span>
                  <span>{msg.text} <small className="text-fuchsia-400">({msg.time})</small></span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full px-3 py-2 bg-gray-800/80 border border-fuchsia-500/50 rounded-lg text-fuchsia-100 placeholder-fuchsia-400/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:bg-gray-700/80 transition-all duration-300 shadow-[inset_0_0_8px_rgba(217,70,239,0.3)]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-fuchsia-600 text-white rounded-lg shadow-[0_0_15px_rgba(217,70,239,0.7)] hover:bg-fuchsia-700 hover:scale-105 hover:shadow-[0_0_25px_rgba(217,70,239,1)] transition-all duration-300"
              >
                Send
              </button>
            </form>
          </div>

          <div className="col-span-1 md:col-span-3 bg-gray-900/80 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.5)] backdrop-blur-lg border border-fuchsia-500/50 p-4 mt-6">
            <h3 className="text-xl font-bold text-fuchsia-300 mb-2 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]">Join or Create Room</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room ID"
                className="w-full px-3 py-2 bg-gray-800/80 border border-fuchsia-500/50 rounded-lg text-fuchsia-100 placeholder-fuchsia-400/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:bg-gray-700/80 transition-all duration-300 shadow-[inset_0_0_8px_rgba(217,70,239,0.3)]"
              />
              <div className="flex gap-2">
                <button
                  onClick={joinRoom}
                  className="w-1/2 px-4 py-2 bg-fuchsia-600 text-white rounded-lg shadow-[0_0_15px_rgba(217,70,239,0.7)] hover:bg-fuchsia-700 hover:scale-105 hover:shadow-[0_0_25px_rgba(217,70,239,1)] transition-all duration-300"
                >
                  Join Room
                </button>
                <button
                  onClick={createRoom}
                  className="w-1/2 px-4 py-2 bg-fuchsia-600 text-white rounded-lg shadow-[0_0_15px_rgba(217,70,239,0.7)] hover:bg-fuchsia-700 hover:scale-105 hover:shadow-[0_0_25px_rgba(217,70,239,1)] transition-all duration-300"
                >
                  Create Room
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayOnlinePage;