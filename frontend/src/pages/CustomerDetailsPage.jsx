import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, User, Gauge, Receipt, AlertCircle, PlusCircle } from 'lucide-react';

export default function CustomerDetailsPage({ customerId, setTab, setSelectedBillId }) {
  const [customer, setCustomer] = useState(null);
  const [readings, setReadings] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customerId) return;
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const [cData, rData, bData] = await Promise.all([
          api.getCustomerById(customerId),
          api.getMeterReadingsByCustomerId(customerId),
          api.getBillsByCustomerId(customerId)
        ]);
        setCustomer(cData);
        setReadings(rData || []);
        setBills(bData || []);
      } catch (err) {
        setError(err.message || 'Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [customerId]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="loading-box">
        <div className="spinner"></div>
        <p>Loading customer profile and history...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="alert alert-danger">
        <AlertCircle size={18} />
        <span>{error || 'Customer not found'}</span>
        <button className="btn btn-secondary btn-sm" onClick={() => setTab('customers')}>
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setTab('customers')}>
          <ArrowLeft size={14} />
          <span>Back to Customers</span>
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setTab('meter-readings')}>
            <Gauge size={14} />
            <span>Record Reading</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setTab('generate-bill')}>
            <PlusCircle size={14} />
            <span>Generate Bill</span>
          </button>
        </div>
      </div>

      {/* Customer Information Card */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="kpi-icon-badge kpi-icon-primary" style={{ width: '36px', height: '36px' }}>
              <User size={18} />
            </div>
            <div>
              <h3 className="card-title" style={{ margin: 0 }}>{customer.fullName}</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
                Consumer No: {customer.consumerNumber}
              </span>
            </div>
          </div>
          <div>
            <StatusBadge status={customer.status} />
          </div>
        </div>

        <div className="card-body">
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase' }}>Phone</div>
              <div style={{ fontWeight: 600 }}>{customer.phoneNumber}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase' }}>Email</div>
              <div style={{ fontWeight: 600 }}>{customer.email || 'Not Provided'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase' }}>Connection Type</div>
              <div style={{ fontWeight: 600, color: 'var(--primary-700)' }}>{customer.connectionType}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase' }}>Registration Date</div>
              <div style={{ fontWeight: 600 }}>{customer.registrationDate}</div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-100)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Installation Address
            </div>
            <div style={{ color: 'var(--slate-700)' }}>{customer.address}</div>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Receipt size={18} color="var(--primary-600)" />
            <span>Electricity Bills History ({bills.length})</span>
          </h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {bills.length === 0 ? (
            <div className="empty-state">
              <p>No bills generated for this consumer yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bill Number</th>
                    <th>Billing Period</th>
                    <th>Units (kWh)</th>
                    <th>Total Amount</th>
                    <th>Paid Amount</th>
                    <th>Due Balance</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.billNumber}</strong></td>
                      <td>{b.billingMonth}/{b.billingYear}</td>
                      <td>{b.unitsConsumed} units</td>
                      <td>{formatCurrency(b.totalAmount)}</td>
                      <td style={{ color: '#059669' }}>{formatCurrency(b.paidAmount)}</td>
                      <td style={{ color: b.outstandingBalance > 0 ? '#dc2626' : 'inherit', fontWeight: 600 }}>
                        {formatCurrency(b.outstandingBalance)}
                      </td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedBillId(b.id);
                            setTab('bill-details');
                          }}
                        >
                          View Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Meter Readings History */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Gauge size={18} color="var(--primary-600)" />
            <span>Meter Readings History ({readings.length})</span>
          </h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {readings.length === 0 ? (
            <div className="empty-state">
              <p>No meter readings recorded for this consumer yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Reading Date</th>
                    <th>Previous Reading</th>
                    <th>Current Reading</th>
                    <th>Units Consumed</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.billingMonth}/{r.billingYear}</strong></td>
                      <td>{r.readingDate}</td>
                      <td>{r.previousReading}</td>
                      <td>{r.currentReading}</td>
                      <td><strong style={{ color: 'var(--primary-700)' }}>{r.unitsConsumed} units</strong></td>
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
