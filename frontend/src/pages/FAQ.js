import React from 'react';

const faqs = [
  { q: 'How do I list my waste?', a: 'Create an account, go to "Create Listing", fill the details and publish. Include clear photos and accurate quantities to get faster responses.' },
  { q: 'How are prices determined?', a: 'Prices are set by sellers but we provide pricing guidance based on recent trades and recommended price ranges per material.' },
  { q: 'How do pickups work?', a: 'Once a buyer or collector accepts a listing, pickup is coordinated through our route system; you can schedule a preferred pickup window.' },
  { q: 'Is the platform secure?', a: 'Yes. We verify partners, support secure payment flows, and provide dispute resolution channels for transactions.' },
  { q: 'Can I become a verified recycler or collector?', a: 'Yes — register and complete the verification steps in your profile. Verification improves trust and visibility.' },
];

const FAQ = () => (
  <div className="max-w-4xl mx-auto py-12 px-4">
    <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
    <div className="space-y-4">
      {faqs.map((f, i) => (
        <details key={i} className="bg-white p-4 rounded shadow-sm">
          <summary className="font-semibold cursor-pointer">{f.q}</summary>
          <p className="mt-2 text-gray-700">{f.a}</p>
        </details>
      ))}
    </div>
  </div>
);

export default FAQ;
