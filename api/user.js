const bcrypt = require("bcryptjs");
const client = require("./db");

const createUser = async (email, password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const data = await client.query(
    "INSERT INTO USERS(email, password) VALUES ($1, $2) RETURNING id, email, password",
    [email, hash]
  );

  if (data.rowCount == 0) return false;
  return data.rows[0];
};

const emailExists = async (email) => {
  const data = await client.query(
    `SELECT * FROM project.USERS WHERE email="${email}";`
  );
  console.log(data);
  if (data.rowCount == 0) return false;
  return data.rows[0];
};

const matchPassword = async (password, hashPassword) => {
  const match = await bcrypt.compare(password, hashPassword);
  return match;
};

module.exports = {
  createUser,
  emailExists,
  matchPassword,
};
