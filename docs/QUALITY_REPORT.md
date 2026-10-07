# Kvalitetsrapport Miljonkraft.se

Slutkörning 7 oktober 2026 mot det slutliga bygget (`npm run build`, förhandsvisning via `astro preview` på localhost). Skärmbilderna i `docs/screenshots/` och rapporterna i `docs/verification/` kommer från denna körning. Alla skärmbilder har öppnats och granskats, inte bara sparats.

## Sammanfattning

| Kontroll | Resultat |
| --- | --- |
| Bygge och typkontroll | `npm run build` och `npx astro check` utan fel |
| Horisontell överrinning vid 320, 390, 768, 1440 och 200 % zoom (720 px) | Ingen |
| axe-core (WCAG 2.0/2.1/2.2 A och AA samt best practice) vid 320, 390, 768, 1440 | 0 regelbrott |
| Tangentbord | Synlig fokusring på alla fokuserade element, inga träffytor under 24 px, mobilmenyn öppnas med Enter, Tab når första länken, Escape stänger och fokus återgår till knappen |
| Utan JavaScript | Rubrik, alla åtta modellsteg, statusrad, telefon- och mejllänkar, navigationens länkar och huvudknappen finns och fungerar |
| Reducerad rörelse | Inga element animerar |
| Länkar | Alla ankare finns, externa länkar har rel="noopener", telefonlänk tel:+46762943431 |
| Statuskoder i förhandsvisning | Startsida 200, saknad sida 404, sitemap 200 |
| Kontrast (scripts/contrast.mjs) | Alla 20 textpar och kontrollpar klarar WCAG AA, se `node scripts/contrast.mjs` |
| Lighthouse mobil (labb) | Performance 100, Accessibility 100, Best practices 100, SEO 100 |
| Lighthouse dator (labb) | Performance 100, Accessibility 100, Best practices 100, SEO 100 |

## Mätvärden per skärmbredd

| Bredd | H1-rader | H1-storlek | Brödtext | Knapp på första skärmen | Överrinning | axe-fel |
| --- | --- | --- | --- | --- | --- | --- |
| 320 | 4 | 31.68px | 16px | ja | nej | 0 |
| 390 | 4 | 34.76px | 16.175px | ja | nej | 0 |
| 768 | 3 | 51.392px | 17px | ja | nej | 0 |
| 1440 | 3 | 60px | 17px | ja | nej | 0 |

Första skärmen på 320 × 568 visar avsändare, budskap och knapp (kort etikett). På 1024 × 768 och 1366 × 768 ligger huvudknappen ovanför vikningen (se `1024-first.png` och `1366-first.png`).

## Lighthouse, labbvärden

Körning med Lighthouse 13.5.0 i headless Chromium mot `http://127.0.0.1:4321/`. Mobilprofilen använder Lighthouse standardemulering (Moto G Power, simulerad långsam 4G). Värdena är labbvärden mot en lokal server och säger inget om verkliga fältvärden på den publicerade sajten.

| Mått | Mobil | Dator |
| --- | --- | --- |
| First Contentful Paint | 0.7 s | 0.2 s |
| Largest Contentful Paint | 1.2 s | 0.3 s |
| Total Blocking Time | 0 ms | 0 ms |
| Cumulative Layout Shift | 0 | 0 |
| Speed Index | 0.7 s | 0.2 s |

Målen LCP högst 2,5 s, INP högst 200 ms och CLS högst 0,1 avser verkliga besök vid 75:e percentilen och kan bara bekräftas med fältdata efter publicering. Mätning efter att bokningen öppnats är inte relevant i läget contact_only, eftersom ingen inbäddning laddas. Den ska göras om när shared_embed aktiveras.

Rapporter: `docs/verification/lighthouse-mobile.report.html`, `docs/verification/lighthouse-desktop.report.html`, `docs/verification/report.json`.

## Vad som granskats av oberoende granskare

Tre granskningsrundor kördes med separata granskare och två motläsare per fynd.

1. **Designpanel.** Tre förslag, två domare. Resultat i `docs/HANDOVER.md` avsnitt 3.
2. **Kodgranskning i sex linser** (innehållstrohet mot masterprompten, svenska och UX-text, SEO och strukturerad data, tillgänglighet, bokningsmodulens tre lägen i isolerad arbetskopia, prestanda och rörelse). 37 fynd, varav 12 bekräftade efter motläsning och 25 avvisade eller redan åtgärdade. Samtliga bekräftade fynd är åtgärdade, inklusive sju textfynd som åtgärdades innan motläsningen hann köras.
3. **Visuell granskning i fem linser** på renderade skärmbilder (typografi, komposition, mobil 320 och 390, Taste pre-flight, särprägel). Åtgärdat: felaktig linje i Miljonmodellens rutnät, Karriärstegen som verklig trappa, treradig rubrik på dator, luft under heroknappen, Vision som lodrät stapel, vänsterställd FAQ, linjer över hela bredden, mobiltrappa med snäpp, knapp på första skärmen vid 320 × 568, etiketter på herotrappan, markering vid bokningsrubriken, plats i kontaktkortet.

Bokningsmodulen testades i alla tre lägen med exempeladresser (bygge, knapptexter, nya fönster, iframe-mall, reservlänk, ogiltig adress stoppar bygget). Riktig bokning är inte ansluten, se `docs/BOOKING_SETUP.md`.

## Skärmbilder

Första skärmen och hela sidan vid 320, 390, 768 och 1440 px, samt 1024 och 1366 (laptop), öppen mobilmeny, fokusläge, fast mobilknapp, reducerad rörelse, utan JavaScript, 200 % zoom, 404 och integritetssidan. Alla i `docs/screenshots/`.

## Återstående kontroller

- Verklig domän, omdirigeringar och statuskoder på den valda värden.
- Google Search Console och Bing Webmaster Tools (domänverifiering, sitemap).
- Microsoft Bookings-anslutning och en godkänd testbokning hela vägen till bekräftelse.
- Fältvärden för Core Web Vitals efter publicering.
- Kontroll av JSON-LD i Schema Markup Validator och Googles Rich Results Test mot den publicerade adressen.
- Granskning mot den egna skillen project-design och startpaketets instruktioner, som inte fanns tillgängliga.
