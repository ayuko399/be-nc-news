const express = require("express");
const { deleteComments } = require("../controllers/comments.controllers");

const commentsRouter = express.Router();

commentsRouter.delete("/:comment_id", deleteComments);

module.exports = commentsRouter;
