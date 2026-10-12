# Strategy: why a privacy-first tools website

## The brief

> "Build me something that can make me money and can be scaled upwards. I myself should have
> as little effort as possible."

Turned into requirements:

1. **Little ongoing work.** No customers to support, no servers to watch, no content treadmill.
2. **Costs must not grow with success.** Ideally zero cost per extra visitor.
3. **Visitors must come by themselves.** Search engines, not paid ads or cold outreach.
4. **Room to grow.** More pages, more languages, better-paying ad networks, extra income streams.

## The options compared (research from October 2026)

| Option | Work after launch | Running cost | Cost as it grows | Main risk in 2026 |
| --- | --- | --- | --- | --- |
| Micro-SaaS (subscriptions) | High: support, billing, features | Servers, database | Grows with users | Needs active marketing; most earn little (one roundup: 70 % under $1k/month) |
| Content / affiliate blog | High: constant writing | Low | Low | Google's AI Overviews answer the questions – publishers lost ~47 % of traffic in one 2026 study |
| AI app ("wrapper") | Medium | Pay per use | Grows with every user | Competes with ChatGPT itself; abuse can cost you money |
| Digital products (templates) | Medium: new products | Low | Low | Saturated marketplaces |
| Browser extension | Medium: store reviews | Low | Low | One product, hard to monetise |
| **Tools that run in the browser** | **Low** | **≈ €10/year (domain)** | **≈ €0** (static hosting, unlimited traffic) | Competition and slow SEO (see risks) |

Why tools beat content right now: people searching "merge pdf" want to **do** something, and an
AI summary can't do it for them. AI Overviews appear on about 36 % of informational searches,
but only on about 5 % of transactional ones.

## Proof that the model works

**Photopea**, a free Photoshop alternative, is built by one developer and runs entirely in the
browser. About 90 % of its revenue comes from ads. Its founder reported **$3 million revenue
in 2024**, with costs of roughly $20 for the domain and ~$600 per year for hosting.

Photopea is an outlier after more than ten years of work. It proves the mechanics (browser-only,
ad-funded, solo, tiny costs), not that every site will earn this much.

## Honest risks – and what we do about them

| Risk | What it means | Our answer |
| --- | --- | --- |
| Strong competition | Big brands own searches like "merge pdf" (iLovePDF, Smallpdf, Adobe, PDF24). Since 2025, many AI-built "300 tools, no upload" sites appeared (OptiDrop, Toolsz, BentoPDF, NoMoreUploads…). | Fewer tools, built properly (password PDFs, lossless metadata removal, every tool tested); German as a first-class language, not an afterthought; DACH-specific tools (GiroCode); verifiable privacy. |
| SEO takes time | New domains start with zero trust. Expect months, not weeks. | Long-tail pages ("webp to png", "girocode generator"), two languages from day one, listings on AlternativeTo / Product Hunt for first links. |
| No guaranteed income | It may earn €0 for months. | Running costs are about €10 a year, so the downside is small. |
| EU / UK / Swiss ad rules | Personalised ads need a certified consent banner (EEA & UK since 16 Jan 2024, Switzerland since 31 Jul 2024). | Google's own free consent message in AdSense – one setting, no code (see the launch checklist). |
| Google's "scaled content abuse" policy | Mass-produced pages without real value get demoted. | Every page is a working tool with page-specific help and FAQ. No auto-generated filler. |

## Positioning: "Free PDF & image tools that never upload your files"

- **Trust is the product.** Contracts, bank statements, IDs, photos with your home location:
  people hesitate to upload them. Here they don't have to, and they can check it themselves
  (developer tools → Network tab).
- **German-speaking markets first, alongside English.** Germany, Austria and Switzerland are
  wealthy, care about privacy ("Datenschutz") and have far fewer good local-language tool sites.
- **No dark patterns.** No signup, no watermark, no expiring QR codes. Some QR sites sell
  "dynamic" codes that stop working after a 7-day trial, and Trustpilot reviews show a steady stream of complaints.
  Honest tools get recommended and linked, and links are what make a site rank.

## Income streams

1. **Display ads.** Start with Google AdSense. Once you have traffic, move to better-paying networks:
   - Mediavine Journey: from about 1,000 sessions a month (lowered in January 2026)
   - Raptive: from 25,000 page views a month (since October 2025)
   - Mediavine: from 50,000 sessions a month
2. **Affiliate links, chosen to fit each tool.** The password generator is a natural place for a
   password manager. Programmes pay roughly 25–35 % of the first payment (for example 1Password,
   Proton, RoboForm and LastPass); check each programme's current terms.
3. **Tips** (Ko-fi / Buy Me a Coffee), shown right after a tool has finished, when people are most grateful.
4. **Later, optional:** a "Pro" version (no ads, batch processing) or licences for companies whose
   data-protection rules forbid uploading documents. A merchant of record such as Paddle, Lemon Squeezy or Polar
   (≈ 5 % + €0.50 per sale) handles VAT worldwide.

### What could it earn? (illustration, not a promise)

Ad income is measured in **RPM**: revenue per 1,000 page views. It varies a lot by country,
topic and ad network. 2026 sources range from a few dollars to $12–40 for US traffic.

| Page views per month | at $3 RPM | at $8 RPM |
| ---: | ---: | ---: |
| 10,000 | $30 | $80 |
| 100,000 | $300 | $800 |
| 1,000,000 | $3,000 | $8,000 |

Affiliate commissions and tips come on top. How many page views the site gets depends on
rankings, and nobody can promise those. Treat the table as a way to read your numbers later.

## Growth plan

| Phase | When | What you do | Effort |
| --- | --- | --- | --- |
| 1. Launch | Day 1 | [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md) | 2–3 hours, once |
| 2. Get found | Months 1–3 | Submit to Google/Bing, list on AlternativeTo and Product Hunt, apply for AdSense once pages get visitors | A few hours in total |
| 3. Double down | Months 3–12 | In Google Search Console, see which tools get impressions; add similar tools and new languages (French, Italian, Spanish, Dutch, Polish…); switch to a better ad network once eligible | About 1 hour per month (or ask Claude) |
| 4. Expand | Year 2 | Optional Pro version or B2B licences | Optional |

### Ideas for new tools (best first)

1. **Swiss QR-bill generator (QR-Rechnung).** Required on Swiss invoices, high value for
   freelancers and small businesses, little competition.
2. **Unlock PDF** (remove a password you know) · **add page numbers / watermark**
3. **Compress PDF** (re-compresses the images inside)
4. More converter pages: AVIF → JPG, SVG → PNG, GIF → PNG · **crop image**
5. ~~**Text from image (OCR)** with tesseract.js~~ – done (October 2026)
6. **Offline mode** (installable web app). It also proves the "no upload" promise.
7. HEIC → JPG (iPhone photos) is very popular, but the decoder libraries come with LGPL and
   HEVC patent questions. Check those first.

## Update (October 2026): from one site to a network

KeepLocal became the first of several sites on one central domain, each on its own subdomain
and each aimed at a topic that many people search for.

### What the research showed

Monthly visits, as estimated by Semrush, Similarweb and Ahrefs (the estimates vary a lot):

| Site | What it does | Visits per month |
| --- | --- | --- |
| iLovePDF | ~25–30 PDF tools | ~255M |
| Smallpdf | PDF tools | ~36–43M |
| Wheel of Names | random name wheel | ~17–25M, visits of ~11 minutes |
| Monkeytype | typing test | ~15M |
| imagetotext.info | image → text | ~5.7M |
| TinyWow | 250+ mixed tools | ~2M |

- **Quality beats quantity.** iLovePDF has about 25 tools and ~255M visits; TinyWow has 250+
  tools and ~2M.
- **Skip what Google answers itself.** Google shows its own calculator, timer, metronome, coin
  flip, dice, colour picker and number spinner, so few searchers click through to a website.
- **Fun tools bring long visits** (more ads seen per visitor). **Work tools** like PDF bring
  business visitors, whose ads usually pay more. The network has both.

### What was built, and why

| Site | Aimed at | Notes |
| --- | --- | --- |
| Spin the Wheel | Wheel of Names (~17–25M) | Google's spinner only does numbers. Long classroom visits. Fair, provably random draws. Share links. |
| Typing Test | Monkeytype (~15M) | 1, 3 and 5 minute tests, practice lessons, a kids page **without ads**, a keyboard tester. Original word lists (no copyrighted texts). |
| Image to text (in KeepLocal) | imagetotext.info (~5.7M) | Runs in the browser, so it's private for receipts and documents. English and German. |
| Hub | – | Links all sites and their popular tools, and holds the shared legal pages and `ads.txt`. |

### Subdomains vs. one site with sections

Google says it treats `wheel.example.com` and `example.com/wheel/` about the same, but many SEO
practitioners find folders rank better, because links to any page help all pages. The owner
chose subdomains (separate, focused sites are easier to keep track of and to tune). We
make up for it like this:

- every footer links to every other site, and the hub links to each site's most popular tools;
- one Google Search Console **domain property** covers all subdomains;
- one AdSense account, with `ads.txt` on the main domain covering all subdomains.

### What we don't build

- **Song/video downloaders** ("youtube to mp3"): against the platforms' rules and a legal risk
  (youtube-mp3.org was shut down after an industry lawsuit, and MP3Skull lost a $22.2M judgment).
  AdSense bans such pages, and a strike could suspend the account for **all** sites. Google
  demotes sites after copyright complaints, and downloaders need servers that cost money per user.
- **Calculators, timers, speed tests**: Google answers these itself.
- **AI chat or writing tools**: every use costs money.

### Next ideas (best first)

1. More PDF tools: compress, password-protect, unlock, page numbers (KeepLocal).
2. Audio/video with your own files: MP4 → MP3, cut audio, video → GIF. The Mediabunny library
   uses the browser's built-in encoders, so no servers are needed.
3. German versions of the wheel and typing sites (German word lists), then French, Italian and
   Spanish.
4. On-device AI: background remover, speech → text, text → speech. Big model downloads
   (75–200 MB) and only the newest browsers, so later.
5. German-speaking niches: Swiss QR-bill, invoices, cancellation letters.

## Sources

- Photopea revenue: [Indie Hackers – "Making $3M+ per year with a free product"](https://www.indiehackers.com/post/making-3m-per-year-with-a-free-product-axW4u1vB6C8f91Z3Lxu5), [AIN.ua (2021)](https://en.ain.ua/2021/04/15/photopea-history)
- AI Overviews and traffic: [First Page Sage – AI impact report 2026](https://firstpagesage.com/seo-blog/ai-impact-on-website-traffic-report/), [Incrementors – 2026 data](https://www.incrementors.com/blog/google-ai-overviews-traffic-impact-2026-data/)
- Micro-SaaS outcomes (secondary source): [Dodo Payments – micro-SaaS ideas 2026](https://dodopayments.com/blogs/micro-saas-ideas-2026)
- Hosting cost: [Gigazine – why Cloudflare Pages has unlimited bandwidth](https://www.gigazine.net/gsc_news/en/20250116-why-cloudflare-pages-free), [Cloudflare Pages vs Workers 2026](https://mecanik.dev/en/posts/cloudflare-pages-vs-workers-which-to-use-in-2026/)
- Consent banner requirement: [Google AdSense Help – certified CMP](https://support.google.com/adsense/answer/13554116?hl=en)
- Ad network thresholds: [Panstag – from AdSense to premium ads (2026)](https://www.panstag.com/2026/07/when-to-move-adsense-to-premium-ad-network.html), [Newor Media comparison](https://newormedia.com/blog/?p=1434) (vendor source)
- RPM ranges: [Adstimate – AdSense RPM by country 2026](https://adstimate.com/blog/adsense-rpm-by-country.html)
- Affiliate rates: [Commissiondex – 1Password](https://commissiondex.com/programs/1password/), [FindAffiliates – password manager programmes 2026](https://www.findaffiliates.online/blog/password-manager-affiliate-programs-2026), [Lasso – RoboForm](https://getlasso.co/affiliate/roboform-password-manager-affiliate-program/)
- Merchant-of-record fees: [Aliteq – cheapest merchant of record 2026](https://aliteq.com/cheapest-merchant-of-record)
- Competitors: [BentoPDF](https://www.bentopdf.com/), [OptiDrop on Product Hunt](https://www.producthunt.com/p/optidrop-free-private-tools/optidrop), [NoMoreUploads on Capterra](https://www.capterra.com.au/software/1094605/NoMoreUploads)
- Expiring QR code complaints: [Trustpilot – qr-code-creator.io](https://es.trustpilot.com/review/qr-code-creator.io)
- Google's scaled-content policy: [Search Engine Journal – Google spam policies](https://www.searchenginejournal.com/in-depth-look-at-google-spam-policies-updates/511005/)
- Network research (October 2026): [iLovePDF](https://www.semrush.com/website/ilovepdf.com/overview/) · [Wheel of Names (Semrush)](https://www.semrush.com/website/wheelofnames.com/overview/) · [Wheel of Names (Similarweb)](https://www.similarweb.com/website/wheelofnames.com/) · [Monkeytype](https://www.semrush.com/website/monkeytype.com/overview/) · [imagetotext.info](https://www.similarweb.com/website/imagetotext.info/) · [TinyWow](https://ja.semrush.com/website/tinywow.com/overview) · [Google's built-in tools](https://www.tomsguide.com/how-to/google-search-hidden-features) · [Google Publisher Policies](https://support.google.com/adsense/answer/10502938?hl=en) · [youtube-mp3.org shutdown](https://thenextweb.com/news/riaa-shuts-down-popular-youtube-to-mp3-conversion-site) · [MP3Skull](https://en.wikipedia.org/wiki/Mp3skull) · [Google's piracy demotion](https://searchengineland.com/googles-pirate-update-leads-to-89-drop-in-search-traffic-380699) · [Mediabunny](https://mediabunny.dev/) · [AdSense ads.txt for subdomains](https://support.google.com/adsense/answer/9785052) · [Subdomain vs. subfolder](https://superblog.ai/blog/subdomain-vs-subdirectory/)
