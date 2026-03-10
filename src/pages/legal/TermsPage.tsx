import React from 'react';
import { SEOHead } from '../../components/seo/SEOHead';

export const TermsPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl prose dark:prose-invert">
      <SEOHead title="Terms of Service" />
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <h3>1. Acceptance of Terms</h3>
      <p>By accessing or using StyleHub, you agree to be bound by these Terms of Service.</p>

      <h3>2. Use of Service</h3>
      <p>You agree to use our service only for lawful purposes and in accordance with these Terms. You must not use our service in any way that violates any applicable local, national, or international law.</p>

      <h3>3. Product Information</h3>
      <p>We strive to display product colors and images accurately, but we cannot guarantee that your monitor's display will be accurate. Prices and availability are subject to change without notice.</p>

      <h3>4. User Accounts</h3>
      <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>

      <h3>5. Limitation of Liability</h3>
      <p>StyleHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
    </div>
  );
};
