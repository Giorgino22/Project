/** Browser tests for the typing test and the keyboard tester. */
import { expect, test, type Page } from '@playwright/test';

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
  await expect(result.locator('[data-wpm]')).toHaveText(String(Math.round(characters / 5 / 0.5)));
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
