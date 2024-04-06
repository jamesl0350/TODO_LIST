const express = require("express");
const app = express();
const port = 3000;
app.use(express.json());
const cors = require("cors");
app.use(cors());
var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "secret",
  database: "project",
});
connection.connect();
app.get("/", (req, res) => {
  connection.query("select * from USERS", function (error, results, fields) {
    if (error) throw error;
    console.log("The solution is: ", results);
    res.send(results);
  });
});

//endpoint example
app.get("/hello", (req, res) => {
  res.send("This is another endpoint");
});

app.post("/login", (req, res) => {
  console.log(req.body);
});

app.post("/registration", (req, res) => {
  console.log(req.body);
});

app.get("/users/:userId/lists", (req, res) => {
  connection.query(
    `select TODO_LIST.*, TODO_LIST_ITEMS.* from TODO_LIST inner join TODO_LIST_ITEMS on TODO_LIST_ITEMS.todo_list_id = TODO_LIST.id where TODO_LIST.user_id = ${req.params.userId}`,
    function (error, results, fields) {
      if (error) throw error;
      console.log("The solution is: ", results);
      res.send(results);
    }
  );
});

app.post("/users/:userId/lists", (req, res) => {
  const userId = req.params.userId;
  console.log("We're here");
  const listName = req.body.listName;
  const values = { user_id: userId, name: listName };
  var query = connection.query(
    "INSERT INTO TODO_LIST SET ?",
    values,
    function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    }
  );
});

app.put("/users/:userId/lists/:listId", (req, res) => {
  const listId = req.params.listId;
  console.log("We're here");
  const itemName = req.body.itemName;
  const values = { name: itemName, id: listId };
  var query = connection.query(
    `UPDATE TODO_LIST SET name = "${itemName}" WHERE id = "${listId}"`,
    values,
    function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    }
  );
});

app.put("/users/:id/lists/:listId/item/:itemId", (req, res) => {
  console.log(req.body);
  const itemId = req.params.itemId;
  console.log("We're here");
  const itemName = req.body.itemName;
  const values = { name: itemName };
  var query = connection.query(
    `UPDATE TODO_LIST_ITEMS SET task = "${itemName}" WHERE id = "${itemId}"`,
    values,
    function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
