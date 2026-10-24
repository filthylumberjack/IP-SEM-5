import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Gauge,
  FilePlus,
  Receipt,
  CreditCard,
  History,
  BarChart3,
  Sliders,
  Zap
} from 'lucide-react';

export default function Sidebar({ currentTab, setTab }) {
  const navItems = [
    { section: 'OVERVIEW' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },

    { section: 'CONSUMERS' },
    { id: 'customers', label: 'Customer Directory', icon: Users },
    { id: 'add-customer', label: 'Register Consumer', icon: UserPlus },

    { section: 'BILLING & METERS' },
    { id: 'meter-readings', label: 'Meter Readings', icon: Gauge },
    { id: 'generate-bill', label: 'Generate Bill', icon: FilePlus },
    { id: 'bills', label: 'Bills Management', icon: Receipt },

    { section: 'PAYMENTS & ACCOUNTS' },
    { id: 'record-payment', label: 'Record Payment', icon: CreditCard },
    { id: 'payments', label: 'Payment Records', icon: History },

    { section: 'ADMINISTRATION' },
    { id: 'reports', label: 'Monthly Reports', icon: BarChart3 },
    { id: 'tariffs', label: 'Tariff Config', icon: Sliders }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-badge">
          <Zap size={22} fill="#ffffff" />
        </div>
        <div>
          <h1 className="logo-title">VoltFlow</h1>
          <p className="logo-subtitle">Electricity Billing System</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, index) => {
          if (item.section) {
            return (
              <div key={index} className="nav-section-title">
                {item.section}
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="app-meta">
          <div><span className="status-dot"></span> Backend: Online</div>
          <div style={{ color: 'var(--slate-400)', fontSize: '0.7rem' }}>Spring Boot + MySQL 8.0</div>
        </div>
      </div>
    </aside>
  );
}
