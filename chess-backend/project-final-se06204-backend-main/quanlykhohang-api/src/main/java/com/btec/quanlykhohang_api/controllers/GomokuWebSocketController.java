package com.btec.quanlykhohang_api.controllers;

import com.btec.quanlykhohang_api.entities.GameState;
import com.btec.quanlykhohang_api.entities.Move;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class GomokuWebSocketController {

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
