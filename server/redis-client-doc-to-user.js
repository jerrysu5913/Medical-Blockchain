const redis = require('redis');
var config = require('./config.json');
const { URL } = require('url');

// Get Redis service configuration
let redisServices = config.services["databases-for-redis"];
let creds = redisServices[0]?.credentials;  // Make sure to access the first element if it's an array

if (!creds) {
  console.error("No Redis credentials found.");
  process.exit(1);
}

var connectionString = creds.uri;
var opts = {};  // Initialize the options object

// Check if using SSL/TLS connection (rediss)
if (connectionString.startsWith("rediss://")) {
  opts.tls = {
    servername: new URL(connectionString).hostname  // Use the hostname for TLS verification
  };

  // If a CA certificate is provided, decode it from base64 and add it to the options
  if (creds.ca_certificate_base64 && creds.ca_certificate_base64.trim()) {
    opts.tls.ca = Buffer.from(creds.ca_certificate_base64, "base64");
  } else {
    console.warn("No CA certificate found, proceeding without it.");
  }
}

var client;

// Create the Redis client with the appropriate connection string and options
try {
  client = redis.createClient(connectionString, opts);
  client.on('error', (err) => {
    console.error("Redis error: ", err);
  });

  client.connect().then(() => {
    console.log('Connected to Redis');
  }).catch((err) => {
    console.error('Failed to connect to Redis:', err);
  });
} catch (err) {
  console.error('Error creating Redis client:', err);
  process.exit(1);
}

var exports = module.exports = {};
exports.client = client;
