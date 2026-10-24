import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FilePlus, Calculator, AlertCircle, ArrowRight } from 'lucide-react';

export default function GenerateBillPage({ setTab, setSelectedBillId, showToast }) {
  const [customers, setCustomers] = useState([]);
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentDate = new Date();
  const [formData, setFormData] = useState({
    customerId: '',
    billingMonth: currentDate.getMonth() === 0 ? 12 : currentDate.getMonth(),
    billingYear: currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear(),
    billDate: currentDate.toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [readingFound, setReadingFound] = useState(null);
  const [checkingReading, setCheckingReading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  useEffect(() => {
    const fetchPrerequisites = async () => {
      setLoading(true);
      try {
        const [cData, tData] = await Promise.all([
          api.getAllCustomers(),
          api.getAllTariffs()
        ]);
        const active = (cData || []).filter((c) => c.status === 'ACTIVE');
        setCustomers(active);
        setTariffs(tData || []);
        if (active.length > 0) {
          setFormData((prev) => ({ ...prev, customerId: active[0].id }));
        }
      } catch (err) {
        setError(err.message || 'Failed to initialize bill generation');
      } finally {
        setLoading(false);
      }
    };
    fetchPrerequisites();
  }, []);

  // Check if a meter reading exists for selected customer and month/year
  useEffect(() => {
    if (!formData.customerId) return;
    const checkReading = async () => {
      setCheckingReading(true);
      setReadingFound(null);
      try {
        const readings = await api.getMeterReadingsByCustomerId(formData.customerId);
        const match = (readings || []).find(
          (r) => Number(r.billingMonth) === Number(formData.billingMonth) && Number(r.billingYear) === Number(formData.billingYear)
        );
        setReadingFound(match || false);
      } catch (err) {
        setReadingFound(false);
      } finally {
        setCheckingReading(false);
      }
    };
    checkReading();
  }, [formData.customerId, formData.billingMonth, formData.billingYear]);

  const selectedCustomer = customers.find((c) => Number(c.id) === Number(formData.customerId));
  const activeTariff = tariffs.find((t) => t.connectionType === selectedCustomer?.connectionType) || {
    slab1Limit: 100,
    slab1Rate: 3.0,
    slab2Limit: 200,
    slab2Rate: 5.0,
    slab3Rate: 7.0,
    fixedCharge: 50.0,
    taxPercentage: 5.0
  };

  // Preview progressive calculation if reading is found
  const units = readingFound ? Number(readingFound.unitsConsumed) : 0;
  let slab1Units = 0;
  let slab1Cost = 0;
  let slab2Units = 0;
  let slab2Cost = 0;
  let slab3Units = 0;
  let slab3Cost = 0;

  if (units > 0) {
    slab1Units = Math.min(units, activeTariff.slab1Limit);
    slab1Cost = slab1Units * activeTariff.slab1Rate;

    const slab2Cap = activeTariff.slab2Limit - activeTariff.slab1Limit;
    if (units > activeTariff.slab1Limit) {
      slab2Units = Math.min(units - activeTariff.slab1Limit, slab2Cap);
      slab2Cost = slab2Units * activeTariff.slab2Rate;
    }

    if (units > activeTariff.slab2Limit) {
      slab3Units = units - activeTariff.slab2Limit;
      slab3Cost = slab3Units * activeTariff.slab3Rate;
    }
  }

  const energyChargePreview = (slab1Cost + slab2Cost + slab3Cost).toFixed(2);
  const fixedChargePreview = Number(activeTariff.fixedCharge || 0).toFixed(2);
  const taxableBase = Number(energyChargePreview) + Number(fixedChargePreview);
  const taxAmountPreview = ((taxableBase * Number(activeTariff.taxPercentage || 0)) / 100).toFixed(2);
  const totalAmountPreview = (taxableBase + Number(taxAmountPreview)).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!readingFound) {
      setGenerationError('No meter reading found for this period. Please record meter reading first.');
      return;
    }

    setSubmitting(true);
    setGenerationError(null);

    try {
      const generatedBill = await api.generateBill({
        customerId: Number(formData.customerId),
        billingMonth: Number(formData.billingMonth),
        billingYear: Number(formData.billingYear),
        billDate: formData.billDate,
        dueDate: formData.dueDate
      });

      showToast(`Bill ${generatedBill.billNumber} generated successfully!`, 'success');
      setSelectedBillId(generatedBill.id);
      setTab('bill-details');
    } catch (err) {
      setGenerationError(err.message || 'Failed to generate bill');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <FilePlus size={20} color="var(--primary-600)" />
            <span>Generate Electricity Bill</span>
          </h3>
        </div>

        <div className="card-body">
          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {generationError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{generationError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Select Consumer <span className="required">*</span>
                </label>
                <select
                  name="customerId"
                  className="form-control"
                  value={formData.customerId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customerId: e.target.value }))}
                  required
                >
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, billingMonth: e.target.value }))}
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, billingYear: e.target.value }))}
                    min="2000"
                    max="2035"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bill Generation Date</label>
                <input
                  type="date"
                  name="billDate"
                  className="form-control"
                  value={formData.billDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, billDate: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  className="form-control"
                  value={formData.dueDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Reading Status Alert */}
            <div style={{ marginTop: '1.5rem' }}>
              {checkingReading ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                  Checking meter reading status...
                </div>
              ) : readingFound ? (
                <div className="alert alert-success" style={{ margin: 0 }}>
                  <div>
                    <strong>Meter Reading Available:</strong> {readingFound.unitsConsumed} units consumed (Previous:{' '}
                    {readingFound.previousReading} kWh, Current: {readingFound.currentReading} kWh).
                  </div>
                </div>
              ) : (
                <div className="alert alert-danger" style={{ margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    No meter reading found for period {formData.billingMonth}/{formData.billingYear}.
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setTab('meter-readings')}
                  >
                    Record Reading Now
                  </button>
                </div>
              )}
            </div>

            {/* Progressive Tariff Calculation Breakdown Preview */}
            {readingFound && (
              <div
                style={{
                  marginTop: '1.5rem',
                  backgroundColor: 'var(--slate-50)',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem'
                }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calculator size={18} color="var(--primary-600)" />
                  <span>Progressive Tariff Slab Breakdown ({selectedCustomer?.connectionType})</span>
                </h4>

                <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Slab 1 (First {activeTariff.slab1Limit} units @ ₹{activeTariff.slab1Rate}/unit):</span>
                    <strong>{slab1Units} units = ₹{slab1Cost.toFixed(2)}</strong>
                  </div>
                  {units > activeTariff.slab1Limit && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Slab 2 (Next {activeTariff.slab2Limit - activeTariff.slab1Limit} units @ ₹{activeTariff.slab2Rate}/unit):</span>
                      <strong>{slab2Units} units = ₹{slab2Cost.toFixed(2)}</strong>
                    </div>
                  )}
                  {units > activeTariff.slab2Limit && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Slab 3 (Above {activeTariff.slab2Limit} units @ ₹{activeTariff.slab3Rate}/unit):</span>
                      <strong>{slab3Units} units = ₹{slab3Cost.toFixed(2)}</strong>
                    </div>
                  )}

                  <hr style={{ border: 'none', borderTop: '1px dashed var(--slate-300)', margin: '0.25rem 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary-700)', fontWeight: 600 }}>
                    <span>Total Energy Charges:</span>
                    <span>₹{energyChargePreview}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-600)' }}>
                    <span>Fixed Service Charge:</span>
                    <span>₹{fixedChargePreview}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-600)' }}>
                    <span>Electricity Duty / Tax ({activeTariff.taxPercentage}%):</span>
                    <span>₹{taxAmountPreview}</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '2px solid var(--slate-300)',
                      paddingTop: '0.5rem',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--slate-900)'
                    }}
                  >
                    <span>Estimated Total Payable:</span>
                    <span style={{ color: 'var(--primary-700)' }}>₹{totalAmountPreview}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !readingFound}
              >
                {submitting ? 'Generating Bill...' : 'Confirm & Generate Bill'}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
