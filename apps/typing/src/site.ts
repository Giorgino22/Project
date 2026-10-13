/**
 * Everything search engines and visitors read on this site: one entry per page.
 * Titles and descriptions target what people type into Google ("typing test", "3 minute typing
 * test", "typing practice", "keyboard test"…). Tweak them here – no code changes needed.
 */
import type { ToolPageData } from '@tools/shared/components/ToolPage.astro';
import type { TestOptions } from './lib/typing';

export const site = {
  id: 'typing' as const,
  /** AdSense ad unit IDs for this site (empty = no ad). The publisher ID is in network.ts. */
  adSlots: { afterTool: '', beforeFaq: '' },
};

interface TypingPage extends ToolPageData {
  /** Settings of the typing test on this page (the keyboard test page has none) */
  test?: TestOptions;
  /** true = no ads on this page (pages for children) */
  noAds?: boolean;
}

const steps = [
  'Click the box and type the highlighted word. The timer starts with your first key.',
  'Press the space bar after each word. Green words are right, red words are wrong.',
  'When the time is up you see your words per minute, your accuracy and your personal best.',
];

export const pages = {
  home: {
    path: '/',
    name: 'Typing Test',
    short: 'Your typing speed in one minute.',
    title: 'Typing Test – Free 1-Minute Typing Speed Test (WPM)',
    description:
      'How fast do you type? Take a free 1-minute typing test and see your words per minute (WPM) and accuracy. No sign-up, tests from 30 seconds to 5 minutes.',
    h1: 'Typing Speed Test',
    lead: 'Type the words as fast and as accurately as you can – the timer starts with your first key. After one minute you see your speed in words per minute (WPM).',
    test: { duration: 60, durations: [30, 60, 120, 180, 300] },
    steps,
    faq: [
      {
        q: 'What is a good typing speed?',
        a: 'Most adults type around 40 words per minute. 50 to 70 WPM is fast, and above 80 WPM is the level of professional typists. Accuracy matters too: aim for 95 % or more.',
      },
      {
        q: 'How is WPM calculated?',
        a: 'Every five characters count as one word, including the space after a word. Only correctly typed words count, so mistakes lower your score. This is the standard way to measure typing speed.',
      },
      {
        q: 'How can I type faster?',
        a: 'Learn to touch type: rest your fingers on the home row (A S D F and J K L ;) and try not to look at the keyboard. Practise a few minutes every day – our free typing practice lessons help.',
      },
      {
        q: 'Is my personal best saved?',
        a: 'Yes, in your own browser on this device. Nothing is sent to a server and you don’t need an account.',
      },
      {
        q: 'Can I take the test on my phone?',
        a: 'Yes, the test works with on-screen keyboards too – although most people type much faster on a real keyboard.',
      },
    ],
  },
  threeMinutes: {
    path: '/3-minute-typing-test/',
    name: '3-Minute Test',
    short: 'A longer test for your steady speed.',
    title: '3 Minute Typing Test – Check Your Real Typing Speed',
    description:
      'Take a free 3-minute typing test and get your real, steady speed in words per minute (WPM) and accuracy. Good practice for typing tests in job applications.',
    h1: '3 Minute Typing Test',
    lead: 'Longer than the usual minute, so a lucky start or a single slip matters less. Keep a steady pace for three minutes and see your real typing speed.',
    test: { duration: 180, durations: [60, 180, 300] },
    steps,
    faq: [
      {
        q: 'Why take a 3-minute test instead of 1 minute?',
        a: 'In one minute a fast start or one slip changes the result a lot. Three minutes show the speed you can actually keep up – the number employers and typing courses care about.',
      },
      {
        q: 'What is a good result for 3 minutes?',
        a: 'About 40 WPM is average. Many office jobs look for around 40 WPM with high accuracy; data entry jobs often ask for more.',
      },
      {
        q: 'Can I pause the test?',
        a: 'No – like a real typing test, the clock keeps running. Press Esc or "Restart" to start over.',
      },
    ],
  },
  fiveMinutes: {
    path: '/5-minute-typing-test/',
    name: '5-Minute Test',
    short: 'The classic length for job typing tests.',
    title: '5 Minute Typing Test – Free WPM Test with Accuracy',
    description:
      'Take a free 5-minute typing test, the classic length for job typing tests. See your words per minute (WPM), your accuracy and the words you got wrong.',
    h1: '5 Minute Typing Test',
    lead: 'Five minutes show your true typing speed and stamina. Get comfortable, keep your eyes on the text and type at a pace you can hold.',
    test: { duration: 300, durations: [60, 180, 300] },
    steps,
    faq: [
      {
        q: 'Why do job typing tests take 5 minutes?',
        a: 'Five minutes are long enough to show how fast and accurately you type over time, not just in a short burst. That is the skill you need for real work.',
      },
      {
        q: 'How do I prepare for a typing test?',
        a: 'Practise 10 to 15 minutes a day, focus on accuracy first and speed second, and take a few practice tests of the same length as the real one.',
      },
      {
        q: 'Are mistakes counted?',
        a: 'Yes. Wrong words don’t count towards your WPM, and every wrong keystroke lowers your accuracy. At the end you see which words to practise.',
      },
    ],
  },
  practice: {
    path: '/typing-practice/',
    name: 'Typing Practice',
    short: 'Short lessons for every row of keys.',
    title: 'Typing Practice – Free Lessons for Every Row of Keys',
    description:
      'Free typing practice with short lessons: home row, top row, bottom row, numbers and punctuation. No time limit – type at your own pace and see your speed.',
    h1: 'Typing Practice',
    lead: 'Pick a lesson and type at your own pace – there is no time limit. Start with the home row and work your way up to full sentences.',
    test: { duration: 0, lessons: true },
    steps: [
      'Choose a lesson, for example "Home row".',
      'Type the words and press the space bar after each one. There is no time limit.',
      'After the last word you see your speed and accuracy. Repeat until it feels easy, then take the next lesson.',
    ],
    faq: [
      {
        q: 'What is the home row?',
        a: 'The middle row of letter keys. Your left fingers rest on A S D F and your right fingers on J K L ; – most keyboards have small bumps on F and J so you can find them without looking.',
      },
      {
        q: 'How long should I practise each day?',
        a: '10 to 20 minutes a day is plenty. Short, regular sessions build muscle memory faster than one long session a week.',
      },
      {
        q: 'Should I focus on speed or accuracy?',
        a: 'Accuracy first. Speed comes by itself once your fingers know where the keys are – and fixing mistakes costs more time than typing a little slower.',
      },
    ],
  },
  kids: {
    path: '/typing-test-for-kids/',
    name: 'Kids Typing Test',
    short: 'Short words in big letters.',
    title: 'Typing Test for Kids – Easy Words & Big Letters',
    description:
      'A free typing test for kids with short, easy words and big letters. See words per minute and accuracy and beat your own record. No sign-up and no ads.',
    h1: 'Typing Test for Kids',
    lead: 'Short, easy words in big letters. Type each word and press the space bar – can you beat your own record?',
    test: { duration: 60, durations: [60, 120], words: 'kids', large: true },
    noAds: true,
    steps: [
      'Type the highlighted word, then press the space bar.',
      'Green words are right. Red words were wrong – no problem, just keep going!',
      'When the time is up, you see how many words you typed per minute. Try again to beat your record!',
    ],
    faq: [
      {
        q: 'What is a good typing speed for kids?',
        a: 'It depends on age and practice. Many children start at 5 to 15 words per minute, and older children who practise often reach 20 to 40 WPM. The best goal is to beat your own record.',
      },
      {
        q: 'Is this page safe for children?',
        a: 'Yes. There are no ads on this page, no sign-up and no chat. Results are saved only in the browser on your device.',
      },
      {
        q: 'How can kids learn to type faster?',
        a: 'Little and often: 10 minutes a day works better than one long session. Start with the home row lesson in our typing practice and try not to look at the keys.',
      },
    ],
  },
  keyboard: {
    path: '/keyboard-test/',
    name: 'Keyboard Test',
    short: 'Check that every key works.',
    title: 'Keyboard Test – Check Every Key Online (Free Key Tester)',
    description:
      'Test your keyboard online: press any key and watch it change on the screen. Find broken, stuck or ghosting keys in seconds. Free, nothing to install.',
    h1: 'Keyboard Test',
    lead: 'Press the keys on your keyboard one by one. Every key that works turns yellow. Keys that stay white may be broken.',
    steps: [
      'Click the keyboard picture (on most computers it is already active).',
      'Press every key you want to test. Working keys turn yellow, and a key you hold down looks pressed.',
      'Keys that stay white may be broken – or missing on your keyboard. "Reset" starts over.',
    ],
    faq: [
      {
        q: 'Why doesn’t a key turn yellow?',
        a: 'The key may be broken, or the computer may use it for something else – keys like Print Screen or the Windows key are often taken by the system. Keys that aren’t in the picture still show up under "Last key".',
      },
      {
        q: 'How do I test for key ghosting?',
        a: 'Hold several keys at the same time. Every key you hold should look pressed. If one doesn’t, your keyboard can’t register that many keys at once.',
      },
      {
        q: 'Does it work with laptop and wireless keyboards?',
        a: 'Yes, with any keyboard your computer recognises. Nothing is installed and nothing you type leaves your device.',
      },
      {
        q: 'My keyboard has a different layout. Does the test work?',
        a: 'Yes. The picture shows a US layout, but the test checks the physical keys – the key in the same place turns yellow, whatever is printed on it.',
      },
    ],
  },
} satisfies Record<string, TypingPage>;

export const allPages: ToolPageData[] = Object.values(pages);
