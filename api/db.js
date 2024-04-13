var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "secret",
  database: "project",
});

module.exports = connection;
