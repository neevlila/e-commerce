import React from 'react';
import { SEOHead } from '../../components/seo/SEOHead';

export const PrivacyPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl prose dark:prose-invert">
      <SEOHead title="Privacy Policy" />
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <p>At StyleHub, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.</p>

      <h3>1. Information We Collect</h3>
      <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This may include your name, email address, shipping address, and payment information.</p>

      <h3>2. How We Use Your Information</h3>
      <p>We use your information to process orders, provide customer support, and send you updates about your order. We do not sell your personal data to third parties.</p>

      <h3>3. Data Security</h3>
      <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access or disclosure.</p>

      <h3>4. Cookies</h3>
      <p>We use cookies to improve your browsing experience and analyze site traffic. You can control cookie settings through your browser.</p>

      <h3>5. Contact Us</h3>
      <p>If you have any questions about this Privacy Policy, please contact us at privacy@techstore.com.</p>
    </div>
  );
};
