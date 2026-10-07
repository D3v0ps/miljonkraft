# Överlämning Miljonkraft.se

Sammanställd 7 oktober 2026. Gäller redesignen Den röda tråden på grenen `claude/relaxed-allen-juti3f`, sammanslagen till `main`. Vercel publicerar `main` på www.miljonkraft.se.

## 1. Vad som levererats

- Startsidan är byggd om från grunden enligt redesignbriefen: en lång, ljus och lugn berättelse i nio kapitel i stället för en informationssida. Briefen kom från Yacine och skickades vidare av Karim med orden "Använd den här i samma projekt, det är en redesign prompt".
- En röd tråd bär sidan från första till sista kapitlet. Den ritas med besökarens egen skroll.
- Integritetssidan och 404-sidan har samma form som startsidan.
- Bokningsmodulen, metadata, sitemap, robots.txt, favicons och filmen är kvar. Titel, beskrivning, delningsbild och JSON-LD är nya enligt briefen.
- Cirka 400 synliga ord på startsidan, inom briefens ram på 350 till 500. Ordbudgeten kontrolleras automatiskt av `scripts/verify.mjs`.

| Del | Status |
| --- | --- |
| Kod | Klar, verifierad lokalt och sammanslagen till `main` |
| Kontakt | Klar. Telefon, mejl och mejlförslag med förifyllt ämne |
| Publicering | Vercel publicerar varje push till `main` |
| Ansluten bokning | **Återstår.** Ingen verifierad Bookings-länk finns, se avsnitt 5 |
| Granskning | Sex granskare med var sin motläsare och en kreativ chef. 33 bekräftade fynd är åtgärdade, se `docs/QUALITY_REPORT.md` |

## 2. Berättelsen

| Kapitel | Innehåll | Trådens form |
| --- | --- | --- |
| 1. Idén | När människor och möjligheter hittar varandra, växer en plats. Knapp och Läs vår idé | Två röda punkter möts och blir tråden |
| 2. Härifrån | Resan som började i Alby 2012. Bilden av västen med MB-punkten över hela skärmen. Potential finns överallt. Möjligheten gör det inte. | Går bakom bilden och kommer ut under den. Bilden zoomar långsamt in mot den röda punkten |
| 3. Kretsloppet | Invånare, Miljonkraft och lokala företag | En ögla runt de tre orden |
| 4. Miljonmodellen | Teori mot verklighet. De åtta stegen Nå, Förstå, Rikta, Bevisa, Utveckla, Övergå, Bära, Växa | Bär stegen. Varje ord tänds när tråden passerar |
| 5. Karriärstegen | Första jobbet är början. Lager, truck och lagersystem, koordinator, transportplanering, märkt som exempel | En trappa uppåt (dator) eller framåt (mobil) |
| 6. Nyttan | Affärsnytta × samhällsnytta | Tråden delar sig och korsas vid krysset, ett ord i varje ögla |
| 7. Bevisen | 2012, 2023 och 12 | En punkt per bevis |
| 8. Riktningen | Botkyrka ska ha Sveriges lägsta arbetslöshet | Blir horisonten och löper ut ur sidan |
| 9. Inbjudan | Berätta vad ni behöver. Vi börjar där. Yacine, knappen, telefon och mejl | En ny röd punkt som tänds |

Sidfoten bär projektstatus och länkar till Miljonbemanning och integritet.

## 3. Beslut

1. **Redesignbriefen gäller före tidigare beslut där de krockar.** Det gäller ESF-villkoret och filmen, se punkt 2 och 6.
2. **ESF-villkoret är tillbaka, tyst i sidfoten.** Karim tog tidigare bort meningen om ESF. Redesignbriefen kräver uttryckligen att projektstatus står nära sidfoten med villkoret att genomförandet förutsätter att stöd beviljas. Texten lyder: Miljonbemanning och Botkyrka kommun har tecknat ett samarbetsavtal om Miljonkraft Botkyrka. Projektets genomförande förutsätter att Svenska ESF-rådet beviljar stöd. Den ändras eller tas bort på ett ställe, `copy.status` i `src/config/site.ts`.
3. **Ingen knapp heter Boka.** Ingen riktig bokning är ansluten, så knappen heter Föreslå ett 30-minuters samtal och öppnar ett förifyllt mejl till Yacine. När Bookings ansluts byter alla knappar automatiskt till Boka 30 min med Yacine.
4. **En bild.** Bara västen med MB-punkten ur Miljonbemannings bildbank används. Lager- och transportbilderna i bildbanken liknar stockfoto och strider mot briefens krav på autentiska bilder.
5. **Borttaget från startsidan:** affischheron, WebGL-himlen, Samhällskraft-sektionen, tickern, kort, urtavlan, citaten, utmärkelselistan, FAQ, mobilmenyn och den fasta mobilknappen.
6. **Filmen visas inte längre.** Den gjordes för affischversionen med versaler, kort, numrerade steg och lagerbilder, och granskningen visade att den drar berättelsen åt det håll briefen vill bort från. Den saknar också syntolkning (WCAG 1.2.5). Filerna ligger kvar i `public/film` och dialogen finns i koden. Sätt `copy.film.showOnHome` till `true` i `src/config/site.ts` för att visa länken Se filmen i sidfoten igen. Bättre är att rendera om filmen i Den röda trådens uttryck med `scripts/film`.
7. **Kvar från tidigare beslut:** sidan ska inte läsas som ett bemanningsföretag, www.miljonkraft.se är primär domän, allt pushas och slås samman till `main`.

## 4. Rörelse

- Tråden ritas med CSS scroll-driven animations (`animation-timeline` med en `view-timeline` per block). Pennan ligger på 65 % av fönstrets höjd. Inget bibliotek, ingen skrollkapning och ingen mjukskrollning utöver webbläsarens egen för ankarlänkar.
- Varje banas längd på skärmen mäts av `src/scripts/main.ts` och sätts som `--len` i pixlar. Det behövs eftersom banorna sträcks olika i bredd och höjd.
- De skrollstyrda reglerna måste skrivas med longhands (`animation-name`, `animation-timeline` och så vidare). Byggets CSS-minifierare slår annars ihop dem till en ogiltig förkortning och då står tråden stilla. `scripts/verify.mjs` kontrollerar att tråden ritas med skrollen.
- Bara `stroke-dashoffset`, `transform`, `opacity`, `clip-path` och färg animeras.
- Webbläsare utan stöd för scroll-driven animations ritar varje block med en kort övergång när det når pennan (IntersectionObserver i `src/scripts/main.ts`).
- Med reducerad rörelse, i utskrift och om skriptet inte laddas står tråden färdigritad och allt innehåll syns.
- Inledningen spelas en gång: rubriken tonar fram, två punkter möts vid rubrikens första rad och tråden börjar.

## 5. Bokning

Läget är `contact_only`. Ingen publicerad Bookings-sida för Yacine har hittats och sessionens Microsoft 365-koppling saknar behörighet för Bookings. Följ `docs/BOOKING_SETUP.md` och byt `mode` när en verifierad länk finns. Inbäddningen i `shared_embed` laddas först när besökaren trycker på Visa lediga tider.

## 6. SEO och strukturerad data

- Titel: Miljonkraft Botkyrka | När människor och möjligheter möts.
- Beskrivning: Miljonkraft Botkyrka kopplar lokala företag med människor som vill arbeta och utvecklas. Ett initiativ från Miljonbemanning med rötterna i Alby.
- En H1, kapitel som `section` med egna rubriker, canonical på www, Open Graph med ny delningsbild.
- JSON-LD: Organization (Miljonbemanning, med beskrivning ur företagets mejlsignatur, adress, grundår och ContactPoint), WebSite, WebPage och Person (Yacine). Ingen FAQ-markering eftersom sidan saknar synliga frågor och svar.
- `public/llms.txt` sammanfattar sidan för AI-sök med samma sanna uppgifter.

## 7. Bilder och rättigheter

| Fil | Källa |
| --- | --- |
| `assets-src/bildbank/MB_bildbank_33-mb-vast.jpg` | Miljonbemannings bildbank i SharePoint (Marknad & Kommunikation, Bilder, BILDBANK) |
| `assets-src/logo/Logo_DARK-TERTIARY_MB-Miljonbemanning_2024.png` | Miljonbemannings grafiska profil, tertiär logotyp, oförändrad |
| Tråden, öglorna, trappan och horisonten | Egna SVG-linjer i koden |
| Montserrat | SIL Open Font License |

Kör `node scripts/build-images.mjs` efter byte av originalbild.

## 8. Var saker ändras

Se `README.md`. All text står i `src/config/site.ts`. Trådens form i varje kapitel står i `src/lib/thread.ts`. Designvärden och rörelse i `src/styles/global.css`.

## 9. Uppgifter som en människa bör bekräfta

1. **Bevis 12.** Miljonbemanning rangordnades först i alla tolv områden enligt Botkyrka kommuns tilldelningsbeslut 2026-08-27 (Dnr AVN/2026:00030). Sidan skriver "Enligt Botkyrka kommuns tilldelningsbeslut den 27 augusti 2026". Bekräfta att ramavtalet är undertecknat efter avtalsspärren innan formuleringen skärps.
2. **ESF-texten.** Bekräfta att villkoret ska synas, se beslut 2.
3. **Bildens användning.** Västbilden kommer ur Miljonbemannings egen bildbank. Bekräfta att personen på bilden godkänt användning på en publik webbplats.
4. **Knapptexten.** Briefen skriver Föreslå ett 30-minuters samtal, vilket sidan använder. Språkgranskningen påpekade att formen blandar två skrivsätt (30-minuterssamtal eller 30 minuters samtal). Ändras i `src/lib/booking.ts` om uppdragsgivaren vill.
5. **AI-sökrobotar.** `public/robots.txt` tillåter både OAI-SearchBot (ChatGPT-sök) och GPTBot (modellträning). Bekräfta eller blockera GPTBot separat.
6. **Integritetstexten** på `/integritet/` bör bekräftas av Miljonbemanning.

Adressen i JSON-LD är huvudkontoret, Albyvägen 3, 145 57 Norsborg, enligt miljonbemanning.se (kontrollerat 7 oktober 2026). MB.Restart i Alby ligger på Albyvägen 2.

## 10. Återstår

1. Microsoft Bookings enligt `docs/BOOKING_SETUP.md`.
2. `PUBLIC_NOINDEX=1` för miljön Preview i Vercel.
3. Search Console och Bing Webmaster Tools, skicka in sitemap.
4. Ett riktigt porträtt av Yacine skulle stärka inbjudan. Inget porträtt har skapats, eftersom ett påhittat ansikte inte får användas.
5. Fältvärden för Core Web Vitals efter några veckors verkliga besök.
