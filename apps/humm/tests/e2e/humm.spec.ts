/**
 * Uses the song finder like a visitor. The fake microphone plays the tune from melody.ts; the
 * answers of /api/identify (normally from the Worker and Gemini), Apple's search and the preview
 * files are written by the tests – no real server is asked.
 */
import { expect, test, type Page, type Route } from '@playwright/test';
import { encodeWav } from '../../src/lib/wav';
import { songWithTune } from './melody';

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
      confidence: 80,
      why: 'The chorus rhythm fits.',
      ids: { spotify: '1234567890abcdefghijkl', youtube: 'abcdefghijk' },
    },
    { title: 'No Lo Trates', artist: 'Pitbull', year: '2019', confidence: 31, why: 'Same tempo.' },
  ],
};

interface AppleSong {
  trackId?: string;
  trackName: string;
  artistName: string;
  previewUrl: string;
  trackViewUrl?: string;
}

/**
 * Plays Apple's part. The page asks with a <script> tag ("JSONP"), so the answer is JavaScript that
 * calls the function named in "callback". A lookup finds a song by its ID, a search finds every
 * song whose title is in the search words. Returns what was asked.
 */
async function fakeApple(page: Page, songs: AppleSong[]) {
  const asked: string[] = [];
  await page.route(/^https:\/\/itunes\.apple\.com\/(lookup|search)\?/, (route) => {
    const url = new URL(route.request().url());
    const id = url.searchParams.get('id');
    const term = url.searchParams.get('term');
    asked.push(id ? `lookup ${id}` : `search ${term}`);
    const results = songs.filter((song) => (id ? song.trackId === id : term?.toLowerCase().includes(song.trackName.toLowerCase())));
    return route.fulfill({ contentType: 'text/javascript', body: `${url.searchParams.get('callback')}(${JSON.stringify({ results })})` });
  });
  return asked;
}

/**
 * Serves a preview file like Apple's servers do: readable by web pages (CORS) and in parts
 * ("range requests"), which browsers need to start playing in the middle of a file.
 */
function serveAudio(route: Route, body: Buffer) {
  const headers = { 'access-control-allow-origin': '*', 'accept-ranges': 'bytes', 'content-type': 'audio/wav' };
  const range = /bytes=(\d+)-(\d*)/.exec(route.request().headers()['range'] ?? '');
  if (!range) return route.fulfill({ body, headers });
  const start = Number(range[1]);
  const end = range[2] ? Math.min(Number(range[2]), body.length - 1) : body.length - 1;
  return route.fulfill({ status: 206, body: body.subarray(start, end + 1), headers: { ...headers, 'content-range': `bytes ${start}-${end}/${body.length}` } });
}

const taxi: AppleSong = {
  trackId: '111111111',
  trackName: 'El Taxi',
  artistName: 'Osmani García, Pitbull & Sensato',
  previewUrl: 'https://audio.example/taxi.wav',
  trackViewUrl: 'https://music.apple.com/ch/song/el-taxi/111111111',
};

// Before every test: Apple knows no songs, the preview files and Spotify's player are tiny stand-ins.
// (Routes added later in a test take priority over these.)
test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\/itunes\.apple\.com\//, (route) => {
    const callback = new URL(route.request().url()).searchParams.get('callback');
    return route.fulfill({ contentType: 'text/javascript', body: `${callback}({"results":[]})` });
  });
  // A five-second tone stands in for a preview; Apple's files may be read by web pages (CORS).
  const tone = encodeWav(Float32Array.from({ length: 80_000 }, (_, i) => 0.3 * Math.sin((2 * Math.PI * 440 * i) / 16_000)));
  await page.route('https://audio.example/**', (route) => serveAudio(route, Buffer.from(tone)));
  await page.route('https://open.spotify.com/embed/**', (route) => route.fulfill({ contentType: 'text/html', body: '<p>Spotify player</p>' }));
});

/** Records the tune for a few seconds. */
async function record(page: Page, seconds = 3): Promise<void> {
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Stop recording' })).toBeVisible();
  await page.waitForTimeout(seconds * 1000);
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

/** Types a note and searches (without a recording). */
async function searchFor(page: Page, words = 'la la la') {
  await page.getByLabel('What do you remember? (optional)').fill(words);
  await page.getByRole('button', { name: 'Find the song' }).click();
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
  await expect(rows.first()).toContainText('80 %');
  await expect(page.locator('[data-heard]')).toContainText('“que loquera asere”');
  await expect(page.locator('[data-question]')).toHaveText('Was it a man or a woman singing?');

  // What was sent: a real WAV file and the note, no earlier rounds yet – and Humm was sure enough
  // not to check the words on the web as well
  const wav = Buffer.from(sent[0].audio, 'base64');
  expect(wav.toString('ascii', 0, 4)).toBe('RIFF');
  expect(wav.readUInt32LE(24)).toBe(16_000);
  expect(wav.length).toBeGreaterThan(16_000 * 2 * 2); // at least 2 seconds
  expect(sent[0].hint).toBe('with Pitbull');
  expect(sent[0].rounds).toEqual([]);
  expect(sent).toHaveLength(1);

  // Links: straight to the song when Wikidata knew it, otherwise an honest search link
  await expect(rows.first().getByRole('link', { name: 'Spotify', exact: true })).toHaveAttribute('href', 'https://open.spotify.com/track/1234567890abcdefghijkl');
  await expect(rows.first().getByRole('link', { name: 'YouTube', exact: true })).toHaveAttribute('href', 'https://www.youtube.com/watch?v=abcdefghijk');
  await expect(rows.nth(1).getByRole('link', { name: 'Search on Spotify' })).toHaveAttribute('href', 'https://open.spotify.com/search/No%20Lo%20Trates%20Pitbull');
  await expect(rows.nth(1).getByRole('link', { name: 'Apple Music' })).toBeHidden();

  // Previews: Apple knows neither song here, so the first one gets Spotify's player and the
  // second one (no IDs) no preview at all – never a YouTube video.
  await expect(rows.first().locator('[data-preview] iframe')).toHaveAttribute('src', 'https://open.spotify.com/embed/track/1234567890abcdefghijkl?theme=0');
  await expect(rows.first().frameLocator('[data-preview] iframe').getByText('Spotify player')).toBeVisible();
  await expect(rows.nth(1).locator('[data-preview]')).toBeHidden();
  await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0);
  // Only one yellow (main) button: "Search again"
  await expect(page.getByRole('button', { name: 'Find the song' })).not.toHaveClass(/btn-primary/);
});

test('plays Apple’s preview in Humm’s own player, found by title and artist', async ({ page }) => {
  const asked = await fakeApple(page, [taxi]);
  await fakeApi(page, () => answer);
  await page.goto('/');
  await searchFor(page);

  const row = page.locator('.guess').first();
  const play = row.getByRole('button', { name: 'Play preview of El Taxi' });
  await expect(play).toBeEnabled(); // ready before anyone taps
  await expect(row.locator('[data-preview-label]')).toHaveText('Preview from Apple Music');
  await expect(row.locator('iframe')).toHaveCount(0); // Apple comes first, so no Spotify player
  expect(asked).toContain('search El Taxi Osmani García');

  await play.click();
  await expect(play).toHaveAttribute('aria-pressed', 'true');
  // The thin line shows how far it has played
  await expect.poll(() => row.locator('[data-preview-bar]').evaluate((bar) => parseFloat((bar as HTMLElement).style.width) || 0)).toBeGreaterThan(0);
  await play.click();
  await expect(play).toHaveAttribute('aria-pressed', 'false');
  await play.click();
  await expect(play).toHaveAttribute('aria-pressed', 'true');

  // Recording again stops the preview, so it doesn't end up in the recording
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(play).toHaveAttribute('aria-pressed', 'false');
});

test('asks Apple for the exact song when Wikidata knew its Apple Music ID', async ({ page }) => {
  const asked = await fakeApple(page, [taxi]);
  await fakeApi(page, () => ({ ...answer, guesses: [{ ...answer.guesses[0], ids: { apple: '111111111' } }] }));
  await page.goto('/');
  await searchFor(page);
  await expect(page.locator('.guess').first().getByRole('button', { name: 'Play preview of El Taxi' })).toBeEnabled();
  expect(asked).toEqual(['lookup 111111111']);
});

test('takes no cover or karaoke version as the preview', async ({ page }) => {
  await fakeApple(page, [{ ...taxi, artistName: 'Karaoke Hits Band' }]);
  await fakeApi(page, () => ({ ...answer, guesses: [{ ...answer.guesses[1], title: 'El Taxi' }] })); // no Spotify ID either
  await page.goto('/');
  await searchFor(page);
  await expect(page.locator('.guess').first().locator('[data-preview]')).toBeHidden();
});

test('compares the hummed tune with the song’s melody and starts the preview there', async ({ page }) => {
  await fakeApple(page, [taxi, { trackName: 'No Lo Trates', artistName: 'Pitbull', previewUrl: 'https://audio.example/other.wav' }]);
  await page.route('https://audio.example/taxi.wav', (route) => serveAudio(route, songWithTune()));
  await page.route('https://audio.example/other.wav', (route) => serveAudio(route, songWithTune(false)));
  await fakeApi(page, () => answer);
  await page.goto('/');
  await record(page, 9); // a fit only counts with at least 6 s of tune (see fitLabel in compare.ts)
  await page.getByRole('button', { name: 'Find the song' }).click();

  const rows = page.locator('.guess');
  // El Taxi's preview has the tune between 0:04 and 0:14: it is found there …
  await expect(rows.first().locator('[data-fit]')).toHaveText(/^Your tune fits this song well at 0:(0[3-9]|1[0-3])\. The preview starts there\.$/);
  await expect(rows.first().locator('[data-song-line]')).toBeVisible(); // the song's melody replaces the thin line
  await expect(rows.first().locator('[data-preview-time]')).toHaveText(/^0:(0[2-9]|1[0-3])$/);
  // … while the other song's melody is drawn, but nothing fits
  await expect(rows.nth(1).locator('[data-song-line]')).toBeVisible();
  await expect(rows.nth(1).locator('[data-fit]')).toBeHidden();

  // Playing starts where the tune fits, not at 0:00
  const startsAt = Number((await rows.first().locator('[data-preview-time]').textContent())!.split(':')[1]);
  await rows.first().getByRole('button', { name: 'Play preview of El Taxi' }).click();
  await page.waitForTimeout(1500);
  const playedTo = Number((await rows.first().locator('[data-preview-time]').textContent())!.split(':')[1]);
  expect(playedTo).toBeGreaterThanOrEqual(startsAt);
});

test('checks the words on the web when Humm isn’t sure yet', async ({ page }) => {
  const unsure = { ...answer, guesses: answer.guesses.map((guess) => ({ ...guess, confidence: 40 })) };
  const checked = {
    ...answer,
    searched: true,
    guesses: [{ title: 'Que Loquera', artist: 'Some Artist', year: '', confidence: 85, why: 'The words match.' }],
    searchSuggestions: '<div>que loquera lyrics</div>',
  };
  const sent = await fakeApi(page, (body) => (body.check ? checked : unsure));
  await page.goto('/');
  await searchFor(page, 'it was on the radio');

  await expect(page.locator('.guess')).toHaveCount(1);
  await expect(page.locator('.guess').first()).toContainText('Que Loquera');
  expect(sent).toHaveLength(2);
  expect(sent[1].check).toEqual({
    words: 'que loquera asere',
    guesses: [
      { title: 'El Taxi', artist: 'Osmani García' },
      { title: 'No Lo Trates', artist: 'Pitbull' },
    ],
  });
  expect(sent[1].rounds).toEqual([]); // the quick guesses aren't called wrong
  await expect(page.frameLocator('[data-suggestions]').getByText('que loquera lyrics')).toBeVisible();
});

test('keeps the quick answer when the web check fails', async ({ page }) => {
  const unsure = { ...answer, guesses: answer.guesses.map((guess) => ({ ...guess, confidence: 40 })) };
  await fakeApi(page, (body) => (body.check ? [{ error: 'Busy.' }, 502] : unsure));
  await page.goto('/');
  await searchFor(page);
  await expect(page.locator('.guess')).toHaveCount(2);
  await expect(page.locator('[data-status]')).toHaveText('');
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
  await searchFor(page, 'sounds like que loquera');
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
  await searchFor(page);
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
  await searchFor(page);
  await expect(page.locator('[data-progress]')).toBeVisible();
  await expect(page.locator('[data-progress-time]')).toContainText('seconds left');
  await expect(page.locator('.guess').first()).toBeVisible();
  await expect(page.locator('[data-progress]')).toBeHidden();
});

test('shows the server’s explanation when something goes wrong', async ({ page }) => {
  await fakeApi(page, () => [{ error: 'No AI model could answer right now. Please try again in a minute.' }, 502]);
  await page.goto('/');
  await searchFor(page);
  await expect(page.locator('[data-status]')).toHaveText('No AI model could answer right now. Please try again in a minute.');
  await expect(page.locator('[data-status]')).toHaveAttribute('data-kind', 'error');
  await expect(page.getByRole('button', { name: 'Find the song' })).toBeEnabled();
});

test('a failed "Search again" keeps the earlier songs on screen', async ({ page }) => {
  await fakeApi(page, (_body, count) => (count === 1 ? answer : [{ error: 'Busy.' }, 502]));
  await page.goto('/');
  await searchFor(page);
  await page.getByRole('button', { name: 'Search again' }).click();
  await expect(page.locator('[data-status]')).toHaveText('Busy.');
  await expect(page.locator('.guess')).toHaveCount(2);
});

test('debug mode shows what happened and lets you download the recording', async ({ page }) => {
  await fakeApple(page, [taxi]);
  await fakeApi(page, () => answer);
  await page.goto('/?debug');
  await record(page);
  await expect(page.getByRole('link', { name: 'Download recording' })).toHaveAttribute('href', /^blob:/);
  await expect(page.locator('[data-hum-debug]')).toContainText('with a clear note');
  await page.getByRole('button', { name: 'Find the song' }).click();
  await expect(page.locator('.guess').first().locator('[data-debug]')).toContainText('Apple (search): “El Taxi” by Osmani García, Pitbull & Sensato');
  await expect(page.locator('.guess').first().locator('[data-debug]')).toContainText('Melody check:');
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
