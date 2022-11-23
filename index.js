const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

const run = () => {
  try {
    app.get("/", async (req, res) => {
      res.send({ message: "Server is running" });
    });
  } catch (error) {
    console.log(error.message);
  }
};
run();

app.listen(port, () => {});
