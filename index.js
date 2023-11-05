const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;



//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b5j4nsy.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();
        const blogCollection = client.db("blogDB").collection("blogs");

        

        //get blogs
        app.get("/blogs", async (req, res) => {
            const result = await blogCollection.find().toArray();
            res.send(result);
        });

        app.get("/blogs/:id", async(req, res) =>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await blogCollection.findOne(query);
            res.send(result);
        });

        //post single blog
        app.post('/blogs', async (req, res) => {
            const blog = req.body;
            console.log('new blog', blog);
            const result = await blogCollection.insertOne(blog);
            console.log(result);
            res.send(result);
        });

        app.delete("/blogs/:id", async(req, res) =>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await blogCollection.deleteOne(query)
            res.send(result)
        })

        app.put("/blogs/:id", async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            console.log("id", id, data);
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedBlog = {
              $set: {
                title: data.title,
                image: data.image,
                category: data.category,
                shortDescription: data.shortDescription,
                longDescription: data.longDescription,
                
              },
            };
            const result = await blogCollection.updateOne(
              filter,
              updatedBlog,
              options
            );
            res.send(result);
          });


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('SIMPLE CRUD IS RUNNING')
})

app.listen(port, () => {
    console.log(`SIMPLE CRUD IS RUNNING ON PORT, ${port}`)
})