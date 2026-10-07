import { contact, organization, site } from '../config/site';

/**
 * Litet, korrekt JSON-LD-underlag med stabila identifierare.
 * Miljonkraft beskrivs som webbplats och sida, inte som egen juridisk organisation.
 * Avsändare och utgivare är Miljonbemanning. Kommunen är samarbetspart och anges inte som samma organisation.
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
        about: { '@id': orgId },
        dateModified: site.lastModified,
        primaryImageOfPage: `${base}${site.meta.ogImage}`,
      },
      {
        '@type': 'Person',
        '@id': personId,
        name: contact.name,
        jobTitle: contact.role,
        email: `mailto:${contact.email}`,
        telephone: contact.phoneE164,
        worksFor: { '@id': orgId },
      },
    ],
  };
}
