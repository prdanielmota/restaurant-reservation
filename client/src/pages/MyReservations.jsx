import { useState, useEffect } from "react";
import { api } from "../api";

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReservations = () => {
    setLoading(true);
    api
      .getReservations()
      .then(setReservations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm("Tem certeza que deseja cancelar esta reserva?")) return;
    try {
      await api.cancelReservation(id);
      loadReservations();
    } catch (err) {
      setError(err.message);
    }
  };

  const statusLabel = (status) => {
    const labels = {
      confirmed: "Confirmada",
      pending: "Pendente",
      cancelled: "Cancelada",
      completed: "Concluída",
    };
    return labels[status] || status;
  };

  const formatDate = (d) => {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const active = reservations.filter((r) => r.status !== "cancelled");
  const cancelled = reservations.filter((r) => r.status === "cancelled");

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-eyebrow">Suas reservas</div>
        <div className="page-title">Reservas</div>
      </div>

      <div className="page-body">
        {error && <div className="alert alert-err">{error}</div>}

        {reservations.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📅</div>
            <div className="empty-title">Nenhuma reserva</div>
            <div className="empty-sub">Você ainda não fez nenhuma reserva.</div>
          </div>
        ) : (
          <>
            <div className="sec-label">Ativas ({active.length})</div>
            {active.length === 0 && (
              <p style={{ color: "var(--text-2)", fontSize: 14, padding: "0 4px", marginBottom: 16 }}>
                Nenhuma reserva ativa.
              </p>
            )}
            {active.map((r) => (
              <div key={r.id} className="res-card">
                <div className="res-head">
                  <div className="res-date">{formatDate(r.date)} às {r.time}</div>
                  <span className={`badge badge-${r.status}`}>{statusLabel(r.status)}</span>
                </div>
                <div className="res-meta">
                  Mesa {r.table_number} ({r.location}) &middot; {r.guests} {r.guests === 1 ? "pessoa" : "pessoas"}
                </div>
                {r.notes && <div className="res-notes">Obs: {r.notes}</div>}
                <div className="res-foot">
                  <div style={{ fontSize: 13, color: "var(--text-2)" }}>
                    {r.table_number} &middot; {r.location}
                  </div>
                  <button
                    className="btn btn-red btn-sm"
                    onClick={() => handleCancel(r.id)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ))}

            {cancelled.length > 0 && (
              <>
                <div className="sec-label">Canceladas ({cancelled.length})</div>
                {cancelled.map((r) => (
                  <div key={r.id} className="res-card" style={{ opacity: 0.65 }}>
                    <div className="res-head">
                      <div className="res-date">{formatDate(r.date)} às {r.time}</div>
                      <span className="badge badge-cancelled">Cancelada</span>
                    </div>
                    <div className="res-meta">
                      Mesa {r.table_number} &middot; {r.guests} {r.guests === 1 ? "pessoa" : "pessoas"}
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
