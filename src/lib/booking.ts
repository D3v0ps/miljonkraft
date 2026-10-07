import { booking, contact, copy, nav, type BookingMode } from '../config/site';

export interface ResolvedBooking {
  mode: BookingMode;
  /** Sant när en riktig bokningstjänst är ansluten. */
  isReal: boolean;
  /** Kort etikett (navigation, fast mobilknapp). */
  ctaShort: string;
  /** Full knapptext där den ryms. */
  ctaFull: string;
  /** Instruktion i bokningssektionen. */
  instruction: string;
  /** Adress som alla huvudknappar leder till. */
  href: string;
  /** Extra länkattribut för huvudknappen. */
  external: boolean;
  /** Publik bokningssida för reservlänken utanför en inbäddning. */
  publicUrl: string;
  embedUrl: string;
  embedHeightPx: number;
  /** Visas bara när riktig bokning finns. */
  formatLine: string | null;
  /**
   * Analysnamn för klick på huvudknappen. Mäts aldrig som genomförd bokning.
   * booking_open: öppnar bokningstjänsten. booking_section: skrollar till inbäddningen. contact_open: öppnar mejlförslag.
   */
  openEvent: 'booking_open' | 'booking_section' | 'contact_open';
}

function encodeMailto(to: string, subject: string, body: string): string {
  const params = new URLSearchParams();
  params.set('subject', subject);
  params.set('body', body.replace(/\n/g, '\r\n'));
  // URLSearchParams kodar mellanslag som +, vilket mejlklienter inte tolkar. Använd %20.
  return `mailto:${to}?${params.toString().replace(/\+/g, '%20')}`;
}

function assertUrl(value: string, name: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(
      `booking.${name} saknas eller är ogiltig för bokningsläget "${booking.mode}". ` +
        'Kopiera adressen från den publicerade bokningstjänsten eller sätt mode till "contact_only".',
    );
  }
  if (parsed.protocol !== 'https:') {
    throw new Error(`booking.${name} måste använda https.`);
  }
  return parsed.toString();
}

export function resolveBooking(): ResolvedBooking {
  const mode = booking.mode;
  const section = copy.invitation;

  if (mode === 'contact_only') {
    return {
      mode,
      isReal: false,
      // Knappen bokar inget i det här läget och får därför aldrig heta Boka.
      ctaShort: 'Föreslå samtal',
      ctaFull: 'Föreslå ett 30-minuters samtal',
      instruction: section.instructionContact,
      href: encodeMailto(contact.email, booking.mail.subject, booking.mail.body),
      external: false,
      publicUrl: '',
      embedUrl: '',
      embedHeightPx: booking.embedHeightPx,
      formatLine: null,
      openEvent: 'contact_open',
    };
  }

  const publicUrl = assertUrl(booking.publicUrl, 'publicUrl');
  const embedUrl = mode === 'shared_embed' ? assertUrl(booking.embedUrl, 'embedUrl') : '';

  return {
    mode,
    isReal: true,
    ctaShort: 'Boka 30 min',
    ctaFull: `Boka 30 min med ${contact.firstName}`,
    instruction: section.instructionReal,
    href: mode === 'external_link' ? publicUrl : nav.invitationHref,
    external: mode === 'external_link',
    publicUrl,
    embedUrl,
    embedHeightPx: booking.embedHeightPx,
    formatLine: booking.meetingFormatLine,
    openEvent: mode === 'shared_embed' ? 'booking_section' : 'booking_open',
  };
}

export const mailtoHref = encodeMailto(contact.email, booking.mail.subject, booking.mail.body);
