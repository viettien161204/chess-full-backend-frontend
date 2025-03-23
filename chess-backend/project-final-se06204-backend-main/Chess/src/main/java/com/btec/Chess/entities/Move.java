package com.btec.Chess.entities;

public class Move {
    private String from; // Source square (e.g., "e2")
    private String to; // Target square (e.g., "e4")
    private String promotion; // Optional promotion piece (e.g., "q", "r", "b", "n")

    // Getters and Setters
    public String getFrom() { return from; }
    public void setFrom(String from) { this.from = from; }
    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }
    public String getPromotion() { return promotion; }
    public void setPromotion(String promotion) { this.promotion = promotion; }
}