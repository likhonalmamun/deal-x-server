const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  // console.log()
  if (token === "null") {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  jwt.verify(token, process.env.DealX_Token, (error, decoded) => {
    if (error) {
      return res.status(401).send({ message: "Unauthorized access" });
    }
    if (decoded) {
      req.decoded = decoded;
    }
  });
  next();
};
const run = () => {
  try {
    const categoryCollection = client.db("dealX").collection("categories");
    const usersCollection = client.db("dealX").collection("users");
    const productsCollection = client.db("dealX").collection("products");
    const bookingsCollection = client.db("dealX").collection("bookings");
    app.get("/categories", async (req, res) => {
      const categories = await categoryCollection.find({}).toArray();
      res.send(categories);
    });
    app.get("/myOrders", verifyToken, async (req, res) => {
      const email = req.query.email;
      if (email !== req.decoded.email) {
        return res.status(401).send({ message: "Unauthorized access" });
      }
      const orders = await bookingsCollection
        .find({ buyerEmail: email })
        .toArray();
      res.send(orders);
    });
    app.get("/myProducts", async (req, res) => {
      const myProducts = await productsCollection
        .find({ sellerEmail: req.query.email })
        .toArray();
      res.send(myProducts);
    });
    app.get("/reported", async (req, res) => {
      const products = await productsCollection
        .find({ reported: true })
        .toArray();
      res.send(products);
    });
    app.delete("/users/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.deleteOne({ email: email });
      const removeBookings = await bookingsCollection.deleteMany({
        buyerEmail: email,
      });
      res.send({ success: "Successfully deleted the buyer and his orders!" });
    });
    app.patch("/verifySeller/:id", async (req, res) => {
      const id = ObjectId(req.params.id);
      const filter = { _id: id };
      const updatedDoc = {
        $set: {
          verified: true,
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send({ success: "Seller verified successfully" });
    });
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const result = await productsCollection.deleteOne({ _id: ObjectId(id) });
      const removeBookings = await bookingsCollection.deleteMany({
        productId: id,
      });
      res.send({ success: "Successfully deleted the buyer and his orders!" });
    });
    app.delete("/deleteSeller/:email", async (req, res) => {
      const email = req.params.email;
      const deleteSeller = await usersCollection.deleteOne({ email: email });
      const deleteProducts = await productsCollection.deleteMany({
        sellerEmail: email,
      });
      res.send({ success: "Seller and his product deleted successfully!" });
    });
    app.patch("/ad/:id", verifyToken, async (req, res) => {
      if (req.decoded.email !== req.query.email) {
        return res.status(401).send({ message: "Unauthorized access" });
      }
      const filter = { _id: ObjectId(req.params.id) };
      const updatedDoc = {
        $set: {
          advertised: true,
        },
      };
      const result = await productsCollection.updateOne(filter, updatedDoc);
      res.send({ success: "This product is advertised !!" });
    });
    app.get("/ad", async (req, res) => {
      const products = await productsCollection
        .find({ advertised: true })
        .toArray();
      res.send(products);
    });
    app.get("/role/:role", verifyToken, async (req, res) => {
      const role = req.params.role;
      if (req.query.email !== req.decoded.email) {
        return res.status(401).send({ message: "Unauthorized access" });
      }
      const users = await usersCollection.find({ role: role }).toArray();
      res.send(users);
    });
    app.get("/token/:email", async (req, res) => {
      const email = req.params.email;
      const token = await jwt.sign({ email }, process.env.DealX_Token, {
        expiresIn: "7d",
      });
      res.send({ token });
    });
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.send({ success: "Product Booked Successfully!" });
    });
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email: email });
      res.send(user);
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
    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          reported: true,
        },
      };
      const result = await productsCollection.updateOne(filter, updatedDoc);
      // console.log(result);
      res.send({ success: "Reported to admin" });
    });
  } catch (error) {
    console.log(error.message);
  }
};
run();

app.listen(port, () => {});
