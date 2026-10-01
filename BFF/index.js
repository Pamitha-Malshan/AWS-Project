require("dotenv").config();
const app = require("./src/app");
const { checkConnection } = require("./src/services/dbService");

const PORT = process.env.PORT || 3000;

const required = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`[ERROR] Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

app.listen(PORT, async () => {
  console.log(`\n  Product Store BFF started on http://localhost:${PORT}`);
  console.log(`  Checking RDS MySQL connection...`);

  try {
    const info = await checkConnection();
    console.log(`  [SUCCESS] Connected to RDS MySQL`);
    console.log(`            Host     : ${info.host}`);
    console.log(`            Database : ${info.database}`);
    console.log(`            Latency  : ${info.latencyMs}ms`);
    console.log(`\n  BFF is ready to accept requests.\n`);
  } catch (err) {
    console.error(`  [FAILED]  Could not connect to RDS MySQL`);
    console.error(`            Host     : ${process.env.DB_HOST}`);
    console.error(`            Database : ${process.env.DB_NAME}`);
    console.error(`            Reason   : ${err.message}`);
    console.error(`\n  Fix the DB configuration and restart the server.\n`);
    process.exit(1);
  }
});
