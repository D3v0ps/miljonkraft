// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { site } from './src/config/site.ts';

// Produktionsadressen styrs från src/config/site.ts (site.url).
// Förhandsvisningar ska inte bli canonical: sätt PUBLIC_NOINDEX=1 vid preview-bygg,
// då skrivs noindex i HTML (se BaseLayout.astro) och sitemap/robots pekar ändå på produktion.
export default defineConfig({
  site: site.url,
  trailingSlash: 'always',
  compressHTML: true,
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      serialize(item) {
        // Verkligt ändringsdatum för innehållet. Uppdateras manuellt i site.ts
        // när innehållet faktiskt ändras, inte vid varje bygge.
        item.lastmod = site.lastModified;
        return item;
      },
    }),
  ],
});
