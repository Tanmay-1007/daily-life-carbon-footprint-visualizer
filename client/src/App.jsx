import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from 'recharts';

const initialInputs = {
  transportMiles: 15,
  electricityKwh: 18,
  dietType: 'balanced',
  wasteKg: 1.2,
  flightHours: 0
};

const chartColors = ['#33d1a0', '#6a8cff', '#ffb657', '#ff6d92', '#42d6ff'];

function buildChartData(categories) {
  return Object.entries(categories).map(([name, value]) => ({ name, value }));
}

function buildPieData(categories) {
  return Object.entries(categories).map(([name, value], index) => ({
    name,
    value,
    color: chartColors[index % chartColors.length]
  }));
}

function buildRadialData(categories) {
  return Object.entries(categories).map(([name, value], index) => ({
    name,
    value,
    fill: chartColors[index % chartColors.length]
  }));
}

function getImpactLevel(total) {
  if (total < 20) {
    return {
      level: 'Low',
      description: 'Excellent! Your footprint is low, and your daily habits are on the right track.'
    };
  }
  if (total < 35) {
    return {
      level: 'Moderate',
      description: 'Good job. A few sustainable changes can reduce your impact further.'
    };
  }
  return {
    level: 'High',
    description: 'Your footprint is high. Consider reducing travel emissions or shifting to plant-based meals.'
  };
}

function getRecommendations(categories) {
  const tips = [];

  if (categories.transportation > 10) {
    tips.push({
      title: 'Reduce transportation emissions',
      description: 'Try carpooling, biking, or using public transit to cut daily transport emissions.'
    });
  }

  if (categories.electricity > 16) {
    tips.push({
      title: 'Lower home energy usage',
      description: 'Switch off unused lights, choose efficient appliances, and unplug devices when not in use.'
    });
  }

  if (categories.diet > 3) {
    tips.push({
      title: 'Choose climate-friendly meals',
      description: 'Add more plant-based meals and reduce red meat to lower your diet-related footprint.'
    });
  }

  if (categories.waste > 2) {
    tips.push({
      title: 'Reduce waste generation',
      description: 'Recycle, compost food scraps, and opt for reusable products instead of disposables.'
    });
  }

  if (categories.flights > 50) {
    tips.push({
      title: 'Limit flight travel',
      description: 'Consider fewer flights or longer stays to reduce aviation emissions.'
    });
  }

  if (!tips.length) {
    tips.push({
      title: 'Keep up the sustainable habits',
      description: 'Your footprint is already efficient today. Continue with your low-impact choices.'
    });
  }

  return tips;
}

function buildTrendData(history) {
  return history
    .slice(0, 7)
    .reverse()
    .map((item) => ({
      label: new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      total: item.result.total
    }));
}

export default function App() {
  const [inputs, setInputs] = useState(initialInputs);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('Ready to estimate your carbon footprint.');

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/reports');
      setHistory(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleChange = (key) => (event) => {
    setInputs((prev) => ({
      ...prev,
      [key]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('Calculating your footprint...');

    try {
      const response = await axios.post('/api/footprint', {
        transportMiles: Number(inputs.transportMiles),
        electricityKwh: Number(inputs.electricityKwh),
        dietType: inputs.dietType,
        wasteKg: Number(inputs.wasteKg),
        flightHours: Number(inputs.flightHours)
      });

      setReport(response.data);
      setStatus('Estimation complete. Review your results below.');
      fetchHistory();
    } catch (error) {
      console.error(error);
      setStatus('Unable to compute footprint. Please try again.');
    }
  };

  return (
    <div className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Daily Life Carbon Footprint Visualizer</p>
          <h1>See how everyday choices shape your footprint.</h1>
          <p>Enter your daily habits to get a personalized carbon estimate, category breakdown, and improvement suggestions.</p>
        </div>
      </header>

      <main className="layout-grid">
        <section className="card form-card">
          <h2>Activity Inputs</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Daily car / transit miles
              <input type="number" min="0" step="1" value={inputs.transportMiles} onChange={handleChange('transportMiles')} />
            </label>
            <label>
              Daily electricity usage (kWh)
              <input type="number" min="0" step="0.1" value={inputs.electricityKwh} onChange={handleChange('electricityKwh')} />
            </label>
            <label>
              Diet profile
              <select value={inputs.dietType} onChange={handleChange('dietType')}>
                <option value="plant">Plant-focused</option>
                <option value="balanced">Balanced</option>
                <option value="meat">Meat-heavy</option>
              </select>
            </label>
            <label>
              Waste generated daily (kg)
              <input type="number" min="0" step="0.1" value={inputs.wasteKg} onChange={handleChange('wasteKg')} />
            </label>
            <label>
              Flight hours per week
              <input type="number" min="0" step="0.5" value={inputs.flightHours} onChange={handleChange('flightHours')} />
            </label>
            <button type="submit">Estimate Footprint</button>
          </form>
          <p className="status-bar">{status}</p>
        </section>

        <section className="card result-card">
          <h2>Snapshot</h2>
          {report ? (
            <>
              <div className="summary-grid">
                <div>
                  <span className="summary-label">Total estimated CO₂</span>
                  <p className="summary-value">{report.result.total} kg</p>
                </div>
                <div>
                  <span className="summary-label">Impact level</span>
                  <div className={`impact-pill ${getImpactLevel(report.result.total).level.toLowerCase()}`}>
                    {getImpactLevel(report.result.total).level}
                  </div>
                </div>
                <div>
                  <span className="summary-label">Insight</span>
                  <p>{report.result.advice}</p>
                </div>
              </div>

              <div className="dashboard-section">
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <span>Transport intensity</span>
                    <strong>{Math.round((report.result.categories.transportation / report.result.total) * 100)}%</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Electricity share</span>
                    <strong>{Math.round((report.result.categories.electricity / report.result.total) * 100)}%</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Green score</span>
                    <strong>{Math.max(0, 100 - Math.round(report.result.total * 2.2))}</strong>
                  </div>
                </div>

                <div className="trend-panel">
                  <div className="panel-heading">
                    <h3>Footprint trend</h3>
                    <p>Track recent submissions to spot improvements or spikes.</p>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={buildTrendData(history)}>
                      <CartesianGrid strokeDasharray="4 4" opacity={0.16} />
                      <XAxis dataKey="label" tick={{ fill: '#a8b6c1' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#a8b6c1' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f1723', borderColor: '#1f2a38', color: '#f8fafc' }} />
                      <Line type="monotone" dataKey="total" stroke="#34c6ff" strokeWidth={4} dot={{ r: 4, fill: '#34c6ff' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="visual-grid">
                  <div className="chart-box">
                    <div className="panel-heading">
                      <h3>Category comparison</h3>
                      <p>Compare each emission source side by side.</p>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={buildChartData(report.result.categories)}>
                        <CartesianGrid strokeDasharray="4 4" opacity={0.16} />
                        <XAxis dataKey="name" tick={{ fill: '#a8b6c1' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#a8b6c1' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f1723', borderColor: '#1f2a38', color: '#f8fafc' }} />
                        <Bar dataKey="value" fill="#5b8e7d" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-box">
                    <div className="panel-heading">
                      <h3>Category distribution</h3>
                      <p>Visualize how each category contributes to total emissions.</p>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={buildPieData(report.result.categories)}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={100}
                          innerRadius={45}
                          paddingAngle={4}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {buildPieData(report.result.categories).map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f1723', borderColor: '#1f2a38', color: '#f8fafc' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pie-legend">
                      {buildPieData(report.result.categories).map((entry) => (
                        <div key={entry.name} className="legend-item">
                          <span className="legend-swatch" style={{ background: entry.color }} />
                          <span>{entry.name}</span>
                          <strong>{entry.value} kg</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="chart-box radial-chart-box">
                    <div className="panel-heading">
                      <h3>Category share</h3>
                      <p>A radial overview of emissions by source.</p>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="40%"
                        outerRadius="90%"
                        barSize={18}
                        data={buildRadialData(report.result.categories)}
                        startAngle={180}
                        endAngle={-180}
                      >
                        <PolarAngleAxis type="number" domain={[0, 'dataMax']} tick={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f1723', borderColor: '#1f2a38', color: '#f8fafc' }} />
                        <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#eef2ff', fontSize: 12 }} background clockWise dataKey="value" />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="recommendations-panel">
                <div className="panel-heading">
                  <h3>Recommended next steps</h3>
                  <p>Personalized actions to lower your footprint in the most impactful areas.</p>
                </div>
                <div className="recommendation-list">
                  {getRecommendations(report.result.categories).map((tip) => (
                    <div key={tip.title} className="recommendation-card">
                      <strong>{tip.title}</strong>
                      <p>{tip.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p>Fill the form and press estimate to see your footprint breakdown.</p>
          )}
        </section>

        <section className="card history-card">
          <h2>Recent Submissions</h2>
          {history.length ? (
            <div className="history-list">
              {history.slice(0, 6).map((item) => (
                <div key={item.id} className="history-item">
                  <div>
                    <strong>{new Date(item.timestamp).toLocaleString()}</strong>
                    <span>{item.input.dietType} diet · {item.input.transportMiles} mi · {item.input.electricityKwh} kWh</span>
                  </div>
                  <div>{item.result.total} kg</div>
                </div>
              ))}
            </div>
          ) : (
            <p>No submissions yet. Your first estimate will appear here.</p>
          )}
        </section>
      </main>
    </div>
  );
}
