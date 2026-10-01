function validateProduct(req, res, next) {
  const { code, name, quantity, price } = req.body;
  const errors = [];

  if (!code || typeof code !== "string" || code.trim() === "") {
    errors.push("code is required and must be a non-empty string");
  }
  if (!name || typeof name !== "string" || name.trim() === "") {
    errors.push("name is required and must be a non-empty string");
  }
  if (quantity === undefined || quantity === null || isNaN(Number(quantity)) || Number(quantity) < 0) {
    errors.push("quantity is required and must be a non-negative number");
  }
  if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
    errors.push("price is required and must be a non-negative number");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  req.body.quantity = Number(quantity);
  req.body.price = Number(price);
  req.body.code = code.trim();
  req.body.name = name.trim();

  next();
}

module.exports = { validateProduct };
