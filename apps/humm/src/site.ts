/**
 * Everything search engines and visitors read on this site. Titles and descriptions target what
 * people type into Google ("find a song by humming", "what song is this", "hum to search").
 * Tweak them here – no code changes needed.
 */
import type { ToolPageData } from '@tools/shared/components/ToolPage.astro';

export const site = {
  id: 'humm' as const,
  /** AdSense ad unit IDs for this site (empty = no ad). The publisher ID is in network.ts. */
  adSlots: { afterTool: '', beforeFaq: '' },
};

export const pages = {
  home: {
    path: '/',
    name: 'Find a song',
    short: 'Hum a tune and find out which song it is.',
    title: 'Humm – Find a Song by Humming, Singing or Whistling',
    description:
      'Hum, sing or whistle the bit you remember and find the song. Add a few words you know, play previews and keep asking until it’s the right one. Free.',
    h1: 'Find a song by humming',
    lead: 'Hum, whistle or sing the part you remember – “na na na” instead of the words is fine. Add anything else you know, and Humm names the song.',
    steps: [
      'Tap the yellow key and hum, whistle or sing for 5 to 30 seconds. Tap it again to stop.',
      'Type anything else you remember – a few words, the singer, where you heard it – and tap “Find the song”.',
      'Play the previews. Not the right one? Tell Humm what’s wrong and it searches again, this time on the web too.',
    ],
    faq: [
      {
        q: 'Does it work if I don’t know the words?',
        a: 'Yes. Humming or “na na na” is enough for well-known songs. Even a single word you’re sure about, the singer or the year you heard it helps a lot, so type it into the box.',
      },
      {
        q: 'What happens to my recording?',
        a: 'When you tap “Find the song”, your recording and what you typed are sent through our server to Google’s Gemini AI, which listens and suggests songs. We don’t store them, and Google doesn’t use them to train its AI. Until you tap the button, the recording stays in your browser.',
      },
      {
        q: 'Why was the first guess wrong?',
        a: 'Recognising a hummed tune is hard, even for people. Tell Humm what’s wrong (“older”, “a woman sings”, “it was in Spanish”) and search again: from the second try on, Humm also searches the web for the words it heard.',
      },
      {
        q: 'Where do the previews come from?',
        a: 'Each song comes with Spotify’s player, which plays a 30-second preview (the whole song if you’re logged in to Spotify). If Spotify isn’t known for a song, you get Apple Music’s preview or the YouTube video instead. Humm finds the songs on these services through Wikidata, the free database behind Wikipedia. If a song isn’t in it yet, there’s no preview and the links search for it instead.',
      },
      {
        q: 'Is Humm free?',
        a: 'Yes, with no account. To keep it free for everyone, each person can search a few times per minute.',
      },
    ],
  },
} satisfies Record<string, ToolPageData>;

export const allPages: ToolPageData[] = Object.values(pages);
