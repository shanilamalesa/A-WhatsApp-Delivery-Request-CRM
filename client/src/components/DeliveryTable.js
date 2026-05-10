import React from 'react';

function DeliveryTable({ deliveries, search, setSearch, statusFilter, setStatusFilter, onSelect }) {
  return (
    <div className="table-section">
      <div className="table-controls">
        <input
          className="search-input"
          type="text"
          placeholder="Search deliveries..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="status-filter"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="picked_up">Picked Up</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <table className="delivery-table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Pickup</th>
            <th>Dropoff</th>
            <th>Recipient</th>
            <th>Urgency</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map(delivery => (
            <tr key={delivery.id} onClick={() => onSelect(delivery)} className="table-row">
              <td>{delivery.reference}</td>
              <td>{delivery.pickup_location}</td>
              <td>{delivery.dropoff_location}</td>
              <td>{delivery.recipient_name}</td>
              <td>{delivery.urgency}</td>
              <td>
                <span className={`badge badge-${delivery.status}`}>
                  {delivery.status}
                </span>
              </td>
              <td>{new Date(delivery.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {deliveries.length === 0 && (
        <p className="empty-message">No deliveries found.</p>
      )}
    </div>
  );
}

export default DeliveryTable;