const assert = require('node:assert/strict');
const { join } = require('node:path');
const { test, afterEach } = require('node:test');
const nock = require('nock');

const saved = { ...process.env };
const root = join(__dirname, '..');
const auth0Env = {
  AUTH0_URL: 'https://tenant.test/oauth/token', AUTH0_AUDIENCE: 'https://m2m.test/',
  AUTH0_PROXY_SERVER_URL: 'https://proxy.test/token', AUTH0_CLIENT_ID: 'auth0-forum',
  AUTH0_CLIENT_SECRET: 'auth0-secret',
};
const keycloakEnv = {
  KEYCLOAK_ISSUER: 'https://keycloak.test/realms/m2m', KEYCLOAK_AUDIENCE: 'https://api.test',
  KEYCLOAK_TOKEN_URL: 'https://keycloak.test/m2m/token', KEYCLOAK_CLIENT_ID: 'm2m-forum',
  KEYCLOAK_CLIENT_SECRET: 'keycloak-secret',
};

/**
 * Load config and the Topcoder API util afresh with both providers' settings plus `env`.
 * Takes the USE_KEYCLOAK override (omit the key to leave it unset); returns the util module.
 */
function load (env) {
  process.env = { ...saved, ...auth0Env, ...keycloakEnv, ...env };
  if (!('USE_KEYCLOAK' in env)) delete process.env.USE_KEYCLOAK;
  for (const file of Object.keys(require.cache)) {
    if (file.startsWith(join(root, 'node_modules', 'config') + '/') || file.startsWith(join(root, 'config') + '/') ||
        file === join(root, 'src', 'utils', 'topcoder-api.util.js')) delete require.cache[file];
  }
  return require('../src/utils/topcoder-api.util');
}

afterEach(() => {
  nock.cleanAll();
  nock.enableNetConnect();
  process.env = { ...saved };
});

for (const [name, env] of [['unset', {}], ['false', { USE_KEYCLOAK: 'false' }]]) {
  test(`USE_KEYCLOAK ${name} requests the token from Auth0 with the AUTH0_* settings`, async () => {
    const { getChallenge } = load(env);
    nock.disableNetConnect();
    const token = nock('https://proxy.test').post('/token', {
      grant_type: 'client_credentials', client_id: 'auth0-forum', client_secret: 'auth0-secret',
      auth0_url: auth0Env.AUTH0_URL, audience: auth0Env.AUTH0_AUDIENCE,
    }).reply(200, { access_token: `auth0-token-${name}` });
    const api = nock('https://api.topcoder-dev.com', { reqheaders: { authorization: `Bearer auth0-token-${name}` } })
      .get('/v6/challenges/fixture').reply(200, { id: 'fixture' });
    assert.equal((await getChallenge('fixture')).body.id, 'fixture');
    assert.equal(token.isDone(), true);
    assert.equal(api.isDone(), true);
  });
}

test('USE_KEYCLOAK=true requests the token from Keycloak with the KEYCLOAK_* settings', async () => {
  const { getChallenge } = load({ USE_KEYCLOAK: 'true' });
  nock.disableNetConnect();
  const token = nock('https://keycloak.test').post('/m2m/token', {
    grant_type: 'client_credentials', client_id: 'm2m-forum', client_secret: 'keycloak-secret',
    audience: keycloakEnv.KEYCLOAK_AUDIENCE,
  }).reply(503);
  await assert.rejects(getChallenge('fixture'), /^Error: Keycloak M2M token request failed$/);
  assert.equal(token.isDone(), true);
});

test('an invalid USE_KEYCLOAK value fails when the util loads', () => {
  assert.throws(() => load({ USE_KEYCLOAK: 'yes' }), /USE_KEYCLOAK must be true or false/);
});
