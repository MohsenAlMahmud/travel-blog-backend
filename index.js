const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();




const port = process.env.PORT || 5000;



//middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());


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
        const userCollection = client.db("blogDB").collection("users");

        //middleware
        //verify token and grant access
        const gateman = (req, res, next) => {
            const { token } = req.cookies;

            if (!token) {
                return res.status(401).send({ message: 'You are not authorized' })
            }
            jwt.verify(token, SECRET, function (err, decoded) {
                if (err) {
                    return res.status(401).send({ message: 'You are not authorized' })
                }
                req.user = decoded;
                next();
            })
        }

        // Get user information by email
        // app.get('/user', gateman, async (req, res) => {
        //     const queryEmail = req.query.email;
        //     const tokenEmail = req.user.email;

        //     if (queryEmail === tokenEmail) {
        //         return res.status(403).send({ message: 'Forbidden access' });
        //     }

        //     const query = { email: queryEmail };
        //     const result = await userCollection.find(query).toArray();
        //     res.send(result);
        // });

        //get blogs
        app.get("/blogs", async (req, res) => {
            const result = await blogCollection.find().toArray();
            res.send(result);
        });

        app.get("/blogs/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            // const options = {
            //     projection: { tittle: 1, image: 1, category: 1, shortDescription: 1 }
            // };
            const result = await blogCollection.findOne(query);
            res.send(result);
        });

        //post single blog
        app.post('/blogs', async (req, res) => {
            const blog = req.body;
            blog.createdAt = new Date();
            console.log('new blog', blog);
            const result = await blogCollection.insertOne(blog);
            console.log(result);
            res.send(result);
        });



        //post user
        app.get('/users', async (req, res) => {
            console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await userCollection.find().toArray();
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log('new user', user);
            const result = await userCollection.insertOne(user);
            console.log(result);
            res.send(result);
        });

        // Add a blog to a user's wishlist
        // app.post('/add-to-wishlist/:blogId', gateman, async (req, res) => {

        //     const { blogId } = req.params;
        //     const userId = req.user._id;

        //     const userQuery = { _id: new ObjectId(userId) };
        //     const userUpdate = { $addToSet: { wishlist: blogId } };

        //     const result = await userCollection.updateOne(userQuery, userUpdate);
        //     res.send(result);
        // });

        //user specific 
        // app.get('/user-wishlist', gateman, async (req, res) => {
        //     const queryEmail = req.query.email;
        //     const tokenEmail = req.user.email;

        //     if (queryEmail === tokenEmail) {
        //         return res.status(403).send({message: 'forbidden access'})
        //     }

        //     let query = {}
        //     if(queryEmail){
        //         query.email = queryEmail;
        //     }            
        //     const result = await userCollection.find(query).toArray();
        //     res.send(result)
        // });
        // app.get('/user-wishlist', gateman, async (req, res) => {
        //     const queryEmail = req.query.email;
        //     const tokenEmail = req.user.email;

        //     if (queryEmail !== tokenEmail) {
        //         return res.status(403).send({ message: 'Forbidden access' });
        //     }

        //     const query = { email: queryEmail };
        //     const user = await userCollection.findOne(query);

        //     if (!user || !user.wishlist) {
        //         return res.status(404).send({ message: 'Wishlist not found' });
        //     }

        //     const wishlistIds = user.wishlist.map(id => new ObjectId(id));
        //     const wishlist = await blogCollection.find({ _id: { $in: wishlistIds } }).toArray();
        //     res.send(wishlist);
        // });

        app.delete("/blogs/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await blogCollection.deleteOne(query)
            res.send(result)
        })

        //creating token and send to client
        app.post("/auth/access-token", gateman, async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, SECRET);
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            }).send({ success: true })
        })

        app.put("/blogs/:id", async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            console.log("id", id, data);
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedBlog = {
                $set: {
                    tittle: data.tittle,
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