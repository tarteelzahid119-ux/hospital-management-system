import { useEffect, useState } from 'react';
import * as reportApi from '../api/reportApi';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

export default function Reports() {
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
        <h2>Reports</h2>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      <ErrorMessage message={error} />
      {loading && <Loader />}

      {summary && !loading && (
        <div className="card">
          <h3>{period === 'daily' ? "Today's" : "This Week's"} Summary</h3>
          <table className="data-table">
            <tbody>
              <tr><td>Report Range</td><td>{new Date(summary.rangeStart).toLocaleString()} — {new Date(summary.rangeEnd).toLocaleString()}</td></tr>
              <tr><td>Total Patients (all time)</td><td>{summary.totalPatients}</td></tr>
              <tr><td>New Patients</td><td>{summary.newPatients}</td></tr>
              <tr><td>Total Appointments</td><td>{summary.totalAppointments}</td></tr>
              <tr><td>Revenue Collected</td><td>${summary.revenueCollected.toFixed(2)}</td></tr>
              <tr><td>Revenue Pending</td><td>${summary.revenuePending.toFixed(2)}</td></tr>
            </tbody>
          </table>

          <h4>Appointments by Status</h4>
          <div className="status-breakdown">
            {Object.entries(summary.appointmentsByStatus).length === 0 && <p>No appointments in this period.</p>}
            {Object.entries(summary.appointmentsByStatus).map(([status, count]) => (
              <span key={status} className={`status-badge status-${status}`}>{status}: {count}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
