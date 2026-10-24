/**
 * Centralized API Client for Electricity Bill Management System
 * Connects React Frontend to Spring Boot REST backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.details = data?.details;
      throw error;
    }

    return data?.data !== undefined ? data.data : data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        `Backend server unreachable at ${API_BASE_URL}. Ensure Spring Boot application is running on port 8080.`
      );
    }
    throw err;
  }
}

export const api = {
  // Dashboard & Reports
  getDashboardSummary: () => request('/dashboard/summary'),
  getMonthlyReports: () => request('/reports/monthly'),

  // Customers
  getAllCustomers: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/customers${query}`);
  },
  getCustomerById: (id) => request(`/customers/${id}`),
  getCustomerByConsumerNumber: (consumerNumber) => request(`/customers/consumer/${encodeURIComponent(consumerNumber)}`),
  createCustomer: (customer) => request('/customers', {
    method: 'POST',
    body: JSON.stringify(customer)
  }),
  updateCustomer: (id, customer) => request(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(customer)
  }),
  deleteCustomer: (id) => request(`/customers/${id}`, {
    method: 'DELETE'
  }),
  deactivateCustomer: (id) => request(`/customers/${id}/deactivate`, {
    method: 'PATCH'
  }),

  // Meter Readings
  recordMeterReading: (reading) => request('/meter-readings', {
    method: 'POST',
    body: JSON.stringify(reading)
  }),
  getAllMeterReadings: () => request('/meter-readings'),
  getMeterReadingById: (id) => request(`/meter-readings/${id}`),
  getMeterReadingsByCustomerId: (customerId) => request(`/customers/${customerId}/meter-readings`),
  getLatestReadingForCustomer: (customerId) => request(`/customers/${customerId}/meter-readings/latest-reading`),

  // Bills
  generateBill: (billRequest) => request('/bills/generate', {
    method: 'POST',
    body: JSON.stringify(billRequest)
  }),
  getAllBills: () => request('/bills'),
  getBillById: (id) => request(`/bills/${id}`),
  getBillByNumber: (billNumber) => request(`/bills/number/${encodeURIComponent(billNumber)}`),
  getBillsByCustomerId: (customerId) => request(`/customers/${customerId}/bills`),
  getBillsByStatus: (status) => request(`/bills/status/${status}`),
  getBillsByPeriod: (month, year) => request(`/bills/period?month=${month}&year=${year}`),

  // Payments
  processPayment: (payment) => request('/payments', {
    method: 'POST',
    body: JSON.stringify(payment)
  }),
  getAllPayments: () => request('/payments'),
  getPaymentById: (id) => request(`/payments/${id}`),
  getPaymentsByBillId: (billId) => request(`/bills/${billId}/payments`),

  // Tariffs
  getAllTariffs: () => request('/tariffs'),
  getTariffByType: (type) => request(`/tariffs/connection-type/${type}`),
  updateTariff: (id, tariff) => request(`/tariffs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tariff)
  })
};

export default api;
