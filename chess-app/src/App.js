import logo from './logo.svg';
import './App.css';
import Home from "./pages/HomePage";
import Login from "./pages/Login";
import Forgotpassword from "./pages/ForgotPassword";
import Register from "./pages/Register";

import Dash from "./pages/DashboardPage";
import Profile from "./pages/Profile";

import PlayOffline from "./pages/PlayOfflinePage";
import PlayWithBot from "./pages/PlayWithBot";
import PlayOnline from "./pages/PlayOnlinePage";
import PuzzleMode from "./pages/PuzzleMode";
import DailyMode from "./pages/DailyChallenge";
import GameMode from "./pages/GameModes";
import Leaderboard from "./pages/Leaderboard";
import Tournaments from "./pages/Tournaments";



import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />}>
      </Route>
      <Route path="/inDev" element={<Dash />}>
      </Route>
      <Route path="/chess" element={<PlayOffline />}>
      </Route>
      <Route path="/profile" element={<Profile />}>
      </Route>
      <Route path="/register" element={<Register />}>
      </Route>
      <Route path="/login" element={<Login />}>
      </Route>
      <Route path="/forgotpassword" element={<Forgotpassword/>}>
      </Route>
      <Route path="/chessbot" element={<PlayWithBot />}>
      </Route>
      <Route path="/chessonline" element={<PlayOnline />}>
      </Route>
      <Route path="/puzzlemode" element={<PuzzleMode />}>
      </Route>
      <Route path="/dailymode" element={<DailyMode />}>
      </Route>
      <Route path="/gamemode" element={<GameMode />}>
      </Route>
      <Route path="/leaderboard" element={<Leaderboard />}>
      </Route>
      <Route path="/tournaments" element={<Tournaments />}>
      </Route>
     
    </Routes>

    
  </BrowserRouter>
  
  );
}

export default App;
