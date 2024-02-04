const express = require('express');
const cors = require('cors');
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middle were
app.use(express.json())
app.use(cors());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lopynog.mongodb.net/?retryWrites=true&w=majority`;

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
 
   const usersCollection = client.db("bistroBossDB").collection("users")
   const menuCollection = client.db("bistroBossDB").collection("menu")
   const reviewCollection = client.db("bistroBossDB").collection("review")
   const cartsCollection = client.db("bistroBossDB").collection("carts")
// users related api 
app.post("/users" , async (req, res) => {
  const user  = req.body;
  // insert email if user doesnot exists:
  // you can do this many ways (1.email unique , 2. upsert 3.simple checking)
  const query = {email : user.email}
  const existingUser = await usersCollection.findOne(query);
  if(existingUser){
    return res.send({message: "User already Exists" , insertedId : null})
  }
  const result = await usersCollection.insertOne(user);
  res.send(result); 
})
//  menu related 
app.get("/menu" , async(req, res) => {
    const result = await menuCollection.find().toArray();
    res.send(result)
})
// review related
app.get("/review" , async (req, res) => {
    const result = await reviewCollection.find().toArray();
    res.send(result);
})
// carts realated
app.get("/carts", async (req, res) =>{
    const email = req.query.email;
    const query = {email : email}
    const result = await cartsCollection.find(query).toArray()
    res.send(result) 
  })
app.post("/carts" , async(req, res ) => {
   const cartItem = req.body;
   const result = await cartsCollection.insertOne(cartItem);
   res.send(result)
});
// carts deleted 

app.delete("/carts/:id" , async (req, res) => {
  const id =  req.params.id;
  const query = {_id : new  ObjectId(id)};
  const result = await cartsCollection.deleteOne(query);
  res.send(result)
})

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  
  }
}
run().catch(console.dir);


app.get("/" , async ( req, res) => {
    res.send("Bistro Boss server running ")
})
app.listen(port , () => {
    console.log(`port signel crud server port :${port} `);
})