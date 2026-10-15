import { describe, expect, it } from 'vitest';
import { pickBestMatch, sameSong, simplify, songLink } from '../../src/lib/songs';
import { MAX_AUDIO_CHARACTERS, buildPrompt, cleanAnswer, extractJson, readRequest } from '../../src/worker/answer';

describe('what we ask the AI', () => {
  it('describes the first try', () => {
    const prompt = buildPrompt({ hasAudio: true, hint: 'with Pitbull', rounds: [], search: false });
    expect(prompt).toContain('attached recording');
    expect(prompt).toContain('"with Pitbull"');
    expect(prompt).not.toContain('WRONG');
    expect(prompt).not.toContain('Google Search');
  });

  it('lists the wrong songs and the feedback when searching again', () => {
    const prompt = buildPrompt({
      hasAudio: false,
      hint: '',
      rounds: [{ guesses: [{ title: 'El Taxi', artist: 'Osmani García' }], feedback: 'older' }],
      search: true,
    });
    expect(prompt).toContain('no recording');
    expect(prompt).toContain('- "El Taxi" by Osmani García');
    expect(prompt).toContain('- "older"');
    expect(prompt).toContain('Google Search');
    expect(prompt).toContain('ONLY one JSON object');
  });
});

describe('checking what the page sends', () => {
  it('needs a recording or a note', () => {
    expect(readRequest({})).toContain('Record something');
    expect(readRequest(null)).toContain('could not be read');
    expect(readRequest({ audio: 42 })).toContain('recording could not be read');
    expect(readRequest({ audio: 'x'.repeat(MAX_AUDIO_CHARACTERS + 1) })).toContain('too long');
  });

  it('cleans up rounds and texts', () => {
    const request = readRequest({
      hint: '  la la\u0007 la  ',
      rounds: [{ guesses: [{ title: 'Song', artist: 'Band', extra: true }, 'junk'], feedback: '' }, 'junk'],
    });
    expect(request).toEqual({
      audio: undefined,
      hint: 'la la  la',
      rounds: [{ guesses: [{ title: 'Song', artist: 'Band' }, { title: '', artist: '' }], feedback: 'None of these are right.' }],
    });
  });
});

describe('reading the AI’s answer', () => {
  it('finds the JSON even when wrapped in other text', () => {
    expect(extractJson('Here you go:\n```json\n{"guesses": []}\n```')).toEqual({ guesses: [] });
    expect(extractJson('no json here')).toBeNull();
    expect(extractJson('{broken')).toBeNull();
  });

  it('keeps only clean, new songs', () => {
    const wrong = [{ title: 'El Taxi', artist: 'Osmani García' }];
    const answer = cleanAnswer(
      {
        heard: 'humming',
        words: 'que loquera',
        question: '',
        guesses: [
          { title: 'El taxi', artist: 'OSMANI GARCIA', confidence: 90, why: 'again' }, // was wrong before
          { title: 'Echa Pa’lla', artist: 'Pitbull', year: 2010, confidence: 140, why: 'fits' },
          { title: 'Echa Pa’lla', artist: 'Pitbull', confidence: 10, why: 'duplicate' },
          { title: '', artist: 'Nobody', confidence: 5, why: 'no title' },
          'junk',
        ],
      },
      wrong,
    );
    expect(answer?.guesses).toEqual([{ title: 'Echa Pa’lla', artist: 'Pitbull', year: '2010', confidence: 100, why: 'fits' }]);
    expect(answer?.words).toBe('que loquera');
  });

  it('refuses answers without a list of songs', () => {
    expect(cleanAnswer(null)).toBeNull();
    expect(cleanAnswer({ heard: 'x' })).toBeNull();
  });

  it('compares songs without case, accents or punctuation', () => {
    expect(simplify('Lo Que Pasó, Pasó')).toBe('lo que paso paso');
    expect(sameSong({ title: 'Lo Que Pasó, Pasó', artist: 'Daddy Yankee' }, { title: 'lo que paso paso', artist: 'DADDY YANKEE' })).toBe(true);
  });
});

describe('choosing the preview', () => {
  const track = (trackName: string, artistName: string) => ({
    trackName,
    artistName,
    previewUrl: `https://audio.example/${trackName}.m4a`,
    trackViewUrl: 'https://music.apple.com/x',
  });

  it('takes the version whose title and artist match', () => {
    const results = [
      track('El Taxi (Karaoke Version)', 'Karaoke Stars'),
      track('Taxi Driver', 'Someone Else'),
      track('El Taxi (feat. Pitbull & Sensato)', 'Osmani García "La Voz"'),
    ];
    expect(pickBestMatch(results, 'El Taxi', 'Osmani García, Pitbull & Sensato')?.trackName).toBe('El Taxi (feat. Pitbull & Sensato)');
  });

  it('rather shows no preview than a wrong song', () => {
    expect(pickBestMatch([track('Hey Ya!', 'Outkast')], 'El Taxi', 'Osmani García')).toBeNull();
    expect(pickBestMatch([{ trackName: 'El Taxi', artistName: 'Osmani García' }], 'El Taxi', 'Osmani García')).toBeNull(); // no preview file
  });
});

describe('Spotify and YouTube links', () => {
  it('jump straight to the first result on DuckDuckGo', () => {
    const spotify = new URL(songLink('spotify', 'Starman', 'David Bowie'));
    expect(spotify.origin).toBe('https://duckduckgo.com');
    expect(spotify.searchParams.get('q')).toBe('\\Starman David Bowie song site:open.spotify.com');
    expect(new URL(songLink('youtube', 'La Gozadera', 'Gente de Zona')).searchParams.get('q')).toBe(
      '\\La Gozadera Gente de Zona site:youtube.com',
    );
  });

  it('keep special characters intact', () => {
    const link = new URL(songLink('youtube', 'Rock & Roll #1', 'AC/DC'));
    expect(link.searchParams.get('q')).toBe('\\Rock & Roll #1 AC/DC site:youtube.com');
  });
});
