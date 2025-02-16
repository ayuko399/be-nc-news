const express = require("express");
const {
  getArticles,
  getArticleById,
  patchArticleById,
  postArticle,
  deleteArticle,
} = require("../controllers/articles.controllers");
const {
  getCommentsByArticleId,
  postComments,
} = require("../controllers/comments.controllers");

const articlesRouter = express.Router();

articlesRouter.get("/", getArticles);
articlesRouter.post("/", postArticle);
articlesRouter.get("/:article_id", getArticleById);
articlesRouter.patch("/:article_id", patchArticleById);
articlesRouter.delete("/:article_id", deleteArticle);

articlesRouter.get("/:article_id/comments", getCommentsByArticleId);
articlesRouter.post("/:article_id/comments", postComments);

module.exports = articlesRouter;
