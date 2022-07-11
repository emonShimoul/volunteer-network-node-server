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

        // POST API
        app.post('/events', async(req, res) => {
          const events = req.body;
          const result = await eventsCollection.insertOne(events);
          console.log("event inserted -", result);
          res.json(result);
        });

        // GET API (display specific user's events)
        app.get('/events/:email', async(req, res) => {
          const email = req.params.email;
          // console.log(email);
          const query = { email: { $in: [ email ] } }
          const cursor = eventsCollection.find(query);
          const eventsDetails = await cursor.toArray();
          res.json(eventsDetails);
        });

        // Get all events
        app.get('/events', async(req, res) => {
          const cursor = eventsCollection.find({});
          const eventsDetails = await cursor.toArray();
          res.json(eventsDetails);
        })

        // DELETE API
        app.delete('/events/:id', async(req, res) => {
          const id = req.params.id;
          const query = { _id:ObjectId(id) };
          const result = await eventsCollection.deleteOne(query);
          // console.log("delete successfully", result);
          res.json(result);
        })
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