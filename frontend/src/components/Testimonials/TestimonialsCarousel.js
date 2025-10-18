import React, { useEffect, useState, useRef } from 'react';

const fallback = [
  { name: 'Amina N.', role: 'Factory Manager', text: 'We reduced waste disposal costs by 40% after listing on TrashToTreasure.' },
  { name: 'David O.', role: 'Recycler', text: 'Reliable supplies and easy pickups — this platform transformed our operations.' },
];

const TestimonialsCarousel = ({ apiUrl='/api/testimonials' }) => {
  const [items, setItems] = useState(fallback);
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetch(apiUrl)
      .then((r) => r.json())
      .then((data) => { if (mounted && Array.isArray(data) && data.length) setItems(data); })
      .catch(() => {/* ignore */});
    return () => { mounted = false; };
  }, [apiUrl]);

  useEffect(() => {
    timer.current = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(timer.current);
  }, [items.length]);

  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  return (
    <div className="relative">
      <div className="bg-white/10 p-4 rounded-lg min-h-[100px]">
        <div className="italic text-sky-100/90">"{items[index].text}"</div>
        <div className="mt-3 font-semibold text-white">{items[index].name}</div>
        <div className="text-sm text-sky-100/80">{items[index].role}</div>
      </div>

      <div className="absolute right-2 top-2 flex gap-2">
        <button onClick={prev} className="bg-white/10 p-1 rounded">◀</button>
        <button onClick={next} className="bg-white/10 p-1 rounded">▶</button>
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
