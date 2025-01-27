const express = require("express");
const app = express();
const endpoints = require("./endpoints.json");

const { getTopics, getEndpoints } = require("./controllers/topics.controllers");
const { getArticleById } = require("./controllers/articles.controllers");

app.use(express.json());

app.get("/api", (req, res) => {
  res.status(200).send({ endpoints });
});

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad Request: Invalid input" });
  } else {
    console.error(err);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});
module.exports = app;
