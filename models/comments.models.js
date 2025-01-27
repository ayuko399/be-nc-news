const db = require("../db/connection");

exports.selectCommentsByArticleId = (article_id) => {
  const SQLString = `SELECT * FROM comments WHERE article_id = $1`;
  return db.query(SQLString, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Comment not found" });
    }
    return rows;
  });
};
