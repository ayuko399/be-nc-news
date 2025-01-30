const express = require("express");
const {
  deleteComments,
  patchComment,
} = require("../controllers/comments.controllers");

const commentsRouter = express.Router();

commentsRouter.delete("/:comment_id", deleteComments);
commentsRouter.patch("/:comment_id", patchComment);

module.exports = commentsRouter;
