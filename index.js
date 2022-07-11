const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pabg0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log("connected to mongodb");

async function run() {
    try{
        await client.connect();
        const database = client.db("volunteers");
        const eventsCollection = database.collection("events");
        const registeredUserCollection = database.collection("registeredUser");

        // POST API
        app.post('/events', async(req, res) => {
          const events = req.body;
          const result = await eventsCollection.insertOne(events);
          // console.log("event inserted -", result);
          res.json(result);
        });

        // POST Registered User
        app.post('/registeredUser', async(req, res) => {
          const registeredUser = req.body;
          const result = await registeredUserCollection.insertOne(registeredUser);
          console.log("event inserted -", result);
          res.json(result);
        });

        app.get('/registeredUser', async(req, res) => {
          const cursor = registeredUserCollection.find({});
          const registeredUserDetails = await cursor.toArray();
          res.json(registeredUserDetails);
        })

        // GET API (display specific user's events)
        app.get('/registeredUser/:email', async(req, res) => {
          const email = req.params.email;
          // console.log(email);
          const query = { email: { $in: [ email ] } }
          const cursor = registeredUserCollection.find(query);
          const registeredUserDetails = await cursor.toArray();
          res.json(registeredUserDetails);
        });

        // Get all events
        app.get('/events', async(req, res) => {
          const cursor = eventsCollection.find({});
          const eventsDetails = await cursor.toArray();
          res.json(eventsDetails);
        });

        // DELETE Events From Admin
        app.delete('/events/:id', async(req, res) => {
          const id = req.params.id;
          const query = { _id:ObjectId(id) };
          const result = await eventsCollection.deleteOne(query);
          // console.log("delete successfully", result);
          res.json(result);
        });

        // DELETE Registered User From Both Admin and User
        app.delete('/registeredUser/:id', async(req, res) => {
          const id = req.params.id;
          const query = { _id:ObjectId(id) };
          const result = await registeredUserCollection.deleteOne(query);
          // console.log("delete successfully", result);
          res.json(result);
        });
    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});