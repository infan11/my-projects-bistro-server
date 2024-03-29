const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
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
   const contactsCollection = client.db("bistroBossDB").collection("contacts")

   // jwt token  api 
    // first step
  app.post("/jwt" , async (req, res) => {
    const user = req.body;
    const token = jwt.sign(user , process.env.ACCESS_TOKEN_SECRET , {
      expiresIn : "1h"
    })
    res.send({token})
  })
//  middleWeres 


// use verify admin after verifytoken 
const verifyAdmin = async(req ,res , next) =>{
  const email = req.decoded.email;
  const query = {email : email };
  const user = await usersCollection.findOne(query)
  const isAdmin =  user?.role === "admin";
  if(!isAdmin){
  return res.status(403).send({message : "forbidden access"})
  }
  next()
}

const verifyToken = (req, res, next) => {
  console.log("inside verify token", req.headers.authorization);
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "forbidden access" });
  }
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};

// users related api 
app.get("/users" , verifyToken,verifyAdmin, async(req, res) => {
  const result = await usersCollection.find().toArray();
  console.log(result);
  res.send(result);
})
app.post("/users" ,verifyToken, async (req, res) => {
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

app.delete("/users/:id" , async (req, res)  => {
  const id =  req.params.id;
  const query = {_id : new  ObjectId(id)};
  const result = await usersCollection.deleteOne(query)
  res.send(result)
})
app.patch("/users/admin/:id" ,verifyToken,verifyAdmin, async ( req , res ) => {
  const id = req.params.id;
  const filter  = {_id : new ObjectId(id)}
  const updateDoc = {
    $set:{
      role: "admin"
    }
  }
  const result = await usersCollection.updateOne(filter , updateDoc);
  res.send(result)
})

app.get("/users/admin/:email" ,verifyToken ,async (req, res) => {
  const email = req.params.email;
  if(email !== req.decoded.email){
    return res.status(403).send({message : "unauthorized access"})
  }
  const query = { email: email};
  const user = await usersCollection.findOne(query)
  let admin = false;
  if(user){
    admin = user?.role === "admin"
  }
  res.send({admin})
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
app.get("/carts",  async (req, res) =>{
    const email = req.query.email;
    const query = {email : email}
    const result = await cartsCollection.find(query).toArray()
    res.send(result) 
  })
app.post("/carts" ,  async(req, res ) => {
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
// contacts related api 
app.get("/contacts",  async (req, res) =>{
  const result = await contactsCollection.find({}).toArray();
  res.send(result) 
})
// app.post("/contacts" , async (req ,res) => {
//   const contactItem = req.body;
//   const result = await contactsCollection.insertOne(contactItem);
//   res.send(result);
// })
app.post("/contacts" , async (req , res) => {
  const dataCon = req.body;
  const result = await contactsCollection.insertOne(dataCon);
  res.send(result);
})
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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