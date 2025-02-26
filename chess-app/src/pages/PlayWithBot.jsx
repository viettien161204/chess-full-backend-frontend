import React, { useState, useEffect, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

function PlayWithBot() {
  const [game] = useState(new Chess());
  const [status, setStatus] = useState("White to move");
  const [promotionMove, setPromotionMove] = useState(null);
  const [showPromotionOptions, setShowPromotionOptions] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [botLevel, setBotLevel] = useState(3); // Default: Hard
  const [isBotThinking, setIsBotThinking] = useState(false);
  const workerRef = useRef(null);

  // Initialize Web Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL("../botWorker.js", import.meta.url));
    workerRef.current.onmessage = (event) => {
      const bestMove = event.data;
      if (bestMove) {
        game.move(bestMove);
        updateStatus();
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
    if (selectedSquare) {
      const move = { from: selectedSquare, to: square };
      const possibleMoves = game.moves({ square: selectedSquare, verbose: true });
      const foundMove = possibleMoves.find((m) => m.to === square);

      if (foundMove && foundMove.promotion) {
        setPromotionMove(move);
        setShowPromotionOptions(true);
      } else if (foundMove) {
        game.move(move);
        updateStatus();
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
    updateStatus();
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
    updateStatus();
  };

  // Update game status
  const updateStatus = () => {
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        setStatus(`Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins`);
      } else if (game.isDraw()) {
        setStatus("Draw!");
      }
    } else {
      setStatus(`${game.turn() === "w" ? "White" : "Black"} to move`);
    }
  };

  // Start new game
  const newGame = () => {
    game.reset();
    setStatus("White to move");
    setSelectedSquare(null);
    setValidMoves([]);
    setShowPromotionOptions(false);
    setPromotionMove(null);
  };

  // Undo last move
  const undoMove = () => {
    game.undo();
    updateStatus();
    setSelectedSquare(null);
    setValidMoves([]);
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

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen p-4">
      <h1 className="text-xl font-semibold text-gray-700 mb-6">Chess vs Bot</h1>
      <div className="mb-4 flex gap-2">
        <label className="text-gray-700">Bot Level:</label>
        <select
          value={botLevel}
          onChange={(e) => setBotLevel(parseInt(e.target.value))}
          className="p-2 border rounded"
        >
          <option value={1}>Easy (Depth 1)</option>
          <option value={2}>Medium (Depth 2)</option>
          <option value={3}>Hard (Depth 3)</option>
          <option value={4}>Expert (Depth 4)</option>
        </select>
      </div>
      <div className="flex flex-col items-center">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick}
          boardWidth={600}
          customSquareStyles={customSquareStyles()}
          customBoardStyle={{ pointerEvents: showPromotionOptions ? "none" : "auto" }}
        />
        {showPromotionOptions && (
          <div className="absolute top-1/3 bg-white p-4 rounded-lg shadow-lg flex gap-2">
            {["q", "r", "b", "n"].map((piece) => (
              <button
                key={piece}
                onClick={() => promotePawn(piece)}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {piece === "q" ? "Queen" : piece === "r" ? "Rook" : piece === "b" ? "Bishop" : "Knight"}
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 flex gap-4">
          <button
            onClick={newGame}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            New Game
          </button>
          <button
            onClick={undoMove}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Undo
          </button>
        </div>
        <div className="mt-4 text-lg text-gray-800">
          {isBotThinking ? "Bot is thinking..." : status}
        </div>
      </div>
    </div>
  );
}

export default PlayWithBot;