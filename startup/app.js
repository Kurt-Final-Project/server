const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const path = require("path");

app.use(express.json());
app.use(cors());
app.use("/public", express.static("public"));

module.exports = app;
