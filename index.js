const { MongoClient, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
require('colors');
require('dotenv').config()
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2f4txuh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

// verifying jwt
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}


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
const buyingProducts = client.db('guitare').collection('buyingProducts');
const users = client.db('guitare').collection('users');

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
        console.log(cursor);
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

// buying
app.post('/buyingProducts', async (req, res) => {
    try {
        const buying = req.body;
        const result = await buyingProducts.insertOne(buying)
        res.send(result)
    }
    catch (err) {
        console.log(err.name.bgRed, err.message.bold);
        res.send({
            success: false,
            error: err.message,
        });
    }
})

app.get('/buyingProducts', verifyJWT, async (req, res) => {
    try {
        const email = req.query.email;
        const query = {
            email: email,
        }
        console.log(query);
        const bookings = await buyingProducts.find(query).toArray();
        res.send(bookings);
    }
    catch (err) {
        console.log(err.name.bgRed, err.message.bold);
        res.send({
            success: false,
            error: err.message,
        });
    }
})

// users
app.post('/users', async (req, res) => {
    try {
        const user = req.body;
        const result = await users.insertOne(user);
        res.send(result);
    }
    catch (err) {
        console.log(err.name.bgRed, err.message.bold);
        res.send({
            success: false,
            error: err.message,
        });
    }
})

app.get('/users', async (req, res) => {
    try {
        const allUsers = await users.find({}).toArray();
        res.send(allUsers)
    }
    catch (err) {
        console.log(err.name.bgRed, err.message.bold);
        res.send({
            success: false,
            error: err.message,
        });
    }
})

app.get('/users/admin/:email', async (req, res) => {
    const email = req.params.email
    const query = { email };
    const user = await users.findOne(query);
    res.send({ isAdmin: user?.role === 'admin' });
})

// jwt
app.get('/jwt', async (req, res) => {
    const email = req.query.email;
    const query = {
        email: email
    }
    const user = await users.findOne(query);

    if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
        return res.send({ accessToken: token });
    }

    res.status(403).send({ accessToken: 'forbidden access' })
})

app.get('/', (req, res) => {
    res.send('server started');
})

app.listen(port, (req, res) => {
    console.log(`server listening on ${port}`);
})
