import React from 'react';
import { SEOHead } from '../../components/seo/SEOHead';

export const FAQPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <SEOHead title="FAQ" description="Frequently Asked Questions" />
      <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
      
      <div className="space-y-6">
        {[
            { q: "How do I track my order?", a: "Once your order ships, you will receive an email with a tracking number and link to track your package." },
            { q: "What is your return policy?", a: "We offer a 7-day return policy for all unused items in original packaging. Please contact support to initiate a return." },
            { q: "Do you ship internationally?", a: "Currently, we only ship within India. We are working on expanding to other countries soon." },
            { q: "Are the products authentic?", a: "Yes, all our products are 100% authentic and sourced directly from manufacturers or authorized distributors." },
            { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards, UPI, and Net Banking via our secure payment gateway." }
        ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-border">
                <h3 className="font-semibold text-lg mb-2">{item.q}</h3>
                <p className="text-muted-foreground">{item.a}</p>
            </div>
        ))}
      </div>
    </div>
  );
};
