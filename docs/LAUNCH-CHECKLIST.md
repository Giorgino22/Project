# Launch checklist

Everything here needs **you**: accounts in your name, your bank details, your address. The code
is ready. Plan **about 3 hours once**. After that the sites run by themselves.

**Costs:** one domain (≈ €10–15 per year). Everything else on this list is free.

You enter almost every value in **one file**:
[`packages/shared/src/network.ts`](../packages/shared/src/network.ts). Change it on GitHub
(pencil icon → "Commit changes"). Cloudflare then rebuilds and publishes the sites automatically.

| Site | Folder | Address | Cloudflare Worker |
| --- | --- | --- | --- |
| Hub | `apps/hub` | `your-domain.com` | `hub` |
| KeepLocal | `apps/keeplocal` | `keeplocal.your-domain.com` | `keeplocal` |
| Spin the Wheel | `apps/wheel` | `wheel.your-domain.com` | `wheel` |
| Typing Test | `apps/typing` | `typing.your-domain.com` | `typing` |

---

## 0. Make `main` your branch (1 minute)

The code was pushed to the branch `claude/epic-maxwell-ons3xd`.

- **Easiest:** GitHub → your repository → **Settings → General → Default branch** → pencil icon
  → rename it to `main`.
- **Or:** open a pull request into `main` and merge it.

## 1. Choose a name and buy the domain (15 minutes)

- Pick a short, made-up brand name. One-word `.com` domains like `practical.com` are almost
  always taken or cost thousands. Check that the name isn't someone else's brand (search it and
  check a trademark register such as [TMview](https://www.tmdn.org/tmview/)).
- Cheapest place to buy: **Cloudflare Registrar**, which sells at cost. Create a free account
  at [cloudflare.com](https://dash.cloudflare.com/sign-up) → *Domain Registration → Register Domains*.
- Then, in `network.ts`:
  - `name` → your brand name (shown on the hub and in every footer)
  - `domain` → your domain **without** `https://`, e.g. `'quicktools.app'`
- Re-create the hub's social-media preview image with your name: change "Practical Tools" in
  the `images` script of `apps/hub/package.json`, then run `npm run images -w apps/hub`
  (or ask Claude to do it).

## 2. Fill in your details for the legal pages (10 minutes)

Many countries (including Germany, Austria and Switzerland) require websites with ads to show
who runs them. In `network.ts` → `owner`, enter your **name, postal address and e-mail**.

- The hub's privacy policy and legal notice (`/privacy/`, `/imprint/`) cover the hub, the wheel
  and the typing site. Their footers link there.
- KeepLocal has its own legal pages in English and German. They use the same `owner` details.

> ⚠️ The privacy policies are a careful starting point, not legal advice. They update themselves
> when you switch ads, statistics or tips on or off. Have them checked, or compare them with a
> privacy-policy generator for your country, especially once ads are running.

## 3. Publish the sites on Cloudflare (30 minutes)

Each site is its own Cloudflare **Worker**, built from the same repository. Do this **four
times**, once per row of the table above:

1. Cloudflare dashboard → **Workers & Pages → Create application → Import a repository**
   (connect your GitHub account the first time) → choose this repository.
2. Settings (example for the wheel; replace `wheel` with `hub`, `keeplocal` or `typing`):
   - **Project name:** `wheel` (the `"name"` in `apps/wheel/wrangler.jsonc`)
   - **Build command:** `npm run build -w apps/wheel`
   - **Deploy command:** `npx wrangler deploy --config apps/wheel/wrangler.jsonc`
   - **Root directory:** leave empty (the repository root)
   - **Production branch:** `main`
3. Click **Deploy**. After a few minutes the site is live at a `….workers.dev` address.
4. Connect the address: open the Worker → **Settings → Domains & Routes → Add → Custom domain**:
   - hub → `your-domain.com`
   - keeplocal → `keeplocal.your-domain.com`, wheel → `wheel.your-domain.com`,
     typing → `typing.your-domain.com`

   Cloudflare creates the DNS records for you.
5. Optional, for `www`: **Rules → Redirect Rules → Create rule → template "Redirect from WWW to
   root"**, so that `www.your-domain.com` leads to the hub.

From now on, every change you push to `main` goes live automatically within a few minutes.

> **Optional:** Each Worker rebuilds after every push, even if only another site changed.
> To save build minutes, open the Worker → *Settings → Build → Build watch paths* and enter
> e.g. `apps/wheel/*` and `packages/shared/*`.

## 4. Tell search engines about the sites (15 minutes)

1. [Google Search Console](https://search.google.com/search-console) → *Add property* →
   **Domain** → enter your domain → verify. Google can add the DNS record at Cloudflare for you.
   One domain property covers all subdomains.
2. *Sitemaps* → submit all four:
   `https://your-domain.com/sitemap.xml`, `https://keeplocal.your-domain.com/sitemap.xml`,
   `https://wheel.your-domain.com/sitemap.xml`, `https://typing.your-domain.com/sitemap.xml`
3. [Bing Webmaster Tools](https://www.bing.com/webmasters) → *Import from Google Search Console*
   (one click). Bing also feeds several AI search engines.

## 5. Turn on visitor statistics (5 minutes)

Cloudflare dashboard → **Analytics & Logs → Web Analytics → Add a site** → choose your domain
and the **automatic setup**. It uses no cookies, so you need no cookie banner for it.
Then set `analytics: true` in `network.ts`, which adds a paragraph to the privacy policies.

## 6. Get the first visitors (1 hour, once)

New sites need a few links before Google trusts them. Low-effort places:

- **[AlternativeTo](https://alternativeto.net)**: list each site as an alternative to the big
  names: KeepLocal next to iLovePDF, Smallpdf, TinyPNG and imagetotext.info; the wheel next to
  Wheel of Names and Picker Wheel; the typing test next to Monkeytype and 10FastFingers. People
  find them there for years.
- **[Product Hunt](https://www.producthunt.com)**: one launch day per site.
- **Hacker News** ("Show HN: PDF tools that never upload your files"), privacy communities, and
  teacher communities for the wheel and the kids typing test. Read each community's
  self-promotion rules first.

## 7. Switch on ads (when the sites have some visitors, usually after 2–6 weeks)

1. Sign up at [Google AdSense](https://adsense.google.com) and add **your main domain**
   (`your-domain.com`). Subdomains are covered by it.
2. Copy your publisher ID (`ca-pub-…`) into `adsenseClient` in `network.ts`. All sites then load
   AdSense's code, and the hub serves `your-domain.com/ads.txt`, the file Google checks. It also
   covers the subdomains.
3. Wait for approval (days to a few weeks).
4. Create ad units: *Ads → By ad unit → Display ads*, two per site ("after tool" and "before
   FAQ"). Copy their numbers (`data-ad-slot`) into:
   - KeepLocal: `apps/keeplocal/src/config.ts` → `ads.slots`
   - Wheel: `apps/wheel/src/site.ts` → `adSlots`
   - Typing: `apps/typing/src/site.ts` → `adSlots`
5. **Required for visitors from the EU, UK and Switzerland:** *Privacy & messaging → European
   regulations* → create and publish the consent message for your domain.
6. Update `legalUpdated` in `network.ts` to today's date.

The kids typing test never loads ad code. Ads on pages made for children need special rules, so
the page simply has none.

Later, with more traffic, better-paying networks become possible (Mediavine Journey,
Raptive…). See [STRATEGY.md](STRATEGY.md#income-streams).

## 8. Tips and affiliate links (30 minutes, optional)

- **Tips:** create a free [Ko-fi](https://ko-fi.com) or [Buy Me a Coffee](https://buymeacoffee.com)
  page and paste its link into `supportUrl` in `network.ts`. A small "Did this save you time?"
  box then appears after a tool has finished, on all sites.
- **Affiliates (KeepLocal):** join the partner programme of a product that fits a tool. A password
  manager fits the password generator (Proton, 1Password, NordPass, Bitwarden… check their current
  terms). Add it to `affiliates` in `apps/keeplocal/src/config.ts` (there's a ready example). The
  box is automatically labelled as an ad, and the link gets `rel="sponsored"`, as the law and
  Google require.

## 9. Taxes

Ad and affiliate income is taxable. Declare it in your tax return. Depending on your country and
how much you earn, you may have to register it as self-employed income. A short call with your
tax office or a tax advisor settles this.

---

## After launch: about one hour a month (optional)

- **Google Search Console → Performance:** which pages get impressions and clicks? Improve those
  pages and add related tools or sites. You can simply ask Claude, e.g. *"Add a Swiss QR-bill
  generator to KeepLocal"* or *"Add a new site for a unit converter"*.
- **Dependabot** opens a pull request once a month with library updates. Merge it when the CI
  check is green.
- **AdSense / ad network:** check earnings. Switch networks once you qualify for a better one.
