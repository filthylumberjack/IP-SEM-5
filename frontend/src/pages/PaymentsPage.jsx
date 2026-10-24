import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { History, Search, CreditCard, Eye, AlertCircle } from 'lucide-react';

export default function PaymentsPage({ setTab, setSelectedBillId }) {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllPayments();
      setPayments(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  const filteredPayments = payments.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.transactionReference?.toLowerCase().includes(q) ||
      p.billNumber?.toLowerCase().includes(q) ||
      p.customerName?.toLowerCase().includes(q) ||
      p.consumerNumber?.toLowerCase().includes(q) ||
      p.paymentMethod?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search payments by txn ref, bill, consumer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <button className="btn btn-primary" onClick={() => setTab('record-payment')}>
            <CreditCard size={16} />
            <span>Record Payment</span>
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
          <h3 className="card-title">
            <History size={18} color="var(--primary-600)" />
            <span>Payment Audit History ({filteredPayments.length})</span>
          </h3>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-box">
              <div className="spinner"></div>
              <p>Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="empty-state">
              <p>No payment records found.</p>
              <button className="btn btn-secondary btn-sm" onClick={() => setTab('record-payment')}>
                Record a Payment
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Txn Reference</th>
                    <th>Bill Number</th>
                    <th>Consumer</th>
                    <th>Amount Paid</th>
                    <th>Method</th>
                    <th>Payment Date</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.transactionReference}</strong>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                          {p.billNumber}
                        </span>
                      </td>
                      <td>
                        <strong>{p.customerName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{p.consumerNumber}</div>
                      </td>
                      <td>
                        <strong style={{ color: '#059669', fontSize: '0.95rem' }}>
                          {formatCurrency(p.amountPaid)}
                        </strong>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--slate-100)',
                            color: 'var(--slate-700)'
                          }}
                        >
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td>{p.paymentDate}</td>
                      <td>
                        <span className="badge badge-paid">● Success</span>
                      </td>
                      <td style={{ color: 'var(--slate-500)', fontSize: '0.85rem', maxWidth: '180px' }}>
                        {p.remarks || '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="View Associated Bill"
                            onClick={() => {
                              setSelectedBillId(p.billId);
                              setTab('bill-details');
                            }}
                          >
                            <Eye size={14} />
                            <span>View Bill</span>
                          </button>
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
    </div>
  );
}
