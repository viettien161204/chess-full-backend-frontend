package com.btec.Chess.entities;

public class Move {
    private int fromRow;
    private int fromCol;
    private int toRow;
    private int toCol;
    private String player; // "WHITE" hoặc "BLACK"
    private String piece;  // Loại quân di chuyển (ví dụ: "WP", "BK")
    private String promotion; // Phong hậu (nếu có, ví dụ: "Q" cho Queen)
    private String captured; // Quân cờ bị ăn (nếu có, ví dụ: "BP")

    public Move(int fromRow, int fromCol, int toRow, int toCol, String player, String piece) {
        this.fromRow = fromRow;
        this.fromCol = fromCol;
        this.toRow = toRow;
        this.toCol = toCol;
        this.player = player;
        this.piece = piece;
        this.promotion = null;
        this.captured = null;
    }

    // Getters và setters
    public int getFromRow() { return fromRow; }
    public void setFromRow(int fromRow) { this.fromRow = fromRow; }

    public int getFromCol() { return fromCol; }
    public void setFromCol(int fromCol) { this.fromCol = fromCol; }

    public int getToRow() { return toRow; }
    public void setToRow(int toRow) { this.toRow = toRow; }

    public int getToCol() { return toCol; }
    public void setToCol(int toCol) { this.toCol = toCol; }

    public String getPlayer() { return player; }
    public void setPlayer(String player) { this.player = player; }

    public String getPiece() { return piece; }
    public void setPiece(String piece) { this.piece = piece; }

    public String getPromotion() { return promotion; }
    public void setPromotion(String promotion) { this.promotion = promotion; }

    public String getCaptured() { return captured; }
    public void setCaptured(String captured) { this.captured = captured; }

    @Override
    public String toString() {
        return "Move{" +
                "fromRow=" + fromRow +
                ", fromCol=" + fromCol +
                ", toRow=" + toRow +
                ", toCol=" + toCol +
                ", player='" + player + '\'' +
                ", piece='" + piece + '\'' +
                ", promotion='" + promotion + '\'' +
                ", captured='" + captured + '\'' +
                '}';
    }
}