const express = require("express");
const app = express();
const endpoints = require("./endpoints.json");

const articlesRouter = require("./routes/articles.router");
const topicsRouter = require("./routes/topics.router");
const commentsRouter = require("./routes/comments.router");
const usersRouter = require("./routes/uers.router");

app.use(express.json());

app.get("/api", (req, res) => {
  res.status(200).send({ endpoints });
});

app.use("/api/topics", topicsRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/users", usersRouter);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Path not found" });
});

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else if (err.code === "22P02" || err.code === "2201W") {
    res.status(400).send({ msg: "Bad Request: Invalid input" });
  } else if (err.code === "23502") {
    res.status(400).send({ msg: "Bad Request: missing required fields" });
  } else {
    console.error(err);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});
module.exports = app;
