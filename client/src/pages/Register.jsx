import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Senhas não conferem");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
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

        <div className="auth-heading">Criar Conta</div>

        {error && <div className="alert alert-err">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-sec">
            <div className="field">
              <label>Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>
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
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>
            <div className="field">
              <label>Confirmar Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                minLength={6}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-gold" disabled={loading} style={{ marginTop: 12 }}>
            {loading ? "Criando conta..." : "Criar Conta"}
          </button>
        </form>

        <div className="divider"><span>ou</span></div>

        <div className="google-btn-wrapper">
          <GoogleLogin
            onSuccess={(res) => {
              googleLogin(res.credential).then(() => navigate("/")).catch((err) => setError(err.message));
            }}
            onError={() => setError("Erro ao fazer login com Google")}
            text="signup_with"
            shape="pill"
            size="large"
          />
        </div>
      </div>

      <div className="auth-footer">
        Já tem conta? <Link to="/login">Entrar</Link>
      </div>
    </div>
  );
}
