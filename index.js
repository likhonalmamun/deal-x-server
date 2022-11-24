const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nbkl0so.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const run = () => {
  try {
    const categoryCollection = client.db("dealX").collection("categories");
    const usersCollection = client.db("dealX").collection("users");
    const productsCollection = client.db("dealX").collection("products");
    app.get("/categories", async (req, res) => {
      const categories = await categoryCollection.find({}).toArray();
      res.send(categories);
    });
    app.get("/myProducts", async (req, res) => {
      const myProducts = await productsCollection
        .find({ sellerEmail: req.query.email })
        .toArray();
      res.send(myProducts);
    });
    app.get("/users", async (req, res) => {
      const role = req.query.role;
      const users = await usersCollection.find({ role: role }).toArray();
      res.send(users);
    });
    app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      const products = await productsCollection
        .find({ categoryId: id })
        .toArray();
      res.send(products);
    });
    app.post("/users/:email", async (req, res) => {
      const email = req.params.email;
      const oldUser = await usersCollection.findOne({ email: email });
      if (!oldUser) {
        const newUser = req.body;
        const result = await usersCollection.insertOne(newUser);
      }
      const token = await jwt.sign({ email }, process.env.DealX_Token, {
        expiresIn: "7d",
      });
      res.send({ token });
    });
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });
  } catch (error) {
    console.log(error.message);
  }
};
run();

app.listen(port, () => {});
