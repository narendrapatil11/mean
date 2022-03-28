const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const PostRouter = require('./routes/posts');

const app = express();

mongoose.connect("mongodb+srv://naren:fZbhAOFPeVeZsPwh@cluster0.pr2ju.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
  .then(() => {console.log('Database connection successful!');})
  .catch(() => {console.log('Database connection failed!');});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, x-Requested-With, Content-Type, Accept",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  next();
});

app.use("/api/posts", PostRouter);

module.exports = app;
