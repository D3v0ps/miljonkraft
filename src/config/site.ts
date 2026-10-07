/**
 * Central konfiguration för Miljonkraft.se.
 *
 * Här ändras produktionsadress, kontaktuppgifter, bokningsläge, bokningslänkar
 * och sidans text. Komponenterna läser allt härifrån. Ändra inte sakuppgifter
 * i komponenterna.
 *
 * Språkregel för all synlig marknadsföringstext: inga tankstreck och inga kolon.
 */

export type BookingMode = 'shared_embed' | 'external_link' | 'contact_only';

export const site = {
  /** Produktionsadress. Används för canonical, Open Graph, sitemap och JSON-LD. */
  url: 'https://miljonkraft.se',
  name: 'Miljonkraft Botkyrka',
  shortName: 'Miljonkraft',
  tagline: 'Ett initiativ från Miljonbemanning',
  locale: 'sv_SE',
  lang: 'sv-SE',
  /** Verkligt ändringsdatum för innehållet (ISO-datum). Uppdateras manuellt vid innehållsändring. */
  lastModified: '2026-10-07',
  /** Årtal i sidfoten. */
  copyrightYear: 2026,
  meta: {
    title: 'Miljonkraft Botkyrka | Fler i arbete, starkare företag',
    description:
      'Miljonbemanning vill skapa fler vägar till arbete i Botkyrka. Lär känna Miljonkraft, vårt arbetssätt och hur ert företags kompetensbehov kan bidra.',
    ogImage: '/og.png',
    ogImageAlt:
      'Miljonkraft Botkyrka. Fler i arbete. Starkare företag. Ett starkare Botkyrka. Ett initiativ från Miljonbemanning.',
    themeColor: '#171d22',
  },
} as const;

export const contact = {
  name: 'Yacine Laghmari',
  firstName: 'Yacine',
  role: 'Affärs- och samhällsutveckling',
  organization: 'Miljonbemanning',
  email: 'Yacine.Laghmari@miljonbemanning.se',
  phoneDisplay: '076 294 34 31',
  phoneHref: 'tel:+46762943431',
  phoneE164: '+46762943431',
  place: 'Alby, Botkyrka',
} as const;

export const organization = {
  name: 'Miljonbemanning',
  url: 'https://miljonbemanning.se',
  aboutUrl: 'https://miljonbemanning.se/sv/about/us/',
  /** Integritetsinformation. Egen kort sida tills Miljonbemanning bekräftar en central integritetspolicy att länka till. */
  privacyUrl: '/integritet/',
  /** Officiella kanaler som länkas från miljonbemanning.se. */
  sameAs: [
    'https://www.linkedin.com/company/miljonbemanning/',
    'https://www.facebook.com/Miljonbemanning/',
    'https://www.instagram.com/miljonbemanning/',
    'https://www.youtube.com/channel/UCWk40nna0T6LQk3I00mojwg',
  ],
} as const;

/**
 * Bokningsläge.
 *
 * contact_only   Riktig bokning är inte ansluten. Alla huvudknappar leder till en
 *                mejlförfrågan med förifyllt ämne och text.
 * external_link  En verifierad publik bokningssida (Microsoft Bookings) öppnas i nytt fönster.
 *                Kräver publicUrl.
 * shared_embed   En verifierad Shared Bookings-sida bäddas in i bokningssektionen.
 *                Kräver embedUrl (iframe-källan från Bookings) och publicUrl (reservlänk).
 *
 * Kopiera adresserna från den publicerade bokningstjänsten. Konstruera dem inte
 * från en mejladress eller gissade ID:n. Se docs/BOOKING_SETUP.md.
 */
export const booking = {
  mode: 'contact_only' as BookingMode,
  publicUrl: '',
  embedUrl: '',
  /** Reserverad höjd för inbäddningen så att layouten inte hoppar. */
  embedHeightPx: 1100,
  durationMinutes: 30,
  /** Visas bara när ett riktigt Teams-flöde är konfigurerat (external_link eller shared_embed). */
  meetingFormatLine: 'Digitalt via Teams · 30 minuter',
  timeZone: 'Europe/Stockholm',
  /** Förifyllt mejl i contact_only. Radbrytningar bevaras och URL-kodas vid byggning. */
  mail: {
    subject: 'Förslag på ett samtal om Miljonkraft Botkyrka',
    body: [
      'Hej Yacine,',
      '',
      'Vi vill gärna ta ett samtal på 30 minuter om vårt företag och vad vi behöver framöver.',
      '',
      'Vårt företag heter ',
      'Du når mig på ',
      'Tider som passar oss är ',
      'Vi ses helst digitalt, hos oss eller hos er i Alby (stryk det som inte passar)',
      '',
      'Vänliga hälsningar',
      '',
    ].join('\n'),
  },
} as const;

export const nav = {
  items: [
    { label: 'För företag', href: '#for-foretag' },
    { label: 'Miljonmodellen', href: '#miljonmodellen' },
    { label: 'Om Miljonkraft', href: '#om-miljonkraft' },
  ],
  bookingHref: '#boka',
} as const;

export const copy = {
  hero: {
    /** Avsändarnamnet Miljonkraft Botkyrka bärs av ordmärket i sidhuvudet direkt ovanför heron. */
    byline: 'Ett initiativ från Miljonbemanning',
    /** Tre meningar, en per rad från 768 px. På smala skärmar bryts den tredje meningen naturligt. */
    headline: ['Fler i arbete.', 'Starkare företag.', 'Ett starkare Botkyrka.'],
    lead:
      'Vi vill koppla människors vilja att arbeta till företagens behov av kompetens. Ju bättre vi förstår er verksamhet, desto bättre kan vi förbereda människor för att lyckas hos er.',
    body:
      'Med Miljonkraft Botkyrka vill vi skapa fler vägar till arbete för unga i kommunen, tillsammans med det lokala näringslivet.',
  },
  status: {
    text:
      'Miljonbemanning och Botkyrka kommun har tecknat samarbetsavtal om Miljonkraft Botkyrka. Projektet startar om Svenska ESF-rådet beviljar stöd.',
  },
  trust: [
    { fact: 'Rötter i Alby sedan 2012', note: 'Miljonbemanning' },
    { fact: 'SvD Affärsbragd 2023', note: 'Miljonbemannings grundare' },
  ],
  companies: {
    id: 'for-foretag',
    heading: 'Vi vill förstå vad ni behöver',
    questions: [
      'Vilka arbetsuppgifter behöver ni hjälp med?',
      'Vad behöver en ny medarbetare kunna från första dagen?',
      'Vad kan ni lära ut på plats?',
    ],
    paragraphs: [
      'Vi vill lära känna er verksamhet, era krav och era planer framåt. Den kunskapen hjälper oss att rikta kompetensutvecklingen mot verkliga möjligheter hos lokala företag.',
      'Ni behöver inte ha en ledig tjänst just nu. Ett samtal om era framtida behov är en bra början.',
    ],
  },
  model: {
    id: 'miljonmodellen',
    heading: 'Miljonmodellen gör vägen tydlig',
    paragraphs: [
      'Vi möter människor som vill arbeta, ta ansvar och utvecklas. Med Miljonmodellen vill vi hålla ihop vägen från första kontakt till arbete, studier och fortsatt utveckling.',
      'I praktiska yrkesworkshops får människor visa vad de kan. Det hjälper oss att förstå både deras styrkor och vilken kompetens som behöver utvecklas.',
      'Målet är att förbereda människor för arbetsuppgifterna som faktiskt väntar och ge stöd när nästa steg tas.',
    ],
    stepsLabel: 'Miljonmodellens åtta steg',
    steps: [
      { name: 'Nå', text: 'Skapa en trygg första kontakt.' },
      { name: 'Förstå', text: 'Lär känna personens förutsättningar och erfarenheter.' },
      { name: 'Rikta', text: 'Hitta en riktning utifrån intressen och verkliga möjligheter.' },
      { name: 'Bevisa', text: 'Synliggör förmågan genom praktiska arbetsprov.' },
      { name: 'Utveckla', text: 'Stärk den kompetens som behöver utvecklas.' },
      { name: 'Övergå', text: 'Ta nästa steg till arbete eller studier.' },
      { name: 'Bära', text: 'Ge stöd under starten.' },
      { name: 'Växa', text: 'Följ upp och planera nästa karriärsteg.' },
    ],
  },
  career: {
    id: 'karriarstegen',
    heading: 'Karriärstegen gör nästa steg synligt',
    paragraphs: [
      'Det första jobbet kan vara början på något större. Med Karriärstegen vill vi göra vägen till nya kunskaper, mer ansvar och nästa yrkesroll begriplig.',
      'En möjlig väg inom lager och logistik kan gå från lagerarbete, via truckutbildning och kunskap om lagersystem, till en koordinerande roll och vidare mot transportplanering.',
      'Vägen anpassas efter personens förutsättningar, intressen och arbetslivets krav.',
    ],
    exampleLabel: 'Ett exempel på en möjlig väg',
    legend: { role: 'Yrkesroll', skill: 'Kompetensutveckling' },
    /** Illustrativt exempel. Ingen resultatberättelse och ingen garanterad väg. */
    path: [
      { kind: 'role', label: 'Lagerarbete' },
      { kind: 'skill', label: 'Truckutbildning' },
      { kind: 'skill', label: 'Kunskap om lagersystem' },
      { kind: 'role', label: 'Koordinerande roll' },
      { kind: 'role', label: 'Transportplanering' },
    ],
  },
  about: {
    id: 'om-miljonkraft',
    heading: 'Vårt hjärta finns här',
    paragraphs: [
      'Miljonbemannings resa började i Alby 2012. Här finns våra rötter och viljan att se fler människor få möjlighet att bidra.',
      'Vi är ett auktoriserat bemannings- och rekryteringsföretag och arbetar också med kompetensutveckling. För oss hör företagens utveckling och människors möjligheter ihop.',
      'Våra grundare tilldelades SvD Affärsbragd 2023. Det är ett erkännande vi är stolta över och en drivkraft att fortsätta arbetet här hemma.',
    ],
    linkLabel: 'Läs mer om Miljonbemanning',
    servicesLabel: 'Miljonbemanning arbetar med',
    services: ['Bemanning', 'Rekrytering', 'Kompetensutveckling'],
  },
  vision: {
    id: 'vision',
    heading: 'Vi vill mer för Botkyrka',
    paragraphs: [
      'Vår långsiktiga vision på Miljonbemanning är att Botkyrka ska ha Sveriges lägsta arbetslöshet. Vi vill bidra till en kommun där människor kan bygga sin framtid och företag kan växa.',
      'Miljonkraft Botkyrka är ett planerat projekt för unga mellan 16 och 28 år som står utanför arbete och studier. Miljonbemanning är projektägare och Botkyrka kommun är strategisk samarbetspart.',
      'För att skapa vägar som leder vidare behöver vi företagens kunskap om arbetslivet. Ert perspektiv hjälper oss att förstå vilka möjligheter som finns och hur fler kan bli redo för dem.',
    ],
  },
  bookingSection: {
    id: 'boka',
    intro: [
      'Jag heter Yacine Laghmari och arbetar med affärs- och samhällsutveckling på Miljonbemanning.',
      'Jag vill gärna höra mer om ert företag och vad ni behöver framöver. På 30 minuter hinner vi lära känna varandra och prata om möjliga nästa steg.',
    ],
    /** Instruktion när riktig bokning finns (external_link eller shared_embed). */
    instructionReal:
      'Välj en tid som passar. Vill ni hellre ses hos er eller hos oss i Alby, hör av er så hittar vi en tid.',
    /** Instruktion i contact_only. */
    instructionContact:
      'Skicka ett mejl med några tider som passar er, så återkommer jag och bekräftar en tid. Vill ni hellre ses hos er eller hos oss i Alby, skriv det i mejlet.',
    openInNewWindow: 'Öppna bokningen i ett nytt fönster',
    embedTitle: 'Bokningskalender för ett samtal på 30 minuter med Yacine Laghmari',
    embedLoadLabel: 'Visa lediga tider',
    embedFallback:
      'Kalendern kunde inte visas här. Använd länken ovan för att öppna bokningen i ett nytt fönster.',
    contactHeading: 'Kontakt',
  },
  faq: {
    id: 'fragor',
    heading: 'Vanliga frågor',
    items: [
      {
        q: 'Behöver vi rekrytera just nu?',
        a: 'Nej. Vi vill också förstå era framtida behov och vilka kunskaper som blir viktiga i er verksamhet.',
      },
      {
        q: 'Vilka riktar sig Miljonkraft Botkyrka till?',
        a: 'Det planerade projektet riktar sig till unga mellan 16 och 28 år som står utanför arbete och studier.',
      },
      {
        q: 'Har projektet startat?',
        a: 'Miljonbemanning och Botkyrka kommun har tecknat samarbetsavtal. Projektet startar om Svenska ESF-rådet beviljar stöd.',
      },
    ],
  },
  footer: {
    name: 'Miljonkraft Botkyrka',
    byline: 'Ett initiativ från Miljonbemanning',
    links: [
      { label: 'Kontakt', href: '#boka', external: false },
      { label: 'Miljonbemanning', href: 'https://miljonbemanning.se', external: true },
      { label: 'Integritet', href: '/integritet/', external: false },
    ],
    skipLink: 'Hoppa till innehållet',
  },
  notFound: {
    title: 'Sidan finns inte',
    text: 'Adressen leder ingenstans. Startsidan samlar allt om Miljonkraft Botkyrka och hur ni når Yacine.',
    linkLabel: 'Till startsidan',
  },
} as const;
