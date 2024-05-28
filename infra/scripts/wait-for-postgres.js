const { exec } = require("node:child_process");
function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);
  function handleReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write("🟡");
      checkPostgres();
      return;
    }

    console.log("\n \n 🐘 Postgres pronto 🟢");
  }
}

process.stdout.write("\n \n 🐘 Aguardando Postgres 🔴");
checkPostgres();
