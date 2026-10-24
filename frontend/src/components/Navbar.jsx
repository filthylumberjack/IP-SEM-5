import React from 'react';
import { RefreshCw, Calendar, ShieldCheck } from 'lucide-react';

export default function Navbar({ pageTitle, onRefresh, isRefreshing }) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <h2 className="page-title">{pageTitle}</h2>
      </div>

      <div className="navbar-right">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate-500)', fontSize: '0.85rem' }}>
          <Calendar size={15} />
          <span>{currentDate}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-700)', fontSize: '0.85rem', backgroundColor: 'var(--primary-50)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
          <ShieldCheck size={16} />
          <span>Admin Portal</span>
        </div>

        {onRefresh && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Data"
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        )}
      </div>
    </header>
  );
}
