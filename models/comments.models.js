const db = require("../db/connection");
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
