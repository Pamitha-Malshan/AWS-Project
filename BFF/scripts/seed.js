require("dotenv").config();
const { createProduct, pool } = require("../src/services/dbService");

const products = [
  { code: "P001", name: "Wireless Mouse", quantity: 150, price: 29.99 },
  { code: "P002", name: "Mechanical Keyboard", quantity: 75, price: 89.99 },
];

async function seed() {
  console.log("\n  Seeding products to RDS MySQL...\n");

  for (const product of products) {
    try {
      await createProduct(product);
      console.log(`  [SUCCESS] Inserted product: ${product.code} - ${product.name}`);
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        console.log(`  [SKIPPED] Product ${product.code} already exists`);
      } else {
        console.error(`  [FAILED]  Could not insert ${product.code}: ${err.message}`);
        process.exit(1);
      }
    }
  }

  await pool.end();
  console.log(`\n  Done. ${products.length} products processed.\n`);
}

seed();
