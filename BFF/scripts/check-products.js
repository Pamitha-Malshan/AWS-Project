require("dotenv").config();
const { listProducts, getProduct } = require("../src/services/s3Service");

async function check() {
  console.log("\n  Fetching products from S3...\n");

  try {
    const products = await listProducts();

    if (products.length === 0) {
      console.log("  No products found in S3 bucket.\n");
      return;
    }

    console.log(`  Found ${products.length} product(s):\n`);
    console.log("  " + "-".repeat(52));

    for (const p of products) {
      console.log(`  Code     : ${p.code}`);
      console.log(`  Name     : ${p.name}`);
      console.log(`  Quantity : ${p.quantity}`);
      console.log(`  Price    : $${p.price.toFixed(2)}`);
      console.log(`  Created  : ${p.createdAt}`);
      console.log("  " + "-".repeat(52));
    }

    console.log();
  } catch (err) {
    console.error(`  [FAILED] ${err.message}\n`);
    process.exit(1);
  }
}

check();
