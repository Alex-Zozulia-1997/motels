import { useMemo } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Title
} from 'chart.js';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, PointElement, LineElement, Title);
import Modal from './Modal';

export default function StatsModal({ open, onClose, motels, decisions }) {
  // Prepare data
  const decisionTypes = ['approved', 'rejected', 'pending'];
  const countries = useMemo(() =>
    [...new Set(motels.map(m => m.country_code || 'Unknown'))].sort()
  , [motels]);
  // Attach decision to each motel
  const motelsWithDecision = useMemo(() =>
    motels.map(m => ({
      ...m,
      decision: (decisions && decisions[m.place_id]) || m.decision || 'pending',
      actual_reviews_count: m.reviews_count || 0,
      actual_images_count: m.images_count || 0,
      total_score: Number(m.total_score) || 0,
    })),
    [motels, decisions]
  );

  // Graph: Listings by Country with Decision Status (stacked bar)
  const countryData = useMemo(() => ({
    labels: countries,
    datasets: decisionTypes.map((d, i) => ({
      label: d.charAt(0).toUpperCase() + d.slice(1),
      data: countries.map(c => motelsWithDecision.filter(m => (m.country_code === c) && (m.decision === d)).length),
      backgroundColor: ["#4CAF50", "#F44336", "#FFC107"][i],
      stack: 'decision',
    })),
  }), [countries, motelsWithDecision]);

  // Graph: Decision Status (pie)
  const decisionData = useMemo(() => ({
    labels: decisionTypes,
    datasets: [{
      label: "Decision Status",
      data: decisionTypes.map(d => motelsWithDecision.filter(m => m.decision === d).length),
      backgroundColor: ["#4CAF50", "#F44336", "#FFC107"],
    }],
  }), [motelsWithDecision]);

  // Graph: Reviews per Listing (line)
  const reviewsData = useMemo(() => ({
    labels: motelsWithDecision.map(m => m.title),
    datasets: [{
      label: "Reviews per Listing",
      data: motelsWithDecision.map(m => m.actual_reviews_count),
      backgroundColor: "#FFCE56",
      borderColor: "#FFCE56",
      fill: false,
      tension: 0.2,
    }],
  }), [motelsWithDecision]);

  // Graph: Images per Listing (bar)
  const imagesData = useMemo(() => ({
    labels: motelsWithDecision.map(m => m.title),
    datasets: [{
      label: "Images per Listing",
      data: motelsWithDecision.map(m => m.actual_images_count),
      backgroundColor: "#8BC34A",
    }],
  }), [motelsWithDecision]);

  // Graph: Average Score by Country (bar)
  const avgScoreData = useMemo(() => ({
    labels: countries,
    datasets: [{
      label: "Avg. Score by Country",
      data: countries.map(c => {
        const items = motelsWithDecision.filter(m => m.country_code === c);
        if (!items.length) return 0;
        return (
          items.reduce((sum, m) => sum + (m.total_score || 0), 0) / items.length
        ).toFixed(2);
      }),
      backgroundColor: "#9C27B0",
    }],
  }), [countries, motelsWithDecision]);

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 w-full max-w-[90vw] mx-auto">
        <h2 className="text-2xl font-bold mb-6">Motel Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 min-h-[520px]">
            <h3 className="font-semibold mb-4 text-lg">Listings by Country</h3>
            <div style={{ maxWidth: '900px', width: '100%', overflowX: 'auto' }}>
              <Bar height={440} data={countryData} options={{
                plugins: { legend: { position: 'top' } },
                responsive: true,
                maintainAspectRatio: false,
                scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
              }} />
            </div>
          </div>
          {/* <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 min-h-[520px]">
            <h3 className="font-semibold mb-4 text-lg">Decision Status</h3>
            <Pie height={440} data={decisionData} options={{ maintainAspectRatio: false }} />
          </div> */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 min-h-[520px]">
            <h3 className="font-semibold mb-4 text-lg">Reviews per Listing</h3>
            <div style={{ maxWidth: '900px', width: '100%', overflowX: 'auto' }}>
              <Line height={440} data={reviewsData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          {/* <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 min-h-[520px]">
            <h3 className="font-semibold mb-4 text-lg">Images per Listing</h3>
            <div style={{ maxWidth: '900px', width: '100%', overflowX: 'auto' }}>
              <Bar height={440} data={imagesData} options={{ maintainAspectRatio: false }} />
            </div>
          </div> */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 min-h-[520px] md:col-span-2">
            <h3 className="font-semibold mb-4 text-lg">Avg. Score by Country</h3>
            <div style={{ maxWidth: '900px', width: '100%', overflowX: 'auto' }}>
              <Bar height={440} data={avgScoreData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
        <button
          className="mt-4 px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 text-lg"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
