"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement } from "chart.js";

// Register Chart.js components and scales
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);
import { fetchMotelStats } from "../../lib/supabase";

const Bar = dynamic(() => import("react-chartjs-2").then(mod => mod.Bar), { ssr: false });
const Pie = dynamic(() => import("react-chartjs-2").then(mod => mod.Pie), { ssr: false });
const Line = dynamic(() => import("react-chartjs-2").then(mod => mod.Line), { ssr: false });

export default function StatisticsPage() {
  const [motels, setMotels] = useState([]);
  // Treat 'none' and 'pending' as the same for filtering and display
  const decisionTypes = ["approved", "rejected", "pending"];
  const [filters, setFilters] = useState({
    countries: [],
    decisions: [],
    minReviews: 0,
    minImages: 0,
    minScore: 0,
  });
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [decisionDropdownOpen, setDecisionDropdownOpen] = useState(false);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetchMotelStats().then(data => {
      setMotels(data);
      setCountries([...new Set(data.map(m => m.country_code))]);
    });
  }, []);

  const filteredMotels = motels.filter(m => {
    if (filters.countries.length && !filters.countries.includes(m.country_code)) return false;
    // Treat 'none' as 'pending' for filtering
    const motelDecision = m.decision || "pending";
    if (filters.decisions.length && !filters.decisions.includes(motelDecision)) return false;
    if (filters.minReviews && m.actual_reviews_count < filters.minReviews) return false;
    if (filters.minImages && m.actual_images_count < filters.minImages) return false;
    if (filters.minScore && Number(m.total_score) < filters.minScore) return false;
    return true;
  });

  // Graph: Listings by Country with Decision Status (stacked bar)
  const countryData = {
    labels: countries,
    datasets: decisionTypes.map((d, i) => ({
      label: d.charAt(0).toUpperCase() + d.slice(1),
      data: countries.map(c => filteredMotels.filter(m => (m.country_code === c) && ((m.decision || "pending") === d)).length),
      backgroundColor: ["#4CAF50", "#F44336", "#FFC107"][i],
      stack: 'decision',
    })),
  };

  // Graph: Decision Status
  const decisionData = {
    labels: decisionTypes,
    datasets: [{
      label: "Decision Status",
      data: decisionTypes.map(d => filteredMotels.filter(m => (m.decision || "pending") === d).length),
      backgroundColor: ["#4CAF50", "#F44336", "#FFC107"],
    }],
  };

  // Graph: Reviews per Listing
  const reviewsData = {
    labels: filteredMotels.map(m => m.title),
    datasets: [{
      label: "Reviews per Listing",
      data: filteredMotels.map(m => m.actual_reviews_count),
      backgroundColor: "#FFCE56",
    }],
  };

  // Graph: Images per Listing
  const imagesData = {
    labels: filteredMotels.map(m => m.title),
    datasets: [{
      label: "Images per Listing",
      data: filteredMotels.map(m => m.actual_images_count),
      backgroundColor: "#8BC34A",
    }],
  };

  // Graph: Average Score by Country
  const avgScoreData = {
    labels: countries,
    datasets: [{
      label: "Avg. Score by Country",
      data: countries.map(c => {
        const items = filteredMotels.filter(m => m.country_code === c);
        if (!items.length) return 0;
        return (
          items.reduce((sum, m) => sum + Number(m.total_score || 0), 0) / items.length
        ).toFixed(2);
      }),
      backgroundColor: "#9C27B0",
    }],
  };

  return (
    <div className="stats-container">
      <h1 className="stats-title">Statistics</h1>
      <div className="stats-filters">
        <div className="filter-group">
          <label className="block text-xs font-semibold mb-1">Country</label>
          <div className="relative">
            <button
              type="button"
              className="min-w-[160px] px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex justify-between items-center"
              onClick={() => setCountryDropdownOpen(open => !open)}
            >
              <span>
                {(filters.countries && filters.countries.length > 0)
                  ? filters.countries.join(', ')
                  : 'Select countries'}
              </span>
              <span className="ml-2 text-zinc-400">▼</span>
            </button>
            {countryDropdownOpen && (
              <div className="absolute left-0 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded shadow-lg z-10">
                <div className="flex gap-2 px-3 py-2">
                  <button type="button" className="text-xs" onClick={() => setFilters(f => ({ ...f, countries: countries }))}>Select All</button>
                  <button type="button" className="text-xs" onClick={() => setFilters(f => ({ ...f, countries: [] }))}>Clear</button>
                </div>
                {countries.map(code => (
                  <div
                    key={code}
                    className={`px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-zinc-800 ${
                      filters.countries && filters.countries.includes(code)
                        ? 'bg-purple-100 dark:bg-purple-900'
                        : ''
                    }`}
                    onClick={() => {
                      let selected = filters.countries || [];
                      if (selected.includes(code)) {
                        selected = selected.filter(c => c !== code);
                      } else {
                        selected = [...selected, code];
                      }
                      setFilters(f => ({ ...f, countries: selected }));
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={filters.countries && filters.countries.includes(code)}
                      readOnly
                    />
                    <span>{code}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs mt-1 text-zinc-500 dark:text-zinc-400">
              Click to select one or more countries
            </div>
          </div>
        </div>
        <div className="filter-group">
          <label className="block text-xs font-semibold mb-1">Decision Status</label>
          <div className="relative">
            <button
              type="button"
              className="min-w-[160px] px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex justify-between items-center"
              onClick={() => setDecisionDropdownOpen(open => !open)}
            >
              <span>
                {(filters.decisions && filters.decisions.length > 0)
                  ? filters.decisions.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')
                  : 'Select status'}
              </span>
              <span className="ml-2 text-zinc-400">▼</span>
            </button>
            {decisionDropdownOpen && (
              <div className="absolute left-0 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded shadow-lg z-10">
                <div className="flex gap-2 px-3 py-2">
                  <button type="button" className="text-xs" onClick={() => setFilters(f => ({ ...f, decisions: decisionTypes }))}>Select All</button>
                  <button type="button" className="text-xs" onClick={() => setFilters(f => ({ ...f, decisions: [] }))}>Clear</button>
                </div>
                {decisionTypes.map(d => (
                  <div
                    key={d}
                    className={`px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-zinc-800 ${
                      filters.decisions && filters.decisions.includes(d)
                        ? 'bg-purple-100 dark:bg-purple-900'
                        : ''
                    }`}
                    onClick={() => {
                      let selected = filters.decisions || [];
                      if (selected.includes(d)) {
                        selected = selected.filter(s => s !== d);
                      } else {
                        selected = [...selected, d];
                      }
                      setFilters(f => ({ ...f, decisions: selected }));
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={filters.decisions && filters.decisions.includes(d)}
                      readOnly
                    />
                    <span>{d.charAt(0).toUpperCase() + d.slice(1)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs mt-1 text-zinc-500 dark:text-zinc-400">
              Click to select one or more statuses
            </div>
          </div>
        </div>
        <div className="filter-group">
          <label>Min Reviews:</label>
          <input type="number" min={0} value={filters.minReviews} onChange={e => setFilters(f => ({ ...f, minReviews: Number(e.target.value) }))} />
        </div>
        <div className="filter-group">
          <label>Min Images:</label>
          <input type="number" min={0} value={filters.minImages} onChange={e => setFilters(f => ({ ...f, minImages: Number(e.target.value) }))} />
        </div>
        <div className="filter-group">
          <label>Min Score:</label>
          <input type="number" min={0} step={0.1} value={filters.minScore} onChange={e => setFilters(f => ({ ...f, minScore: Number(e.target.value) }))} />
        </div>
      </div>
      <div className="stats-graphs">
        <div className="graph-card">
          <h2>Listings by Country</h2>
          <Bar
            data={countryData}
            options={{
              plugins: { legend: { position: 'top' } },
              responsive: true,
              scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true },
              },
            }}
          />
        </div>
        <div className="graph-card">
          <h2>Decision Status</h2>
          <Pie data={decisionData} />
        </div>
        <div className="graph-card">
          <h2>Reviews per Listing</h2>
          <Line data={reviewsData} />
        </div>
        <div className="graph-card">
          <h2>Images per Listing</h2>
          <Bar data={imagesData} />
        </div>
        <div className="graph-card">
          <h2>Avg. Score by Country</h2>
          <Bar data={avgScoreData} />
        </div>
      </div>
      <style jsx>{`
        .stats-container {
          padding: 2rem;
          background: #f8f9fa;
          min-height: 100vh;
        }
        .stats-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 2rem;
        }
        .stats-filters {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .stats-graphs {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .graph-card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          padding: 1.5rem;
          width: 400px;
          margin-bottom: 2rem;
        }
        .graph-card h2 {
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }
        select, input[type="number"] {
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid #ccc;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}
