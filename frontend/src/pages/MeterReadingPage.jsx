import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Gauge, PlusCircle, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function MeterReadingPage({ setTab, showToast }) {
  const [readings, setReadings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const currentDate = new Date();
  const [formData, setFormData] = useState({
    customerId: '',
    billingMonth: currentDate.getMonth() + 1,
    billingYear: currentDate.getFullYear(),
    readingDate: currentDate.toISOString().split('T')[0],
    previousReading: 0.0,
    currentReading: '',
    remarks: ''
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rData, cData] = await Promise.all([
        api.getAllMeterReadings(),
        api.getAllCustomers()
      ]);
      setReadings(rData || []);
      const activeCustomers = (cData || []).filter((c) => c.status === 'ACTIVE');
      setCustomers(activeCustomers);

      if (activeCustomers.length > 0 && !formData.customerId) {
        handleCustomerChange(activeCustomers[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load meter reading records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCustomerChange = async (customerId) => {
    setFormData((prev) => ({ ...prev, customerId }));
    try {
      const latestReading = await api.getLatestReadingForCustomer(customerId);
      setFormData((prev) => ({
        ...prev,
        customerId,
        previousReading: latestReading !== undefined ? latestReading : 0.0
      }));
    } catch (err) {
      // Default to 0.0 if not found
      setFormData((prev) => ({ ...prev, customerId, previousReading: 0.0 }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const unitsPreview =
    formData.currentReading !== '' && !isNaN(Number(formData.currentReading))
      ? Math.max(0, Number(formData.currentReading) - Number(formData.previousReading || 0)).toFixed(2)
      : '0.00';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    const prev = Number(formData.previousReading || 0);
    const curr = Number(formData.currentReading);

    if (isNaN(curr) || curr < 0) {
      setFormError('Current meter reading must be a positive number');
      setFormSubmitting(false);
      return;
    }

    if (curr < prev) {
      setFormError(`Current reading (${curr}) cannot be lower than previous reading (${prev})`);
      setFormSubmitting(false);
      return;
    }

    try {
      await api.recordMeterReading({
        customerId: Number(formData.customerId),
        billingMonth: Number(formData.billingMonth),
        billingYear: Number(formData.billingYear),
        readingDate: formData.readingDate,
        previousReading: prev,
        currentReading: curr,
        remarks: formData.remarks
      });

      showToast('Meter reading successfully recorded!', 'success');
      setFormData((prev) => ({
        ...prev,
        currentReading: '',
        remarks: ''
      }));
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to record meter reading');
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredReadings = readings.filter((r) => {
    const query = searchTerm.toLowerCase();
    return (
      r.consumerNumber?.toLowerCase().includes(query) ||
      r.customerName?.toLowerCase().includes(query) ||
      `${r.billingMonth}/${r.billingYear}`.includes(query)
    );
  });

  return (
    <div>
      {/* Entry Form Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Gauge size={20} color="var(--primary-600)" />
            <span>Record Monthly Meter Reading</span>
          </h3>
        </div>

        <div className="card-body">
          {formError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Select Active Consumer <span className="required">*</span>
                </label>
                <select
                  name="customerId"
                  className="form-control"
                  value={formData.customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  required
                >
                  <option value="">-- Choose Consumer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.consumerNumber} - {c.fullName} ({c.connectionType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Billing Period (Month / Year) <span className="required">*</span>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    name="billingMonth"
                    className="form-control"
                    value={formData.billingMonth}
                    onChange={handleInputChange}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })} ({m})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="billingYear"
                    className="form-control"
                    style={{ width: '100px' }}
                    value={formData.billingYear}
                    onChange={handleInputChange}
                    min="2000"
                    max="2035"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reading Date</label>
                <input
                  type="date"
                  name="readingDate"
                  className="form-control"
                  value={formData.readingDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Previous Meter Reading (kWh)</label>
                <input
                  type="number"
                  step="0.01"
                  name="previousReading"
                  className="form-control"
                  value={formData.previousReading}
                  onChange={handleInputChange}
                  required
                />
                <span className="form-hint">Auto-fetched from consumer's latest reading</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Current Meter Reading (kWh) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="currentReading"
                  className="form-control"
                  placeholder="e.g. 1250.00"
                  value={formData.currentReading}
                  onChange={handleInputChange}
                  required
                />
                <span className="form-hint">Must be greater than or equal to previous reading</span>
              </div>

              <div className="form-group">
                <label className="form-label">Calculated Consumption Preview</label>
                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'var(--primary-50)',
                    border: '1px solid var(--primary-200)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    color: 'var(--primary-800)',
                    fontSize: '1.05rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{unitsPreview} Units (kWh)</span>
                  <CheckCircle2 size={18} color="var(--primary-600)" />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Remarks / Meter Notes</label>
              <input
                type="text"
                name="remarks"
                className="form-control"
                placeholder="Optional notes, e.g. regular monthly meter cycle, meter checked and verified"
                value={formData.remarks}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={formSubmitting || customers.length === 0}>
                {formSubmitting ? 'Recording...' : 'Save Meter Reading'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* History Table */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search recorded readings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recorded Meter Readings History ({filteredReadings.length})</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-box">
              <div className="spinner"></div>
              <p>Loading meter readings...</p>
            </div>
          ) : filteredReadings.length === 0 ? (
            <div className="empty-state">
              <p>No meter readings recorded yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Consumer</th>
                    <th>Billing Period</th>
                    <th>Reading Date</th>
                    <th>Previous (kWh)</th>
                    <th>Current (kWh)</th>
                    <th>Units Consumed</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReadings.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.customerName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{r.consumerNumber}</div>
                      </td>
                      <td>
                        <strong>{r.billingMonth}/{r.billingYear}</strong>
                      </td>
                      <td>{r.readingDate}</td>
                      <td>{r.previousReading}</td>
                      <td>{r.currentReading}</td>
                      <td>
                        <strong style={{ color: 'var(--primary-700)', fontSize: '0.95rem' }}>
                          {r.unitsConsumed} units
                        </strong>
                      </td>
                      <td style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>{r.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
