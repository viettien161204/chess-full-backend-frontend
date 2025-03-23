package com.btec.Chess.controllers;

import com.btec.Chess.services.GameRoomService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://127.0.0.1:5500") // Allow frontend requests
@RestController
@RequestMapping("/game")
public class GameController {

    private final SimpMessagingTemplate messagingTemplate;
    private final GameRoomService gameRoomService;

    public GameController(SimpMessagingTemplate messagingTemplate, GameRoomService gameRoomService) {
        this.messagingTemplate = messagingTemplate;
        this.gameRoomService = gameRoomService;
    }

    @PostMapping("/join")
    @ResponseBody
    public Map<String, Object> joinGame(@RequestParam String roomId, @RequestParam String playerId) {
        Map<String, Object> response = new HashMap<>();
        boolean joined = gameRoomService.joinRoom(roomId, playerId);

        response.put("joined", joined);
        response.put("roomFull", gameRoomService.isRoomFull(roomId));
        return response;
    }

    @MessageMapping("/move/{roomId}")
    public void sendMove(@RequestBody Move move, @PathVariable String roomId) {
        messagingTemplate.convertAndSend("/room/" + roomId, move);
    }
}

class Move {
    public String from;
    public String to;
    public String player;
}
