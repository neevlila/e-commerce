import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'StyleHub - Premium Electronics & Gear',
  description = 'Upgrade your workspace with our premium selection of electronics, wireless headphones, ergonomic office gear, and smart wearables.',
  image = 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&q=80',
  url = window.location.href,
}) => {
  const siteTitle = title === 'StyleHub - Premium Electronics & Gear' ? title : `${title} | StyleHub`;

  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
};
