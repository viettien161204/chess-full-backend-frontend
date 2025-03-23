package com.btec.Chess.entities;

public class ChessMove {
    private String from; // Example: "e2"
    private String to;   // Example: "e4"
    private String player; // "white" or "black"

    public ChessMove() {}

    public ChessMove(String from, String to, String player) {
        this.from = from;
        this.to = to;
        this.player = player;
    }

    public String getFrom() { return from; }
    public void setFrom(String from) { this.from = from; }

    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }

    public String getPlayer() { return player; }
    public void setPlayer(String player) { this.player = player; }
}
