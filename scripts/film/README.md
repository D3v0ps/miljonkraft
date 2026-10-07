# Miljonkraft, film och musik

En 56 sekunder lång rörlig grafik (motion graphics) för miljonkraft.se med originalmusik. Allt byggs med kod i den här mappen och kan renderas om exakt likadant.

## Vad finns var

| Fil | Innehåll |
| --- | --- |
| `scripts/film/film.html` | Hela filmen som en ren funktion av tid. `window.renderFrame(t)` sätter varje elements läge för `t` sekunder. Inga CSS-animationer. `?format=landscape` (1920 × 1080) eller `?format=vertical` (1080 × 1920). All text i bild finns här, i `SCENES` och i scenfunktionerna. |
| `scripts/film/render.mjs` | Öppnar `film.html` i Chromium (Playwright), loopar `t = i / 30` och sparar JPEG-bilder (kvalitet 92). Skriver även textalternativet och kapitelspåret. |
| `scripts/film/music.py` | Komponerar och syntetiserar musiken (numpy och scipy) till en 48 kHz stereo-WAV. |
| `scripts/film/encode.mjs` | Kodar bilder och musik till leveransfilerna i `public/film/` med ffmpeg. |
| `public/film/miljonkraft-film-1080.mp4` | H.264 High, 1920 × 1080, 30 fps, CRF 20,5, AAC 192 kbit/s, faststart |
| `public/film/miljonkraft-film-720.mp4` | H.264 High, 1280 × 720, CRF 23, AAC 160 kbit/s |
| `public/film/miljonkraft-film-1080.webm` | VP9 (CRF 32, två pass), Opus 160 kbit/s |
| `public/film/miljonkraft-film-vertikal.mp4` | H.264, 1080 × 1920 (9:16) för sociala medier, samma tidslinje och musik |
| `public/film/miljonkraft-film-poster.jpg`, `.webp` | Affischbild 1920 × 1080 (droppet med tre rader och solen, t = 13,2 s) |
| `public/film/miljonkraft-film-poster-vertikal.jpg` | Affischbild 1080 × 1920 |
| `public/film/miljonkraft-film-text.json` | Textalternativ: all text i bild per scen med start och slut i sekunder, plus en kort bildbeskrivning |
| `public/film/miljonkraft-film-kapitel.vtt` | WebVTT-kapitel (svenska kapitelnamn per scen) |
| `public/film/miljonkraft-musik.mp3` | Musiken separat, 192 kbit/s |

Mellanfiler (bilder, WAV) hamnar som standard i `scripts/film/.work/`, som är ignorerad av git. Mappen kan raderas efteråt.

## Rendera om

Kräver Node 20+, Playwright med Chromium (finns i projektets devDependencies), Python 3 med numpy och scipy, och ffmpeg 6+ med libx264, libvpx-vp9, libopus och libmp3lame. Ange ffmpeg med `FFMPEG=/sökväg/till/ffmpeg` eller `--ffmpeg=` om den inte ligger i `PATH`.

```bash
W=scripts/film/.work

# 1. Musik (cirka 30 s). Skriver WAV och en spektrogrambild för kontroll.
python3 scripts/film/music.py --out $W/miljonkraft-musik.wav --spectrogram $W/spektrogram.png

# 2. Bilder, båda formaten (cirka 70 s vardera med 4 arbetare)
node scripts/film/render.mjs --format=landscape --out=$W/frames-landscape
node scripts/film/render.mjs --format=vertical  --out=$W/frames-vertical

# 3. Affischbilder (PNG, kodas i steg 4)
node scripts/film/render.mjs --format=landscape --poster=13.2 --out=$W
node scripts/film/render.mjs --format=vertical  --poster=13.2 --out=$W

# 4. Kodning till public/film (VP9 i två pass tar längst tid)
node scripts/film/encode.mjs --work=$W
#    eller bara delar: --only=mp4,720,webm,vertical,poster,mp3

# 5. Textalternativ och kapitel
node scripts/film/render.mjs --text=public/film
```

Snabbkontroll av enskilda bildrutor under arbetet:

```bash
node scripts/film/render.mjs --format=landscape --times=8.5,13.2,29.3 --out=$W/stills
```

Filmen kan också öppnas direkt i en webbläsare (`scripts/film/film.html`) och styras från konsolen med `renderFrame(12.5)`.

## Ändra text

All text i bild finns i `film.html`. Varje text registreras med `logText()` och hamnar automatiskt i `miljonkraft-film-text.json` när steg 5 körs. Regler för texten i bild: svenska, rubriker med versaler, inget kolon och inga tankstreck (bindestreck i sammansättningar går bra). Kör sedan om steg 2 till 5.

## Hur musiken görs

`music.py` är en liten synt och mixer skriven från grunden. Inga samplingar, loopar eller förinställningar från andra används.

- **Harmonik.** 120 BPM, D-dur, ackordföljden D, A, Bm, G med ett ackord per takt (2 s). Sista takten går A till D så att musiken landar på grundtonen.
- **Form, i takt med scenerna.** Intro 0 till 8 s med pad, plockad arpeggio, filter som öppnas och brusstegring 6 till 8 s. Drop vid 8 s med dov smäll och ljus cymbal, därefter rak bastrumma, handklapp på 2 och 4, hi-hat, subbas och sidokedjad pad. Breakdown vid 20 s med en klocka per steg i Miljonmodellen (21 till 28 s, en ton i sekunden, D-durskalan uppåt och panorerad från vänster till höger). Uppbyggnad 28 till 30 s, groove igen vid 30 s, motmelodi 38 till 46 s, ny smäll vid 46 s för visionen och utklingning från 50 s med pad och arpeggio. Ett klockackord vid 53 s när logotypen kommer.
- **Ljudkvalitet.** Bandbegränsade oscillatorer: sågtand med polyBLEP och additiva toner där bara deltoner under 15 kHz skapas, så ingen vikningsdistorsion. ADSR-kurvor, mjuka sin²-anslag och korta ut-toningar på varje ton, så inga klick. Lågpassfilter med tidsstyrd brytfrekvens på paden. Stereobredd genom olika detune per kanal och pingpongdelay. Rumsklang genom faltning med ett syntetiserat impulssvar (frekvensberoende avklingande brus med tidiga reflexer). Tempo-synkat delay (punkterad åttondel) på arpeggiot. Sidokedjedämpning från bastrumman.
- **Mastring.** Högpass 30 Hz (tar även bort likspänning), mild sänkning kring 4,6 kHz och 280 Hz, lätt diskantlyft, mjuk klippning med 2× översampling och en true-peak-limiter med 4× översampling. Förstärkningen justeras så att den integrerade ljudstyrkan blir −16 LUFS (ITU-R BS.1770, mätt i skriptet och kontrollerat med ffmpeg `ebur128`). Toppvärdet ligger under −1 dBTP.

Skriptet skriver ut en rapport (LUFS, true peak, DC, klippta sampel) och kan rita ett spektrogram (`--spectrogram`).

## Licenser

- **Musik.** Helt originell, komponerad och genererad av `scripts/film/music.py`. Inga samplingar eller verk från tredje part, så den kan användas fritt av Miljonbemanning.
- **Foton.** Från Miljonbemannings egen bildbank (`public/img/`). De används som miljöbilder. Ingen text i filmen säger något om personerna på bilderna.
- **Logotyp.** Miljonbemannings officiella logotyp (`public/img/mb-logo.png`), oförändrad och i originalstorlek, med frizon runt sig.
- **Typsnitt.** Montserrat (SIL Open Font License 1.1), självhostat från `public/fonts/`.
