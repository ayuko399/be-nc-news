const {
  selectCommentsByArticleId,
  addComment,
} = require("../models/comments.models");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  selectCommentsByArticleId(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postComments = (req, res, next) => {
  const newComment = req.body;
  const { article_id } = req.params;

  addComment(newComment, article_id)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const updateArticle = req.body;
  console.log("hello from controller");
};
