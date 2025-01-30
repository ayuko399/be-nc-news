const {
  selectArticleById,
  selectArticles,
  patchArticleById,
  createArticle,
} = require("../models/articles.models");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const query = req.query;
  selectArticles(query)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  patchArticleById(article_id, inc_votes)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  const content = req.body;

  createArticle(content)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};
