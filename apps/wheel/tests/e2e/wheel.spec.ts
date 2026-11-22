import { expect, test, type Page } from '@playwright/test';

/** Spins with the shortest spin time and returns the winner shown in the result window. */
async function spin(page: Page): Promise<string> {
  await page.locator('[data-duration]').selectOption('3');
  await page.getByRole('button', { name: 'Spin the wheel' }).click();
  const dialog = page.locator('[data-dialog]');
  await expect(dialog).toBeVisible({ timeout: 10_000 });
  return (await dialog.locator('[data-winner]').textContent()) ?? '';
}

test('spins the wheel and picks one of the entries', async ({ page }) => {
  await page.goto('/');
  const entries = page.locator('[data-entries]');
  await entries.fill('Alice\nBob\nCharlie');
  await expect(page.locator('[data-count]')).toHaveText('(3)');

  const winner = await spin(page);
  expect(['Alice', 'Bob', 'Charlie']).toContain(winner);

  // Remove the winner: it disappears from the list
  await page.getByRole('button', { name: 'Remove from wheel' }).click();
  await expect(page.locator('[data-count]')).toHaveText('(2)');
  expect((await entries.inputValue()).split('\n')).not.toContain(winner);
  await expect(page.locator('[data-history] li')).toHaveText([winner]);
});

test('remembers the entries after a reload', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-entries]').fill('Red\nGreen\nBlue');
  await page.reload();
  await expect(page.locator('[data-entries]')).toHaveValue('Red\nGreen\nBlue');
});

test('shares a wheel with a link', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.locator('[data-entries]').fill('Pizza\nSushi\nTacos');
  await page.getByRole('button', { name: 'Copy share link' }).click();
  await expect(page.locator('[data-status]')).toContainText('Link copied');
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toContain('#entries=');

  const other = await context.newPage();
  await other.goto(link);
  await expect(other.locator('[data-entries]')).toHaveValue('Pizza\nSushi\nTacos');
});

test('asks for at least two entries', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-entries]').fill('Only one');
  await page.getByRole('button', { name: 'Spin the wheel' }).click();
  await expect(page.locator('[data-status]')).toContainText('at least two entries');
});

test('number wheel creates a range and draws a number from it', async ({ page }) => {
  await page.goto('/random-number-wheel/');
  await page.getByLabel('From', { exact: true }).fill('5');
  await page.getByLabel('To', { exact: true }).fill('15');
  await page.getByRole('button', { name: 'Create wheel' }).click();
  await expect(page.locator('[data-count]')).toHaveText('(11)');
  const winner = Number(await spin(page));
  expect(winner).toBeGreaterThanOrEqual(5);
  expect(winner).toBeLessThanOrEqual(15);
});

test('yes or no wheel starts with Yes and No', async ({ page }) => {
  await page.goto('/yes-or-no-wheel/');
  await expect(page.locator('[data-entries]')).toHaveValue('Yes\nNo');
});

test('team generator makes fair teams', async ({ page }) => {
  await page.goto('/random-team-generator/');
  await page.locator('[data-names]').fill('A\nB\nC\nD\nE\nF\nG');
  await page.locator('[data-number]').fill('3');
  await page.getByRole('button', { name: 'Make teams' }).click();
  const cards = page.locator('.team-card');
  await expect(cards).toHaveCount(3);
  const sizes = await cards.evaluateAll((all) => all.map((card) => card.querySelectorAll('li').length).sort());
  expect(sizes).toEqual([2, 2, 3]);

  await page.locator('.segmented label', { hasText: 'People per team' }).click();
  await page.locator('[data-number]').fill('2');
  await page.getByRole('button', { name: 'Make teams' }).click();
  await expect(cards).toHaveCount(4);
});

// ---------- German pages ----------

test('the German wheel speaks German and keeps its own entries', async ({ page }) => {
  await page.goto('/de/ja-nein-gluecksrad/');
  await expect(page.locator('[data-entries]')).toHaveValue('Ja\nNein');
  // The English yes/no wheel keeps its own entries
  await page.goto('/yes-or-no-wheel/');
  await expect(page.locator('[data-entries]')).toHaveValue('Yes\nNo');

  await page.goto('/de/');
  const entries = page.locator('[data-entries]');
  await entries.fill('Schweiz\nÖsterreich\nDeutschland');
  await page.getByRole('button', { name: 'A–Z sortieren' }).click();
  await expect(entries).toHaveValue('Deutschland\nÖsterreich\nSchweiz'); // Ö sorts like O

  await page.locator('[data-duration]').selectOption('3');
  await expect(page.locator('[data-duration] option:checked')).toHaveText('3 Sek.');
  await page.getByRole('button', { name: 'Glücksrad drehen' }).click();
  const dialog = page.locator('[data-dialog]');
  await expect(dialog).toBeVisible({ timeout: 10_000 });
  await expect(dialog).toContainText('Das Glücksrad hat entschieden');
  const winner = (await dialog.locator('[data-winner]').textContent()) ?? '';
  expect(['Deutschland', 'Österreich', 'Schweiz']).toContain(winner);
  await dialog.getByRole('button', { name: 'Vom Rad entfernen' }).click();
  await expect(page.locator('[data-count]')).toHaveText('(2)');
  await expect(page.getByRole('heading', { name: 'Bisher ausgelost' })).toBeVisible();
});

test('the German wheel explains in German what is missing', async ({ page }) => {
  await page.goto('/de/');
  await page.locator('[data-entries]').fill('Nur einer');
  await page.getByRole('button', { name: 'Glücksrad drehen' }).click();
  await expect(page.locator('[data-status]')).toContainText('mindestens zwei Einträge');
});

test('German number wheel and team generator', async ({ page }) => {
  await page.goto('/de/zahlen-gluecksrad/');
  await page.getByLabel('Von', { exact: true }).fill('1');
  await page.getByLabel('Bis', { exact: true }).fill('100');
  await page.getByRole('button', { name: 'Rad erstellen' }).click();
  await expect(page.locator('[data-count]')).toHaveText('(100)');

  await page.goto('/de/teamgenerator/');
  await page.locator('[data-names]').fill('Anna\nBen\nClara\nDavid');
  await page.getByRole('button', { name: 'Teams bilden' }).click();
  await expect(page.locator('.team-card h3')).toHaveText(['Team 1', 'Team 2']);
  await page.locator('.segmented label', { hasText: 'Personen pro Team' }).click();
  await expect(page.locator('[data-number-label]')).toHaveText('Personen pro Team');
});
