// @ts-nocheck
// API utility functions

// Base API URL from environment variable
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
const API_URL = import.meta.env.VITE_API_URL;

// Helper function to get auth headers
const getAuthHeaders = token => {
  if (stryMutAct_9fa48("29346")) {
    {}
  } else {
    stryCov_9fa48("29346");
    return stryMutAct_9fa48("29347") ? {} : (stryCov_9fa48("29347"), {
      'Content-Type': stryMutAct_9fa48("29348") ? "" : (stryCov_9fa48("29348"), 'application/json'),
      'Authorization': stryMutAct_9fa48("29349") ? `` : (stryCov_9fa48("29349"), `Bearer ${token}`)
    });
  }
};

// Generic fetch function with authentication
export const fetchWithAuth = async (endpoint, options = {}, token) => {
  if (stryMutAct_9fa48("29350")) {
    {}
  } else {
    stryCov_9fa48("29350");
    try {
      if (stryMutAct_9fa48("29351")) {
        {}
      } else {
        stryCov_9fa48("29351");
        const url = stryMutAct_9fa48("29352") ? `` : (stryCov_9fa48("29352"), `${API_URL}${endpoint}`);
        const headers = token ? getAuthHeaders(token) : stryMutAct_9fa48("29353") ? {} : (stryCov_9fa48("29353"), {
          'Content-Type': stryMutAct_9fa48("29354") ? "" : (stryCov_9fa48("29354"), 'application/json')
        });
        const response = await fetch(url, stryMutAct_9fa48("29355") ? {} : (stryCov_9fa48("29355"), {
          ...options,
          headers: stryMutAct_9fa48("29356") ? {} : (stryCov_9fa48("29356"), {
            ...headers,
            ...options.headers
          })
        }));
        if (stryMutAct_9fa48("29359") ? false : stryMutAct_9fa48("29358") ? true : stryMutAct_9fa48("29357") ? response.ok : (stryCov_9fa48("29357", "29358", "29359"), !response.ok)) {
          if (stryMutAct_9fa48("29360")) {
            {}
          } else {
            stryCov_9fa48("29360");
            const errorData = await response.json().catch(stryMutAct_9fa48("29361") ? () => undefined : (stryCov_9fa48("29361"), () => ({})));
            throw new Error(stryMutAct_9fa48("29364") ? errorData.message && `API error: ${response.status}` : stryMutAct_9fa48("29363") ? false : stryMutAct_9fa48("29362") ? true : (stryCov_9fa48("29362", "29363", "29364"), errorData.message || (stryMutAct_9fa48("29365") ? `` : (stryCov_9fa48("29365"), `API error: ${response.status}`))));
          }
        }
        return await response.json();
      }
    } catch (error) {
      if (stryMutAct_9fa48("29366")) {
        {}
      } else {
        stryCov_9fa48("29366");
        console.error(stryMutAct_9fa48("29367") ? "" : (stryCov_9fa48("29367"), 'API request failed:'), error);
        throw error;
      }
    }
  }
};

// Chat API functions
export const sendMessageToGPT = async (message, threadId, token) => {
  if (stryMutAct_9fa48("29368")) {
    {}
  } else {
    stryCov_9fa48("29368");
    return fetchWithAuth(stryMutAct_9fa48("29369") ? "" : (stryCov_9fa48("29369"), '/api/chat/messages'), stryMutAct_9fa48("29370") ? {} : (stryCov_9fa48("29370"), {
      method: stryMutAct_9fa48("29371") ? "" : (stryCov_9fa48("29371"), 'POST'),
      body: JSON.stringify(stryMutAct_9fa48("29372") ? {} : (stryCov_9fa48("29372"), {
        content: message,
        threadId: threadId
      }))
    }), token);
  }
};
export const getThreads = async token => {
  if (stryMutAct_9fa48("29373")) {
    {}
  } else {
    stryCov_9fa48("29373");
    return fetchWithAuth(stryMutAct_9fa48("29374") ? "" : (stryCov_9fa48("29374"), '/api/chat/threads'), stryMutAct_9fa48("29375") ? {} : (stryCov_9fa48("29375"), {
      method: stryMutAct_9fa48("29376") ? "" : (stryCov_9fa48("29376"), 'GET')
    }), token);
  }
};
export const createThread = async (title, token) => {
  if (stryMutAct_9fa48("29377")) {
    {}
  } else {
    stryCov_9fa48("29377");
    return fetchWithAuth(stryMutAct_9fa48("29378") ? "" : (stryCov_9fa48("29378"), '/api/chat/threads'), stryMutAct_9fa48("29379") ? {} : (stryCov_9fa48("29379"), {
      method: stryMutAct_9fa48("29380") ? "" : (stryCov_9fa48("29380"), 'POST'),
      body: JSON.stringify(stryMutAct_9fa48("29381") ? {} : (stryCov_9fa48("29381"), {
        title: stryMutAct_9fa48("29384") ? title && 'New Conversation' : stryMutAct_9fa48("29383") ? false : stryMutAct_9fa48("29382") ? true : (stryCov_9fa48("29382", "29383", "29384"), title || (stryMutAct_9fa48("29385") ? "" : (stryCov_9fa48("29385"), 'New Conversation')))
      }))
    }), token);
  }
};
export const getThreadMessages = async (threadId, token) => {
  if (stryMutAct_9fa48("29386")) {
    {}
  } else {
    stryCov_9fa48("29386");
    return fetchWithAuth(stryMutAct_9fa48("29387") ? `` : (stryCov_9fa48("29387"), `/api/chat/messages/${threadId}`), stryMutAct_9fa48("29388") ? {} : (stryCov_9fa48("29388"), {
      method: stryMutAct_9fa48("29389") ? "" : (stryCov_9fa48("29389"), 'GET')
    }), token);
  }
};