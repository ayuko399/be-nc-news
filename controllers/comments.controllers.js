const {
  selectCommentsByArticleId,
  addComment,
  deleteCommentById,
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

exports.deleteComments = (req, res, next) => {
  const { comment_id } = req.params;
  console.log(comment_id, "<<<<<<comment_id");

  deleteCommentById(comment_id)
    .then(() => {
      res.status(204).send("success");
    })
    .catch((err) => {
      console.log(err, "<<<<<<<<<<<<<<,err");
      next(err);
    });
};
