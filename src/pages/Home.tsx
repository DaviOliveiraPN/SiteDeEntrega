import { Link } from "react-router";

// TODO (build step 12): render home blocks + contact info from site_settings.
export default function Home() {
  return (
    <main className="container">
      <h1>Suas memórias estão prontas</h1>
      <Link className="btn" to="/access">Acessar seu conteúdo</Link>
    </main>
  );
}
