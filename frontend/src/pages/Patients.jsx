import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as patientApi from '../api/patientApi';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';

const emptyForm = { name: '', age: '', gender: 'male', phone: '', email: '', bloodGroup: '' };

export default function Patients() {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'receptionist';
  const canDelete = user?.role === 'admin';

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadPatients = () => {
    setLoading(true);
    patientApi
      .getPatients(search ? { search } : {})
      .then((res) => setPatients(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load patients'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreateModal = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setForm({ name: p.name, age: p.age, gender: p.gender, phone: p.phone, email: p.email || '', bloodGroup: p.bloodGroup || '' });
    setEditingId(p._id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, age: Number(form.age) };
      if (editingId) {
        await patientApi.updatePatient(editingId, payload);
      } else {
        await patientApi.createPatient(payload);
      }
      setShowModal(false);
      loadPatients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save patient');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient record?')) return;
    try {
      await patientApi.deletePatient(id);
      loadPatients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete patient');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Patients</h2>
        <div className="page-header-actions">
          <input
            className="search-input"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {canEdit && (
            <button className="btn btn-primary" onClick={openCreateModal}>
              + Register Patient
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
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Blood Group</th>
                {(canEdit || canDelete) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-cell">No patients found.</td>
                </tr>
              )}
              {patients.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.age}</td>
                  <td>{p.gender}</td>
                  <td>{p.phone}</td>
                  <td>{p.bloodGroup || '—'}</td>
                  {(canEdit || canDelete) && (
                    <td>
                      {canEdit && (
                        <button className="btn btn-small" onClick={() => openEditModal(p)}>
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button className="btn btn-small btn-danger" onClick={() => handleDelete(p._id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editingId ? 'Edit Patient' : 'Register Patient'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Age
              <input type="number" min="0" max="150" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
            </label>
            <label>
              Gender
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </label>
            <label>
              Email (optional)
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label>
              Blood Group (optional)
              <input value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />
            </label>
            <button className="btn btn-primary" type="submit">
              {editingId ? 'Save Changes' : 'Register Patient'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
