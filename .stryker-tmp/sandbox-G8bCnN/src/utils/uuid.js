// @ts-nocheck
// UUID utility functions for the admissions tool

// Generate a proper UUID v4
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
export const generateUUID = () => {
  if (stryMutAct_9fa48("29888")) {
    {}
  } else {
    stryCov_9fa48("29888");
    if (stryMutAct_9fa48("29891") ? typeof crypto !== 'undefined' || crypto.randomUUID : stryMutAct_9fa48("29890") ? false : stryMutAct_9fa48("29889") ? true : (stryCov_9fa48("29889", "29890", "29891"), (stryMutAct_9fa48("29893") ? typeof crypto === 'undefined' : stryMutAct_9fa48("29892") ? true : (stryCov_9fa48("29892", "29893"), typeof crypto !== (stryMutAct_9fa48("29894") ? "" : (stryCov_9fa48("29894"), 'undefined')))) && crypto.randomUUID)) {
      if (stryMutAct_9fa48("29895")) {
        {}
      } else {
        stryCov_9fa48("29895");
        return crypto.randomUUID();
      }
    }
    // Fallback UUID generation for older browsers
    return (stryMutAct_9fa48("29896") ? "" : (stryCov_9fa48("29896"), 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx')).replace(stryMutAct_9fa48("29897") ? /[^xy]/g : (stryCov_9fa48("29897"), /[xy]/g), function (c) {
      if (stryMutAct_9fa48("29898")) {
        {}
      } else {
        stryCov_9fa48("29898");
        const r = (stryMutAct_9fa48("29899") ? Math.random() / 16 : (stryCov_9fa48("29899"), Math.random() * 16)) | 0;
        const v = (stryMutAct_9fa48("29902") ? c !== 'x' : stryMutAct_9fa48("29901") ? false : stryMutAct_9fa48("29900") ? true : (stryCov_9fa48("29900", "29901", "29902"), c === (stryMutAct_9fa48("29903") ? "" : (stryCov_9fa48("29903"), 'x')))) ? r : r & 0x3 | 0x8;
        return v.toString(16);
      }
    });
  }
};

// Validate UUID format
export const isValidUUID = uuid => {
  if (stryMutAct_9fa48("29904")) {
    {}
  } else {
    stryCov_9fa48("29904");
    if (stryMutAct_9fa48("29907") ? !uuid && typeof uuid !== 'string' : stryMutAct_9fa48("29906") ? false : stryMutAct_9fa48("29905") ? true : (stryCov_9fa48("29905", "29906", "29907"), (stryMutAct_9fa48("29908") ? uuid : (stryCov_9fa48("29908"), !uuid)) || (stryMutAct_9fa48("29910") ? typeof uuid === 'string' : stryMutAct_9fa48("29909") ? false : (stryCov_9fa48("29909", "29910"), typeof uuid !== (stryMutAct_9fa48("29911") ? "" : (stryCov_9fa48("29911"), 'string')))))) return stryMutAct_9fa48("29912") ? true : (stryCov_9fa48("29912"), false);
    const uuidRegex = stryMutAct_9fa48("29925") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[^0-9a-f]{12}$/i : stryMutAct_9fa48("29924") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]$/i : stryMutAct_9fa48("29923") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][^0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("29922") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]-[0-9a-f]{12}$/i : stryMutAct_9fa48("29921") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[^89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("29920") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[^0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("29919") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("29918") ? /^[0-9a-f]{8}-[^0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("29917") ? /^[0-9a-f]{8}-[0-9a-f]-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("29916") ? /^[^0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("29915") ? /^[0-9a-f]-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("29914") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i : stryMutAct_9fa48("29913") ? /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : (stryCov_9fa48("29913", "29914", "29915", "29916", "29917", "29918", "29919", "29920", "29921", "29922", "29923", "29924", "29925"), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    return uuidRegex.test(uuid);
  }
};

// Get or create user ID
export const getUserId = () => {
  if (stryMutAct_9fa48("29926")) {
    {}
  } else {
    stryCov_9fa48("29926");
    let userId = localStorage.getItem(stryMutAct_9fa48("29927") ? "" : (stryCov_9fa48("29927"), 'userId'));

    // Check if existing userId is valid
    if (stryMutAct_9fa48("29930") ? userId || isValidUUID(userId) : stryMutAct_9fa48("29929") ? false : stryMutAct_9fa48("29928") ? true : (stryCov_9fa48("29928", "29929", "29930"), userId && isValidUUID(userId))) {
      if (stryMutAct_9fa48("29931")) {
        {}
      } else {
        stryCov_9fa48("29931");
        return userId;
      }
    }

    // Generate new UUID if none exists or if existing one is invalid
    userId = generateUUID();
    localStorage.setItem(stryMutAct_9fa48("29932") ? "" : (stryCov_9fa48("29932"), 'userId'), userId);
    console.log(stryMutAct_9fa48("29933") ? "" : (stryCov_9fa48("29933"), 'Generated new user ID:'), userId);
    return userId;
  }
};

// Clear invalid user ID and generate new one
export const resetUserId = () => {
  if (stryMutAct_9fa48("29934")) {
    {}
  } else {
    stryCov_9fa48("29934");
    localStorage.removeItem(stryMutAct_9fa48("29935") ? "" : (stryCov_9fa48("29935"), 'userId'));
    return getUserId();
  }
};

// Clear all cached data and reset user ID
export const clearUserData = () => {
  if (stryMutAct_9fa48("29936")) {
    {}
  } else {
    stryCov_9fa48("29936");
    localStorage.removeItem(stryMutAct_9fa48("29937") ? "" : (stryCov_9fa48("29937"), 'userId'));
    localStorage.removeItem(stryMutAct_9fa48("29938") ? "" : (stryCov_9fa48("29938"), 'infoSessionStatus'));
    localStorage.removeItem(stryMutAct_9fa48("29939") ? "" : (stryCov_9fa48("29939"), 'infoSessionDetails'));
    localStorage.removeItem(stryMutAct_9fa48("29940") ? "" : (stryCov_9fa48("29940"), 'workshopStatus'));
    localStorage.removeItem(stryMutAct_9fa48("29941") ? "" : (stryCov_9fa48("29941"), 'workshopDetails'));
    console.log(stryMutAct_9fa48("29942") ? "" : (stryCov_9fa48("29942"), 'Cleared all user data from localStorage'));
    return getUserId();
  }
};