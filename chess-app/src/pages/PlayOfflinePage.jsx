import React, { useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

function ChessGame() {
  const [game] = useState(new Chess());
  const [status, setStatus] = useState("Trắng đi trước");
  const [promotionMove, setPromotionMove] = useState(null); // Lưu nước đi cần phong cấp
  const [showPromotionOptions, setShowPromotionOptions] = useState(false); // Hiện UI chọn quân

  const onDrop = (sourceSquare, targetSquare) => {
    const possibleMoves = game.moves({ square: sourceSquare, verbose: true });

  const move = possibleMoves.find(m => m.to === targetSquare);
  if (!move) return false;

  // Nếu là nước phong cấp
  if (move.promotion) {
    setPromotionMove({ from: sourceSquare, to: targetSquare });
    setShowPromotionOptions(true);
    return false; // Không cho thực hiện nước đi ngay
  }

  game.move({
    from: sourceSquare,
    to: targetSquare,
  });

  updateStatus();
  return true;
  };

  const promotePawn = (piece) => {
    if (!promotionMove) return;

    game.move({
      from: promotionMove.from,
      to: promotionMove.to,
      promotion: piece, // Nhận giá trị từ UI
    });

    setShowPromotionOptions(false); // Ẩn UI chọn quân
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
    game.reset(); // Đặt lại bàn cờ
    setStatus("Trắng đi trước");
  };

  const undoMove = () => {
    game.undo(); // Hoàn tác nước đi cuối
    updateStatus();
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen p-4">
      <h1 className="text-xl font-semibold text-gray-700 mb-6">Cờ Vua Online</h1>
      <div className="flex flex-col items-center">
        <Chessboard
          position={game.fen()} // Trạng thái bàn cờ
          onPieceDrop={onDrop} // Callback khi quân cờ được di chuyển
          boardWidth={400}
          customBoardStyle={{
            pointerEvents: showPromotionOptions ? "none" : "auto", // Chặn thao tác khi chọn phong cấp
          }} // Kích thước bàn cờ
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

export default ChessGame;
