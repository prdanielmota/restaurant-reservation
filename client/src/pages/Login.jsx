import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-top">
        <div className="auth-icon">🍽️</div>
        <div className="auth-brand">Restaurante</div>
        <div className="auth-tagline">Experiência Premium</div>

        <div className="auth-heading">Entrar</div>

        {error && <div className="alert alert-err">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-sec">
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            <div className="field">
              <label>Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-gold" disabled={loading} style={{ marginTop: 12 }}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="divider"><span>ou</span></div>

        <div className="google-btn-wrapper">
          <GoogleLogin
            onSuccess={(res) => {
              googleLogin(res.credential).then(() => navigate("/")).catch((err) => setError(err.message));
            }}
            onError={() => setError("Erro ao fazer login com Google")}
            text="continue_with"
            shape="pill"
            size="large"
          />
        </div>
      </div>

      <div className="auth-footer">
        Não tem conta? <Link to="/register">Cadastre-se</Link>
      </div>
    </div>
  );
}
