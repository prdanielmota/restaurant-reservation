import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MakeReservation from "./pages/MakeReservation";
import MyReservations from "./pages/MyReservations";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname === "/admin";

  return (
    <div className={isAdmin ? "shell shell-admin" : "shell"}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/reservar"
          element={
            <ProtectedRoute>
              <MakeReservation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/minhas-reservas"
          element={
            <ProtectedRoute>
              <MyReservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
