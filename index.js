const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, MongoRuntimeError, ObjectId } = require('mongodb');
const res = require('express/lib/response');
const app = express()
const port = process.env.PORT || 5000;


app.use(cors());

app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8qzdx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('assignment-12').collection('services');
        const orderCollection = client.db('assignment-12').collection('orders');
        const reviewCollection = client.db('assignment-12').collection('reviews');
        const userCollection = client.db('assignment-12').collection('users');
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);

        })
        app.get('/orders', async (req, res) => {
            const query = {};
            const cursor = orderCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);

        })




        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        });
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);

        })

        app.post('/reviews', async (req, res) => {
            const newItem = req.body;
            const result = await reviewCollection.insertOne(newItem);
            res.send(result);
        })

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });
        })



        //my profile----------
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            const userProfileInfo = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            let updatedUser;
            if (userProfileInfo.role) {
                updatedUser = {
                    $set: {
                        role: userProfileInfo.role
                    }
                }
            }
            else {
                updatedUser = {
                    $set: {
                        location: userProfileInfo.location,
                        linkedIn: userProfileInfo.linkedIn,
                        education: userProfileInfo.education,
                        phone: userProfileInfo.phone
                    }
                }
            }
            const result = await userCollection.updateOne(filter, updatedUser, options);
            res.send(result);
        });


    }
    finally {

    }

};
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello FROM ASSIGNMENT 12')
})

app.listen(port, () => {
    console.log(`Listening to the assignment12 port ${port}`)
})