import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as reportApi from '../api/reportApi';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

export default function Dashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('daily');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    reportApi
      .getSummaryReport(period)
      .then((res) => setSummary(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load report'))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div>
      <div className="page-header">
        <h2>Welcome, {user?.name}</h2>
        <div className="btn-group">
          <button
            className={`btn ${period === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setPeriod('daily')}
          >
            Daily
          </button>
          <button
            className={`btn ${period === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setPeriod('weekly')}
          >
            Weekly
          </button>
        </div>
      </div>

      <ErrorMessage message={error} />
      {loading && <Loader />}

      {summary && !loading && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-label">Total Patients</span>
              <span className="stat-value">{summary.totalPatients}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">New Patients ({period})</span>
              <span className="stat-value">{summary.newPatients}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Appointments ({period})</span>
              <span className="stat-value">{summary.totalAppointments}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Revenue Collected</span>
              <span className="stat-value">${summary.revenueCollected.toFixed(2)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Revenue Pending</span>
              <span className="stat-value">${summary.revenuePending.toFixed(2)}</span>
            </div>
          </div>

          <div className="card">
            <h3>Appointments by Status</h3>
            <div className="status-breakdown">
              {Object.entries(summary.appointmentsByStatus).length === 0 && <p>No appointments in this period.</p>}
              {Object.entries(summary.appointmentsByStatus).map(([status, count]) => (
                <span key={status} className={`status-badge status-${status}`}>
                  {status}: {count}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
