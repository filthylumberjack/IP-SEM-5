import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;

  const normalized = status.toUpperCase();

  switch (normalized) {
    case 'PAID':
      return <span className="badge badge-paid">● Paid</span>;
    case 'PARTIALLY_PAID':
      return <span className="badge badge-partially-paid">● Partial</span>;
    case 'PENDING':
      return <span className="badge badge-pending">● Pending</span>;
    case 'OVERDUE':
      return <span className="badge badge-overdue">● Overdue</span>;
    case 'ACTIVE':
      return <span className="badge badge-active">Active</span>;
    case 'INACTIVE':
      return <span className="badge badge-inactive">Inactive</span>;
    default:
      return <span className="badge badge-inactive">{status}</span>;
  }
}
