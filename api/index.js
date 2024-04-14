const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const connection = require("./db");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { emailExists, createUser, matchPassword } = require("./user");

app.use(express.json());
app.use(cors());

connection.connect();

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

passport.use(
  "local-login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      console.log(123);
      try {
        const user = await emailExists(email);
        if (!user) return done(null, false);
        const isMatch = await matchPassword(password, user.password);
        if (!isMatch) return done(null, false);
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

app.post("/registration", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  if (!email || !password) {
    res.send("error");
    return;
  }
  try {
    const user = await emailExists(email);

    if (user) {
      res.send("error");
      return;
    }

    const newUser = await createUser(email, password, name);
    res.send(newUser);
  } catch (error) {
    return;
  }
});

app.post("/login", (req, res) => {
  passport.authenticate(
    "local-login",
    {
      session: false,
    },
    function (error, value) {
      res.send(value);
    }
  )(req, res);
});

app.use(passport.initialize()); // init passport on every route call
app.use(passport.session()); //allow passport to use "express-session"

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

app.get("/users/:userId/lists", (req, res) => {
  connection.query(
    `select TODO_LIST.*, TODO_LIST_ITEMS.* from TODO_LIST inner join TODO_LIST_ITEMS on TODO_LIST_ITEMS.todo_list_id = TODO_LIST.id where TODO_LIST.user_id = ${req.params.userId}`,
    function (error, results, fields) {
      if (error) throw error;
      const formatted = results.reduce((accum, item) => {
        if (!accum[item.todo_list_id]) {
          accum[item.todo_list_id] = {
            todo_list_id: item.todo_list_id,
            user_id: item.user_id,
            name: item.name,
            items: [],
          };
        }
        accum[item.todo_list_id].items.push({ id: item.id, task: item.task });

        return accum;
      }, {});
      res.send(Object.values(formatted));
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

// app.put("/users/:id/lists/:listId/item/:itemId", (req, res) => {
//   console.log(req.body);
//   const itemId = req.params.itemId;
//   console.log("We're here");
//   const itemName = req.body.itemName;
//   const values = { name: itemName };
//   var query = connection.query(
//     `UPDATE TODO_LIST_ITEMS SET task = "${itemName}" WHERE id = "${itemId}"`,
//     values,
//     function (error, results, fields) {
//       if (error) throw error;
//       res.send(results);
//     }
//   );
// });

app.post("/users/:id/lists/:listId/item", (req, res) => {
  console.log(req.body);
  const listId = req.params.listId;
  console.log("boom boom boom");
  const itemName = req.body.itemName;
  const values = { itemName, listId };
  var query = connection.query(
    `INSERT INTO TODO_LIST_ITEMS (task, todo_list_id) VALUES ("${itemName}" , "${listId}");`,
    values,
    function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    }
  );
});

app.delete("/users/:id/lists/:listId/item/:itemId", (req, res) => {
  console.log(req.body);
  const itemId = req.params.itemId;
  var query = connection.query(
    `DELETE FROM TODO_LIST_ITEMS WHERE id = ${itemId}`,
    function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    }
  );
});

//delete todo list
app.delete("/users/:id/lists/:listId", (req, res) => {
  console.log(req.body);
  const listId = req.params.listId;
  var query = connection.query(
    `DELETE FROM TODO_LIST WHERE id = ${listId}`,
    function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
