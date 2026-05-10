import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import DeliveryTable from './components/DeliveryTable';
import DetailPanel from './components/DetailPanel';
import './App.css';

function App() {
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  function fetchDeliveries() {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (statusFilter) params.append('status', statusFilter);

    fetch(`http://localhost:3000/api/deliveries?${params}`)
      .then(res => res.json())
      .then(data => setDeliveries(data.deliveries || []));
  }

  function fetchStats() {
    fetch('http://localhost:3000/api/stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }

  useEffect(() => {
    fetchDeliveries();
    fetchStats();

    const interval = setInterval(() => {
      fetchDeliveries();
      fetchStats();
    }, 10000);

    return () => clearInterval(interval);
  }, [search, statusFilter]);

  return (
    <div className="app">
      <Header />
      <main className="main">
        {stats && <StatsCards stats={stats} />}
        <DeliveryTable
          deliveries={deliveries}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onSelect={setSelectedDelivery}
        />
      </main>
      {selectedDelivery && (
        <DetailPanel
          delivery={selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
          onUpdate={fetchDeliveries}
        />
      )}
    </div>
  );
}

export default App;