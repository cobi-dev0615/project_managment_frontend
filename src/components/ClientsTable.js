import React from 'react';
import './ClientsTable.css';

const ClientsTable = ({ clients, onView, onEdit, onDelete }) => {
  if (clients.length === 0) {
    return (
      <div className="clients-table-empty">
        <p>No clients found.</p>
      </div>
    );
  }

  return (
    <div className="clients-table-container">
      <table className="clients-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Title</th>
            <th>Email</th>
            <th>Country</th>
            <th>Account State</th>
            <th>Proxy Timeline</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr
              key={client.id}
              onClick={() => onView(client)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onView(client)}
            >
              <td>
                <div className="client-name-cell">
                  <div className="client-avatar-sm">
                    {client.image_url ? (
                      <img src={client.image_url} alt="" />
                    ) : (
                      <span>{(client.full_name || client.email || '?')[0].toUpperCase()}</span>
                    )}
                  </div>
                  <span>{client.full_name || 'No name'}</span>
                </div>
              </td>
              <td>{client.title || '-'}</td>
              <td>{client.email || '-'}</td>
              <td>{client.country || '-'}</td>
              <td>{client.account_state || '-'}</td>
              <td>{client.proxy_info?.timeline || '-'}</td>
              <td className="table-actions" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="btn-icon" onClick={() => onView(client)} title="View">
                  👁
                </button>
                <button type="button" className="btn-icon" onClick={() => onEdit(client)} title="Edit">
                  ✏️
                </button>
                <button type="button" className="btn-icon" onClick={() => onDelete(client.id)} title="Delete">
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientsTable;
