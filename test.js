require('dotenv').config({ path: './.env' });

const { MongoClient } = require('mongodb');

async function testConnection() {
    const uri = process.env.MONGO_URI;
    console.log("Trying to connect to:", uri);
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("✅ Connected to MongoDB!");
    } catch (error) {
        console.error("❌ Connection error:", error.message);
    } finally {
        await client.close();
    }
}

testConnection();
