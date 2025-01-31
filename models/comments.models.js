const db = require("../db/connection");
const { articleData } = require("../db/data/test-data");
const {
  checkArticleExists,
  checkCommentExists,
} = require("../utility-functions/checkArticleExists");
const { checkExists } = require("../utility-functions/checkExists");

exports.selectCommentsByArticleId = (article_id, query) => {
  return checkArticleExists(article_id)
    .then(() => {
      const args = [];
      const { limit = 10, p = 1 } = query;
      validQueries = ["limit", "p"];

      let sqlString = `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC`;
      args.push(article_id);

      const invalidQueryKeys = Object.keys(query).filter(
        (key) => !validQueries.includes(key)
      );

      if (invalidQueryKeys.length > 0) {
        return Promise.reject({ status: 400, msg: "Invalid query parameter" });
      }

      if (limit) {
        if (isNaN(Number(limit))) {
          return Promise.reject({
            status: 400,
            msg: "Bad Request: Invalid input",
          });
        }
        sqlString += ` LIMIT $2`;
        args.push(limit);
      }
      if (p) {
        if (isNaN(Number(p)) || p < 1) {
          return Promise.reject({
            status: 400,
            msg: "Bad Request: Invalid input",
          });
        }
        if (p > 1) {
          const offset = (p - 1) * limit;
          sqlString += ` OFFSET $3`;
          args.push(offset);
        }
      }

      return db.query(sqlString, args);
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

exports.deleteCommentByArticleId = (article_id) => {
  return checkExists("articles", "article_id", article_id).then(() => {
    const sqlString = `DELETE FROM comments WHERE article_id = $1`;
    return db.query(sqlString, [article_id]);
  });
};

exports.updateCommentById = (comment_id, inc_votes) => {
  return checkCommentExists(comment_id)
    .then(() => {
      const sqlString = `
     UPDATE comments
     SET votes = votes + $1
     WHERE comment_id =  $2
     RETURNING *`;

      return db.query(sqlString, [inc_votes, comment_id]);
    })
    .then(({ rows }) => {
      return rows[0];
    });
};
