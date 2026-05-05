import { useState, useEffect } from "react";
import { api } from "../api";

export default function AdminDashboard() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddTable, setShowAddTable] = useState(false);
  const [newTable, setNewTable] = useState({ table_number: "", capacity: "", location: "Salão Principal" });
  const [maxDate, setMaxDate] = useState("");

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getReservations(), api.getTables(), api.getSettings()])
      .then(([res, tbls, settings]) => {
        setReservations(res);
        setTables(tbls);
        setMaxDate(settings.max_date || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateReservation(id, { status });
      setSuccess("Status atualizado!");
      setTimeout(() => setSuccess(""), 3000);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      await api.addTable(newTable);
      setNewTable({ table_number: "", capacity: "", location: "Salão Principal" });
      setShowAddTable(false);
      setSuccess("Mesa adicionada!");
      setTimeout(() => setSuccess(""), 3000);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeactivateTable = async (id) => {
    if (!confirm("Desativar esta mesa?")) return;
    try {
      await api.deactivateTable(id);
      setSuccess("Mesa desativada!");
      setTimeout(() => setSuccess(""), 3000);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveMaxDate = async (e) => {
    e.preventDefault();
    try {
      await api.saveSetting("max_date", maxDate);
      setSuccess("Data limite atualizada!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = reservations.filter((r) => {
    if (dateFilter && r.date !== dateFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    return true;
  });

  const todayReservations = reservations.filter((r) => r.date === new Date().toISOString().split("T")[0]);
  const confirmed = reservations.filter((r) => r.status === "confirmed");
  const pending = reservations.filter((r) => r.status === "pending");

  const statusLabel = (status) => {
    const labels = { confirmed: "Confirmada", pending: "Pendente", cancelled: "Cancelada", completed: "Concluída" };
    return labels[status] || status;
  };

  const formatDate = (d) => {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="admin-wrap">
      <div className="admin-top">
        <div className="admin-title">Painel</div>
      </div>

      {error && <div className="alert alert-err">{error}</div>}
      {success && <div className="alert alert-ok">{success}</div>}

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-val">{todayReservations.length}</div>
          <div className="stat-label">Reservas Hoje</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-val">{confirmed.length}</div>
          <div className="stat-label">Confirmadas</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-val">{pending.length}</div>
          <div className="stat-label">Pendentes</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🪑</div>
          <div className="stat-val">{tables.filter((t) => t.is_active).length}</div>
          <div className="stat-label">Mesas Ativas</div>
        </div>
      </div>

      <div className="admin-cols">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Reservas</h3>
          </div>

          <div className="admin-panel-body" style={{ paddingBottom: 0 }}>
            <div className="admin-filters">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="inp"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="inp"
              >
                <option value="">Todos os status</option>
                <option value="confirmed">Confirmadas</option>
                <option value="pending">Pendentes</option>
                <option value="cancelled">Canceladas</option>
                <option value="completed">Concluídas</option>
              </select>
            </div>
          </div>

          <div className="admin-panel-body no-pad">
            {filtered.length === 0 ? (
              <div className="empty" style={{ padding: "48px 24px" }}>
                <div className="empty-title">Nenhuma reserva</div>
                <div className="empty-sub">Nenhuma reserva encontrada com esses filtros.</div>
              </div>
            ) : (
              filtered.map((r) => (
                <div key={r.id} className="a-row">
                  <div className="a-row-main">
                    <div className="a-row-user">{r.user_name}</div>
                    <div className="a-row-email">{r.user_email}</div>
                    <div className="a-row-detail">
                      <span>{formatDate(r.date)} às {r.time}</span>
                      <span>&middot;</span>
                      <span>Mesa {r.table_number}</span>
                      <span>&middot;</span>
                      <span>{r.guests} {r.guests === 1 ? "pessoa" : "pessoas"}</span>
                      <span>&middot;</span>
                      <span className={`badge badge-${r.status}`}>{statusLabel(r.status)}</span>
                    </div>
                    {r.notes && <div className="a-row-notes">Obs: {r.notes}</div>}
                  </div>
                  <div className="a-row-actions">
                    {r.status === "pending" && (
                      <button className="btn btn-green btn-sm" onClick={() => handleStatusChange(r.id, "confirmed")}>
                        Confirmar
                      </button>
                    )}
                    {r.status === "confirmed" && (
                      <button className="btn btn-dark btn-sm" onClick={() => handleStatusChange(r.id, "completed")}>
                        Concluir
                      </button>
                    )}
                    {r.status !== "cancelled" && (
                      <button className="btn btn-red btn-sm" onClick={() => handleStatusChange(r.id, "cancelled")}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Mesas</h3>
            <button className="btn btn-gold btn-sm" onClick={() => setShowAddTable(!showAddTable)}>
              {showAddTable ? "Fechar" : "+ Adicionar"}
            </button>
          </div>

          {showAddTable && (
            <div className="admin-panel-body" style={{ borderBottom: "0.5px solid var(--sep-2)" }}>
              <form onSubmit={handleAddTable}>
                <div className="form-sec">
                  <div className="field">
                    <label>Número da mesa</label>
                    <input
                      type="text"
                      value={newTable.table_number}
                      onChange={(e) => setNewTable({ ...newTable, table_number: e.target.value })}
                      placeholder="Ex: M11"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Capacidade</label>
                    <input
                      type="number"
                      value={newTable.capacity}
                      onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                      min="1"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Local</label>
                    <select
                      value={newTable.location}
                      onChange={(e) => setNewTable({ ...newTable, location: e.target.value })}
                    >
                      <option>Salão Principal</option>
                      <option>Terraço</option>
                      <option>Reservado</option>
                    </select>
                  </div>
                </div>
                <div style={{ padding: "0 16px 16px" }}>
                  <button type="submit" className="btn btn-gold btn-sm">
                    Salvar Mesa
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="admin-panel-body no-pad">
            {tables
              .filter((t) => t.is_active)
              .map((t) => (
                <div key={t.id} className="row">
                  <div>
                    <strong>{t.table_number}</strong>
                    <span style={{ marginLeft: 8, fontSize: 13, color: "var(--text-2)" }}>
                      {t.capacity} lugares &middot; {t.location}
                    </span>
                  </div>
                  <button className="btn btn-red btn-sm" onClick={() => handleDeactivateTable(t.id)}>
                    Desativar
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div className="admin-panel" style={{ marginTop: 20 }}>
          <div className="admin-panel-head">
            <h3>Configurações</h3>
          </div>
          <div className="admin-panel-body">
            <form onSubmit={handleSaveMaxDate}>
              <div className="form-sec">
                <div className="field">
                  <label>Data limite para reservas</label>
                  <input
                    type="date"
                    value={maxDate}
                    onChange={(e) => setMaxDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>
              <div style={{ padding: "8px 0 0" }}>
                <button type="submit" className="btn btn-gold btn-sm">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
