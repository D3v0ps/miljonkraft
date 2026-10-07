# Miljonkraft.se

Informations- och kontaktsida för Miljonkraft Botkyrka, ett initiativ från Miljonbemanning. Statisk webbplats byggd med Astro, vanlig CSS och ett självhostat typsnitt. Ingen databas, ingen inloggning, inget CMS.

## Kom igång

Kräver Node 20 eller senare.

```bash
npm install
npm run dev        # utvecklingsserver på http://localhost:4321
npm run build      # statisk export till dist/
npm run preview    # förhandsvisa dist/ lokalt
npm run check      # typkontroll av Astro-filer
```

Förhandsvisning som inte ska indexeras byggs med `PUBLIC_NOINDEX=1 npm run build`. Då får alla sidor `noindex` i HTML, medan canonical, sitemap och robots fortsätter peka på produktionsadressen.

## Var saker ändras

| Vad | Fil |
| --- | --- |
| All synlig text, kontaktuppgifter, produktionsadress, ändringsdatum | `src/config/site.ts` |
| Bokningsläge och bokningslänkar | `src/config/site.ts` (objektet `booking`), se `docs/BOOKING_SETUP.md` |
| Knapptexter per bokningsläge | `src/lib/booking.ts` |
| Metadata, Open Graph, favicons, JSON-LD | `src/layouts/BaseLayout.astro`, `src/lib/jsonld.ts` |
| Designvärden (färger, typografi, avstånd, rörelse) | `src/styles/global.css` (blocket `:root`) |
| Sektioner | `src/components/*.astro`, ordning i `src/pages/index.astro` |
| robots.txt, webbmanifest, typsnitt, delningsbild | `public/` |

## Skript

```bash
node scripts/generate-og.mjs      # skapar public/og.png från scripts/og-template.html
node scripts/generate-icons.mjs   # skapar favicon-set från public/favicon.svg
node scripts/contrast.mjs         # WCAG-kontrast för färgparen i scripts/contrast-pairs.json
node scripts/verify.mjs URL       # skärmbilder, överrinning, axe, tangentbord, utan JS, reducerad rörelse
```

Lighthouse körs mot en lokal förhandsvisning:

```bash
npm run build && npm run preview &
npx lighthouse http://127.0.0.1:4321/ --output=html --output-path=docs/verification/lighthouse-mobile
```

## Publicering

`npm run build` ger en helt statisk `dist/` som kan läggas på valfri statisk värd (Cloudflare Pages, Netlify, Vercel, GitHub Pages eller en vanlig webbserver). Kontrollera hos värden att

- `dist/404.html` serveras med statuskod 404 för saknade sidor,
- `www.miljonkraft.se` omdirigeras permanent (301) till `https://miljonkraft.se`, eller tvärtom, så att bara en variant används,
- `http` omdirigeras till `https`.

Produktionsadressen är `https://miljonkraft.se` och sätts i `src/config/site.ts`.

### Vercel

Projektet är förberett för Vercel med `vercel.json` (Astro-preset, avslutande snedstreck, permanent omdirigering från www till apex, två säkerhetshuvuden). Astros `dist/404.html` serveras av Vercel med statuskod 404.

Via Vercels webbgränssnitt: importera GitHub-repot, behåll förvalet (byggkommando `npm run build`, utdata `dist`), lägg till domänerna `miljonkraft.se` och `www.miljonkraft.se` under Domains. Sätt miljövariabeln `PUBLIC_NOINDEX=1` för miljön Preview så att förhandsvisningar får `noindex` i HTML (Vercel lägger dessutom `X-Robots-Tag: noindex` på förhandsvisningar).

Via kommandoraden:

```bash
npm i -g vercel
vercel login
vercel link        # koppla mappen till Vercel-projektet
vercel             # förhandsvisning på en unik adress
vercel --prod      # produktion
```

Med Vercels Claude Code-plugin (`npx plugins add vercel/vercel-plugin`) finns kommandona `/deploy`, `/deploy prod`, `/env` och `/status` som gör samma sak med förkontroller.

## Dokumentation

- `docs/HANDOVER.md` överlämning, designbeslut, vad som fungerar och vad som återstår
- `docs/BOOKING_SETUP.md` steg för riktig bokning med Microsoft Bookings
- `docs/QUALITY_REPORT.md` kvalitetsrapport med mätvärden och skärmbilder
