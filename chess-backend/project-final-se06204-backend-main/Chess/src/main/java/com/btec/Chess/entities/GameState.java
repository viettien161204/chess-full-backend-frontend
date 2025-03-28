package com.btec.Chess.entities;

import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.Side;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class GameState {
    private String roomId;
    private User whitePlayer;
    private User blackPlayer;
    private Board chessBoard;
    private String currentPlayer;
    private List<Move> moveHistory;
    private List<ChatMessage> chatMessages;
    private String status;
    private boolean whiteKingCastled;
    private boolean blackKingCastled;
    private int[] enPassantTarget;
    private int halfMoveClock;
    private int fullMoveNumber;

    public GameState(String roomId, User whitePlayer, User blackPlayer) {
        this.roomId = roomId;
        this.whitePlayer = whitePlayer;
        this.blackPlayer = blackPlayer;
        this.chessBoard = new Board(); // Khởi tạo bàn cờ với trạng thái ban đầu
        this.chessBoard.loadFromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"); // Đảm bảo FEN ban đầu
        this.currentPlayer = "WHITE";
        this.moveHistory = new ArrayList<>();
        this.chatMessages = new ArrayList<>();
        this.status = "IN_PROGRESS";
        this.whiteKingCastled = false;
        this.blackKingCastled = false;
        this.enPassantTarget = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
    }

    // Getters và setters
    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public User getWhitePlayer() {
        return whitePlayer;
    }

    public void setWhitePlayer(User whitePlayer) {
        this.whitePlayer = whitePlayer;
    }

    public User getBlackPlayer() {
        return blackPlayer;
    }

    public void setBlackPlayer(User blackPlayer) {
        this.blackPlayer = blackPlayer;
    }

    public Board getChessBoard() {
        return chessBoard;
    }

    public void setChessBoard(Board chessBoard) {
        this.chessBoard = chessBoard;
    }

    public String getCurrentPlayer() {
        return currentPlayer;
    }

    public void setCurrentPlayer(String currentPlayer) {
        this.currentPlayer = currentPlayer;
    }

    public List<Move> getMoveHistory() {
        return moveHistory;
    }

    public void setMoveHistory(List<Move> moveHistory) {
        this.moveHistory = moveHistory;
    }

    public void addMove(Move move) {
        this.moveHistory.add(move);
    }

    public List<ChatMessage> getChatMessages() {
        return chatMessages;
    }

    public void setChatMessages(List<ChatMessage> chatMessages) {
        this.chatMessages = chatMessages;
    }

    public void addChatMessage(String senderId, String text) {
        this.chatMessages.add(new ChatMessage(senderId, text));
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isWhiteKingCastled() {
        return whiteKingCastled;
    }

    public void setWhiteKingCastled(boolean whiteKingCastled) {
        this.whiteKingCastled = whiteKingCastled;
    }

    public boolean isBlackKingCastled() {
        return blackKingCastled;
    }

    public void setBlackKingCastled(boolean blackKingCastled) {
        this.blackKingCastled = blackKingCastled;
    }

    public int[] getEnPassantTarget() {
        return enPassantTarget;
    }

    public void setEnPassantTarget(int[] enPassantTarget) {
        this.enPassantTarget = enPassantTarget;
    }

    public int getHalfMoveClock() {
        return halfMoveClock;
    }

    public void setHalfMoveClock(int halfMoveClock) {
        this.halfMoveClock = halfMoveClock;
    }

    public int getFullMoveNumber() {
        return fullMoveNumber;
    }

    public void setFullMoveNumber(int fullMoveNumber) {
        this.fullMoveNumber = fullMoveNumber;
    }

    @Override
    public String toString() {
        return "GameState{" +
                "roomId='" + roomId + '\'' +
                ", whitePlayer=" + whitePlayer +
                ", blackPlayer=" + blackPlayer +
                ", chessBoard=" + chessBoard.getFen() +
                ", currentPlayer='" + currentPlayer + '\'' +
                ", moveHistory=" + moveHistory +
                ", chatMessages=" + chatMessages +
                ", status='" + status + '\'' +
                '}';
    }
}

class ChatMessage {
    private String senderId;
    private String text;
    private String timestamp;

    public ChatMessage(String senderId, String text) {
        this.senderId = senderId;
        this.text = text;
        this.timestamp = new java.util.Date().toString();
    }

    public String getSenderId() { return senderId; }
    public String getText() { return text; }
    public String getTimestamp() { return timestamp; }
}