const db = require("../db/connection");

exports.selectTopics = (queries) => {
  let SQLString = `SELECT * FROM topics`;
  const args = [];

  return db.query(SQLString, args).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "not found" });
    }
    return rows;
  });
};
