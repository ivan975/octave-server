const { MongoClient } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
require('colors');
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2f4txuh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function dbConnection() {
    try {
        await client.connect();
        console.log('Connected to MongoDB'.yellow.bold);
    }
    catch (err) {
        console.log(err.name, bgRed, err.message, bold);
    }
}

dbConnection();

app.get('/', (req, res) => {
    res.send('server started');
})

app.listen(port, (req, res) => {
    console.log(`server listening on ${port}`);
})
