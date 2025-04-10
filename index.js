const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB URI and client
const uri = "mongodb+srv://admin:admin@pwp.ob4zquo.mongodb.net/?retryWrites=true&w=majority&appName=PWP";
const client = new MongoClient(uri);
let db;

// Middleware
app.use(cors());
app.use(express.json());

// Default route
app.get('/', (req, res) => {
  res.send('🛩️ PWP Voucher Backend is running!');
});

// Connect to MongoDB once and start the server
client.connect()
  .then(() => {
    db = client.db('manifest');
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

/**
 * Route: /test
 * Checks MongoDB connection and returns available collections
 */
app.get('/test', async (req, res) => {
  try {
    const collections = await db.listCollections().toArray();
    res.json({ status: 'Connected', collections });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Route: /add-voucher
 * Applies a voucher to all passengers with a given flight number
 */
app.post('/add-voucher', async (req, res) => {
  const { flightNum, voucher } = req.body;
  console.log("Received flightNum:", flightNum);
  console.log("Received voucher:", voucher);

  if (!flightNum || !voucher) {
    return res.status(400).json({ error: 'flightNum and voucher are required' });
  }

  try {
    const collection = db.collection('passengers');
    const filter = { flightNum: { $regex: `^${flightNum.trim()}$`, $options: 'i' } };

    const update = { $set: { voucher } };
    const result = await collection.updateMany(filter, update);

    if (result.matchedCount > 0 && result.modifiedCount > 0) {
      res.json({ message: 'The voucher has been applied successfully.' });
    } else if (result.matchedCount > 0) {
      res.json({ message: 'No changes were made. Please check the flight number.' });
    } else {
      res.json({ message: 'No documents matched the flight number.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to apply voucher: ' + err.message });
  }
});

/**
 * Route: /apply-pass-voucher
 * Applies a voucher to a passenger with a specific first and last name
 */
app.post('/apply-pass-voucher', async (req, res) => {
  const { firstName, lastName, voucher } = req.body;
  console.log("Recieved First Name:", firstName);
  console.log("Received Last Name:", lastName);
  console.log("Received voucher:", voucher);

  if (!firstName || !lastName || !voucher) {
    return res.status(400).json({ error: 'firstName, lastName, and voucher are required' });
  }

  try {
    const collection = db.collection('passengers');
    const filter = {
  firstName: { $regex: `^${firstName.trim()}$`, $options: 'i' },
  lastName: { $regex: `^${lastName.trim()}$`, $options: 'i' }
};
    const update = { $set: { voucher } };
    const result = await collection.updateMany(filter, update);

    if (result.matchedCount > 0 && result.modifiedCount > 0) {
      res.json({ message: 'The voucher has been applied successfully.' });
    } else if (result.matchedCount > 0) {
      res.json({ message: 'No changes were made. Please rescan the barcode.' });
    } else {
      res.json({ message: 'No documents matched passenger information.' });
    }
  } catch (err) {
    res.status(500).json({ error: `Failed to apply voucher: ${err.message}` });
  }
});

/**
 * Route: /check-voucher
 * Returns the voucher (if any) for a passenger with the given first and last name
 */
app.post('/check-voucher', async (req, res) => {
  const { firstName, lastName } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'firstName and lastName are required' });
  }

  try {
    const collection = db.collection('passengers');
    const passenger = await collection.findOne({
  firstName: { $regex: `^${firstName.trim()}$`, $options: 'i' },
  lastName: { $regex: `^${lastName.trim()}$`, $options: 'i' }
});


    if (passenger) {
      res.json({ voucher: passenger.voucher || null });
    } else {
      res.status(404).json({ error: 'Passenger not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to check voucher: ' + err.message });
  }
});
