import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Fohow Eden Life';
const DOMAIN = 'https://fohowedenlife.co.ke';
const DEFAULT_IMAGE = `${DOMAIN}/logo.png`;

/**
 * Reusable SEO component for per-page meta tags.
 * 
 * @param {string} title    – Page title (appended with site name)
 * @param {string} description – Meta description (max ~155 chars)
 * @param {string} path     – URL path e.g. "/shop"
 * @param {string} image    – OG image URL (optional, defaults to logo)
 * @param {string} type     – OG type (optional, defaults to "website")
 * @param {object} jsonLd   – JSON-LD structured data object (optional)
 */
const SEO = ({ title, description, path = '', image, type = 'website', jsonLd }) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — TCM Wholesale & Healthcare Portal Kenya`;
  const canonicalUrl = `${DOMAIN}${path}`;
  const ogImage = image || DEFAULT_IMAGE;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export { SEO, DOMAIN, SITE_NAME };
export default SEO;
