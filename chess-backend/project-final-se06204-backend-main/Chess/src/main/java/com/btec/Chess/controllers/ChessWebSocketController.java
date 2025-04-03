package com.btec.Chess.controllers;

import com.btec.Chess.entities.GameState;
import com.btec.Chess.entities.Move;
import com.btec.Chess.entities.User;
import com.btec.Chess.security.JwtUtil;
import com.btec.Chess.services.UserService;
import com.github.bhlangonijr.chesslib.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
public class ChessWebSocketController {

    @Autowired
    private UserService userService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private Map<String, GameState> gameSessions = new HashMap<>();

    @MessageMapping("/create/{roomId}")
    public void createRoom(@DestinationVariable String roomId, SimpMessageHeaderAccessor headerAccessor) throws Exception {
        System.out.println("Create room request for roomId: " + roomId);
        String token = headerAccessor.getFirstNativeHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            System.out.println("Invalid token: No Bearer token provided");
            return;
        }
        token = token.substring(7);
        String email = JwtUtil.extractEmail(token);
        System.out.println("Extracted email: " + email);
        User user = userService.getUserByEmail(email);
        if (user == null) {
            System.out.println("User not found for email: " + email);
            return;
        }

        // Rời phòng cũ nếu có
        leavePreviousRoom(email);

        if (gameSessions.containsKey(roomId)) {
            System.out.println("Room already exists: " + roomId);
            return;
        }

        GameState gameState = new GameState(roomId, user, null);
        gameState.setCurrentPlayer("WHITE");
        gameSessions.put(roomId, gameState);
        System.out.println("Room created: " + roomId);
        System.out.println("Sending GameState after create: " + gameState);
        try {
            messagingTemplate.convertAndSend("/topic/game/" + roomId, gameState);
            sendRoomUpdate(); // Cập nhật danh sách phòng
            System.out.println("GameState sent successfully to /topic/game/" + roomId);
        } catch (Exception e) {
            System.err.println("Error sending GameState: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @MessageMapping("/join/{roomId}")
    public void joinRoom(@DestinationVariable String roomId, SimpMessageHeaderAccessor headerAccessor) throws Exception {
        System.out.println("Join room request for roomId: " + roomId);
        String token = headerAccessor.getFirstNativeHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            System.out.println("Invalid token: No Bearer token provided");
            return;
        }
        token = token.substring(7);
        String email = JwtUtil.extractEmail(token);
        System.out.println("Extracted email: " + email);
        User user = userService.getUserByEmail(email);
        if (user == null) {
            System.out.println("User not found for email: " + email);
            return;
        }

        // Rời phòng cũ nếu có
        leavePreviousRoom(email);

        GameState gameState = gameSessions.get(roomId);
        if (gameState == null) {
            System.out.println("Room not found: " + roomId);
            return;
        }

        if (gameState.getBlackPlayer() == null && !user.getId().equals(gameState.getWhitePlayer().getId())) {
            gameState.setBlackPlayer(user);
            gameSessions.put(roomId, gameState);
            System.out.println("User " + email + " joined as Black player in room: " + roomId);
        } else {
            System.out.println("Room is full or user already in game for roomId: " + roomId);
            return;
        }

        System.out.println("Sending GameState after join: " + gameState);
        try {
            messagingTemplate.convertAndSend("/topic/game/" + roomId, gameState);
            sendRoomUpdate(); // Cập nhật danh sách phòng
            System.out.println("GameState sent successfully to /topic/game/" + roomId);
        } catch (Exception e) {
            System.err.println("Error sending GameState: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @MessageMapping("/getState/{roomId}")
    public void getGameState(@DestinationVariable String roomId, SimpMessageHeaderAccessor headerAccessor) throws Exception {
        System.out.println("Get state request for roomId: " + roomId);
        String token = headerAccessor.getFirstNativeHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            System.out.println("Invalid token: No Bearer token provided");
            return;
        }
        token = token.substring(7);
        String email = JwtUtil.extractEmail(token);
        System.out.println("Extracted email: " + email);
        User user = userService.getUserByEmail(email);
        if (user == null) {
            System.out.println("User not found for email: " + email);
            return;
        }

        GameState gameState = gameSessions.get(roomId);
        if (gameState == null) {
            System.out.println("Room not found: " + roomId);
            return;
        }

        if (!isPlayerInGame(user.getId(), gameState)) {
            System.out.println("User " + user.getId() + " is not in game for roomId: " + roomId);
            return;
        }

        System.out.println("Sending GameState for getState: " + gameState);
        try {
            messagingTemplate.convertAndSend("/topic/game/" + roomId, gameState);
            System.out.println("GameState sent successfully to /topic/game/" + roomId);
        } catch (Exception e) {
            System.err.println("Error sending GameState: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @MessageMapping("/getAllRooms")
    public void getAllRooms(SimpMessageHeaderAccessor headerAccessor) throws Exception {
        System.out.println("Get all rooms request received");
        String token = headerAccessor.getFirstNativeHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            System.out.println("Invalid token: No Bearer token provided");
            return;
        }
        token = token.substring(7);
        String email = JwtUtil.extractEmail(token);
        System.out.println("Extracted email: " + email);
        User user = userService.getUserByEmail(email);
        if (user == null) {
            System.out.println("User not found for email: " + email);
            return;
        }

        sendRoomUpdate(); // Gửi danh sách phòng hiện tại
    }

    @MessageMapping("/move/{roomId}")
    public void handleMove(@DestinationVariable String roomId, @Payload Move move,
                           SimpMessageHeaderAccessor headerAccessor) throws Exception {
        System.out.println("Move request for roomId: " + roomId + ", move: " + move);
        String token = headerAccessor.getFirstNativeHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            System.out.println("Invalid token");
            return;
        }
        token = token.substring(7);
        String email = JwtUtil.extractEmail(token);
        User user = userService.getUserByEmail(email);
        if (user == null) {
            System.out.println("User not found for email: " + email);
            return;
        }

        GameState gameState = gameSessions.get(roomId);
        if (gameState == null) {
            System.out.println("Game state not found for roomId: " + roomId);
            return;
        }
        if (!isPlayerInGame(user.getId(), gameState)) {
            System.out.println("User " + user.getId() + " is not in game for roomId: " + roomId);
            return;
        }

        if (!move.getPlayer().equals(gameState.getCurrentPlayer())) {
            System.out.println("Not player's turn: " + move.getPlayer() + ", current: " + gameState.getCurrentPlayer());
            return;
        }

        Board board = gameState.getChessBoard();
        String fromSquare = convertToSquareNotation(move.getFromRow(), move.getFromCol());
        String toSquare = convertToSquareNotation(move.getToRow(), move.getToCol());
        String moveStr = fromSquare + toSquare + (move.getPromotion() != null ? move.getPromotion() : "");
        com.github.bhlangonijr.chesslib.move.Move chessMove;
        try {
            chessMove = new com.github.bhlangonijr.chesslib.move.Move(
                    Square.valueOf(fromSquare.toUpperCase()),
                    Square.valueOf(toSquare.toUpperCase()),
                    move.getPromotion() != null ? Piece.valueOf((move.getPlayer().equals("WHITE") ? "WHITE" : "BLACK") + "_" + move.getPromotion().toUpperCase()) : Piece.NONE
            );
        } catch (Exception e) {
            System.out.println("Invalid move format: " + moveStr);
            e.printStackTrace();
            return;
        }

        List<com.github.bhlangonijr.chesslib.move.Move> legalMoves = board.legalMoves();
        if (!legalMoves.contains(chessMove)) {
            System.out.println("Illegal move: " + moveStr + ". Legal moves: " + legalMoves);
            try {
                messagingTemplate.convertAndSend("/topic/game/" + roomId, gameState);
                System.out.println("GameState sent successfully after invalid move to /topic/game/" + roomId);
            } catch (Exception e) {
                System.err.println("Error sending GameState: " + e.getMessage());
                e.printStackTrace();
            }
            return;
        }

        Piece capturedPiece = board.getPiece(Square.valueOf(toSquare.toUpperCase()));
        if (capturedPiece != Piece.NONE) {
            move.setCaptured(capturedPiece.toString());
        } else {
            move.setCaptured(null);
        }

        board.doMove(chessMove);
        gameState.addMove(move);
        updateGameState(gameState);

        System.out.println("FEN after move: " + board.getFen());
        System.out.println("Sending GameState after move: " + gameState);
        try {
            messagingTemplate.convertAndSend("/topic/game/" + roomId, gameState);
            System.out.println("GameState sent successfully to /topic/game/" + roomId);
        } catch (Exception e) {
            System.err.println("Error sending GameState: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @MessageMapping("/getLegalMoves/{roomId}")
    public void getLegalMoves(@DestinationVariable String roomId, @Payload String square,
                              SimpMessageHeaderAccessor headerAccessor) throws Exception {
        System.out.println("Get legal moves request for roomId: " + roomId + ", square: " + square);
        String token = headerAccessor.getFirstNativeHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            System.out.println("Invalid token");
            return;
        }
        token = token.substring(7);
        String email = JwtUtil.extractEmail(token);
        User user = userService.getUserByEmail(email);
        if (user == null) {
            System.out.println("User not found for email: " + email);
            return;
        }

        GameState gameState = gameSessions.get(roomId);
        if (gameState == null) {
            System.out.println("Game state not found for roomId: " + roomId);
            return;
        }
        if (!isPlayerInGame(user.getId(), gameState)) {
            System.out.println("User " + user.getId() + " is not in game for roomId: " + roomId);
            return;
        }

        Board board = gameState.getChessBoard();
        List<com.github.bhlangonijr.chesslib.move.Move> legalMoves = board.legalMoves();
        List<String> legalDestinations = legalMoves.stream()
                .filter(move -> move.getFrom().toString().equalsIgnoreCase(square))
                .map(move -> move.getTo().toString().toLowerCase())
                .collect(Collectors.toList());

        System.out.println("Legal moves for square " + square + ": " + legalDestinations);
        try {
            messagingTemplate.convertAndSend("/topic/legalMoves/" + roomId, legalDestinations);
            System.out.println("Legal moves sent successfully to /topic/legalMoves/" + roomId);
        } catch (Exception e) {
            System.err.println("Error sending legal moves: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @MessageMapping("/chat/{roomId}")
    public void handleChat(@DestinationVariable String roomId, @Payload String message,
                           SimpMessageHeaderAccessor headerAccessor) throws Exception {
        System.out.println("Chat request for roomId: " + roomId + ", message: " + message);
        String token = headerAccessor.getFirstNativeHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            System.out.println("Invalid token");
            return;
        }
        token = token.substring(7);
        String email = JwtUtil.extractEmail(token);
        User user = userService.getUserByEmail(email);
        if (user == null) {
            System.out.println("User not found for email: " + email);
            return;
        }

        GameState gameState = gameSessions.get(roomId);
        if (gameState == null || !isPlayerInGame(user.getId(), gameState)) {
            System.out.println("Game state not found or user not in game for roomId: " + roomId);
            return;
        }
        gameState.addChatMessage(user.getId(), message);
        System.out.println("Sending GameState after chat: " + gameState);
        try {
            messagingTemplate.convertAndSend("/topic/game/" + roomId, gameState);
            System.out.println("GameState sent successfully to /topic/game/" + roomId);
        } catch (Exception e) {
            System.err.println("Error sending GameState: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private boolean isPlayerInGame(String userId, GameState gameState) {
        return userId.equals(gameState.getWhitePlayer().getId()) ||
                (gameState.getBlackPlayer() != null && userId.equals(gameState.getBlackPlayer().getId()));
    }

    private void updateGameState(GameState gameState) {
        Board board = gameState.getChessBoard();

        gameState.setCurrentPlayer(gameState.getCurrentPlayer().equals("WHITE") ? "BLACK" : "WHITE");

        CastleRight whiteCastleRight = board.getCastleRight(Side.WHITE);
        gameState.setWhiteKingCastled(whiteCastleRight == CastleRight.NONE);
        CastleRight blackCastleRight = board.getCastleRight(Side.BLACK);
        gameState.setBlackKingCastled(blackCastleRight == CastleRight.NONE);

        gameState.setEnPassantTarget(board.getEnPassantTarget() != Square.NONE ? convertSquareToPosition(board.getEnPassantTarget()) : null);

        String fen = board.getFen();
        System.out.println("FEN in updateGameState: " + fen);
        String[] fenParts = fen.split(" ");
        if (fenParts.length >= 5) {
            gameState.setHalfMoveClock(Integer.parseInt(fenParts[4]));
            gameState.setFullMoveNumber(Integer.parseInt(fenParts[5]));
        }

        System.out.println("isMated: " + board.isMated() + ", isStaleMate: " + board.isStaleMate() + ", isDraw: " + board.isDraw() + ", isKingAttacked: " + board.isKingAttacked());
        if (board.isMated()) {
            gameState.setStatus(gameState.getCurrentPlayer().equals("WHITE") ? "BLACK_WINS" : "WHITE_WINS");
            System.out.println("Game ended with status: " + gameState.getStatus());
        } else if (board.isStaleMate() || board.isDraw()) {
            gameState.setStatus("DRAW");
            System.out.println("Game ended with status: " + gameState.getStatus());
        } else if (board.isKingAttacked()) {
            gameState.setStatus("CHECK");
        } else {
            gameState.setStatus("IN_PROGRESS");
        }
    }

    private String convertToSquareNotation(int row, int col) {
        char file = (char) ('a' + col);
        int rank = 8 - row;
        return "" + file + rank;
    }

    private int[] convertSquareToPosition(Square square) {
        String squareStr = square.toString().toLowerCase();
        int col = squareStr.charAt(0) - 'a';
        int row = 8 - (squareStr.charAt(1) - '0');
        return new int[]{row, col};
    }

    private void leavePreviousRoom(String email) {
        for (Map.Entry<String, GameState> entry : gameSessions.entrySet()) {
            GameState session = entry.getValue();
            User whitePlayer = session.getWhitePlayer();
            User blackPlayer = session.getBlackPlayer();
            if (whitePlayer != null && whitePlayer.getEmail().equals(email)) {
                session.setWhitePlayer(null);
                System.out.println("User " + email + " left as White player from room: " + entry.getKey());
            } else if (blackPlayer != null && blackPlayer.getEmail().equals(email)) {
                session.setBlackPlayer(null);
                System.out.println("User " + email + " left as Black player from room: " + entry.getKey());
            }
            // Xóa phòng nếu không còn người chơi
            if (session.getWhitePlayer() == null && session.getBlackPlayer() == null) {
                gameSessions.remove(entry.getKey());
                System.out.println("Room " + entry.getKey() + " removed as it has no players");
            }
        }
        sendRoomUpdate();
    }

    private void sendRoomUpdate() {
        List<Map<String, Object>> roomDetails = gameSessions.entrySet().stream().map(entry -> {
            Map<String, Object> roomInfo = new HashMap<>();
            roomInfo.put("roomId", entry.getKey());
            roomInfo.put("whitePlayer", entry.getValue().getWhitePlayer() != null ? entry.getValue().getWhitePlayer().getEmail() : null);
            roomInfo.put("blackPlayer", entry.getValue().getBlackPlayer() != null ? entry.getValue().getBlackPlayer().getEmail() : null);
            roomInfo.put("playerCount", (entry.getValue().getWhitePlayer() != null ? 1 : 0) + (entry.getValue().getBlackPlayer() != null ? 1 : 0));
            roomInfo.put("status", entry.getValue().getStatus());
            return roomInfo;
        }).collect(Collectors.toList());

        System.out.println("Sending updated rooms: " + roomDetails);
        try {
            messagingTemplate.convertAndSend("/topic/rooms", roomDetails);
            System.out.println("Room list sent successfully to /topic/rooms");
        } catch (Exception e) {
            System.err.println("Error sending room list: " + e.getMessage());
            e.printStackTrace();
        }
    }
}