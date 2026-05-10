import React from 'react';

function StatsCards({ stats }) {
  return (
    <div className="stats-cards">
      <div className="stat-card">
        <h3>Total</h3>
        <p className="stat-number">{stats.total}</p>
      </div>
      <div className="stat-card pending">
        <h3>Pending</h3>
        <p className="stat-number">{stats.pending}</p>
      </div>
      <div className="stat-card">
        <h3>Today</h3>
        <p className="stat-number">{stats.today}</p>
      </div>
      <div className="stat-card">
        <h3>Delivered Today</h3>
        <p className="stat-number">{stats.byStatus.delivered}</p>
      </div>
    </div>
  );
}

export default StatsCards;