import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Sliders, Edit3, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function TariffsPage({ showToast }) {
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editModal, setEditModal] = useState({ isOpen: false, tariff: null });
  const [editFormData, setEditFormData] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchTariffs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllTariffs();
      setTariffs(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load tariff configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTariffs();
  }, []);

  const openEditModal = (t) => {
    setEditModal({ isOpen: true, tariff: t });
    setEditFormData({ ...t });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveTariff = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateTariff(editModal.tariff.id, {
        ...editFormData,
        slab1Limit: Number(editFormData.slab1Limit),
        slab1Rate: Number(editFormData.slab1Rate),
        slab2Limit: Number(editFormData.slab2Limit),
        slab2Rate: Number(editFormData.slab2Rate),
        slab3Rate: Number(editFormData.slab3Rate),
        fixedCharge: Number(editFormData.fixedCharge),
        taxPercentage: Number(editFormData.taxPercentage),
        subsidyAmount: Number(editFormData.subsidyAmount),
        lateFeePercentage: Number(editFormData.lateFeePercentage)
      });
      showToast(`Tariff for ${editFormData.connectionType} updated successfully!`, 'success');
      setEditModal({ isOpen: false, tariff: null });
      fetchTariffs();
    } catch (err) {
      showToast(err.message || 'Failed to update tariff', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="alert alert-info" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <Info size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Educational Progressive Tariff System:</strong> Electricity charges are tiered across progressive slabs
          so each unit is only charged at its respective slab rate. Default educational baseline rates:
          0–100 units @ ₹3.00, 101–200 units @ ₹5.00, and units &gt;200 @ ₹7.00. (For 250 units, energy charge = ₹1,150).
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div className="loading-box" style={{ gridColumn: '1 / -1' }}>
            <div className="spinner"></div>
            <p>Loading tariff configurations...</p>
          </div>
        ) : (
          tariffs.map((t) => (
            <div key={t.id} className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title" style={{ color: 'var(--primary-700)' }}>
                    {t.connectionType} TARIFF
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                    {t.isActive ? 'Active Regulatory Plan' : 'Inactive Plan'}
                  </span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(t)}>
                  <Edit3 size={14} />
                  <span>Configure</span>
                </button>
              </div>

              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ padding: '0.65rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.25rem' }}>
                      Tiered Energy Slabs:
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-600)' }}>
                      <span>Slab 1 (0 to {t.slab1Limit} units):</span>
                      <strong>₹{Number(t.slab1Rate).toFixed(2)} / unit</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-600)' }}>
                      <span>Slab 2 ({t.slab1Limit} to {t.slab2Limit} units):</span>
                      <strong>₹{Number(t.slab2Rate).toFixed(2)} / unit</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-600)' }}>
                      <span>Slab 3 (Above {t.slab2Limit} units):</span>
                      <strong>₹{Number(t.slab3Rate).toFixed(2)} / unit</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--slate-600)' }}>Fixed Monthly Charge:</span>
                    <strong>₹{Number(t.fixedCharge).toFixed(2)}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--slate-600)' }}>Electricity Duty / Tax:</span>
                    <strong>{Number(t.taxPercentage).toFixed(2)}%</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--slate-600)' }}>Late Payment Surcharge:</span>
                    <strong>{Number(t.lateFeePercentage).toFixed(2)}%</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--slate-600)' }}>Government Subsidy:</span>
                    <strong style={{ color: '#059669' }}>₹{Number(t.subsidyAmount).toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Tariff Modal */}
      {editModal.isOpen && editFormData && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Configure Tariff for {editFormData.connectionType}</h3>
              <button
                className="btn btn-icon btn-secondary"
                onClick={() => setEditModal({ isOpen: false, tariff: null })}
                style={{ border: 'none' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTariff}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Slab 1 Limit (Units)</label>
                    <input
                      type="number"
                      step="1"
                      name="slab1Limit"
                      className="form-control"
                      value={editFormData.slab1Limit}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Slab 1 Rate (₹/unit)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="slab1Rate"
                      className="form-control"
                      value={editFormData.slab1Rate}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Slab 2 Limit (Units)</label>
                    <input
                      type="number"
                      step="1"
                      name="slab2Limit"
                      className="form-control"
                      value={editFormData.slab2Limit}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Slab 2 Rate (₹/unit)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="slab2Rate"
                      className="form-control"
                      value={editFormData.slab2Rate}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Slab 3 Rate (₹/unit)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="slab3Rate"
                      className="form-control"
                      value={editFormData.slab3Rate}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fixed Monthly Charge (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="fixedCharge"
                      className="form-control"
                      value={editFormData.fixedCharge}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Electricity Duty / Tax (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="taxPercentage"
                      className="form-control"
                      value={editFormData.taxPercentage}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Late Fee (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="lateFeePercentage"
                      className="form-control"
                      value={editFormData.lateFeePercentage}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditModal({ isOpen: false, tariff: null })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Update Tariff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
