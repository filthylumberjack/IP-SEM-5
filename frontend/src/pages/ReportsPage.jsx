import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BarChart3, Download, AlertCircle, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getMonthlyReports();
        setReports(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load monthly reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  const exportToCSV = () => {
    if (reports.length === 0) return;

    const headers = ['Billing Period', 'Month', 'Year', 'Total Bills', 'Units Consumed (kWh)', 'Billed Amount (INR)', 'Collected Amount (INR)', 'Outstanding Amount (INR)', 'Collection Efficiency (%)'];
    const rows = reports.map((r) => {
      const efficiency = r.totalBilledAmount > 0 ? ((r.totalCollectedAmount / r.totalBilledAmount) * 100).toFixed(1) : '100.0';
      return [
        `"${r.monthName}"`,
        r.billingMonth,
        r.billingYear,
        r.totalBills,
        r.totalUnitsConsumed,
        r.totalBilledAmount,
        r.totalCollectedAmount,
        r.totalOutstandingAmount,
        `${efficiency}%`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `electricity_monthly_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)' }}>
            Administrative Monthly Performance Reports
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
            Aggregated revenue, unit consumption, and collection statistics computed from database records
          </p>
        </div>

        <button className="btn btn-secondary" onClick={exportToCSV} disabled={reports.length === 0}>
          <Download size={16} />
          <span>Export CSV Report</span>
        </button>
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
            <BarChart3 size={18} color="var(--primary-600)" />
            <span>Monthly Performance Breakdown</span>
          </h3>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-box">
              <div className="spinner"></div>
              <p>Aggregating monthly metrics from database...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="empty-state">
              <p>No billing cycles recorded to generate reports.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Billing Cycle</th>
                    <th>Bills Issued</th>
                    <th>Units Consumed (kWh)</th>
                    <th>Total Billed</th>
                    <th>Total Collected</th>
                    <th>Outstanding Due</th>
                    <th>Collection Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, idx) => {
                    const efficiency =
                      r.totalBilledAmount > 0
                        ? ((r.totalCollectedAmount / r.totalBilledAmount) * 100).toFixed(1)
                        : '100.0';

                    return (
                      <tr key={idx}>
                        <td>
                          <strong>{r.monthName}</strong>
                          <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>
                            Period: {r.billingMonth}/{r.billingYear}
                          </div>
                        </td>
                        <td>{r.totalBills} bills</td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--primary-700)' }}>
                            {r.totalUnitsConsumed} kWh
                          </span>
                        </td>
                        <td>
                          <strong>{formatCurrency(r.totalBilledAmount)}</strong>
                        </td>
                        <td>
                          <strong style={{ color: '#059669' }}>
                            {formatCurrency(r.totalCollectedAmount)}
                          </strong>
                        </td>
                        <td>
                          <strong style={{ color: r.totalOutstandingAmount > 0 ? '#dc2626' : '#059669' }}>
                            {formatCurrency(r.totalOutstandingAmount)}
                          </strong>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div
                              style={{
                                width: '70px',
                                height: '8px',
                                backgroundColor: 'var(--slate-200)',
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}
                            >
                              <div
                                style={{
                                  width: `${Math.min(100, Number(efficiency))}%`,
                                  height: '100%',
                                  backgroundColor: Number(efficiency) >= 70 ? '#10b981' : '#f59e0b'
                                }}
                              ></div>
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{efficiency}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
