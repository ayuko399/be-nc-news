const { selectTopics } = require("../models/topics.models");

exports.getTopics = (req, res, next) => {
  const queries = req.query;

  selectTopics(queries)
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};
