/* eslint-disable no-restricted-globals */
import { Chess } from "chess.js";

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
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        evaluation += piece.color === "w" ? pieceValues[piece.type] : -pieceValues[piece.type];
      }
    }
  }
  return evaluation;
};

const evaluateMove = (move) => {
  const pieceValues = {
    p: 100, // Tốt
    n: 320, // Mã
    b: 330, // Tượng
    r: 500, // Xe
    q: 900, // Hậu
    k: 20000, // Vua
  };

  let value = 0;

  // Nếu nước đi ăn quân, thêm giá trị quân bị ăn
  if (move.captured) {
    value += pieceValues[move.captured];
  }

  // Nếu nước đi chiếu, thêm giá trị chiếu
  if (move.san.includes("+")) {
    value += 50;
  }

  // Nếu nước đi là phong cấp, thêm giá trị hậu
  if (move.promotion === "q") {
    value += 900;
  }

  return value;
};

const minimax = (game, depth, alpha, beta, maximizingPlayer) => {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const possibleMoves = game.moves({ verbose: true });

  // Sắp xếp các nước đi để tối ưu Alpha-Beta Pruning
  possibleMoves.sort((a, b) => {
    const valueA = evaluateMove(a);
    const valueB = evaluateMove(b);
    return maximizingPlayer ? valueB - valueA : valueA - valueB;
  });

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

// Sử dụng self bình thường
self.onmessage = function (event) {
  const { fen, depth } = event.data;
  const game = new Chess(fen);
  const possibleMoves = game.moves({ verbose: true });

  let bestMove = null;
  let bestValue = -Infinity;

  for (let move of possibleMoves) {
    game.move(move);
    const boardValue = minimax(game, depth - 1, -Infinity, Infinity, false);
    game.undo();
    if (boardValue > bestValue) {
      bestValue = boardValue;
      bestMove = move;
    }
  }

  self.postMessage(bestMove);
};