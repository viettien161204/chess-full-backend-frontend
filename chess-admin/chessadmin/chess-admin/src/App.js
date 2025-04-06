import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import Homepage from './pages/Homepage';
import RankPage from './pages/RankPage';
import RoomsPage from './pages/RoomsPage';
import ServerPerformancePage from "./pages/ServerPerformancePage"; // Thêm RoomsPage

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token || token !== "admin-token") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Homepage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rank"
          element={
            <ProtectedRoute>
              <RankPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rooms"
          element={
            <ProtectedRoute>
              <RoomsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/server-performance"
          element={
            <ProtectedRoute>
              <ServerPerformancePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;