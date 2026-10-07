# Kvalitetsrapport Miljonkraft.se

Affischversionen, 7 oktober 2026. Körningar mot det byggda resultatet (`npm run build`, förhandsvisning via `astro preview` på localhost) och mot den publicerade adressen www.miljonkraft.se. Skärmbilderna i `docs/screenshots/` och rapporterna i `docs/verification/` kommer från dessa körningar och har öppnats och granskats.

## Sammanfattning

| Kontroll | Resultat |
| --- | --- |
| Bygge och typkontroll | `npm run build` och `npx astro check` utan fel |
| Horisontell överrinning vid 320, 390, 768, 1440, 1920 och 200 % zoom | Ingen |
| axe-core (WCAG 2.0, 2.1, 2.2 A och AA samt best practice) vid 320, 390, 768, 1440, 1920 | 0 regelbrott, efter att hela sidan skrollats så att allt avtäckts |
| Tangentbord | Synlig fokusring på alla fokuserade element. Mobilmenyn öppnas med Enter, Escape stänger och fokus återgår |
| Utan JavaScript | Rubrik, alla åtta modellsteg, samarbetsavtalet, telefon- och mejllänkar, menyn och huvudknappen finns och fungerar. Menyn ligger i flödet |
| Reducerad rörelse | Inga element animerar. Himlen ritas inte i WebGL, affischen står still |
| Kontrast (`node scripts/contrast.mjs`) | Alla textpar klarar WCAG AA, även texten mot himlens mörkaste blå och mot solskenet |
| Lighthouse mobil (labb) | Performance 100, Accessibility 100, Best practices 100, SEO 100 |
| Lighthouse dator (labb) | Performance 99, Accessibility 100, Best practices 100, SEO 100 |
| Publicerad sajt | www.miljonkraft.se svarar 200, miljonkraft.se omdirigeras dit med 308, saknad sida ger 404, `/integritet` leder till `/integritet/`, produktionen har `index, follow` |

## Lighthouse, labbvärden

Lighthouse 13.5 i headless Chromium mot `http://127.0.0.1:4321/`. Mobilprofilen använder standardemuleringen (simulerad långsam 4G, fyrdubbel processorbroms).

| Mått | Mobil | Dator |
| --- | --- | --- |
| First Contentful Paint | 1.0 s | 0.3 s |
| Largest Contentful Paint | 1.5 s | 0.4 s |
| Total Blocking Time | 0 ms | 100 ms |
| Cumulative Layout Shift | 0 | 0 |
| Speed Index | 1.4 s | 0.7 s |

WebGL-himlen ritas bara på datorer med grafikkort. I mjukvarurendering, som i Lighthouse, står CSS-himlen kvar. Det är samma färger, så sidan ser likadan ut utan solstrålar och moln. Fältvärden för Core Web Vitals kan bara bekräftas efter en tids verkliga besök.

## Fel som hittades och rättades under granskningen

- Affischraderna rann över med några procent. Orsaken var ärvd spärrning: em räknades mot rubrikens grundstorlek. Spärrningen sätts nu på varje rad.
- Bildpaneler avtäcktes aldrig, eftersom panelens egen klippning dolde den för skrollobservatören. Klippningen ligger nu på bilden.
- Linjeteckningar ritades inte fram i Chrome. Attributväljaren `[pathLength]` gav ingen omstilning när steget avtäcktes. Elementväljare används i stället.
- Konturtext visade inre linjer, eftersom variabla typsnitt har överlappande konturer. Fyllning i bakgrundsfärg över en dubbelt så bred kontur döljer dem.
- Den fasta mobilknappen visades inte efter hopp via menylänkar. Läget räknas nu vid skroll.
- Utan JavaScript låg mobilmenyn över affischen. Den ligger nu i flödet.
- Etiketter i blått mot himlens överkant klarade inte kontrastkravet. De är nu antracit.
- Canonical pekade på miljonkraft.se, som Vercel omdirigerar till www. Canonical, sitemap och robots.txt pekar nu på www.miljonkraft.se.

## Skärmbilder

Första skärmen vid 320, 390, 768, 1024, 1366, 1440 och 1920 px, öppen mobilmeny, fokusläge, fast mobilknapp, reducerad rörelse, utan JavaScript, 200 % zoom, 404 och integritetssidan. Alla i `docs/screenshots/`.

## Återstående kontroller

- Microsoft Bookings och en godkänd testbokning hela vägen till bekräftelse.
- Google Search Console och Bing Webmaster Tools.
- JSON-LD i Schema Markup Validator mot den publicerade adressen.
- Fältvärden för Core Web Vitals efter publicering.
