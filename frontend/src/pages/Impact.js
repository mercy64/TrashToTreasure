import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ImpactChart from '../components/ImpactChart';

const useCountUp = (end, duration = 800) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    if (!end) return;
    const stepTime = Math.max(10, Math.floor(duration / end));
    const handle = setInterval(() => {
      start += Math.max(1, Math.round(end / (duration / 50)));
      if (start >= end) {
        setValue(end);
        clearInterval(handle);
      } else {
        setValue(start);
      }
    }, 50);
    return () => clearInterval(handle);
  }, [end, duration]);
  return value;
};

const StatCard = ({ value, label, color = 'text-gray-800', ariaLabel }) => {
  const numeric = typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, ''), 10) || 0 : value;
  const count = useCountUp(numeric, 900);
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm text-center transform transition-opacity duration-700 ease-in-out opacity-0 animate-fade-in" tabIndex={0} aria-label={ariaLabel}>
      <div className={`text-3xl font-bold ${color}`}>{numeric ? count : value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
};

// keyframes added via Tailwind utilities or global CSS; fallback class used above

const Impact = () => (
  <div className="max-w-6xl mx-auto py-12 px-4">
    <header className="mb-8">
      <h1 className="text-4xl font-extrabold">Our Impact — what we measure and why it matters</h1>
      <p className="text-gray-700 mt-3 max-w-3xl">We capture economic, environmental and social impact so you can see real outcomes from materials diverted, income created, and emissions avoided. Below you'll find live metrics, visual trends, and practical stories showing how the platform creates value.</p>
    </header>

    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" aria-label="Key metrics">
      <StatCard value={'120000'} label={'Payments processed (GHS)'} color={'text-green-600'} ariaLabel={'Payments processed total'} />
      <StatCard value={'85000'} label={'Materials diverted (kg)'} color={'text-blue-600'} ariaLabel={'Materials diverted in kilograms'} />
      <StatCard value={'240'} label={'Local jobs supported'} color={'text-purple-600'} ariaLabel={'Number of local jobs supported'} />
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Trends over the last 12 months</h2>
      <div className="bg-white p-4 rounded shadow-sm">
        <ImpactChart />
      </div>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Success stories — practical outcomes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="bg-white p-4 rounded shadow-sm">
          <h3 className="font-semibold">Small factory saves on disposal costs</h3>
          <p className="text-gray-600 text-sm">A manufacturing unit listed 500kg of mixed plastic and found regular buyers through our platform. They reduced monthly disposal costs by 60% and now divert materials to local recyclers.</p>
        </article>
        <article className="bg-white p-4 rounded shadow-sm">
          <h3 className="font-semibold">Recycler scales operations</h3>
          <p className="text-gray-600 text-sm">A recycler secured steady supplies from 20 new generators and increased monthly revenue by 40%, enabling investment in sorting infrastructure and local jobs.</p>
        </article>
      </div>
    </section>

    <section className="mt-6">
      <h2 className="text-2xl font-semibold mb-3">Want this level of visibility?</h2>
      <p className="text-gray-700 mb-4">Contact our partnerships team for custom impact reports, CSV exports, or integration into your sustainability dashboards.</p>
      <div className="flex gap-3">
        <Link to="/contact" className="bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">Contact partnerships</Link>
        <Link to="/signup" className="border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-400">Create an account</Link>
      </div>
    </section>
  </div>
);

export default Impact;
