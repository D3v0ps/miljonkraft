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
  /** Verkligt ändringsdatum för startsidan (ISO-datum). Uppdateras manuellt vid innehållsändring. */
  lastModified: '2026-10-08',
  /** Ändringsdatum för integritetssidan, som har eget innehåll. */
  privacyModified: '2026-10-07',
  /** Årtal i sidfoten. */
  copyrightYear: 2026,
  meta: {
    title: 'Miljonkraft Botkyrka | När människor och möjligheter möts',
    description:
      'Miljonkraft Botkyrka kopplar lokala företag med människor som vill arbeta och utvecklas. Ett initiativ från Miljonbemanning med rötterna i Alby.',
    ogImage: '/og.png',
    ogImageAlt:
      'När människor och möjligheter hittar varandra, växer en plats. Bredvid rubriken en illustration av ett solbelyst torg där människor möts. Miljonkraft Botkyrka, ett initiativ från Miljonbemanning.',
    themeColor: '#FFF9F2',
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
  /** Ur Miljonbemannings mejlsignatur. */
  description: 'Miljonbemanning är ett kompetensföretag med mål att göra samhället till en bättre plats för alla.',
  /** Huvudkontoret enligt miljonbemanning.se/sv/contact/ (kontrollerat 2026-10-07). */
  address: { street: 'Albyvägen 3', postalCode: '145 57', locality: 'Norsborg', country: 'SE' },
  foundingYear: 2012,
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
  meetingFormatLine: 'Digitalt via Teams, 30 minuter',
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
  /** Inbjudans ankare. Med snedstreck så att länken också fungerar från undersidorna. */
  invitationHref: '/#samtal',
} as const;

/**
 * Sidans berättelse i nio kapitel. All synlig text på startsidan står här.
 * Ordbudget enligt briefen: 350 till 500 synliga ord på hela startsidan (kontrolleras av scripts/verify.mjs).
 */
export const copy = {
  idea: {
    id: 'ide',
    headline: 'När människor och möjligheter hittar varandra, växer en plats.',
    lead: 'Miljonkraft Botkyrka för samman lokala företag med människor som vill arbeta och utvecklas. Ett initiativ från Miljonbemanning.',
    readMore: 'Läs vår idé',
    readMoreHref: '#harifran',
  },
  origin: {
    id: 'harifran',
    heading: 'Vi kommer härifrån.',
    body: 'Miljonbemannings resa började i Alby 2012. Vi såg människor med erfarenhet, ambition och förmåga som arbetsmarknaden inte alltid såg. Så vi byggde en verksamhet kring en enkel övertygelse.',
    conviction: ['Potential finns överallt.', 'Möjligheten gör det inte.'],
  },
  cycle: {
    id: 'kretslopp',
    heading: 'Ett lokalt kretslopp av möjligheter.',
    /** Ordning i läsriktning. Mitten bär Miljonkraft. */
    nodes: ['Invånare', 'Miljonkraft', 'Lokala företag'],
    figureLabel: 'Invånare och lokala företag i ett kretslopp med Miljonkraft i mitten.',
    line: 'Ju bättre vi förstår företagen omkring oss, desto bättre kan vi utveckla människor för möjligheter som faktiskt finns.',
  },
  model: {
    id: 'miljonmodellen',
    theory: 'Vi utvecklar inte människor för en arbetsmarknad i teorin.',
    reality: 'Vi utvecklar dem för arbete som finns på riktigt.',
    name: 'Miljonmodellen',
    intro: 'Åtta steg från första kontakt till nästa steg i arbetslivet.',
    /** Namnen är fasta och ändras inte. */
    steps: ['Nå', 'Förstå', 'Rikta', 'Bevisa', 'Utveckla', 'Övergå', 'Bära', 'Växa'],
  },
  career: {
    id: 'karriarstegen',
    heading: 'Första jobbet är början.',
    name: 'Karriärstegen',
    note: 'Ett exempel på en möjlig väg inom lager och logistik.',
    /** Illustration, ingen resultatberättelse och ingen garanterad väg. */
    path: ['Lager', 'Truck och lagersystem', 'Koordinator', 'Transportplanering'],
    line: ['Ett arbete kan lösa dagen.', 'En riktning kan förändra framtiden.'],
  },
  value: {
    id: 'nytta',
    left: 'Affärsnytta',
    right: 'Samhällsnytta',
    statement: 'Det ena behöver inte ske på bekostnad av det andra.',
    body: 'Vår modell har vuxit därför att människors utveckling också kan skapa verkligt värde för företagen.',
  },
  proof: {
    id: 'bevis',
    heading: 'Byggt i Alby. Bevisat i verkligheten.',
    /** Högst tre bevis. Verifierade uppgifter, se docs/HANDOVER.md. */
    items: [
      { value: '2012', title: 'Rötterna i Alby', text: 'Miljonbemanning har funnits i Alby sedan 2012.' },
      { value: '2023', title: 'SvD Affärsbragd', text: 'Utmärkelsen gick till grundarna Ali Khalil, Saleh Karrani och Shafik Muwanga.' },
      {
        value: '12',
        title: 'Förstahandsleverantör i alla tolv områden',
        text: 'Enligt Botkyrka kommuns tilldelningsbeslut den 27 augusti 2026 i upphandlingen av yrkesförberedande och yrkesinriktade insatser.',
      },
    ],
  },
  direction: {
    id: 'riktning',
    label: 'Vår riktning',
    heading: 'Botkyrka ska ha Sveriges lägsta arbetslöshet.',
    text: 'Det är inte ett löfte om en siffra. Det är riktningen vi väljer att arbeta mot.',
    beyond: 'Botkyrka först. Det vi lär oss här kan leva vidare långt utanför kommunens gränser.',
  },
  invitation: {
    id: 'samtal',
    heading: 'Berätta vad ni behöver. Vi börjar där.',
    intro: [
      'Jag heter Yacine Laghmari och arbetar med affärs- och samhällsutveckling på Miljonbemanning.',
      'På 30 minuter berättar ni om er verksamhet och vad ni behöver framöver. Ni behöver inte ha en ledig tjänst.',
    ],
    /** Instruktion när riktig bokning finns (external_link eller shared_embed). */
    instructionReal: 'Välj en tid som passar. Vill ni hellre ses hos er eller hos oss i Alby, hör av er.',
    /** Instruktion i contact_only. Säger vad knappen gör. */
    instructionContact: 'Knappen öppnar ett mejl till mig. Skriv några tider som passar, så bekräftar jag en av dem.',
    openInNewWindow: 'Öppna bokningen i ett nytt fönster',
    embedTitle: 'Bokningskalender för ett samtal på 30 minuter med Yacine Laghmari',
    embedLoadLabel: 'Visa lediga tider',
    embedFallback: 'Kalendern kunde inte visas här. Använd länken ovan för att öppna bokningen i ett nytt fönster.',
  },
  film: {
    /**
     * Filmen är gjord för affischversionen (versaler, kort, numrerade steg, lagerbilder) och står i en
     * annan ton än berättelsen. Den visas inte på startsidan förrän den gjorts om. Filerna ligger kvar i public/film.
     */
    showOnHome: false,
    linkLabel: 'Se filmen',
    title: 'Miljonkraft på en minut',
    close: 'Stäng',
  },
  footer: {
    byline: 'Miljonkraft Botkyrka är ett initiativ från Miljonbemanning.',
    links: [
      { label: 'Miljonbemanning', href: 'https://miljonbemanning.se', external: true },
      { label: 'Integritet', href: '/integritet/', external: false },
    ],
    skipLink: 'Hoppa till innehållet',
  },
  notFound: {
    title: 'Sidan finns inte',
    text: 'Adressen leder ingenstans. Berättelsen om Miljonkraft Botkyrka finns på startsidan.',
    linkLabel: 'Till startsidan',
  },
} as const;

/**
 * Illustrationen kommer från Yacines förhandsversion av Miljonkraft (assets-src/illustration/torg.webp).
 * Utsnitten skapas med scripts/build-images.mjs. Den visas alltid märkt som illustration.
 */
export const images = {
  /** Heron: stående utsnitt av torget i valvform. */
  torg: {
    src: '/img/torg-valv',
    w: 680,
    h: 800,
    widths: [480, 680],
    alt: 'Ett solbelyst torg mellan flerfamiljshus, med träd, en fontän och människor som möts, vilar och går förbi.',
    caption: 'Illustration',
  },
  /** Inbjudan: närbild på två personer som samtalar, ur samma illustration. */
  samtal: {
    src: '/img/torg-samtal-400',
    w: 400,
    h: 470,
    alt: 'Utsnitt ur illustrationen av torget: två personer står och samtalar.',
  },
} as const;
