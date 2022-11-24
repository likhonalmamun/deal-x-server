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
console.log(uri);
const run = () => {
  try {
    const categoryCollection = client.db("dealX").collection("categories");
    app.get("/categories", async (req, res) => {
      const categories = await categoryCollection.find({}).toArray();
      res.send(categories);
    });
  } catch (error) {
    console.log(error.message);
  }
};
run();

app.listen(port, () => {});
