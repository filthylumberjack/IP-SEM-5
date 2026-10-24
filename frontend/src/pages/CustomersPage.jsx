import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import { Search, UserPlus, Eye, Edit3, Trash2, PowerOff, AlertCircle } from 'lucide-react';

export default function CustomersPage({ setTab, setSelectedCustomerId, setEditingCustomer, showToast }) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalState, setModalState] = useState({ isOpen: false, customer: null, isDelete: false });

  const fetchCustomers = async (searchQuery = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllCustomers(searchQuery);
      setCustomers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomers(search);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleActionConfirm = async () => {
    if (!modalState.customer) return;
    const { customer, isDelete } = modalState;

    try {
      if (isDelete) {
        await api.deleteCustomer(customer.id);
        showToast(`Customer ${customer.consumerNumber} removed or safely deactivated`, 'success');
      } else {
        await api.deactivateCustomer(customer.id);
        showToast(`Customer ${customer.consumerNumber} marked as Inactive`, 'success');
      }
      setModalState({ isOpen: false, customer: null, isDelete: false });
      fetchCustomers(search);
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  return (
    <div>
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by consumer number or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <button className="btn btn-primary" onClick={() => setTab('add-customer')}>
            <UserPlus size={16} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Registered Consumers ({customers.length})</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-box">
              <div className="spinner"></div>
              <p>Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="empty-state">
              <p>No customers found matching your search.</p>
              <button className="btn btn-secondary btn-sm" onClick={() => setTab('add-customer')}>
                Register First Customer
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Consumer No</th>
                    <th>Full Name</th>
                    <th>Phone / Email</th>
                    <th>Address</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.consumerNumber}</strong>
                      </td>
                      <td>
                        <strong>{c.fullName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                          Registered: {c.registrationDate}
                        </div>
                      </td>
                      <td>
                        <div>{c.phoneNumber}</div>
                        {c.email && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{c.email}</div>
                        )}
                      </td>
                      <td style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.address}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-700)' }}>
                          {c.connectionType}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="View Profile & Billing History"
                            onClick={() => {
                              setSelectedCustomerId(c.id);
                              setTab('customer-details');
                            }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Edit Customer"
                            onClick={() => {
                              setEditingCustomer(c);
                              setTab('edit-customer');
                            }}
                          >
                            <Edit3 size={14} />
                          </button>
                          {c.status === 'ACTIVE' ? (
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Deactivate Customer"
                              onClick={() =>
                                setModalState({
                                  isOpen: true,
                                  customer: c,
                                  isDelete: false
                                })
                              }
                            >
                              <PowerOff size={14} color="#d97706" />
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline-danger btn-sm"
                              title="Delete/Deactivate Customer"
                              onClick={() =>
                                setModalState({
                                  isOpen: true,
                                  customer: c,
                                  isDelete: true
                                })
                              }
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        title={modalState.isDelete ? 'Remove Customer' : 'Deactivate Customer'}
        message={
          modalState.isDelete
            ? `Are you sure you want to delete ${modalState.customer?.consumerNumber} (${modalState.customer?.fullName})? If this customer has existing billing records, they will be safely deactivated to preserve financial history.`
            : `Are you sure you want to deactivate ${modalState.customer?.consumerNumber}? They will no longer be eligible for new meter readings or bills.`
        }
        confirmText={modalState.isDelete ? 'Delete / Deactivate' : 'Deactivate'}
        isDanger={modalState.isDelete}
        onConfirm={handleActionConfirm}
        onCancel={() => setModalState({ isOpen: false, customer: null, isDelete: false })}
      />
    </div>
  );
}
