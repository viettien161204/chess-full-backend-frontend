//package com.btec.Chess.controllers;
//
//import com.btec.Chess.entities.GameState;
//import com.btec.Chess.entities.Move;
//import org.springframework.messaging.handler.annotation.MessageMapping;
//import org.springframework.messaging.handler.annotation.SendTo;
//import org.springframework.stereotype.Controller;
//
//import java.util.concurrent.ConcurrentHashMap;
//
//@Controller
//public class ChessWebSocketController {
//
//    private final ConcurrentHashMap<String, GameState> games = new ConcurrentHashMap<>(); // Stores game states by game ID
//
//    @MessageMapping("/join")
//    @SendTo("/topic/game")
//    public GameState joinGame(String gameId) {
//        games.putIfAbsent(gameId, new GameState(gameId)); // Create new game if not exists
//        return games.get(gameId);
//    }
//
//    @MessageMapping("/move")
//    @SendTo("/topic/game")
//    public GameState handleMove(Move move) {
//        String gameId = move.getGameId();
//        GameState gameState = games.get(gameId);
//
//        if (gameState != null && gameState.isValidMove(move)) {
//            gameState.applyMove(move);
//            return gameState;
//        }
//        return gameState; // Send unchanged state if move is invalid
//    }
//}
