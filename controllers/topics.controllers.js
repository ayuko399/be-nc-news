const { selectTopics } = require("../models/topics.models");

exports.getTopics = (req, res, next) => {
  const queries = req.query;

  selectTopics(queries)
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  selectArticleById(article_id)
    .then((article) => {
      res.stauts(200).send({ article });
    })
    .catch(next);
};
