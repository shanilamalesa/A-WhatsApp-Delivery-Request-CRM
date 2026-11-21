import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import StatsCards from './components/StatsCards';
import DeliveryTable from './components/DeliveryTable';
import DetailPanel from './components/DetailPanel';
import { apiFetch, getUser, clearSession, setUnauthorizedHandler } from './api';
import './App.css';

function App() {
  const [user, setUser] = useState(getUser());
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  function logout() {
    clearSession();
    setUser(null);
    setDeliveries([]);
    setStats(null);
    setSelectedDelivery(null);
  }

  // If any request comes back 401 (expired token), go back to login.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
  }, []);

  const fetchDeliveries = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (statusFilter) params.append('status', statusFilter);

    apiFetch(`/api/deliveries?${params}`)
      .then(data => setDeliveries(data.deliveries || []))
      .catch(err => console.error('Failed to load deliveries:', err.message));
  }, [search, statusFilter]);

  const fetchStats = useCallback(() => {
    apiFetch('/api/stats')
      .then(data => setStats(data))
      .catch(err => {
        console.error('Failed to load stats:', err.message);
        setStats(null);
      });
  }, []);

  useEffect(() => {
    if (!user) return;

    fetchDeliveries();
    fetchStats();

    const interval = setInterval(() => {
      fetchDeliveries();
      fetchStats();
    }, 10000);

    return () => clearInterval(interval);
  }, [user, fetchDeliveries, fetchStats]);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="app">
      <Header user={user} onLogout={logout} />
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
