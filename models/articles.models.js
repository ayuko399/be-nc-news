const db = require("../db/connection");
const {
  checkArticleExists,
} = require("../utility-functions/checkArticleExists");

const { checkExists } = require("../utility-functions/checkExists");

exports.selectArticleById = (article_id) => {
  const SQLString = `
  SELECT
    articles.article_id,
    articles.title,
    articles.topic,
    articles.author,
    articles.body,
    articles.created_at,
    articles.votes,
    articles.article_img_url,
    COUNT(comments.comment_id) AS comment_count
  FROM articles 
  LEFT JOIN comments ON articles.article_id = comments.article_id
  WHERE articles.article_id = $1
  GROUP BY articles.article_id
  `;
  return db.query(SQLString, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return {
      ...rows[0],
      comment_count: Number(rows[0].comment_count),
    };
  });
};

exports.selectArticles = (query = {}) => {
  const { topic, sort_by = "created_at", order = "desc" } = query;
  const validQueries = ["topic", "sort_by", "order"];
  const validOrder = ["asc", "desc"];
  const args = [];
  const greenList = [
    "created_at",
    "author",
    "title",
    "article_id",
    "topic",
    "votes",
    "article_img_url",
  ];

  let sqlString = `
  SELECT
  articles.author,
  articles.title,
  articles.article_id,
  articles.topic,
  articles.body,
  articles.created_at,
  articles.votes,
  articles.article_img_url,
  COUNT (comments.comment_id) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id
  `;

  const queryKeys = Object.keys(query);
  const invalidQueryKeys = queryKeys.filter(
    (key) => !validQueries.includes(key)
  );

  if (invalidQueryKeys.length > 0) {
    return Promise.reject({ status: 400, msg: "Invalid query parameter" });
  }

  if (!greenList.includes(sort_by)) {
    return Promise.reject({
      status: 400,
      msg: "Bad request: Invalid sort_by column",
    });
  }

  if (!validOrder.includes(order)) {
    return Promise.reject({
      status: 400,
      msg: "Bad request: Invalid order value",
    });
  }

  if (topic) {
    return checkExists("topics", "topic", topic) // Check topics table first
      .then(() => {
        sqlString += ` WHERE articles.topic = $1`;
        args.push(topic);
        sqlString += ` 
        GROUP BY articles.article_id
        ORDER BY ${sort_by} ${order}`;
        return db.query(sqlString, args);
      })
      .then(({ rows }) => {
        return rows.map((article) => ({
          ...article,
          comment_count: Number(article.comment_count),
        }));
      });
  }

  sqlString += ` 
  GROUP BY articles.article_id
  ORDER BY ${sort_by} ${order}`;

  return db.query(sqlString, args).then(({ rows }) => {
    if (rows.length === 0) {
      return [];
    }
    return rows.map((article) => ({
      ...article,
      comment_count: Number(article.comment_count),
    }));
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
