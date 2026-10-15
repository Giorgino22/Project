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
    },
    { title: 'No Lo Trates', artist: 'Pitbull', year: '2019', confidence: 31, why: 'Same tempo.' },
  ],
};

/**
 * Plays Apple's part: answers the iTunes search the page makes when "Play preview" is tapped.
 * The page asks with a <script> tag ("JSONP"), so the answer is JavaScript that calls the
 * function named in "callback". Returns the search terms Apple was asked for.
 */
async function fakeApple(page: Page, catalogue: { trackName: string; artistName: string; previewUrl: string; trackViewUrl: string }[]) {
  const asked: string[] = [];
  await page.route('https://itunes.apple.com/search?*', (route) => {
    const url = new URL(route.request().url());
    const term = url.searchParams.get('term') ?? '';
    asked.push(term);
    // Like Apple: a song is found when the search contains its title (without "(feat. …)")
    const results = catalogue.filter((track) => term.includes(track.trackName.replace(/\s*\(.*$/, '')));
    return route.fulfill({ contentType: 'text/javascript', body: `${url.searchParams.get('callback')}(${JSON.stringify({ results })})` });
  });
  // A one-second tone stands in for Apple's preview files.
  const tone = encodeWav(Float32Array.from({ length: 16_000 }, (_, i) => 0.3 * Math.sin((2 * Math.PI * 440 * i) / 16_000)));
  await page.route('https://audio.example/**', (route) => route.fulfill({ body: Buffer.from(tone), contentType: 'audio/wav' }));
  return asked;
}

const elTaxi = {
  trackName: 'El Taxi (feat. Pitbull & Sensato)',
  artistName: 'Osmani García',
  previewUrl: 'https://audio.example/taxi.wav',
  trackViewUrl: 'https://music.apple.com/taxi',
};

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

  // Links: Spotify and YouTube open the first DuckDuckGo result ("\" = I'm feeling ducky);
  // Apple Music appears only after the preview was looked up. Every song has a play button.
  const youtube = new URL((await rows.first().getByRole('link', { name: 'YouTube' }).getAttribute('href'))!);
  expect(youtube.origin + youtube.pathname).toBe('https://duckduckgo.com/');
  expect(youtube.searchParams.get('q')).toBe('\\El Taxi Osmani García site:youtube.com');
  await expect(rows.first().getByRole('link', { name: 'Spotify' })).toHaveAttribute('href', /site%3Aopen\.spotify\.com/);
  await expect(rows.first().getByRole('link', { name: 'Apple Music' })).toBeHidden();
  await expect(rows.nth(1).getByRole('button', { name: 'Play preview' })).toBeVisible();
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

test('plays and pauses a preview from Apple, asked only when tapped', async ({ page }) => {
  const asked = await fakeApple(page, [elTaxi]);
  await fakeApi(page, () => answer);
  await page.goto('/');
  await page.getByLabel('What do you remember? (optional)').fill('la la la');
  await page.getByRole('button', { name: 'Find the song' }).click();
  await expect(page.locator('.guess')).toHaveCount(2);
  expect(asked, 'Apple is not asked before the visitor taps').toEqual([]);

  const first = page.locator('.guess').first();
  const play = first.locator('[data-play]');
  await play.click();
  await expect(play).toHaveAttribute('aria-pressed', 'true');
  await expect(play).toContainText('Pause');
  await expect(first.getByRole('link', { name: 'Apple Music' })).toHaveAttribute('href', 'https://music.apple.com/taxi');
  expect(asked).toEqual(['Osmani García El Taxi']);
  await play.click();
  await expect(play).toHaveAttribute('aria-pressed', 'false');

  // Playing again doesn't ask Apple a second time
  await play.click();
  await expect(play).toHaveAttribute('aria-pressed', 'true');
  expect(asked).toHaveLength(1);
});

test('says "No preview" when Apple doesn’t have the song', async ({ page }) => {
  await fakeApple(page, [elTaxi]);
  await fakeApi(page, () => answer);
  await page.goto('/');
  await page.getByLabel('What do you remember? (optional)').fill('la la la');
  await page.getByRole('button', { name: 'Find the song' }).click();

  const second = page.locator('.guess').nth(1); // "No Lo Trates" isn't in the fake catalogue
  await second.getByRole('button', { name: 'Play preview' }).click();
  await expect(second.locator('[data-play]')).toHaveText('No preview');
  await expect(second.locator('[data-play]')).toBeDisabled();
  await expect(second.getByRole('link', { name: 'Apple Music' })).toBeHidden();
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
