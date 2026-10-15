/**
 * Uses the song finder like a visitor. The fake microphone plays the tune from melody.ts; the
 * answers of /api/identify (normally from the Worker and Gemini) are written by the tests.
 */
import { expect, test, type Page, type Route } from '@playwright/test';
import { encodeWav } from '../../src/lib/wav';

const answer = {
  heard: 'A man singing in Spanish.',
  words: 'que loquera asere',
  question: 'Was it a man or a woman singing?',
  searched: false,
  model: 'gemini-test',
  guesses: [
    {
      title: 'El Taxi',
      artist: 'Osmani García',
      year: '2015',
      confidence: 46,
      why: 'The chorus rhythm fits.',
      ids: { spotify: '1234567890abcdefghijkl', youtube: 'abcdefghijk', apple: '111111111' },
    },
    { title: 'No Lo Trates', artist: 'Pitbull', year: '2019', confidence: 31, why: 'Same tempo.' },
  ],
};

/**
 * Plays Apple's part: answers the lookup the page makes for songs whose Spotify ID is unknown.
 * The page asks with a <script> tag ("JSONP"), so the answer is JavaScript that calls the
 * function named in "callback". `catalogue` maps Apple IDs to their preview. Returns the IDs asked for.
 */
async function fakeApple(page: Page, catalogue: Record<string, { previewUrl: string; trackViewUrl: string }>) {
  const asked: string[] = [];
  await page.route('https://itunes.apple.com/lookup?*', (route) => {
    const url = new URL(route.request().url());
    const id = url.searchParams.get('id') ?? '';
    asked.push(id);
    const results = catalogue[id] ? [catalogue[id]] : [];
    return route.fulfill({ contentType: 'text/javascript', body: `${url.searchParams.get('callback')}(${JSON.stringify({ results })})` });
  });
  // A five-second tone stands in for Apple's preview files.
  const tone = encodeWav(Float32Array.from({ length: 80_000 }, (_, i) => 0.3 * Math.sin((2 * Math.PI * 440 * i) / 16_000)));
  await page.route('https://audio.example/**', (route) => route.fulfill({ body: Buffer.from(tone), contentType: 'audio/wav' }));
  return asked;
}

// Tiny pages stand in for Spotify's and YouTube's players, so the tests never load the real ones.
test.beforeEach(async ({ page }) => {
  await page.route('https://open.spotify.com/embed/**', (route) => route.fulfill({ contentType: 'text/html', body: '<p>Spotify player</p>' }));
  await page.route('https://www.youtube-nocookie.com/embed/**', (route) => route.fulfill({ contentType: 'text/html', body: '<p>YouTube player</p>' }));
});

const taxiPreview = { '111111111': { previewUrl: 'https://audio.example/taxi.wav', trackViewUrl: 'https://music.apple.com/ch/song/el-taxi/111111111' } };

/** Records the tune for about three seconds. */
async function record(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Stop recording' })).toBeVisible();
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: 'Stop recording' }).click();
  await expect(page.locator('[data-take]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Find the song' })).toBeEnabled();
}

/** Answers /api/identify with `reply` and collects what the page sent. */
async function fakeApi(page: Page, reply: (body: any, count: number) => Promise<object | [object, number]> | object | [object, number]) {
  const sent: any[] = [];
  await page.route('**/api/identify', async (route: Route) => {
    const body = route.request().postDataJSON();
    sent.push(body);
    const result = await reply(body, sent.length);
    const [data, status] = Array.isArray(result) ? result : [result, 200];
    await route.fulfill({ status, json: data });
  });
  return sent;
}

test('records a tune, draws the melody and shows the songs', async ({ page }) => {
  const asked = await fakeApple(page, taxiPreview);
  const sent = await fakeApi(page, () => answer);
  await page.goto('/');
  await record(page);

  // The melody line has notes in it (the fake microphone hums eight notes)
  expect(Number(await page.locator('[data-staff]').getAttribute('data-notes'))).toBeGreaterThan(10);

  await page.getByLabel('What do you remember? (optional)').fill('with Pitbull');
  await page.getByRole('button', { name: 'Find the song' }).click();
  const rows = page.locator('.guess');
  await expect(rows).toHaveCount(2);
  await expect(rows.first()).toContainText('El Taxi');
  await expect(rows.first()).toContainText('46 %');
  await expect(page.locator('[data-heard]')).toContainText('“que loquera asere”');
  await expect(page.locator('[data-question]')).toHaveText('Was it a man or a woman singing?');

  // What was sent: a real WAV file and the note, no earlier rounds yet
  const wav = Buffer.from(sent[0].audio, 'base64');
  expect(wav.toString('ascii', 0, 4)).toBe('RIFF');
  expect(wav.readUInt32LE(24)).toBe(16_000);
  expect(wav.length).toBeGreaterThan(16_000 * 2 * 2); // at least 2 seconds
  expect(sent[0].hint).toBe('with Pitbull');
  expect(sent[0].rounds).toEqual([]);

  // Links: straight to the song when Wikidata knew it, otherwise an honest search link
  await expect(rows.first().getByRole('link', { name: 'Spotify', exact: true })).toHaveAttribute('href', 'https://open.spotify.com/track/1234567890abcdefghijkl');
  await expect(rows.first().getByRole('link', { name: 'YouTube', exact: true })).toHaveAttribute('href', 'https://www.youtube.com/watch?v=abcdefghijk');
  await expect(rows.first().getByRole('link', { name: 'Apple Music' })).toHaveAttribute('href', 'https://music.apple.com/song/111111111');
  await expect(rows.nth(1).getByRole('link', { name: 'Search on Spotify' })).toHaveAttribute('href', 'https://open.spotify.com/search/No%20Lo%20Trates%20Pitbull');
  await expect(rows.nth(1).getByRole('link', { name: 'Search on YouTube' })).toBeVisible();
  await expect(rows.nth(1).getByRole('link', { name: 'Apple Music' })).toBeHidden();
  // The previews are right there, without a tap: Spotify's player for the first song (so Apple
  // isn't asked), nothing for the second, whose IDs are unknown
  await expect(rows.first().locator('[data-preview] iframe')).toHaveAttribute('src', 'https://open.spotify.com/embed/track/1234567890abcdefghijkl?theme=0');
  await expect(rows.nth(1).locator('[data-preview]')).toBeHidden();
  expect(asked).toEqual([]);
  // Only one yellow (main) button: "Search again"
  await expect(page.getByRole('button', { name: 'Find the song' })).not.toHaveClass(/btn-primary/);
});

test('"Search again" sends the wrong songs and the feedback, and shows Google’s suggestions', async ({ page }) => {
  const sent = await fakeApi(page, (_body, count) =>
    count === 1
      ? answer
      : {
          ...answer,
          searched: true,
          guesses: [{ title: 'Que Loquera', artist: 'Some Artist', year: '', confidence: 80, why: 'The words match.' }],
          searchSuggestions: '<div>que loquera lyrics</div>',
          sources: [{ title: 'lyrics.example', url: 'https://lyrics.example/que-loquera' }],
        },
  );
  await page.goto('/');
  await page.getByLabel('What do you remember? (optional)').fill('sounds like que loquera');
  await page.getByRole('button', { name: 'Find the song' }).click();
  await expect(page.locator('.guess')).toHaveCount(2);

  await page.getByLabel('None of these? Tell Humm more (optional)').fill('it’s older');
  await page.getByRole('button', { name: 'Search again' }).click();
  await expect(page.locator('.guess')).toHaveCount(1);
  expect(sent[1].rounds).toEqual([
    {
      guesses: [
        { title: 'El Taxi', artist: 'Osmani García' },
        { title: 'No Lo Trates', artist: 'Pitbull' },
      ],
      feedback: 'it’s older',
    },
  ]);
  await expect(page.locator('[data-web]')).toBeVisible();
  await expect(page.frameLocator('[data-suggestions]').getByText('que loquera lyrics')).toBeVisible();
  await expect(page.getByRole('link', { name: 'lyrics.example' })).toHaveAttribute('href', 'https://lyrics.example/que-loquera');

  // Without typing anything, "Search again" means "none of these"
  await page.getByRole('button', { name: 'Search again' }).click();
  await expect.poll(() => sent.length).toBe(3);
  expect(sent[2].rounds.at(-1).feedback).toBe('None of these are right.');
});

test('"That’s it" keeps only the chosen song', async ({ page }) => {
  await fakeApi(page, () => answer);
  await page.goto('/');
  await page.getByLabel('What do you remember? (optional)').fill('la la la');
  await page.getByRole('button', { name: 'Find the song' }).click();
  await page.locator('.guess').nth(1).getByRole('button', { name: 'That’s it' }).click();

  await expect(page.locator('.guess:visible')).toHaveCount(1);
  await expect(page.locator('.guess.is-found')).toContainText('No Lo Trates');
  await expect(page.locator('[data-found-text]')).toHaveText('Found it: “No Lo Trates” by Pitbull.');
  await expect(page.locator('[data-follow-up]')).toBeHidden();

  await page.getByRole('button', { name: 'Find another song' }).click();
  await expect(page.locator('[data-results]')).toBeHidden();
  await expect(page.getByLabel('What do you remember? (optional)')).toHaveValue('');
});

test('shows the waiting circle with the time left', async ({ page }) => {
  await fakeApi(page, async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return answer;
  });
  await page.goto('/');
  await page.getByLabel('What do you remember? (optional)').fill('la la la');
  await page.getByRole('button', { name: 'Find the song' }).click();
  await expect(page.locator('[data-progress]')).toBeVisible();
  await expect(page.locator('[data-progress-time]')).toContainText('seconds left');
  await expect(page.locator('.guess').first()).toBeVisible();
  await expect(page.locator('[data-progress]')).toBeHidden();
});

test('shows the server’s explanation when something goes wrong', async ({ page }) => {
  await fakeApi(page, () => [{ error: 'No AI model could answer right now. Please try again in a minute.' }, 502]);
  await page.goto('/');
  await page.getByLabel('What do you remember? (optional)').fill('la la la');
  await page.getByRole('button', { name: 'Find the song' }).click();
  await expect(page.locator('[data-status]')).toHaveText('No AI model could answer right now. Please try again in a minute.');
  await expect(page.locator('[data-status]')).toHaveAttribute('data-kind', 'error');
  await expect(page.getByRole('button', { name: 'Find the song' })).toBeEnabled();
});

test('a failed "Search again" keeps the earlier songs on screen', async ({ page }) => {
  await fakeApi(page, (_body, count) => (count === 1 ? answer : [{ error: 'Busy.' }, 502]));
  await page.goto('/');
  await page.getByLabel('What do you remember? (optional)').fill('la la la');
  await page.getByRole('button', { name: 'Find the song' }).click();
  await page.getByRole('button', { name: 'Search again' }).click();
  await expect(page.locator('[data-status]')).toHaveText('Busy.');
  await expect(page.locator('.guess')).toHaveCount(2);
});

test('shows Spotify’s player right in the row', async ({ page }) => {
  await fakeApple(page, taxiPreview);
  await fakeApi(page, () => answer);
  await page.goto('/');
  await page.getByLabel('What do you remember? (optional)').fill('la la la');
  await page.getByRole('button', { name: 'Find the song' }).click();

  const first = page.locator('.guess').first();
  await expect(first.frameLocator('[data-preview] iframe').getByText('Spotify player')).toBeVisible();
  await expect(first.locator('[data-preview] iframe')).toHaveAttribute('title', 'El Taxi on Spotify');
  await expect(first.getByRole('button', { name: 'Play preview' })).toBeHidden(); // Spotify's player has its own
});

test('plays Apple’s preview in Humm’s own player when Spotify’s ID is unknown', async ({ page }) => {
  const asked = await fakeApple(page, taxiPreview);
  await fakeApi(page, () => ({ ...answer, guesses: [{ ...answer.guesses[0], ids: { apple: '111111111', youtube: 'abcdefghijk' } }] }));
  await page.goto('/');
  await page.getByLabel('What do you remember? (optional)').fill('la la la');
  await page.getByRole('button', { name: 'Find the song' }).click();

  const row = page.locator('.guess').first();
  const play = row.getByRole('button', { name: 'Play preview' });
  await expect(play).toBeVisible(); // ready before anyone taps
  expect(asked).toEqual(['111111111']);
  await expect(row.locator('iframe')).toHaveCount(0); // Apple's preview is enough, no YouTube player

  await play.click();
  await expect(play).toHaveAttribute('aria-pressed', 'true');
  // The thin bar shows how far it has played
  await expect.poll(() => row.locator('[data-preview-bar]').evaluate((bar) => parseFloat((bar as HTMLElement).style.width) || 0)).toBeGreaterThan(0);
  await play.click();
  await expect(play).toHaveAttribute('aria-pressed', 'false');
  await play.click();
  await expect(play).toHaveAttribute('aria-pressed', 'true');
  expect(asked).toHaveLength(1); // Apple was asked only once

  // Recording again stops the preview, so it doesn't end up in the recording
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(play).toHaveAttribute('aria-pressed', 'false');
});

test('shows YouTube’s player when that is all there is, and nothing without IDs', async ({ page }) => {
  await fakeApple(page, {}); // Apple knows nothing
  await fakeApi(page, () => ({
    ...answer,
    guesses: [
      { ...answer.guesses[0], ids: { apple: '222222222', youtube: 'abcdefghijk' } },
      { ...answer.guesses[1], ids: { apple: '333333333' } },
    ],
  }));
  await page.goto('/');
  await page.getByLabel('What do you remember? (optional)').fill('la la la');
  await page.getByRole('button', { name: 'Find the song' }).click();

  const rows = page.locator('.guess');
  await expect(rows.first().locator('[data-preview] iframe')).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/abcdefghijk?playsinline=1');
  await expect(rows.first().frameLocator('[data-preview] iframe').getByText('YouTube player')).toBeVisible();
  await expect(rows.nth(1).locator('[data-preview]')).toBeHidden();
});

test('silence shows up red on the staff, with an explanation', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-legend]')).toBeHidden();
  await page.getByRole('button', { name: 'Start recording' }).click();
  await page.waitForTimeout(3500); // the test tune has a long pause after its fourth note
  await expect(page.locator('[data-legend]')).toBeVisible();
  await expect(page.locator('[data-legend]')).toHaveText('Red: no tune heard (silence)');
  await page.getByRole('button', { name: 'Stop recording' }).click();
  await expect(page.locator('[data-legend]')).toBeVisible();
  // Deleting the recording clears the staff and the explanation
  await page.getByRole('button', { name: 'Delete recording' }).click();
  await expect(page.locator('[data-legend]')).toBeHidden();
});

test('a very short recording asks for more', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start recording' }).click();
  await page.getByRole('button', { name: 'Stop recording' }).click();
  await expect(page.locator('[data-status]')).toContainText('very short');
  await expect(page.getByRole('button', { name: 'Find the song' })).toBeDisabled();
});
