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

const rookTable = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
];

const queenTable = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const kingTableMidgame = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

const kingTableEndgame = [
  [-50, -40, -30, -20, -20, -30, -40, -50],
  [-30, -20, -10, 0, 0, -10, -20, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -30, 0, 0, 0, 0, -30, -30],
  [-50, -30, -30, -30, -30, -30, -30, -50],
];

const pieceValues = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// Transposition Table
const tt = new Map();

// Hàm tìm vị trí vua trên bàn cờ
const findKingPosition = (game, color) => {
  const board = game.board();
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece && piece.type === "k" && piece.color === color) {
        const file = String.fromCharCode(97 + j); // a-h
        const rank = 8 - i; // 1-8
        return `${file}${rank}`; // ví dụ: "e1"
      }
    }
  }
  return null; // Trường hợp không tìm thấy vua (không nên xảy ra trong ván đấu hợp lệ)
};

// Hàm kiểm tra xem quân cờ có bị đe dọa không
const isPieceThreatened = (game, square, color) => {
  const opponentColor = color === "w" ? "b" : "w";
  const moves = game.moves({ verbose: true });
  return moves.some(m => m.to === square && game.get(m.from)?.color === opponentColor);
};

const evaluateBoard = (game) => {
  let evaluation = 0;
  const board = game.board();
  const materialCount = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0 },
  };

  // Count material
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        materialCount[piece.color][piece.type]++;
      }
    }
  }

  const isEndgame = materialCount.w.q + materialCount.b.q === 0 && materialCount.w.r + materialCount.b.r <= 1;

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        let value = pieceValues[piece.type];
        if (piece.type === "p")
          value += piece.color === "w" ? pawnTable[i][j] : pawnTable[7 - i][j];
        else if (piece.type === "n")
          value += piece.color === "w" ? knightTable[i][j] : knightTable[7 - i][j];
        else if (piece.type === "b")
          value += piece.color === "w" ? bishopTable[i][j] : bishopTable[7 - i][j];
        else if (piece.type === "r")
          value += piece.color === "w" ? rookTable[i][j] : rookTable[7 - i][j];
        else if (piece.type === "q")
          value += piece.color === "w" ? queenTable[i][j] : queenTable[7 - i][j];
        else if (piece.type === "k")
          value += piece.color === "w" ? (isEndgame ? kingTableEndgame[i][j] : kingTableMidgame[i][j]) : (isEndgame ? kingTableEndgame[7 - i][j] : kingTableMidgame[7 - i][j]);

        // Thêm điểm phạt nếu quân bị đe dọa
        const square = `${String.fromCharCode(97 + j)}${8 - i}`;
        if (isPieceThreatened(game, square, piece.color) && piece.type !== "k") {
          value -= pieceValues[piece.type] * 0.2; // Phạt 20% giá trị quân nếu bị đe dọa
        }

        evaluation += piece.color === "w" ? value : -value;
      }
    }
  }

  // Material bonus
  evaluation += (materialCount.w.b >= 2 ? 50 : 0) - (materialCount.b.b >= 2 ? 50 : 0); // Bishop pair bonus

  // Center control
  const centerSquares = ["d4", "e4", "d5", "e5"];
  const centerPieces = centerSquares.map(square => game.get(square)).filter(piece => piece != null);
  const whiteCenter = centerPieces.filter(p => p?.color === "w").length;
  const blackCenter = centerPieces.filter(p => p?.color === "b").length;
  evaluation += (whiteCenter - blackCenter) * 20;

  // Mobility
  const mobility = game.moves().length;
  evaluation += game.turn() === "w" ? mobility * 2 : -mobility * 2;

  // King safety
  if (game.inCheck()) {
    evaluation += game.turn() === "w" ? -100 : 100;
  }
  const kingPos = findKingPosition(game, game.turn() === "w" ? "w" : "b");
  if (kingPos) {
    const attackers = game.moves({ verbose: true }).filter(m => m.to === kingPos && m.captured).length;
    evaluation += game.turn() === "w" ? -attackers * 50 : attackers * 50;
  }

  return evaluation;
};

const quiescence = (game, alpha, beta) => {
  const standPat = evaluateBoard(game);
  if (standPat >= beta) return beta;
  let newAlpha = Math.max(alpha, standPat);

  const captureMoves = game.moves({ verbose: true }).filter((m) => m.captured || game.get(m.to)?.type === "k");
  for (const move of captureMoves) {
    game.move(move);
    const score = -quiescence(game, -beta, -newAlpha);
    game.undo();
    if (score >= beta) return beta;
    newAlpha = Math.max(newAlpha, score);
  }
  return newAlpha;
};

// Danh sách nước đi khai cuộc cơ bản
const openingMoves = [
  "e4", "d4", "Nf3", "c4", "Nc3", "f4", "g3", "b3",
  "e5", "d5", "Nf6", "c5", "Nc6", "f5", "g6", "b6",
];

const minimax = (game, depth, alpha, beta, maximizingPlayer, level, timeLimit = 2000) => {
  const startTime = performance.now();
  if (depth <= 0 || game.isGameOver() || performance.now() - startTime > timeLimit) {
    return quiescence(game, alpha, beta);
  }

  const hash = game.fen();
  if (tt.has(hash) && tt.get(hash).depth >= depth) {
    const entry = tt.get(hash);
    if (entry.flag === "exact") return entry.value;
    if (entry.flag === "lowerbound") alpha = Math.max(alpha, entry.value);
    else if (entry.flag === "upperbound") beta = Math.min(beta, entry.value);
    if (alpha >= beta) return entry.value;
  }

  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return evaluateBoard(game);

  // Move ordering: prioritize captures, checks, escapes, and opening moves
  moves.sort((a, b) => {
    const aIsCapture = a.captured ? pieceValues[a.captured] * 10 : 0;
    const bIsCapture = b.captured ? pieceValues[b.captured] * 10 : 0;
    const aIsCheck = game.inCheck() && game.moves().some(m => m.to === a.from) ? 500 : 0;
    const bIsCheck = game.inCheck() && game.moves().some(m => m.to === b.from) ? 500 : 0;
    const aIsEscape = isPieceThreatened(game, a.from, game.get(a.from)?.color) ? 300 : 0;
    const bIsEscape = isPieceThreatened(game, b.from, game.get(b.from)?.color) ? 300 : 0;
    const aIsOpening = game.history().length < 5 && openingMoves.includes(a.san) ? 200 : 0;
    const bIsOpening = game.history().length < 5 && openingMoves.includes(b.san) ? 200 : 0;
    const aCenter = ["d4", "e4", "d5", "e5"].includes(a.to) ? 50 : 0;
    const bCenter = ["d4", "e4", "d5", "e5"].includes(b.to) ? 50 : 0;

    return (bIsCapture + bIsCheck + bIsEscape + bIsOpening + bCenter) - (aIsCapture + aIsCheck + aIsEscape + aIsOpening + aCenter);
  });

  let bestMove = null;
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalValue = minimax(game, depth - 1, alpha, beta, false, level, timeLimit - (performance.now() - startTime));
      game.undo();
      if (evalValue > maxEval) {
        maxEval = evalValue;
        bestMove = move;
      }
      alpha = Math.max(alpha, evalValue);
      if (beta <= alpha) break;
    }
    const flag = alpha >= beta ? "lowerbound" : "exact";
    tt.set(hash, { value: maxEval, depth, flag, bestMove });
    return maxEval + (level < 3 ? (Math.random() - 0.5) * 50 : 0); // Giảm ngẫu nhiên ở mức cao
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evalValue = minimax(game, depth - 1, alpha, beta, true, level, timeLimit - (performance.now() - startTime));
      game.undo();
      if (evalValue < minEval) {
        minEval = evalValue;
        bestMove = move;
      }
      beta = Math.min(beta, evalValue);
      if (beta <= alpha) break;
    }
    const flag = alpha >= beta ? "upperbound" : "exact";
    tt.set(hash, { value: minEval, depth, flag, bestMove });
    return minEval - (level < 3 ? (Math.random() - 0.5) * 50 : 0);
  }
};

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
  const maxDepth = level === 1 ? 2 : level === 2 ? 3 : level === 3 ? 5 : 6;
  const timeLimit = level === 1 ? 1000 : level === 2 ? 1500 : level === 3 ? 2000 : 2500;

  tt.clear();
  const startTime = performance.now();

  for (const move of moves) {
    game.move(move);
    const value = minimax(game, maxDepth - 1, -Infinity, Infinity, false, level, timeLimit);
    game.undo();
    if (value > bestValue || (value === bestValue && performance.now() - startTime < timeLimit / 2)) {
      bestValue = value;
      bestMove = move;
    }
    if (performance.now() - startTime > timeLimit) break;
  }

  self.postMessage(bestMove);
};