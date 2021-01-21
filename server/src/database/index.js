const Connection = require('tedious').Connection;
const dbConfig = require('../config/database');
const Request = require('tedious').Request;

const executeSQL = (sql, callback) => {
var connection = new Connection(dbConfig);
connection.connect((err) => {
    if (err)
      return callback(err, null);

    const request = new Request(sql, (err, rowCount, rows) => {
      connection.close();

      if (err)
        return callback(err, null);

      callback(null, {rowCount, rows});
    });

    connection.execSql(request);
});
};

module.exports = executeSQL;