/** Browser tests for the typing test and the keyboard tester. */
import { expect, test, type Page } from '@playwright/test';
import { germanCommonWords, germanKidWords } from '../../src/lib/words-de';

const words = (page: Page) => page.locator('[data-box] span');
const input = (page: Page) => page.getByRole('textbox', { name: /Type the highlighted word/ });

test('a timed test counts right and wrong words and shows the result', async ({ page }) => {
  await page.clock.install(); // fake clock: we can jump forward in time instead of waiting
  await page.goto('/');
  await page.locator('.segmented label', { hasText: '30 s' }).click();
  await expect(page.locator('[data-timer]')).toHaveText('0:30');

  const first = (await words(page).allTextContents()).slice(0, 5);
  await input(page).pressSequentially(`${first.join(' ')} zzz `);
  await expect(words(page).nth(0)).toHaveClass(/right/);
  await expect(words(page).nth(5)).toHaveClass(/wrong/);
  await expect(words(page).nth(6)).toHaveClass(/current/);

  await page.clock.runFor(31_000);
  const result = page.getByRole('region', { name: 'Your result' });
  await expect(result).toBeVisible();
  // WPM = characters of the correct words (+ a space each) ÷ 5 ÷ half a minute
  const characters = first.reduce((sum, word) => sum + word.length + 1, 0);
  await expect(result.locator('[data-speed]')).toHaveText(String(Math.round(characters / 5 / 0.5)));
  await expect(result).toContainText('words per minute');
  await expect(result.locator('[data-correct]')).toHaveText('5');
  await expect(result.locator('[data-wrong]')).toHaveText('1');
  await expect(result.locator('[data-mistakes]')).toContainText('Words to practise');

  // Try again: a fresh test that remembers the personal best
  await result.getByRole('button', { name: 'Try again' }).click();
  await expect(input(page)).toBeFocused();
  await expect(page.locator('[data-best]')).toContainText('Your personal best');
  await expect(words(page).nth(0)).toHaveClass(/current/);
});

test('the clock waits for the first key', async ({ page }) => {
  await page.clock.install();
  await page.goto('/3-minute-typing-test/');
  await expect(page.locator('[data-timer]')).toHaveText('3:00');
  await page.clock.runFor(5_000);
  await expect(page.locator('[data-timer]')).toHaveText('3:00');
  await input(page).pressSequentially('x');
  await page.clock.runFor(5_000);
  await expect(page.locator('[data-timer]')).toHaveText('2:55');
});

test('a typo turns the current word red; Enter works like space; Esc restarts', async ({ page }) => {
  await page.goto('/');
  const first = (await words(page).first().textContent())!;
  await input(page).pressSequentially('qq');
  await expect(words(page).first()).toHaveClass(/typo/);

  await input(page).fill('');
  await input(page).pressSequentially(first);
  await input(page).press('Enter');
  await expect(words(page).first()).toHaveClass(/right/);
  await expect(input(page)).toHaveValue('');

  await input(page).press('Escape');
  await expect(words(page).first()).toHaveClass(/current/);
  await expect(page.locator('[data-timer]')).toHaveText('1:00');
});

test('a practice lesson ends after the last word', async ({ page }) => {
  await page.goto('/typing-practice/');
  await page.getByLabel('Lesson').selectOption('home');
  const lesson = await words(page).allTextContents();
  expect(lesson).toHaveLength(30);
  for (const word of lesson) expect(word).toMatch(/^[asdfghjkl]+$/);

  await input(page).pressSequentially(`${lesson.join(' ')} `);
  const result = page.getByRole('region', { name: 'Your result' });
  await expect(result).toBeVisible();
  await expect(result.locator('[data-correct]')).toHaveText('30');
  await expect(result.locator('[data-accuracy]')).toHaveText('100 %');
});

test('the result can be shared', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.addInitScript(() => delete (Navigator.prototype as { share?: unknown }).share); // use the copy fallback
  await page.clock.install();
  await page.goto('/typing-test-for-kids/');
  await expect(page.locator('.typing-large')).toBeVisible();
  await input(page).pressSequentially(`${await words(page).first().textContent()} `);
  await page.clock.runFor(61_000);
  await page.getByRole('button', { name: 'Share result' }).click();
  await expect(page.getByRole('status')).toContainText('Copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/I type \d+ words per minute/);
});

test('the keyboard test lights up pressed keys', async ({ page }) => {
  await page.goto('/keyboard-test/');
  const keyboard = page.getByRole('application');
  await keyboard.click();
  await page.keyboard.press('a');
  await expect(keyboard.locator('[data-code="KeyA"]')).toHaveClass(/tested/);
  await expect(page.locator('[data-last]')).toHaveText('a (KeyA)');

  // Space must not scroll the page while testing
  const before = await page.evaluate(() => window.scrollY);
  await page.keyboard.press('Space');
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  await expect(keyboard.locator('[data-code="Space"]')).toHaveClass(/tested/);
  await expect(page.locator('[data-count]')).toHaveText('2');

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.locator('[data-count]')).toHaveText('0');
  await expect(keyboard.locator('.tested')).toHaveCount(0);
});

// ---------- German pages ----------

const germanInput = (page: Page) => page.getByRole('textbox', { name: /Markiertes Wort tippen/ });

test('the German test uses German words and counts Anschläge and words per minute', async ({ page }) => {
  await page.clock.install();
  await page.goto('/de/');
  await page.locator('.segmented label', { hasText: '30 Sek.' }).click();
  await expect(page.locator('[data-timer]')).toHaveText('0:30');

  const all = await words(page).allTextContents();
  for (const word of all.slice(0, 60)) expect(germanCommonWords).toContain(word);

  const first = all.slice(0, 5);
  await germanInput(page).pressSequentially(`${first.join(' ')} zzz `);
  await expect(words(page).nth(0)).toHaveClass(/right/);
  await expect(words(page).nth(5)).toHaveClass(/wrong/);

  await page.clock.runFor(31_000);
  const result = page.getByRole('region', { name: 'Ergebnis' });
  await expect(result).toBeVisible();
  // Anschläge = characters of the correct words (+ a space each) ÷ half a minute; words per minute = that ÷ 5
  const characters = first.reduce((sum, word) => sum + word.length + 1, 0);
  await expect(result.locator('[data-speed]')).toHaveText(String(Math.round(characters / 0.5)));
  await expect(result.locator('.result-speed')).toContainText('Anschläge pro Minute');
  await expect(result.locator('[data-wpm]')).toHaveText(String(Math.round(characters / 5 / 0.5)));
  await expect(result.locator('[data-correct]')).toHaveText('5');
  await expect(result.locator('[data-mistakes]')).toContainText('Diese Wörter üben');
  await expect(result.locator('[data-best-value]')).toContainText('Anschläge/Min.');

  // German and English personal bests are kept apart
  await result.getByRole('button', { name: 'Nochmal' }).click();
  await expect(page.locator('[data-best]')).toContainText('Bestleistung bisher');
  await page.goto('/');
  await expect(page.locator('[data-best]')).toHaveText('');
});

test('an umlaut typed as two characters (u + ¨) still counts as right', async ({ page }) => {
  await page.goto('/de/');
  const all = await words(page).allTextContents();
  const index = all.findIndex((word) => /[äöü]/.test(word)); // the first word with an umlaut
  expect(index).toBeGreaterThanOrEqual(0);
  // Type the words before it (one input event can finish several words, like fast typing on a phone) …
  if (index > 0) await germanInput(page).fill(`${all.slice(0, index).join(' ')} `);
  // … then the umlaut word in "decomposed" form: "ü" as u followed by a combining ¨
  await germanInput(page).fill(`${all[index]!.normalize('NFD')} `);
  await expect(words(page).nth(index)).toHaveClass(/right/);
  await expect(words(page).nth(0)).toHaveClass(/right/);
});

test('the German kids test uses easy German words and shares in German', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.addInitScript(() => delete (Navigator.prototype as { share?: unknown }).share);
  await page.clock.install();
  await page.goto('/de/tipptest-fuer-kinder/');
  for (const word of await words(page).allTextContents()) expect(germanKidWords).toContain(word);
  await germanInput(page).pressSequentially(`${await words(page).first().textContent()} `);
  await page.clock.runFor(61_000);
  await page.getByRole('button', { name: 'Ergebnis teilen' }).click();
  await expect(page.getByRole('status')).toContainText('Kopiert');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(
    /^Ich tippe \d+ Anschläge pro Minute \(\d+ Wörter pro Minute\) mit \d+ % Genauigkeit/,
  );
});

test('German practice lessons follow the QWERTZ keyboard', async ({ page }) => {
  await page.goto('/de/tippen-ueben/');
  await expect(page.getByLabel('Lektion').locator('option')).toHaveText([
    'Häufige Wörter',
    'Grundreihe (A S D F …)',
    'Obere Reihe (Q W E R …)',
    'Untere Reihe (Y X C V …)',
    'Zahlen',
    'Großbuchstaben & Satzzeichen',
  ]);
  await page.getByLabel('Lektion').selectOption('home');
  for (const word of await words(page).allTextContents()) expect(word).toMatch(/^[asdfghjklöä]+$/);
  await page.getByLabel('Lektion').selectOption('top');
  for (const word of await words(page).allTextContents()) expect(word).toMatch(/^[qwertzuiopüasdfghjklöä]+$/);
});

test('the German keyboard test shows a QWERTZ keyboard with German or Swiss labels', async ({ page }) => {
  await page.goto('/de/tastaturtest/');
  const keyboard = page.getByRole('application');
  await expect(keyboard.locator('[data-code="KeyY"]')).toHaveText('Z');
  await expect(keyboard.locator('[data-code="KeyZ"]')).toHaveText('Y');
  await expect(keyboard.locator('[data-code="Semicolon"]')).toHaveText('Ö');
  await expect(keyboard.locator('[data-code="IntlBackslash"]')).toHaveText('<');

  await keyboard.click();
  await page.keyboard.press('KeyZ'); // the key labelled Y on a QWERTZ keyboard
  await expect(keyboard.locator('[data-code="KeyZ"]')).toHaveClass(/tested/);
  await expect(page.locator('[data-last]')).toContainText('(KeyZ)');
  await page.keyboard.press('Space');
  await expect(page.locator('[data-last]')).toHaveText('Leertaste (Space)');

  // Swiss labels, remembered for the next visit
  const variant = (name: string) => page.locator('.keytest .segmented label', { hasText: name });
  await variant('Schweiz').click();
  await expect(keyboard.locator('[data-code="Minus"]')).toHaveText("'");
  await expect(keyboard.locator('[data-code="Quote"]')).toHaveText('ä');
  await expect(keyboard.locator('[data-code="KeyZ"]')).toHaveClass(/tested/); // switching keeps the results
  await page.reload();
  await expect(keyboard.locator('[data-code="Backslash"]')).toHaveText('$');
  await variant('Deutschland').click();
  await expect(keyboard.locator('[data-code="Minus"]')).toHaveText('ß');
});

test('Swiss browsers see Swiss labels first', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ locale: 'de-CH', baseURL });
  const page = await context.newPage();
  await page.goto('/de/tastaturtest/');
  await expect(page.getByRole('application').locator('[data-code="Backquote"]')).toHaveText('§');
  await expect(page.locator('.keytest input[value="ch"]')).toBeChecked();
  await context.close();
});

test('the practice pages show which finger types which key', async ({ page }) => {
  await page.goto('/de/tippen-ueben/');
  const chart = page.locator('.finger-chart');
  await expect(chart.getByRole('heading', { name: 'Welcher Finger tippt welche Taste?' })).toBeVisible();
  await expect(chart.locator('.finger-list')).toContainText('Linker Zeigefinger: 4 5 R T F G V B');
  await expect(chart.locator('.finger-list')).toContainText('Rechter Zeigefinger: 6 7 Z U H J N M');
  await expect(chart.locator('.key.finger-right-pinky', { hasText: 'Ö' })).toBeVisible();

  await page.goto('/typing-practice/');
  await expect(page.locator('.finger-list')).toContainText('Right index finger: 6 7 Y U H J N M');
  // Only on the practice page
  await page.goto('/');
  await expect(page.locator('.finger-chart')).toHaveCount(0);
});
