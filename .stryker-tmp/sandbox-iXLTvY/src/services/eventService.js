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
const API_BASE_URL = stryMutAct_9fa48("29247") ? `` : (stryCov_9fa48("29247"), `${import.meta.env.VITE_API_URL}/api/events`);
class EventService {
  // Get all events with optional filters
  static async getEvents(filters = {}) {
    if (stryMutAct_9fa48("29248")) {
      {}
    } else {
      stryCov_9fa48("29248");
      const queryParams = new URLSearchParams();
      if (stryMutAct_9fa48("29250") ? false : stryMutAct_9fa48("29249") ? true : (stryCov_9fa48("29249", "29250"), filters.type)) queryParams.append(stryMutAct_9fa48("29251") ? "" : (stryCov_9fa48("29251"), 'type'), filters.type);
      if (stryMutAct_9fa48("29253") ? false : stryMutAct_9fa48("29252") ? true : (stryCov_9fa48("29252", "29253"), filters.status)) queryParams.append(stryMutAct_9fa48("29254") ? "" : (stryCov_9fa48("29254"), 'status'), filters.status);
      if (stryMutAct_9fa48("29256") ? false : stryMutAct_9fa48("29255") ? true : (stryCov_9fa48("29255", "29256"), filters.start_date)) queryParams.append(stryMutAct_9fa48("29257") ? "" : (stryCov_9fa48("29257"), 'start_date'), filters.start_date);
      if (stryMutAct_9fa48("29259") ? false : stryMutAct_9fa48("29258") ? true : (stryCov_9fa48("29258", "29259"), filters.end_date)) queryParams.append(stryMutAct_9fa48("29260") ? "" : (stryCov_9fa48("29260"), 'end_date'), filters.end_date);
      const response = await fetch(stryMutAct_9fa48("29261") ? `` : (stryCov_9fa48("29261"), `${API_BASE_URL}?${queryParams}`));
      if (stryMutAct_9fa48("29264") ? false : stryMutAct_9fa48("29263") ? true : stryMutAct_9fa48("29262") ? response.ok : (stryCov_9fa48("29262", "29263", "29264"), !response.ok)) throw new Error(stryMutAct_9fa48("29265") ? "" : (stryCov_9fa48("29265"), 'Failed to fetch events'));
      return response.json();
    }
  }

  // Get event by ID
  static async getEventById(eventId) {
    if (stryMutAct_9fa48("29266")) {
      {}
    } else {
      stryCov_9fa48("29266");
      const response = await fetch(stryMutAct_9fa48("29267") ? `` : (stryCov_9fa48("29267"), `${API_BASE_URL}/${eventId}`));
      if (stryMutAct_9fa48("29270") ? false : stryMutAct_9fa48("29269") ? true : stryMutAct_9fa48("29268") ? response.ok : (stryCov_9fa48("29268", "29269", "29270"), !response.ok)) throw new Error(stryMutAct_9fa48("29271") ? "" : (stryCov_9fa48("29271"), 'Failed to fetch event'));
      return response.json();
    }
  }

  // Register for an event
  static async registerForEvent(eventId, userData) {
    if (stryMutAct_9fa48("29272")) {
      {}
    } else {
      stryCov_9fa48("29272");
      const response = await fetch(stryMutAct_9fa48("29273") ? `` : (stryCov_9fa48("29273"), `${API_BASE_URL}/${eventId}/register`), stryMutAct_9fa48("29274") ? {} : (stryCov_9fa48("29274"), {
        method: stryMutAct_9fa48("29275") ? "" : (stryCov_9fa48("29275"), 'POST'),
        headers: stryMutAct_9fa48("29276") ? {} : (stryCov_9fa48("29276"), {
          'Content-Type': stryMutAct_9fa48("29277") ? "" : (stryCov_9fa48("29277"), 'application/json')
        }),
        body: JSON.stringify(userData)
      }));
      if (stryMutAct_9fa48("29280") ? false : stryMutAct_9fa48("29279") ? true : stryMutAct_9fa48("29278") ? response.ok : (stryCov_9fa48("29278", "29279", "29280"), !response.ok)) throw new Error(stryMutAct_9fa48("29281") ? "" : (stryCov_9fa48("29281"), 'Failed to register for event'));
      return response.json();
    }
  }

  // Get event registrations
  static async getEventRegistrations(eventId) {
    if (stryMutAct_9fa48("29282")) {
      {}
    } else {
      stryCov_9fa48("29282");
      const response = await fetch(stryMutAct_9fa48("29283") ? `` : (stryCov_9fa48("29283"), `${API_BASE_URL}/${eventId}/registrations`));
      if (stryMutAct_9fa48("29286") ? false : stryMutAct_9fa48("29285") ? true : stryMutAct_9fa48("29284") ? response.ok : (stryCov_9fa48("29284", "29285", "29286"), !response.ok)) throw new Error(stryMutAct_9fa48("29287") ? "" : (stryCov_9fa48("29287"), 'Failed to fetch registrations'));
      return response.json();
    }
  }

  // Update registration status (for admins)
  static async updateRegistrationStatus(eventId, registrationId, status) {
    if (stryMutAct_9fa48("29288")) {
      {}
    } else {
      stryCov_9fa48("29288");
      const response = await fetch(stryMutAct_9fa48("29289") ? `` : (stryCov_9fa48("29289"), `${API_BASE_URL}/${eventId}/registrations/${registrationId}`), stryMutAct_9fa48("29290") ? {} : (stryCov_9fa48("29290"), {
        method: stryMutAct_9fa48("29291") ? "" : (stryCov_9fa48("29291"), 'PUT'),
        headers: stryMutAct_9fa48("29292") ? {} : (stryCov_9fa48("29292"), {
          'Content-Type': stryMutAct_9fa48("29293") ? "" : (stryCov_9fa48("29293"), 'application/json')
        }),
        body: JSON.stringify(stryMutAct_9fa48("29294") ? {} : (stryCov_9fa48("29294"), {
          status
        }))
      }));
      if (stryMutAct_9fa48("29297") ? false : stryMutAct_9fa48("29296") ? true : stryMutAct_9fa48("29295") ? response.ok : (stryCov_9fa48("29295", "29296", "29297"), !response.ok)) throw new Error(stryMutAct_9fa48("29298") ? "" : (stryCov_9fa48("29298"), 'Failed to update registration status'));
      return response.json();
    }
  }

  // Cancel registration
  static async cancelRegistration(eventId, registrationId) {
    if (stryMutAct_9fa48("29299")) {
      {}
    } else {
      stryCov_9fa48("29299");
      const response = await fetch(stryMutAct_9fa48("29300") ? `` : (stryCov_9fa48("29300"), `${API_BASE_URL}/${eventId}/registrations/${registrationId}`), stryMutAct_9fa48("29301") ? {} : (stryCov_9fa48("29301"), {
        method: stryMutAct_9fa48("29302") ? "" : (stryCov_9fa48("29302"), 'DELETE')
      }));
      if (stryMutAct_9fa48("29305") ? false : stryMutAct_9fa48("29304") ? true : stryMutAct_9fa48("29303") ? response.ok : (stryCov_9fa48("29303", "29304", "29305"), !response.ok)) throw new Error(stryMutAct_9fa48("29306") ? "" : (stryCov_9fa48("29306"), 'Failed to cancel registration'));
      return response.json();
    }
  }

  // Create new event (admin only)
  static async createEvent(eventData) {
    if (stryMutAct_9fa48("29307")) {
      {}
    } else {
      stryCov_9fa48("29307");
      const response = await fetch(API_BASE_URL, stryMutAct_9fa48("29308") ? {} : (stryCov_9fa48("29308"), {
        method: stryMutAct_9fa48("29309") ? "" : (stryCov_9fa48("29309"), 'POST'),
        headers: stryMutAct_9fa48("29310") ? {} : (stryCov_9fa48("29310"), {
          'Content-Type': stryMutAct_9fa48("29311") ? "" : (stryCov_9fa48("29311"), 'application/json')
        }),
        body: JSON.stringify(eventData)
      }));
      if (stryMutAct_9fa48("29314") ? false : stryMutAct_9fa48("29313") ? true : stryMutAct_9fa48("29312") ? response.ok : (stryCov_9fa48("29312", "29313", "29314"), !response.ok)) throw new Error(stryMutAct_9fa48("29315") ? "" : (stryCov_9fa48("29315"), 'Failed to create event'));
      return response.json();
    }
  }

  // Update event (admin only)
  static async updateEvent(eventId, eventData) {
    if (stryMutAct_9fa48("29316")) {
      {}
    } else {
      stryCov_9fa48("29316");
      const response = await fetch(stryMutAct_9fa48("29317") ? `` : (stryCov_9fa48("29317"), `${API_BASE_URL}/${eventId}`), stryMutAct_9fa48("29318") ? {} : (stryCov_9fa48("29318"), {
        method: stryMutAct_9fa48("29319") ? "" : (stryCov_9fa48("29319"), 'PUT'),
        headers: stryMutAct_9fa48("29320") ? {} : (stryCov_9fa48("29320"), {
          'Content-Type': stryMutAct_9fa48("29321") ? "" : (stryCov_9fa48("29321"), 'application/json')
        }),
        body: JSON.stringify(eventData)
      }));
      if (stryMutAct_9fa48("29324") ? false : stryMutAct_9fa48("29323") ? true : stryMutAct_9fa48("29322") ? response.ok : (stryCov_9fa48("29322", "29323", "29324"), !response.ok)) throw new Error(stryMutAct_9fa48("29325") ? "" : (stryCov_9fa48("29325"), 'Failed to update event'));
      return response.json();
    }
  }

  // Delete event (admin only)
  static async deleteEvent(eventId) {
    if (stryMutAct_9fa48("29326")) {
      {}
    } else {
      stryCov_9fa48("29326");
      const response = await fetch(stryMutAct_9fa48("29327") ? `` : (stryCov_9fa48("29327"), `${API_BASE_URL}/${eventId}`), stryMutAct_9fa48("29328") ? {} : (stryCov_9fa48("29328"), {
        method: stryMutAct_9fa48("29329") ? "" : (stryCov_9fa48("29329"), 'DELETE')
      }));
      if (stryMutAct_9fa48("29332") ? false : stryMutAct_9fa48("29331") ? true : stryMutAct_9fa48("29330") ? response.ok : (stryCov_9fa48("29330", "29331", "29332"), !response.ok)) throw new Error(stryMutAct_9fa48("29333") ? "" : (stryCov_9fa48("29333"), 'Failed to delete event'));
      return response.json();
    }
  }
}
export default EventService;