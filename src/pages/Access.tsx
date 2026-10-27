// TODO (build step 5): call the `access` Edge Function, store the token, go to /p/:slug.
export default function Access() {
  return (
    <main className="container">
      <h1>Acessar seu conteúdo</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="code">Código de acesso</label>
        <input
          id="code"
          className="input"
          autoComplete="one-time-code"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="ABCDE-FGHJK"
        />
        <p />
        <button className="btn" type="submit">Entrar</button>
      </form>
    </main>
  );
}
