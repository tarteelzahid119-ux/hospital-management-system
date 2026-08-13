import { useEffect, useState } from 'react';
import * as billApi from '../api/billApi';
import * as patientApi from '../api/patientApi';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('');

  const [patientId, setPatientId] = useState('');
  const [treatments, setTreatments] = useState([{ name: '', charge: 0 }]);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const loadBills = () => {
    setLoading(true);
    billApi
      .getBills(paymentFilter ? { paymentStatus: paymentFilter } : {})
      .then((res) => setBills(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load bills'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentFilter]);

  useEffect(() => {
    patientApi.getPatients().then((res) => setPatients(res.data.data));
  }, []);

  const addTreatmentRow = () => setTreatments([...treatments, { name: '', charge: 0 }]);
  const updateTreatment = (idx, field, value) => {
    const copy = [...treatments];
    copy[idx][field] = field === 'charge' ? Number(value) : value;
    setTreatments(copy);
  };
  const removeTreatment = (idx) => setTreatments(treatments.filter((_, i) => i !== idx));

  const total = treatments.reduce((sum, t) => sum + (Number(t.charge) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await billApi.createBill({ patient: patientId, treatments, paymentMethod });
      setShowModal(false);
      setPatientId('');
      setTreatments([{ name: '', charge: 0 }]);
      loadBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate bill');
    }
  };

  const togglePayment = async (bill) => {
    try {
      await billApi.updatePaymentStatus(bill._id, bill.paymentStatus === 'paid' ? 'unpaid' : 'paid');
      loadBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment status');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Billing</h2>
        <div className="page-header-actions">
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Generate Bill
          </button>
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
                <th>Treatments</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-cell">No bills found.</td>
                </tr>
              )}
              {bills.map((b) => (
                <tr key={b._id}>
                  <td>{b.patient?.name}</td>
                  <td>{b.treatments.map((t) => t.name).join(', ')}</td>
                  <td>${b.totalAmount.toFixed(2)}</td>
                  <td><StatusBadge status={b.paymentStatus} /></td>
                  <td>
                    <button className="btn btn-small" onClick={() => togglePayment(b)}>
                      Mark {b.paymentStatus === 'paid' ? 'Unpaid' : 'Paid'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="Generate Bill" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Patient
              <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </label>

            <div className="treatments-list">
              <label>Treatments / Charges</label>
              {treatments.map((t, idx) => (
                <div className="treatment-row" key={idx}>
                  <input
                    placeholder="Treatment name"
                    value={t.name}
                    onChange={(e) => updateTreatment(idx, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Charge"
                    value={t.charge}
                    onChange={(e) => updateTreatment(idx, 'charge', e.target.value)}
                    required
                  />
                  {treatments.length > 1 && (
                    <button type="button" className="btn btn-small btn-danger" onClick={() => removeTreatment(idx)}>
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-small" onClick={addTreatmentRow}>
                + Add treatment
              </button>
            </div>

            <label>
              Payment Method
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="insurance">Insurance</option>
                <option value="online">Online</option>
              </select>
            </label>

            <p className="bill-total">Total: ${total.toFixed(2)}</p>

            <button className="btn btn-primary" type="submit">Generate Bill</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
