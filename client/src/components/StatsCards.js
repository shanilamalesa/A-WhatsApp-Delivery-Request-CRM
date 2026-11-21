import React from 'react';

function StatsCards({ stats }) {
  const byStatus = stats?.byStatus || {};
  return (
    <div className="stats-cards">
      <div className="stat-card">
        <h3>Total</h3>
        <p className="stat-number">{stats?.total ?? 0}</p>
      </div>
      <div className="stat-card pending">
        <h3>Pending</h3>
        <p className="stat-number">{byStatus.new ?? 0}</p>
      </div>
      <div className="stat-card">
        <h3>Today</h3>
        <p className="stat-number">{stats?.today ?? 0}</p>
      </div>
      <div className="stat-card">
        <h3>Completed</h3>
        <p className="stat-number">{byStatus.completed ?? 0}</p>
      </div>
    </div>
  );
}

export default StatsCards;