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
  if (stryMutAct_9fa48("29889")) {
    {}
  } else {
    stryCov_9fa48("29889");
    if (stryMutAct_9fa48("29892") ? typeof crypto !== 'undefined' || crypto.randomUUID : stryMutAct_9fa48("29891") ? false : stryMutAct_9fa48("29890") ? true : (stryCov_9fa48("29890", "29891", "29892"), (stryMutAct_9fa48("29894") ? typeof crypto === 'undefined' : stryMutAct_9fa48("29893") ? true : (stryCov_9fa48("29893", "29894"), typeof crypto !== (stryMutAct_9fa48("29895") ? "" : (stryCov_9fa48("29895"), 'undefined')))) && crypto.randomUUID)) {
      if (stryMutAct_9fa48("29896")) {
        {}
      } else {
        stryCov_9fa48("29896");
        return crypto.randomUUID();
      }
    }
    // Fallback UUID generation for older browsers
    return (stryMutAct_9fa48("29897") ? "" : (stryCov_9fa48("29897"), 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx')).replace(stryMutAct_9fa48("29898") ? /[^xy]/g : (stryCov_9fa48("29898"), /[xy]/g), function (c) {
      if (stryMutAct_9fa48("29899")) {
        {}
      } else {
        stryCov_9fa48("29899");
        const r = (stryMutAct_9fa48("29900") ? Math.random() / 16 : (stryCov_9fa48("29900"), Math.random() * 16)) | 0;
        const v = (stryMutAct_9fa48("29903") ? c !== 'x' : stryMutAct_9fa48("29902") ? false : stryMutAct_9fa48("29901") ? true : (stryCov_9fa48("29901", "29902", "29903"), c === (stryMutAct_9fa48("29904") ? "" : (stryCov_9fa48("29904"), 'x')))) ? r : r & 0x3 | 0x8;
        return v.toString(16);
      }
    });
  }
};

// Validate UUID format
export const isValidUUID = uuid => {
  if (stryMutAct_9fa48("29905")) {
    {}
  } else {
    stryCov_9fa48("29905");
    if (stryMutAct_9fa48("29908") ? !uuid && typeof uuid !== 'string' : stryMutAct_9fa48("29907") ? false : stryMutAct_9fa48("29906") ? true : (stryCov_9fa48("29906", "29907", "29908"), (stryMutAct_9fa48("29909") ? uuid : (stryCov_9fa48("29909"), !uuid)) || (stryMutAct_9fa48("29911") ? typeof uuid === 'string' : stryMutAct_9fa48("29910") ? false : (stryCov_9fa48("29910", "29911"), typeof uuid !== (stryMutAct_9fa48("29912") ? "" : (stryCov_9fa48("29912"), 'string')))))) return stryMutAct_9fa48("29913") ? true : (stryCov_9fa48("29913"), false);
    const uuidRegex = stryMutAct_9fa48("29926") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[^0-9a-f]{12}$/i : stryMutAct_9fa48("29925") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]$/i : stryMutAct_9fa48("29924") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][^0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("29923") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]-[0-9a-f]{12}$/i : stryMutAct_9fa48("29922") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[^89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("29921") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[^0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("29920") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("29919") ? /^[0-9a-f]{8}-[^0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("29918") ? /^[0-9a-f]{8}-[0-9a-f]-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("29917") ? /^[^0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("29916") ? /^[0-9a-f]-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("29915") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i : stryMutAct_9fa48("29914") ? /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : (stryCov_9fa48("29914", "29915", "29916", "29917", "29918", "29919", "29920", "29921", "29922", "29923", "29924", "29925", "29926"), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    return uuidRegex.test(uuid);
  }
};

// Get or create user ID
export const getUserId = () => {
  if (stryMutAct_9fa48("29927")) {
    {}
  } else {
    stryCov_9fa48("29927");
    let userId = localStorage.getItem(stryMutAct_9fa48("29928") ? "" : (stryCov_9fa48("29928"), 'userId'));

    // Check if existing userId is valid
    if (stryMutAct_9fa48("29931") ? userId || isValidUUID(userId) : stryMutAct_9fa48("29930") ? false : stryMutAct_9fa48("29929") ? true : (stryCov_9fa48("29929", "29930", "29931"), userId && isValidUUID(userId))) {
      if (stryMutAct_9fa48("29932")) {
        {}
      } else {
        stryCov_9fa48("29932");
        return userId;
      }
    }

    // Generate new UUID if none exists or if existing one is invalid
    userId = generateUUID();
    localStorage.setItem(stryMutAct_9fa48("29933") ? "" : (stryCov_9fa48("29933"), 'userId'), userId);
    console.log(stryMutAct_9fa48("29934") ? "" : (stryCov_9fa48("29934"), 'Generated new user ID:'), userId);
    return userId;
  }
};

// Clear invalid user ID and generate new one
export const resetUserId = () => {
  if (stryMutAct_9fa48("29935")) {
    {}
  } else {
    stryCov_9fa48("29935");
    localStorage.removeItem(stryMutAct_9fa48("29936") ? "" : (stryCov_9fa48("29936"), 'userId'));
    return getUserId();
  }
};

// Clear all cached data and reset user ID
export const clearUserData = () => {
  if (stryMutAct_9fa48("29937")) {
    {}
  } else {
    stryCov_9fa48("29937");
    localStorage.removeItem(stryMutAct_9fa48("29938") ? "" : (stryCov_9fa48("29938"), 'userId'));
    localStorage.removeItem(stryMutAct_9fa48("29939") ? "" : (stryCov_9fa48("29939"), 'infoSessionStatus'));
    localStorage.removeItem(stryMutAct_9fa48("29940") ? "" : (stryCov_9fa48("29940"), 'infoSessionDetails'));
    localStorage.removeItem(stryMutAct_9fa48("29941") ? "" : (stryCov_9fa48("29941"), 'workshopStatus'));
    localStorage.removeItem(stryMutAct_9fa48("29942") ? "" : (stryCov_9fa48("29942"), 'workshopDetails'));
    console.log(stryMutAct_9fa48("29943") ? "" : (stryCov_9fa48("29943"), 'Cleared all user data from localStorage'));
    return getUserId();
  }
};