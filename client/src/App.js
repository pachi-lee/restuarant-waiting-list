import React, { useState, useEffect } from 'react';

const API_URL = '/api';

function App() {
  const [waitlist, setWaitlist] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    partySize: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    try {
      const response = await fetch(`${API_URL}/waitlist`);
      const data = await response.json();
      setWaitlist(data);
    } catch (err) {
      setError('Failed to fetch waiting list');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to add customer');
      }

      const newCustomer = await response.json();
      setWaitlist(prev => [...prev, newCustomer]);
      setFormData({ name: '', partySize: '', phone: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      const response = await fetch(`${API_URL}/waitlist/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove customer');
      }

      setWaitlist(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSeat = async (id) => {
    try {
      const response = await fetch(`${API_URL}/waitlist/${id}/seat`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to seat customer');
      }

      setWaitlist(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Restaurant Waiting List</h1>
        <p className="subtitle">Manage your customer queue</p>
      </header>

      <main className="main-content">
        <section className="add-customer-section">
          <h2>Add Customer to Waitlist</h2>
          <form onSubmit={handleSubmit} className="add-form">
            <div className="form-group">
              <label htmlFor="name">Customer Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="partySize">Party Size *</label>
              <input
                type="number"
                id="partySize"
                name="partySize"
                value={formData.partySize}
                onChange={handleInputChange}
                placeholder="Number of guests"
                min="1"
                max="20"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone (optional)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone number"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add to Waitlist'}
            </button>
          </form>
        </section>

        {error && <div className="error-message">{error}</div>}

        <section className="waitlist-section">
          <h2>Current Waitlist ({waitlist.length})</h2>
          {waitlist.length === 0 ? (
            <div className="empty-state">
              <p>No customers on the waiting list</p>
            </div>
          ) : (
            <ul className="waitlist">
              {waitlist.map((customer, index) => (
                <li key={customer.id} className="waitlist-item">
                  <div className="position">{index + 1}</div>
                  <div className="customer-info">
                    <h3>{customer.name}</h3>
                    <div className="details">
                      <span className="party-size">
                        Party of {customer.partySize}
                      </span>
                      {customer.phone && (
                        <span className="phone">{customer.phone}</span>
                      )}
                      <span className="time">Added: {formatTime(customer.addedAt)}</span>
                    </div>
                  </div>
                  <div className="actions">
                    <button
                      onClick={() => handleSeat(customer.id)}
                      className="btn btn-success"
                    >
                      Seat
                    </button>
                    <button
                      onClick={() => handleRemove(customer.id)}
                      className="btn btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>Created by Pachi using Claude Code</p>
      </footer>
    </div>
  );
}

export default App;
