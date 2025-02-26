/* eslint-disable no-restricted-globals */
import { Chess } from "chess.js";

// Piece-square tables
const pawnTable = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const knightTable = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const bishopTable = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 5, 5, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const pieceValues = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// Board evaluation
const evaluateBoard = (game) => {
  let evaluation = 0;
  const board = game.board();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        let value = pieceValues[piece.type];
        if (piece.type === "p")
          value += piece.color === "w" ? pawnTable[i][j] : pawnTable[7 - i][j];
        if (piece.type === "n")
          value += piece.color === "w" ? knightTable[i][j] : knightTable[7 - i][j];
        if (piece.type === "b")
          value += piece.color === "w" ? bishopTable[i][j] : bishopTable[7 - i][j];
        evaluation += piece.color === "w" ? value : -value;
      }
    }
  }

  // Mobility bonus
  const mobility = game.moves().length;
  evaluation += game.turn() === "w" ? mobility * 2 : -mobility * 2;

  // King safety
  if (game.inCheck()) {
    evaluation += game.turn() === "w" ? -50 : 50;
  }

  return evaluation;
};

// Quiescence search for captures
const quiescence = (game, alpha, beta) => {
  const standPat = evaluateBoard(game);
  if (standPat >= beta) return beta;
  let newAlpha = Math.max(alpha, standPat);

  const captureMoves = game.moves({ verbose: true }).filter((m) => m.captured);
  for (const move of captureMoves) {
    game.move(move);
    const score = -quiescence(game, -beta, -newAlpha);
    game.undo();
    if (score >= beta) return beta;
    newAlpha = Math.max(newAlpha, score);
  }
  return newAlpha;
};

// Minimax with alpha-beta pruning
const minimax = (game, depth, alpha, beta, maximizingPlayer, level) => {
  if (depth <= 0 || game.isGameOver()) {
    return quiescence(game, alpha, beta);
  }

  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return evaluateBoard(game);

  // Move ordering: prioritize captures
  moves.sort((a, b) =>
    (b.captured ? pieceValues[b.captured] : 0) - (a.captured ? pieceValues[a.captured] : 0)
  );

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalValue = minimax(game, depth - 1, alpha, beta, false, level);
      game.undo();
      maxEval = Math.max(maxEval, evalValue);
      alpha = Math.max(alpha, evalValue);
      if (beta <= alpha) break;
    }
    return maxEval + (level < 3 ? (Math.random() - 0.5) * 100 : 0); // Randomness for lower levels
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evalValue = minimax(game, depth - 1, alpha, beta, true, level);
      game.undo();
      minEval = Math.min(minEval, evalValue);
      beta = Math.min(beta, evalValue);
      if (beta <= alpha) break;
    }
    return minEval - (level < 3 ? (Math.random() - 0.5) * 100 : 0);
  }
};

// Worker message handler
self.onmessage = function (event) {
  const { fen, depth, level } = event.data;
  const game = new Chess(fen);
  const moves = game.moves({ verbose: true });

  if (moves.length === 0) {
    self.postMessage(null);
    return;
  }

  let bestMove = moves[0];
  let bestValue = -Infinity;

  for (const move of moves) {
    game.move(move);
    const value = minimax(game, depth - 1, -Infinity, Infinity, false, level);
    game.undo();
    if (value > bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }

  self.postMessage(bestMove);
};