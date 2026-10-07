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
  /**
   * Produktionsadress. Används för canonical, Open Graph, sitemap och JSON-LD.
   * www är primär domän enligt Karims beslut 2026-10-07. Vercel omdirigerar miljonkraft.se hit.
   * Byts primär domän i Vercel ska adressen här och i public/robots.txt ändras samtidigt.
   */
  url: 'https://www.miljonkraft.se',
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
      'Miljonkraft Botkyrka för samman lokala företag och människor. Vi öppnar dörrar till arbete och ger företag kraft att växa. Ett initiativ från Miljonbemanning.',
    ogImage: '/og.png',
    ogImageAlt:
      'Miljonkraft Botkyrka. Fler i arbete. Starkare företag. Ett starkare Botkyrka. Ett initiativ från Miljonbemanning.',
    themeColor: '#D7E5EB',
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
    label: 'Samhällskraft i Botkyrka',
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
      'Miljonbemanning och Botkyrka kommun har tecknat samarbetsavtal om Miljonkraft Botkyrka.',
  },
  /**
   * Positionering enligt Miljonbemanning (Karim, 2026-10-07). Sidan ska inte läsas som ett bemanningsföretag.
   * Miljonkraft är en samhällskraft som för samman lokala företag och människor.
   */
  manifest: {
    id: 'samhallskraft',
    label: 'Vilka vi är',
    intro: 'Vi är en',
    word: 'Samhällskraft',
    rest: 'som för samman lokala företag och människor.',
    /** Tre meningar. Den fetade delen markeras med asterisker. */
    lines: [
      { art: 'door', text: 'Vi öppnar *dörrar till arbete*.' },
      { art: 'growth', text: 'Vi ger företag *kraft att växa*.' },
      { art: 'city', text: 'Vi bygger ett samhälle där *fler får möjlighet att bidra*.' },
    ],
  },
  /** Bevisen samlade i ett kapitel direkt efter Samhällskraft: kommunens citat, fakta, juryns motivering, utmärkelser och avtalet. */
  proof: {
    id: 'kommunen',
    label: 'Kommunen om arbetet i Alby',
  },
  companies: {
    id: 'for-foretag',
    heading: 'Vi vill förstå vad ni behöver',
    questions: [
      'Vilka arbetsuppgifter väntar hos er framöver?',
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
      'I dag för vi samman lokala företag och människor och arbetar med kompetensutveckling. För oss hör företagens utveckling och människors möjligheter ihop.',
    ],
    label: 'Där allt började',
    facts: [
      { value: '2012', text: 'Starten i Alby' },
      { value: '5', text: 'Utmärkelser till oss och våra grundare' },
      { value: '2023', text: 'SvD Affärsbragd till våra grundare' },
    ],
    /** Verifierade citat ur publika källor. Ändra aldrig ordalydelsen. */
    quotes: [
      {
        featured: false,
        text: 'Genom att leta efter talangerna på platser som valts bort av andra startade de en entreprenörsresa som är en på miljonen.',
        who: 'Juryns motivering',
        context: 'SvD Affärsbragd 2023',
        source: 'https://www.botkyrka.se/naringsliv-och-foretag/naringslivet-i-botkyrka/naringslivsnyheter/2023-05-31-miljonbemanning-fick-medalj-av-prinsen',
      },
      {
        /** Lyfts fram som eget affischcitat i sektionen Kommunen (src/components/Proof.astro). */
        featured: true,
        text: 'Det som de har gjort i Alby är fantastiskt för den stadsdelen, men också för Botkyrka och hela Stockholmsregionen.',
        who: 'Emanuel Ksiazkiewicz (S), kommunstyrelsens ordförande',
        context: 'Om SvD Affärsbragd till Miljonbemannings grundare. Botkyrka kommun, 31 maj 2023',
        source: 'https://www.botkyrka.se/naringsliv-och-foretag/naringslivet-i-botkyrka/naringslivsnyheter/2023-05-31-miljonbemanning-fick-medalj-av-prinsen',
      },
    ],
    sourceLabel: 'Källa botkyrka.se',
    awardsLabel: 'Utmärkelserna',
    /** Avslutar bevisen. Avtalet står som eget slag efter utmärkelserna. */
    agreementLabel: 'Samarbetsavtal',
    awards: ['SvD Affärsbragd 2023', 'Årets Nybyggare', 'Årets Unga Pionjär', 'Årets Unga Företagare i Stockholm', 'Giraffpriset'],
  },
  vision: {
    id: 'vision',
    heading: 'Vi vill mer för Botkyrka',
    label: 'Vår långsiktiga vision',
    /** Utdrag ur visionsmeningen, satt som affischtext. Hela meningen står i texten. */
    poster: ['Sveriges lägsta', 'arbetslöshet'],
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
    bigNumber: '30',
    bigUnit: 'minuter',
  },
  film: {
    id: 'filmen',
    label: 'Filmen',
    heading: 'Miljonkraft på en minut',
    play: 'Spela filmen med ljud',
    pause: 'Pausa filmen',
    mute: 'Stäng av ljudet',
    unmute: 'Slå på ljudet',
    textToggle: 'Läs filmens text',
    note: 'Musiken är skapad för filmen. Ljudet startar bara när ni trycker på spela.',
  },
  faq: {
    id: 'fragor',
    heading: 'Vanliga frågor',
    items: [
      {
        q: 'Måste vi ha en ledig tjänst?',
        a: 'Nej. Vi vill också förstå era framtida behov och vilka kunskaper som blir viktiga i er verksamhet.',
      },
      {
        q: 'Vilka riktar sig Miljonkraft Botkyrka till?',
        a: 'Det planerade projektet riktar sig till unga mellan 16 och 28 år som står utanför arbete och studier.',
      },
      {
        q: 'Hur går samtalet till?',
        a: 'Vi pratar i 30 minuter om ert företag och vad ni behöver framöver. Vi kan ses digitalt, hos er eller hos oss i Alby.',
      },
    ],
  },
  footer: {
    /** Miljonbemannings devis enligt grafiska profilen (logotyp med text). */
    devise: 'Framtiden är nu.',
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

/**
 * Bilder ur Miljonbemannings bildbank i SharePoint (Marknad & Kommunikation › Bilder › BILDBANK).
 * Originalen ligger i assets-src/bildbank och bearbetas med scripts/build-images.mjs.
 */
export const images = {
  kontor: { src: '/img/kontor', w: 1400, h: 788, alt: 'En skrattande person vid ett möte i ett ljust kontor.', file: 'MB_bildbank_6.jpg' },
  lager: { src: '/img/lager', w: 1200, h: 675, alt: 'En truck i ett lager med pallar och skivmaterial.', file: 'MB_bildbank_9.jpg' },
  transport: { src: '/img/transport', w: 1200, h: 675, alt: 'Förarplatsen i en lastbil i motljus på väg ut.', file: 'MB_bildbank_10.jpg' },
  mbVast: { src: '/img/mb-vast', w: 1400, h: 788, alt: 'Ryggen på en väst med Miljonbemannings märke MB med röd punkt.', file: 'MB_bildbank_33.jpg' },
  /** Stående beskärningar (scripts/build-images.mjs) för höga paneler. */
  mbVastPortrait: { src: '/img/mb-vast-portrait', w: 864, h: 1080, widths: [600, 864], fallback: '/img/mb-vast-portrait.jpg', alt: 'Ryggen på en väst med Miljonbemannings märke MB med röd punkt.' },
  transportPortrait: { src: '/img/transport-portrait', w: 648, h: 1080, widths: [420, 648], fallback: '/img/transport-portrait.jpg', alt: 'Förarplatsen i en lastbil i motljus på väg ut.' },
  lagerPortrait: { src: '/img/lager-portrait', w: 648, h: 1080, widths: [420, 648], fallback: '/img/lager-portrait.jpg', alt: 'En truck i ett lager med pallar och skivmaterial.' },
} as const;
