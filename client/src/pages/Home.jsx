import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="guest-hero">
        <div className="guest-gfx">
          <div className="guest-plate">🍽️</div>
          <div className="guest-copy">
            <div className="guest-eyebrow">✦ Experiência Premium</div>
            <h1 className="guest-h1">Reserve sua<br />mesa com<br />facilidade</h1>
            <p className="guest-p">Escolha o melhor horário para sua experiência gastronômica.</p>
          </div>
        </div>
        <div className="guest-actions">
          <Link to="/register" className="btn btn-gold">Criar Conta</Link>
          <Link to="/login" className="btn btn-dark">Já tenho conta</Link>
        </div>
      </div>
    );
  }

  const firstName = user.name.split(" ")[0];

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-eyebrow">Bem-vindo de volta</div>
        <div className="page-title">{firstName} 👋</div>
      </div>

      <div className="page-body">
        <div className="card-gold" style={{ padding: "24px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
            Mesa disponível
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px", marginBottom: 4 }}>
            Reserve sua mesa
          </div>
          <div style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 20 }}>
            Almoço · Jantar · Qualquer ocasião
          </div>
          <Link to="/reservar" className="btn btn-gold" style={{ width: "auto", padding: "12px 24px", borderRadius: "var(--r-m)" }}>
            Nova Reserva
          </Link>
        </div>

        <Link to="/minhas-reservas" style={{ textDecoration: "none" }}>
          <div className="card card-p" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--gold-dim)", border: "0.5px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
              📋
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>Minhas Reservas</div>
              <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>Ver e gerenciar reservas</div>
            </div>
            <div style={{ color: "var(--text-3)", fontSize: 20, fontWeight: 300 }}>›</div>
          </div>
        </Link>

        <div className="sec-label">Informações</div>
        <div className="card">
          {[
            { icon: "🕐", title: "Horários", desc: "Almoço 11h–15h · Jantar 18h–22h" },
            { icon: "🍷", title: "Ambientes", desc: "Salão principal, terraço e área reservada" },
            { icon: "👥", title: "Grupos", desc: "Mesas para 2 até 10 pessoas" },
            { icon: "📱", title: "Cancelamento", desc: "Cancele quando precisar pelo app" },
          ].map((item, i, arr) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px",
                borderBottom: i < arr.length - 1 ? "0.5px solid var(--sep-2)" : "none",
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 15 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
