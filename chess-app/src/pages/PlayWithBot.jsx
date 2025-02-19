import React, { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

function PlayWithBot() {
  const [game] = useState(new Chess());
  const [status, setStatus] = useState("Trắng đi trước");
  const [promotionMove, setPromotionMove] = useState(null);
  const [showPromotionOptions, setShowPromotionOptions] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);

  // Hàm đánh giá bàn cờ (evaluation function)
  const evaluateBoard = (game) => {
    const pieceValues = {
      p: 100, // Tốt
      n: 320, // Mã
      b: 330, // Tượng
      r: 500, // Xe
      q: 900, // Hậu
      k: 20000, // Vua
    };

    let evaluation = 0;
    const board = game.board();
    for (let row of board) {
      for (let piece of row) {
        if (piece) {
          const value = pieceValues[piece.type];
          evaluation += piece.color === "w" ? value : -value;
        }
      }
    }
    return evaluation;
  };

  // Thuật toán Minimax với Alpha-Beta Pruning
  const minimax = (game, depth, alpha, beta, maximizingPlayer) => {
    if (depth === 0 || game.isGameOver()) {
      return evaluateBoard(game);
    }

    const possibleMoves = game.moves({ verbose: true });

    if (maximizingPlayer) {
      let maxEval = -Infinity;
      for (let move of possibleMoves) {
        game.move(move);
        const evaluation = minimax(game, depth - 1, alpha, beta, false);
        game.undo();
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break; // Alpha-Beta Pruning
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let move of possibleMoves) {
        game.move(move);
        const evaluation = minimax(game, depth - 1, alpha, beta, true);
        game.undo();
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break; // Alpha-Beta Pruning
      }
      return minEval;
    }
  };

  // Hàm để bot thực hiện nước đi
  const makeBotMove = () => {
    const possibleMoves = game.moves({ verbose: true });
    if (possibleMoves.length === 0) return; // Nếu không có nước đi hợp lệ

    let bestMove = null;
    let bestValue = -Infinity;

    for (let move of possibleMoves) {
      game.move(move);
      const boardValue = minimax(game, 3, -Infinity, Infinity, false); // Độ sâu 3
      game.undo();
      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    }

    if (bestMove) {
      game.move(bestMove);
      updateStatus();
    }
  };

  // Khi người chơi thực hiện xong nước đi, bot sẽ đi
  useEffect(() => {
    if (game.turn() === "b" && !game.isGameOver()) {
      setTimeout(() => {
        makeBotMove();
      }, 200); // Bot sẽ đợi 0.5 giây trước khi đi
    }
  }, [game.fen()]); // Theo dõi sự thay đổi của FEN để biết khi nào bot cần đi

  // Các hàm còn lại giữ nguyên
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

  const updateStatus = () => {
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        setStatus(`Chiếu hết! ${game.turn() === "w" ? "Đen thắng" : "Trắng thắng"}`);
      } else if (game.isDraw()) {
        setStatus("Hòa!");
      }
    } else {
      setStatus(`Lượt đi của ${game.turn() === "w" ? "Trắng" : "Đen"}`);
    }
  };

  const newGame = () => {
    game.reset();
    setStatus("Trắng đi trước");
  };

  const undoMove = () => {
    game.undo();
    updateStatus();
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

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen p-4">
      <h1 className="text-xl font-semibold text-gray-700 mb-6">Cờ Vua với Bot</h1>
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
                {piece === "q" ? "Hậu" : piece === "r" ? "Xe" : piece === "b" ? "Tượng" : "Mã"}
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 flex gap-4">
          <button
            onClick={newGame}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Game mới
          </button>
          <button
            onClick={undoMove}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Undo
          </button>
        </div>
        <div className="mt-4 text-lg text-gray-800">{status}</div>
      </div>
    </div>
  );
}

export default PlayWithBot;