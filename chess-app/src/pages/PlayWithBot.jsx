import React, { useState, useEffect, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

function PlayWithBot() {
  const [game] = useState(new Chess());
  const [status, setStatus] = useState("Trắng đi trước");
  const [promotionMove, setPromotionMove] = useState(null);
  const [showPromotionOptions, setShowPromotionOptions] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const workerRef = useRef(null);

  // Khởi tạo Web Worker khi component được mount
  useEffect(() => {
    workerRef.current = new Worker(new URL("../botWorker.js", import.meta.url));
    workerRef.current.onmessage = function (event) {
      const bestMove = event.data;
      if (bestMove) {
        game.move(bestMove);
        updateStatus();
      }
    };

    // Dọn dẹp Web Worker khi component unmount
    return () => {
      workerRef.current.terminate();
    };
  }, [game]);

  // Hàm để bot thực hiện nước đi
  const makeBotMove = () => {
    workerRef.current.postMessage({ fen: game.fen(), depth: 3 });
  };

  // Khi người chơi thực hiện xong nước đi, bot sẽ đi
  useEffect(() => {
    if (game.turn() === "b" && !game.isGameOver()) {
      setTimeout(() => {
        makeBotMove();
      }, 500); // Bot sẽ đợi 0.5 giây trước khi đi
    }
  }, [game.fen()]);

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