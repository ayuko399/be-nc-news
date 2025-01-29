const db = require("../db/connection");

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
