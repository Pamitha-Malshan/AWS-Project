/**
 * Standalone S3 connection checker.
 * Run: node scripts/check-s3.js
 */
require("dotenv").config();
const { S3Client, HeadBucketCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const REQUIRED = ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "S3_BUCKET_NAME"];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`\n[FAIL] Missing env vars: ${missing.join(", ")}`);
  console.error("       Copy .env.example to .env and fill in the values.\n");
  process.exit(1);
}

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME } = process.env;

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY },
});

const TEST_KEY = "products/__connection_test__.json";

async function run() {
  console.log("\n=== S3 Connection Check ===");
  console.log(`  Bucket : ${S3_BUCKET_NAME}`);
  console.log(`  Region : ${AWS_REGION}\n`);

  // 1 — bucket reachable?
  await step("1. HeadBucket (can we reach the bucket?)", async () => {
    await s3.send(new HeadBucketCommand({ Bucket: S3_BUCKET_NAME }));
  });

  // 2 — write permission?
  await step("2. PutObject  (write permission?)", async () => {
    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: TEST_KEY,
      Body: JSON.stringify({ test: true, ts: new Date().toISOString() }),
      ContentType: "application/json",
    }));
  });

  // 3 — read permission?
  await step("3. GetObject  (read permission?)", async () => {
    const res = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: TEST_KEY }));
    const chunks = [];
    for await (const c of res.Body) chunks.push(c);
    JSON.parse(Buffer.concat(chunks).toString());
  });

  // 4 — delete permission?
  await step("4. DeleteObject (delete permission?)", async () => {
    await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: TEST_KEY }));
  });

  console.log("\n  All checks passed. Your BFF is correctly wired to S3.\n");
}

async function step(label, fn) {
  process.stdout.write(`  ${label} ... `);
  try {
    await fn();
    console.log("OK");
  } catch (err) {
    console.log("FAILED");
    console.error(`\n  Error: ${err.message}`);
    console.error(`  Code : ${err.name || err.Code || "unknown"}`);
    hint(err);
    process.exit(1);
  }
}

function hint(err) {
  const code = err.name || err.Code || "";
  const hints = {
    NoSuchBucket:          "  Hint : Bucket name is wrong or it doesn't exist yet — create it in the AWS Console.",
    InvalidAccessKeyId:    "  Hint : AWS_ACCESS_KEY_ID in your .env is invalid or has been deleted.",
    SignatureDoesNotMatch: "  Hint : AWS_SECRET_ACCESS_KEY in your .env is wrong.",
    AccessDenied:          "  Hint : The IAM user lacks permission for this action. Check the bucket policy and IAM policy.",
    NetworkingError:       "  Hint : Cannot reach AWS — check your internet connection or firewall.",
  };
  if (hints[code]) console.error(hints[code]);
}

run();
