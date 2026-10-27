import { Link } from "react-router";

export default function NotFound() {
  return (
    <main className="container">
      <h1>Página não encontrada</h1>
      <Link to="/">Voltar ao início</Link>
    </main>
  );
}
