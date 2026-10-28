import { expect, test, type Page } from '@playwright/test';

async function enterCode(page: Page, code: string) {
  await page.goto('/access');
  await page.getByLabel('Código de acesso').fill(code);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

test('code → letter → landing → gallery → photo → download', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Acessar seu conteúdo' }).click();
  await expect(page).toHaveURL(/\/access$/);

  await enterCode(page, 'AURORA2026K');
  await expect(page).toHaveURL(/\/p\/marina-lucas$/);

  const letter = page.getByRole('dialog', { name: 'Marina & Lucas' });
  await expect(letter.getByText('Uma carta para vocês')).toBeVisible();
  await letter.getByRole('button', { name: /Abrir minha entrega/ }).click();
  await expect(letter).toBeHidden();

  await expect(page.getByRole('heading', { level: 1, name: 'Marina & Lucas' })).toBeVisible();
  await expect(page.getByText(/seu dia foi há \d+ dias/)).toBeVisible();

  await page.getByRole('button', { name: /Ver todos os arquivos \(\d+\)/ }).click();
  const gallery = page.getByRole('dialog', { name: 'Todos os arquivos' });
  await expect(gallery).toBeVisible();

  await gallery.getByRole('radio', { name: /Fotos/ }).click();
  await expect(gallery.getByRole('button', { name: /Baixar as fotos/ })).toBeVisible();
  await gallery.getByRole('button', { name: /^Ver: Foto/ }).first().click();

  const lightbox = page.getByRole('dialog', { name: 'Visualizador de mídia' });
  await expect(lightbox.getByText(/^1 \/ \d+$/)).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(lightbox.getByText(/^2 \/ \d+$/)).toBeVisible();

  await lightbox.getByRole('button', { name: 'Baixar' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('menuitem', { name: /Versão web/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^marina-lucas-.+\.jpg$/);

  // Back gesture closes overlays one at a time.
  await page.goBack();
  await expect(lightbox).toBeHidden();
  await expect(gallery).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(gallery).toBeHidden();
  await expect(page).toHaveURL(/\/p\/marina-lucas$/);
});

test('refresh keeps the session; no session goes to /access', async ({ page, context }) => {
  await enterCode(page, 'MAREVIVA7Q');
  await expect(page).toHaveURL(/\/p\/julia-pedro$/);
  await page.reload();
  await expect(page.getByRole('dialog', { name: 'Júlia & Pedro' })).toBeVisible();

  const other = await context.newPage();
  await other.goto('/p/julia-pedro');
  await expect(other).toHaveURL(/\/access$/);
});

test('invalid, expired and rate-limited codes', async ({ page }) => {
  await enterCode(page, 'ERRADO123');
  await expect(page.getByRole('alert')).toHaveText(/Código inválido/);

  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeEnabled();
  }
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('alert')).toHaveText(/Muitas tentativas/);

  await page.reload(); // fresh mock state
  await enterCode(page, 'OUTONO48XZ');
  await expect(page.getByRole('heading', { name: 'Esta entrega expirou' })).toBeVisible();
});

test('unknown route shows the 404', async ({ page }) => {
  await page.goto('/nao-existe');
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
});
