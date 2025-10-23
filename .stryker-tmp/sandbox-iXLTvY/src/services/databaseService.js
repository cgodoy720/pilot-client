// @ts-nocheck
// Database service for connecting to Cloud SQL PostgreSQL via backend API
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
const API_BASE_URL = stryMutAct_9fa48("28976") ? `` : (stryCov_9fa48("28976"), `${import.meta.env.VITE_API_URL}/api`);
class DatabaseService {
  constructor() {
    if (stryMutAct_9fa48("28977")) {
      {}
    } else {
      stryCov_9fa48("28977");
      this.currentApplicant = null;
      this.currentApplication = null;
    }
  }

  // Get authorization headers with JWT token
  getAuthHeaders() {
    if (stryMutAct_9fa48("28978")) {
      {}
    } else {
      stryCov_9fa48("28978");
      const token = localStorage.getItem(stryMutAct_9fa48("28979") ? "" : (stryCov_9fa48("28979"), 'applicantToken'));
      return stryMutAct_9fa48("28980") ? {} : (stryCov_9fa48("28980"), {
        'Content-Type': stryMutAct_9fa48("28981") ? "" : (stryCov_9fa48("28981"), 'application/json'),
        ...(stryMutAct_9fa48("28984") ? token || {
          'Authorization': `Bearer ${token}`
        } : stryMutAct_9fa48("28983") ? false : stryMutAct_9fa48("28982") ? true : (stryCov_9fa48("28982", "28983", "28984"), token && (stryMutAct_9fa48("28985") ? {} : (stryCov_9fa48("28985"), {
          'Authorization': stryMutAct_9fa48("28986") ? `` : (stryCov_9fa48("28986"), `Bearer ${token}`)
        }))))
      });
    }
  }

  // Authentication methods
  async signup(firstName, lastName, email, password) {
    if (stryMutAct_9fa48("28987")) {
      {}
    } else {
      stryCov_9fa48("28987");
      try {
        if (stryMutAct_9fa48("28988")) {
          {}
        } else {
          stryCov_9fa48("28988");
          const response = await fetch(stryMutAct_9fa48("28989") ? `` : (stryCov_9fa48("28989"), `${API_BASE_URL}/applications/signup`), stryMutAct_9fa48("28990") ? {} : (stryCov_9fa48("28990"), {
            method: stryMutAct_9fa48("28991") ? "" : (stryCov_9fa48("28991"), 'POST'),
            headers: stryMutAct_9fa48("28992") ? {} : (stryCov_9fa48("28992"), {
              'Content-Type': stryMutAct_9fa48("28993") ? "" : (stryCov_9fa48("28993"), 'application/json')
            }),
            body: JSON.stringify(stryMutAct_9fa48("28994") ? {} : (stryCov_9fa48("28994"), {
              firstName,
              lastName,
              email,
              password
            }))
          }));
          if (stryMutAct_9fa48("28997") ? false : stryMutAct_9fa48("28996") ? true : stryMutAct_9fa48("28995") ? response.ok : (stryCov_9fa48("28995", "28996", "28997"), !response.ok)) {
            if (stryMutAct_9fa48("28998")) {
              {}
            } else {
              stryCov_9fa48("28998");
              const error = await response.json();
              throw new Error(stryMutAct_9fa48("29001") ? error.error && 'Signup failed' : stryMutAct_9fa48("29000") ? false : stryMutAct_9fa48("28999") ? true : (stryCov_9fa48("28999", "29000", "29001"), error.error || (stryMutAct_9fa48("29002") ? "" : (stryCov_9fa48("29002"), 'Signup failed'))));
            }
          }
          const data = await response.json();

          // Store token and applicant data
          localStorage.setItem(stryMutAct_9fa48("29003") ? "" : (stryCov_9fa48("29003"), 'applicantToken'), data.token);
          this.currentApplicant = data.applicant;
          return data;
        }
      } catch (error) {
        if (stryMutAct_9fa48("29004")) {
          {}
        } else {
          stryCov_9fa48("29004");
          console.error(stryMutAct_9fa48("29005") ? "" : (stryCov_9fa48("29005"), 'Error during signup:'), error);
          throw error;
        }
      }
    }
  }
  async login(email, password) {
    if (stryMutAct_9fa48("29006")) {
      {}
    } else {
      stryCov_9fa48("29006");
      try {
        if (stryMutAct_9fa48("29007")) {
          {}
        } else {
          stryCov_9fa48("29007");
          const response = await fetch(stryMutAct_9fa48("29008") ? `` : (stryCov_9fa48("29008"), `${API_BASE_URL}/unified-auth/login`), stryMutAct_9fa48("29009") ? {} : (stryCov_9fa48("29009"), {
            method: stryMutAct_9fa48("29010") ? "" : (stryCov_9fa48("29010"), 'POST'),
            headers: stryMutAct_9fa48("29011") ? {} : (stryCov_9fa48("29011"), {
              'Content-Type': stryMutAct_9fa48("29012") ? "" : (stryCov_9fa48("29012"), 'application/json')
            }),
            body: JSON.stringify(stryMutAct_9fa48("29013") ? {} : (stryCov_9fa48("29013"), {
              email,
              password
            }))
          }));
          if (stryMutAct_9fa48("29016") ? false : stryMutAct_9fa48("29015") ? true : stryMutAct_9fa48("29014") ? response.ok : (stryCov_9fa48("29014", "29015", "29016"), !response.ok)) {
            if (stryMutAct_9fa48("29017")) {
              {}
            } else {
              stryCov_9fa48("29017");
              const error = await response.json();
              throw new Error(stryMutAct_9fa48("29020") ? error.error && 'Login failed' : stryMutAct_9fa48("29019") ? false : stryMutAct_9fa48("29018") ? true : (stryCov_9fa48("29018", "29019", "29020"), error.error || (stryMutAct_9fa48("29021") ? "" : (stryCov_9fa48("29021"), 'Login failed'))));
            }
          }
          const data = await response.json();

          // Only handle applicant logins in this service
          if (stryMutAct_9fa48("29024") ? data.userType !== 'applicant' : stryMutAct_9fa48("29023") ? false : stryMutAct_9fa48("29022") ? true : (stryCov_9fa48("29022", "29023", "29024"), data.userType === (stryMutAct_9fa48("29025") ? "" : (stryCov_9fa48("29025"), 'applicant')))) {
            if (stryMutAct_9fa48("29026")) {
              {}
            } else {
              stryCov_9fa48("29026");
              // Store token and applicant data
              localStorage.setItem(stryMutAct_9fa48("29027") ? "" : (stryCov_9fa48("29027"), 'applicantToken'), data.token);
              this.currentApplicant = data.user;
              return stryMutAct_9fa48("29028") ? {} : (stryCov_9fa48("29028"), {
                success: stryMutAct_9fa48("29029") ? false : (stryCov_9fa48("29029"), true),
                userType: data.userType,
                redirectTo: data.redirectTo,
                user: data.user
              });
            }
          } else {
            if (stryMutAct_9fa48("29030")) {
              {}
            } else {
              stryCov_9fa48("29030");
              throw new Error(stryMutAct_9fa48("29031") ? "" : (stryCov_9fa48("29031"), 'This login is for builders only. Please use the main login page.'));
            }
          }
        }
      } catch (error) {
        if (stryMutAct_9fa48("29032")) {
          {}
        } else {
          stryCov_9fa48("29032");
          console.error(stryMutAct_9fa48("29033") ? "" : (stryCov_9fa48("29033"), 'Error during applicant login:'), error);
          throw error;
        }
      }
    }
  }
  async resetPassword(email, newPassword) {
    if (stryMutAct_9fa48("29034")) {
      {}
    } else {
      stryCov_9fa48("29034");
      try {
        if (stryMutAct_9fa48("29035")) {
          {}
        } else {
          stryCov_9fa48("29035");
          const response = await fetch(stryMutAct_9fa48("29036") ? `` : (stryCov_9fa48("29036"), `${API_BASE_URL}/applications/reset-password`), stryMutAct_9fa48("29037") ? {} : (stryCov_9fa48("29037"), {
            method: stryMutAct_9fa48("29038") ? "" : (stryCov_9fa48("29038"), 'POST'),
            headers: stryMutAct_9fa48("29039") ? {} : (stryCov_9fa48("29039"), {
              'Content-Type': stryMutAct_9fa48("29040") ? "" : (stryCov_9fa48("29040"), 'application/json')
            }),
            body: JSON.stringify(stryMutAct_9fa48("29041") ? {} : (stryCov_9fa48("29041"), {
              email,
              newPassword
            }))
          }));
          if (stryMutAct_9fa48("29044") ? false : stryMutAct_9fa48("29043") ? true : stryMutAct_9fa48("29042") ? response.ok : (stryCov_9fa48("29042", "29043", "29044"), !response.ok)) {
            if (stryMutAct_9fa48("29045")) {
              {}
            } else {
              stryCov_9fa48("29045");
              const error = await response.json();
              throw new Error(stryMutAct_9fa48("29048") ? error.error && 'Password reset failed' : stryMutAct_9fa48("29047") ? false : stryMutAct_9fa48("29046") ? true : (stryCov_9fa48("29046", "29047", "29048"), error.error || (stryMutAct_9fa48("29049") ? "" : (stryCov_9fa48("29049"), 'Password reset failed'))));
            }
          }
          return await response.json();
        }
      } catch (error) {
        if (stryMutAct_9fa48("29050")) {
          {}
        } else {
          stryCov_9fa48("29050");
          console.error(stryMutAct_9fa48("29051") ? "" : (stryCov_9fa48("29051"), 'Error during password reset:'), error);
          throw error;
        }
      }
    }
  }
  logout() {
    if (stryMutAct_9fa48("29052")) {
      {}
    } else {
      stryCov_9fa48("29052");
      localStorage.removeItem(stryMutAct_9fa48("29053") ? "" : (stryCov_9fa48("29053"), 'applicantToken'));
      this.currentApplicant = null;
      this.currentApplication = null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    if (stryMutAct_9fa48("29054")) {
      {}
    } else {
      stryCov_9fa48("29054");
      return stryMutAct_9fa48("29055") ? !localStorage.getItem('applicantToken') : (stryCov_9fa48("29055"), !(stryMutAct_9fa48("29056") ? localStorage.getItem('applicantToken') : (stryCov_9fa48("29056"), !localStorage.getItem(stryMutAct_9fa48("29057") ? "" : (stryCov_9fa48("29057"), 'applicantToken')))));
    }
  }

  // Get current applicant from token
  getCurrentApplicant() {
    if (stryMutAct_9fa48("29058")) {
      {}
    } else {
      stryCov_9fa48("29058");
      const token = localStorage.getItem(stryMutAct_9fa48("29059") ? "" : (stryCov_9fa48("29059"), 'applicantToken'));
      if (stryMutAct_9fa48("29061") ? false : stryMutAct_9fa48("29060") ? true : (stryCov_9fa48("29060", "29061"), token)) {
        if (stryMutAct_9fa48("29062")) {
          {}
        } else {
          stryCov_9fa48("29062");
          try {
            if (stryMutAct_9fa48("29063")) {
              {}
            } else {
              stryCov_9fa48("29063");
              const payload = JSON.parse(atob(token.split(stryMutAct_9fa48("29064") ? "" : (stryCov_9fa48("29064"), '.'))[1]));
              return stryMutAct_9fa48("29065") ? {} : (stryCov_9fa48("29065"), {
                applicant_id: payload.applicantId,
                first_name: payload.firstName,
                last_name: payload.lastName,
                email: payload.email
              });
            }
          } catch (error) {
            if (stryMutAct_9fa48("29066")) {
              {}
            } else {
              stryCov_9fa48("29066");
              console.error(stryMutAct_9fa48("29067") ? "" : (stryCov_9fa48("29067"), 'Error decoding token:'), error);
              this.logout();
              return null;
            }
          }
        }
      }
      return null;
    }
  }

  // Fetch all sections and questions from database via API
  async fetchApplicationQuestions() {
    if (stryMutAct_9fa48("29068")) {
      {}
    } else {
      stryCov_9fa48("29068");
      try {
        if (stryMutAct_9fa48("29069")) {
          {}
        } else {
          stryCov_9fa48("29069");
          // Add cache-busting parameter to ensure fresh data
          const cacheBuster = new Date().getTime();
          const response = await fetch(stryMutAct_9fa48("29070") ? `` : (stryCov_9fa48("29070"), `${API_BASE_URL}/applications/questions?t=${cacheBuster}`));
          if (stryMutAct_9fa48("29073") ? false : stryMutAct_9fa48("29072") ? true : stryMutAct_9fa48("29071") ? response.ok : (stryCov_9fa48("29071", "29072", "29073"), !response.ok)) {
            if (stryMutAct_9fa48("29074")) {
              {}
            } else {
              stryCov_9fa48("29074");
              throw new Error(stryMutAct_9fa48("29075") ? `` : (stryCov_9fa48("29075"), `HTTP error! status: ${response.status}`));
            }
          }
          const questions = await response.json();
          return questions;
        }
      } catch (error) {
        if (stryMutAct_9fa48("29076")) {
          {}
        } else {
          stryCov_9fa48("29076");
          console.error(stryMutAct_9fa48("29077") ? "" : (stryCov_9fa48("29077"), 'Error fetching questions:'), error);
          throw error;
        }
      }
    }
  }

  // Create or get applicant
  async createOrGetApplicant(email, firstName, lastName) {
    if (stryMutAct_9fa48("29078")) {
      {}
    } else {
      stryCov_9fa48("29078");
      try {
        if (stryMutAct_9fa48("29079")) {
          {}
        } else {
          stryCov_9fa48("29079");
          const response = await fetch(stryMutAct_9fa48("29080") ? `` : (stryCov_9fa48("29080"), `${API_BASE_URL}/applications/applicant`), stryMutAct_9fa48("29081") ? {} : (stryCov_9fa48("29081"), {
            method: stryMutAct_9fa48("29082") ? "" : (stryCov_9fa48("29082"), 'POST'),
            headers: stryMutAct_9fa48("29083") ? {} : (stryCov_9fa48("29083"), {
              'Content-Type': stryMutAct_9fa48("29084") ? "" : (stryCov_9fa48("29084"), 'application/json')
            }),
            body: JSON.stringify(stryMutAct_9fa48("29085") ? {} : (stryCov_9fa48("29085"), {
              email,
              firstName,
              lastName
            }))
          }));
          if (stryMutAct_9fa48("29088") ? false : stryMutAct_9fa48("29087") ? true : stryMutAct_9fa48("29086") ? response.ok : (stryCov_9fa48("29086", "29087", "29088"), !response.ok)) {
            if (stryMutAct_9fa48("29089")) {
              {}
            } else {
              stryCov_9fa48("29089");
              throw new Error(stryMutAct_9fa48("29090") ? `` : (stryCov_9fa48("29090"), `HTTP error! status: ${response.status}`));
            }
          }
          this.currentApplicant = await response.json();
          return this.currentApplicant;
        }
      } catch (error) {
        if (stryMutAct_9fa48("29091")) {
          {}
        } else {
          stryCov_9fa48("29091");
          console.error(stryMutAct_9fa48("29092") ? "" : (stryCov_9fa48("29092"), 'Error creating/getting applicant:'), error);
          throw error;
        }
      }
    }
  }

  // Create application
  async createApplication(cohortId = null) {
    if (stryMutAct_9fa48("29093")) {
      {}
    } else {
      stryCov_9fa48("29093");
      try {
        if (stryMutAct_9fa48("29094")) {
          {}
        } else {
          stryCov_9fa48("29094");
          // Use authenticated endpoint if we have a token, otherwise use anonymous
          const useAnonymous = stryMutAct_9fa48("29095") ? this.isAuthenticated() : (stryCov_9fa48("29095"), !this.isAuthenticated());
          const url = useAnonymous ? stryMutAct_9fa48("29096") ? `` : (stryCov_9fa48("29096"), `${API_BASE_URL}/applications/application/anonymous`) : stryMutAct_9fa48("29097") ? `` : (stryCov_9fa48("29097"), `${API_BASE_URL}/applications/application`);
          const headers = useAnonymous ? stryMutAct_9fa48("29098") ? {} : (stryCov_9fa48("29098"), {
            'Content-Type': stryMutAct_9fa48("29099") ? "" : (stryCov_9fa48("29099"), 'application/json')
          }) : this.getAuthHeaders();

          // For anonymous, we need the applicant_id
          if (stryMutAct_9fa48("29102") ? useAnonymous || !this.currentApplicant?.applicant_id : stryMutAct_9fa48("29101") ? false : stryMutAct_9fa48("29100") ? true : (stryCov_9fa48("29100", "29101", "29102"), useAnonymous && (stryMutAct_9fa48("29103") ? this.currentApplicant?.applicant_id : (stryCov_9fa48("29103"), !(stryMutAct_9fa48("29104") ? this.currentApplicant.applicant_id : (stryCov_9fa48("29104"), this.currentApplicant?.applicant_id)))))) {
            if (stryMutAct_9fa48("29105")) {
              {}
            } else {
              stryCov_9fa48("29105");
              throw new Error(stryMutAct_9fa48("29106") ? "" : (stryCov_9fa48("29106"), 'No applicant available for anonymous application creation. Please create applicant first.'));
            }
          }
          const body = useAnonymous ? stryMutAct_9fa48("29107") ? {} : (stryCov_9fa48("29107"), {
            applicantId: this.currentApplicant.applicant_id,
            cohortId
          }) : stryMutAct_9fa48("29108") ? {} : (stryCov_9fa48("29108"), {
            cohortId
          });
          console.log(stryMutAct_9fa48("29109") ? "" : (stryCov_9fa48("29109"), 'Creating application with:'), stryMutAct_9fa48("29110") ? {} : (stryCov_9fa48("29110"), {
            url,
            body,
            useAnonymous
          }));
          const response = await fetch(url, stryMutAct_9fa48("29111") ? {} : (stryCov_9fa48("29111"), {
            method: stryMutAct_9fa48("29112") ? "" : (stryCov_9fa48("29112"), 'POST'),
            headers,
            body: JSON.stringify(body)
          }));
          if (stryMutAct_9fa48("29115") ? false : stryMutAct_9fa48("29114") ? true : stryMutAct_9fa48("29113") ? response.ok : (stryCov_9fa48("29113", "29114", "29115"), !response.ok)) {
            if (stryMutAct_9fa48("29116")) {
              {}
            } else {
              stryCov_9fa48("29116");
              throw new Error(stryMutAct_9fa48("29117") ? `` : (stryCov_9fa48("29117"), `HTTP error! status: ${response.status}`));
            }
          }
          this.currentApplication = await response.json();
          console.log(stryMutAct_9fa48("29118") ? "" : (stryCov_9fa48("29118"), 'Application created:'), this.currentApplication);
          return this.currentApplication;
        }
      } catch (error) {
        if (stryMutAct_9fa48("29119")) {
          {}
        } else {
          stryCov_9fa48("29119");
          console.error(stryMutAct_9fa48("29120") ? "" : (stryCov_9fa48("29120"), 'Error creating application:'), error);
          throw error;
        }
      }
    }
  }

  // Save user response to database
  async saveResponse(applicationId, questionId, responseValue) {
    if (stryMutAct_9fa48("29121")) {
      {}
    } else {
      stryCov_9fa48("29121");
      try {
        if (stryMutAct_9fa48("29122")) {
          {}
        } else {
          stryCov_9fa48("29122");
          // Use authenticated endpoint if we have a token, otherwise use anonymous
          const useAnonymous = stryMutAct_9fa48("29123") ? this.isAuthenticated() : (stryCov_9fa48("29123"), !this.isAuthenticated());
          const url = useAnonymous ? stryMutAct_9fa48("29124") ? `` : (stryCov_9fa48("29124"), `${API_BASE_URL}/applications/response/anonymous`) : stryMutAct_9fa48("29125") ? `` : (stryCov_9fa48("29125"), `${API_BASE_URL}/applications/response`);
          const headers = useAnonymous ? stryMutAct_9fa48("29126") ? {} : (stryCov_9fa48("29126"), {
            'Content-Type': stryMutAct_9fa48("29127") ? "" : (stryCov_9fa48("29127"), 'application/json')
          }) : this.getAuthHeaders();
          const response = await fetch(url, stryMutAct_9fa48("29128") ? {} : (stryCov_9fa48("29128"), {
            method: stryMutAct_9fa48("29129") ? "" : (stryCov_9fa48("29129"), 'POST'),
            headers,
            body: JSON.stringify(stryMutAct_9fa48("29130") ? {} : (stryCov_9fa48("29130"), {
              applicationId,
              questionId,
              responseValue
            }))
          }));
          if (stryMutAct_9fa48("29133") ? false : stryMutAct_9fa48("29132") ? true : stryMutAct_9fa48("29131") ? response.ok : (stryCov_9fa48("29131", "29132", "29133"), !response.ok)) {
            if (stryMutAct_9fa48("29134")) {
              {}
            } else {
              stryCov_9fa48("29134");
              throw new Error(stryMutAct_9fa48("29135") ? `` : (stryCov_9fa48("29135"), `HTTP error! status: ${response.status}`));
            }
          }
          return await response.json();
        }
      } catch (error) {
        if (stryMutAct_9fa48("29136")) {
          {}
        } else {
          stryCov_9fa48("29136");
          console.error(stryMutAct_9fa48("29137") ? "" : (stryCov_9fa48("29137"), 'Error saving response:'), error);
          throw error;
        }
      }
    }
  }

  // Submit application
  async submitApplication(applicationId) {
    if (stryMutAct_9fa48("29138")) {
      {}
    } else {
      stryCov_9fa48("29138");
      try {
        if (stryMutAct_9fa48("29139")) {
          {}
        } else {
          stryCov_9fa48("29139");
          // Use authenticated endpoint if we have a token, otherwise use anonymous
          const useAnonymous = stryMutAct_9fa48("29140") ? this.isAuthenticated() : (stryCov_9fa48("29140"), !this.isAuthenticated());
          const url = useAnonymous ? stryMutAct_9fa48("29141") ? `` : (stryCov_9fa48("29141"), `${API_BASE_URL}/applications/application/${applicationId}/submit/anonymous`) : stryMutAct_9fa48("29142") ? `` : (stryCov_9fa48("29142"), `${API_BASE_URL}/applications/${applicationId}/submit`);
          const headers = useAnonymous ? stryMutAct_9fa48("29143") ? {} : (stryCov_9fa48("29143"), {
            'Content-Type': stryMutAct_9fa48("29144") ? "" : (stryCov_9fa48("29144"), 'application/json')
          }) : this.getAuthHeaders();
          const response = await fetch(url, stryMutAct_9fa48("29145") ? {} : (stryCov_9fa48("29145"), {
            method: stryMutAct_9fa48("29146") ? "" : (stryCov_9fa48("29146"), 'PUT'),
            headers
          }));
          if (stryMutAct_9fa48("29149") ? false : stryMutAct_9fa48("29148") ? true : stryMutAct_9fa48("29147") ? response.ok : (stryCov_9fa48("29147", "29148", "29149"), !response.ok)) {
            if (stryMutAct_9fa48("29150")) {
              {}
            } else {
              stryCov_9fa48("29150");
              throw new Error(stryMutAct_9fa48("29151") ? `` : (stryCov_9fa48("29151"), `HTTP error! status: ${response.status}`));
            }
          }
          return await response.json();
        }
      } catch (error) {
        if (stryMutAct_9fa48("29152")) {
          {}
        } else {
          stryCov_9fa48("29152");
          console.error(stryMutAct_9fa48("29153") ? "" : (stryCov_9fa48("29153"), 'Error submitting application:'), error);
          throw error;
        }
      }
    }
  }

  // Get application by applicant ID
  async getApplicationByApplicantId(applicantId) {
    if (stryMutAct_9fa48("29154")) {
      {}
    } else {
      stryCov_9fa48("29154");
      try {
        if (stryMutAct_9fa48("29155")) {
          {}
        } else {
          stryCov_9fa48("29155");
          const response = await fetch(stryMutAct_9fa48("29156") ? `` : (stryCov_9fa48("29156"), `${API_BASE_URL}/applications/applicant/${applicantId}/application`), stryMutAct_9fa48("29157") ? {} : (stryCov_9fa48("29157"), {
            headers: stryMutAct_9fa48("29158") ? {} : (stryCov_9fa48("29158"), {
              'Content-Type': stryMutAct_9fa48("29159") ? "" : (stryCov_9fa48("29159"), 'application/json')
            })
          }));
          if (stryMutAct_9fa48("29162") ? false : stryMutAct_9fa48("29161") ? true : stryMutAct_9fa48("29160") ? response.ok : (stryCov_9fa48("29160", "29161", "29162"), !response.ok)) {
            if (stryMutAct_9fa48("29163")) {
              {}
            } else {
              stryCov_9fa48("29163");
              if (stryMutAct_9fa48("29166") ? response.status !== 404 : stryMutAct_9fa48("29165") ? false : stryMutAct_9fa48("29164") ? true : (stryCov_9fa48("29164", "29165", "29166"), response.status === 404)) {
                if (stryMutAct_9fa48("29167")) {
                  {}
                } else {
                  stryCov_9fa48("29167");
                  return null; // No application found
                }
              }
              throw new Error(stryMutAct_9fa48("29168") ? `` : (stryCov_9fa48("29168"), `HTTP error! status: ${response.status}`));
            }
          }
          return await response.json();
        }
      } catch (error) {
        if (stryMutAct_9fa48("29169")) {
          {}
        } else {
          stryCov_9fa48("29169");
          console.error(stryMutAct_9fa48("29170") ? "" : (stryCov_9fa48("29170"), 'Error fetching application by applicant ID:'), error);
          throw error;
        }
      }
    }
  }

  // Get latest application by applicant ID (all statuses, for dashboard)
  async getLatestApplicationByApplicantId(applicantId) {
    if (stryMutAct_9fa48("29171")) {
      {}
    } else {
      stryCov_9fa48("29171");
      try {
        if (stryMutAct_9fa48("29172")) {
          {}
        } else {
          stryCov_9fa48("29172");
          const response = await fetch(stryMutAct_9fa48("29173") ? `` : (stryCov_9fa48("29173"), `${API_BASE_URL}/applications/applicant/${applicantId}/latest-application`), stryMutAct_9fa48("29174") ? {} : (stryCov_9fa48("29174"), {
            headers: stryMutAct_9fa48("29175") ? {} : (stryCov_9fa48("29175"), {
              'Content-Type': stryMutAct_9fa48("29176") ? "" : (stryCov_9fa48("29176"), 'application/json')
            })
          }));
          if (stryMutAct_9fa48("29179") ? false : stryMutAct_9fa48("29178") ? true : stryMutAct_9fa48("29177") ? response.ok : (stryCov_9fa48("29177", "29178", "29179"), !response.ok)) {
            if (stryMutAct_9fa48("29180")) {
              {}
            } else {
              stryCov_9fa48("29180");
              if (stryMutAct_9fa48("29183") ? response.status !== 404 : stryMutAct_9fa48("29182") ? false : stryMutAct_9fa48("29181") ? true : (stryCov_9fa48("29181", "29182", "29183"), response.status === 404)) {
                if (stryMutAct_9fa48("29184")) {
                  {}
                } else {
                  stryCov_9fa48("29184");
                  return null; // No application found
                }
              }
              throw new Error(stryMutAct_9fa48("29185") ? `` : (stryCov_9fa48("29185"), `HTTP error! status: ${response.status}`));
            }
          }
          return await response.json();
        }
      } catch (error) {
        if (stryMutAct_9fa48("29186")) {
          {}
        } else {
          stryCov_9fa48("29186");
          console.error(stryMutAct_9fa48("29187") ? "" : (stryCov_9fa48("29187"), 'Error fetching latest application by applicant ID:'), error);
          throw error;
        }
      }
    }
  }

  // Get all responses for an application
  async getApplicationResponses(applicationId) {
    if (stryMutAct_9fa48("29188")) {
      {}
    } else {
      stryCov_9fa48("29188");
      try {
        if (stryMutAct_9fa48("29189")) {
          {}
        } else {
          stryCov_9fa48("29189");
          // Use authenticated endpoint if we have a token, otherwise use anonymous
          const useAnonymous = stryMutAct_9fa48("29190") ? this.isAuthenticated() : (stryCov_9fa48("29190"), !this.isAuthenticated());
          const url = useAnonymous ? stryMutAct_9fa48("29191") ? `` : (stryCov_9fa48("29191"), `${API_BASE_URL}/applications/application/${applicationId}/responses/anonymous`) : stryMutAct_9fa48("29192") ? `` : (stryCov_9fa48("29192"), `${API_BASE_URL}/applications/${applicationId}/responses`);
          const headers = useAnonymous ? stryMutAct_9fa48("29193") ? {} : (stryCov_9fa48("29193"), {
            'Content-Type': stryMutAct_9fa48("29194") ? "" : (stryCov_9fa48("29194"), 'application/json')
          }) : this.getAuthHeaders();
          const response = await fetch(url, stryMutAct_9fa48("29195") ? {} : (stryCov_9fa48("29195"), {
            headers
          }));
          if (stryMutAct_9fa48("29198") ? false : stryMutAct_9fa48("29197") ? true : stryMutAct_9fa48("29196") ? response.ok : (stryCov_9fa48("29196", "29197", "29198"), !response.ok)) {
            if (stryMutAct_9fa48("29199")) {
              {}
            } else {
              stryCov_9fa48("29199");
              throw new Error(stryMutAct_9fa48("29200") ? `` : (stryCov_9fa48("29200"), `HTTP error! status: ${response.status}`));
            }
          }
          return await response.json();
        }
      } catch (error) {
        if (stryMutAct_9fa48("29201")) {
          {}
        } else {
          stryCov_9fa48("29201");
          console.error(stryMutAct_9fa48("29202") ? "" : (stryCov_9fa48("29202"), 'Error fetching application responses:'), error);
          throw error;
        }
      }
    }
  }

  // Load form data (transform responses back to form data format)
  async loadFormData(applicationId) {
    if (stryMutAct_9fa48("29203")) {
      {}
    } else {
      stryCov_9fa48("29203");
      try {
        if (stryMutAct_9fa48("29204")) {
          {}
        } else {
          stryCov_9fa48("29204");
          const responses = await this.getApplicationResponses(applicationId);
          const formData = {};
          responses.forEach(response => {
            if (stryMutAct_9fa48("29205")) {
              {}
            } else {
              stryCov_9fa48("29205");
              try {
                if (stryMutAct_9fa48("29206")) {
                  {}
                } else {
                  stryCov_9fa48("29206");
                  // Try to parse as JSON first (for arrays/objects)
                  formData[response.question_id] = JSON.parse(response.response_value);
                }
              } catch (e) {
                if (stryMutAct_9fa48("29207")) {
                  {}
                } else {
                  stryCov_9fa48("29207");
                  // If not JSON, use as string
                  formData[response.question_id] = response.response_value;
                }
              }
            }
          });
          return formData;
        }
      } catch (error) {
        if (stryMutAct_9fa48("29208")) {
          {}
        } else {
          stryCov_9fa48("29208");
          console.error(stryMutAct_9fa48("29209") ? "" : (stryCov_9fa48("29209"), 'Error loading form data:'), error);
          return {}; // Return empty object on error
        }
      }
    }
  }

  // Initialize application session (get or create applicant and application)
  async initializeApplication(email, firstName, lastName) {
    if (stryMutAct_9fa48("29210")) {
      {}
    } else {
      stryCov_9fa48("29210");
      try {
        if (stryMutAct_9fa48("29211")) {
          {}
        } else {
          stryCov_9fa48("29211");
          // Get or create applicant
          const applicant = await this.createOrGetApplicant(email, firstName, lastName);

          // Create new application for this session
          const application = await this.createApplication();
          return stryMutAct_9fa48("29212") ? {} : (stryCov_9fa48("29212"), {
            applicant,
            application
          });
        }
      } catch (error) {
        if (stryMutAct_9fa48("29213")) {
          {}
        } else {
          stryCov_9fa48("29213");
          console.error(stryMutAct_9fa48("29214") ? "" : (stryCov_9fa48("29214"), 'Error initializing application:'), error);
          throw error;
        }
      }
    }
  }

  // Get current session info
  getCurrentSession() {
    if (stryMutAct_9fa48("29215")) {
      {}
    } else {
      stryCov_9fa48("29215");
      return stryMutAct_9fa48("29216") ? {} : (stryCov_9fa48("29216"), {
        applicant: this.getCurrentApplicant(),
        application: this.currentApplication
      });
    }
  }

  // Check eligibility
  async checkEligibility(formData, applicantId) {
    if (stryMutAct_9fa48("29217")) {
      {}
    } else {
      stryCov_9fa48("29217");
      try {
        if (stryMutAct_9fa48("29218")) {
          {}
        } else {
          stryCov_9fa48("29218");
          const response = await fetch(stryMutAct_9fa48("29219") ? `` : (stryCov_9fa48("29219"), `${API_BASE_URL}/applications/check-eligibility`), stryMutAct_9fa48("29220") ? {} : (stryCov_9fa48("29220"), {
            method: stryMutAct_9fa48("29221") ? "" : (stryCov_9fa48("29221"), 'POST'),
            headers: stryMutAct_9fa48("29222") ? {} : (stryCov_9fa48("29222"), {
              'Content-Type': stryMutAct_9fa48("29223") ? "" : (stryCov_9fa48("29223"), 'application/json')
            }),
            body: JSON.stringify(stryMutAct_9fa48("29224") ? {} : (stryCov_9fa48("29224"), {
              formData,
              applicantId
            }))
          }));
          if (stryMutAct_9fa48("29227") ? false : stryMutAct_9fa48("29226") ? true : stryMutAct_9fa48("29225") ? response.ok : (stryCov_9fa48("29225", "29226", "29227"), !response.ok)) {
            if (stryMutAct_9fa48("29228")) {
              {}
            } else {
              stryCov_9fa48("29228");
              throw new Error(stryMutAct_9fa48("29229") ? `` : (stryCov_9fa48("29229"), `HTTP error! status: ${response.status}`));
            }
          }
          return await response.json();
        }
      } catch (error) {
        if (stryMutAct_9fa48("29230")) {
          {}
        } else {
          stryCov_9fa48("29230");
          console.error(stryMutAct_9fa48("29231") ? "" : (stryCov_9fa48("29231"), 'Error checking eligibility:'), error);
          throw error;
        }
      }
    }
  }

  // Reset eligibility status to allow editing
  async resetEligibility(applicantId) {
    if (stryMutAct_9fa48("29232")) {
      {}
    } else {
      stryCov_9fa48("29232");
      try {
        if (stryMutAct_9fa48("29233")) {
          {}
        } else {
          stryCov_9fa48("29233");
          const response = await fetch(stryMutAct_9fa48("29234") ? `` : (stryCov_9fa48("29234"), `${API_BASE_URL}/applications/reset-eligibility`), stryMutAct_9fa48("29235") ? {} : (stryCov_9fa48("29235"), {
            method: stryMutAct_9fa48("29236") ? "" : (stryCov_9fa48("29236"), 'POST'),
            headers: stryMutAct_9fa48("29237") ? {} : (stryCov_9fa48("29237"), {
              'Content-Type': stryMutAct_9fa48("29238") ? "" : (stryCov_9fa48("29238"), 'application/json')
            }),
            body: JSON.stringify(stryMutAct_9fa48("29239") ? {} : (stryCov_9fa48("29239"), {
              applicantId
            }))
          }));
          if (stryMutAct_9fa48("29242") ? false : stryMutAct_9fa48("29241") ? true : stryMutAct_9fa48("29240") ? response.ok : (stryCov_9fa48("29240", "29241", "29242"), !response.ok)) {
            if (stryMutAct_9fa48("29243")) {
              {}
            } else {
              stryCov_9fa48("29243");
              throw new Error(stryMutAct_9fa48("29244") ? `` : (stryCov_9fa48("29244"), `HTTP error! status: ${response.status}`));
            }
          }
          return await response.json();
        }
      } catch (error) {
        if (stryMutAct_9fa48("29245")) {
          {}
        } else {
          stryCov_9fa48("29245");
          console.error(stryMutAct_9fa48("29246") ? "" : (stryCov_9fa48("29246"), 'Error resetting eligibility:'), error);
          throw error;
        }
      }
    }
  }
}
export default new DatabaseService();