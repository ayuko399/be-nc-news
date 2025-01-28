const db = require("../db/connection");
const {
  checkArticleExists,
} = require("../utility-functions/checkArticleExists");

exports.selectArticleById = (article_id) => {
  const SQLString = `SELECT * FROM articles WHERE article_id = $1`;
  return db.query(SQLString, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return rows[0];
  });
};

exports.selectArticles = () => {
  let SQLString = `
  SELECT
    articles.author,
    articles.title,
    articles.article_id,
    articles.topic,
    articles.created_at,
    articles.votes,
    articles.article_img_url,
    COUNT (comments.comment_id) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id
  GROUP BY articles.article_id
  ORDER BY articles.created_at DESC`;

  return db.query(SQLString).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "not found" });
    }
    return rows.map((article) => {
      article.comment_count = Number(article.comment_count);
      return article;
    });
  });
};

exports.patchArticleById = (article_id, inc_votes) => {
  return checkArticleExists(article_id).then(() => {
    const SQLString = `
    UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *`;

    return db.query(SQLString, [inc_votes, article_id]).then(({ rows }) => {
      return rows[0];
    });
  });
};
