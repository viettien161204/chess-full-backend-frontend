import logo from './logo.svg';
import './App.css';
import Home from "./pages/HomePage";
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
     
    </Routes>
  </BrowserRouter>
  );
}

export default App;
