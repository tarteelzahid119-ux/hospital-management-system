import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as doctorApi from '../api/doctorApi';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';

const emptyForm = {
  name: '',
  specialization: '',
  email: '',
  phone: '',
  consultationFee: 0,
};

export default function Doctors() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const loadDoctors = () => {
    setLoading(true);
    doctorApi
      .getDoctors(search ? { specialization: search } : {})
      .then((res) => setDoctors(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load doctors'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreateModal = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (doc) => {
    setForm({
      name: doc.name,
      specialization: doc.specialization,
      email: doc.email,
      phone: doc.phone,
      consultationFee: doc.consultationFee,
    });
    setEditingId(doc._id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await doctorApi.updateDoctor(editingId, form);
      } else {
        await doctorApi.createDoctor(form);
      }
      setShowModal(false);
      loadDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save doctor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    try {
      await doctorApi.deleteDoctor(id);
      loadDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete doctor');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Doctors</h2>
        <div className="page-header-actions">
          <input
            className="search-input"
            placeholder="Filter by specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isAdmin && (
            <button className="btn btn-primary" onClick={openCreateModal}>
              + Add Doctor
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
                <th>Specialization</th>
                <th>Contact</th>
                <th>Fee</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="empty-cell">
                    No doctors found.
                  </td>
                </tr>
              )}
              {doctors.map((doc) => (
                <tr key={doc._id}>
                  <td>{doc.name}</td>
                  <td>{doc.specialization}</td>
                  <td>
                    {doc.email}
                    <br />
                    {doc.phone}
                  </td>
                  <td>${doc.consultationFee}</td>
                  <td>
                    <span className={`status-badge ${doc.isActive ? 'status-confirmed' : 'status-cancelled'}`}>
                      {doc.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      <button className="btn btn-small" onClick={() => openEditModal(doc)}>
                        Edit
                      </button>
                      <button className="btn btn-small btn-danger" onClick={() => handleDelete(doc._id)}>
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editingId ? 'Edit Doctor' : 'Add Doctor'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              Specialization
              <input
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </label>
            <label>
              Consultation Fee
              <input
                type="number"
                min="0"
                value={form.consultationFee}
                onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })}
              />
            </label>
            <button className="btn btn-primary" type="submit">
              {editingId ? 'Save Changes' : 'Create Doctor'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
