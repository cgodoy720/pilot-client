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
  if (stryMutAct_9fa48("1441")) {
    {}
  } else {
    stryCov_9fa48("1441");
    if (stryMutAct_9fa48("1444") ? typeof crypto !== 'undefined' || crypto.randomUUID : stryMutAct_9fa48("1443") ? false : stryMutAct_9fa48("1442") ? true : (stryCov_9fa48("1442", "1443", "1444"), (stryMutAct_9fa48("1446") ? typeof crypto === 'undefined' : stryMutAct_9fa48("1445") ? true : (stryCov_9fa48("1445", "1446"), typeof crypto !== (stryMutAct_9fa48("1447") ? "" : (stryCov_9fa48("1447"), 'undefined')))) && crypto.randomUUID)) {
      if (stryMutAct_9fa48("1448")) {
        {}
      } else {
        stryCov_9fa48("1448");
        return crypto.randomUUID();
      }
    }
    // Fallback UUID generation for older browsers
    return (stryMutAct_9fa48("1449") ? "" : (stryCov_9fa48("1449"), 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx')).replace(stryMutAct_9fa48("1450") ? /[^xy]/g : (stryCov_9fa48("1450"), /[xy]/g), function (c) {
      if (stryMutAct_9fa48("1451")) {
        {}
      } else {
        stryCov_9fa48("1451");
        const r = (stryMutAct_9fa48("1452") ? Math.random() / 16 : (stryCov_9fa48("1452"), Math.random() * 16)) | 0;
        const v = (stryMutAct_9fa48("1455") ? c !== 'x' : stryMutAct_9fa48("1454") ? false : stryMutAct_9fa48("1453") ? true : (stryCov_9fa48("1453", "1454", "1455"), c === (stryMutAct_9fa48("1456") ? "" : (stryCov_9fa48("1456"), 'x')))) ? r : r & 0x3 | 0x8;
        return v.toString(16);
      }
    });
  }
};

// Validate UUID format
export const isValidUUID = uuid => {
  if (stryMutAct_9fa48("1457")) {
    {}
  } else {
    stryCov_9fa48("1457");
    if (stryMutAct_9fa48("1460") ? !uuid && typeof uuid !== 'string' : stryMutAct_9fa48("1459") ? false : stryMutAct_9fa48("1458") ? true : (stryCov_9fa48("1458", "1459", "1460"), (stryMutAct_9fa48("1461") ? uuid : (stryCov_9fa48("1461"), !uuid)) || (stryMutAct_9fa48("1463") ? typeof uuid === 'string' : stryMutAct_9fa48("1462") ? false : (stryCov_9fa48("1462", "1463"), typeof uuid !== (stryMutAct_9fa48("1464") ? "" : (stryCov_9fa48("1464"), 'string')))))) return stryMutAct_9fa48("1465") ? true : (stryCov_9fa48("1465"), false);
    const uuidRegex = stryMutAct_9fa48("1478") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[^0-9a-f]{12}$/i : stryMutAct_9fa48("1477") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]$/i : stryMutAct_9fa48("1476") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][^0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("1475") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]-[0-9a-f]{12}$/i : stryMutAct_9fa48("1474") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[^89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("1473") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[^0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("1472") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("1471") ? /^[0-9a-f]{8}-[^0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("1470") ? /^[0-9a-f]{8}-[0-9a-f]-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("1469") ? /^[^0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("1468") ? /^[0-9a-f]-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : stryMutAct_9fa48("1467") ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i : stryMutAct_9fa48("1466") ? /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : (stryCov_9fa48("1466", "1467", "1468", "1469", "1470", "1471", "1472", "1473", "1474", "1475", "1476", "1477", "1478"), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    return uuidRegex.test(uuid);
  }
};

// Get or create user ID
export const getUserId = () => {
  if (stryMutAct_9fa48("1479")) {
    {}
  } else {
    stryCov_9fa48("1479");
    let userId = localStorage.getItem(stryMutAct_9fa48("1480") ? "" : (stryCov_9fa48("1480"), 'userId'));

    // Check if existing userId is valid
    if (stryMutAct_9fa48("1483") ? userId || isValidUUID(userId) : stryMutAct_9fa48("1482") ? false : stryMutAct_9fa48("1481") ? true : (stryCov_9fa48("1481", "1482", "1483"), userId && isValidUUID(userId))) {
      if (stryMutAct_9fa48("1484")) {
        {}
      } else {
        stryCov_9fa48("1484");
        return userId;
      }
    }

    // Generate new UUID if none exists or if existing one is invalid
    userId = generateUUID();
    localStorage.setItem(stryMutAct_9fa48("1485") ? "" : (stryCov_9fa48("1485"), 'userId'), userId);
    console.log(stryMutAct_9fa48("1486") ? "" : (stryCov_9fa48("1486"), 'Generated new user ID:'), userId);
    return userId;
  }
};

// Clear invalid user ID and generate new one
export const resetUserId = () => {
  if (stryMutAct_9fa48("1487")) {
    {}
  } else {
    stryCov_9fa48("1487");
    localStorage.removeItem(stryMutAct_9fa48("1488") ? "" : (stryCov_9fa48("1488"), 'userId'));
    return getUserId();
  }
};

// Clear all cached data and reset user ID
export const clearUserData = () => {
  if (stryMutAct_9fa48("1489")) {
    {}
  } else {
    stryCov_9fa48("1489");
    localStorage.removeItem(stryMutAct_9fa48("1490") ? "" : (stryCov_9fa48("1490"), 'userId'));
    localStorage.removeItem(stryMutAct_9fa48("1491") ? "" : (stryCov_9fa48("1491"), 'infoSessionStatus'));
    localStorage.removeItem(stryMutAct_9fa48("1492") ? "" : (stryCov_9fa48("1492"), 'infoSessionDetails'));
    localStorage.removeItem(stryMutAct_9fa48("1493") ? "" : (stryCov_9fa48("1493"), 'workshopStatus'));
    localStorage.removeItem(stryMutAct_9fa48("1494") ? "" : (stryCov_9fa48("1494"), 'workshopDetails'));
    console.log(stryMutAct_9fa48("1495") ? "" : (stryCov_9fa48("1495"), 'Cleared all user data from localStorage'));
    return getUserId();
  }
};