const express = require("express");
const cors = require("cors");
const productsRouter = require("./routes/products");
const documentsRouter = require("./routes/documents");
const { checkConnection } = require("./services/dbService");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173").split(",");

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

// Basic liveness probe — always fast
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "product-store-bff" });
});

// Deep RDS connectivity check
app.get("/health/db", async (_req, res) => {
  try {
    const info = await checkConnection();
    res.json({ status: "ok", db: info });
  } catch (err) {
    res.status(503).json({
      status: "error",
      db: { connected: false, host: process.env.DB_HOST, database: process.env.DB_NAME },
      detail: err.message,
    });
  }
});

app.use("/products", productsRouter);
app.use("/documents", documentsRouter);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

module.exports = app;
