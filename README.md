# Event Moments — MVP do convidado

Front-end da entrega de fotos e vídeos, rodando só no navegador com **dados fictícios**.
Arquitetura e decisões: veja `CLAUDE.md`.

## Rodar

Requisito: Node 24.

```bash
npm install
npm run dev          # http://localhost:5173
```

Códigos de teste (mock):

| Código | Entrega | Estado |
|---|---|---|
| `AURORA2026K` | Marina & Lucas | ativa, ~80 arquivos |
| `MAREVIVA7Q` | Júlia & Pedro | ativa, poucos arquivos |
| `OUTONO48XZ` | Bia & Rafa | expirada |

Cinco códigos errados em um minuto bloqueiam novas tentativas por 60 s (recarregue a página para zerar).

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm test` | Testes unitários (Vitest) |
| `npm run test:e2e` | E2E (Playwright, viewport de celular). Na 1ª vez: `npx playwright install chromium` |
| `npm run typecheck` | TypeScript |
| `npm run lint` | oxlint |
| `npm run build` | Build estático (`dist/`) para o Cloudflare Pages |

## Onde mexer

- Dados fictícios: `src/mocks/` (gerados por `src/mocks/factory.ts`).
- Troca para a API real: só `src/services/index.ts`.
- Cores/tipografia: `src/theme/tokens.ts` + bloco `@theme` em `src/index.css` (um teste garante que estão iguais).
- Vídeos de exemplo: `public/mock/videos/` (placeholders WebM; troque por MP4 H.264 para o iPhone).
