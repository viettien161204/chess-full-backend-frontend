import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import backgroundImage from "../assets/1.jpg";

const RoomsPage = () => {
  const [stompClient, setStompClient] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [error, setError] = useState(null);
  const WEBSOCKET_BASE_URL = "https://api.chessvn.io.vn";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
      return;
    }
    console.log("Token used in RoomsPage:", token);

    const socket = new SockJS(`${WEBSOCKET_BASE_URL}/chess-websocket`);
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log("Connected to WebSocket in RoomsPage");
      setStompClient(client);

      client.subscribe("/topic/rooms", (message) => {
        const rooms = JSON.parse(message.body);
        console.log("Received available rooms from /topic/rooms:", rooms);
        setAvailableRooms(rooms);
      });

      client.publish({
        destination: "/app/getAllRooms",
        body: "{}",
        headers: { Authorization: `Bearer ${token}` },
      });
    };

    client.onStompError = (frame) => {
      console.error("WebSocket connection error:", frame);
      setError("Failed to connect to the game server. Please try again later.");
    };

    client.activate();

    return () => {
      if (client) {
        client.deactivate();
        console.log("Disconnected from WebSocket in RoomsPage");
      }
    };
  }, []);

  return (
    <div
      className="min-h-screen w-screen overflow-hidden relative font-sans bg-black"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-pink-900/40 to-transparent"></div>
      <div className="flex h-screen overflow-hidden relative z-10">
        <SideBar />
        <div className="flex-1 flex flex-col">
          <Header className="fixed top-0 w-full z-20" />
          <main className="flex-1 p-6 mt-16 overflow-auto bg-transparent">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-200 mb-6 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">
                Danh sách phòng chơi
              </h1>
              <div className="bg-gray-900/80 rounded-2xl shadow-[0_0_20px_rgba(244,63,94,0.6)] backdrop-blur-lg p-6 neon-border">
                {error ? (
                  <p className="text-red-400 text-center drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]">
                    {error}
                  </p>
                ) : availableRooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
                    {availableRooms.map((room, index) => (
                      <React.Fragment key={index}>
                        <div className="p-4 bg-gray-800/70 rounded-lg border border-pink-500/40 text-pink-100 hover:bg-pink-900/30 hover:shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all duration-300">
                          <p className="font-semibold text-lg">{room.roomId}</p>
                        </div>
                        <div className="p-4 bg-gray-800/70 rounded-lg border border-pink-500/40 text-pink-100 hover:bg-pink-900/30 hover:shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all duration-300">
                          <p className="text-sm">
                            Players: {room.playerCount}/2
                            {room.whitePlayer && ` - White: ${room.whitePlayer}`}
                            {room.blackPlayer && ` - Black: ${room.blackPlayer}`}
                          </p>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <p className="text-pink-300 text-center drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]">
                    Không có phòng nào đang hoạt động
                  </p>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      <style jsx>{`
        @keyframes neonGlowPink {
          0% {
            box-shadow: 0 0 10px rgba(244, 63, 94, 0.6), 0 0 20px rgba(244, 63, 94, 0.5), 0 0 30px rgba(244, 63, 94, 0.4);
          }
          50% {
            box-shadow: 0 0 20px rgba(244, 63, 94, 0.5), 0 0 30px rgba(244, 63, 94, 0.4), 0 0 40px rgba(244, 63, 94, 0.3);
          }
          100% {
            box-shadow: 0 0 10px rgba(244, 63, 94, 0.6), 0 0 20px rgba(244, 63, 94, 0.5), 0 0 30px rgba(244, 63, 94, 0.4);
          }
        }
        .neon-border {
          animation: neonGlowPink 2s infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default RoomsPage;