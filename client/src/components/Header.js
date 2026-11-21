import React from 'react';

function Header({ user, onLogout }) {
  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo">🛵</span>
        <h1 className="header-title">Boda Dispatch</h1>
      </div>
      <p className="header-subtitle">Delivery Management Dashboard</p>
      {user && (
        <div className="header-user">
          <span>{user.email} ({user.role})</span>
          <button className="logout-button" onClick={onLogout}>Log out</button>
        </div>
      )}
    </header>
  );
}

export default Header;
