const config = require('config')
const _ = require('lodash')
const m2mAuth = require('tc-core-library-js').auth.m2m
const request = require('superagent')

// Token provider chosen by USE_KEYCLOAK in config.TOPCODER: Keycloak (KEYCLOAK_*)
// when true, otherwise Auth0 (AUTH0_URL, AUTH0_AUDIENCE, AUTH0_PROXY_SERVER_URL).
const m2m = m2mAuth(config.TOPCODER)

/** Obtain a cached or new M2M token for Topcoder API calls from the active provider.
 * Takes no arguments. With USE_KEYCLOAK=true the token is a verified Keycloak token
 * for KEYCLOAK_CLIENT_ID/KEYCLOAK_CLIENT_SECRET; otherwise it is an Auth0 token for
 * AUTH0_CLIENT_ID/AUTH0_CLIENT_SECRET. Used by reqToAPI for every Topcoder request.
 * @returns {Promise<string>} Bearer token from shared core.
 * @throws {Error} Sanitized shared-core issuance/validation errors, including
 * missing credentials for the active provider.
 */
async function getM2MToken () {
  return m2m.getMachineToken()
}

/**
 * Send a Topcoder API request with the active provider's M2M token (see getM2MToken).
 * @param {String} reqType Type of the request POST / PATCH / PUT / GET / DELETE / HEAD
 * @param {String} path Complete path of the API URL
 * @param {Object} reqBody Body of the request
 * @returns {Promise<Object>} API response.
 * @throws {Error} Invalid method, sanitized auth error, or downstream transport error.
 */
async function reqToAPI (reqType, path, reqBody) {
  const token = await getM2MToken()
  const authHeader = { Authorization: `Bearer ${token}` }

  const validReqTypes = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE']
  const hasBody = ['POST', 'PUT', 'PATCH']

  if (_.indexOf(validReqTypes, _.upperCase(reqType)) === -1) {
    throw new Error('Invalid request type')
  }
  const reqMethod = request[_.lowerCase(reqType)]

  if (_.indexOf(hasBody, _.upperCase(reqType)) === -1) {
    return reqMethod(path)
      .set(authHeader)
      .set('Content-Type', 'application/json')
  } else {
    return reqMethod(path)
      .set(authHeader)
      .set('Content-Type', 'application/json')
      .send(reqBody)
  }
}

/**
 * Gets the user's handle given the user's ID
 * @param {String} userId User's ID (6-digit numeric)
 */
async function getUserDetailsById (userId) {
  const path = `${config.TOPCODER.API_URL}/v6/users?filter=id%3D${userId}`
  return reqToAPI('GET', path)
}

/**
 * Gets the user by Topcoder's handle
 * @param {String} handle
 */
async function getUserDetailsByHandle (handle) {
  const path = `${config.TOPCODER.API_URL}/v6/users?filter=handle%3D${handle}`
  return reqToAPI('GET', path)
}

/**
 * Gets the challenge
 * @param {String} challengeId Challenge's ID (uuid)
 */
async function getChallenge (challengeId) {
  const path = `${config.TOPCODER.API_URL}/v6/challenges/${challengeId}`
  return reqToAPI('GET', path)
}

/**
 * Update the challenge
 * @param {String} challengeId Challenge's ID (uuid)
 */
async function updateChallenge (challengeId, data) {
  const path = `${config.TOPCODER.API_URL}/v6/challenges/${challengeId}`
  return reqToAPI('PATCH', path, data)
}

/**
 * Gets the roles for an user
 * @param {int} userId User's ID
 */
async function getRoles (userId) {
  const path = `${config.TOPCODER.API_URL}/v6/roles?filter=subjectID%3D${userId}`
  return reqToAPI('GET', path)
}

/**
 * Gets the project
 * @param {int} projectId Project's Id (int)
 */
async function getProject (projectId) {
  const path = `${config.TOPCODER.API_URL}/v6/projects/${projectId}`
  return reqToAPI('GET', path)
}

/**
 * Gets the list of Resource Roles by challengeId
 */
async function getAllChallengeRoles (challengeId) {
  const path = `${config.TOPCODER.API_URL}/v6/resources?challengeId=${challengeId}`
  return reqToAPI('GET', path)
}

/**
 * Gets the list of All Resource Roles
 */
async function getAllRoles () {
  const path = `${config.TOPCODER.API_URL}/v6/resource-roles`
  return reqToAPI('GET', path)
}

module.exports = {
  getUserDetailsById,
  getUserDetailsByHandle,
  getChallenge,
  updateChallenge,
  getRoles,
  getAllRoles,
  getAllChallengeRoles,
  getProject
}
