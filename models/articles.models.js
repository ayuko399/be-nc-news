const db = require("../db/connection");

exports.selectArticleById = (article_id) => {
  const SQLString = `SELECT * FROM articles WHERE article_id = $1`;
  return db.query(SQLString, [article_id]).then(({ rows }) => {
    console.log(rows, "<<<<<<<<<<rows");
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return rows[0];
  });
};
