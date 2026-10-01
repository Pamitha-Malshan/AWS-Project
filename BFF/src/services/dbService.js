const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
});

async function checkConnection() {
  const start = Date.now();
  const conn = await pool.getConnection();
  const latencyMs = Date.now() - start;
  conn.release();
  return { host: process.env.DB_HOST, database: process.env.DB_NAME, latencyMs };
}

function mapRow(row) {
  return { ...row, price: parseFloat(row.price), quantity: Number(row.quantity) };
}

async function listProducts() {
  const [rows] = await pool.query(
    "SELECT code, name, quantity, price, created_at AS createdAt, updated_at AS updatedAt FROM products ORDER BY created_at DESC"
  );
  return rows.map(mapRow);
}

async function getProduct(code) {
  const [rows] = await pool.query(
    "SELECT code, name, quantity, price, created_at AS createdAt, updated_at AS updatedAt FROM products WHERE code = ?",
    [code]
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

async function createProduct({ code, name, quantity, price }) {
  await pool.query(
    "INSERT INTO products (code, name, quantity, price) VALUES (?, ?, ?, ?)",
    [code, name, quantity, price]
  );
  return getProduct(code);
}

async function updateProduct(code, { name, quantity, price }) {
  await pool.query(
    "UPDATE products SET name = ?, quantity = ?, price = ? WHERE code = ?",
    [name, quantity, price, code]
  );
  return getProduct(code);
}

async function deleteProduct(code) {
  const [result] = await pool.query("DELETE FROM products WHERE code = ?", [code]);
  return result.affectedRows > 0;
}

module.exports = { pool, checkConnection, listProducts, getProduct, createProduct, updateProduct, deleteProduct };
