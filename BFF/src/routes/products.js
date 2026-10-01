const express = require("express");
const db = require("../services/dbService");
const { validateProduct } = require("../middleware/validate");

const router = express.Router();

// GET /products — list all products
router.get("/", async (_req, res) => {
  try {
    const products = await db.listProducts();
    res.json({ success: true, data: products });
  } catch (err) {
    console.error("listProducts error:", err);
    res.status(500).json({ success: false, message: "Failed to retrieve products" });
  }
});

// GET /products/:code — get one product by code
router.get("/:code", async (req, res) => {
  try {
    const product = await db.getProduct(req.params.code);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (err) {
    console.error("getProduct error:", err);
    res.status(500).json({ success: false, message: "Failed to retrieve product" });
  }
});

// POST /products — create a new product
router.post("/", validateProduct, async (req, res) => {
  try {
    const { code, name, quantity, price } = req.body;

    const existing = await db.getProduct(code);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Product with code '${code}' already exists. Use PUT to update.`,
      });
    }

    const product = await db.createProduct({ code, name, quantity, price });
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    console.error("createProduct error:", err);
    res.status(500).json({ success: false, message: "Failed to create product" });
  }
});

// PUT /products/:code — update an existing product
router.put("/:code", validateProduct, async (req, res) => {
  try {
    const code = req.params.code;
    if (req.body.code !== code) {
      return res.status(400).json({ success: false, message: "code in body must match URL param" });
    }

    const existing = await db.getProduct(code);
    if (!existing) return res.status(404).json({ success: false, message: "Product not found" });

    const updated = await db.updateProduct(code, {
      name: req.body.name,
      quantity: req.body.quantity,
      price: req.body.price,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("updateProduct error:", err);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
});

// DELETE /products/:code — remove a product
router.delete("/:code", async (req, res) => {
  try {
    const deleted = await db.deleteProduct(req.params.code);
    if (!deleted) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: `Product '${req.params.code}' deleted` });
  } catch (err) {
    console.error("deleteProduct error:", err);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
});

module.exports = router;
