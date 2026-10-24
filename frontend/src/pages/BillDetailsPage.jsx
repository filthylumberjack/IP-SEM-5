import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, Printer, CreditCard, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function BillDetailsPage({ billId, setTab, setSelectedBillId }) {
  const [bill, setBill] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!billId) return;
    const fetchBillAndPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const [bData, pData] = await Promise.all([
          api.getBillById(billId),
          api.getPaymentsByBillId(billId)
        ]);
        setBill(bData);
        setPayments(pData || []);
      } catch (err) {
        setError(err.message || 'Failed to load bill invoice details');
      } finally {
        setLoading(false);
      }
    };
    fetchBillAndPayments();
  }, [billId]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="loading-box">
        <div className="spinner"></div>
        <p>Generating bill invoice view...</p>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="alert alert-danger">
        <AlertCircle size={18} />
        <span>{error || 'Bill not found'}</span>
        <button className="btn btn-secondary btn-sm" onClick={() => setTab('bills')}>
          Back to Bills
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setTab('bills')}>
          <ArrowLeft size={14} />
          <span>Back to Bills</span>
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Invoice</span>
          </button>
          {bill.outstandingBalance > 0 && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedBillId(bill.id);
                setTab('record-payment');
              }}
            >
              <CreditCard size={16} />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Invoice Layout */}
      <div className="invoice-card">
        {/* Header */}
        <div className="invoice-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="logo-badge" style={{ width: '48px', height: '48px' }}>
              <Zap size={26} fill="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                VoltFlow Distribution Ltd.
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                Official Electricity Utility & Billing Invoice
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--slate-400)', fontWeight: 700 }}>
              INVOICE NO
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-700)' }}>
              {bill.billNumber}
            </div>
            <div style={{ marginTop: '0.35rem' }}>
              <StatusBadge status={bill.status} />
            </div>
          </div>
        </div>

        {/* Consumer & Meter Meta */}
        <div className="invoice-meta-grid">
          <div>
            <div className="invoice-section-title">Billed To (Consumer Details)</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              {bill.customerName}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '2px' }}>
              Consumer Number: <strong>{bill.consumerNumber}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
              Tariff Category: <strong>{bill.connectionType}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
              Phone: {bill.customerPhone}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '4px' }}>
              Address: {bill.customerAddress}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div className="invoice-section-title">Billing Cycle & Meter Details</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
              Billing Period: <strong>{bill.billingMonth}/{bill.billingYear}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
              Bill Date: <strong>{bill.billDate}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 600 }}>
              Due Date: {bill.dueDate}
            </div>
            <div style={{ marginTop: '0.75rem', padding: '0.65rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)', textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                Previous Meter: <strong>{bill.previousReading} kWh</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                Current Meter: <strong>{bill.currentReading} kWh</strong>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-700)', marginTop: '2px' }}>
                Net Consumption: {bill.unitsConsumed} Units
              </div>
            </div>
          </div>
        </div>

        {/* Charges Breakdown Table */}
        <div className="invoice-section-title">Itemized Charges Breakdown</div>
        <table className="invoice-breakdown-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Calculation Basis</th>
              <th style={{ textAlign: 'right' }}>Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Energy Charges</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  Progressive tariff slabs based on {bill.unitsConsumed} units consumed
                </div>
              </td>
              <td style={{ fontSize: '0.85rem' }}>Tiered Slabs (₹3/₹5/₹7)</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(bill.energyCharges)}</td>
            </tr>

            <tr>
              <td>
                <strong>Fixed Service Charge</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  Monthly infrastructure & meter maintenance charge
                </div>
              </td>
              <td style={{ fontSize: '0.85rem' }}>Fixed standard tariff</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(bill.fixedCharges)}</td>
            </tr>

            <tr>
              <td>
                <strong>Electricity Duty / State Tax</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  Government statutory levy
                </div>
              </td>
              <td style={{ fontSize: '0.85rem' }}>Applicable percentage</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(bill.taxAmount)}</td>
            </tr>

            {bill.lateFee > 0 && (
              <tr>
                <td style={{ color: '#dc2626' }}>
                  <strong>Late Payment Surcharge</strong>
                  <div style={{ fontSize: '0.75rem' }}>Applied for overdue payment</div>
                </td>
                <td style={{ fontSize: '0.85rem', color: '#dc2626' }}>Late fee surcharge</td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>
                  {formatCurrency(bill.lateFee)}
                </td>
              </tr>
            )}

            {bill.subsidyAmount > 0 && (
              <tr>
                <td style={{ color: '#059669' }}>
                  <strong>Government Tariff Subsidy</strong>
                  <div style={{ fontSize: '0.75rem' }}>Direct benefit transfer rebate</div>
                </td>
                <td style={{ fontSize: '0.85rem', color: '#059669' }}>Government rebate</td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                  - {formatCurrency(bill.subsidyAmount)}
                </td>
              </tr>
            )}

            <tr className="invoice-total-row">
              <td colSpan="2">
                <strong>Total Billed Amount</strong>
              </td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(bill.totalAmount)}</td>
            </tr>

            <tr>
              <td colSpan="2" style={{ color: '#059669', fontWeight: 600 }}>
                Total Payments Received
              </td>
              <td style={{ textAlign: 'right', color: '#059669', fontWeight: 700 }}>
                {formatCurrency(bill.paidAmount)}
              </td>
            </tr>

            <tr style={{ backgroundColor: bill.outstandingBalance > 0 ? '#fef2f2' : '#f0fdf4' }}>
              <td colSpan="2" style={{ fontWeight: 800, fontSize: '1.1rem', color: bill.outstandingBalance > 0 ? '#dc2626' : '#059669' }}>
                Outstanding Amount Due
              </td>
              <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.15rem', color: bill.outstandingBalance > 0 ? '#dc2626' : '#059669' }}>
                {formatCurrency(bill.outstandingBalance)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Payments History for this Bill */}
        <div style={{ marginTop: '2rem' }}>
          <div className="invoice-section-title">Payment Audit Records ({payments.length})</div>
          {payments.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontStyle: 'italic' }}>
              No payments recorded yet for this invoice.
            </p>
          ) : (
            <table className="data-table" style={{ fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th>Transaction Reference</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Amount Paid</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.transactionReference}</strong></td>
                    <td>{p.paymentDate}</td>
                    <td>{p.paymentMethod}</td>
                    <td><strong style={{ color: '#059669' }}>{formatCurrency(p.amountPaid)}</strong></td>
                    <td style={{ color: 'var(--slate-500)' }}>{p.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
