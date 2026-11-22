# Next steps: from visitors to income (November 2026)

Where we are: 5 sites, most of them in English and German. Search Console (November 2026) showed
51 indexed pages, 371 impressions and 3 clicks in 28 days. The English pages rank on page 8–9,
because the domain is new and almost nobody links to it yet. The German pages get the most
impressions, so German is where we can win first.

**Income needs visitors first.** At a typical $3–8 per 1,000 page views (see STRATEGY.md),
1,000 visits a month earn a few dollars. Ads only matter from tens of thousands of visits a month.
So for now: get indexed, get the first links, then build more of what Search Console shows works.

## 1. This week (about 1 hour, only you can do it)

### Google Search Console (15 minutes)

1. Open the `toolstin.com` domain property → *Sitemaps* → add each of these:
   - `https://toolstin.com/sitemap.xml`
   - `https://keeplocal.toolstin.com/sitemap.xml`
   - `https://wheel.toolstin.com/sitemap.xml`
   - `https://typing.toolstin.com/sitemap.xml`
   - `https://humm.toolstin.com/sitemap.xml`
2. *URL inspection* → paste a URL → *Request indexing*, for the new German start pages (Google
   allows about 10 a day): `https://wheel.toolstin.com/de/`, `https://typing.toolstin.com/de/`,
   `https://toolstin.com/de/`, `https://typing.toolstin.com/de/tippen-ueben/`,
   `https://typing.toolstin.com/de/tastaturtest/`, `https://wheel.toolstin.com/de/teamgenerator/`.

### Bing Webmaster Tools (10 minutes)

Sign in at bing.com/webmasters → *Import from Google Search Console*. That copies the sites and
sitemaps in one step. Bing's index also feeds DuckDuckGo and Yahoo, so this is free extra reach.

### First links (30–60 minutes)

Links from other sites are what lifts a new domain out of page 8. Start with listings that are
meant for exactly this (check each site's rules before posting; never buy links):

- **AlternativeTo** (alternativeto.net, free account): add each site as an alternative to the
  big names. Texts to paste:
  - *KeepLocal* – alternative to iLovePDF, Smallpdf: "Free PDF and image tools that run entirely
    in your browser – merge, split and rotate PDFs, compress and convert images, image to text,
    QR codes and Swiss QR-bills. Files are never uploaded. No sign-up, no watermark. English and German."
  - *Spin the Wheel* – alternative to Wheel of Names: "Free random name picker wheel for classrooms
    and games: yes/no, number and letter wheels, team generator, share links. No sign-up, no
    upload, provably fair draws. English and German (Glücksrad)."
  - *Typing Test* – alternative to Monkeytype, 10FastFingers: "Free typing speed test (30 s to
    5 min), practice lessons with a finger chart, an ad-free kids test and a keyboard tester.
    German version with German words, Anschläge per minute and a QWERTZ / Swiss keyboard."
- **Teachers in Switzerland, Germany and Austria** use name wheels and typing tests every day.
  A short note in a teacher group or to a school's media/ICT contact works better than any ad.
  Text to paste (German):
  > Kostenloses Glücksrad und Tipptest für den Unterricht, ohne Anmeldung und ohne dass Daten
  > hochgeladen werden: https://wheel.toolstin.com/de/ (Namen auslosen, Teams einteilen,
  > Zahlen- und Buchstabenrad) und https://typing.toolstin.com/de/ (Tipptest in Anschlägen pro
  > Minute, Lektionen fürs 10-Finger-System, Tipptest für Kinder ohne Werbung, Tastaturtest mit
  > Schweizer Tastatur). Feedback ist sehr willkommen!

## 2. Every 2–4 weeks (15 minutes, or ask Claude)

Search Console → *Performance* → *Pages*: which pages get impressions, and for which searches?
Then ask Claude: *"Here are my Search Console queries – improve the pages that get impressions
and build pages for similar searches."* Pages with impressions but no clicks often only need a
better title and description.

## 3. AdSense: when, and how

- **When:** once Search Console shows roughly 30–50 clicks a day. Before that, ads earn almost
  nothing and only slow the pages down.
- **What Google checks:** AdSense has no minimum traffic, but free-tool sites are often rejected
  as "low value content" when their pages have little text. Our tool pages have how-to steps and
  FAQs, and the practice page a finger chart; before applying, ask Claude to add a short guide to
  the most-visited pages.
- **Then:** put the publisher ID into `packages/shared/src/network.ts` (`adsenseClient`), turn on
  Google's consent message (required for visitors from the EU, the UK and Switzerland) – see the
  launch checklist. The privacy policies update themselves, and the kids page never shows ads.
- **Later:** better-paying networks from more traffic (see "Income streams" in STRATEGY.md).

## What Claude did in November 2026 (so you know what's live)

- German versions of the wheel and typing sites (11 pages), German privacy policy and legal
  notice, a German start page at toolstin.com/de/ that links all German tools.
- A finger chart ("Welcher Finger tippt welche Taste?") on both practice pages – a common search,
  answered with a coloured keyboard and a list of keys per finger.
- KeepLocal (other session): Swiss QR-bill generator and password card.
