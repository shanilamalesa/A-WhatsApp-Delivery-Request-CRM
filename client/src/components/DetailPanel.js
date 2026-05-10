import React, { useState, useEffect } from 'react';

function DetailPanel({ delivery, onClose, onUpdate }) {
  const [conversation, setConversation] = useState([]);
  const [rider, setRider] = useState(delivery.assigned_rider || '');

  useEffect(() => {
    fetch(`http://localhost:3000/api/deliveries/${delivery.id}`)
      .then(res => res.json())
      .then(data => setConversation(data.conversation || []));
  }, [delivery.id]);

  function updateStatus(newStatus) {
    fetch(`http://localhost:3000/api/deliveries/${delivery.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).then(() => onUpdate());
  }

  function assignRider() {
    fetch(`http://localhost:3000/api/deliveries/${delivery.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assigned_rider: rider })
    }).then(() => onUpdate());
  }

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel" onClick={e => e.stopPropagation()}>
        <button className="panel-close" onClick={onClose}>✕</button>

        <h2 className="panel-title">{delivery.reference}</h2>

        <div className="panel-details">
          <p><strong>📍 Pickup:</strong> {delivery.pickup_location}</p>
          <p><strong>📍 Dropoff:</strong> {delivery.dropoff_location}</p>
          <p><strong>👤 Recipient:</strong> {delivery.recipient_name}</p>
          <p><strong>📞 Phone:</strong> {delivery.recipient_phone}</p>
          <p><strong>📦 Package:</strong> {delivery.package_description}</p>
          <p><strong>⚡ Urgency:</strong> {delivery.urgency}</p>
          <p><strong>Status:</strong> <span className={`badge badge-${delivery.status}`}>{delivery.status}</span></p>
        </div>

        <div className="panel-actions">
          <h3>Update Status</h3>
          <div className="status-buttons">
            <button onClick={() => updateStatus('assigned')}>Assigned</button>
            <button onClick={() => updateStatus('picked_up')}>Picked Up</button>
            <button onClick={() => updateStatus('delivered')}>Delivered</button>
            <button onClick={() => updateStatus('cancelled')}>Cancelled</button>
          </div>
        </div>

        <div className="panel-rider">
          <h3>Assign Rider</h3>
          <input
            type="text"
            placeholder="Rider name..."
            value={rider}
            onChange={e => setRider(e.target.value)}
          />
          <button onClick={assignRider}>Assign</button>
        </div>

        <a
          className="whatsapp-link"
          href={`https://wa.me/${delivery.recipient_phone}`}
          target="_blank"
          rel="noreferrer"
        >
          💬 Message Customer on WhatsApp
        </a>

        <div className="conversation">
          <h3>WhatsApp Conversation</h3>
          {conversation.map(msg => (
            <div key={msg.id} className={`message message-${msg.direction}`}>
              <p>{msg.content}</p>
              <span className="message-time">{new Date(msg.created_at).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DetailPanel;