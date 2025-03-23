/* eslint-disable no-restricted-globals */
importScripts("https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/ort.min.js");

const { InferenceSession, Tensor } = ort;

// Cấu hình đường dẫn WebAssembly
self.ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/";

import { Chess } from "chess.js";

// Hàm chuyển đổi trạng thái bàn cờ (FEN) thành tensor
const boardToTensor = (fen) => {
  console.log("Processing FEN:", fen);
  if (!fen) throw new Error("FEN is undefined");

  const game = new Chess(fen);
  if (!game) throw new Error("Invalid Chess game object");

  // Lấy thông tin bàn cờ từ chess.get(square)
  const tensorData = new Float32Array(1 * 16 * 8 * 8).fill(0);
  const tensorShape = [1, 16, 8, 8];

  // Piece mapping (12 channels for pieces: 6 for white, 6 for black)
  const pieceMap = {
    P: 0, // Tốt trắng
    p: 6, // Tốt đen
    N: 1, // Mã trắng
    n: 7, // Mã đen
    B: 2, // Tượng trắng
    b: 8, // Tượng đen
    R: 3, // Xe trắng
    r: 9, // Xe đen
    Q: 4, // Hậu trắng
    q: 10, // Hậu đen
    K: 5, // Vua trắng
    k: 11, // Vua đen
  };

  // Fill the first 12 channels with piece positions
  for (let square = 0; square < 64; square++) {
    const piece = game.get(square);
    if (piece) {
      const pieceType = piece.type.toUpperCase();
      const isWhite = piece.color === "w";
      const pieceSymbol = isWhite ? pieceType : pieceType.toLowerCase();
      const channel = pieceMap[pieceSymbol];
      if (channel !== undefined) {
        const row = 7 - Math.floor(square / 8); // Convert square index to row (0-7, flipped)
        const col = square % 8;                 // Convert square index to column (0-7)
        const idx = (0 * 16 * 8 * 8) + (channel * 8 * 8) + (row * 8) + col;
        tensorData[idx] = 1.0;
      } else {
        console.warn("Unknown piece key:", pieceSymbol);
      }
    }
  }

  // Add castling rights (channels 12-15: WK, WQ, BK, BQ)
  const castling = game.fen().split(' ')[2]; // Get castling availability from FEN
  if (castling.includes('K')) { // White kingside castling
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const idx = (0 * 16 * 8 * 8) + (12 * 8 * 8) + (row * 8) + col;
        tensorData[idx] = 1.0;
      }
    }
  }
  if (castling.includes('Q')) { // White queenside castling
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const idx = (0 * 16 * 8 * 8) + (13 * 8 * 8) + (row * 8) + col;
        tensorData[idx] = 1.0;
      }
    }
  }
  if (castling.includes('k')) { // Black kingside castling
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const idx = (0 * 16 * 8 * 8) + (14 * 8 * 8) + (row * 8) + col;
        tensorData[idx] = 1.0;
      }
    }
  }
  if (castling.includes('q')) { // Black queenside castling
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const idx = (0 * 16 * 8 * 8) + (15 * 8 * 8) + (row * 8) + col;
        tensorData[idx] = 1.0;
      }
    }
  }

  // Channel 16: Turn (0.5 if white, 0 if black) and en passant (add 0.5 if available)
  const turn = game.turn() === "w" ? 0.5 : 0.0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const idx = (0 * 16 * 8 * 8) + (15 * 8 * 8) + (row * 8) + col;
      tensorData[idx] += turn;
    }
  }

  const enPassantSquare = game.fen().split(' ')[3];
  if (enPassantSquare !== '-') {
    const file = enPassantSquare.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = 8 - parseInt(enPassantSquare[1]); // Correct rank calculation (0-based)
    const row = 7 - rank; // Flip row for tensor (0 at top, 7 at bottom)
    const col = file;
    if (row >= 0 && row < 8 && col >= 0 && col < 8) { // Validate indices
      const idx = (0 * 16 * 8 * 8) + (15 * 8 * 8) + (row * 8) + col;
      tensorData[idx] += 0.5; // Add 0.5 for en passant square
    }
  }

  // Normalize tensor (keep values between 0 and 1)
  for (let i = 0; i < tensorData.length; i++) {
    tensorData[i] = Math.min(1.0, tensorData[i]);
  }

  const tensor = new Tensor("float32", tensorData, tensorShape);

  // Kiểm tra số phần tử của tensor
  if (tensorData.length !== 16 * 8 * 8) {
    throw new Error(`Tensor data length is incorrect: ${tensorData.length}, expected 1024`);
  }

  console.log("Input tensor shape:", tensor.dims);
  console.log("Input tensor data (first 20 elements):", tensor.data.slice(0, 20));
  return tensor;
};

// Hàm ánh xạ move sang index (giả định output là 64x64)
const moveToIndex = (move) => {
  const from = move.from.charCodeAt(0) - 97 + (8 - parseInt(move.from[1])) * 8; // 0-63
  const to = move.to.charCodeAt(0) - 97 + (8 - parseInt(move.to[1])) * 8; // 0-63
  let moveType = 0;

  // Create a temporary board to check move properties
  const tempChess = new Chess();
  const piece = tempChess.get(move.from); // Use tempChess to avoid modifying the main board
  if (piece && piece.type === 'k') {
    if ((from === 4 && to === 6) || (from === 4 && to === 2) || // White castling
        (from === 60 && to === 62) || (from === 60 && to === 58)) { // Black castling
      moveType = 1; // Castling
    }
  } else if (piece && piece.type === 'p' && tempChess.fen().split(' ')[3] === move.to) {
    moveType = 2; // En passant (simplified check)
  } else if (move.promotion) {
    moveType = 3; // Promotion
  }

  const baseIndex = (from * 64 + to) % 1968;
  const index = baseIndex + (moveType * 492);
  return Math.min(index, 1967); // Ensure index is within 0-1967 to match model output
};

let session = null;
let modelBuffer = null;

const loadModel = async () => {
  if (!modelBuffer) {
    const response = await fetch("/chess_dqn_improved6.onnx");
    if (!response.ok) throw new Error(`Failed to fetch model: ${response.statusText}`);
    modelBuffer = await response.arrayBuffer();
    console.log("Model buffer size:", modelBuffer.byteLength);
  }
  return modelBuffer;
};

self.onmessage = async function (event) {
  const { fen } = event.data;

  try {
    if (!session) {
      self.ort.env.wasm.numThreads = 1;
      self.ort.env.wasm.simd = true;

      const buffer = await loadModel();
      session = await InferenceSession.create(buffer, { executionProviders: ["wasm"] });
      console.log("ONNX model loaded successfully in worker with WebAssembly backend");
    }

    const game = new Chess(fen);
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) {
      console.log("No legal moves available");
      self.postMessage(null);
      return;
    }

    const inputTensor = boardToTensor(fen);
    const feeds = { input: inputTensor }; // Sửa tên đầu vào thành 'input'
    const outputMap = await session.run(feeds);
    console.log("Output map keys:", Object.keys(outputMap));

    // Sử dụng tên đầu ra thực tế là 'output'
    const outputTensor = outputMap["output"];
    if (!outputTensor) {
      throw new Error("Output tensor 'output' is undefined. Available outputs: " + Object.keys(outputMap).join(", "));
    }

    console.log("Output tensor shape:", outputTensor.dims);
    console.log("Output tensor data (first 10 elements):", outputTensor.data.slice(0, 10));

    // Chọn nước đi tốt nhất từ Q-values
    let bestMoveValue = -Infinity;
    let bestMove = null;

    for (const move of moves) {
      const moveIdx = moveToIndex(move);
      if (moveIdx < outputTensor.data.length) { // Ensure index is within bounds
        const moveValue = outputTensor.data[moveIdx];
        if (moveValue > bestMoveValue) {
          bestMoveValue = moveValue;
          bestMove = move;
        }
      }
    }

    if (bestMove) {
      console.log("Selected move:", bestMove);
      self.postMessage(bestMove);
    } else {
      console.warn("No valid move selected, choosing random move");
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      self.postMessage(randomMove);
    }
  } catch (error) {
    console.error("Error in botWorker:", error);
    self.postMessage(null);
  }
};