const db = require("../db/connection");
const { checkDoesNotExists } = require("../utility-functions/checkExists");

exports.selectTopics = (query) => {
  let sqlString = `SELECT * FROM topics`;
  const args = [];

  return db.query(sqlString, args).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "not found" });
    }
    return rows;
  });
};

exports.addTopic = (newTopic) => {
  const { slug, description } = newTopic;
  return checkDoesNotExists("topics", "topic", slug).then(() => {
    const sqlStr = `INSERT INTO topics (slug, description) VALUES ($1, $2) RETURNING *`;
    const args = [slug, description];
    return db.query(sqlStr, args).then(({ rows }) => {
      return rows[0];
    });
  });
};
