package com.btec.Chess.controllers;

import com.btec.Chess.entities.ChessMove;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChessGameController {

    @MessageMapping("/move") // Clients send moves here
    @SendTo("/game/moves") // Broadcast to all subscribers
    public ChessMove processMove(ChessMove move) {
        System.out.println("Received move: " + move.getFrom() + " to " + move.getTo());
        return move; // Sends back move details to clients
    }
}

