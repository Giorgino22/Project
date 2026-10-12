# Launch checklist

Everything here needs **you**: accounts in your name, your bank details, your address. The code
is ready. Plan **2–3 hours once**. After that the site runs by itself.

**Costs:** a domain (≈ €10–15 per year). Everything else on this list is free.

Every value you need to enter goes into [`src/config.ts`](../src/config.ts). Change it on
GitHub (pencil icon → "Commit changes"); Cloudflare then rebuilds and publishes the site automatically.

---

## 0. Make `main` your branch (1 minute)

The code was pushed to the branch `claude/epic-maxwell-ons3xd`. Because the repository was
empty, GitHub may have made it the default branch.

- **Easiest:** GitHub → your repository → **Settings → General → Default branch** → pencil icon
  → rename it to `main`.
- **Or:** open a pull request into `main` and merge it.

## 1. Choose a name and buy the domain (15 minutes)

- The working name is **KeepLocal**. Before you buy, check that the name is free as a domain
  and isn't someone else's brand (search it and check a trademark register such as
  [TMview](https://www.tmdn.org/tmview/)).
- Short `.com`, `.app` or `.tools` domains work well. A German-language domain (e.g. `.de` or
  `.ch`) is also an option if you want to focus on German-speaking visitors.
- Cheapest place to buy: **Cloudflare Registrar**, which sells at cost. Create a free account
  at [cloudflare.com](https://dash.cloudflare.com/sign-up) → *Domain Registration → Register Domains*.
- Then, in `src/config.ts`:
  - `siteName` → your name
  - `siteUrl` → `https://your-domain.com` (no slash at the end)
  - In `wrangler.jsonc`, change `"name"` to a short project name (e.g. your brand in lowercase).
- If you changed the name, also re-create the social-media preview image with `npm run images`
  (or ask Claude to do it).

## 2. Fill in your details for the legal pages (10 minutes)

Many countries (including Germany, Austria and Switzerland) require websites with ads to show
who runs them. In `src/config.ts` → `owner`, enter your **name, postal address and e-mail**.
The legal notice ("Impressum") and privacy policy pages fill themselves in.

> ⚠️ The privacy policy is a careful starting point, not legal advice. It updates itself when
> you switch ads, statistics, tips or affiliates on or off. Have it checked, or compare it with a
> privacy-policy generator for your country, especially once ads are running.

## 3. Publish the site on Cloudflare (20 minutes)

1. Cloudflare dashboard → **Workers & Pages → Create application → Import a repository**
   (connect your GitHub account when asked) → choose this repository.
2. Settings:
   - **Project name:** exactly the `"name"` from `wrangler.jsonc` (default: `keeplocal`)
   - **Build command:** `npm run build`
   - **Deploy command:** `npx wrangler deploy` (the default)
   - **Production branch:** `main`
3. Click **Deploy**. After about two minutes the site is live at a `….workers.dev` address.
4. Connect your domain: open the Worker → **Settings → Domains & Routes → Add → Custom domain** →
   enter your domain.

<details>
<summary>Your dashboard only offers "Pages"? Use these settings instead.</summary>

*Workers & Pages → Create → Pages → Connect to Git* → choose the repository →
Framework preset **Astro**, Build command **`npm run build`**, Build output directory **`dist`**.
Then add your domain under *Custom domains*. The `_headers` file works on both.
</details>

From now on, every change you push to `main` goes live automatically within a few minutes.

## 4. Tell search engines about the site (15 minutes)

1. [Google Search Console](https://search.google.com/search-console) → *Add property* →
   **Domain** → verify (Google can add the DNS record at Cloudflare for you).
2. *Sitemaps* → enter `sitemap.xml` → *Submit*.
3. [Bing Webmaster Tools](https://www.bing.com/webmasters) → *Import from Google Search Console*
   (one click). Bing also feeds several AI search engines.

## 5. Turn on visitor statistics (5 minutes)

Cloudflare dashboard → **Analytics & Logs → Web Analytics → Add a site** → choose your domain
and the **automatic setup**. It uses no cookies, so you need no cookie banner for it.
Then set `analytics.cloudflare: true` in `src/config.ts`, which adds a paragraph to the privacy policy.
If Cloudflare shows you a JavaScript snippet instead, copy the `token` value from it into `analytics.cloudflareToken`.

## 6. Get the first visitors (1 hour, once)

New sites need a few links before Google trusts them. Low-effort places:

- **[AlternativeTo](https://alternativeto.net)**: add the site as an alternative to iLovePDF,
  Smallpdf, TinyPNG and QR code generators. People find it there for years.
- **[Product Hunt](https://www.producthunt.com)**: one launch day.
- **Hacker News** ("Show HN: PDF tools that never upload your files") and privacy-focused
  communities. Read each community's self-promotion rules first.

## 7. Switch on ads (when the site has some visitors, usually after 2–6 weeks)

1. Sign up at [Google AdSense](https://adsense.google.com) and add your site.
2. Copy your publisher ID (`ca-pub-…`) into `ads.adsenseClient`. The site then loads AdSense's
   code and creates `/ads.txt` automatically, which is what Google checks.
3. Wait for approval (days to a few weeks).
4. Create two ad units: *Ads → By ad unit → Display ads*. Name them "after tool" and
   "before FAQ" and copy their numbers (`data-ad-slot`) into `ads.slots.afterTool` and `ads.slots.beforeFaq`.
5. **Required for visitors from the EU, UK and Switzerland:** *Privacy & messaging → European
   regulations* → create and publish the consent message for your site.
6. Update `legalUpdated` in `src/config.ts` to today's date.

Later, with more traffic, better-paying networks become possible (Mediavine Journey,
Raptive…). See [STRATEGY.md](STRATEGY.md#income-streams).

## 8. Tips and affiliate links (30 minutes, optional)

- **Tips:** create a free [Ko-fi](https://ko-fi.com) or [Buy Me a Coffee](https://buymeacoffee.com)
  page and paste its link into `supportUrl`. A small "Did this save you time?" box then appears
  after a tool has finished.
- **Affiliates:** join the partner programme of a product that fits a tool. A password manager
  fits the password generator (Proton, 1Password, NordPass, Bitwarden… check their current terms).
  Add it to `affiliates` (there's a ready example in `src/config.ts`). The box is automatically
  labelled as an ad, and the link gets `rel="sponsored"`, as the law and Google require.

## 9. Taxes

Ad and affiliate income is taxable. Declare it in your tax return. Depending on your country and
how much you earn, you may have to register it as self-employed income. A short call with your
tax office or a tax advisor settles this.

---

## After launch: about one hour a month (optional)

- **Google Search Console → Performance:** which tools get impressions and clicks? Improve those
  pages and add related tools. You can simply ask Claude, e.g. *"Add a Swiss QR-bill
  generator following docs/ADDING-TOOLS.md"*.
- **Dependabot** opens a pull request once a month with library updates. Merge it when the CI
  check is green.
- **AdSense / ad network:** check earnings. Switch networks once you qualify for a better one.
