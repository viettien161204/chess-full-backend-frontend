import logo from './logo.svg';
import './App.css';
import Home from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dash from "./pages/DashboardPage";


import PlayOffline from "./pages/PlayOfflinePage";

import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />}>
        <Route index element={<Dash />} />
      </Route>
      <Route path="/chess" element={<PlayOffline />}>
      </Route>
      <Route path="/register" element={<Register />}>
      </Route>
      <Route path="/login" element={<Login />}>
      </Route>
     
    </Routes>
  </BrowserRouter>
  );
}

export default App;
