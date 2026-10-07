# Överlämning Miljonkraft.se

Sammanställd 7 oktober 2026. Gäller affischversionen på grenen `claude/relaxed-allen-juti3f`, som också är sammanslagen till `main`. Vercel är kopplat till repot och publicerar `main` på www.miljonkraft.se.

## 1. Vad som levererats

- En statisk webbplats (Astro) gjord som en ljus affisch i Miljonbemannings grafiska profil 3.0. Startsida, integritetssida och 404-sida.
- Sektioner i ordning: affischen (hero), Samhällskraft, Kommunen om arbetet i Alby (bevisen samlade), För företag, Filmen, Miljonmodellen, Karriärstegen, Där allt började, Vision, Föreslå ett samtal, Vanliga frågor, sidfot.
- Filmen Miljonkraft på en minut med egen musik, liggande för sidan och stående för telefon och sociala medier.
- Bokningsmodul med tre lägen. **contact_only** är aktivt: alla huvudknappar öppnar ett förifyllt mejl till Yacine. **external_link** och **shared_embed** aktiveras i `src/config/site.ts` när en riktig Bookings-länk finns, se `docs/BOOKING_SETUP.md`.
- Metadata, canonical, Open Graph med ny delningsbild, favicon-set ur MB-logotypen, webbmanifest, robots.txt, sitemap och JSON-LD.
- Verifieringsskript, kontrastkontroll, Lighthouse-rapporter och skärmbilder i `docs/`.

| Del | Status |
| --- | --- |
| Färdig kod | Klar och verifierad lokalt, sammanslagen till `main` |
| Fungerande kontakt | Klar. Telefon, mejl och mejlförslag med förifyllt ämne |
| Publicering | Vercel är kopplat av Karim. Varje push till `main` publiceras |
| Ansluten bokning | **Återstår.** Ingen verifierad Bookings-länk finns |
| Filmen | Klar och publicerad, se avsnitt 4 |
| Granskning | Tre rundor med totalt 149 agenter, se `docs/QUALITY_REPORT.md` |

## 2. Beslut från Karim under arbetet

1. **Ljus, positiv affisch med wow-känsla** i stället för den första mörka versionen.
2. **Grafisk profil ur valvet.** Färger, typsnitt, versaler i rubriker, högerställda informationsblock, röd punkt och rött understreck, logotypen i originalfil. Underlaget lästes ur Karims valv (Miljonbemannings grafiska profil 3.0).
3. **Sidan ska inte läsas som ett bemanningsföretag.** Ny sektion Samhällskraft med Karims formulering: en samhällskraft som för samman lokala företag och människor, öppnar dörrar till arbete, ger företag kraft att växa och bygger ett samhälle där fler får möjlighet att bidra. Formuleringar om auktoriserat bemannings- och rekryteringsföretag och knappen till miljonbemanning.se är borttagna. Varumärket Miljonbemanning står kvar som avsändare.
4. **ESF-villkoret är borttaget.** Meningen om att projektet startar om Svenska ESF-rådet beviljar stöd finns inte längre på sidan eller i filmen. Samarbetsavtalet med Botkyrka kommun står kvar, och visionsavsnittet beskriver fortfarande Miljonkraft Botkyrka som ett planerat projekt.
5. **Bilder.** Egna bilder och illustrationer var tillåtna, liksom stockbilder. Sidan använder Miljonbemannings egen bildbank och egna linjeillustrationer. Stockbilder behövdes inte.
6. **Pusha och slå samman till `main` alltid.**
7. **www.miljonkraft.se är primär domän.** miljonkraft.se omdirigeras dit i Vercel. Canonical, sitemap, robots.txt och delningslänkar använder www.

## 3. Designen i korthet

- **Affischen.** Tre meningar som var och en fyller sin bredd exakt, uppmätta i Montserrat med `scripts/measure-type.mjs`. Viktkontrast mellan 800 och 200. Röda punkter i vikt 800 efter meningarna. MB-punkten blir en röd sol som stiger bakom raden Ett starkare Botkyrka. Till vänster ritas en linjeteckning av en förort med lamellhus, punkthus och träd fram under inledningen.
- **Bevisen i ett kapitel.** Direkt efter Samhällskraft: kommunstyrelsens ordförandes citat med sammanhang och källa, fakta (2012, 5 utmärkelser, 2023), juryns motivering, utmärkelserna och samarbetsavtalet. Allt ur verifierade källor.
- **Himlen.** CSS-gradient i profilens blå toner med ett varmt sken. Ovanpå ritas en WebGL-himmel med mjuka moln och solstrålar (`src/scripts/sky.ts`). Den rör sig bara under inledningen, vid skroll och vid muspekare, aldrig i en evig loop. Den hoppar över sig själv på datorer utan grafikkort och vid reducerad rörelse.
- **Rörelse.** Raderna stiger upp ur sina linjer, solen går upp, ordet SAMHÄLLSKRAFT fylls när man skrollar, Miljonmodellens steg tänds ett i taget, illustrationerna ritas fram, urtavlan i bokningsdelen fylls till en halv timme. Allt finns som stillbild utan JavaScript och med reducerad rörelse.
- **Konturtext.** Variabla typsnitt har överlappande konturer. Konturord ritas därför med fyllning i bakgrundsfärg över en dubbelt så bred kontur (`paint-order`), så att inga inre linjer syns.

## 4. Filmen

56 sekunder i nio scener, 1920 × 1080 för sidan och 1080 × 1920 för telefon och sociala medier (`public/film/miljonkraft-film-vertikal.mp4`). Musiken är egen, skapad i kod, -16 LUFS. Skripten i `scripts/film/` renderar om filmen exakt likadant, se `scripts/film/README.md`. På sidan startar filmen bara när besökaren trycker på spela eller på Se filmen i heron, och ljudet följer med eftersom det är ett aktivt val. Stående telefoner får den stående filmen. Under spelaren finns filmens text scen för scen med bildbeskrivningar, och ett kapitelspår. Musiken finns separat som `public/film/miljonkraft-musik.mp3`.

## 5. Bilder och rättigheter

| Fil | Källa |
| --- | --- |
| `assets-src/bildbank/MB_bildbank_6-kontor.jpg`, `_9-lager`, `_10-transport`, `_33-mb-vast` | Miljonbemannings bildbank i SharePoint (Marknad & Kommunikation, Bilder, BILDBANK) |
| `assets-src/logo/Logo_DARK-TERTIARY_MB-Miljonbemanning_2024.png` | Miljonbemannings grafiska profil, tertiär logotyp. Används oförändrad |
| Illustrationer i Karriärstegen och Samhällskraft | Egna linjeteckningar i SVG, i koden |
| Montserrat | SIL Open Font License |

Bilderna visar miljöer. Ingen bildtext antyder att personerna är deltagare. Kör `node scripts/build-images.mjs` efter byte av originalbild.

## 6. Var saker ändras

Se `README.md`. All text, kontaktuppgifter, bokningsläge och bilder anges i `src/config/site.ts`. Designvärden i `src/styles/global.css`. Ändras en affischrad, kör `node scripts/measure-type.mjs` så att raden fyller bredden igen.

## 7. Återstår

1. **Microsoft Bookings.** Följ `docs/BOOKING_SETUP.md` och byt `mode` när en verifierad länk finns.
2. **Förhandsvisningar på Vercel.** Sätt `PUBLIC_NOINDEX=1` för miljön Preview så att förhandsvisningar inte indexeras. Domänen är klar: www.miljonkraft.se är primär och miljonkraft.se omdirigeras dit med 308 (kontrollerat 2026-10-07).
3. **Porträtt av Yacine.** Ett riktigt foto skulle stärka bokningsdelen. Inget porträtt har skapats eller hämtats, eftersom ett påhittat ansikte inte får användas.
4. **Search Console och Bing Webmaster Tools.** Verifiera domänen och skicka in sitemap.
5. **Integritetsinformation.** Texten på `/integritet/` bör bekräftas av Miljonbemanning.
6. **Mätning.** Ingen mätning är inkopplad. Knapparna bär `data-event` (`contact_open`, `booking_open`).
