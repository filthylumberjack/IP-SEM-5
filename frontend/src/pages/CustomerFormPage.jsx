import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserCheck, ArrowLeft, AlertCircle } from 'lucide-react';

export default function CustomerFormPage({ editingCustomer, setTab, showToast }) {
  const isEdit = Boolean(editingCustomer);

  const [formData, setFormData] = useState({
    consumerNumber: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    connectionType: 'RESIDENTIAL',
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        consumerNumber: editingCustomer.consumerNumber || '',
        fullName: editingCustomer.fullName || '',
        email: editingCustomer.email || '',
        phoneNumber: editingCustomer.phoneNumber || '',
        address: editingCustomer.address || '',
        connectionType: editingCustomer.connectionType || 'RESIDENTIAL',
        registrationDate: editingCustomer.registrationDate || new Date().toISOString().split('T')[0],
        status: editingCustomer.status || 'ACTIVE'
      });
    }
  }, [editingCustomer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic frontend validations
    if (!formData.consumerNumber.trim()) {
      setError('Consumer Number is required');
      setLoading(false);
      return;
    }
    if (!formData.fullName.trim()) {
      setError('Full Name is required');
      setLoading(false);
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone Number is required');
      setLoading(false);
      return;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        await api.updateCustomer(editingCustomer.id, formData);
        showToast(`Customer ${formData.consumerNumber} updated successfully!`, 'success');
      } else {
        await api.createCustomer(formData);
        showToast(`Customer ${formData.consumerNumber} registered successfully!`, 'success');
      }
      setTab('customers');
    } catch (err) {
      setError(err.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setTab('customers')}>
          <ArrowLeft size={14} />
          <span>Back to Customers</span>
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <UserCheck size={20} color="var(--primary-600)" />
            <span>{isEdit ? 'Edit Customer Information' : 'Register New Electricity Consumer'}</span>
          </h3>
        </div>

        <div className="card-body">
          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Consumer Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="consumerNumber"
                  className="form-control"
                  placeholder="e.g. CON-1008"
                  value={formData.consumerNumber}
                  onChange={handleChange}
                  required
                />
                <span className="form-hint">Unique customer utility identifier</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  className="form-control"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  className="form-control"
                  placeholder="e.g. 9876543210"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Optional)</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="e.g. consumer@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Connection Tariff Type <span className="required">*</span>
                </label>
                <select
                  name="connectionType"
                  className="form-control"
                  value={formData.connectionType}
                  onChange={handleChange}
                >
                  <option value="RESIDENTIAL">Residential (Domestic)</option>
                  <option value="COMMERCIAL">Commercial (Shops / Offices)</option>
                  <option value="INDUSTRIAL">Industrial (Manufacturing / Plants)</option>
                </select>
                <span className="form-hint">Determines applicable tariff slab rates</span>
              </div>

              <div className="form-group">
                <label className="form-label">Registration Date</label>
                <input
                  type="date"
                  name="registrationDate"
                  className="form-control"
                  value={formData.registrationDate}
                  onChange={handleChange}
                />
              </div>

              {isEdit && (
                <div className="form-group">
                  <label className="form-label">Account Status</label>
                  <select
                    name="status"
                    className="form-control"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">
                Installation / Billing Address <span className="required">*</span>
              </label>
              <textarea
                name="address"
                rows="3"
                className="form-control"
                placeholder="Enter complete address, street, sector, city, and state"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setTab('customers')}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : isEdit ? 'Update Customer' : 'Register Customer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
