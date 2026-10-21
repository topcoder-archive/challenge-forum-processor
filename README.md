#  Topcoder v5 Challenge Forum Processor

## Description

This is a Node app that runs as a processor, watching a kafka queue and interfacing with Rocket.chat and/or Vanilla forum to build private groups to potentially replace the challenge forums.

## Requirements

- [Node](https://nodejs.org/en/)
- [Kafka](https://kafka.apache.org/)
- [Rocket.chat](https://rocket.chat/)
- [Vanilla Forum](https://open.vanillaforums.com/)

## Local Development
Install Docker.

### Running all services
1. Enable Rocketchat and Vanilla in `config/default.js`.
2. Run the following command to spin up instances of Kafka, Rocketchat, Mongo, Vanilla and Mysql during local development.
```bash
docker-compose -f docker-compose.yml -f vanilla.yml -f rocketchat.yml up -d 
```
Make sure `kafka`, `zookeeper`, `mongo`, `rocketchat`, `mysql-lcal` and `vanilla-local` services have start by running `docker ps`.

The default credentials of RocketChat are `rocket:rocket`, and the GUI should be accessible at http://127.0.0.1:3000/. You'll have to configure RocketChat before you'll be able to use it. Open the GUI, login and answer the prompts to configure it.

### Running with Vanilla only
1. Enable Vanilla in `config/default.js`. Disable Rocketchat in `config/default.js`.
2. Run the command to spin up instances of Kafka, Vanilla and Mysql during local development:
```bash
docker-compose -f docker-compose.yml -f vanilla.yml up -d
```
Make sure `kafka`, `zookeeper`, `mysql-lcal` and `vanilla-local` services have start by running `docker ps`.

### Running with Rocketchat only
1. Disable Vanilla in `config/default.js`. Enable Rocketchat in `config/default.js`.
2.Run the command to spin up instances of Kafka, Rocketchat and Mongo during local development:
```bash
docker-compose -f docker-compose.yml -f rocketchat.yml up -d
```
Make sure `kafka`, `zookeeper`, `mongo`, `rocketchat` services have start by running `docker ps`.


### Setup Vanilla

The GUI for Vanilla forum can be accessible at http://127.0.0.1/.
On the Vanilla setup page, Mysql related fields must be filled like belows:

  - Database Host: mysql-local
  - Database Name: dbname
  - Database User: root
  - Database Password: root

and the remaining fields could be configured like belows:

  - Application Title: vanilla
  - Admin Email: test@test.com
  - Admin Username: admin
  - Admin Password: admin
  - Confirm Password: admin

#### Generate Vanilla admin token
Go to http://127.0.0.1/profile/tokens and generate a new token.

Here is an example token for your reference:

```
va.D4GXlYezw7yQPvjGyhreExqg7Ryo7Ylt.TEwccQ.XjQM67_
```

## Configuration

Please set the following environment variables to configure the app.
For quick-setup while development, use a `.env` file, and run `docker-compose up -d`, and then start the processor.

| Name | Description | Default value |
| ---- | ----------- | ------------- |
| ROCKETCHAT_ENABLED | Enable/Disable processing messages with Rocketchat | `false`
| VANILLA_ENABLED | Enable/Disable processing messages with Vanilla |`true`
| DISABLE_LOGGING | Whether to disable logging | `false` |
| LOG_LEVEL | Logging level | `debug` |
| KAFKA_URL | Kafka connection string | `localhost:9092` |
| KAFKA_CLIENT_CERT | Kafka client certificate (SSL). This gets precedence over the file path. | |
| KAFKA_CLIENT_CERT_PATH | Path to kafka client certificate (SSL) file. | `./config/kafka_client.cer` |
| KAFKA_CLIENT_CERT | Kafka client key (SSL). This gets precedence over the file path. | |
| KAFKA_CLIENT_KEY_PATH | Path to kafka client key (SSL) file. | `./config/kafka_client.key` |
| KAFKA_SSL_PASSPHRASE | Passphrase (for SSL) | `secret` |
| ROCKETCHAT_PROTOCOL | Rocketchat Protocol | `http` |
| ROCKETCHAT_HOST | Rocketchat Host | `127.0.0.1`
| ROCKETCHAT_PORT | Rocketchat Port | `3000` |
| ROCKETCHAT_USERNAME | Rocketchat Username | `rocket` |
| ROCKETCHAT_PASSWORD | Rocketchat Password | `rocket` |
| VANILLA_API_URL | Vanilla v2 API URL | `http://localhost/api/v2` |
| VANILLA_ADMIN_ACCESS_TOKEN | Vanilla admin personal access token | |
| M2M_PROVIDER | Must be `keycloak` | Required |
| KEYCLOAK_ISSUER | HTTPS M2M realm issuer | Required |
| KEYCLOAK_AUDIENCE | Intended API audience | Required |
| KEYCLOAK_TOKEN_URL | Managed HTTPS token endpoint | Required |
| KEYCLOAK_CLIENT_ID | Dedicated processor client | Required |
| KEYCLOAK_CLIENT_SECRET | Dedicated processor secret | Required |
| KEYCLOAK_SCOPE | Space-separated granted scopes | Optional |
| TOPCODER_API_URL | Topcoder API URL | `https://api.topcoder-dev.com` |
| TOPCODER_ROOT_URL | Topcoder Root URL | `https://topcoder-dev.com` |

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

## Linting

```bash
# lint without fixing
$ npm run lint

# lint and auto-fix
$ npm run lint:fix
```

Commit to force redeploy

## Keycloak migration branch

Run `nvm use` (Node 22.23.2) before installing. `keycloak_m2M` pins shared core
4.0.0-keycloak.0 at `c262f4aca971904f308085bdeaaed35cdf3cfa7d`. A persistent
provider validates issuer/audience/client/scope and caches verified RS256 service
tokens. There is no Auth0 issuance or proxy fallback. Configure dedicated
Keycloak settings before rollout. Required API grants include `read:challenges`,
`update:challenges`, `read:resources`, `read:project`, and the Identity API user/role
read grants. Rocket.Chat and Vanilla credentials remain independently configured.

`npm run lint`, `npm run build` (JavaScript syntax checks), and `npm test`
exercise the branch without publishing Kafka messages or changing forums.
CI deploy filters exclude `keycloak_m2M`; existing DEV services remain unchanged.
