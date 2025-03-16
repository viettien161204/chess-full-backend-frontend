/* eslint-disable no-restricted-globals */
importScripts("https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/ort.min.js");

const { InferenceSession, Tensor } = ort;

// Cấu hình đường dẫn WebAssembly và tối ưu hóa
self.ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/";
self.ort.env.wasm.numThreads = navigator.hardwareConcurrency || 2; // Sử dụng số luồng dựa trên CPU
self.ort.env.wasm.simd = true;

import { Chess } from "chess.js";

// Hàm chuyển đổi trạng thái bàn cờ (FEN) thành tensor
const boardToTensor = (fen) => {
  console.log("Processing FEN:", fen);
  if (!fen) throw new Error("FEN is undefined");

  const game = new Chess(fen);
  if (!game || !game.board) throw new Error("Invalid Chess game object");

  const board = game.board();
  console.log("Board structure:", board);

  if (!Array.isArray(board) || board.length !== 8 || !board.every(row => Array.isArray(row) && row.length === 8)) {
    throw new Error("Board is not a valid 8x8 array: " + JSON.stringify(board));
  }

  const tensorData = new Array(14)
    .fill()
    .map(() => new Array(8).fill().map(() => new Array(8).fill(0)));

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

  // Điền dữ liệu cho từng ô (quân trắng và đen)
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece && piece.type && piece.color) {
        const pieceKey = piece.color === "w" ? piece.type.toUpperCase() : piece.type.toLowerCase();
        const channel = pieceMap[pieceKey];
        if (channel !== undefined) {
          tensorData[channel][rank][file] = 1;
        } else {
          console.warn("Unknown piece key:", pieceKey);
        }
      }
    }
  }

  // Kênh 12: Lượt đi (1 nếu trắng, 0 nếu đen)
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      tensorData[12][rank][file] = game.turn() === "w" ? 1 : 0;
    }
  }

  // Kênh 13: Ô hợp lệ (luôn là 1)
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      tensorData[13][rank][file] = 1;
    }
  }

  const flatData = tensorData.flat(3);
  const tensor = new Tensor("float32", new Float32Array(flatData), [1, 14, 8, 8]);

  if (flatData.length !== 14 * 8 * 8) {
    throw new Error(`Tensor data length is incorrect: ${flatData.length}, expected 896`);
  }

  console.timeEnd("Tensor creation"); // Đo thời gian tạo tensor
  return tensor;
};

// Hàm ánh xạ move sang index
const moveToIndex = (move) => {
  const from = move.from.charCodeAt(0) - 97 + (8 - parseInt(move.from[1])) * 8;
  const to = move.to.charCodeAt(0) - 97 + (8 - parseInt(move.to[1])) * 8;
  return from * 64 + to;
};

let session = null;
let modelBuffer = null;

// Tải trước mô hình khi worker khởi tạo
self.onmessage = async function (event) {
  const { fen } = event.data;

  try {
    if (!session) {
      console.time("Model loading"); // Đo thời gian tải mô hình
      const buffer = await loadModel();
      session = await InferenceSession.create(buffer, { executionProviders: ["wasm"] });
      console.timeEnd("Model loading");
      console.log("ONNX model loaded successfully in worker with WebAssembly backend");
    }

    console.time("Inference"); // Đo thời gian suy luận
    const game = new Chess(fen);
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) {
      console.log("No legal moves available");
      self.postMessage(null);
      return;
    }

    const inputTensor = boardToTensor(fen);
    const feeds = { "input": inputTensor };
    const outputMap = await session.run(feeds);
    console.log("Output map keys:", Object.keys(outputMap));

    const outputTensor = outputMap["output"];
    if (!outputTensor) {
      throw new Error("Output tensor 'output' is undefined. Available outputs: " + Object.keys(outputMap).join(", "));
    }

    console.log("Output tensor shape:", outputTensor.dims);
    console.log("Output tensor data (first 10 elements):", outputTensor.data.slice(0, 10));

    let bestMoveValue = -Infinity;
    let bestMove = null;

    for (const move of moves) {
      const moveIdx = moveToIndex(move);
      if (moveIdx < outputTensor.data.length) {
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

    console.timeEnd("Inference"); // Kết thúc đo thời gian suy luận
  } catch (error) {
    console.error("Error in botWorker:", error);
    self.postMessage(null);
  }
};

// Hàm tải mô hình (gọi trước khi xử lý FEN)
async function loadModel() {
  if (!modelBuffer) {
    const response = await fetch("/chess_dqn_improved3.onnx", {
      cache: "force-cache", // Yêu cầu caching
    });
    if (!response.ok) throw new Error(`Failed to fetch model: ${response.statusText}`);
    modelBuffer = await response.arrayBuffer();
    console.log("Model buffer size:", modelBuffer.byteLength);
  }
  return modelBuffer;
}

// Khởi tạo worker bằng cách tải mô hình ngay khi worker được tạo
loadModel().then(() => {
  console.log("Model preloaded successfully");
}).catch((error) => {
  console.error("Error preloading model:", error);
});