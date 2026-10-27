# Event Moments

Entrega de fotos e vídeos de eventos. Veja `CLAUDE.md` para arquitetura e decisões.

## Desenvolvimento local

Requisitos: Node 24, Docker (para o Supabase local).

```bash
npm install
npx supabase start          # Postgres, Auth e Edge Functions locais (Docker)
npx supabase status         # copie API URL e anon key
cp .env.example .env.local  # preencha com os valores acima
cp supabase/functions/.env.example supabase/functions/.env
npm run dev                 # http://127.0.0.1:5173
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | SPA em modo desenvolvimento |
| `npm test` | Testes unitários (Vitest) dos módulos de segurança |
| `npm run typecheck` | TypeScript (SPA + `supabase/functions/_shared` + testes) |
| `npm run lint` | oxlint |
| `npm run build` | Build estático para o Cloudflare Pages |
