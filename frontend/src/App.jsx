import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

// Pages
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import CustomerFormPage from './pages/CustomerFormPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import MeterReadingPage from './pages/MeterReadingPage';
import GenerateBillPage from './pages/GenerateBillPage';
import BillsPage from './pages/BillsPage';
import BillDetailsPage from './pages/BillDetailsPage';
import PaymentEntryPage from './pages/PaymentEntryPage';
import PaymentsPage from './pages/PaymentsPage';
import ReportsPage from './pages/ReportsPage';
import TariffsPage from './pages/TariffsPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Global Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    showToast('Refreshed data from server', 'success');
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Executive Overview';
      case 'customers':
        return 'Customer Directory';
      case 'add-customer':
        return 'Register Consumer';
      case 'edit-customer':
        return 'Edit Customer Profile';
      case 'customer-details':
        return 'Consumer Details & History';
      case 'meter-readings':
        return 'Meter Readings Management';
      case 'generate-bill':
        return 'Generate Electricity Bill';
      case 'bills':
        return 'Electricity Bills';
      case 'bill-details':
        return 'Invoice Details';
      case 'record-payment':
        return 'Record Bill Payment';
      case 'payments':
        return 'Payment Records & Audits';
      case 'reports':
        return 'Monthly Performance Reports';
      case 'tariffs':
        return 'Progressive Tariff Configuration';
      default:
        return 'Electricity Bill Management';
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardPage
            key={refreshKey}
            setTab={setCurrentTab}
            setSelectedBillId={setSelectedBillId}
          />
        );
      case 'customers':
        return (
          <CustomersPage
            key={refreshKey}
            setTab={setCurrentTab}
            setSelectedCustomerId={setSelectedCustomerId}
            setEditingCustomer={setEditingCustomer}
            showToast={showToast}
          />
        );
      case 'add-customer':
        return (
          <CustomerFormPage
            setTab={setCurrentTab}
            showToast={showToast}
          />
        );
      case 'edit-customer':
        return (
          <CustomerFormPage
            editingCustomer={editingCustomer}
            setTab={setCurrentTab}
            showToast={showToast}
          />
        );
      case 'customer-details':
        return (
          <CustomerDetailsPage
            customerId={selectedCustomerId}
            setTab={setCurrentTab}
            setSelectedBillId={setSelectedBillId}
          />
        );
      case 'meter-readings':
        return (
          <MeterReadingPage
            key={refreshKey}
            setTab={setCurrentTab}
            showToast={showToast}
          />
        );
      case 'generate-bill':
        return (
          <GenerateBillPage
            key={refreshKey}
            setTab={setCurrentTab}
            setSelectedBillId={setSelectedBillId}
            showToast={showToast}
          />
        );
      case 'bills':
        return (
          <BillsPage
            key={refreshKey}
            setTab={setCurrentTab}
            setSelectedBillId={setSelectedBillId}
          />
        );
      case 'bill-details':
        return (
          <BillDetailsPage
            billId={selectedBillId}
            setTab={setCurrentTab}
            setSelectedBillId={setSelectedBillId}
          />
        );
      case 'record-payment':
        return (
          <PaymentEntryPage
            billId={selectedBillId}
            setTab={setCurrentTab}
            setSelectedBillId={setSelectedBillId}
            showToast={showToast}
          />
        );
      case 'payments':
        return (
          <PaymentsPage
            key={refreshKey}
            setTab={setCurrentTab}
            setSelectedBillId={setSelectedBillId}
          />
        );
      case 'reports':
        return <ReportsPage key={refreshKey} />;
      case 'tariffs':
        return <TariffsPage key={refreshKey} showToast={showToast} />;
      default:
        return (
          <DashboardPage
            key={refreshKey}
            setTab={setCurrentTab}
            setSelectedBillId={setSelectedBillId}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentTab={currentTab} setTab={setCurrentTab} />

      <div className="main-wrapper">
        <Navbar
          pageTitle={getPageTitle()}
          onRefresh={handleRefresh}
        />

        <main className="content-body">{renderContent()}</main>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}
