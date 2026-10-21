const config = require('config')
const _ = require('lodash')
const m2mAuth = require('tc-core-library-js').auth.m2m
const request = require('superagent')

const m2m = m2mAuth(config.TOPCODER)

/** Obtain a cached or newly verified Keycloak token for Topcoder API calls.
 * Takes no arguments; reads explicit KEYCLOAK_* deployment configuration.
 * @returns {Promise<string>} Verified service token from shared core.
 * @throws {Error} Sanitized shared-core issuance/validation errors.
 */
async function getM2MToken () {
  return m2m.getMachineToken()
}

/**
 * Send a Topcoder API request with a shared-core verified service credential.
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
