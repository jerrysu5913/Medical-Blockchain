const redis = require('redis');
var config = require('./config.json');
const { URL } = require('url');

// Retrieve Redis service credentials from config
let redisServices = config.services["databases-for-redis"];
let creds = redisServices[0]?.credentials;  // Ensure safe access to the first element

if (!creds) {
  console.error("Redis credentials not found.");
  process.exit(1); // Exit if credentials are missing
}

var connectionString = creds.uri;
var opts = {};  // Initialize options object

// Check if the connection is secure (rediss://)
if (connectionString.startsWith("rediss://")) {
  opts.tls = {
    servername: new URL(connectionString).hostname  // Use hostname from URI for servername
  };

  // Check if the CA certificate is provided and decode it if it exists
  if (creds.ca_certificate_base64 && creds.ca_certificate_base64.trim()) {
    opts.tls.ca = Buffer.from(creds.ca_certificate_base64, "base64");
  } else {
    console.warn("CA certificate is not provided, continuing without it.");
  }
}

// Create Redis client with the connection string and options
var client = redis.createClient(connectionString, opts);

client.on('error', (err) => {
  console.error("Redis error:", err);
});

client.connect().then(() => {
  console.log('Connected to Redis');
}).catch((err) => {
  console.error('Failed to connect to Redis:', err);
});

var exports = module.exports = {};
exports.client = client;
