import { Helmet } from "react-helmet-async"
import config from "@/config.json"

interface SEOProps {
  title?: string
  description?: string
  path?: string
  image?: string
  type?: string
}

const SITE_URL = "https://cynexcloud.eu.cc"
const DEFAULT_TITLE = config.seo.title
const DEFAULT_DESC = config.seo.description
const DEFAULT_IMAGE = `${SITE_URL}/images/main-imgs/cynex-tp.png`

export default function SEO({
  title,
  description,
  path = "/",
  image,
  type = "website"
}: SEOProps) {
  const fullTitle = title ? `${title} | Cynex Cloud` : DEFAULT_TITLE
  const url = `${SITE_URL}${path}`
  const img = image || DEFAULT_IMAGE

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Cynex Cloud",
    url: SITE_URL,
    logo: "https://i.imgur.com/htv4fVV.jpeg",
    description: DEFAULT_DESC,
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@yourdomain.com",
      contactType: "customer support"
    }
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Cynex Cloud",
    url: SITE_URL
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || DEFAULT_DESC} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || DEFAULT_DESC} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:site_name" content="Cynex Cloud" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || DEFAULT_DESC} />
      <meta name="twitter:image" content={img} />
      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
    </Helmet>
  )
}

export { SITE_URL, DEFAULT_TITLE, DEFAULT_DESC, DEFAULT_IMAGE }
