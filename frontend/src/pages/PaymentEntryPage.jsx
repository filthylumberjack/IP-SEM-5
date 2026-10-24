import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CreditCard, IndianRupee, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function PaymentEntryPage({ billId, setTab, setSelectedBillId, showToast }) {
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    billId: billId ? String(billId) : '',
    amountPaid: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
    transactionReference: '',
    remarks: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    const fetchUnpaidBills = async () => {
      setLoading(true);
      setError(null);
      try {
        const allBills = await api.getAllBills();
        const pendingOrPartial = (allBills || []).filter(
          (b) => b.outstandingBalance > 0 && b.status !== 'PAID'
        );
        setUnpaidBills(pendingOrPartial);

        if (billId) {
          const match = pendingOrPartial.find((b) => Number(b.id) === Number(billId));
          if (match) {
            setFormData((prev) => ({
              ...prev,
              billId: String(billId),
              amountPaid: match.outstandingBalance.toFixed(2)
            }));
          }
        } else if (pendingOrPartial.length > 0) {
          setFormData((prev) => ({
            ...prev,
            billId: String(pendingOrPartial[0].id),
            amountPaid: pendingOrPartial[0].outstandingBalance.toFixed(2)
          }));
        }
      } catch (err) {
        setError(err.message || 'Failed to load unpaid bills');
      } finally {
        setLoading(false);
      }
    };
    fetchUnpaidBills();
  }, [billId]);

  const selectedBill = unpaidBills.find((b) => String(b.id) === String(formData.billId));

  const handleBillSelect = (newBillId) => {
    const match = unpaidBills.find((b) => String(b.id) === String(newBillId));
    setFormData((prev) => ({
      ...prev,
      billId: newBillId,
      amountPaid: match ? match.outstandingBalance.toFixed(2) : ''
    }));
  };

  const handleQuickAmount = (ratio) => {
    if (!selectedBill) return;
    const calculated = (Number(selectedBill.outstandingBalance) * ratio).toFixed(2);
    setFormData((prev) => ({ ...prev, amountPaid: calculated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBill) {
      setFormError('Please select a valid bill with an outstanding balance');
      return;
    }

    const payVal = Number(formData.amountPaid);
    if (isNaN(payVal) || payVal <= 0) {
      setFormError('Payment amount must be greater than zero');
      return;
    }

    if (payVal > Number(selectedBill.outstandingBalance)) {
      setFormError(
        `Payment amount (₹${payVal}) cannot exceed outstanding balance (₹${selectedBill.outstandingBalance})`
      );
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const response = await api.processPayment({
        billId: Number(formData.billId),
        amountPaid: payVal,
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        transactionReference: formData.transactionReference.trim() || undefined,
        remarks: formData.remarks
      });

      showToast(
        `Payment of ₹${payVal} successfully recorded (Txn: ${response.transactionReference})!`,
        'success'
      );
      setSelectedBillId(selectedBill.id);
      setTab('bill-details');
    } catch (err) {
      setFormError(err.message || 'Failed to process payment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <CreditCard size={20} color="var(--primary-600)" />
            <span>Record Electricity Bill Payment</span>
          </h3>
        </div>

        <div className="card-body">
          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {formError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          {unpaidBills.length === 0 && !loading ? (
            <div className="empty-state">
              <CheckCircle2 size={48} color="#10b981" />
              <h3>All Bills Settled!</h3>
              <p>There are currently no outstanding or overdue electricity bills.</p>
              <button className="btn btn-secondary btn-sm" onClick={() => setTab('bills')}>
                View All Bills
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">
                    Select Bill to Pay <span className="required">*</span>
                  </label>
                  <select
                    name="billId"
                    className="form-control"
                    value={formData.billId}
                    onChange={(e) => handleBillSelect(e.target.value)}
                    required
                  >
                    {unpaidBills.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.billNumber} | {b.consumerNumber} ({b.customerName}) | Due:{' '}
                        {formatCurrency(b.outstandingBalance)} | Due Date: {b.dueDate}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBill && (
                  <div
                    style={{
                      gridColumn: '1 / -1',
                      backgroundColor: 'var(--primary-50)',
                      border: '1px solid var(--primary-200)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                        Consumer
                      </div>
                      <div style={{ fontWeight: 700 }}>{selectedBill.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)' }}>
                        {selectedBill.consumerNumber}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                        Total Billed
                      </div>
                      <div style={{ fontWeight: 700 }}>{formatCurrency(selectedBill.totalAmount)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                        Paid: {formatCurrency(selectedBill.paidAmount)}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                        Outstanding Due
                      </div>
                      <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '1.2rem' }}>
                        {formatCurrency(selectedBill.outstandingBalance)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        Due Date: {selectedBill.dueDate}
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    Amount to Pay (INR) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="amountPaid"
                    className="form-control"
                    placeholder="Enter payment amount"
                    value={formData.amountPaid}
                    onChange={(e) => setFormData((prev) => ({ ...prev, amountPaid: e.target.value }))}
                    max={selectedBill ? selectedBill.outstandingBalance : undefined}
                    required
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleQuickAmount(1.0)}
                    >
                      Full Balance (100%)
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleQuickAmount(0.5)}
                    >
                      Partial (50%)
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Payment Method <span className="required">*</span>
                  </label>
                  <select
                    name="paymentMethod"
                    className="form-control"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    required
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="CASH">Cash Collection Counter</option>
                    <option value="NET_BANKING">Internet Banking (NEFT / RTGS)</option>
                    <option value="DEBIT_CARD">Debit Card POS</option>
                    <option value="CREDIT_CARD">Credit Card Online</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Date</label>
                  <input
                    type="date"
                    name="paymentDate"
                    className="form-control"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, paymentDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Transaction Reference (Optional)</label>
                  <input
                    type="text"
                    name="transactionReference"
                    className="form-control"
                    placeholder="Leave empty to auto-generate unique TXN ID"
                    value={formData.transactionReference}
                    onChange={(e) => setFormData((prev) => ({ ...prev, transactionReference: e.target.value }))}
                  />
                  <span className="form-hint">E.g. TXN-20261024-ABCDEF</span>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <label className="form-label">Payment Remarks / Notes</label>
                <input
                  type="text"
                  name="remarks"
                  className="form-control"
                  placeholder="Optional remarks, e.g. Paid at billing counter, bank confirmation id"
                  value={formData.remarks}
                  onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setTab('bills')}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !selectedBill}
                >
                  {submitting ? 'Recording Payment...' : 'Record Payment & Settle Bill'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
