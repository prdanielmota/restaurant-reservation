import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function MakeReservation() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [maxDate, setMaxDate] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    api.getSettings()
      .then((s) => { if (s.max_date) setMaxDate(s.max_date); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (date && guests && step === 2) {
      setLoading(true);
      setError("");
      api
        .getTimeSlots(date, guests)
        .then((slots) => {
          setTimeSlots(slots);
          setSelectedTime("");
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [date, guests, step]);

  useEffect(() => {
    if (selectedTime && step === 3) {
      setLoading(true);
      setError("");
      api
        .getAvailableTables(date, selectedTime, guests)
        .then((tables) => {
          setTables(tables);
          setSelectedTable(tables.length > 0 ? tables[0] : null);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [selectedTime, step]);

  const handleNextStep = () => {
    if (step === 1 && (!date || !guests)) {
      setError("Selecione a data e o número de pessoas");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const handleConfirm = async () => {
    if (!selectedTable) {
      setError("Selecione uma mesa");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.createReservation({
        table_id: selectedTable.id,
        date,
        time: selectedTime,
        guests,
        notes: notes || null,
      });
      navigate("/minhas-reservas");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-eyebrow">Faça sua reserva</div>
        <div className="page-title">Nova Reserva</div>
      </div>

      <div className="page-body">
        <div className="steps">
          <div className={`s-dot ${step === 1 ? "s-dot-active" : step > 1 ? "s-dot-done" : "s-dot-inactive"}`}>
            {step > 1 ? "✓" : "1"}
          </div>
          <div className={`s-line ${step > 1 ? "s-line-done" : ""}`} />
          <div className={`s-dot ${step === 2 ? "s-dot-active" : step > 2 ? "s-dot-done" : "s-dot-inactive"}`}>
            {step > 2 ? "✓" : "2"}
          </div>
          <div className={`s-line ${step > 2 ? "s-line-done" : ""}`} />
          <div className={`s-dot ${step === 3 ? "s-dot-active" : "s-dot-inactive"}`}>3</div>
        </div>

        {error && <div className="alert alert-err">{error}</div>}

        {step === 1 && (
          <div className="card">
            <div className="res-head">
              <h3 style={{ fontSize: 17 }}>Quando e quantas pessoas?</h3>
            </div>
            <div className="form-sec">
              <div className="field">
                <label>Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={today}
                  max={maxDate}
                />
              </div>
              <div className="field">
                <label>Número de pessoas</label>
                <select value={guests} onChange={(e) => setGuests(parseInt(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "pessoa" : "pessoas"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ padding: "0 16px 16px" }}>
              <button className="btn btn-gold" onClick={handleNextStep}>
                Ver Horários Disponíveis
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <div className="res-head">
              <h3 style={{ fontSize: 17 }}>Escolha o horário</h3>
            </div>
            <div className="res-meta">
              {formatDate(date)} &middot; {guests} {guests === 1 ? "pessoa" : "pessoas"}
            </div>

            {loading ? (
              <div className="loading"><div className="spinner" /></div>
            ) : (
              <>
                <div style={{ padding: "0 16px 16px" }}>
                  <div className="time-grid">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        className={`slot ${selectedTime === slot.time ? "slot-on" : ""} ${!slot.available ? "slot-off" : ""}`}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        title={slot.available ? `${slot.available_tables} mesa(s) disponível(is)` : "Indisponível"}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                  {selectedTime && (
                    <button className="btn btn-gold" onClick={handleNextStep}>
                      Escolher Mesa
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="card">
            <div className="res-head">
              <h3 style={{ fontSize: 17 }}>Confirme sua reserva</h3>
            </div>
            <div className="res-meta">
              {formatDate(date)} às {selectedTime} &middot; {guests} {guests === 1 ? "pessoa" : "pessoas"}
            </div>

            {loading ? (
              <div className="loading"><div className="spinner" /></div>
            ) : (
              <div style={{ padding: "0 16px 16px" }}>
                <div className="sec-label" style={{ marginTop: 0 }}>Mesas disponíveis</div>
                <div className="tables-grid">
                  {tables.map((table) => (
                    <div
                      key={table.id}
                      className={`t-card ${selectedTable?.id === table.id ? "t-on" : ""}`}
                      onClick={() => setSelectedTable(table)}
                    >
                      <div className="t-num">{table.table_number}</div>
                      <div className="t-cap">{table.capacity} lugares</div>
                      <div className="t-loc">{table.location}</div>
                    </div>
                  ))}
                </div>

                <div className="form-sec" style={{ marginBottom: 16 }}>
                  <div className="field">
                    <label>Observações (opcional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="Ex: aniversário, alérgico a..."
                    />
                  </div>
                </div>

                <button
                  className="btn btn-gold"
                  onClick={handleConfirm}
                  disabled={loading || !selectedTable}
                >
                  {loading ? "Confirmando..." : "Confirmar Reserva"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
