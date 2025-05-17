const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000;

require('dotenv').config()
// console.log(process.env)

const app = express();

app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.COFFEE_USER}:${process.env.COFFEE_LOCK}@coffee-cluster.lawbvkg.mongodb.net/?retryWrites=true&w=majority&appName=coffee-cluster`;


// 
// 

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const database = client.db('coffeeDB');
        const coffeeCollection = database.collection('coffees');
        const userCollection = database.collection('users');

        app.get('/coffees', async (req, res) => {
            // const cursor =  coffeeCollection.find();
            // const result = await cursor.toArray();
            const result = await coffeeCollection.find().toArray();
            res.send(result);
        })

        app.get('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })

        app.post('/coffees', async (req, res) => {
            const coffee = req.body;
            // console.log(coffee);
            const result = await coffeeCollection.insertOne(coffee);
            res.send(result)
        })

        app.put('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const newCoffee = req.body;
            const updatedDoc = {
                $set: newCoffee
            }
            const result = await coffeeCollection.updateOne(query, updatedDoc, options);
            res.send(result);
        })

        app.delete('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        })


        //users APIs

        app.post('/users', async (req, res) => {
            const usersDoc = req.body;
            console.log(usersDoc)
            const result = await userCollection.insertOne(usersDoc);
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = userCollection.deleteOne(query);
            res.send(result);
        })

        app.patch('/users', async (req, res) => {
            console.log(req.body);
            const { userLoginTime, email } = req.body;
            const filter = { email: email };
            const updatedDoc = {
                $set: { authSignInTime: userLoginTime }
            }
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Coffee is getting hotter in the server');
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})