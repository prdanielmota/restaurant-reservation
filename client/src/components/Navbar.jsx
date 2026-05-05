import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const IcoHome = ({ on }) => (
  <svg viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
);

const IcoCalendar = ({ on }) => (
  <svg viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="3"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
    {on && <circle cx="12" cy="16" r="1.5" fill="currentColor"/>}
  </svg>
);

const IcoList = ({ on }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" fill={on ? "currentColor" : "none"} fillOpacity={on ? ".15" : "0"}/>
    <path d="M7 8h10M7 12h10M7 16h6"/>
  </svg>
);

const IcoSettings = ({ on }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2.5" fill={on ? "currentColor" : "none"}/>
    <path d="M12 2v2.5M12 19.5V22M4.22 4.22l1.77 1.77M18.01 18.01l1.77 1.77M2 12h2.5M19.5 12H22M4.22 19.78l1.77-1.77M18.01 5.99l1.77-1.77"/>
  </svg>
);

const IcoPerson = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const p = location.pathname;

  if (!user) return null;

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <nav className="bnav">
      <Link to="/" className={`bnav-item ${p === "/" ? "active" : ""}`}>
        <IcoHome on={p === "/"} />
        <span>Início</span>
      </Link>

      <Link to="/reservar" className={`bnav-item ${p === "/reservar" ? "active" : ""}`}>
        <IcoCalendar on={p === "/reservar"} />
        <span>Reservar</span>
      </Link>

      <Link to="/minhas-reservas" className={`bnav-item ${p === "/minhas-reservas" ? "active" : ""}`}>
        <IcoList on={p === "/minhas-reservas"} />
        <span>Reservas</span>
      </Link>

      {user.role === "admin" && (
        <Link to="/admin" className={`bnav-item ${p === "/admin" ? "active" : ""}`}>
          <IcoSettings on={p === "/admin"} />
          <span>Admin</span>
        </Link>
      )}

      <button className="bnav-item" onClick={handleLogout}>
        <IcoPerson />
        <span>Sair</span>
      </button>
    </nav>
  );
}
