// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { fetchWithAuth } from './api';

/**
 * Fetch sentiment analysis data for the current user
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to sentiment analysis data
 */
export const fetchSentimentAnalysis = async token => {
  if (stryMutAct_9fa48("29335")) {
    {}
  } else {
    stryCov_9fa48("29335");
    return fetchWithAuth(stryMutAct_9fa48("29336") ? "" : (stryCov_9fa48("29336"), '/api/analytics/sentiment'), stryMutAct_9fa48("29337") ? {} : (stryCov_9fa48("29337"), {
      method: stryMutAct_9fa48("29338") ? "" : (stryCov_9fa48("29338"), 'GET')
    }), token);
  }
};

/**
 * Fetch user activity metrics
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to user activity data
 */
export const fetchUserActivity = async token => {
  if (stryMutAct_9fa48("29339")) {
    {}
  } else {
    stryCov_9fa48("29339");
    return fetchWithAuth(stryMutAct_9fa48("29340") ? "" : (stryCov_9fa48("29340"), '/api/analytics/activity'), stryMutAct_9fa48("29341") ? {} : (stryCov_9fa48("29341"), {
      method: stryMutAct_9fa48("29342") ? "" : (stryCov_9fa48("29342"), 'GET')
    }), token);
  }
};

/**
 * Fetch combined dashboard analytics data
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to dashboard analytics data
 */
export const fetchDashboardAnalytics = async token => {
  if (stryMutAct_9fa48("29343")) {
    {}
  } else {
    stryCov_9fa48("29343");
    return fetchWithAuth(stryMutAct_9fa48("29344") ? "" : (stryCov_9fa48("29344"), '/api/analytics/dashboard'), stryMutAct_9fa48("29345") ? {} : (stryCov_9fa48("29345"), {
      method: stryMutAct_9fa48("29346") ? "" : (stryCov_9fa48("29346"), 'GET')
    }), token);
  }
};