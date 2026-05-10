import React from 'react';

function Header() {
  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo">🛵</span>
        <h1 className="header-title">Boda Dispatch</h1>
      </div>
      <p className="header-subtitle">Delivery Management Dashboard</p>
    </header>
  );
}

export default Header;