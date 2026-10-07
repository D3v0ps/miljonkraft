# Överlämning Miljonkraft.se

Sammanställd 7 oktober 2026. Gäller koden på grenen `claude/relaxed-allen-juti3f`.

## 1. Vad som levererats

- En komplett, statisk webbplats (Astro 5) med hela innehållet från masterprompten, fungerande navigation, FAQ, sidfot, en kort integritetssida och en 404-sida.
- Bokningsmodul med tre lägen. Läget **contact_only** är aktivt: alla huvudknappar öppnar ett förifyllt mejl till Yacine. De andra två lägena (**external_link**, **shared_embed**) är byggda och testade med exempeladresser och aktiveras i `src/config/site.ts` när en riktig Bookings-länk finns.
- Metadata, canonical, Open Graph med delningsbild 1200 × 630, favicon-set, webbmanifest, robots.txt, sitemap med verkligt ändringsdatum och JSON-LD (WebSite, WebPage, Organization, Person).
- Verifieringsskript för webbläsare (skärmbilder, överrinning, axe, tangentbord, utan JavaScript, reducerad rörelse), kontrastkontroll, Lighthouse-rapporter och skärmbilder i `docs/`.

Status per del, hållet isär enligt uppdraget:

| Del | Status |
| --- | --- |
| Färdig kod | Klar och verifierad lokalt |
| Fungerande kontakt | Klar. Telefonlänk, mejllänk och mejlförslag med förifyllt ämne fungerar |
| Ansluten bokning | **Återstår.** Ingen verifierad Bookings-länk fanns. Anslutning beskrivs i `docs/BOOKING_SETUP.md` |
| Genomförd bokningsverifiering | **Återstår.** Kan göras först när Bookings är anslutet |
| Publicering på miljonkraft.se | **Återstår.** Domän- och värdåtkomst saknades i uppdraget |

## 2. Startpaket och skills, vad som faktiskt användes

Repot innehöll bara en README. Startpaketet (`START-HERE.md`, `templates/bootstrap-prompt.md`, `docs/PROJECT_BRIEF.md`, `docs/MAINTENANCE.md`) och den egna skillen **project-design** fanns varken i repot, i sessionens skillmappar eller som bilaga till mejlet med masterprompten (bilagan var enbart masterprompten). Kontrollen mot project-design och startpaketets egna instruktioner återstår därför.

Skills vars instruktioner lästes i sin helhet från de publika källorna och användes:

| Skill | Användning |
| --- | --- |
| design-taste-frontend (Taste v2) | Huvudsaklig formgivningsskill. Designläsning, dial-värden (variance 5, motion 3, density 4), accent- och radiedisciplin, eyebrow-restriktion, hero-disciplin, pre-flight-listan |
| frontend-design (Anthropic) | Komplement. Ground i ämnet, en familj, undvik de generiska AI-utseendena, en orkestrerad rörelse |
| web-design-guidelines (Vercel, command.md) | Granskningslista för tillgänglighet, fokus, formulär, rörelse, typografi |
| animate (Emil Kowalski) | Beslut om rörelse. Kurvor, tider, reduced motion, pekargating |
| playwright-cli (Microsoft) | Läst. Själva CLI:t installerades inte. Verifieringen gjordes med Playwright direkt i Node mot den förinstallerade Chromium, se `scripts/verify.mjs` |
| fixing-accessibility, fixing-motion-performance, fixing-metadata (ui-skills) | Granskningsstöd i reviewrundorna |
| performance-optimization (Addy Osmani) | Granskningsstöd för laddning och Core Web Vitals |
| pick-ui-library | Läst som referens. Inget bibliotek behövdes |

Inte använda: image-to-code (ingen visuell förlaga fanns), Awesome DESIGN.md (endast README läst), Expo-skills och plattformsskills (inte relevanta).

## 3. Designriktning

Tre oberoende designförslag togs fram parallellt och bedömdes av två domare (en kundlins, en hantverkslins). De två starkaste:

**Riktning A, Strecket.** Varumärkeskontinuitet först. Miljonbemannings skiffer och rödorange, Plus Jakarta Sans, det lilla strecket ur logotypen som enda motiv (ett streck markerar avsändaren, åtta stigande streck bär modellen). Mörk inledning och mörk bokningsdel som bokstöd. Domarpoäng 48 + 47.

**Riktning B, Trappsteget.** Motiv först. En enda stigande trapplinje som börjar vid bokningsknappen, blir Miljonmodellens åtta steg och Karriärstegens exempel. Schibsted Grotesk i en familj, mörk inledning, ljusa varma läsytor, accenten bara som linje och markering. Domarpoäng 49 + 42.

Domarna delade sig (kundlinsen valde B, hantverkslinsen A). Den byggda sidan är en syntes med **B som stomme**: trapplinjen som motiv, Schibsted Grotesk, mörk inledning och ljusa läsytor. Från A hämtades strecket som avsändarmarkering före bylinen och statusraden, den fasta mobilknappen, tyngre textvikt på mörk yta och en strikt accentdisciplin där den råa varumärkesfärgen aldrig används som text. Hantverksdomarens invändning mot B (att trappgeometrin inte höll ihop) är hanterad genom att samma stegproportion används i hero, Miljonmodellen och Karriärstegen, och genom att linjen landar i en fylld nod vid bokningsrubriken.

Fem designbeslut:

1. **En trapplinje är sidans huvudgrepp.** Åtta steg i heron, märket i sidhuvudet, Miljonmodellens rutnät som stiger fyra steg i taget, Karriärstegens exempel som en trappa. Linjen slutar i en ihålig nod, nästa steg som ännu inte är taget.
2. **En typsnittsfamilj.** Schibsted Grotesk (variabel, självhostad, OFL). Rubriker i 800 med tät radhöjd, brödtext 16 till 17 px, högst 62 tecken per rad. Typsnittet är skandinaviskt, sakligt och har välritade å ä ö.
3. **En mörk inledning, ljusa varma ytor, en accent.** Skiffer #161C21 i hero och sidfot, läsytor i #FAF8F5 och #F2EEE8. Accenten #D6341B på ljust och #FF6A4B på mörkt harmonierar med Miljonbemannings rödorange utan att vara deras officiella profil. Alla textpar är beräknade och klarar WCAG AA, se `node scripts/contrast.mjs`.
4. **Alla åtta modellsteg syns alltid.** Fyra gånger två på dator som två sammanhängande trappor med sättsteg, två kolumner på surfplatta, en lodrät trappa på mobil där varje steg står ett snäpp längre till höger. Inget dragspel.
5. **Få och precisa rörelser.** Trappan ritas upp en gång vid sidladdning, knappar ger återkoppling på 160 ms, menyn och FAQ-pilen på 220 ms. Allt stängs av under prefers-reduced-motion.

## 4. Var saker ändras

Se `README.md`. Kort: all text, kontaktuppgifter, produktionsadress och bokningsläge finns i `src/config/site.ts`. Designvärden i `src/styles/global.css`.

## 5. Återstående externa anslutningar, exakta nästa steg

1. **Microsoft Bookings.** Följ `docs/BOOKING_SETUP.md`. Kontrollera licens, skapa Shared Bookings-sidan med Yacine som personal, kopiera publik länk och inbäddningsadress till `booking` i `src/config/site.ts`, byt `mode`, bygg om, testa en godkänd bokning hela vägen till bekräftelse. En riktad sökning i Karims arbetsmejl hittade ingen befintlig bokningslänk för Yacine.
2. **Domän och publicering.** Projektet är förberett för Vercel (`vercel.json` med Astro-preset, avslutande snedstreck och omdirigering från www till apex), se README.md. Driftsättningen kunde inte göras från den här sessionen eftersom ingen Vercel-inloggning eller token fanns. Steg: importera repot i Vercel (eller `vercel login`, `vercel link`, `vercel --prod`), lägg till domänerna miljonkraft.se och www.miljonkraft.se, sätt `PUBLIC_NOINDEX=1` för miljön Preview. Kontrollera efter första produktionsdeployen att saknad sida ger 404, att `/integritet` leder till `/integritet/` och att produktionen inte har `noindex`. Vercels Claude Code-plugin installerades i sessionens container med `npx plugins add vercel/vercel-plugin`, men containern är tillfällig, så kör kommandot på den egna datorn för att få `/deploy` och `/status`.
3. **Google Search Console och Bing Webmaster Tools.** Verifiera domänen (DNS-post), skicka in `https://miljonkraft.se/sitemap-index.xml`. Inte genomfört, kräver kontoåtkomst.
4. **Integritetsinformation.** Miljonbemanning.se hade ingen nåbar integritetspolicy att länka till (adressen `/privacy-policy/` svarar med startsidan). Sidan `/integritet/` beskriver sanningsenligt att webbplatsen inte samlar in uppgifter. Texten bör bekräftas av Miljonbemanning, och länken bytas om en central policy finns.
5. **Sökrobotar för AI.** `robots.txt` tillåter alla robotar, både OAI-SearchBot (sök) och GPTBot (träning). Vill ni neka träning, lägg till `User-agent: GPTBot` och `Disallow: /` utan att röra sökroboten.
6. **Bilder.** Inga publicerbara bilder fanns. Sidan bygger på typografi och egen grafik. Vill ni lägga till ett porträtt av Yacine eller miljöbilder från Alby finns naturliga platser i bokningssektionen och Om-sektionen. Lägg bilder i `public/` med angivna dimensioner.
7. **Mätning.** Ingen mätning är inkopplad. Knapparna bär `data-event` med `contact_open` respektive `booking_open`. Genomförd bokning (`booking_complete`) får bara mätas med verifierat stöd från Bookings.

## 6. Kända avvägningar

- Heron har fem textelement (byline, rubrik, två stycken, knappar) eftersom masterprompten fastslår två stycken. Knappen ligger ovanför vikningen på 390 × 844, 768 och 1440 × 900. På 320 × 568 hamnar den strax under, och den fasta mobilknappen tar vid när hero-knappen passerats.
- Rubriken står på tre rader, en mening per rad, från 768 px. Rubrikstorleken på dator är uppmätt så att "Ett starkare Botkyrka." ryms på en rad i textkolumnen, och knappen ligger ovanför vikningen på 1366 × 768 och 1024 × 768.
- Rubriken är helt ljus. Accenten spenderas på knappen, trappans översta steg och avsändarmarkeringen, så att bokningsvägen är det starkaste accentmomentet i heron.
- Trappan i heron bär Miljonmodellens åtta stegnamn som små etiketter på dator, så att motivet läses som modellen och inte som en tillväxtkurva. Etiketterna är dekorativa; stegen finns som text i avsnittet Miljonmodellen.
- Mejlförslaget i contact_only innehåller inga kolon. Mallens rader är meningsstarter som ifyllaren fullföljer.
