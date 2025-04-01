**ChessVN - Online Chess Platform**


ChessVN is an online chess platform developed using ReactJS (frontend), Java Spring Boot (backend), and MongoDB (database). The project supports multiple game modes including offline play, online play with others via WebSocket, and playing against a bot (using Stockfish or a custom bot).

**Key Features**
Offline Play: Two players on the same computer, no internet required.
Online Play: Connect with players worldwide via WebSocket, with in-game chat and player rankings.
Play with Bot: Challenge an AI (Stockfish or custom bot) with adjustable difficulty levels.
Responsive Interface: Works well on both desktop and mobile devices.
Move History: Track moves during the game.
Exit/Reset Confirmation: Warns players when leaving or resetting a game.

**Technologies Used**
Frontend: ReactJS, React Router, Tailwind CSS, react-chessboard
Backend: Java Spring Boot, Spring WebSocket, Spring Data MongoDB
Database: MongoDB
AI Bot: Stockfish (integrated via Web Worker), custom bot
WebSocket: SockJS and STOMP for real-time online play

**System Requirements**
Node.js (v16.x or higher)
Java (JDK 17 or higher)
Maven (for backend)
MongoDB (local or MongoDB Atlas)
Modern browser (Chrome, Firefox, Edge, etc.)

**Installation**

1. Clone the Repository

git clone https://github.com/[your-username]/ChessVN.git
cd ChessVN

2. Install Frontend
Navigate to the frontend directory and install dependencies:

cd frontend
npm install

3. Install Backend
Navigate to the backend directory and build the project:

cd ../backend
mvn clean install

4. Configure MongoDB
Install MongoDB locally or use MongoDB Atlas.
Update the application.properties file in backend/src/main/resources with your MongoDB connection details:

spring.data.mongodb.uri=mongodb://localhost:27017/chessvn

5. Run the Application
Run Backend:

cd backend
mvn spring-boot:run
The backend will run on http://localhost:8080 by default.

Run Frontend:

cd frontend
npm start
The frontend will run on http://localhost:3000.

6. Integrate Stockfish (for bot mode)
Ensure the stockfish.js file is placed in the frontend/public/stockfish directory.
If missing, download it from Stockfish GitHub and add it.
Usage



- Home Page (/)
Choose a game mode: Offline, Online, or Bot.
Register/Login if you want to play online.
- Offline Play (/chess)
Two players take turns moving pieces on the same device.
- Online Play (/chessonline)
Log in to create or join a room.
Use the chat and track move history during the match.
- Play with Bot (/chessbot)
Select bot type (Custom or Stockfish) and difficulty level (Elo from 800 to 3200).
Start the game and challenge the AI.


**Project Structure**

ChessVN/
├── frontend/               # ReactJS source code
│   ├── src/                # Source code
│   │   ├── PlayOfflinePage.js   # Offline play component
│   │   ├── HomePage.js          # Home page
│   │   ├── PlayOnlinePage.js    # Online play component
│   │   ├── PlayWithBot.js       # Bot play component
│   │   └── 1.png                # Logo
│   └── public/
│       └── stockfish/      # Stockfish files
├── backend/                # Spring Boot source code
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   │       └── application.properties
│   └── pom.xml
└── README.md



**Contributing**
1. Fork this repository.
2. Create a new branch (git checkout -b feature/your-feature).
3. Commit your changes (git commit -m "Add your feature").
4. Push to the branch (git push origin feature/your-feature).
5. Create a Pull Request.

   
**License**
This project is licensed under the .

Contact
Email: nguyenviettien161204@gmail.com
Phone: 0356566213
