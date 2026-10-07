import { contact, organization, site } from '../config/site';

/**
 * Litet, sanningsenligt JSON-LD-underlag med stabila identifierare.
 * Miljonkraft beskrivs som webbplats och sida, inte som egen juridisk organisation.
 * Avsändare och utgivare är Miljonbemanning. Kommunen är samarbetspart och anges inte.
 * Ingen FAQ-markering, eftersom sidan inte har några synliga frågor och svar.
 */
export function buildJsonLd() {
  const base = site.url.replace(/\/$/, '');
  const pageUrl = `${base}/`;
  const orgId = `${organization.url}/#organization`;
  const siteId = `${pageUrl}#website`;
  const pageId = `${pageUrl}#webpage`;
  const personId = `${pageUrl}#yacine-laghmari`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: organization.name,
        url: organization.url,
        description: organization.description,
        foundingDate: String(organization.foundingYear),
        address: {
          '@type': 'PostalAddress',
          streetAddress: organization.address.street,
          postalCode: organization.address.postalCode,
          addressLocality: organization.address.locality,
          addressCountry: organization.address.country,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Miljonkraft Botkyrka',
          name: contact.name,
          email: contact.email,
          telephone: contact.phoneE164,
          areaServed: 'Botkyrka',
          availableLanguage: 'sv',
        },
        sameAs: [...organization.sameAs],
      },
      {
        '@type': 'WebSite',
        '@id': siteId,
        url: pageUrl,
        name: site.name,
        alternateName: site.shortName,
        inLanguage: site.lang,
        publisher: { '@id': orgId },
      },
      {
        '@type': 'WebPage',
        '@id': pageId,
        url: pageUrl,
        name: site.meta.title,
        description: site.meta.description,
        inLanguage: site.lang,
        isPartOf: { '@id': siteId },
        publisher: { '@id': orgId },
        dateModified: site.lastModified,
        primaryImageOfPage: `${base}${site.meta.ogImage}`,
      },
      {
        '@type': 'Person',
        '@id': personId,
        name: contact.name,
        jobTitle: contact.role,
        email: contact.email,
        telephone: contact.phoneE164,
        worksFor: { '@id': orgId },
      },
    ],
  };
}
