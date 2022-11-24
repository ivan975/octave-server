const { MongoClient, ObjectId } = require('mongodb');
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

// Collections
const products = client.db('guitare').collection('products');
const categories = client.db('guitare').collection('categories');


// products
app.post('/products', async (req, res) => {
    try {
        const result = await products.insertOne(req.body);

        if (result.insertedId) {
            res.send({
                success: true,
                message: `Successfully inserted ${result.insertedId}`
            })
        }
    }
    catch (error) {
        console.log(error.name.bgRed, error.message.bold);
        res.send({
            success: false,
            error: error.message,
        });
    }
})

app.get('/products', async (req, res) => {
    try {
        const cursor = await products.find({}).toArray();
        res.send(cursor);
    }
    catch (error) {
        console.log(error.name.bgRed, error.message.bold);
        res.send({
            success: false,
            error: error.message,
        });
    }
})

app.get('/products/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const product = await products.findOne(query);
        res.send(product);
    }
    catch (err) {
        console.log(err.name.bgRed, err.message.bold);
        res.send({
            success: false,
            error: err.message,
        });
    }
})

// categories
app.post('/categories', async (req, res) => {
    try {
        const result = await categories.insertOne(req.body);

        if (result.insertedId) {
            res.send({
                success: true,
                message: `Successfully inserted ${result.insertedId}`
            })
        }
    }
    catch (err) {
        console.log(err.name.bgRed, err.message.bold);
        res.send({
            success: false,
            error: err.message,
        });
    }
})

app.get('/categories', async (req, res) => {
    try {
        const cursor = await categories.find({}).toArray();
        res.send(cursor);
    }
    catch (err) {
        console.log(err.name.bgRed, err.message.bold);
        res.send({
            success: false,
            error: err.message,
        });
    }
})

app.get('/', (req, res) => {
    res.send('server started');
})

app.listen(port, (req, res) => {
    console.log(`server listening on ${port}`);
})
