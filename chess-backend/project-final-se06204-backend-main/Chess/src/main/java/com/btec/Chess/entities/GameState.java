package com.btec.Chess.entities;

//public class GameState {
//
//    private String gameId;
//    private String fen; // FEN string representing the chess board state
//    private String currentPlayer; // "w" for white, "b" for black
//    private String status; // e.g., "IN_PROGRESS", "WHITE_WINS", "BLACK_WINS", "DRAW"
//
//    // Getters and setters
//    public String getFen() { return fen; }
//    public void setFen(String fen) { this.fen = fen; }
//    public String getCurrentPlayer() { return currentPlayer; }
//    public void setCurrentPlayer(String currentPlayer) { this.currentPlayer = currentPlayer; }
//    public String getStatus() { return status; }
//    public void setStatus(String status) { this.status = status; }
//}


import java.util.UUID;

public class GameState {
    private String gameId;
    private String fen; // Stores the board position in FEN format
    private String currentPlayer;

    public GameState(String gameId) {
        this.gameId = gameId;
        this.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; // Standard starting FEN
        this.currentPlayer = "w"; // White starts
    }

    public String getGameId() {
        return gameId;
    }

    public void setGameId(String gameId) {
        this.gameId = gameId;
    }

    public String getFen() {
        return fen;
    }

    public void setFen(String fen) {
        this.fen = fen;
    }

    public String getCurrentPlayer() {
        return currentPlayer;
    }

    public void setCurrentPlayer(String currentPlayer) {
        this.currentPlayer = currentPlayer;
    }

    public boolean isValidMove(ChessMove move) {
        return move.getFrom() != null && move.getTo() != null; // Add proper move validation
    }

    public void applyMove(ChessMove move) {
        // Placeholder logic: Update FEN and switch player (use chess library for real moves)
        this.fen = this.fen;
        this.currentPlayer = this.currentPlayer.equals("w") ? "b" : "w";
    }

    // Getters and Setters
}
