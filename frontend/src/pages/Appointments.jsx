import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as appointmentApi from '../api/appointmentApi';
import * as doctorApi from '../api/doctorApi';
import * as patientApi from '../api/patientApi';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const emptyForm = { patient: '', doctor: '', date: '', startTime: '', endTime: '', reason: '' };

export default function Appointments() {
  const { user } = useAuth();
  const canBook = user?.role === 'admin' || user?.role === 'receptionist';

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState('');

  const loadAppointments = () => {
    setLoading(true);
    appointmentApi
      .getAppointments(statusFilter ? { status: statusFilter } : {})
      .then((res) => setAppointments(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load appointments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    if (canBook) {
      doctorApi.getDoctors().then((res) => setDoctors(res.data.data));
      patientApi.getPatients().then((res) => setPatients(res.data.data));
    }
  }, [canBook]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await appointmentApi.createAppointment(form);
      setShowModal(false);
      setForm(emptyForm);
      loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment (possible double-booking).');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentApi.updateAppointmentStatus(id, status);
      loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentApi.deleteAppointment(id);
      loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Appointments</h2>
        <div className="page-header-actions">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {canBook && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Book Appointment
            </button>
          )}
        </div>
      </div>

      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-cell">No appointments found.</td>
                </tr>
              )}
              {appointments.map((a) => (
                <tr key={a._id}>
                  <td>{a.patient?.name}</td>
                  <td>{a.doctor?.name}</td>
                  <td>{new Date(a.date).toLocaleDateString()}</td>
                  <td>{a.startTime} - {a.endTime}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    {a.status !== 'completed' && a.status !== 'cancelled' && (
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) handleStatusChange(a._id, e.target.value);
                        }}
                      >
                        <option value="" disabled>Update...</option>
                        {a.status === 'pending' && <option value="confirmed">Confirm</option>}
                        {a.status === 'confirmed' && <option value="completed">Complete</option>}
                        <option value="cancelled">Cancel</option>
                      </select>
                    )}
                    {canBook && (
                      <button className="btn btn-small btn-danger" onClick={() => handleCancel(a._id)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="Book Appointment" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Patient
              <select value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} required>
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label>
              Doctor
              <select value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} required>
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>
                ))}
              </select>
            </label>
            <label>
              Date
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </label>
            <label>
              Start Time
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
            </label>
            <label>
              End Time
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
            </label>
            <label>
              Reason (optional)
              <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </label>
            <button className="btn btn-primary" type="submit">Book Appointment</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
