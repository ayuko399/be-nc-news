const db = require("../db/connection");
const { articleData } = require("../db/data/test-data");
const {
  checkArticleExists,
  checkCommentExists,
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

  return checkArticleExists(article_id)
    .then(() => {
      return db.query(`SELECT * FROM users WHERE username = $1`, [username]);
    })
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Username not found" });
      }
      const sqlString = `
      INSERT INTO comments
      (author, body, article_id)
      VALUES ($1, $2, $3)
      RETURNING *`;
      return db.query(sqlString, args).then(({ rows }) => {
        return rows[0];
      });
    });
};

exports.deleteCommentById = (comment_id) => {
  return checkCommentExists(comment_id).then(() => {
    const sqlString = `DELETE FROM comments WHERE comment_id = $1`;
    return db.query(sqlString, [comment_id]);
  });
};
