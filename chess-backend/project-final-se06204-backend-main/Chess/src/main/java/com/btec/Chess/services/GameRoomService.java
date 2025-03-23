package com.btec.Chess.services;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class GameRoomService {
    private final Map<String, String[]> gameRooms = new HashMap<>();

    public boolean joinRoom(String roomId, String playerId) {
        gameRooms.putIfAbsent(roomId, new String[2]); // Create room if not exists
        String[] players = gameRooms.get(roomId);

        if (players[0] == null) {
            players[0] = playerId;
            return true;
        } else if (players[1] == null) {
            players[1] = playerId;
            return true;
        }
        return false; // Room full
    }

    public boolean isRoomFull(String roomId) {
        return gameRooms.containsKey(roomId) && gameRooms.get(roomId)[1] != null;
    }
}
