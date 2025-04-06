/* eslint-disable */
// src/stockfishWorker.js
importScripts("https://cdn.jsdelivr.net/npm/stockfish@16.0.0/dist/stockfish.js");

const stockfish = new Stockfish();

stockfish.onmessage = function (event) {
  console.log("Stockfish message:", event.data);
  const message = event.data;
  if (message.startsWith("bestmove")) {
    const bestMove = message.split(" ")[1];
    if (bestMove) {
      console.log("Best move found:", bestMove);
      self.postMessage({ from: bestMove.slice(0, 2), to: bestMove.slice(2, 4) });
    } else {
      console.log("No valid best move");
    }
  }
};

self.onmessage = function (event) {
  console.log("Worker received:", event.data);
  const { fen, depth } = event.data;
  stockfish.postMessage(`position fen ${fen}`);
  stockfish.postMessage(`go depth ${depth}`);
};