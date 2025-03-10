const db = require("../db/connection");
const {
  checkArticleExists,
} = require("../utility-functions/checkArticleExists");
const { checkExists } = require("../utility-functions/checkExists");

const { deleteCommentByArticleId } = require("../models/comments.models");

exports.selectArticleById = (article_id) => {
  const SQLString = `
  SELECT
    articles.*,
    COUNT(comments.comment_id)::INT AS comment_count
  FROM articles 
  LEFT JOIN comments ON articles.article_id = comments.article_id
  WHERE articles.article_id = $1
  GROUP BY articles.article_id
  `;
  return db.query(SQLString, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return rows[0];
  });
};

// exports.selectArticles = (query = {}) => {
//   const {
//     topic,
//     sort_by = "created_at",
//     order = "desc",
//     limit = 10,
//     p = 1,
//   } = query;
//   const validQueries = ["topic", "sort_by", "order", "limit", "p"];
//   const validOrder = ["asc", "desc"];
//   const args = [];
//   const greenList = [
//     "created_at",
//     "author",
//     "title",
//     "article_id",
//     "topic",
//     "votes",
//     "article_img_url",
//     "comment_count",
//   ];

//   let sqlString = `
//   SELECT
//   articles.*,
//   COUNT (comments.comment_id)::INT AS comment_count
//   FROM articles
//   LEFT JOIN comments ON articles.article_id = comments.article_id
//   `;

//   const queryKeys = Object.keys(query);
//   const invalidQueryKeys = queryKeys.filter(
//     (key) => !validQueries.includes(key)
//   );

//   if (invalidQueryKeys.length > 0) {
//     return Promise.reject({ status: 400, msg: "Invalid query parameter" });
//   }

//   if (!greenList.includes(sort_by)) {
//     return Promise.reject({
//       status: 400,
//       msg: "Bad request: Invalid sort_by column",
//     });
//   }

//   if (!validOrder.includes(order)) {
//     return Promise.reject({
//       status: 400,
//       msg: "Bad request: Invalid order value",
//     });
//   }

//   let offset = 0;

//   if (isNaN(Number(p)) || p < 1 || isNaN(Number(limit))) {
//     return Promise.reject({ status: 400, msg: "Bad Request: Invalid input" });
//   }
//   if (p > 1) {
//     offset = (p - 1) * limit;
//   }

//   if (topic) {
//     return checkExists("topics", "topic", topic)
//       .then(() => {
//         sqlString += ` WHERE articles.topic = $1`;
//         sqlString += `
//         GROUP BY articles.article_id
//         ORDER BY ${sort_by} ${order}`;
//         sqlString += ` LIMIT $2 OFFSET $3`;
//         args.push(topic, limit, offset);
//         return db.query(sqlString, args);
//       })
//       .then(({ rows }) => {
//         if (rows.length === 0) {
//           return [];
//         }
//         const result = { articles: rows };
//         result.total_count = rows.length;
//         return result;
//       });
//   }

//   sqlString += `
//   GROUP BY articles.article_id
//   ORDER BY ${sort_by} ${order}
//   LIMIT $1 OFFSET $2`;
//   args.push(limit, offset);

//   return db.query(sqlString, args).then(({ rows }) => {
//     if (rows.length === 0) {
//       return [];
//     }
//     const result = { articles: rows };
//     result.total_count = rows.length;

//     return result;
//   });
// };

// exports.selectArticles = (query = {}) => {
//   const {
//     topic,
//     sort_by = "created_at",
//     order = "desc",
//     limit = 10,
//     p = 1,
//   } = query;

//   const validQueries = ["topic", "sort_by", "order", "limit", "p"];
//   const validOrder = ["asc", "desc"];
//   const greenList = [
//     "created_at",
//     "author",
//     "title",
//     "article_id",
//     "topic",
//     "votes",
//     "article_img_url",
//     "comment_count",
//   ];

//   let sqlString = `
//     SELECT articles.*,
//     COUNT(comments.comment_id)::INT AS comment_count
//     FROM articles
//     LEFT JOIN comments ON articles.article_id = comments.article_id
//   `;

//   let countQuery = `SELECT COUNT(*)::INT AS total_count FROM articles`;

//   const queryKeys = Object.keys(query);
//   const invalidQueryKeys = queryKeys.filter(
//     (key) => !validQueries.includes(key)
//   );

//   if (invalidQueryKeys.length > 0) {
//     return Promise.reject({ status: 400, msg: "Invalid query parameter" });
//   }

//   if (!greenList.includes(sort_by)) {
//     return Promise.reject({
//       status: 400,
//       msg: "Bad request: Invalid sort_by column",
//     });
//   }

//   if (!validOrder.includes(order)) {
//     return Promise.reject({
//       status: 400,
//       msg: "Bad request: Invalid order value",
//     });
//   }

//   if (isNaN(Number(p)) || p < 1 || isNaN(Number(limit))) {
//     return Promise.reject({ status: 400, msg: "Bad Request: Invalid input" });
//   }

//   let offset = (p - 1) * limit;
//   const args = [];

//   if (topic) {
//     return checkExists("topics", "topic", topic)
//       .then(() => db.query(countQuery + ` WHERE topic = $1`, [topic])) // Get total count
//       .then(({ rows }) => {
//         const total_count = rows[0].total_count;

//         sqlString += ` WHERE articles.topic = $1`;
//         sqlString += `
//           GROUP BY articles.article_id
//           ORDER BY ${sort_by} ${order}
//           LIMIT $2 OFFSET $3`;

//         args.push(topic, limit, offset);

//         return db.query(sqlString, args).then(({ rows }) => {
//           if (rows.length === 0) {
//             return [];
//           }
//           return { articles: rows, total_count };
//         });
//       });
//   }

//   return db.query(countQuery).then(({ rows }) => {
//     const total_count = rows[0].total_count;

//     sqlString += `
//       GROUP BY articles.article_id
//       ORDER BY ${sort_by} ${order}
//       LIMIT $1 OFFSET $2`;

//     args.push(limit, offset);

//     return db.query(sqlString, args).then(({ rows }) => {
//       if (rows.length === 0) {
//         return [];
//       }
//       return { articles: rows, total_count };
//     });
//   });
// };

// exports.selectArticles = (query = {}) => {
//   const {
//     topic,
//     author,
//     sort_by = "created_at",
//     order = "desc",
//     limit = 10,
//     p = 1,
//   } = query;

//   const validQueries = ["topic", "sort_by", "order", "limit", "p", "author"];
//   const validOrder = ["asc", "desc"];
//   const greenList = [
//     "created_at",
//     "author",
//     "title",
//     "article_id",
//     "topic",
//     "votes",
//     "article_img_url",
//     "comment_count",
//   ];

//   let sqlString = `
//     SELECT articles.*,
//     COUNT(comments.comment_id)::INT AS comment_count
//     FROM articles
//     LEFT JOIN comments ON articles.article_id = comments.article_id
//   `;

//   let countQuery = `SELECT COUNT(*)::INT AS total_count FROM articles`;

//   const queryKeys = Object.keys(query);
//   const invalidQueryKeys = queryKeys.filter(
//     (key) => !validQueries.includes(key)
//   );

//   if (invalidQueryKeys.length > 0) {
//     return Promise.reject({ status: 400, msg: "Invalid query parameter" });
//   }

//   if (!greenList.includes(sort_by)) {
//     return Promise.reject({
//       status: 400,
//       msg: "Bad request: Invalid sort_by column",
//     });
//   }

//   if (!validOrder.includes(order)) {
//     return Promise.reject({
//       status: 400,
//       msg: "Bad request: Invalid order value",
//     });
//   }

//   if (isNaN(Number(p)) || p < 1 || isNaN(Number(limit))) {
//     return Promise.reject({ status: 400, msg: "Bad Request: Invalid input" });
//   }

//   let offset = (p - 1) * limit;
//   const args = [];
//   let conditions = [];

//   const checkPromises = [];

//   if (topic) {
//     checkPromises.push(checkExists("topics", "topic", topic));
//     conditions.push(`articles.topic = $${args.length + 1}`);
//     args.push(topic);
//   }

//   if (author) {
//     checkPromises.push(checkExists("users", "username", author));
//     conditions.push(`articles.author = $${args.length + 1}`);
//     args.push(author);
//   }

//   return Promise.all(checkPromises).then(() => {
//     if (conditions.length > 0) {
//       sqlString += ` WHERE ${conditions.join(" AND ")}`;
//       countQuery += ` WHERE ${conditions.join(" AND ")}`;
//     }

//     sqlString += `
//       GROUP BY articles.article_id
//       ORDER BY ${sort_by} ${order}
//       LIMIT $${args.length + 1} OFFSET $${args.length + 2}`;

//     args.push(limit, offset);

//     return db
//       .query(countQuery, args.slice(0, conditions.length))
//       .then(({ rows }) => {
//         const total_count = rows[0]?.total_count || 0;

//         return db.query(sqlString, args).then(({ rows }) => {
//           return { articles: rows, total_count };
//         });
//       });
//   });
// };

exports.selectArticles = (query = {}) => {
  const {
    topic,
    author,
    sort_by = "created_at",
    order = "desc",
    limit = 10,
    p = 1,
  } = query;

  const validQueries = ["topic", "author", "sort_by", "order", "limit", "p"];
  const validOrder = ["asc", "desc"];
  const greenList = [
    "created_at",
    "author",
    "title",
    "article_id",
    "topic",
    "votes",
    "article_img_url",
    "comment_count",
  ];

  let sqlString = `
    SELECT articles.*,
    COUNT(comments.comment_id)::INT AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
  `;

  let countQuery = `SELECT COUNT(*)::INT AS total_count FROM articles`;

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

  if (isNaN(Number(p)) || p < 1 || isNaN(Number(limit))) {
    return Promise.reject({ status: 400, msg: "Bad Request: Invalid input" });
  }

  let offset = (p - 1) * limit;
  const args = [];

  const checkPromises = [];

  if (topic) {
    checkPromises.push(checkExists("topics", "topic", topic));
  }

  if (author) {
    checkPromises.push(checkExists("users", "username", author));
  }

  return Promise.all(checkPromises).then(() => {
    const conditions = [];
    if (topic) {
      conditions.push(`articles.topic = $${args.length + 1}`);
      args.push(topic);
    }
    if (author) {
      conditions.push(`articles.author = $${args.length + 1}`);
      args.push(author);
    }

    if (conditions.length > 0) {
      sqlString += ` WHERE ${conditions.join(" AND ")}`;
      countQuery += ` WHERE ${conditions.join(" AND ")}`;
    }

    sqlString += `
      GROUP BY articles.article_id
      ORDER BY ${sort_by} ${order}
      LIMIT $${args.length + 1} OFFSET $${args.length + 2}`;

    args.push(limit, offset);

    return db
      .query(countQuery, args.slice(0, conditions.length))
      .then(({ rows }) => {
        const total_count = rows[0].total_count;

        return db.query(sqlString, args).then(({ rows }) => {
          if (rows.length === 0) {
            return [];
          }
          return { articles: rows, total_count };
        });
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

exports.createArticle = (content = {}) => {
  const {
    author,
    title,
    body,
    topic,
    article_img_url = "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
  } = content;

  let sqlString = `
  INSERT INTO articles
  (title, topic, author, body, article_img_url)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *`;
  const args = [title, topic, author, body, article_img_url];

  const topicExists = checkExists("topics", "topic", topic);
  const usernameExists = checkExists("users", "username", author);

  return Promise.all([topicExists, usernameExists]).then(() => {
    return db.query(sqlString, args).then(({ rows }) => {
      return rows[0];
    });
  });
};

exports.deleteArticleById = (article_id) => {
  return checkExists("articles", "article_id", article_id)
    .then(() => {
      return deleteCommentByArticleId(article_id);
    })
    .then(() => {
      const sqlString = `DELETE FROM articles WHERE article_id = $1`;
      return db.query(sqlString, [article_id]).then((rows) => {
        return rows[0];
      });
    });
};
