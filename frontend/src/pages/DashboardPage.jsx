import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Users,
  Receipt,
  IndianRupee,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  UserPlus,
  Gauge,
  CreditCard,
  FilePlus
} from 'lucide-react';

export default function DashboardPage({ setTab, setSelectedBillId }) {
  const [summary, setSummary] = useState(null);
  const [recentBills, setRecentBills] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, billsData, paymentsData] = await Promise.all([
        api.getDashboardSummary(),
        api.getAllBills(),
        api.getAllPayments()
      ]);
      setSummary(sumData);
      setRecentBills(billsData ? billsData.slice(0, 5) : []);
      setRecentPayments(paymentsData ? paymentsData.slice(0, 5) : []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="loading-box">
        <div className="spinner"></div>
        <p>Loading real-time billing metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-danger">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchDashboardData}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* KPI Cards Row 1 */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-primary">
          <div className="kpi-info-col">
            <span className="kpi-label">Active Consumers</span>
            <span className="kpi-value">{summary?.totalActiveCustomers || 0}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px' }}>
              Total: {summary?.totalCustomers || 0} registered
            </span>
          </div>
          <div className="kpi-icon-badge kpi-icon-primary">
            <Users size={24} />
          </div>
        </div>

        <div className="kpi-card kpi-info">
          <div className="kpi-info-col">
            <span className="kpi-label">Total Billed</span>
            <span className="kpi-value">{formatCurrency(summary?.totalBilledAmount)}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px' }}>
              {summary?.totalBillsGenerated || 0} bills generated
            </span>
          </div>
          <div className="kpi-icon-badge kpi-icon-info">
            <Receipt size={24} />
          </div>
        </div>

        <div className="kpi-card kpi-success">
          <div className="kpi-info-col">
            <span className="kpi-label">Total Collected</span>
            <span className="kpi-value">{formatCurrency(summary?.totalPaymentsReceived)}</span>
            <span style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px', fontWeight: 500 }}>
              {summary?.paidBillsCount || 0} bills fully cleared
            </span>
          </div>
          <div className="kpi-icon-badge kpi-icon-success">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="kpi-card kpi-danger">
          <div className="kpi-info-col">
            <span className="kpi-label">Outstanding Balance</span>
            <span className="kpi-value">{formatCurrency(summary?.totalOutstandingBalance)}</span>
            <span style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '4px', fontWeight: 500 }}>
              {summary?.overdueBillsCount || 0} overdue / {summary?.pendingBillsCount || 0} pending
            </span>
          </div>
          <div className="kpi-icon-badge kpi-icon-danger">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Quick Operations</h3>
        </div>
        <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={() => setTab('add-customer')}>
            <UserPlus size={16} />
            <span>Add New Customer</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setTab('meter-readings')}>
            <Gauge size={16} />
            <span>Record Meter Reading</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setTab('generate-bill')}>
            <FilePlus size={16} />
            <span>Generate Monthly Bill</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setTab('record-payment')}>
            <CreditCard size={16} />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Tables Row: Recent Bills & Recent Payments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Bills */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Bills</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setTab('bills')}>
              View All <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bill Number</th>
                    <th>Consumer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBills.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                        No bills generated yet
                      </td>
                    </tr>
                  ) : (
                    recentBills.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <strong>{b.billNumber}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                            {b.billingMonth}/{b.billingYear}
                          </div>
                        </td>
                        <td>
                          <div>{b.customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{b.consumerNumber}</div>
                        </td>
                        <td>
                          <strong>{formatCurrency(b.totalAmount)}</strong>
                          {b.outstandingBalance > 0 && (
                            <div style={{ fontSize: '0.72rem', color: '#dc2626' }}>
                              Due: {formatCurrency(b.outstandingBalance)}
                            </div>
                          )}
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
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Payments</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setTab('payments')}>
              View All <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Txn Reference</th>
                    <th>Consumer</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                        No payments recorded yet
                      </td>
                    </tr>
                  ) : (
                    recentPayments.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.transactionReference}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{p.billNumber}</div>
                        </td>
                        <td>
                          <div>{p.customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{p.consumerNumber}</div>
                        </td>
                        <td>
                          <strong style={{ color: '#059669' }}>{formatCurrency(p.amountPaid)}</strong>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--slate-600)' }}>
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                          {p.paymentDate}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
