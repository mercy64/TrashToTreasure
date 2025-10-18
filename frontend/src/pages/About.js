import React from 'react';
import { Link } from 'react-router-dom';

const Step = ({ n, title, children }) => (
  <div className="flex gap-4">
    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">{n}</div>
    <div>
      <h4 className="font-semibold">{title}</h4>
      <div className="text-gray-600 text-sm mt-1">{children}</div>
    </div>
  </div>
);

const About = () => (
  <div className="max-w-4xl mx-auto py-12 px-4">
    <header className="mb-6">
      <h1 className="text-4xl font-extrabold">We turn waste into value</h1>
      <p className="text-gray-700 mt-2">TrashToTreasure makes it simple for businesses and communities to list, sell and collect recyclable materials—while tracking the income, jobs and emissions avoided along the way.</p>
    </header>

    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-3">How it works — three simple steps</h2>
      <div className="space-y-4">
        <Step n={1} title="List or request pickup">Create a quick listing for materials, or request a scheduled pickup for recurring flows.</Step>
        <Step n={2} title="Match and transact">Get matched with verified recyclers, agree price, and complete payment through the platform.</Step>
        <Step n={3} title="Track impact">See how much material was diverted, revenue created, and CO2 avoided in your impact dashboard.</Step>
      </div>
    </section>

    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-3">Why organisations use us</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li><strong>Reduce disposal costs</strong> — convert waste into revenue or lower disposal fees.</li>
        <li><strong>Verified supply</strong> — reliable sources and vetted recyclers reduce uncertainty.</li>
        <li><strong>Reporting</strong> — automated impact metrics and exports for compliance and sustainability reporting.</li>
      </ul>
    </section>

    <section className="mt-6">
      <h2 className="text-2xl font-semibold mb-3">Get started</h2>
      <div className="flex gap-3">
        <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label="Create an account">Create an account</Link>
        <Link to="/contact" className="border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-400" aria-label="Contact partnerships">Contact partnerships</Link>
      </div>
    </section>
  </div>
);

export default About;
