import database from "../infra/database";

async function create(userInputValue) {
  const results = await database.query({
    text: `
          INSERT INTO 
              users (username, email, password) 
          VALUES 
              ($1, $2, $3)
          RETURNING *;`,
    values: [
      userInputValue.username,
      userInputValue.email,
      userInputValue.password,
    ],
  });
  return results.rows[0];
}

const user = {
  create,
};

export default user;
