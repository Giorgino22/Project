/**
 * ALL ENGLISH TEXTS of the wheel site: the pages (what Google shows) and the buttons and
 * messages of the tools. Titles and descriptions target what people type into Google
 * ("spin the wheel", "yes or no wheel", "random team generator"…). Tweak them here – no code changes needed.
 *
 * de.ts has exactly the same structure; TypeScript reports an error if a German text is missing.
 * Placeholders like {n} are filled in by the code.
 */
import type { ToolPageData } from '@tools/shared/components/ToolPage.astro';

/** The texts of one page. The URL is built from `slug` (see src/site.ts). */
export interface WheelPageText extends Omit<ToolPageData, 'path'> {
  /** Last part of the URL, e.g. "yes-or-no-wheel" → /yes-or-no-wheel/ ('' = the start page) */
  slug: string;
  /** Entries a first-time visitor sees */
  preset: string[];
}

export const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
export const numbers = Array.from({ length: 10 }, (_, i) => String(i + 1));

export const en = {
  pages: {
    home: {
      slug: '',
      name: 'Spin the Wheel',
      short: 'Type names, spin, get a random winner.',
      title: 'Spin the Wheel – Free Random Name Picker Wheel',
      description:
        'Type names or options, spin the wheel and get a random winner. Free, no sign-up, works on phones and projectors – share your wheel with one link.',
      h1: 'Spin the Wheel',
      lead: 'Type your names or options, click spin and let the wheel pick. Perfect for classrooms, giveaways, games and tough decisions.',
      preset: ['Ava', 'Ben', 'Chloe', 'Daniel', 'Emma', 'Finn', 'Grace', 'Hugo'],
      steps: [
        'Type your entries in the box – one name or option per line.',
        'Click the wheel or the SPIN button. The wheel picks a winner at random.',
        'Remove the winner or spin again. Share your wheel with the "Share link" button.',
      ],
      faq: [
        {
          q: 'Is the wheel really random?',
          a: 'Yes. The winner is drawn with your browser’s cryptographic random generator, so every entry has exactly the same chance. The animation always stops on the drawn winner.',
        },
        {
          q: 'How many entries can I add?',
          a: 'Up to 500. With more than about 100 entries the names get small, but the wheel still works.',
        },
        {
          q: 'Are my entries saved?',
          a: 'Only in your own browser, so they are still there next time. Nothing is sent to a server. When you share a link, the entries are part of that link.',
        },
        {
          q: 'Can I use it in class on a projector?',
          a: 'Yes – click "Fullscreen" for a big wheel and switch the tick sound on or off as you like.',
        },
        {
          q: 'Can the same name win twice?',
          a: 'Only if it stays on the wheel. Click "Remove from wheel" after a spin to take the winner off.',
        },
      ],
    },
    yesNo: {
      slug: 'yes-or-no-wheel',
      name: 'Yes or No Wheel',
      short: 'Spin for a random yes or no.',
      title: 'Yes or No Wheel – Spin to Decide (Free & Random)',
      description:
        'Can’t decide? Spin the yes or no wheel for a random answer. Add "Maybe" or any other option. Free, instant and works on any device.',
      h1: 'Yes or No Wheel',
      lead: 'Ask your question, spin the wheel and get a random yes or no. Want more options? Add "Maybe" or anything else to the list.',
      preset: ['Yes', 'No'],
      steps: [
        'Think of a yes-or-no question.',
        'Click SPIN – the wheel lands on Yes or No at random.',
        'Add more options like "Maybe" or "Ask again" if you like.',
      ],
      faq: [
        {
          q: 'Is it really 50/50?',
          a: 'Yes. With Yes and No on the wheel, each answer has exactly a 50 % chance. Add entries to change the odds – two "Yes" lines make yes twice as likely.',
        },
        { q: 'Can I add "Maybe"?', a: 'Sure – type it on a new line and it appears on the wheel straight away.' },
        {
          q: 'What can I use it for?',
          a: 'Quick decisions, party games, choosing what to eat – any time a coin flip feels too boring.',
        },
      ],
    },
    numbers: {
      slug: 'random-number-wheel',
      name: 'Number Wheel',
      short: 'Pick a random number in any range.',
      title: 'Random Number Wheel – Spin a Number (1–100 or Any Range)',
      description:
        'Spin a wheel of numbers and get a random number. Pick any range like 1–10 or 1–100. Free number picker for games, raffles and classrooms.',
      h1: 'Random Number Wheel',
      lead: 'Choose a range, create the wheel and spin for a random number – great for raffles, games and picking a student number.',
      preset: numbers,
      steps: [
        'Enter the lowest and the highest number and click "Create wheel".',
        'Click SPIN to draw a random number.',
        'Remove drawn numbers to avoid repeats – handy for raffles.',
      ],
      faq: [
        {
          q: 'How many numbers fit on the wheel?',
          a: 'Up to 200. For a raffle with more tickets, remove numbers as they are drawn or use several wheels.',
        },
        { q: 'Can I avoid repeated numbers?', a: 'Yes – click "Remove from wheel" after each spin.' },
        { q: 'Is every number equally likely?', a: 'Yes. The draw uses your browser’s cryptographic random generator.' },
      ],
    },
    letters: {
      slug: 'letter-wheel',
      name: 'Letter Wheel',
      short: 'Spin a random letter from A to Z.',
      title: 'Letter Wheel – Spin a Random Letter from A to Z',
      description:
        'Spin the alphabet wheel to pick a random letter from A to Z. Great for word games, quizzes and classroom activities. Free and instant.',
      h1: 'Letter Wheel (A–Z)',
      lead: 'Spin the alphabet and get a random letter – for word games, spelling practice and quiz rounds.',
      preset: letters,
      steps: [
        'The wheel already has all 26 letters.',
        'Click SPIN to get a random letter.',
        'Delete letters you don’t want, like Q, X or Z, for easier games.',
      ],
      faq: [
        { q: 'Can I remove hard letters?', a: 'Yes – delete them from the list, for example Q, X and Y.' },
        { q: 'Can I use other alphabets?', a: 'Yes, type any letters or characters you like, one per line.' },
        {
          q: 'Which games work with a letter wheel?',
          a: 'Category games ("name an animal starting with B"), spelling practice, word chains and quiz tie-breakers.',
        },
      ],
    },
    teams: {
      slug: 'random-team-generator',
      name: 'Team Generator',
      short: 'Split a list of names into fair teams.',
      title: 'Random Team Generator – Split Names into Fair Teams',
      description:
        'Paste a list of names and split them into random teams in one click. Choose the number of teams or people per team. Free, fast and private.',
      h1: 'Random Team Generator',
      lead: 'Paste your names, choose how many teams you need and get fair, random teams instantly – for sports, classrooms and game nights.',
      preset: ['Ava', 'Ben', 'Chloe', 'Daniel', 'Emma', 'Finn', 'Grace', 'Hugo'],
      steps: [
        'Paste or type the names, one per line.',
        'Choose the number of teams – or how many people per team.',
        'Click "Make teams". Not happy? Click "Shuffle again" for new random teams.',
      ],
      faq: [
        {
          q: 'Are the teams fair?',
          a: 'Names are shuffled at random and dealt out like cards, so team sizes differ by at most one person.',
        },
        {
          q: 'Can I choose the team size instead?',
          a: 'Yes – switch to "People per team" and the generator works out how many teams you need.',
        },
        { q: 'Are the names stored?', a: 'Only in your own browser, so you can reuse the list next time. Nothing is sent anywhere.' },
      ],
    },
  } satisfies Record<string, WheelPageText>,

  /** The wheel tool (src/components/Wheel.astro) */
  wheel: {
    spin: 'Spin',
    spinLabel: 'Spin the wheel',
    fullscreen: 'Full screen',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    spinTime: 'Spin time',
    seconds: '{n} s',
    from: 'From',
    to: 'To',
    createWheel: 'Create wheel',
    entries: 'Entries',
    placeholder: 'One name or option per line',
    shuffle: 'Shuffle',
    sort: 'Sort A–Z',
    clear: 'Clear',
    share: 'Copy share link',
    history: 'Picked so far',
    winner: 'The wheel picked',
    again: 'Spin again',
    remove: 'Remove from wheel',
    close: 'Close',
    // Messages shown by the script
    empty: 'Add names to start',
    linkCopied: 'Link copied! Anyone who opens it sees this wheel.',
    rangeError: 'Please enter whole numbers, "From" smaller than "To", at most 200 numbers.',
    needTwo: 'Add at least two entries to spin the wheel.',
  },

  /** The team generator (src/components/TeamGenerator.astro) */
  teams: {
    names: 'Names',
    placeholder: 'One name per line',
    splitBy: 'Split by',
    byTeams: 'Number of teams',
    bySize: 'People per team',
    make: 'Make teams',
    again: 'Shuffle again',
    copy: 'Copy teams',
    // Messages shown by the script
    team: 'Team {n}',
    needTwo: 'Add at least two names.',
    needNumber: 'Please enter a number of 1 or more.',
    copied: 'Teams copied to the clipboard.',
  },

  notFound: {
    title: 'Page not found',
    text: 'This page doesn’t exist. Try one of these:',
  },
};

export type Dictionary = typeof en;
