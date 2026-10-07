# Kvalitetsrapport Miljonkraft.se

Affischversionen med film, 7 oktober 2026. Körningar mot det byggda resultatet (`npm run build`, förhandsvisning via `astro preview` på localhost) och mot den publicerade adressen www.miljonkraft.se. Skärmbilderna i `docs/screenshots/` och rapporterna i `docs/verification/` kommer från dessa körningar och har öppnats och granskats.

## Sammanfattning

| Kontroll | Resultat |
| --- | --- |
| Bygge och typkontroll | `npm run build` och `npx astro check` utan fel |
| Horisontell överrinning vid 320, 390, 768, 1440, 1920 och 200 % zoom | Ingen |
| axe-core (WCAG 2.0, 2.1, 2.2 A och AA samt best practice) vid 320, 390, 768, 1440, 1920 | 0 regelbrott, efter att hela sidan skrollats så att allt avtäckts |
| Tangentbord | Synlig fokusring på alla fokuserade element, även filmens spelkort. Mobilmenyn öppnas med Enter, Escape stänger och fokus återgår |
| Utan JavaScript | Rubrik, alla åtta modellsteg, samarbetsavtalet, telefon- och mejllänkar, menyn, huvudknappen och filmen med vanliga kontroller fungerar |
| Om huvudskriptet inte laddas | Allt innehåll blir synligt när sidan har laddats |
| Reducerad rörelse | Inga element animerar |
| Utskrift | Allt avtäckt, svar och filmtext öppna |
| Kontrast (`node scripts/contrast.mjs`) | Alla 18 par klarar WCAG AA, även text mot himlens blå och mot solskenet |
| Lighthouse mobil (labb) | Performance 100, Accessibility 100, Best practices 100, SEO 100 |
| Lighthouse dator (labb) | Performance 100, Accessibility 100, Best practices 100, SEO 100 |
| Publicerad sajt | www.miljonkraft.se svarar 200, miljonkraft.se omdirigeras dit med 308, saknad sida ger 404, filmerna serveras med stöd för spolning |

## Lighthouse, labbvärden

Lighthouse 13.5 i headless Chromium mot `http://127.0.0.1:4321/`. Mobilprofilen använder standardemuleringen (simulerad långsam 4G, fyrdubbel processorbroms).

| Mått | Mobil | Dator |
| --- | --- | --- |
| First Contentful Paint | 1.0 s | 0.3 s |
| Largest Contentful Paint | 1.8 s | 0.4 s |
| Total Blocking Time | 0 ms | 0 ms |
| Cumulative Layout Shift | 0 | 0 |
| Speed Index | 1.4 s | 0.5 s |
| Överförd vikt vid första visning | 155 KB | 116 KB |

Filmen laddas först när besökaren trycker på spela. WebGL-himlen ritas bara på datorer med grafikkort. Fältvärden för Core Web Vitals kan bara bekräftas efter en tids verkliga besök.

## Granskning i tre rundor

1. **Granskning med 106 agenter.** Sex oberoende granskare (text och fakta, dator, mobil, tillgänglighet, grafisk profil, teknik och SEO) och en kreativ chef. Varje allvarligt fynd prövades av två motläsare, en som återskapade felet och en som bedömde om det var värt att rätta. Resultat: 76 fynd, 61 efter sammanslagning, 54 bekräftade (6 blockerande, 24 bör rättas, 24 småfel) och 7 avvisade. Två domare poängsatte åtta idéer för mer wow och bevis.
2. **Åtgärder.** Alla blockerande fynd rättade, bland annat filmens spelknapp som inte gick att pausa förbi, rubriker som rann över sin kolumn, klippta etiketter och illustrationer över text. Idéerna med högst poäng byggdes: bevisen samlade i ett kapitel, knappen och avtalet direkt under affischen på mobil, stadssiluetten i heron, solen som stiger i Vision och samma röda punkt på alla affischrader.
3. **Kontroll med 43 agenter.** Varje av de 54 fynden kontrollerades på nytt bygge: 38 rättade, 14 delvis, 2 lämnade enligt Karims beslut. Ett svep efter nya fel gav 22 bekräftade fynd, bland dem ett blockerande (fokusringen runt filmen klipptes). Alla 22 och de öppna delarna av de 14 är åtgärdade, utom de som anges nedan.

## Medvetet lämnat som det är

- Text som kommer från masterprompten står kvar: Miljonmodellens stycken och stegtexter, etiketterna Yrkesroll och Lagerarbete i Karriärstegen, företagsstycket och visionsmeningen.
- Bokningsrubriken i contact_only speglar masterpromptens knapptext.
- På mobil hämtas både den liggande och den stående filmaffischen (41 KB extra), så att besökare utan JavaScript ändå ser en affisch.

## Skärmbilder

Första skärmen vid 320, 390, 768, 1024, 1366, 1440 och 1920 px, öppen mobilmeny, fokusläge, fast mobilknapp, reducerad rörelse, utan JavaScript, 200 % zoom, 404 och integritetssidan. Alla i `docs/screenshots/`.

## Återstående kontroller

- Microsoft Bookings och en godkänd testbokning hela vägen till bekräftelse.
- Google Search Console och Bing Webmaster Tools.
- JSON-LD i Schema Markup Validator mot den publicerade adressen.
- Fältvärden för Core Web Vitals efter publicering.
- En titt på filmen i Safari på iPhone, där den stående H.264-filen används.
