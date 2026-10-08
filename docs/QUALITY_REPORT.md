# Kvalitetsrapport Miljonkraft.se

Redesignen Den röda tråden, 7 oktober 2026. Körningar mot det byggda resultatet (`npm run build`, förhandsvisning via `astro preview` på localhost). Skärmbilderna i `docs/screenshots/` och rapporterna i `docs/verification/` kommer från de sista körningarna.

## Sammanfattning

| Kontroll | Resultat |
| --- | --- |
| Bygge och typkontroll | `npm run build` och `npx astro check` utan fel |
| Synliga ord på startsidan | 397, inom briefens 350 till 500 (räknas av `scripts/verify.mjs`) |
| Horisontell överrinning vid 320, 390, 768, 1440, 1920 och 200 % zoom | Ingen |
| axe-core (WCAG 2.0, 2.1, 2.2 A och AA samt best practice) vid 320, 390, 768, 1440, 1920 | 0 regelbrott, efter att hela sidan skrollats |
| Tangentbord | Synlig fokusring på alla fokuserade element, inga för små mål, sidhuvudets knapp syns efter skroll på mobil |
| Rörelse | Tråden ritas med skrollen i Chromium. Ritad andel stämmer med pennans läge (uppmätt avvikelse under 0,1 %). Miljonmodellens steg tänds när tråden passerar |
| Reservläge utan scroll-driven animations | Blocken ritas med en kort övergång när de når pennan, modellstegen tänds (simulerat i Chromium) |
| Reducerad rörelse | Inga element animerar, tråden står färdigritad |
| Utan JavaScript | Rubrik, alla åtta modellsteg, telefon- och mejllänkar och knappen i sidhuvudet fungerar. Tråden står färdigritad |
| Saknad sida | Svarar 404 och leder till startsidan och till mejlförslaget |
| Lighthouse mobil (labb) | Performance 100, Accessibility 100, Best practices 100, SEO 100 (tre körningar i rad) |
| Lighthouse dator (labb) | Performance 100, Accessibility 100, Best practices 100, SEO 100 |

## Lighthouse, labbvärden

Lighthouse 13.5 i headless Chromium mot `http://127.0.0.1:4321/`. Mobilprofilen använder standardemuleringen (simulerad långsam 4G, fyrdubbel processorbroms).

| Mått | Mobil | Dator | Briefens mål |
| --- | --- | --- | --- |
| Largest Contentful Paint | 1,2 s | 0,3 s | högst 2,5 s |
| Cumulative Layout Shift | 0 | 0 | högst 0,1 |
| Total Blocking Time | 0 ms | 0 ms | INP högst 200 ms (fältmått) |
| First Contentful Paint | 0,7 s | 0,2 s | |
| Överförd vikt vid första visning | 74 KB | 85 KB | |

INP kan bara mätas med verkliga besök. Sidan har inga tunga skript: tråden ritas i CSS och skriptet mäter bara banornas längd vid start och vid storleksändring. Mätningen skalar om varje bana till skärmens mått och läser längden med ett enda anrop, 6 ms med fyrdubbel processorbroms. En tidigare version samplade punkt för punkt och tog 1,4 s på en långsam telefon, vilket gav en lång uppgift i en av Lighthouse-körningarna.

## Granskning

Sex oberoende granskare gick igenom sidan: efterlevnad av briefen och design, text och fakta, tillgänglighet, rörelse och prestanda, SEO och bokning, samt mobil och responsiv layout. Varje granskares fynd prövades av en motläsare som försökte återskapa och motbevisa dem. En kreativ chef vägde till sist ihop resultatet och föreslog tre förbättringar.

- 54 fynd, varav 33 bekräftade och värda att rätta. Alla 33 är åtgärdade.
- **Blockerare som hittades och rättades.** Byggets CSS-minifierare slog ihop `animation` och `animation-timeline` till en ogiltig förkortning, så tråden stod stilla i Chrome, Edge och Safari. Reglerna är nu skrivna med longhands och `scripts/verify.mjs` stoppar om det händer igen.
- **Rörelsen rättad.** Streckningen räknades fel när banorna sträcks olika i bredd och höjd. Längden mäts nu i pixlar. Tidslinjerna räknade med html:s scroll-padding, vilket rättades med `view-timeline-inset: 0`.
- **Övrigt rättat.** Synligt × i Affärsnytta × samhällsnytta. Huvudkontorets adress i JSON-LD. Filmen dold, eftersom den hör till affischversionen och saknar syntolkning. Ord som klipptes vid förstorat textavstånd. Tomrummet efter inledningen. De liggande figurerna används även på liggande telefoner. Knappen behåller hela texten vid 320 px. Bevisens punkter ligger mitt för siffrorna. Kontaktkolumnen. Bevisens årtal i rubrikerna för skärmläsare. Sidhuvudets länk fungerar från undersidorna även med inbäddad bokning. Integritetstexten följer bokningsläget. Mötesraden utan mittpunkt.
- **Kreativa chefens förslag som byggdes.** Inledningens två punkter kommer från sidhuvudet och från vecket. Den sista punkten tänds vid inbjudan. Förslaget om en röd penna på trådens spets byggdes inte, för att hålla rörelsen återhållsam.

## Efter publiceringen

- **Bilden** fyllde hela skärmen och var för stor på en 27-tumsskärm. Den står nu i textens spalt och tar 31 % av höjden vid 2560 × 1440, 49 % vid 1440 × 900 och 25 % på en telefon.

## Medvetet lämnat

- Knapptexten Föreslå ett 30-minuters samtal står kvar ordagrant enligt briefen, se `docs/HANDOVER.md` avsnitt 9.
- Kapitel 4 och 7 har båda punkter längs tråden. Båda är verkliga följder (åtta steg och tre årtal).
- Fälten för Core Web Vitals kan bara bekräftas efter verkliga besök.

## Skärmbilder

Första skärmen vid 320, 390, 768, 1024, 1366, 1440 och 1920 px, fokusläge och skrollat läge på mobil, reducerad rörelse, utan JavaScript, 200 % zoom, 404 och integritetssidan. Alla i `docs/screenshots/`.

## Återstående kontroller

- Microsoft Bookings och en godkänd testbokning hela vägen till bekräftelse.
- En titt i Safari på iPhone och i Firefox. Safari 26 stöder scroll-driven animations. Firefox använder reservläget.
- JSON-LD i Schema Markup Validator mot den publicerade adressen.
- Google Search Console och Bing Webmaster Tools.
