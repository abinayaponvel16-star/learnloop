const mongoose = require("mongoose");
const dns = require("dns");

const getFallbackDnsServers = () =>
  (process.env.DNS_FALLBACK_SERVERS || "1.1.1.1,8.8.8.8")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

const getConnectionOptions = () => ({
  serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000),
});

const isSrvDnsError = (error) =>
  ["ENOTFOUND", "ECONNREFUSED", "ETIMEOUT", "EAI_AGAIN"].includes(error.code) ||
  error.message.includes("querySrv");

const isServerSelectionError = (error) =>
  error.name === "MongooseServerSelectionError" ||
  error.message.includes("Server selection timed out") ||
  error.message.includes("Could not connect to any servers");

const logConnectionHint = (error) => {
  if (isSrvDnsError(error)) {
    console.error(
      "MongoDB DNS lookup failed. Check your network DNS settings or DNS_FALLBACK_SERVERS."
    );
    return;
  }

  if (isServerSelectionError(error)) {
    console.error(
      "MongoDB Atlas was resolved, but the server could not be reached. Check Atlas Network Access IP allowlist, cluster status, VPN/proxy/firewall, and whether outbound TCP 27017 is allowed."
    );
  }
};

const connectWithUri = async (mongoUri, label) => {
  const connection = await mongoose.connect(mongoUri, getConnectionOptions());
  console.log(`MongoDB connected (${label}): ${connection.connection.host}`);
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const fallbackMongoUri = process.env.MONGO_URI_FALLBACK;

  try {
    await connectWithUri(mongoUri, "primary");
  } catch (error) {
    if (isSrvDnsError(error)) {
      const fallbackDnsServers = getFallbackDnsServers();

      try {
        dns.setServers(fallbackDnsServers);
        console.warn(
          `MongoDB SRV DNS lookup failed; retrying with DNS servers: ${fallbackDnsServers.join(", ")}`
        );
        await connectWithUri(mongoUri, "fallback DNS");
        return;
      } catch (dnsFallbackError) {
        console.warn("MongoDB fallback DNS retry failed:", dnsFallbackError.message);
      }
    }

    if (fallbackMongoUri) {
      try {
        console.warn("Retrying MongoDB connection with MONGO_URI_FALLBACK");
        await connectWithUri(fallbackMongoUri, "fallback URI");
        return;
      } catch (fallbackError) {
        console.error("MongoDB fallback URI failed:", fallbackError.message);
      }
    }

    console.error("MongoDB connection failed:", error.message);
    logConnectionHint(error);
    process.exit(1);
  }
};

module.exports = connectDB;
