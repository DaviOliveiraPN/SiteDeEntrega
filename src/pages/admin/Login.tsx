import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router";
import { useSession } from "../../lib/useSession.ts";
import { supabase } from "../../lib/supabase.ts";

export default function Login() {
  const session = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to="/admin" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError("E-mail ou senha incorretos.");
    else navigate("/admin", { replace: true });
  }

  return (
    <main className="container">
      <h1>Entrar no painel</h1>
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input className="input" type="email" autoComplete="email" placeholder="E-mail" required
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" autoComplete="current-password" placeholder="Senha" required
          value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p style={{ color: "#b42318", margin: 0 }}>{error}</p>}
        <button className="btn" type="submit" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</button>
      </form>
    </main>
  );
}
