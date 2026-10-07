# Riktig bokning av 30 minuter med Yacine (Microsoft Bookings)

Målet är att besökaren väljer en verkligt ledig tid och att en bekräftad bokning hamnar i Yacines arbetskalender. Webbplatsen innehåller inga Microsoft-hemligheter och ingen egen kalenderbackend. Bokningstjänsten sköter tillgänglighet, tidszon, själva bokningen och bekräftelsen.

Status i dag: **contact_only**. Ingen verifierad bokningslänk fanns i uppdraget. En riktad sökning i Karims arbetsmejl (sökord bookwithme, outlook.office365.com/book) hittade ingen publicerad Bookings-sida för Yacine. Microsoft 365-anslutningen i den här sessionen har inte behörighet för Bookings (inga Bookings-scopes), så tjänsten kunde inte skapas eller kontrolleras härifrån.

Verifierat: kontot Yacine.Laghmari@miljonbemanning.se finns som intern användare i Miljonbemannings Microsoft 365-organisation.

## 1. Kontrollera licens och åtkomst

- Ett Outlook-konto räcker inte. Bookings måste vara aktiverat i organisationen och ingå i Yacines licens. Kontrollera i Microsoft 365 admin center under Inställningar, Organisationsinställningar, Bookings.
- Den som skapar den delade bokningssidan behöver behörighet att lägga till Yacine som personal.

## 2. Skapa en Shared Bookings-sida (rekommenderat för inbäddning)

I Outlook på webben, välj Bookings, Shared bookings, skapa ny sida.

Tjänst att konfigurera (förslag från uppdraget, inte beslutade inställningar där det anges):

| Inställning | Värde |
| --- | --- |
| Tjänstens namn | Lär känna ert företag |
| Längd | 30 minuter |
| Personal | Yacine Laghmari (intern användare i rätt tenant) |
| Format | Teams-möte påslaget |
| Bokningar per tid | 1 |
| Språk | Svenska |
| Tidszon | Europe/Stockholm (automatisk sommar- och vintertid) |
| Buffert efter mötet | 15 minuter (förslag) |
| Minsta framförhållning | 4 timmar (förslag) |
| Bokningshorisont | 30 dagar (förslag) |
| Fält | Namn och mejladress obligatoriska. Företag och kort behovsbeskrivning frivilliga. |
| Pris | Visa inget prisfält |

Viktiga kontroller i Microsoft-gränssnittet:

1. Under Personal, välj Yacine och aktivera **Events on Microsoft 365 calendar affect availability** så att upptagna tider i hans kalender inte går att boka. Tillgängliga tider ska följa Yacines verkliga, bekräftade bokningsfönster.
2. Under Bokningssidan, se till att sidan är **tillgänglig för externa** besökare. Inställningen som kräver ett Microsoft 365-konto från den egna organisationen ska inte vara aktiv för detta flöde. Testa eventuella verifieringssteg för gäster.
3. **Lead time in hours** påverkar både bokning och självavbokning i Shared Bookings. Beskriv på sidan bara den policy som faktiskt konfigurerats.
4. Gör en testbokning med en extern mejladress. Kontrollera bekräftelsemejl, Teams-länk och möjligheten att omboka eller avboka. Ta bort testbokningen i Bookings efteråt.

## 3. Koppla till webbplatsen

Öppna `src/config/site.ts` och ändra objektet `booking`:

```ts
export const booking = {
  mode: 'shared_embed' as BookingMode,   // eller 'external_link'. Behåll typcasten, annars faller npm run check.
  publicUrl: 'https://outlook.office.com/book/....',   // publik länk från Bookings, Dela, Kopiera länk
  embedUrl: 'https://outlook.office.com/book/....',    // iframe-källa från Bookings, Dela, Bädda in
  ...
}
```

- `external_link` använder bara `publicUrl`. Huvudknappen öppnar bokningssidan i ett nytt fönster.
- `shared_embed` kräver både `embedUrl` och `publicUrl`. Kalendern laddas först när besökaren trycker på knappen i inbjudan, sidans sista kapitel (Berätta vad ni behöver). En vanlig länk, Öppna bokningen i ett nytt fönster, visas alltid utanför inbäddningen.
- Kopiera adresserna exakt från Bookings. Konstruera dem inte från mejladress eller gissade ID:n.
- Anta inte att en personlig Bookings with me-länk kan bäddas in. Den används i så fall som `external_link`.

Bygg om (`npm run build`) och kontrollera att bygget går igenom. Saknas en giltig https-adress för valt läge stoppas bygget med ett tydligt fel.

Läget styr automatiskt knapptexterna i sidhuvudet, i första kapitlet och i inbjudan, och instruktionen under knappen. I contact_only heter knappen Föreslå ett 30-minuters samtal och öppnar ett förifyllt mejl, eftersom en knapp aldrig får heta Boka om den inte bokar. I de riktiga lägena heter den Boka 30 min med Yacine. Där visas också raden `meetingFormatLine` (i dag "Digitalt via Teams, 30 minuter"). Ändra eller töm värdet om tjänsten konfigureras utan Teams-möte, så att sidan bara beskriver det som faktiskt gäller. Justera `embedHeightPx` efter ett höjdtest av inbäddningen på mobil och dator.

## 4. Verifiera efter anslutning

- Öppna sidan i mobil och dator. Kontrollera att kalendern får plats, att tangentbordet når den och att reservlänken fungerar.
- Kontrollera att inbäddningen inte visas med en inloggningsruta för externa besökare.
- Kontrollera vilka kakor Bookings sätter när kalendern öppnas. Integritetssidan växlar automatiskt till en text om Microsofts kakor i läget `shared_embed`, men den ska stämma med det som faktiskt sätts.
- Kontrollera i webbläsarens konsol att inbäddningen inte blockeras av X-Frame-Options eller CSP (meddelande i stil med "Refused to display ... in a frame"). En blockerad ram ger inget automatiskt fel på sidan och fångas inte av reservtimern. Byt i så fall till `external_link`.
- Genomför en godkänd testbokning hela vägen till bekräftelse. Redovisa separat att länken öppnats, att kalenderkonflikter kontrollerats och att bokningen faktiskt slutförts.
- Om testet skapar en riktig kalenderhändelse eller skickar mejl måste det ingå i behörigheten. Hantera testbokningen i Bookings efteråt.

## 5. Mätning

Ett klick eller en laddad iframe är inte en genomförd bokning. Knapparna bär attributet `data-event` med ett av tre värden: `booking_open` (öppnar bokningstjänsten, i external_link samt på reservlänken och laddknappen i shared_embed), `booking_section` (huvudknappar som bara skrollar till inbäddningen i inbjudan i shared_embed) och `contact_open` (mejlförslag i contact_only). Webbplatsen har ingen mätning inkopplad. Om mätning läggs till ska `booking_complete` bara registreras när leverantören ger ett verifierat stöd för det, till exempel ett dokumenterat integrationsmeddelande från inbäddningen. Utan sådant stöd följs bekräftade bokningar upp i Bookings.
