import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import api from '../services/api';

const Brand = {
  primary: '#0369a1', // deep cyan/blue
  accent: '#f59e0b', // amber
  muted: '#94a3b8',
  bar: '#60a5fa',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white p-2 rounded shadow text-sm" role="tooltip">
      <div className="font-semibold">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex justify-between">
          <span className="text-gray-700">{p.name}</span>
          <span className="font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const renderLegend = (props) => {
  const { payload } = props;
  return (
    <div className="flex gap-3 items-center text-sm" aria-hidden>
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-2">
          <span style={{ width: 12, height: 12, background: entry.color, display: 'inline-block', borderRadius: 3 }} />
          <span className="text-gray-700">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const ImpactChart = () => {
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/api/waste/stats/');
        if (!mounted) return;
        setTotals(res.data);
        setData((res.data.monthly_collections || []).map((m) => ({
          month: m.month,
          collections: m.collections,
          materials_kg: m.materials_kg,
        })));
      } catch (err) {
        console.error('Failed to fetch impact stats', err);
        setError(err?.response?.data?.error || err.message || 'Failed to fetch stats');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 1000 * 60 * 5); // refresh every 5 minutes
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) return <div className="p-6 text-center">Loading impact chart...</div>;
  // If there's an error fetching impact data we intentionally render nothing
  // to avoid showing an intrusive error message on the public pages.
  if (error) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Impact over time</h3>
          <p className="text-sm text-gray-600">Collections and materials recovered (kg) by month</p>
        </div>
        {totals && (
          <div className="text-right text-xs">
            <div className="font-semibold">Total diverted: {totals.total_materials_diverted_kg} kg</div>
            <div className="text-gray-500">CO₂ saved: {totals.co2_saved_kg} kg</div>
          </div>
        )}
      </div>

      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} aria-label="Impact chart showing collections and materials recovered over time">
            <CartesianGrid strokeDasharray="3 3" stroke={Brand.muted} />
            <XAxis dataKey="month" tick={{ fill: '#374151' }} />
            <YAxis yAxisId="left" orientation="left" tick={{ fill: '#374151' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#374151' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" content={renderLegend} />
            <Bar yAxisId="left" dataKey="collections" name="Collections" fill={Brand.bar} radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="materials_kg" name="Materials (kg)" stroke={Brand.accent} strokeWidth={3} dot={{ r: 2 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ImpactChart;
