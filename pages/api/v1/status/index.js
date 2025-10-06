import database from "../../../../infra/database.js";

async function status(request, response) {
  const result = await database("SELECT 1 + 1 AS result");
  console.log(result.rows);
  response.status(200).json({ result: result.rows[0].result });
}

export default status;
