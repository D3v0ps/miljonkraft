# Designplan: Den röda tråden

Redesign av www.miljonkraft.se, oktober 2026. Planen skrevs före koden enligt skillen frontend-design och granskades mot briefen innan bygget började.

## Ämne, publik och uppgift

- **Ämne.** Miljonkraft Botkyrka, ett initiativ från Miljonbemanning med rötterna i Alby sedan 2012. Ett lokalt kretslopp där människor som vill arbeta och lokala företag som behöver kompetens hittar varandra.
- **Publik.** Företagare och chefer i Botkyrka, samarbetsparter och kommunen.
- **Uppgift.** Berätta idén på några minuter och leda till ett samtal på 30 minuter med Yacine.

## Koncept

**Den röda tråden.** En enda röd linje bär berättelsen från första till sista kapitlet. Den börjar som två punkter som möts, människor och möjligheter, och blir en tråd. Tråden går bakom bilden från Alby, slår en ögla runt kretsloppet, bär Miljonmodellens åtta steg, kliver uppför karriärstegen, flätar ihop affärsnytta och samhällsnytta och löper till sist ut ur sidan längs en horisont, långt utanför kommunens gränser. Inbjudan börjar med en ny röd punkt: Vi börjar där.

Den röda punkten och det röda understrecket finns redan i Miljonbemannings grafiska profil, och "den röda tråden" är ett svenskt uttryck för det som håller ihop en berättelse.

## Tokens

| Namn | Hex | Roll |
| --- | --- | --- |
| Papper | `#FFFFFF` | Grundyta |
| Antracit | `#1E252B` | Text, knappar |
| Grafit | `#494E52` | Sekundär text |
| Tråd | `#FF0C01` | Bara tråden och dess punkter, aldrig brödtext |
| Himmel | `#D7E5EB` | Mjuka former, visionens himmel |
| Gryning | `#FFCCC6` | Solen vid horisonten |

Grå `#8D9093` används bara för stor text som ännu inte tänts i Miljonmodellen (minst 24 px, kontrast 3,3:1). Sidfoten ligger på `#F1F2F3` eftersom logotypen inte får färgas om och kräver ljus yta.

## Typografi

Montserrat, profilens typsnitt, variabel vikt. En familj och kontrast i vikt och storlek.

- Huvudrubrik i vikt 300, flytande 38 till 96 px, radavstånd 1,04 och tät spärrning.
- Kapitelrubriker i vikt 300, 30 till 60 px.
- Påståenden i vikt 500 där en mening ska stå fast. Teori står i grått och verklighet i antracit.
- Brödtext i 18 till 20 px, vikt 400, radlängd under 70 tecken.
- Versaler bara där briefen kräver dem, i Affärsnytta × samhällsnytta och Vår riktning.

## Layout

Ensidig, vänsterställd berättelse i en ram på högst 1152 px. Tråden går i en smal fil längs ramens vänsterkant, på 2,5 % av bredden. Texten börjar en indragning till höger om filen, så tråden och texten möts aldrig. Kapitlen staplas utan mellanrum mellan blocken, så att tråden blir obruten.

```
 MB. Miljonkraft Botkyrka                      [Föreslå ett 30-minuters samtal]
                                                        .-""""""-.
 ●  När människor och                                 (  himmel   )
 │  möjligheter hittar                                  '-.____.-'
 │  varandra, växer en plats.
 │  Ett initiativ från Miljonbemanning ...
 │  [Föreslå ett 30-minuters samtal]   Läs vår idé
 │
 │  Vi kommer härifrån.
 │  Miljonbemannings resa började i Alby 2012 ...
 ███████████████████ bilden från Alby, tråden bakom ████████████████████
 │  Potential finns överallt.
 │  Möjligheten gör det inte.
 │
 ╰─( Invånare      Miljonkraft      Lokala företag )   öglan, kretsloppet
 │  Ju bättre vi förstår företagen omkring oss ...
 │
 │  Vi utvecklar inte människor för en arbetsmarknad i teorin.
 │  Vi utvecklar dem för arbete som finns på riktigt.
 ●  Nå
 ●  Förstå            åtta ord som tänds när tråden passerar
 ●  ...
 ●  Växa
 │
 │  Första jobbet är början.                         ╭── Transportplanering
 │                                  ╭── Koordinator ─╯         │
 │               ╭── Truck och ─────╯                         │
 ╰── Lager ──────╯   lagersystem                               │
                                                                │
    ( AFFÄRSNYTTA )×( SAMHÄLLSNYTTA )   två trådar korsas  ─────╯
 │
 ●  2012   Rötterna i Alby
 ●  2023   SvD Affärsbragd
 ●  12     Förstahandsleverantör i alla tolv områden
 │
 │  Vår riktning
 │  Botkyrka ska ha Sveriges lägsta arbetslöshet.
 ╰───────────────────────( gryning )────────────────────────────────────▶ ut ur sidan
    Botkyrka först ...

 ●  Berätta vad ni behöver. Vi börjar där.
    Yacine ...  [Föreslå ett 30-minuters samtal]
```

På mobil följer tråden samma fil längs vänsterkanten. Kretsloppet blir en stående ögla, karriärstegen kliver åt höger nedåt i läsordning och de två trådarna korsas lodrätt med ett ord i varje ögla.

## Principer

1. **En sak är djärv: tråden.** Allt annat är stilla, ljust och glest.
2. **Tråden betyder något i varje kapitel.** Öglan är kretsloppet, punkterna är stegen, trappan är karriären, korsningen är × och horisonten är riktningen.
3. **Rörelse följer läsningen.** Tråden ritas med den egna skrollningen via CSS scroll-driven animations, utan bibliotek och utan att skrollningen kapas. Webbläsare utan stöd ritar tråden med en kort övergång när den syns. Med reducerad rörelse står allt färdigritat.
4. **Bara riktiga bilder.** En bild ur Miljonbemannings bildbank, västen med MB-punkten. Inga påhittade människor.
5. **Inga mallmönster.** Inga kort, inga kapitelnummer, inga etiketter i versaler ovanför rubriker, inga pilar i länktext.

## Efter granskningen

- Bilden från Alby fyller nu en skärm och zoomar långsamt in mot västens röda punkt medan man skrollar, sidans enda kameraåkning.
- Krysset i Affärsnytta × samhällsnytta står synligt där trådarna korsas.
- De två punkterna i inledningen kommer från sidhuvudet och från vecket innan de möts.
- Den sista röda punkten tänds när man når inbjudan, på samma sätt som Miljonmodellens steg.
- Under 700 px används de liggande figurerna också på liggande telefoner från 640 px, så att figurerna ryms på en skärm.

## Granskning mot briefen före bygget

Planen prövades mot frågan om den kunde ha blivit densamma för vilken liknande sida som helst. Fem delar ändrades.

1. **Heron.** Första utkastet var rubrik, knapp och en mjuk cirkel, ett standardupplägg. Ändrat till att rubrikens innebörd spelas upp en gång: två punkter möts och blir tråden. Cirkeln blev en tyst bakgrund.
2. **Tråden.** En rak lodrät linje med punkter är en vanlig tidslinjekomponent. Ändrat till en linje som byter form efter kapitlets innehåll och till sist lämnar sidan.
3. **Etiketter.** Utkastet hade små etiketter i versaler över varje kapitel. Borttagna. Tråden ersätter kapitelnummer.
4. **Sidfoten.** En mörk eftertext övervägdes men logotypen får inte färgas om och syns inte på mörk yta. Sidfoten blev ljus.
5. **Bilder.** Lager- och transportbilderna i bildbanken liknar stockfoto och användes inte. Bara västen med MB-punkten är kvar.
