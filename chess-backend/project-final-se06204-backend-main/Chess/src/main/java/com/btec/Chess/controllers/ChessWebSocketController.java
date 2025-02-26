package com.btec.Chess.controllers;

import com.btec.Chess.entities.GameState;
import com.btec.Chess.entities.Move;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChessWebSocketController {

    @MessageMapping("/move")
    @SendTo("/topic/game")
    public GameState handleMove(Move move) {
        // Logic to update the game state based on the move
        GameState gameState = updateGameState(move);
        return gameState;
    }

    private GameState updateGameState(Move move) {
        // Implement your game logic here
        // Update the board, check for win conditions, etc.
        return new GameState(); // Return the updated game state
    }
}
