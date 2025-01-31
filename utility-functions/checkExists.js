const format = require("pg-format");
const db = require("../db/connection");

exports.checkExists = (table, column, value) => {
  const columnToCheck = table === "topics" ? "slug" : column;

  const sqlStr = format(`SELECT * FROM %I WHERE %I = $1`, table, columnToCheck);
  return db.query(sqlStr, [value]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: `${column} not found`,
      });
    }
  });
};

exports.checkDoesNotExists = (table, column, value) => {
  const columnToCheck = table === "topics" ? "slug" : column;

  const sqlStr = format(`SELECT * FROM %I WHERE %I = $1`, table, columnToCheck);
  return db.query(sqlStr, [value]).then(({ rows }) => {
    if (rows.length > 0) {
      return Promise.reject({
        status: 404,
        msg: `${column} already exists`,
      });
    }
  });
};
