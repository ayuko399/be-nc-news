const db = require("../db/connection");
const {} = require("");

exports.selectUsers = () => {
  const sqlString = `SELECT * FROM users`;
  return db.query(sqlString).then(({ rows }) => {
    return rows;
  });
};

exports.selectUserByUsername = (username) => {
  const sqlString = `SELECT * FROM users WHERE username = $1`;
  return db.query(sqlString, [username]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Username not found" });
    }
    return rows[0];
  });
};
