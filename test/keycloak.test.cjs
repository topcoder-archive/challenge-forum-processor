const assert = require('node:assert/strict');
const { generateKeyPairSync, sign } = require('node:crypto');
const { test } = require('node:test');
const nock = require('nock');
const issuer = 'https://forum-worker.test/realms/m2m';
const clientId = 'forum-worker';
// USE_KEYCLOAK=true: the Auth0 settings below must be ignored (net connect is disabled).
Object.assign(process.env, {
  AUTH0_URL: 'https://tenant.test/oauth/token', AUTH0_PROXY_SERVER_URL: 'https://proxy.test/token',
  AUTH0_AUDIENCE: 'https://m2m.test/', AUTH0_CLIENT_ID: 'auth0-forum', AUTH0_CLIENT_SECRET: 'auth0-secret',
  USE_KEYCLOAK: 'true', KEYCLOAK_ISSUER: issuer, KEYCLOAK_AUDIENCE: 'https://api.test',
  KEYCLOAK_TOKEN_URL: 'https://forum-worker.test/m2m/token', KEYCLOAK_CLIENT_ID: clientId,
  KEYCLOAK_CLIENT_SECRET: 'synthetic-secret', KEYCLOAK_SCOPE: 'read:challenges',
});
const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const { getChallenge } = require('../src/utils/topcoder-api.util');
/** Sign an isolated service fixture; optional changes exercise rejected token contracts. */
function token(changes = {}) {
  const now = Math.floor(Date.now() / 1000);
  const h = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'skills' })).toString('base64url');
  const p = Buffer.from(JSON.stringify({ iss: issuer, aud: 'https://api.test', sub: 'service-skills',
    azp: clientId, gty: 'client-credentials', scope: 'read:challenges', iat: now, exp: now + 900, ...changes })).toString('base64url');
  const input = `${h}.${p}`;
  return `${input}.${sign('RSA-SHA256', Buffer.from(input), privateKey).toString('base64url')}`;
}
test('Challenge transport rejects invalid tokens and caches verified service credentials', async () => {
  nock.disableNetConnect();
  nock(issuer).persist().get('/protocol/openid-connect/certs').reply(200, {
    keys: [{ ...publicKey.export({ format: 'jwk' }), kid: 'skills', alg: 'RS256', use: 'sig' }],
  });
  try {
    for (const changes of [{ aud: 'wrong' }, { azp: 'other-client' }, { scope: 'update:challenges' }, { roles: ['administrator'] }]) {
      const mock = nock('https://forum-worker.test').post('/m2m/token').reply(200, { access_token: token(changes), expires_in: 900 });
      await assert.rejects(getChallenge('fixture'), /^Error: Keycloak M2M token request failed$/);
      assert.equal(mock.isDone(), true);
    }
    const jwt = token();
    const mock = nock('https://forum-worker.test').post('/m2m/token', body => body.scope === 'read:challenges').reply(200, { access_token: jwt, expires_in: 900 });
    const api = nock('https://api.topcoder-dev.com', { reqheaders: { authorization: `Bearer ${jwt}` } }).get('/v6/challenges/fixture').twice().reply(200, { id: 'fixture' });
    assert.equal((await getChallenge('fixture')).body.id, 'fixture');
    assert.equal((await getChallenge('fixture')).body.id, 'fixture');
    assert.equal(api.isDone(), true);
    assert.equal(mock.isDone(), true);
  } finally { nock.cleanAll(); nock.enableNetConnect(); }
});
