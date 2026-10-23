require("dotenv").config();
const fs = require("fs");

const KAFKA_CLIENT_CERT_PATH =
  process.env.KAFKA_CLIENT_CERT_PATH || "./config/kafka_client.cer";
const KAFKA_CLIENT_KEY_PATH =
  process.env.KAFKA_CLIENT_CERT_PATH || "./config/kafka_client.key";

module.exports = {
  ROCKETCHAT_ENABLED: Boolean(process.env.ROCKETCHAT_ENABLED === "true"),
  VANILLA_ENABLED: Boolean(process.env.VANILLA_ENABLED === "true"),
  LOGGER: {
    DISABLE_LOGGING: Boolean(process.env.DISABLE_LOGGING === "true"),
    LOG_LEVEL: process.env.LOG_LEVEL || "debug",
  },
  KAFKA: {
    connectionString: process.env.KAFKA_URL || "localhost:9092",
    ssl: {
      cert:
        process.env.KAFKA_CLIENT_CERT ||
        (fs.existsSync(KAFKA_CLIENT_CERT_PATH) &&
          fs.readFileSync(KAFKA_CLIENT_CERT_PATH)),
      key:
        process.env.KAFKA_CLIENT_CERT_KEY ||
        (fs.existsSync(KAFKA_CLIENT_KEY_PATH) &&
          fs.readFileSync(KAFKA_CLIENT_KEY_PATH)),
      passphrase: process.env.KAFKA_SSL_PASSPHRASE || "secret",
    },
  },
  ROCKETCHAT: {
    PROTOCOL: process.env.ROCKETCHAT_PROTOCOL || "http",
    HOST: process.env.ROCKETCHAT_HOST || "127.0.0.1",
    PORT: Number(process.env.ROCKETCHAT_PORT || "3000"),
    USERNAME: process.env.ROCKETCHAT_USERNAME || "rocket",
    PASSWORD: process.env.ROCKETCHAT_PASSWORD || "rocket",
  },
  VANILLA: {
    API_URL: process.env.VANILLA_API_URL || "http://localhost/api/v2",
    ADMIN_ACCESS_TOKEN: process.env.VANILLA_ADMIN_ACCESS_TOKEN,
  },
  // Passed whole to tc-core-library-js auth.m2m. USE_KEYCLOAK=true requests tokens
  // with the KEYCLOAK_* settings; unset or "false" uses the AUTH0_* settings, as
  // before the Keycloak migration. Each provider ignores the other's settings.
  TOPCODER: {
    USE_KEYCLOAK: process.env.USE_KEYCLOAK,
    AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    AUTH0_PROXY_SERVER_URL: process.env.AUTH0_PROXY_SERVER_URL,
    AUTH0_URL: process.env.AUTH0_URL,
    KEYCLOAK_ISSUER: process.env.KEYCLOAK_ISSUER,
    KEYCLOAK_AUDIENCE: process.env.KEYCLOAK_AUDIENCE,
    KEYCLOAK_TOKEN_URL: process.env.KEYCLOAK_TOKEN_URL,
    KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID,
    KEYCLOAK_CLIENT_SECRET: process.env.KEYCLOAK_CLIENT_SECRET,
    KEYCLOAK_SCOPE: process.env.KEYCLOAK_SCOPE,
    API_URL: process.env.TOPCODER_API_URL || "https://api.topcoder-dev.com",
    ROOT_URL: process.env.TOPCODER_ROOT_URL || "https://topcoder-dev.com",
  },

  TEMPLATES: {
    TEMPLATE_FILE_PATH: "./../../config/template.json",
  },

  FORUM_TITLE_LENGTH_LIMIT: process.env.FORUM_TITLE_LENGTH_LIMIT || 87,
};
