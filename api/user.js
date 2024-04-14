const bcrypt = require("bcryptjs");
const client = require("./db");

const createUser = async (email, password, name) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  await client.query(
    `INSERT INTO USERS(email, name, password) VALUES ("${email}","${name}", "${hash}")`
  );
  return emailExists(email);
};

const emailExists = async (email) => {
  return new Promise((resolve, reject) => {
    let res;
    return client.query(
      `SELECT * FROM USERS WHERE email="${email}";`,
      function (error, results, fields) {
        if (error) reject(error);
        console.log(results);
        if (!results || results.length == 0) {
          resolve();
        }
        resolve(results[0]);
      }
    );
  });
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
