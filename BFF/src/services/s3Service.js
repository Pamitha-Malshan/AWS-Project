const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadBucketCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// In Lambda, omit static keys and let the SDK use the function's execution role
// (Lambda injects its own temporary AWS_ACCESS_KEY_ID/SECRET/SESSION_TOKEN, which
// the default credential chain handles correctly — relaying only two of the three
// breaks temporary credentials). Locally, fall back to the keys in .env.
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  ...(!process.env.AWS_LAMBDA_FUNCTION_NAME && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  }),
});

const BUCKET = process.env.S3_BUCKET_NAME;
const PREFIX = "products/";

function productKey(code) {
  return `${PREFIX}${code}.json`;
}

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

async function getProduct(code) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: productKey(code),
  });
  const response = await s3.send(command);
  const body = await streamToString(response.Body);
  return JSON.parse(body);
}

async function putProduct(product) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: productKey(product.code),
    Body: JSON.stringify(product),
    ContentType: "application/json",
  });
  await s3.send(command);
  return product;
}

async function deleteProduct(code) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: productKey(code),
  });
  await s3.send(command);
}

async function listProducts() {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: PREFIX,
  });
  const response = await s3.send(command);
  const objects = response.Contents ?? [];

  const products = await Promise.all(
    objects
      .filter((obj) => obj.Key.endsWith(".json"))
      .map(async (obj) => {
        const code = obj.Key.replace(PREFIX, "").replace(".json", "");
        return getProduct(code);
      })
  );

  return products;
}

async function checkConnection() {
  const start = Date.now();
  await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
  return {
    connected: true,
    bucket: BUCKET,
    region: process.env.AWS_REGION,
    latencyMs: Date.now() - start,
  };
}

const DOC_PREFIX = "documents/";

async function uploadDocument(file) {
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${DOC_PREFIX}${Date.now()}-${safeName}`;
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  }));
  return {
    key,
    name: file.originalname,
    size: file.size,
    contentType: file.mimetype,
    uploadedAt: new Date().toISOString(),
  };
}

async function listDocuments() {
  const response = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: DOC_PREFIX }));
  return (response.Contents ?? []).map((obj) => ({
    key: obj.Key,
    name: obj.Key.replace(DOC_PREFIX, "").replace(/^\d+-/, ""),
    size: obj.Size,
    uploadedAt: obj.LastModified,
  }));
}

async function deleteDocument(key) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

async function getDocumentDownloadUrl(key) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

module.exports = {
  getProduct, putProduct, deleteProduct, listProducts, checkConnection,
  uploadDocument, listDocuments, deleteDocument, getDocumentDownloadUrl,
};
