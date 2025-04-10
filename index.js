const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Replace this with your actual connection string
const uri = "mongodb+srv://admin:admin@pwp.ob4zquo.mongodb.net/?retryWrites=true&w=majority&appName=PWP";

const client = new MongoClient(uri);
let db;

app.use(cors());
app.use(express.json());

app.get('/test', async (req, res) => {
  try {
    await client.connect();
    db = client.db('manifest');
    const collections = await db.listCollections().toArray();
    res.json({ status: 'Connected', collections });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
