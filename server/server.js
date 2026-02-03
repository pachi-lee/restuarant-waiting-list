const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// In-memory storage for waiting list
let waitingList = [];
let nextId = 1;

// Get all customers on waiting list
app.get('/api/waitlist', (req, res) => {
  res.json(waitingList);
});

// Add customer to waiting list
app.post('/api/waitlist', (req, res) => {
  const { name, partySize, phone } = req.body;

  if (!name || !partySize) {
    return res.status(400).json({ error: 'Name and party size are required' });
  }

  const customer = {
    id: nextId++,
    name,
    partySize: parseInt(partySize),
    phone: phone || '',
    addedAt: new Date().toISOString()
  };

  waitingList.push(customer);
  res.status(201).json(customer);
});

// Remove customer from waiting list
app.delete('/api/waitlist/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = waitingList.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const removed = waitingList.splice(index, 1)[0];
  res.json({ message: 'Customer removed', customer: removed });
});

// Seat customer (remove from list and return their info)
app.post('/api/waitlist/:id/seat', (req, res) => {
  const id = parseInt(req.params.id);
  const index = waitingList.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const seated = waitingList.splice(index, 1)[0];
  res.json({ message: 'Customer seated', customer: seated });
});

// Serve static files from React build in production
app.use(express.static(path.join(__dirname, '../client/build')));

// Handle React routing - serve index.html for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
