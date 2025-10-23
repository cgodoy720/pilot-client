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
 * Fetch all user stats including tasks, submissions, and feedback
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to user stats object
 */
export const fetchUserStats = async token => {
  if (stryMutAct_9fa48("29786")) {
    {}
  } else {
    stryCov_9fa48("29786");
    return fetchWithAuth(stryMutAct_9fa48("29787") ? "" : (stryCov_9fa48("29787"), '/api/users/stats'), stryMutAct_9fa48("29788") ? {} : (stryCov_9fa48("29788"), {
      method: stryMutAct_9fa48("29789") ? "" : (stryCov_9fa48("29789"), 'GET')
    }), token);
  }
};

/**
 * Fetch just the user's task data
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to tasks array
 */
export const fetchUserTasks = async token => {
  if (stryMutAct_9fa48("29790")) {
    {}
  } else {
    stryCov_9fa48("29790");
    return fetchWithAuth(stryMutAct_9fa48("29791") ? "" : (stryCov_9fa48("29791"), '/api/users/tasks'), stryMutAct_9fa48("29792") ? {} : (stryCov_9fa48("29792"), {
      method: stryMutAct_9fa48("29793") ? "" : (stryCov_9fa48("29793"), 'GET')
    }), token);
  }
};

/**
 * Fetch just the user's submissions data
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to submissions array
 */
export const fetchUserSubmissions = async token => {
  if (stryMutAct_9fa48("29794")) {
    {}
  } else {
    stryCov_9fa48("29794");
    return fetchWithAuth(stryMutAct_9fa48("29795") ? "" : (stryCov_9fa48("29795"), '/api/users/submissions'), stryMutAct_9fa48("29796") ? {} : (stryCov_9fa48("29796"), {
      method: stryMutAct_9fa48("29797") ? "" : (stryCov_9fa48("29797"), 'GET')
    }), token);
  }
};

/**
 * Fetch just the user's feedback data
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to feedback array
 */
export const fetchUserFeedback = async token => {
  if (stryMutAct_9fa48("29798")) {
    {}
  } else {
    stryCov_9fa48("29798");
    return fetchWithAuth(stryMutAct_9fa48("29799") ? "" : (stryCov_9fa48("29799"), '/api/users/feedback'), stryMutAct_9fa48("29800") ? {} : (stryCov_9fa48("29800"), {
      method: stryMutAct_9fa48("29801") ? "" : (stryCov_9fa48("29801"), 'GET')
    }), token);
  }
};

/**
 * Fetch detailed info for a specific task
 * @param {number} taskId - ID of the task
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to task detail object
 */
export const fetchTaskDetails = async (taskId, token) => {
  if (stryMutAct_9fa48("29802")) {
    {}
  } else {
    stryCov_9fa48("29802");
    return fetchWithAuth(stryMutAct_9fa48("29803") ? `` : (stryCov_9fa48("29803"), `/api/tasks/${taskId}`), stryMutAct_9fa48("29804") ? {} : (stryCov_9fa48("29804"), {
      method: stryMutAct_9fa48("29805") ? "" : (stryCov_9fa48("29805"), 'GET')
    }), token);
  }
};

/**
 * Fetch detailed info for a specific submission
 * @param {number} submissionId - ID of the submission
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to submission detail object
 */
export const fetchSubmissionDetails = async (submissionId, token) => {
  if (stryMutAct_9fa48("29806")) {
    {}
  } else {
    stryCov_9fa48("29806");
    return fetchWithAuth(stryMutAct_9fa48("29807") ? `` : (stryCov_9fa48("29807"), `/api/submissions/${submissionId}`), stryMutAct_9fa48("29808") ? {} : (stryCov_9fa48("29808"), {
      method: stryMutAct_9fa48("29809") ? "" : (stryCov_9fa48("29809"), 'GET')
    }), token);
  }
};

/**
 * Fetch all resources linked to tasks
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to resources array
 */
export const fetchUserResources = async token => {
  if (stryMutAct_9fa48("29810")) {
    {}
  } else {
    stryCov_9fa48("29810");
    return fetchWithAuth(stryMutAct_9fa48("29811") ? "" : (stryCov_9fa48("29811"), '/api/users/resources'), stryMutAct_9fa48("29812") ? {} : (stryCov_9fa48("29812"), {
      method: stryMutAct_9fa48("29813") ? "" : (stryCov_9fa48("29813"), 'GET')
    }), token);
  }
};

/*
 * COMMENTED OUT: These functions were for BigQuery endpoints that are no longer used
 * The frontend now uses external APIs instead
 */

/*
export const fetchFeedbackSentiment = async (token) => {
  try {
    console.log('Making request to /api/users/feedback-sentiment');
    const response = await fetchWithAuth('/api/users/feedback-sentiment', { method: 'GET' }, token);
    console.log('Response received:', response);
    
    // The response is already parsed JSON data, so we can return it directly
    return response;
  } catch (error) {
    console.error('Error in fetchFeedbackSentiment:', error);
    throw error;
  }
};

export const fetchTaskAnalysisResults = async (token) => {
  try {
    console.log('Making request to /api/users/task-analysis');
    const response = await fetchWithAuth('/api/users/task-analysis', { method: 'GET' }, token);
    console.log('Response received:', response);
    
    // The response is already parsed JSON data, so we can return it directly
    return response;
  } catch (error) {
    console.error('Error in fetchTaskAnalysisResults:', error);
    throw error;
  }
};

export const fetchComprehensionData = async (token) => {
  try {
    console.log('Making request to /api/users/comprehension');
    const response = await fetchWithAuth('/api/users/comprehension', { method: 'GET' }, token);
    console.log('Response received:', response);
    
    // The response is already parsed JSON data, so we can return it directly
    return response;
  } catch (error) {
    console.error('Error in fetchComprehensionData:', error);
    throw error;
  }
};
*/

/**
 * Convert a month filter string (YYYY-MM) to start and end dates
 * @param {string} month - Month string in format YYYY-MM or 'all' for all time
 * @returns {Object} Object with startDate and endDate properties
 */
export const getDateRangeFromMonth = month => {
  if (stryMutAct_9fa48("29814")) {
    {}
  } else {
    stryCov_9fa48("29814");
    if (stryMutAct_9fa48("29817") ? !month && month === 'all' : stryMutAct_9fa48("29816") ? false : stryMutAct_9fa48("29815") ? true : (stryCov_9fa48("29815", "29816", "29817"), (stryMutAct_9fa48("29818") ? month : (stryCov_9fa48("29818"), !month)) || (stryMutAct_9fa48("29820") ? month !== 'all' : stryMutAct_9fa48("29819") ? false : (stryCov_9fa48("29819", "29820"), month === (stryMutAct_9fa48("29821") ? "" : (stryCov_9fa48("29821"), 'all')))))) {
      if (stryMutAct_9fa48("29822")) {
        {}
      } else {
        stryCov_9fa48("29822");
        return stryMutAct_9fa48("29823") ? {} : (stryCov_9fa48("29823"), {
          startDate: stryMutAct_9fa48("29824") ? "" : (stryCov_9fa48("29824"), '2025-03-15'),
          // Default start date
          endDate: new Date().toISOString().split(stryMutAct_9fa48("29825") ? "" : (stryCov_9fa48("29825"), 'T'))[0] // Current date
        });
      }
    }
    const [year, monthNum] = month.split(stryMutAct_9fa48("29826") ? "" : (stryCov_9fa48("29826"), '-'));

    // Create first day of selected month
    const startDate = stryMutAct_9fa48("29827") ? `` : (stryCov_9fa48("29827"), `${year}-${monthNum}-01`);

    // Create last day of selected month
    const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
    const endDate = stryMutAct_9fa48("29828") ? `` : (stryCov_9fa48("29828"), `${year}-${monthNum}-${lastDay}`);
    return stryMutAct_9fa48("29829") ? {} : (stryCov_9fa48("29829"), {
      startDate,
      endDate
    });
  }
};

/**
 * Fetch work product data from external API using the user ID
 * @param {number} userId - User's ID to fetch work product data for
 * @param {string} month - Optional month filter in YYYY-MM format
 * @returns {Promise} Promise that resolves to work product data
 */
export const fetchExternalWorkProduct = async (userId, month) => {
  if (stryMutAct_9fa48("29830")) {
    {}
  } else {
    stryCov_9fa48("29830");
    try {
      if (stryMutAct_9fa48("29831")) {
        {}
      } else {
        stryCov_9fa48("29831");
        console.log(stryMutAct_9fa48("29832") ? "" : (stryCov_9fa48("29832"), 'Fetching external work product data for user:'), userId);

        // Get date range from month filter
        const {
          startDate,
          endDate
        } = getDateRangeFromMonth(month);

        // Use the correct camelCase format for the type parameter
        const apiUrl = stryMutAct_9fa48("29833") ? `` : (stryCov_9fa48("29833"), `https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/api/builders/${userId}/details?type=workProduct&startDate=${startDate}&endDate=${endDate}`);
        console.log(stryMutAct_9fa48("29834") ? "" : (stryCov_9fa48("29834"), 'Making request to external API:'), apiUrl);
        const response = await fetch(apiUrl, stryMutAct_9fa48("29835") ? {} : (stryCov_9fa48("29835"), {
          method: stryMutAct_9fa48("29836") ? "" : (stryCov_9fa48("29836"), 'GET'),
          headers: stryMutAct_9fa48("29837") ? {} : (stryCov_9fa48("29837"), {
            'Content-Type': stryMutAct_9fa48("29838") ? "" : (stryCov_9fa48("29838"), 'application/json')
          })
        }));
        if (stryMutAct_9fa48("29841") ? false : stryMutAct_9fa48("29840") ? true : stryMutAct_9fa48("29839") ? response.ok : (stryCov_9fa48("29839", "29840", "29841"), !response.ok)) {
          if (stryMutAct_9fa48("29842")) {
            {}
          } else {
            stryCov_9fa48("29842");
            console.error(stryMutAct_9fa48("29843") ? `` : (stryCov_9fa48("29843"), `API request failed with status: ${response.status}`));
            console.error(stryMutAct_9fa48("29844") ? "" : (stryCov_9fa48("29844"), 'Response:'), await response.text().catch(stryMutAct_9fa48("29845") ? () => undefined : (stryCov_9fa48("29845"), () => stryMutAct_9fa48("29846") ? "" : (stryCov_9fa48("29846"), 'Could not read response text'))));
            throw new Error(stryMutAct_9fa48("29847") ? `` : (stryCov_9fa48("29847"), `External API request failed with status: ${response.status}`));
          }
        }
        const data = await response.json();
        console.log(stryMutAct_9fa48("29848") ? "" : (stryCov_9fa48("29848"), 'External work product data received:'), data);
        return data;
      }
    } catch (error) {
      if (stryMutAct_9fa48("29849")) {
        {}
      } else {
        stryCov_9fa48("29849");
        console.error(stryMutAct_9fa48("29850") ? "" : (stryCov_9fa48("29850"), 'Error fetching external work product data:'), error);
        throw error;
      }
    }
  }
};

/**
 * Fetch comprehension data from external API using the user ID
 * @param {number} userId - User's ID to fetch comprehension data for
 * @param {string} month - Optional month filter in YYYY-MM format
 * @returns {Promise} Promise that resolves to comprehension data
 */
export const fetchExternalComprehension = async (userId, month) => {
  if (stryMutAct_9fa48("29851")) {
    {}
  } else {
    stryCov_9fa48("29851");
    try {
      if (stryMutAct_9fa48("29852")) {
        {}
      } else {
        stryCov_9fa48("29852");
        console.log(stryMutAct_9fa48("29853") ? "" : (stryCov_9fa48("29853"), 'Fetching external comprehension data for user:'), userId);

        // Get date range from month filter
        const {
          startDate,
          endDate
        } = getDateRangeFromMonth(month);

        // Construct the API URL with the comprehension type - fixed the domain name
        const apiUrl = stryMutAct_9fa48("29854") ? `` : (stryCov_9fa48("29854"), `https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/api/builders/${userId}/details?type=comprehension&startDate=${startDate}&endDate=${endDate}`);
        console.log(stryMutAct_9fa48("29855") ? "" : (stryCov_9fa48("29855"), 'Making request to external API:'), apiUrl);
        const response = await fetch(apiUrl, stryMutAct_9fa48("29856") ? {} : (stryCov_9fa48("29856"), {
          method: stryMutAct_9fa48("29857") ? "" : (stryCov_9fa48("29857"), 'GET'),
          headers: stryMutAct_9fa48("29858") ? {} : (stryCov_9fa48("29858"), {
            'Content-Type': stryMutAct_9fa48("29859") ? "" : (stryCov_9fa48("29859"), 'application/json')
          })
        }));
        if (stryMutAct_9fa48("29862") ? false : stryMutAct_9fa48("29861") ? true : stryMutAct_9fa48("29860") ? response.ok : (stryCov_9fa48("29860", "29861", "29862"), !response.ok)) {
          if (stryMutAct_9fa48("29863")) {
            {}
          } else {
            stryCov_9fa48("29863");
            console.error(stryMutAct_9fa48("29864") ? `` : (stryCov_9fa48("29864"), `API request failed with status: ${response.status}`));
            console.error(stryMutAct_9fa48("29865") ? "" : (stryCov_9fa48("29865"), 'Response:'), await response.text().catch(stryMutAct_9fa48("29866") ? () => undefined : (stryCov_9fa48("29866"), () => stryMutAct_9fa48("29867") ? "" : (stryCov_9fa48("29867"), 'Could not read response text'))));
            throw new Error(stryMutAct_9fa48("29868") ? `` : (stryCov_9fa48("29868"), `External API request failed with status: ${response.status}`));
          }
        }
        const data = await response.json();
        console.log(stryMutAct_9fa48("29869") ? "" : (stryCov_9fa48("29869"), 'External comprehension data received:'), data);
        return data;
      }
    } catch (error) {
      if (stryMutAct_9fa48("29870")) {
        {}
      } else {
        stryCov_9fa48("29870");
        console.error(stryMutAct_9fa48("29871") ? "" : (stryCov_9fa48("29871"), 'Error fetching external comprehension data:'), error);
        throw error;
      }
    }
  }
};

/**
 * Fetch peer feedback from external API using the user ID
 * @param {number} userId - User's ID to fetch feedback for
 * @param {string} month - Optional month filter in YYYY-MM format
 * @returns {Promise} Promise that resolves to peer feedback data
 */
export const fetchExternalPeerFeedback = async (userId, month) => {
  if (stryMutAct_9fa48("29872")) {
    {}
  } else {
    stryCov_9fa48("29872");
    try {
      if (stryMutAct_9fa48("29873")) {
        {}
      } else {
        stryCov_9fa48("29873");
        console.log(stryMutAct_9fa48("29874") ? "" : (stryCov_9fa48("29874"), 'Fetching external peer feedback for user:'), userId);

        // Get date range from month filter
        const {
          startDate,
          endDate
        } = getDateRangeFromMonth(month);

        // Construct the API URL
        const apiUrl = stryMutAct_9fa48("29875") ? `` : (stryCov_9fa48("29875"), `https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/api/builders/${userId}/details?type=peer_feedback&startDate=${startDate}&endDate=${endDate}`);
        console.log(stryMutAct_9fa48("29876") ? "" : (stryCov_9fa48("29876"), 'Making request to external API:'), apiUrl);
        const response = await fetch(apiUrl, stryMutAct_9fa48("29877") ? {} : (stryCov_9fa48("29877"), {
          method: stryMutAct_9fa48("29878") ? "" : (stryCov_9fa48("29878"), 'GET'),
          headers: stryMutAct_9fa48("29879") ? {} : (stryCov_9fa48("29879"), {
            'Content-Type': stryMutAct_9fa48("29880") ? "" : (stryCov_9fa48("29880"), 'application/json')
          })
        }));
        if (stryMutAct_9fa48("29883") ? false : stryMutAct_9fa48("29882") ? true : stryMutAct_9fa48("29881") ? response.ok : (stryCov_9fa48("29881", "29882", "29883"), !response.ok)) {
          if (stryMutAct_9fa48("29884")) {
            {}
          } else {
            stryCov_9fa48("29884");
            throw new Error(stryMutAct_9fa48("29885") ? `` : (stryCov_9fa48("29885"), `External API request failed with status: ${response.status}`));
          }
        }
        const data = await response.json();
        console.log(stryMutAct_9fa48("29886") ? "" : (stryCov_9fa48("29886"), 'External peer feedback received:'), data);
        return data;
      }
    } catch (error) {
      if (stryMutAct_9fa48("29887")) {
        {}
      } else {
        stryCov_9fa48("29887");
        console.error(stryMutAct_9fa48("29888") ? "" : (stryCov_9fa48("29888"), 'Error fetching external peer feedback:'), error);
        throw error;
      }
    }
  }
};