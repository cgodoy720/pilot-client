/**
 * Format a date as MM/DD/YYYY
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string
 */
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
export const formatDate = date => {
  if (stryMutAct_9fa48("29583")) {
    {}
  } else {
    stryCov_9fa48("29583");
    if (stryMutAct_9fa48("29586") ? false : stryMutAct_9fa48("29585") ? true : stryMutAct_9fa48("29584") ? date : (stryCov_9fa48("29584", "29585", "29586"), !date)) return stryMutAct_9fa48("29587") ? "" : (stryCov_9fa48("29587"), 'N/A');
    const d = date instanceof Date ? date : new Date(date);

    // Check if date is valid
    if (stryMutAct_9fa48("29589") ? false : stryMutAct_9fa48("29588") ? true : (stryCov_9fa48("29588", "29589"), isNaN(d.getTime()))) return stryMutAct_9fa48("29590") ? "" : (stryCov_9fa48("29590"), 'Invalid date');
    const month = (stryMutAct_9fa48("29591") ? d.getMonth() - 1 : (stryCov_9fa48("29591"), d.getMonth() + 1)).toString().padStart(2, stryMutAct_9fa48("29592") ? "" : (stryCov_9fa48("29592"), '0'));
    const day = d.getDate().toString().padStart(2, stryMutAct_9fa48("29593") ? "" : (stryCov_9fa48("29593"), '0'));
    const year = d.getFullYear();
    return stryMutAct_9fa48("29594") ? `` : (stryCov_9fa48("29594"), `${month}/${day}/${year}`);
  }
};

/**
 * Format a date with time as MM/DD/YYYY, HH:MM AM/PM
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = date => {
  if (stryMutAct_9fa48("29595")) {
    {}
  } else {
    stryCov_9fa48("29595");
    if (stryMutAct_9fa48("29598") ? false : stryMutAct_9fa48("29597") ? true : stryMutAct_9fa48("29596") ? date : (stryCov_9fa48("29596", "29597", "29598"), !date)) return stryMutAct_9fa48("29599") ? "" : (stryCov_9fa48("29599"), 'N/A');
    const d = date instanceof Date ? date : new Date(date);

    // Check if date is valid
    if (stryMutAct_9fa48("29601") ? false : stryMutAct_9fa48("29600") ? true : (stryCov_9fa48("29600", "29601"), isNaN(d.getTime()))) return stryMutAct_9fa48("29602") ? "" : (stryCov_9fa48("29602"), 'Invalid date');
    const month = (stryMutAct_9fa48("29603") ? d.getMonth() - 1 : (stryCov_9fa48("29603"), d.getMonth() + 1)).toString().padStart(2, stryMutAct_9fa48("29604") ? "" : (stryCov_9fa48("29604"), '0'));
    const day = d.getDate().toString().padStart(2, stryMutAct_9fa48("29605") ? "" : (stryCov_9fa48("29605"), '0'));
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, stryMutAct_9fa48("29606") ? "" : (stryCov_9fa48("29606"), '0'));
    const ampm = (stryMutAct_9fa48("29610") ? hours < 12 : stryMutAct_9fa48("29609") ? hours > 12 : stryMutAct_9fa48("29608") ? false : stryMutAct_9fa48("29607") ? true : (stryCov_9fa48("29607", "29608", "29609", "29610"), hours >= 12)) ? stryMutAct_9fa48("29611") ? "" : (stryCov_9fa48("29611"), 'PM') : stryMutAct_9fa48("29612") ? "" : (stryCov_9fa48("29612"), 'AM');
    hours = stryMutAct_9fa48("29613") ? hours * 12 : (stryCov_9fa48("29613"), hours % 12);
    hours = hours ? hours : 12; // Convert 0 to 12

    return stryMutAct_9fa48("29614") ? `` : (stryCov_9fa48("29614"), `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`);
  }
};

/**
 * Format submission timestamp consistently across environments
 * Backend stores Eastern time, so convert properly to display
 * @param {Date|string} timestamp - Database timestamp
 * @returns {string} Formatted timestamp string
 */
export const formatSubmissionTimestamp = timestamp => {
  if (stryMutAct_9fa48("29615")) {
    {}
  } else {
    stryCov_9fa48("29615");
    if (stryMutAct_9fa48("29618") ? false : stryMutAct_9fa48("29617") ? true : stryMutAct_9fa48("29616") ? timestamp : (stryCov_9fa48("29616", "29617", "29618"), !timestamp)) return stryMutAct_9fa48("29619") ? "" : (stryCov_9fa48("29619"), 'N/A');
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    // Check if date is valid
    if (stryMutAct_9fa48("29621") ? false : stryMutAct_9fa48("29620") ? true : (stryCov_9fa48("29620", "29621"), isNaN(date.getTime()))) return stryMutAct_9fa48("29622") ? "" : (stryCov_9fa48("29622"), 'Invalid date');

    // Backend now stores Eastern time correctly as timestamp
    // Just format it normally
    return date.toLocaleString(stryMutAct_9fa48("29623") ? "" : (stryCov_9fa48("29623"), "en-US"), stryMutAct_9fa48("29624") ? {} : (stryCov_9fa48("29624"), {
      timeZone: stryMutAct_9fa48("29625") ? "" : (stryCov_9fa48("29625"), 'America/New_York'),
      year: stryMutAct_9fa48("29626") ? "" : (stryCov_9fa48("29626"), 'numeric'),
      month: stryMutAct_9fa48("29627") ? "" : (stryCov_9fa48("29627"), 'numeric'),
      day: stryMutAct_9fa48("29628") ? "" : (stryCov_9fa48("29628"), 'numeric'),
      hour: stryMutAct_9fa48("29629") ? "" : (stryCov_9fa48("29629"), 'numeric'),
      minute: stryMutAct_9fa48("29630") ? "" : (stryCov_9fa48("29630"), '2-digit'),
      hour12: stryMutAct_9fa48("29631") ? false : (stryCov_9fa48("29631"), true)
    }));
  }
};

/**
 * Treat database time as Eastern Time (not UTC conversion)
 * @param {Date|string} dbDate - Database date that should be treated as Eastern time
 * @returns {Date} Date object with database time treated as Eastern
 */
export const getEasternTimeParts = dbDate => {
  if (stryMutAct_9fa48("29632")) {
    {}
  } else {
    stryCov_9fa48("29632");
    if (stryMutAct_9fa48("29635") ? false : stryMutAct_9fa48("29634") ? true : stryMutAct_9fa48("29633") ? dbDate : (stryCov_9fa48("29633", "29634", "29635"), !dbDate)) return null;
    const date = dbDate instanceof Date ? dbDate : new Date(dbDate);

    // Check if date is valid
    if (stryMutAct_9fa48("29637") ? false : stryMutAct_9fa48("29636") ? true : (stryCov_9fa48("29636", "29637"), isNaN(date.getTime()))) return null;

    // Treat the database time as if it's already in Eastern Time
    // Extract the date/time components directly without timezone conversion
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    return new Date(year, month, day, hour, minute);
  }
};

/**
 * Format database time as Eastern Time (treat DB time as Eastern, not UTC)
 * @param {Date|string} dbDate - Database date that should be treated as Eastern time
 * @param {string} formatType - 'time' for time only, 'date' for date only
 * @returns {string} Formatted time string treating DB time as Eastern
 */
export const formatInEasternTime = (dbDate, formatType = stryMutAct_9fa48("29638") ? "" : (stryCov_9fa48("29638"), 'time')) => {
  if (stryMutAct_9fa48("29639")) {
    {}
  } else {
    stryCov_9fa48("29639");
    if (stryMutAct_9fa48("29642") ? false : stryMutAct_9fa48("29641") ? true : stryMutAct_9fa48("29640") ? dbDate : (stryCov_9fa48("29640", "29641", "29642"), !dbDate)) return stryMutAct_9fa48("29643") ? "" : (stryCov_9fa48("29643"), 'N/A');
    const date = dbDate instanceof Date ? dbDate : new Date(dbDate);

    // Check if date is valid
    if (stryMutAct_9fa48("29645") ? false : stryMutAct_9fa48("29644") ? true : (stryCov_9fa48("29644", "29645"), isNaN(date.getTime()))) return stryMutAct_9fa48("29646") ? "" : (stryCov_9fa48("29646"), 'Invalid date');

    // Extract UTC parts but treat them as Eastern Time
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();

    // Create a new date with these parts as local time (Eastern)
    const easternDate = new Date(year, month, day, hour, minute);
    if (stryMutAct_9fa48("29649") ? formatType !== 'time' : stryMutAct_9fa48("29648") ? false : stryMutAct_9fa48("29647") ? true : (stryCov_9fa48("29647", "29648", "29649"), formatType === (stryMutAct_9fa48("29650") ? "" : (stryCov_9fa48("29650"), 'time')))) {
      if (stryMutAct_9fa48("29651")) {
        {}
      } else {
        stryCov_9fa48("29651");
        return easternDate.toLocaleTimeString(stryMutAct_9fa48("29652") ? "" : (stryCov_9fa48("29652"), "en-US"), stryMutAct_9fa48("29653") ? {} : (stryCov_9fa48("29653"), {
          hour: stryMutAct_9fa48("29654") ? "" : (stryCov_9fa48("29654"), 'numeric'),
          minute: stryMutAct_9fa48("29655") ? "" : (stryCov_9fa48("29655"), '2-digit'),
          hour12: stryMutAct_9fa48("29656") ? false : (stryCov_9fa48("29656"), true)
        }));
      }
    } else if (stryMutAct_9fa48("29659") ? formatType !== 'date' : stryMutAct_9fa48("29658") ? false : stryMutAct_9fa48("29657") ? true : (stryCov_9fa48("29657", "29658", "29659"), formatType === (stryMutAct_9fa48("29660") ? "" : (stryCov_9fa48("29660"), 'date')))) {
      if (stryMutAct_9fa48("29661")) {
        {}
      } else {
        stryCov_9fa48("29661");
        return easternDate.toLocaleDateString(stryMutAct_9fa48("29662") ? "" : (stryCov_9fa48("29662"), "en-US"), stryMutAct_9fa48("29663") ? {} : (stryCov_9fa48("29663"), {
          year: stryMutAct_9fa48("29664") ? "" : (stryCov_9fa48("29664"), 'numeric'),
          month: stryMutAct_9fa48("29665") ? "" : (stryCov_9fa48("29665"), 'long'),
          day: stryMutAct_9fa48("29666") ? "" : (stryCov_9fa48("29666"), 'numeric')
        }));
      }
    } else {
      if (stryMutAct_9fa48("29667")) {
        {}
      } else {
        stryCov_9fa48("29667");
        return easternDate.toLocaleString(stryMutAct_9fa48("29668") ? "" : (stryCov_9fa48("29668"), "en-US"), stryMutAct_9fa48("29669") ? {} : (stryCov_9fa48("29669"), {
          year: stryMutAct_9fa48("29670") ? "" : (stryCov_9fa48("29670"), 'numeric'),
          month: stryMutAct_9fa48("29671") ? "" : (stryCov_9fa48("29671"), 'long'),
          day: stryMutAct_9fa48("29672") ? "" : (stryCov_9fa48("29672"), 'numeric'),
          hour: stryMutAct_9fa48("29673") ? "" : (stryCov_9fa48("29673"), 'numeric'),
          minute: stryMutAct_9fa48("29674") ? "" : (stryCov_9fa48("29674"), '2-digit'),
          hour12: stryMutAct_9fa48("29675") ? false : (stryCov_9fa48("29675"), true)
        }));
      }
    }
  }
};