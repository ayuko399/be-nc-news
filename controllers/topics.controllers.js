const { selectTopics, addTopic } = require("../models/topics.models");

exports.getTopics = (req, res, next) => {
  const query = req.query;

  selectTopics(query)
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.postTopic = (req, res, next) => {
  const newTopic = req.body;

  addTopic(newTopic)
    .then((topic) => {
      res.status(200).send({ topic });
    })
    .catch(next);
};
