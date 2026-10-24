import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Receipt, Search, Filter, CreditCard, Eye, AlertCircle, FilePlus } from 'lucide-react';

export default function BillsPage({ setTab, setSelectedBillId }) {
  const [bills, setBills] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBills = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (statusFilter !== 'ALL') {
        data = await api.getBillsByStatus(statusFilter);
      } else {
        data = await api.getAllBills();
      }
      setBills(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [statusFilter]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  const filteredBills = bills.filter((b) => {
    const query = searchTerm.toLowerCase();
    return (
      b.billNumber?.toLowerCase().includes(query) ||
      b.customerName?.toLowerCase().includes(query) ||
      b.consumerNumber?.toLowerCase().includes(query) ||
      `${b.billingMonth}/${b.billingYear}`.includes(query)
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
            placeholder="Search by bill number, consumer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--slate-500)" />
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={() => setTab('generate-bill')}>
            <FilePlus size={16} />
            <span>Generate Bill</span>
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
            <Receipt size={18} color="var(--primary-600)" />
            <span>Electricity Bills ({filteredBills.length})</span>
          </h3>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-box">
              <div className="spinner"></div>
              <p>Loading electricity bills...</p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="empty-state">
              <p>No bills found for the selected criteria.</p>
              <button className="btn btn-secondary btn-sm" onClick={() => setTab('generate-bill')}>
                Generate a Bill
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bill Number</th>
                    <th>Consumer</th>
                    <th>Period</th>
                    <th>Due Date</th>
                    <th>Units</th>
                    <th>Total</th>
                    <th>Outstanding</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.billNumber}</strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>
                          Billed: {b.billDate}
                        </div>
                      </td>
                      <td>
                        <strong>{b.customerName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{b.consumerNumber}</div>
                      </td>
                      <td>
                        <strong>{b.billingMonth}/{b.billingYear}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>{b.dueDate}</span>
                      </td>
                      <td>{b.unitsConsumed} units</td>
                      <td>
                        <strong>{formatCurrency(b.totalAmount)}</strong>
                      </td>
                      <td>
                        <strong style={{ color: b.outstandingBalance > 0 ? '#dc2626' : '#059669' }}>
                          {formatCurrency(b.outstandingBalance)}
                        </strong>
                      </td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="View Detailed Invoice"
                            onClick={() => {
                              setSelectedBillId(b.id);
                              setTab('bill-details');
                            }}
                          >
                            <Eye size={14} />
                            <span>Invoice</span>
                          </button>
                          {b.outstandingBalance > 0 && (
                            <button
                              className="btn btn-primary btn-sm"
                              title="Pay Bill"
                              onClick={() => {
                                setSelectedBillId(b.id);
                                setTab('record-payment');
                              }}
                            >
                              <CreditCard size={14} />
                              <span>Pay</span>
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
    </div>
  );
}
