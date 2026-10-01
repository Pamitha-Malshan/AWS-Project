require("dotenv").config();
const mysql = require("mysql2/promise");

async function init() {
  console.log("\n  Initialising RDS database...\n");

  // Connect without a database first so we can create it
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`  [SUCCESS] Database '${process.env.DB_NAME}' is ready.`);

    await conn.query(`USE \`${process.env.DB_NAME}\``);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        code        VARCHAR(50)    PRIMARY KEY,
        name        VARCHAR(255)   NOT NULL,
        quantity    INT            NOT NULL DEFAULT 0,
        price       DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
        created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP      NULL ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log(`  [SUCCESS] Table 'products' is ready.`);
  } catch (err) {
    console.error("  [FAILED] ", err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }

  console.log("\n  Done.\n");
}

init();
