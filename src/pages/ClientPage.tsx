import { useParams } from "react-router";

// TODO (build step 5): require a token, call `page-content`, render blocks.
export default function ClientPage() {
  const { slug } = useParams();
  return (
    <main className="container">
      <h1>Página: {slug}</h1>
    </main>
  );
}
