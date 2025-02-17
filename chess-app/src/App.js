import logo from './logo.svg';
import './App.css';
import Home from "./pages/HomePage";
import Dash from "./pages/DashboardPage";
import Register from "./pages/Register";
import Login from "./pages/Login";


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
      <Route path="/login" element={<Login />}>
      </Route>
      <Route path="/register" element={<Register/>}>
      </Route>
     
    </Routes>
  </BrowserRouter>
  );
}

export default App;
