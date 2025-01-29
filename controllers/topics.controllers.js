const { selectTopics } = require("../models/topics.models");

exports.getTopics = (req, res, next) => {
  const query = req.query;

  selectTopics(query)
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};
