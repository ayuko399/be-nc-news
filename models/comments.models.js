const db = require("../db/connection");
const { articleData } = require("../db/data/test-data");
const {
  checkArticleExists,
} = require("../utility-functions/checkArticleExists");

exports.selectCommentsByArticleId = (article_id) => {
  return checkArticleExists(article_id)
    .then(() => {
      const SQLString = `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC`;
      return db.query(SQLString, [article_id]);
    })
    .then(({ rows }) => {
      return rows;
    });
};

exports.addComment = (newComment, article_id) => {
  const { username, body } = newComment;
  const args = [username, body, article_id];

  return checkArticleExists(article_id).then(() => {
    const SQLString = `
      INSERT INTO comments
      (author, body, article_id)
      VALUES ($1, $2, $3)
      RETURNING *`;
    return db.query(SQLString, args).then(({ rows }) => {
      return rows[0];
    });
  });
};
