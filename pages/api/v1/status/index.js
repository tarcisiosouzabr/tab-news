import database from "infra/database.js";
import { InternalServerError } from "infra/error";
// a - a
async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();

    const dbVersionQuery = await database.query("SHOW server_version;");
    const dbVersion = dbVersionQuery.rows;

    const maxConnectionsQuery = await database.query("SHOW max_connections;");
    const maxConnections = maxConnectionsQuery.rows[0].max_connections;

    const databaseName = process.env.POSTGRES_DB;
    const openConnectionsQuery = await database.query({
      text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1 AND state = 'active';",
      values: [databaseName],
    });
    const openConnections = openConnectionsQuery.rows[0].count;

    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          db_version: dbVersion[0].server_version,
          max_connections: parseInt(maxConnections),
          opened_connections: openConnections,
        },
      },
    });
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    });

    console.error(publicErrorObject);
    response.status(500).json(publicErrorObject);
  }
}

export default status;
