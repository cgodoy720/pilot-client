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
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pursuitLogoFull from '../../assets/logo-full.png';
import databaseService from '../../services/databaseService';
import './ApplicantDashboard.css';
const SECTION_CONFIG = stryMutAct_9fa48("9339") ? [] : (stryCov_9fa48("9339"), [stryMutAct_9fa48("9340") ? {} : (stryCov_9fa48("9340"), {
  key: stryMutAct_9fa48("9341") ? "" : (stryCov_9fa48("9341"), 'infoSession'),
  label: stryMutAct_9fa48("9342") ? "" : (stryCov_9fa48("9342"), 'Attend an Info Session'),
  description: stryMutAct_9fa48("9343") ? "" : (stryCov_9fa48("9343"), 'Please note that info session attendance, in addition to a completed application, is required to be considered for the AI Native Program. This is a great opportunity to learn more about the program and our community.'),
  statusOptions: stryMutAct_9fa48("9344") ? [] : (stryCov_9fa48("9344"), [stryMutAct_9fa48("9345") ? "" : (stryCov_9fa48("9345"), 'not signed-up'), stryMutAct_9fa48("9346") ? "" : (stryCov_9fa48("9346"), 'signed-up'), stryMutAct_9fa48("9347") ? "" : (stryCov_9fa48("9347"), 'attended')]),
  defaultStatus: stryMutAct_9fa48("9348") ? "" : (stryCov_9fa48("9348"), 'not signed-up'),
  getButtonLabel: status => {
    if (stryMutAct_9fa48("9349")) {
      {}
    } else {
      stryCov_9fa48("9349");
      if (stryMutAct_9fa48("9352") ? status !== 'not signed-up' : stryMutAct_9fa48("9351") ? false : stryMutAct_9fa48("9350") ? true : (stryCov_9fa48("9350", "9351", "9352"), status === (stryMutAct_9fa48("9353") ? "" : (stryCov_9fa48("9353"), 'not signed-up')))) return stryMutAct_9fa48("9354") ? "" : (stryCov_9fa48("9354"), 'Sign Up Here');
      if (stryMutAct_9fa48("9357") ? status !== 'signed-up' : stryMutAct_9fa48("9356") ? false : stryMutAct_9fa48("9355") ? true : (stryCov_9fa48("9355", "9356", "9357"), status === (stryMutAct_9fa48("9358") ? "" : (stryCov_9fa48("9358"), 'signed-up')))) return stryMutAct_9fa48("9359") ? "" : (stryCov_9fa48("9359"), 'Manage Registration');
      if (stryMutAct_9fa48("9362") ? status !== 'attended' : stryMutAct_9fa48("9361") ? false : stryMutAct_9fa48("9360") ? true : (stryCov_9fa48("9360", "9361", "9362"), status === (stryMutAct_9fa48("9363") ? "" : (stryCov_9fa48("9363"), 'attended')))) return stryMutAct_9fa48("9364") ? "" : (stryCov_9fa48("9364"), 'Completed');
      return stryMutAct_9fa48("9365") ? "" : (stryCov_9fa48("9365"), 'Sign Up Here');
    }
  },
  buttonEnabled: stryMutAct_9fa48("9366") ? () => undefined : (stryCov_9fa48("9366"), status => stryMutAct_9fa48("9369") ? status === 'attended' : stryMutAct_9fa48("9368") ? false : stryMutAct_9fa48("9367") ? true : (stryCov_9fa48("9367", "9368", "9369"), status !== (stryMutAct_9fa48("9370") ? "" : (stryCov_9fa48("9370"), 'attended'))))
}), stryMutAct_9fa48("9371") ? {} : (stryCov_9fa48("9371"), {
  key: stryMutAct_9fa48("9372") ? "" : (stryCov_9fa48("9372"), 'application'),
  label: stryMutAct_9fa48("9373") ? "" : (stryCov_9fa48("9373"), 'Complete your Application'),
  description: stryMutAct_9fa48("9374") ? "" : (stryCov_9fa48("9374"), 'Tell us about yourself and your background. Complete an exercise to learn more about AI.'),
  statusOptions: stryMutAct_9fa48("9375") ? [] : (stryCov_9fa48("9375"), [stryMutAct_9fa48("9376") ? "" : (stryCov_9fa48("9376"), 'not started'), stryMutAct_9fa48("9377") ? "" : (stryCov_9fa48("9377"), 'in process'), stryMutAct_9fa48("9378") ? "" : (stryCov_9fa48("9378"), 'submitted'), stryMutAct_9fa48("9379") ? "" : (stryCov_9fa48("9379"), 'ineligible')]),
  defaultStatus: stryMutAct_9fa48("9380") ? "" : (stryCov_9fa48("9380"), 'not started'),
  getButtonLabel: status => {
    if (stryMutAct_9fa48("9381")) {
      {}
    } else {
      stryCov_9fa48("9381");
      if (stryMutAct_9fa48("9384") ? status !== 'not started' : stryMutAct_9fa48("9383") ? false : stryMutAct_9fa48("9382") ? true : (stryCov_9fa48("9382", "9383", "9384"), status === (stryMutAct_9fa48("9385") ? "" : (stryCov_9fa48("9385"), 'not started')))) return stryMutAct_9fa48("9386") ? "" : (stryCov_9fa48("9386"), 'Apply');
      if (stryMutAct_9fa48("9389") ? status !== 'in process' : stryMutAct_9fa48("9388") ? false : stryMutAct_9fa48("9387") ? true : (stryCov_9fa48("9387", "9388", "9389"), status === (stryMutAct_9fa48("9390") ? "" : (stryCov_9fa48("9390"), 'in process')))) return stryMutAct_9fa48("9391") ? "" : (stryCov_9fa48("9391"), 'Continue Application');
      if (stryMutAct_9fa48("9394") ? status !== 'submitted' : stryMutAct_9fa48("9393") ? false : stryMutAct_9fa48("9392") ? true : (stryCov_9fa48("9392", "9393", "9394"), status === (stryMutAct_9fa48("9395") ? "" : (stryCov_9fa48("9395"), 'submitted')))) return stryMutAct_9fa48("9396") ? "" : (stryCov_9fa48("9396"), '✓ Successfully Applied');
      if (stryMutAct_9fa48("9399") ? status !== 'ineligible' : stryMutAct_9fa48("9398") ? false : stryMutAct_9fa48("9397") ? true : (stryCov_9fa48("9397", "9398", "9399"), status === (stryMutAct_9fa48("9400") ? "" : (stryCov_9fa48("9400"), 'ineligible')))) return stryMutAct_9fa48("9401") ? "" : (stryCov_9fa48("9401"), 'Not Eligible');
      return stryMutAct_9fa48("9402") ? "" : (stryCov_9fa48("9402"), 'Apply');
    }
  },
  buttonEnabled: stryMutAct_9fa48("9403") ? () => undefined : (stryCov_9fa48("9403"), status => stryMutAct_9fa48("9406") ? status !== 'submitted' || status !== 'ineligible' : stryMutAct_9fa48("9405") ? false : stryMutAct_9fa48("9404") ? true : (stryCov_9fa48("9404", "9405", "9406"), (stryMutAct_9fa48("9408") ? status === 'submitted' : stryMutAct_9fa48("9407") ? true : (stryCov_9fa48("9407", "9408"), status !== (stryMutAct_9fa48("9409") ? "" : (stryCov_9fa48("9409"), 'submitted')))) && (stryMutAct_9fa48("9411") ? status === 'ineligible' : stryMutAct_9fa48("9410") ? true : (stryCov_9fa48("9410", "9411"), status !== (stryMutAct_9fa48("9412") ? "" : (stryCov_9fa48("9412"), 'ineligible'))))))
}), stryMutAct_9fa48("9413") ? {} : (stryCov_9fa48("9413"), {
  key: stryMutAct_9fa48("9414") ? "" : (stryCov_9fa48("9414"), 'workshop'),
  label: stryMutAct_9fa48("9415") ? "" : (stryCov_9fa48("9415"), 'Complete a Workshop'),
  description: stryMutAct_9fa48("9416") ? "" : (stryCov_9fa48("9416"), 'Get introduced to AI and experience a day in the life of a Builder.'),
  statusOptions: stryMutAct_9fa48("9417") ? [] : (stryCov_9fa48("9417"), [stryMutAct_9fa48("9418") ? "" : (stryCov_9fa48("9418"), 'locked'), stryMutAct_9fa48("9419") ? "" : (stryCov_9fa48("9419"), 'not signed-up'), stryMutAct_9fa48("9420") ? "" : (stryCov_9fa48("9420"), 'signed-up'), stryMutAct_9fa48("9421") ? "" : (stryCov_9fa48("9421"), 'attended')]),
  defaultStatus: stryMutAct_9fa48("9422") ? "" : (stryCov_9fa48("9422"), 'locked'),
  getButtonLabel: status => {
    if (stryMutAct_9fa48("9423")) {
      {}
    } else {
      stryCov_9fa48("9423");
      if (stryMutAct_9fa48("9426") ? status !== 'locked' : stryMutAct_9fa48("9425") ? false : stryMutAct_9fa48("9424") ? true : (stryCov_9fa48("9424", "9425", "9426"), status === (stryMutAct_9fa48("9427") ? "" : (stryCov_9fa48("9427"), 'locked')))) return stryMutAct_9fa48("9428") ? "" : (stryCov_9fa48("9428"), 'Invitation Required');
      if (stryMutAct_9fa48("9431") ? status !== 'not signed-up' : stryMutAct_9fa48("9430") ? false : stryMutAct_9fa48("9429") ? true : (stryCov_9fa48("9429", "9430", "9431"), status === (stryMutAct_9fa48("9432") ? "" : (stryCov_9fa48("9432"), 'not signed-up')))) return stryMutAct_9fa48("9433") ? "" : (stryCov_9fa48("9433"), 'Sign Up Here');
      if (stryMutAct_9fa48("9436") ? status !== 'signed-up' : stryMutAct_9fa48("9435") ? false : stryMutAct_9fa48("9434") ? true : (stryCov_9fa48("9434", "9435", "9436"), status === (stryMutAct_9fa48("9437") ? "" : (stryCov_9fa48("9437"), 'signed-up')))) return stryMutAct_9fa48("9438") ? "" : (stryCov_9fa48("9438"), 'Manage Registration');
      if (stryMutAct_9fa48("9441") ? status !== 'attended' : stryMutAct_9fa48("9440") ? false : stryMutAct_9fa48("9439") ? true : (stryCov_9fa48("9439", "9440", "9441"), status === (stryMutAct_9fa48("9442") ? "" : (stryCov_9fa48("9442"), 'attended')))) return stryMutAct_9fa48("9443") ? "" : (stryCov_9fa48("9443"), 'Completed');
      return stryMutAct_9fa48("9444") ? "" : (stryCov_9fa48("9444"), 'Sign Up Here');
    }
  },
  buttonEnabled: (status, applicationStatus) => {
    if (stryMutAct_9fa48("9445")) {
      {}
    } else {
      stryCov_9fa48("9445");
      // Enable button if not locked and not attended
      return stryMutAct_9fa48("9448") ? status !== 'locked' || status !== 'attended' : stryMutAct_9fa48("9447") ? false : stryMutAct_9fa48("9446") ? true : (stryCov_9fa48("9446", "9447", "9448"), (stryMutAct_9fa48("9450") ? status === 'locked' : stryMutAct_9fa48("9449") ? true : (stryCov_9fa48("9449", "9450"), status !== (stryMutAct_9fa48("9451") ? "" : (stryCov_9fa48("9451"), 'locked')))) && (stryMutAct_9fa48("9453") ? status === 'attended' : stryMutAct_9fa48("9452") ? true : (stryCov_9fa48("9452", "9453"), status !== (stryMutAct_9fa48("9454") ? "" : (stryCov_9fa48("9454"), 'attended')))));
    }
  },
  lockedLabel: stryMutAct_9fa48("9455") ? "" : (stryCov_9fa48("9455"), 'Invitation Required')
}), stryMutAct_9fa48("9456") ? {} : (stryCov_9fa48("9456"), {
  key: stryMutAct_9fa48("9457") ? "" : (stryCov_9fa48("9457"), 'pledge'),
  label: stryMutAct_9fa48("9458") ? "" : (stryCov_9fa48("9458"), 'Complete your Pledge'),
  description: stryMutAct_9fa48("9459") ? "" : (stryCov_9fa48("9459"), 'Commit to the program expectations'),
  statusOptions: stryMutAct_9fa48("9460") ? [] : (stryCov_9fa48("9460"), [stryMutAct_9fa48("9461") ? "" : (stryCov_9fa48("9461"), 'locked'), stryMutAct_9fa48("9462") ? "" : (stryCov_9fa48("9462"), 'not completed'), stryMutAct_9fa48("9463") ? "" : (stryCov_9fa48("9463"), 'completed')]),
  defaultStatus: stryMutAct_9fa48("9464") ? "" : (stryCov_9fa48("9464"), 'locked'),
  getButtonLabel: status => {
    if (stryMutAct_9fa48("9465")) {
      {}
    } else {
      stryCov_9fa48("9465");
      if (stryMutAct_9fa48("9468") ? status !== 'locked' : stryMutAct_9fa48("9467") ? false : stryMutAct_9fa48("9466") ? true : (stryCov_9fa48("9466", "9467", "9468"), status === (stryMutAct_9fa48("9469") ? "" : (stryCov_9fa48("9469"), 'locked')))) return stryMutAct_9fa48("9470") ? "" : (stryCov_9fa48("9470"), 'Workshop Required');
      if (stryMutAct_9fa48("9473") ? status !== 'not completed' : stryMutAct_9fa48("9472") ? false : stryMutAct_9fa48("9471") ? true : (stryCov_9fa48("9471", "9472", "9473"), status === (stryMutAct_9fa48("9474") ? "" : (stryCov_9fa48("9474"), 'not completed')))) return stryMutAct_9fa48("9475") ? "" : (stryCov_9fa48("9475"), 'Make Pledge');
      if (stryMutAct_9fa48("9478") ? status !== 'completed' : stryMutAct_9fa48("9477") ? false : stryMutAct_9fa48("9476") ? true : (stryCov_9fa48("9476", "9477", "9478"), status === (stryMutAct_9fa48("9479") ? "" : (stryCov_9fa48("9479"), 'completed')))) return stryMutAct_9fa48("9480") ? "" : (stryCov_9fa48("9480"), 'Pledge Completed');
      return stryMutAct_9fa48("9481") ? "" : (stryCov_9fa48("9481"), 'Make Pledge');
    }
  },
  buttonEnabled: stryMutAct_9fa48("9482") ? () => undefined : (stryCov_9fa48("9482"), status => stryMutAct_9fa48("9485") ? status !== 'not completed' : stryMutAct_9fa48("9484") ? false : stryMutAct_9fa48("9483") ? true : (stryCov_9fa48("9483", "9484", "9485"), status === (stryMutAct_9fa48("9486") ? "" : (stryCov_9fa48("9486"), 'not completed')))),
  lockedLabel: stryMutAct_9fa48("9487") ? "" : (stryCov_9fa48("9487"), 'Program Admission Required')
})]);
function ApplicantDashboard() {
  if (stryMutAct_9fa48("9488")) {
    {}
  } else {
    stryCov_9fa48("9488");
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [currentApplicantId, setCurrentApplicantId] = useState(null);
    const [statuses, setStatuses] = useState(stryMutAct_9fa48("9489") ? {} : (stryCov_9fa48("9489"), {
      infoSession: stryMutAct_9fa48("9490") ? "" : (stryCov_9fa48("9490"), 'not signed-up'),
      application: stryMutAct_9fa48("9491") ? "" : (stryCov_9fa48("9491"), 'not started'),
      workshop: stryMutAct_9fa48("9492") ? "" : (stryCov_9fa48("9492"), 'locked'),
      pledge: stryMutAct_9fa48("9493") ? "" : (stryCov_9fa48("9493"), 'locked')
    }));
    const [sessionDetails, setSessionDetails] = useState(null);
    const [workshopDetails, setWorkshopDetails] = useState(null);
    const [applicationProgress, setApplicationProgress] = useState(null);
    const [isLoading, setIsLoading] = useState(stryMutAct_9fa48("9494") ? false : (stryCov_9fa48("9494"), true));

    // Load user data from localStorage on mount
    useEffect(() => {
      if (stryMutAct_9fa48("9495")) {
        {}
      } else {
        stryCov_9fa48("9495");
        const savedUser = localStorage.getItem(stryMutAct_9fa48("9496") ? "" : (stryCov_9fa48("9496"), 'user'));
        if (stryMutAct_9fa48("9498") ? false : stryMutAct_9fa48("9497") ? true : (stryCov_9fa48("9497", "9498"), savedUser)) {
          if (stryMutAct_9fa48("9499")) {
            {}
          } else {
            stryCov_9fa48("9499");
            const userData = JSON.parse(savedUser);
            setUser(userData);

            // Clear any old localStorage status data to prevent cross-account confusion
            // The dashboard now loads fresh data from the database for each user
            console.log(stryMutAct_9fa48("9500") ? "" : (stryCov_9fa48("9500"), 'Dashboard: Clearing old localStorage status data'));
          }
        } else {
          if (stryMutAct_9fa48("9501")) {
            {}
          } else {
            stryCov_9fa48("9501");
            // Redirect to login if no user data
            navigate(stryMutAct_9fa48("9502") ? "" : (stryCov_9fa48("9502"), '/login'));
          }
        }
      }
    }, stryMutAct_9fa48("9503") ? [] : (stryCov_9fa48("9503"), [navigate]));

    // Load current applicant ID when user is set
    useEffect(() => {
      if (stryMutAct_9fa48("9504")) {
        {}
      } else {
        stryCov_9fa48("9504");
        const loadApplicantId = async () => {
          if (stryMutAct_9fa48("9505")) {
            {}
          } else {
            stryCov_9fa48("9505");
            if (stryMutAct_9fa48("9508") ? false : stryMutAct_9fa48("9507") ? true : stryMutAct_9fa48("9506") ? user?.email : (stryCov_9fa48("9506", "9507", "9508"), !(stryMutAct_9fa48("9509") ? user.email : (stryCov_9fa48("9509"), user?.email)))) return;
            try {
              if (stryMutAct_9fa48("9510")) {
                {}
              } else {
                stryCov_9fa48("9510");
                console.log(stryMutAct_9fa48("9511") ? "" : (stryCov_9fa48("9511"), 'Loading applicant ID for dashboard:'), user.email);
                const response = await fetch(stryMutAct_9fa48("9512") ? `` : (stryCov_9fa48("9512"), `${import.meta.env.VITE_API_URL}/api/applications/applicant/by-email/${user.email}`));
                if (stryMutAct_9fa48("9514") ? false : stryMutAct_9fa48("9513") ? true : (stryCov_9fa48("9513", "9514"), response.ok)) {
                  if (stryMutAct_9fa48("9515")) {
                    {}
                  } else {
                    stryCov_9fa48("9515");
                    const applicant = await response.json();
                    setCurrentApplicantId(applicant.applicant_id);
                    console.log(stryMutAct_9fa48("9516") ? "" : (stryCov_9fa48("9516"), 'Dashboard loaded applicant ID:'), applicant.applicant_id);
                  }
                } else {
                  if (stryMutAct_9fa48("9517")) {
                    {}
                  } else {
                    stryCov_9fa48("9517");
                    console.warn(stryMutAct_9fa48("9518") ? "" : (stryCov_9fa48("9518"), 'Could not load applicant ID for dashboard'));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("9519")) {
                {}
              } else {
                stryCov_9fa48("9519");
                console.error(stryMutAct_9fa48("9520") ? "" : (stryCov_9fa48("9520"), 'Error loading applicant ID for dashboard:'), error);
              }
            }
          }
        };
        if (stryMutAct_9fa48("9522") ? false : stryMutAct_9fa48("9521") ? true : (stryCov_9fa48("9521", "9522"), user)) {
          if (stryMutAct_9fa48("9523")) {
            {}
          } else {
            stryCov_9fa48("9523");
            loadApplicantId();
          }
        }
      }
    }, stryMutAct_9fa48("9524") ? [] : (stryCov_9fa48("9524"), [user]));

    // Load real data from database when applicant ID is available
    useEffect(() => {
      if (stryMutAct_9fa48("9525")) {
        {}
      } else {
        stryCov_9fa48("9525");
        const loadDashboardData = async () => {
          if (stryMutAct_9fa48("9526")) {
            {}
          } else {
            stryCov_9fa48("9526");
            if (stryMutAct_9fa48("9529") ? false : stryMutAct_9fa48("9528") ? true : stryMutAct_9fa48("9527") ? currentApplicantId : (stryCov_9fa48("9527", "9528", "9529"), !currentApplicantId)) return;
            console.log(stryMutAct_9fa48("9530") ? "" : (stryCov_9fa48("9530"), 'Loading dashboard data for applicant:'), currentApplicantId);
            setIsLoading(stryMutAct_9fa48("9531") ? false : (stryCov_9fa48("9531"), true));
            try {
              if (stryMutAct_9fa48("9532")) {
                {}
              } else {
                stryCov_9fa48("9532");
                // Load info session status
                await loadInfoSessionStatus();

                // Load application status
                await loadApplicationStatus();

                // Load workshop status
                await loadWorkshopStatus();

                // Load pledge status (placeholder for now)
                await loadPledgeStatus();
              }
            } catch (error) {
              if (stryMutAct_9fa48("9533")) {
                {}
              } else {
                stryCov_9fa48("9533");
                console.error(stryMutAct_9fa48("9534") ? "" : (stryCov_9fa48("9534"), 'Error loading dashboard data:'), error);
              }
            } finally {
              if (stryMutAct_9fa48("9535")) {
                {}
              } else {
                stryCov_9fa48("9535");
                setIsLoading(stryMutAct_9fa48("9536") ? true : (stryCov_9fa48("9536"), false));
              }
            }
          }
        };
        if (stryMutAct_9fa48("9538") ? false : stryMutAct_9fa48("9537") ? true : (stryCov_9fa48("9537", "9538"), currentApplicantId)) {
          if (stryMutAct_9fa48("9539")) {
            {}
          } else {
            stryCov_9fa48("9539");
            loadDashboardData();
          }
        }
      }
    }, stryMutAct_9fa48("9540") ? [] : (stryCov_9fa48("9540"), [currentApplicantId]));
    const loadInfoSessionStatus = async () => {
      if (stryMutAct_9fa48("9541")) {
        {}
      } else {
        stryCov_9fa48("9541");
        try {
          if (stryMutAct_9fa48("9542")) {
            {}
          } else {
            stryCov_9fa48("9542");
            const response = await fetch(stryMutAct_9fa48("9543") ? `` : (stryCov_9fa48("9543"), `${import.meta.env.VITE_API_URL}/api/info-sessions`));
            if (stryMutAct_9fa48("9546") ? false : stryMutAct_9fa48("9545") ? true : stryMutAct_9fa48("9544") ? response.ok : (stryCov_9fa48("9544", "9545", "9546"), !response.ok)) return;
            const events = await response.json();
            let foundRegistration = null;
            let registeredEvent = null;
            let hasAttendedSession = stryMutAct_9fa48("9547") ? true : (stryCov_9fa48("9547"), false);

            // First check if the user has attended any info session
            for (const event of events) {
              if (stryMutAct_9fa48("9548")) {
                {}
              } else {
                stryCov_9fa48("9548");
                const registrations = stryMutAct_9fa48("9551") ? event.registrations && [] : stryMutAct_9fa48("9550") ? false : stryMutAct_9fa48("9549") ? true : (stryCov_9fa48("9549", "9550", "9551"), event.registrations || (stryMutAct_9fa48("9552") ? ["Stryker was here"] : (stryCov_9fa48("9552"), [])));
                const attendedRegistration = registrations.find(stryMutAct_9fa48("9553") ? () => undefined : (stryCov_9fa48("9553"), reg => stryMutAct_9fa48("9556") ? reg.applicant_id === currentApplicantId || reg.status === 'attended' || reg.status === 'attended_late' || reg.status === 'very_late' : stryMutAct_9fa48("9555") ? false : stryMutAct_9fa48("9554") ? true : (stryCov_9fa48("9554", "9555", "9556"), (stryMutAct_9fa48("9558") ? reg.applicant_id !== currentApplicantId : stryMutAct_9fa48("9557") ? true : (stryCov_9fa48("9557", "9558"), reg.applicant_id === currentApplicantId)) && (stryMutAct_9fa48("9560") ? (reg.status === 'attended' || reg.status === 'attended_late') && reg.status === 'very_late' : stryMutAct_9fa48("9559") ? true : (stryCov_9fa48("9559", "9560"), (stryMutAct_9fa48("9562") ? reg.status === 'attended' && reg.status === 'attended_late' : stryMutAct_9fa48("9561") ? false : (stryCov_9fa48("9561", "9562"), (stryMutAct_9fa48("9564") ? reg.status !== 'attended' : stryMutAct_9fa48("9563") ? false : (stryCov_9fa48("9563", "9564"), reg.status === (stryMutAct_9fa48("9565") ? "" : (stryCov_9fa48("9565"), 'attended')))) || (stryMutAct_9fa48("9567") ? reg.status !== 'attended_late' : stryMutAct_9fa48("9566") ? false : (stryCov_9fa48("9566", "9567"), reg.status === (stryMutAct_9fa48("9568") ? "" : (stryCov_9fa48("9568"), 'attended_late')))))) || (stryMutAct_9fa48("9570") ? reg.status !== 'very_late' : stryMutAct_9fa48("9569") ? false : (stryCov_9fa48("9569", "9570"), reg.status === (stryMutAct_9fa48("9571") ? "" : (stryCov_9fa48("9571"), 'very_late')))))))));
                if (stryMutAct_9fa48("9573") ? false : stryMutAct_9fa48("9572") ? true : (stryCov_9fa48("9572", "9573"), attendedRegistration)) {
                  if (stryMutAct_9fa48("9574")) {
                    {}
                  } else {
                    stryCov_9fa48("9574");
                    foundRegistration = attendedRegistration;
                    registeredEvent = event;
                    hasAttendedSession = stryMutAct_9fa48("9575") ? false : (stryCov_9fa48("9575"), true);
                    console.log(stryMutAct_9fa48("9576") ? "" : (stryCov_9fa48("9576"), 'Dashboard: Found attended info session'), attendedRegistration);
                    break;
                  }
                }
              }
            }

            // If no attended session found, check for registered sessions
            if (stryMutAct_9fa48("9579") ? false : stryMutAct_9fa48("9578") ? true : stryMutAct_9fa48("9577") ? hasAttendedSession : (stryCov_9fa48("9577", "9578", "9579"), !hasAttendedSession)) {
              if (stryMutAct_9fa48("9580")) {
                {}
              } else {
                stryCov_9fa48("9580");
                for (const event of events) {
                  if (stryMutAct_9fa48("9581")) {
                    {}
                  } else {
                    stryCov_9fa48("9581");
                    const registrations = stryMutAct_9fa48("9584") ? event.registrations && [] : stryMutAct_9fa48("9583") ? false : stryMutAct_9fa48("9582") ? true : (stryCov_9fa48("9582", "9583", "9584"), event.registrations || (stryMutAct_9fa48("9585") ? ["Stryker was here"] : (stryCov_9fa48("9585"), [])));
                    const userRegistration = registrations.find(stryMutAct_9fa48("9586") ? () => undefined : (stryCov_9fa48("9586"), reg => stryMutAct_9fa48("9589") ? reg.applicant_id === currentApplicantId || reg.status === 'registered' : stryMutAct_9fa48("9588") ? false : stryMutAct_9fa48("9587") ? true : (stryCov_9fa48("9587", "9588", "9589"), (stryMutAct_9fa48("9591") ? reg.applicant_id !== currentApplicantId : stryMutAct_9fa48("9590") ? true : (stryCov_9fa48("9590", "9591"), reg.applicant_id === currentApplicantId)) && (stryMutAct_9fa48("9593") ? reg.status !== 'registered' : stryMutAct_9fa48("9592") ? true : (stryCov_9fa48("9592", "9593"), reg.status === (stryMutAct_9fa48("9594") ? "" : (stryCov_9fa48("9594"), 'registered')))))));
                    if (stryMutAct_9fa48("9596") ? false : stryMutAct_9fa48("9595") ? true : (stryCov_9fa48("9595", "9596"), userRegistration)) {
                      if (stryMutAct_9fa48("9597")) {
                        {}
                      } else {
                        stryCov_9fa48("9597");
                        foundRegistration = userRegistration;
                        registeredEvent = event;
                        break;
                      }
                    }
                  }
                }
              }
            }
            if (stryMutAct_9fa48("9600") ? foundRegistration || registeredEvent : stryMutAct_9fa48("9599") ? false : stryMutAct_9fa48("9598") ? true : (stryCov_9fa48("9598", "9599", "9600"), foundRegistration && registeredEvent)) {
              if (stryMutAct_9fa48("9601")) {
                {}
              } else {
                stryCov_9fa48("9601");
                // Treat database time as Eastern Time (extract UTC components and use as Eastern)
                const dbDate = new Date(registeredEvent.start_time);
                const year = dbDate.getUTCFullYear();
                const month = dbDate.getUTCMonth();
                const day = dbDate.getUTCDate();
                const hour = dbDate.getUTCHours();
                const minute = dbDate.getUTCMinutes();
                const easternDate = new Date(year, month, day, hour, minute);
                const eventDetails = stryMutAct_9fa48("9602") ? {} : (stryCov_9fa48("9602"), {
                  date: easternDate.toLocaleDateString(stryMutAct_9fa48("9603") ? "" : (stryCov_9fa48("9603"), 'en-US'), stryMutAct_9fa48("9604") ? {} : (stryCov_9fa48("9604"), {
                    month: stryMutAct_9fa48("9605") ? "" : (stryCov_9fa48("9605"), 'long'),
                    day: stryMutAct_9fa48("9606") ? "" : (stryCov_9fa48("9606"), 'numeric'),
                    year: stryMutAct_9fa48("9607") ? "" : (stryCov_9fa48("9607"), 'numeric')
                  })),
                  time: easternDate.toLocaleTimeString(stryMutAct_9fa48("9608") ? "" : (stryCov_9fa48("9608"), 'en-US'), stryMutAct_9fa48("9609") ? {} : (stryCov_9fa48("9609"), {
                    hour: stryMutAct_9fa48("9610") ? "" : (stryCov_9fa48("9610"), 'numeric'),
                    minute: stryMutAct_9fa48("9611") ? "" : (stryCov_9fa48("9611"), '2-digit')
                  })),
                  location: registeredEvent.location
                });

                // Set status based on whether they've attended or just registered
                setStatuses(stryMutAct_9fa48("9612") ? () => undefined : (stryCov_9fa48("9612"), prev => stryMutAct_9fa48("9613") ? {} : (stryCov_9fa48("9613"), {
                  ...prev,
                  infoSession: hasAttendedSession ? stryMutAct_9fa48("9614") ? "" : (stryCov_9fa48("9614"), 'attended') : stryMutAct_9fa48("9615") ? "" : (stryCov_9fa48("9615"), 'signed-up')
                })));
                setSessionDetails(eventDetails);
                console.log(stryMutAct_9fa48("9616") ? `` : (stryCov_9fa48("9616"), `Dashboard: Found info session ${hasAttendedSession ? stryMutAct_9fa48("9617") ? "" : (stryCov_9fa48("9617"), 'attendance') : stryMutAct_9fa48("9618") ? "" : (stryCov_9fa48("9618"), 'registration')}`), eventDetails);
              }
            } else {
              if (stryMutAct_9fa48("9619")) {
                {}
              } else {
                stryCov_9fa48("9619");
                setStatuses(stryMutAct_9fa48("9620") ? () => undefined : (stryCov_9fa48("9620"), prev => stryMutAct_9fa48("9621") ? {} : (stryCov_9fa48("9621"), {
                  ...prev,
                  infoSession: stryMutAct_9fa48("9622") ? "" : (stryCov_9fa48("9622"), 'not signed-up')
                })));
                setSessionDetails(null);
                console.log(stryMutAct_9fa48("9623") ? "" : (stryCov_9fa48("9623"), 'Dashboard: No info session registration found'));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("9624")) {
            {}
          } else {
            stryCov_9fa48("9624");
            console.error(stryMutAct_9fa48("9625") ? "" : (stryCov_9fa48("9625"), 'Error loading info session status for dashboard:'), error);
          }
        }
      }
    };
    const loadApplicationStatus = async () => {
      if (stryMutAct_9fa48("9626")) {
        {}
      } else {
        stryCov_9fa48("9626");
        try {
          if (stryMutAct_9fa48("9627")) {
            {}
          } else {
            stryCov_9fa48("9627");
            console.log(stryMutAct_9fa48("9628") ? "" : (stryCov_9fa48("9628"), 'Dashboard: Loading application status for user:'), user.email);
            const applicant = await databaseService.createOrGetApplicant(user.email, stryMutAct_9fa48("9631") ? user.firstName && user.first_name : stryMutAct_9fa48("9630") ? false : stryMutAct_9fa48("9629") ? true : (stryCov_9fa48("9629", "9630", "9631"), user.firstName || user.first_name), stryMutAct_9fa48("9634") ? user.lastName && user.last_name : stryMutAct_9fa48("9633") ? false : stryMutAct_9fa48("9632") ? true : (stryCov_9fa48("9632", "9633", "9634"), user.lastName || user.last_name));
            console.log(stryMutAct_9fa48("9635") ? "" : (stryCov_9fa48("9635"), 'Dashboard: Applicant data:'), applicant);
            const application = await databaseService.getLatestApplicationByApplicantId(applicant.applicant_id);
            console.log(stryMutAct_9fa48("9636") ? "" : (stryCov_9fa48("9636"), 'Dashboard: Application data:'), application);
            if (stryMutAct_9fa48("9639") ? false : stryMutAct_9fa48("9638") ? true : stryMutAct_9fa48("9637") ? application : (stryCov_9fa48("9637", "9638", "9639"), !application)) {
              if (stryMutAct_9fa48("9640")) {
                {}
              } else {
                stryCov_9fa48("9640");
                setStatuses(stryMutAct_9fa48("9641") ? () => undefined : (stryCov_9fa48("9641"), prev => stryMutAct_9fa48("9642") ? {} : (stryCov_9fa48("9642"), {
                  ...prev,
                  application: stryMutAct_9fa48("9643") ? "" : (stryCov_9fa48("9643"), 'not started')
                })));
                setApplicationProgress(null);
                console.log(stryMutAct_9fa48("9644") ? "" : (stryCov_9fa48("9644"), 'Dashboard: No application found for applicant ID:'), applicant.applicant_id);
                return;
              }
            }
            console.log(stryMutAct_9fa48("9645") ? "" : (stryCov_9fa48("9645"), 'Dashboard: Application found:'), application.status, stryMutAct_9fa48("9646") ? "" : (stryCov_9fa48("9646"), 'ID:'), application.application_id);
            if (stryMutAct_9fa48("9649") ? application.status !== 'ineligible' : stryMutAct_9fa48("9648") ? false : stryMutAct_9fa48("9647") ? true : (stryCov_9fa48("9647", "9648", "9649"), application.status === (stryMutAct_9fa48("9650") ? "" : (stryCov_9fa48("9650"), 'ineligible')))) {
              if (stryMutAct_9fa48("9651")) {
                {}
              } else {
                stryCov_9fa48("9651");
                setStatuses(stryMutAct_9fa48("9652") ? () => undefined : (stryCov_9fa48("9652"), prev => stryMutAct_9fa48("9653") ? {} : (stryCov_9fa48("9653"), {
                  ...prev,
                  application: stryMutAct_9fa48("9654") ? "" : (stryCov_9fa48("9654"), 'ineligible')
                })));
                setApplicationProgress(null);
                console.log(stryMutAct_9fa48("9655") ? "" : (stryCov_9fa48("9655"), 'Dashboard: Application is ineligible'));
              }
            } else if (stryMutAct_9fa48("9658") ? application.status !== 'submitted' : stryMutAct_9fa48("9657") ? false : stryMutAct_9fa48("9656") ? true : (stryCov_9fa48("9656", "9657", "9658"), application.status === (stryMutAct_9fa48("9659") ? "" : (stryCov_9fa48("9659"), 'submitted')))) {
              if (stryMutAct_9fa48("9660")) {
                {}
              } else {
                stryCov_9fa48("9660");
                setStatuses(stryMutAct_9fa48("9661") ? () => undefined : (stryCov_9fa48("9661"), prev => stryMutAct_9fa48("9662") ? {} : (stryCov_9fa48("9662"), {
                  ...prev,
                  application: stryMutAct_9fa48("9663") ? "" : (stryCov_9fa48("9663"), 'submitted')
                })));
                setApplicationProgress(null);
                console.log(stryMutAct_9fa48("9664") ? "" : (stryCov_9fa48("9664"), 'Dashboard: Application is submitted'));
              }
            } else {
              if (stryMutAct_9fa48("9665")) {
                {}
              } else {
                stryCov_9fa48("9665");
                // Check if there's progress
                const responses = await databaseService.getApplicationResponses(application.application_id);
                console.log(stryMutAct_9fa48("9666") ? "" : (stryCov_9fa48("9666"), 'Dashboard: Application responses:'), stryMutAct_9fa48("9669") ? responses?.length && 0 : stryMutAct_9fa48("9668") ? false : stryMutAct_9fa48("9667") ? true : (stryCov_9fa48("9667", "9668", "9669"), (stryMutAct_9fa48("9670") ? responses.length : (stryCov_9fa48("9670"), responses?.length)) || 0));

                // Check localStorage for current section progress
                const currentSection = localStorage.getItem(stryMutAct_9fa48("9671") ? "" : (stryCov_9fa48("9671"), 'applicationCurrentSection'));
                const formData = localStorage.getItem(stryMutAct_9fa48("9672") ? "" : (stryCov_9fa48("9672"), 'applicationFormData'));
                const applicationStatus = localStorage.getItem(stryMutAct_9fa48("9673") ? "" : (stryCov_9fa48("9673"), 'applicationStatus'));
                console.log(stryMutAct_9fa48("9674") ? "" : (stryCov_9fa48("9674"), 'Dashboard: Current section from localStorage:'), currentSection);
                console.log(stryMutAct_9fa48("9675") ? "" : (stryCov_9fa48("9675"), 'Dashboard: Form data in localStorage:'), formData ? stryMutAct_9fa48("9676") ? "" : (stryCov_9fa48("9676"), 'exists') : stryMutAct_9fa48("9677") ? "" : (stryCov_9fa48("9677"), 'not found'));
                console.log(stryMutAct_9fa48("9678") ? "" : (stryCov_9fa48("9678"), 'Dashboard: Application status in localStorage:'), applicationStatus);
                if (stryMutAct_9fa48("9681") ? responses || responses.length > 0 : stryMutAct_9fa48("9680") ? false : stryMutAct_9fa48("9679") ? true : (stryCov_9fa48("9679", "9680", "9681"), responses && (stryMutAct_9fa48("9684") ? responses.length <= 0 : stryMutAct_9fa48("9683") ? responses.length >= 0 : stryMutAct_9fa48("9682") ? true : (stryCov_9fa48("9682", "9683", "9684"), responses.length > 0)))) {
                  if (stryMutAct_9fa48("9685")) {
                    {}
                  } else {
                    stryCov_9fa48("9685");
                    setStatuses(stryMutAct_9fa48("9686") ? () => undefined : (stryCov_9fa48("9686"), prev => stryMutAct_9fa48("9687") ? {} : (stryCov_9fa48("9687"), {
                      ...prev,
                      application: stryMutAct_9fa48("9688") ? "" : (stryCov_9fa48("9688"), 'in process')
                    })));

                    // Calculate progress
                    let completedSections = 0;
                    if (stryMutAct_9fa48("9691") ? currentSection === null : stryMutAct_9fa48("9690") ? false : stryMutAct_9fa48("9689") ? true : (stryCov_9fa48("9689", "9690", "9691"), currentSection !== null)) {
                      if (stryMutAct_9fa48("9692")) {
                        {}
                      } else {
                        stryCov_9fa48("9692");
                        completedSections = stryMutAct_9fa48("9693") ? parseInt(currentSection, 10) - 1 : (stryCov_9fa48("9693"), parseInt(currentSection, 10) + 1);
                      }
                    } else {
                      if (stryMutAct_9fa48("9694")) {
                        {}
                      } else {
                        stryCov_9fa48("9694");
                        // Fallback: estimate based on responses
                        completedSections = stryMutAct_9fa48("9695") ? Math.max(Math.ceil(responses.length / 5), 5) : (stryCov_9fa48("9695"), Math.min(Math.ceil(stryMutAct_9fa48("9696") ? responses.length * 5 : (stryCov_9fa48("9696"), responses.length / 5)), 5));
                      }
                    }
                    setApplicationProgress(stryMutAct_9fa48("9697") ? {} : (stryCov_9fa48("9697"), {
                      completedSections,
                      totalSections: 5
                    }));
                    console.log(stryMutAct_9fa48("9698") ? "" : (stryCov_9fa48("9698"), 'Dashboard: Application in process with progress:'), completedSections + (stryMutAct_9fa48("9699") ? "" : (stryCov_9fa48("9699"), '/5')));
                  }
                } else if (stryMutAct_9fa48("9702") ? currentSection === null : stryMutAct_9fa48("9701") ? false : stryMutAct_9fa48("9700") ? true : (stryCov_9fa48("9700", "9701", "9702"), currentSection !== null)) {
                  if (stryMutAct_9fa48("9703")) {
                    {}
                  } else {
                    stryCov_9fa48("9703");
                    // Even if no responses in DB, if localStorage shows progress, show in process
                    setStatuses(stryMutAct_9fa48("9704") ? () => undefined : (stryCov_9fa48("9704"), prev => stryMutAct_9fa48("9705") ? {} : (stryCov_9fa48("9705"), {
                      ...prev,
                      application: stryMutAct_9fa48("9706") ? "" : (stryCov_9fa48("9706"), 'in process')
                    })));
                    const completedSections = stryMutAct_9fa48("9707") ? parseInt(currentSection, 10) - 1 : (stryCov_9fa48("9707"), parseInt(currentSection, 10) + 1);
                    setApplicationProgress(stryMutAct_9fa48("9708") ? {} : (stryCov_9fa48("9708"), {
                      completedSections,
                      totalSections: 5
                    }));
                    console.log(stryMutAct_9fa48("9709") ? "" : (stryCov_9fa48("9709"), 'Dashboard: Application in process (localStorage only):'), completedSections + (stryMutAct_9fa48("9710") ? "" : (stryCov_9fa48("9710"), '/5')));
                  }
                } else {
                  if (stryMutAct_9fa48("9711")) {
                    {}
                  } else {
                    stryCov_9fa48("9711");
                    setStatuses(stryMutAct_9fa48("9712") ? () => undefined : (stryCov_9fa48("9712"), prev => stryMutAct_9fa48("9713") ? {} : (stryCov_9fa48("9713"), {
                      ...prev,
                      application: stryMutAct_9fa48("9714") ? "" : (stryCov_9fa48("9714"), 'not started')
                    })));
                    setApplicationProgress(null);
                    console.log(stryMutAct_9fa48("9715") ? "" : (stryCov_9fa48("9715"), 'Dashboard: Application not started'));
                  }
                }
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("9716")) {
            {}
          } else {
            stryCov_9fa48("9716");
            console.error(stryMutAct_9fa48("9717") ? "" : (stryCov_9fa48("9717"), 'Error loading application status for dashboard:'), error);
            setStatuses(stryMutAct_9fa48("9718") ? () => undefined : (stryCov_9fa48("9718"), prev => stryMutAct_9fa48("9719") ? {} : (stryCov_9fa48("9719"), {
              ...prev,
              application: stryMutAct_9fa48("9720") ? "" : (stryCov_9fa48("9720"), 'not started')
            })));
            setApplicationProgress(null);
          }
        }
      }
    };
    const loadWorkshopStatus = async () => {
      if (stryMutAct_9fa48("9721")) {
        {}
      } else {
        stryCov_9fa48("9721");
        try {
          if (stryMutAct_9fa48("9722")) {
            {}
          } else {
            stryCov_9fa48("9722");
            // First check if the applicant has been invited to workshops by checking their stage
            const stageResponse = await fetch(stryMutAct_9fa48("9723") ? `` : (stryCov_9fa48("9723"), `${import.meta.env.VITE_API_URL}/api/admissions/applicants/${currentApplicantId}/stage`));
            let isInvited = stryMutAct_9fa48("9724") ? true : (stryCov_9fa48("9724"), false);
            let hasAttendedWorkshop = stryMutAct_9fa48("9725") ? true : (stryCov_9fa48("9725"), false);
            if (stryMutAct_9fa48("9727") ? false : stryMutAct_9fa48("9726") ? true : (stryCov_9fa48("9726", "9727"), stageResponse.ok)) {
              if (stryMutAct_9fa48("9728")) {
                {}
              } else {
                stryCov_9fa48("9728");
                const stageData = await stageResponse.json();
                console.log(stryMutAct_9fa48("9729") ? "" : (stryCov_9fa48("9729"), 'Dashboard: Applicant stage data:'), stageData);

                // Check if already attended workshop based on stage
                if (stryMutAct_9fa48("9732") ? stageData.current_stage !== 'workshop_attended' : stryMutAct_9fa48("9731") ? false : stryMutAct_9fa48("9730") ? true : (stryCov_9fa48("9730", "9731", "9732"), stageData.current_stage === (stryMutAct_9fa48("9733") ? "" : (stryCov_9fa48("9733"), 'workshop_attended')))) {
                  if (stryMutAct_9fa48("9734")) {
                    {}
                  } else {
                    stryCov_9fa48("9734");
                    hasAttendedWorkshop = stryMutAct_9fa48("9735") ? false : (stryCov_9fa48("9735"), true);
                    console.log(stryMutAct_9fa48("9736") ? "" : (stryCov_9fa48("9736"), 'Dashboard: Workshop marked as attended based on stage'));
                  }
                }

                // If current_stage is workshop_invited or any workshop-related stage, unlock workshops
                if (stryMutAct_9fa48("9739") ? stageData.current_stage || stageData.current_stage.includes('workshop') || stageData.current_stage === 'workshop_invited' || stageData.current_stage === 'workshop_registered' || stageData.current_stage === 'workshop_attended' : stryMutAct_9fa48("9738") ? false : stryMutAct_9fa48("9737") ? true : (stryCov_9fa48("9737", "9738", "9739"), stageData.current_stage && (stryMutAct_9fa48("9741") ? (stageData.current_stage.includes('workshop') || stageData.current_stage === 'workshop_invited' || stageData.current_stage === 'workshop_registered') && stageData.current_stage === 'workshop_attended' : stryMutAct_9fa48("9740") ? true : (stryCov_9fa48("9740", "9741"), (stryMutAct_9fa48("9743") ? (stageData.current_stage.includes('workshop') || stageData.current_stage === 'workshop_invited') && stageData.current_stage === 'workshop_registered' : stryMutAct_9fa48("9742") ? false : (stryCov_9fa48("9742", "9743"), (stryMutAct_9fa48("9745") ? stageData.current_stage.includes('workshop') && stageData.current_stage === 'workshop_invited' : stryMutAct_9fa48("9744") ? false : (stryCov_9fa48("9744", "9745"), stageData.current_stage.includes(stryMutAct_9fa48("9746") ? "" : (stryCov_9fa48("9746"), 'workshop')) || (stryMutAct_9fa48("9748") ? stageData.current_stage !== 'workshop_invited' : stryMutAct_9fa48("9747") ? false : (stryCov_9fa48("9747", "9748"), stageData.current_stage === (stryMutAct_9fa48("9749") ? "" : (stryCov_9fa48("9749"), 'workshop_invited')))))) || (stryMutAct_9fa48("9751") ? stageData.current_stage !== 'workshop_registered' : stryMutAct_9fa48("9750") ? false : (stryCov_9fa48("9750", "9751"), stageData.current_stage === (stryMutAct_9fa48("9752") ? "" : (stryCov_9fa48("9752"), 'workshop_registered')))))) || (stryMutAct_9fa48("9754") ? stageData.current_stage !== 'workshop_attended' : stryMutAct_9fa48("9753") ? false : (stryCov_9fa48("9753", "9754"), stageData.current_stage === (stryMutAct_9fa48("9755") ? "" : (stryCov_9fa48("9755"), 'workshop_attended')))))))) {
                  if (stryMutAct_9fa48("9756")) {
                    {}
                  } else {
                    stryCov_9fa48("9756");
                    isInvited = stryMutAct_9fa48("9757") ? false : (stryCov_9fa48("9757"), true);
                    console.log(stryMutAct_9fa48("9758") ? "" : (stryCov_9fa48("9758"), 'Dashboard: Workshop unlocked due to stage:'), stageData.current_stage);
                  }
                }
              }
            }

            // If not invited, keep workshop locked
            if (stryMutAct_9fa48("9761") ? false : stryMutAct_9fa48("9760") ? true : stryMutAct_9fa48("9759") ? isInvited : (stryCov_9fa48("9759", "9760", "9761"), !isInvited)) {
              if (stryMutAct_9fa48("9762")) {
                {}
              } else {
                stryCov_9fa48("9762");
                setStatuses(stryMutAct_9fa48("9763") ? () => undefined : (stryCov_9fa48("9763"), prev => stryMutAct_9fa48("9764") ? {} : (stryCov_9fa48("9764"), {
                  ...prev,
                  workshop: stryMutAct_9fa48("9765") ? "" : (stryCov_9fa48("9765"), 'locked')
                })));
                setWorkshopDetails(null);
                console.log(stryMutAct_9fa48("9766") ? "" : (stryCov_9fa48("9766"), 'Dashboard: Workshop locked - no invitation found'));
                return;
              }
            }

            // If stage shows workshop attended, set status immediately
            if (stryMutAct_9fa48("9768") ? false : stryMutAct_9fa48("9767") ? true : (stryCov_9fa48("9767", "9768"), hasAttendedWorkshop)) {
              if (stryMutAct_9fa48("9769")) {
                {}
              } else {
                stryCov_9fa48("9769");
                setStatuses(stryMutAct_9fa48("9770") ? () => undefined : (stryCov_9fa48("9770"), prev => stryMutAct_9fa48("9771") ? {} : (stryCov_9fa48("9771"), {
                  ...prev,
                  workshop: stryMutAct_9fa48("9772") ? "" : (stryCov_9fa48("9772"), 'attended')
                })));
                console.log(stryMutAct_9fa48("9773") ? "" : (stryCov_9fa48("9773"), 'Dashboard: Workshop status set to attended based on stage'));
              }
            }

            // If invited, check for existing registrations
            // Pass applicant_id to include inactive workshops where user has registrations
            const response = await fetch(stryMutAct_9fa48("9774") ? `` : (stryCov_9fa48("9774"), `${import.meta.env.VITE_API_URL}/api/workshops?applicant_id=${currentApplicantId}`));
            if (stryMutAct_9fa48("9777") ? false : stryMutAct_9fa48("9776") ? true : stryMutAct_9fa48("9775") ? response.ok : (stryCov_9fa48("9775", "9776", "9777"), !response.ok)) {
              if (stryMutAct_9fa48("9778")) {
                {}
              } else {
                stryCov_9fa48("9778");
                // If we can't load workshops but they're invited, show as available
                setStatuses(stryMutAct_9fa48("9779") ? () => undefined : (stryCov_9fa48("9779"), prev => stryMutAct_9fa48("9780") ? {} : (stryCov_9fa48("9780"), {
                  ...prev,
                  workshop: stryMutAct_9fa48("9781") ? "" : (stryCov_9fa48("9781"), 'not signed-up')
                })));
                setWorkshopDetails(null);
                return;
              }
            }
            const workshops = await response.json();
            console.log(stryMutAct_9fa48("9782") ? "" : (stryCov_9fa48("9782"), 'DEBUG: Workshops received for applicant'), currentApplicantId, stryMutAct_9fa48("9783") ? "" : (stryCov_9fa48("9783"), ':'), workshops.map(stryMutAct_9fa48("9784") ? () => undefined : (stryCov_9fa48("9784"), w => stryMutAct_9fa48("9785") ? {} : (stryCov_9fa48("9785"), {
              title: w.title,
              id: w.event_id,
              active: w.is_active,
              registrations: w.registrations.length,
              userRegistrations: stryMutAct_9fa48("9786") ? w.registrations : (stryCov_9fa48("9786"), w.registrations.filter(stryMutAct_9fa48("9787") ? () => undefined : (stryCov_9fa48("9787"), r => stryMutAct_9fa48("9790") ? r.applicant_id !== currentApplicantId : stryMutAct_9fa48("9789") ? false : stryMutAct_9fa48("9788") ? true : (stryCov_9fa48("9788", "9789", "9790"), r.applicant_id === currentApplicantId))))
            }))));
            let foundRegistration = null;
            let registeredWorkshop = null;

            // Check all workshops for current user's registration (any status)
            for (const workshop of workshops) {
              if (stryMutAct_9fa48("9791")) {
                {}
              } else {
                stryCov_9fa48("9791");
                const registrations = stryMutAct_9fa48("9794") ? workshop.registrations && [] : stryMutAct_9fa48("9793") ? false : stryMutAct_9fa48("9792") ? true : (stryCov_9fa48("9792", "9793", "9794"), workshop.registrations || (stryMutAct_9fa48("9795") ? ["Stryker was here"] : (stryCov_9fa48("9795"), [])));
                const userRegistration = registrations.find(stryMutAct_9fa48("9796") ? () => undefined : (stryCov_9fa48("9796"), reg => stryMutAct_9fa48("9799") ? reg.applicant_id !== currentApplicantId : stryMutAct_9fa48("9798") ? false : stryMutAct_9fa48("9797") ? true : (stryCov_9fa48("9797", "9798", "9799"), reg.applicant_id === currentApplicantId)));
                if (stryMutAct_9fa48("9801") ? false : stryMutAct_9fa48("9800") ? true : (stryCov_9fa48("9800", "9801"), userRegistration)) {
                  if (stryMutAct_9fa48("9802")) {
                    {}
                  } else {
                    stryCov_9fa48("9802");
                    foundRegistration = userRegistration;
                    registeredWorkshop = workshop;
                    break;
                  }
                }
              }
            }
            if (stryMutAct_9fa48("9805") ? foundRegistration || registeredWorkshop : stryMutAct_9fa48("9804") ? false : stryMutAct_9fa48("9803") ? true : (stryCov_9fa48("9803", "9804", "9805"), foundRegistration && registeredWorkshop)) {
              if (stryMutAct_9fa48("9806")) {
                {}
              } else {
                stryCov_9fa48("9806");
                // Treat database time as Eastern Time (extract UTC components and use as Eastern)
                const dbDate = new Date(registeredWorkshop.start_time);
                const year = dbDate.getUTCFullYear();
                const month = dbDate.getUTCMonth();
                const day = dbDate.getUTCDate();
                const hour = dbDate.getUTCHours();
                const minute = dbDate.getUTCMinutes();
                const easternDate = new Date(year, month, day, hour, minute);
                const workshopEventDetails = stryMutAct_9fa48("9807") ? {} : (stryCov_9fa48("9807"), {
                  date: easternDate.toLocaleDateString(stryMutAct_9fa48("9808") ? "" : (stryCov_9fa48("9808"), 'en-US'), stryMutAct_9fa48("9809") ? {} : (stryCov_9fa48("9809"), {
                    month: stryMutAct_9fa48("9810") ? "" : (stryCov_9fa48("9810"), 'long'),
                    day: stryMutAct_9fa48("9811") ? "" : (stryCov_9fa48("9811"), 'numeric'),
                    year: stryMutAct_9fa48("9812") ? "" : (stryCov_9fa48("9812"), 'numeric')
                  })),
                  time: easternDate.toLocaleTimeString(stryMutAct_9fa48("9813") ? "" : (stryCov_9fa48("9813"), 'en-US'), stryMutAct_9fa48("9814") ? {} : (stryCov_9fa48("9814"), {
                    hour: stryMutAct_9fa48("9815") ? "" : (stryCov_9fa48("9815"), 'numeric'),
                    minute: stryMutAct_9fa48("9816") ? "" : (stryCov_9fa48("9816"), '2-digit')
                  })),
                  location: registeredWorkshop.location
                });

                // Set workshop status based on stage data first, then registration status
                let workshopStatus = stryMutAct_9fa48("9817") ? "" : (stryCov_9fa48("9817"), 'signed-up'); // default for 'registered'

                if (stryMutAct_9fa48("9819") ? false : stryMutAct_9fa48("9818") ? true : (stryCov_9fa48("9818", "9819"), hasAttendedWorkshop)) {
                  if (stryMutAct_9fa48("9820")) {
                    {}
                  } else {
                    stryCov_9fa48("9820");
                    // Stage data takes priority - already attended
                    workshopStatus = stryMutAct_9fa48("9821") ? "" : (stryCov_9fa48("9821"), 'attended');
                    console.log(stryMutAct_9fa48("9822") ? "" : (stryCov_9fa48("9822"), 'Dashboard: Workshop status set to attended based on stage data'));
                  }
                } else if (stryMutAct_9fa48("9825") ? (foundRegistration.status === 'attended' || foundRegistration.status === 'attended_late') && foundRegistration.status === 'very_late' : stryMutAct_9fa48("9824") ? false : stryMutAct_9fa48("9823") ? true : (stryCov_9fa48("9823", "9824", "9825"), (stryMutAct_9fa48("9827") ? foundRegistration.status === 'attended' && foundRegistration.status === 'attended_late' : stryMutAct_9fa48("9826") ? false : (stryCov_9fa48("9826", "9827"), (stryMutAct_9fa48("9829") ? foundRegistration.status !== 'attended' : stryMutAct_9fa48("9828") ? false : (stryCov_9fa48("9828", "9829"), foundRegistration.status === (stryMutAct_9fa48("9830") ? "" : (stryCov_9fa48("9830"), 'attended')))) || (stryMutAct_9fa48("9832") ? foundRegistration.status !== 'attended_late' : stryMutAct_9fa48("9831") ? false : (stryCov_9fa48("9831", "9832"), foundRegistration.status === (stryMutAct_9fa48("9833") ? "" : (stryCov_9fa48("9833"), 'attended_late')))))) || (stryMutAct_9fa48("9835") ? foundRegistration.status !== 'very_late' : stryMutAct_9fa48("9834") ? false : (stryCov_9fa48("9834", "9835"), foundRegistration.status === (stryMutAct_9fa48("9836") ? "" : (stryCov_9fa48("9836"), 'very_late')))))) {
                  if (stryMutAct_9fa48("9837")) {
                    {}
                  } else {
                    stryCov_9fa48("9837");
                    workshopStatus = stryMutAct_9fa48("9838") ? "" : (stryCov_9fa48("9838"), 'attended');
                    console.log(stryMutAct_9fa48("9839") ? "" : (stryCov_9fa48("9839"), 'Dashboard: Workshop marked as attended with registration status:'), foundRegistration.status);
                  }
                } else if (stryMutAct_9fa48("9842") ? foundRegistration.status !== 'registered' : stryMutAct_9fa48("9841") ? false : stryMutAct_9fa48("9840") ? true : (stryCov_9fa48("9840", "9841", "9842"), foundRegistration.status === (stryMutAct_9fa48("9843") ? "" : (stryCov_9fa48("9843"), 'registered')))) {
                  if (stryMutAct_9fa48("9844")) {
                    {}
                  } else {
                    stryCov_9fa48("9844");
                    workshopStatus = stryMutAct_9fa48("9845") ? "" : (stryCov_9fa48("9845"), 'signed-up');
                    console.log(stryMutAct_9fa48("9846") ? "" : (stryCov_9fa48("9846"), 'Dashboard: Workshop registration found, status:'), foundRegistration.status);
                  }
                }
                setStatuses(stryMutAct_9fa48("9847") ? () => undefined : (stryCov_9fa48("9847"), prev => stryMutAct_9fa48("9848") ? {} : (stryCov_9fa48("9848"), {
                  ...prev,
                  workshop: workshopStatus
                })));
                setWorkshopDetails(workshopEventDetails);
                console.log(stryMutAct_9fa48("9849") ? "" : (stryCov_9fa48("9849"), 'Dashboard: Found workshop registration'), workshopEventDetails, stryMutAct_9fa48("9850") ? "" : (stryCov_9fa48("9850"), 'Status:'), workshopStatus);
              }
            } else if (stryMutAct_9fa48("9852") ? false : stryMutAct_9fa48("9851") ? true : (stryCov_9fa48("9851", "9852"), hasAttendedWorkshop)) {
              if (stryMutAct_9fa48("9853")) {
                {}
              } else {
                stryCov_9fa48("9853");
                // Attended based on stage but no registration details found
                // Try to get details from any workshop for display purposes
                if (stryMutAct_9fa48("9856") ? workshops || workshops.length > 0 : stryMutAct_9fa48("9855") ? false : stryMutAct_9fa48("9854") ? true : (stryCov_9fa48("9854", "9855", "9856"), workshops && (stryMutAct_9fa48("9859") ? workshops.length <= 0 : stryMutAct_9fa48("9858") ? workshops.length >= 0 : stryMutAct_9fa48("9857") ? true : (stryCov_9fa48("9857", "9858", "9859"), workshops.length > 0)))) {
                  if (stryMutAct_9fa48("9860")) {
                    {}
                  } else {
                    stryCov_9fa48("9860");
                    // Use the first available workshop as a fallback for display purposes
                    const firstWorkshop = workshops[0];
                    const dbDate = new Date(firstWorkshop.start_time);
                    const year = dbDate.getUTCFullYear();
                    const month = dbDate.getUTCMonth();
                    const day = dbDate.getUTCDate();
                    const hour = dbDate.getUTCHours();
                    const minute = dbDate.getUTCMinutes();
                    const easternDate = new Date(year, month, day, hour, minute);
                    const workshopEventDetails = stryMutAct_9fa48("9861") ? {} : (stryCov_9fa48("9861"), {
                      date: easternDate.toLocaleDateString(stryMutAct_9fa48("9862") ? "" : (stryCov_9fa48("9862"), 'en-US'), stryMutAct_9fa48("9863") ? {} : (stryCov_9fa48("9863"), {
                        month: stryMutAct_9fa48("9864") ? "" : (stryCov_9fa48("9864"), 'long'),
                        day: stryMutAct_9fa48("9865") ? "" : (stryCov_9fa48("9865"), 'numeric'),
                        year: stryMutAct_9fa48("9866") ? "" : (stryCov_9fa48("9866"), 'numeric')
                      })),
                      time: easternDate.toLocaleTimeString(stryMutAct_9fa48("9867") ? "" : (stryCov_9fa48("9867"), 'en-US'), stryMutAct_9fa48("9868") ? {} : (stryCov_9fa48("9868"), {
                        hour: stryMutAct_9fa48("9869") ? "" : (stryCov_9fa48("9869"), 'numeric'),
                        minute: stryMutAct_9fa48("9870") ? "" : (stryCov_9fa48("9870"), '2-digit')
                      })),
                      location: firstWorkshop.location
                    });
                    setWorkshopDetails(workshopEventDetails);
                  }
                }
              }
            } else {
              if (stryMutAct_9fa48("9871")) {
                {}
              } else {
                stryCov_9fa48("9871");
                // Invited but not registered yet (and hasn't attended)
                setStatuses(stryMutAct_9fa48("9872") ? () => undefined : (stryCov_9fa48("9872"), prev => stryMutAct_9fa48("9873") ? {} : (stryCov_9fa48("9873"), {
                  ...prev,
                  workshop: stryMutAct_9fa48("9874") ? "" : (stryCov_9fa48("9874"), 'not signed-up')
                })));
                setWorkshopDetails(null);
                console.log(stryMutAct_9fa48("9875") ? "" : (stryCov_9fa48("9875"), 'Dashboard: Workshop available for signup'));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("9876")) {
            {}
          } else {
            stryCov_9fa48("9876");
            console.error(stryMutAct_9fa48("9877") ? "" : (stryCov_9fa48("9877"), 'Error loading workshop status for dashboard:'), error);
            setStatuses(stryMutAct_9fa48("9878") ? () => undefined : (stryCov_9fa48("9878"), prev => stryMutAct_9fa48("9879") ? {} : (stryCov_9fa48("9879"), {
              ...prev,
              workshop: stryMutAct_9fa48("9880") ? "" : (stryCov_9fa48("9880"), 'locked')
            })));
          }
        }
      }
    };
    const loadPledgeStatus = async () => {
      if (stryMutAct_9fa48("9881")) {
        {}
      } else {
        stryCov_9fa48("9881");
        try {
          if (stryMutAct_9fa48("9882")) {
            {}
          } else {
            stryCov_9fa48("9882");
            // Check if applicant has been admitted to the program
            const stageResponse = await fetch(stryMutAct_9fa48("9883") ? `` : (stryCov_9fa48("9883"), `${import.meta.env.VITE_API_URL}/api/admissions/applicants/${currentApplicantId}/stage`));
            if (stryMutAct_9fa48("9885") ? false : stryMutAct_9fa48("9884") ? true : (stryCov_9fa48("9884", "9885"), stageResponse.ok)) {
              if (stryMutAct_9fa48("9886")) {
                {}
              } else {
                stryCov_9fa48("9886");
                const stageData = await stageResponse.json();
                console.log(stryMutAct_9fa48("9887") ? "" : (stryCov_9fa48("9887"), 'Dashboard: Applicant stage data for pledge:'), stageData);

                // If program_admission_status is 'accepted', check pledge completion status
                if (stryMutAct_9fa48("9890") ? stageData.program_admission_status !== 'accepted' : stryMutAct_9fa48("9889") ? false : stryMutAct_9fa48("9888") ? true : (stryCov_9fa48("9888", "9889", "9890"), stageData.program_admission_status === (stryMutAct_9fa48("9891") ? "" : (stryCov_9fa48("9891"), 'accepted')))) {
                  if (stryMutAct_9fa48("9892")) {
                    {}
                  } else {
                    stryCov_9fa48("9892");
                    // Check if pledge has been completed
                    const pledgeResponse = await fetch(stryMutAct_9fa48("9893") ? `` : (stryCov_9fa48("9893"), `${import.meta.env.VITE_API_URL}/api/admissions/pledge/status/${currentApplicantId}`));
                    if (stryMutAct_9fa48("9895") ? false : stryMutAct_9fa48("9894") ? true : (stryCov_9fa48("9894", "9895"), pledgeResponse.ok)) {
                      if (stryMutAct_9fa48("9896")) {
                        {}
                      } else {
                        stryCov_9fa48("9896");
                        const pledgeData = await pledgeResponse.json();
                        console.log(stryMutAct_9fa48("9897") ? "" : (stryCov_9fa48("9897"), 'Dashboard: Pledge status data:'), pledgeData);
                        if (stryMutAct_9fa48("9899") ? false : stryMutAct_9fa48("9898") ? true : (stryCov_9fa48("9898", "9899"), pledgeData.pledge_completed)) {
                          if (stryMutAct_9fa48("9900")) {
                            {}
                          } else {
                            stryCov_9fa48("9900");
                            setStatuses(stryMutAct_9fa48("9901") ? () => undefined : (stryCov_9fa48("9901"), prev => stryMutAct_9fa48("9902") ? {} : (stryCov_9fa48("9902"), {
                              ...prev,
                              pledge: stryMutAct_9fa48("9903") ? "" : (stryCov_9fa48("9903"), 'completed')
                            })));
                            console.log(stryMutAct_9fa48("9904") ? "" : (stryCov_9fa48("9904"), 'Dashboard: Pledge completed'));
                          }
                        } else {
                          if (stryMutAct_9fa48("9905")) {
                            {}
                          } else {
                            stryCov_9fa48("9905");
                            setStatuses(stryMutAct_9fa48("9906") ? () => undefined : (stryCov_9fa48("9906"), prev => stryMutAct_9fa48("9907") ? {} : (stryCov_9fa48("9907"), {
                              ...prev,
                              pledge: stryMutAct_9fa48("9908") ? "" : (stryCov_9fa48("9908"), 'not completed')
                            })));
                            console.log(stryMutAct_9fa48("9909") ? "" : (stryCov_9fa48("9909"), 'Dashboard: Pledge available but not completed'));
                          }
                        }
                      }
                    } else {
                      if (stryMutAct_9fa48("9910")) {
                        {}
                      } else {
                        stryCov_9fa48("9910");
                        // If can't load pledge status, assume not completed but available
                        setStatuses(stryMutAct_9fa48("9911") ? () => undefined : (stryCov_9fa48("9911"), prev => stryMutAct_9fa48("9912") ? {} : (stryCov_9fa48("9912"), {
                          ...prev,
                          pledge: stryMutAct_9fa48("9913") ? "" : (stryCov_9fa48("9913"), 'not completed')
                        })));
                        console.log(stryMutAct_9fa48("9914") ? "" : (stryCov_9fa48("9914"), 'Dashboard: Pledge unlocked but status unknown'));
                      }
                    }
                  }
                } else {
                  if (stryMutAct_9fa48("9915")) {
                    {}
                  } else {
                    stryCov_9fa48("9915");
                    setStatuses(stryMutAct_9fa48("9916") ? () => undefined : (stryCov_9fa48("9916"), prev => stryMutAct_9fa48("9917") ? {} : (stryCov_9fa48("9917"), {
                      ...prev,
                      pledge: stryMutAct_9fa48("9918") ? "" : (stryCov_9fa48("9918"), 'locked')
                    })));
                    console.log(stryMutAct_9fa48("9919") ? "" : (stryCov_9fa48("9919"), 'Dashboard: Pledge locked - applicant not yet admitted to program'));
                  }
                }
              }
            } else {
              if (stryMutAct_9fa48("9920")) {
                {}
              } else {
                stryCov_9fa48("9920");
                // If we can't load stage data, keep pledge locked
                setStatuses(stryMutAct_9fa48("9921") ? () => undefined : (stryCov_9fa48("9921"), prev => stryMutAct_9fa48("9922") ? {} : (stryCov_9fa48("9922"), {
                  ...prev,
                  pledge: stryMutAct_9fa48("9923") ? "" : (stryCov_9fa48("9923"), 'locked')
                })));
                console.log(stryMutAct_9fa48("9924") ? "" : (stryCov_9fa48("9924"), 'Dashboard: Pledge locked - could not load stage data'));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("9925")) {
            {}
          } else {
            stryCov_9fa48("9925");
            console.error(stryMutAct_9fa48("9926") ? "" : (stryCov_9fa48("9926"), 'Error loading pledge status:'), error);
            setStatuses(stryMutAct_9fa48("9927") ? () => undefined : (stryCov_9fa48("9927"), prev => stryMutAct_9fa48("9928") ? {} : (stryCov_9fa48("9928"), {
              ...prev,
              pledge: stryMutAct_9fa48("9929") ? "" : (stryCov_9fa48("9929"), 'locked')
            })));
          }
        }
      }
    };
    const isComplete = (key, status) => {
      if (stryMutAct_9fa48("9930")) {
        {}
      } else {
        stryCov_9fa48("9930");
        if (stryMutAct_9fa48("9933") ? key !== 'infoSession' : stryMutAct_9fa48("9932") ? false : stryMutAct_9fa48("9931") ? true : (stryCov_9fa48("9931", "9932", "9933"), key === (stryMutAct_9fa48("9934") ? "" : (stryCov_9fa48("9934"), 'infoSession')))) return stryMutAct_9fa48("9937") ? status !== 'attended' : stryMutAct_9fa48("9936") ? false : stryMutAct_9fa48("9935") ? true : (stryCov_9fa48("9935", "9936", "9937"), status === (stryMutAct_9fa48("9938") ? "" : (stryCov_9fa48("9938"), 'attended')));
        if (stryMutAct_9fa48("9941") ? key !== 'application' : stryMutAct_9fa48("9940") ? false : stryMutAct_9fa48("9939") ? true : (stryCov_9fa48("9939", "9940", "9941"), key === (stryMutAct_9fa48("9942") ? "" : (stryCov_9fa48("9942"), 'application')))) return stryMutAct_9fa48("9945") ? status !== 'submitted' : stryMutAct_9fa48("9944") ? false : stryMutAct_9fa48("9943") ? true : (stryCov_9fa48("9943", "9944", "9945"), status === (stryMutAct_9fa48("9946") ? "" : (stryCov_9fa48("9946"), 'submitted')));
        if (stryMutAct_9fa48("9949") ? key !== 'workshop' : stryMutAct_9fa48("9948") ? false : stryMutAct_9fa48("9947") ? true : (stryCov_9fa48("9947", "9948", "9949"), key === (stryMutAct_9fa48("9950") ? "" : (stryCov_9fa48("9950"), 'workshop')))) return stryMutAct_9fa48("9953") ? status !== 'attended' : stryMutAct_9fa48("9952") ? false : stryMutAct_9fa48("9951") ? true : (stryCov_9fa48("9951", "9952", "9953"), status === (stryMutAct_9fa48("9954") ? "" : (stryCov_9fa48("9954"), 'attended')));
        if (stryMutAct_9fa48("9957") ? key !== 'pledge' : stryMutAct_9fa48("9956") ? false : stryMutAct_9fa48("9955") ? true : (stryCov_9fa48("9955", "9956", "9957"), key === (stryMutAct_9fa48("9958") ? "" : (stryCov_9fa48("9958"), 'pledge')))) return stryMutAct_9fa48("9961") ? status !== 'completed' : stryMutAct_9fa48("9960") ? false : stryMutAct_9fa48("9959") ? true : (stryCov_9fa48("9959", "9960", "9961"), status === (stryMutAct_9fa48("9962") ? "" : (stryCov_9fa48("9962"), 'completed')));
        return stryMutAct_9fa48("9963") ? true : (stryCov_9fa48("9963"), false);
      }
    };
    const isIneligible = (key, status) => {
      if (stryMutAct_9fa48("9964")) {
        {}
      } else {
        stryCov_9fa48("9964");
        if (stryMutAct_9fa48("9967") ? key !== 'application' : stryMutAct_9fa48("9966") ? false : stryMutAct_9fa48("9965") ? true : (stryCov_9fa48("9965", "9966", "9967"), key === (stryMutAct_9fa48("9968") ? "" : (stryCov_9fa48("9968"), 'application')))) return stryMutAct_9fa48("9971") ? status !== 'ineligible' : stryMutAct_9fa48("9970") ? false : stryMutAct_9fa48("9969") ? true : (stryCov_9fa48("9969", "9970", "9971"), status === (stryMutAct_9fa48("9972") ? "" : (stryCov_9fa48("9972"), 'ineligible')));
        return stryMutAct_9fa48("9973") ? true : (stryCov_9fa48("9973"), false);
      }
    };
    const isLocked = (key, status) => {
      if (stryMutAct_9fa48("9974")) {
        {}
      } else {
        stryCov_9fa48("9974");
        if (stryMutAct_9fa48("9977") ? key !== 'workshop' : stryMutAct_9fa48("9976") ? false : stryMutAct_9fa48("9975") ? true : (stryCov_9fa48("9975", "9976", "9977"), key === (stryMutAct_9fa48("9978") ? "" : (stryCov_9fa48("9978"), 'workshop')))) return stryMutAct_9fa48("9981") ? status !== 'locked' : stryMutAct_9fa48("9980") ? false : stryMutAct_9fa48("9979") ? true : (stryCov_9fa48("9979", "9980", "9981"), status === (stryMutAct_9fa48("9982") ? "" : (stryCov_9fa48("9982"), 'locked'))); // Workshop is locked only if status is 'locked'
        if (stryMutAct_9fa48("9985") ? key !== 'pledge' : stryMutAct_9fa48("9984") ? false : stryMutAct_9fa48("9983") ? true : (stryCov_9fa48("9983", "9984", "9985"), key === (stryMutAct_9fa48("9986") ? "" : (stryCov_9fa48("9986"), 'pledge')))) return stryMutAct_9fa48("9989") ? status !== 'locked' : stryMutAct_9fa48("9988") ? false : stryMutAct_9fa48("9987") ? true : (stryCov_9fa48("9987", "9988", "9989"), status === (stryMutAct_9fa48("9990") ? "" : (stryCov_9fa48("9990"), 'locked'))); // Pledge is locked until program admission
        return stryMutAct_9fa48("9991") ? true : (stryCov_9fa48("9991"), false);
      }
    };
    const isButtonEnabled = section => {
      if (stryMutAct_9fa48("9992")) {
        {}
      } else {
        stryCov_9fa48("9992");
        if (stryMutAct_9fa48("9995") ? section.key !== 'workshop' : stryMutAct_9fa48("9994") ? false : stryMutAct_9fa48("9993") ? true : (stryCov_9fa48("9993", "9994", "9995"), section.key === (stryMutAct_9fa48("9996") ? "" : (stryCov_9fa48("9996"), 'workshop')))) {
          if (stryMutAct_9fa48("9997")) {
            {}
          } else {
            stryCov_9fa48("9997");
            return section.buttonEnabled(statuses.workshop, statuses.application);
          }
        }
        if (stryMutAct_9fa48("10000") ? section.key !== 'pledge' : stryMutAct_9fa48("9999") ? false : stryMutAct_9fa48("9998") ? true : (stryCov_9fa48("9998", "9999", "10000"), section.key === (stryMutAct_9fa48("10001") ? "" : (stryCov_9fa48("10001"), 'pledge')))) {
          if (stryMutAct_9fa48("10002")) {
            {}
          } else {
            stryCov_9fa48("10002");
            return section.buttonEnabled(statuses.pledge);
          }
        }
        return section.buttonEnabled(statuses[section.key]);
      }
    };
    const getButtonStyle = stryMutAct_9fa48("10003") ? () => undefined : (stryCov_9fa48("10003"), (() => {
      const getButtonStyle = (enabled, isLockedState = stryMutAct_9fa48("10004") ? true : (stryCov_9fa48("10004"), false), isIneligibleState = stryMutAct_9fa48("10005") ? true : (stryCov_9fa48("10005"), false), isSubmittedState = stryMutAct_9fa48("10006") ? true : (stryCov_9fa48("10006"), false), isCompletedState = stryMutAct_9fa48("10007") ? true : (stryCov_9fa48("10007"), false)) => stryMutAct_9fa48("10008") ? {} : (stryCov_9fa48("10008"), {
        background: isCompletedState ? stryMutAct_9fa48("10009") ? "" : (stryCov_9fa48("10009"), '#48bb78') : isSubmittedState ? stryMutAct_9fa48("10010") ? "" : (stryCov_9fa48("10010"), '#48bb78') : enabled ? stryMutAct_9fa48("10011") ? "" : (stryCov_9fa48("10011"), 'var(--color-primary)') : isIneligibleState ? stryMutAct_9fa48("10012") ? "" : (stryCov_9fa48("10012"), 'var(--color-background-darker)') : isLockedState ? stryMutAct_9fa48("10013") ? "" : (stryCov_9fa48("10013"), '#f5f5f5') : stryMutAct_9fa48("10014") ? "" : (stryCov_9fa48("10014"), 'var(--color-border)'),
        color: isCompletedState ? stryMutAct_9fa48("10015") ? "" : (stryCov_9fa48("10015"), '#fff') : isSubmittedState ? stryMutAct_9fa48("10016") ? "" : (stryCov_9fa48("10016"), '#fff') : enabled ? stryMutAct_9fa48("10017") ? "" : (stryCov_9fa48("10017"), '#fff') : isIneligibleState ? stryMutAct_9fa48("10018") ? "" : (stryCov_9fa48("10018"), 'var(--color-text-secondary)') : isLockedState ? stryMutAct_9fa48("10019") ? "" : (stryCov_9fa48("10019"), '#999') : stryMutAct_9fa48("10020") ? "" : (stryCov_9fa48("10020"), 'var(--color-text-muted)'),
        border: isLockedState ? stryMutAct_9fa48("10021") ? "" : (stryCov_9fa48("10021"), '2px dashed #ddd') : isIneligibleState ? stryMutAct_9fa48("10022") ? "" : (stryCov_9fa48("10022"), '2px solid var(--color-border)') : stryMutAct_9fa48("10023") ? "" : (stryCov_9fa48("10023"), 'none'),
        borderRadius: stryMutAct_9fa48("10024") ? "" : (stryCov_9fa48("10024"), '8px'),
        padding: stryMutAct_9fa48("10025") ? "" : (stryCov_9fa48("10025"), '0.8rem 1rem'),
        fontWeight: 600,
        fontSize: stryMutAct_9fa48("10026") ? "" : (stryCov_9fa48("10026"), '0.9rem'),
        cursor: enabled ? stryMutAct_9fa48("10027") ? "" : (stryCov_9fa48("10027"), 'pointer') : stryMutAct_9fa48("10028") ? "" : (stryCov_9fa48("10028"), 'not-allowed'),
        marginTop: stryMutAct_9fa48("10029") ? "" : (stryCov_9fa48("10029"), '0'),
        transition: stryMutAct_9fa48("10030") ? "" : (stryCov_9fa48("10030"), 'all 0.2s'),
        width: stryMutAct_9fa48("10031") ? "" : (stryCov_9fa48("10031"), '100%'),
        maxWidth: stryMutAct_9fa48("10032") ? "" : (stryCov_9fa48("10032"), '280px'),
        height: stryMutAct_9fa48("10033") ? "" : (stryCov_9fa48("10033"), '48px'),
        position: stryMutAct_9fa48("10034") ? "" : (stryCov_9fa48("10034"), 'relative'),
        opacity: isLockedState ? 0.7 : 1,
        display: stryMutAct_9fa48("10035") ? "" : (stryCov_9fa48("10035"), 'flex'),
        alignItems: stryMutAct_9fa48("10036") ? "" : (stryCov_9fa48("10036"), 'center'),
        justifyContent: stryMutAct_9fa48("10037") ? "" : (stryCov_9fa48("10037"), 'center'),
        textAlign: stryMutAct_9fa48("10038") ? "" : (stryCov_9fa48("10038"), 'center'),
        lineHeight: 1.2,
        whiteSpace: stryMutAct_9fa48("10039") ? "" : (stryCov_9fa48("10039"), 'nowrap'),
        overflow: stryMutAct_9fa48("10040") ? "" : (stryCov_9fa48("10040"), 'hidden'),
        textOverflow: stryMutAct_9fa48("10041") ? "" : (stryCov_9fa48("10041"), 'ellipsis'),
        boxSizing: stryMutAct_9fa48("10042") ? "" : (stryCov_9fa48("10042"), 'border-box')
      });
      return getButtonStyle;
    })());
    const getSessionDetailsText = () => {
      if (stryMutAct_9fa48("10043")) {
        {}
      } else {
        stryCov_9fa48("10043");
        if (stryMutAct_9fa48("10046") ? false : stryMutAct_9fa48("10045") ? true : stryMutAct_9fa48("10044") ? sessionDetails : (stryCov_9fa48("10044", "10045", "10046"), !sessionDetails)) return null;
        return <div className="session-details">
        <div className="session-details__icon">📅</div>
        <div className="session-details__content">
          <div className="session-details__date">{sessionDetails.date}</div>
          <div className="session-details__time">{sessionDetails.time}</div>
          <div className="session-details__location">{sessionDetails.location}</div>
        </div>
      </div>;
      }
    };
    const getWorkshopDetailsText = () => {
      if (stryMutAct_9fa48("10047")) {
        {}
      } else {
        stryCov_9fa48("10047");
        if (stryMutAct_9fa48("10050") ? false : stryMutAct_9fa48("10049") ? true : stryMutAct_9fa48("10048") ? workshopDetails : (stryCov_9fa48("10048", "10049", "10050"), !workshopDetails)) return null;
        return <div className="session-details">
        <div className="session-details__icon">📅</div>
        <div className="session-details__content">
          <div className="session-details__date">{workshopDetails.date}</div>
          <div className="session-details__time">{workshopDetails.time}</div>
          <div className="session-details__location">{workshopDetails.location}</div>
        </div>
      </div>;
      }
    };

    // Function to get application progress details
    const getApplicationProgressText = () => {
      if (stryMutAct_9fa48("10051")) {
        {}
      } else {
        stryCov_9fa48("10051");
        if (stryMutAct_9fa48("10053") ? false : stryMutAct_9fa48("10052") ? true : (stryCov_9fa48("10052", "10053"), applicationProgress)) {
          if (stryMutAct_9fa48("10054")) {
            {}
          } else {
            stryCov_9fa48("10054");
            return stryMutAct_9fa48("10055") ? `` : (stryCov_9fa48("10055"), `${applicationProgress.completedSections}/${applicationProgress.totalSections} sections complete`);
          }
        }
        return stryMutAct_9fa48("10056") ? "" : (stryCov_9fa48("10056"), '0/5 sections complete');
      }
    };
    const handleLogout = () => {
      if (stryMutAct_9fa48("10057")) {
        {}
      } else {
        stryCov_9fa48("10057");
        // Clear all auth-related localStorage items
        localStorage.removeItem(stryMutAct_9fa48("10058") ? "" : (stryCov_9fa48("10058"), 'user'));
        localStorage.removeItem(stryMutAct_9fa48("10059") ? "" : (stryCov_9fa48("10059"), 'token'));
        localStorage.removeItem(stryMutAct_9fa48("10060") ? "" : (stryCov_9fa48("10060"), 'applicantToken'));
        // Clear old localStorage status items that might cause confusion
        localStorage.removeItem(stryMutAct_9fa48("10061") ? "" : (stryCov_9fa48("10061"), 'infoSessionStatus'));
        localStorage.removeItem(stryMutAct_9fa48("10062") ? "" : (stryCov_9fa48("10062"), 'infoSessionDetails'));
        localStorage.removeItem(stryMutAct_9fa48("10063") ? "" : (stryCov_9fa48("10063"), 'workshopStatus'));
        localStorage.removeItem(stryMutAct_9fa48("10064") ? "" : (stryCov_9fa48("10064"), 'workshopDetails'));
        localStorage.removeItem(stryMutAct_9fa48("10065") ? "" : (stryCov_9fa48("10065"), 'applicationStatus'));
        setUser(null);
        navigate(stryMutAct_9fa48("10066") ? "" : (stryCov_9fa48("10066"), '/login'));
      }
    };
    const handleBackToMainApp = () => {
      if (stryMutAct_9fa48("10067")) {
        {}
      } else {
        stryCov_9fa48("10067");
        navigate(stryMutAct_9fa48("10068") ? "" : (stryCov_9fa48("10068"), '/dashboard'));
      }
    };
    const handleEditEligibility = async () => {
      if (stryMutAct_9fa48("10069")) {
        {}
      } else {
        stryCov_9fa48("10069");
        try {
          if (stryMutAct_9fa48("10070")) {
            {}
          } else {
            stryCov_9fa48("10070");
            // Get applicant ID from localStorage or user data
            const savedUser = localStorage.getItem(stryMutAct_9fa48("10071") ? "" : (stryCov_9fa48("10071"), 'user'));
            let applicantId = null;
            if (stryMutAct_9fa48("10073") ? false : stryMutAct_9fa48("10072") ? true : (stryCov_9fa48("10072", "10073"), savedUser)) {
              if (stryMutAct_9fa48("10074")) {
                {}
              } else {
                stryCov_9fa48("10074");
                try {
                  if (stryMutAct_9fa48("10075")) {
                    {}
                  } else {
                    stryCov_9fa48("10075");
                    const userData = JSON.parse(savedUser);
                    // Try to get applicant ID from stored user data
                    if (stryMutAct_9fa48("10077") ? false : stryMutAct_9fa48("10076") ? true : (stryCov_9fa48("10076", "10077"), userData.applicantId)) {
                      if (stryMutAct_9fa48("10078")) {
                        {}
                      } else {
                        stryCov_9fa48("10078");
                        applicantId = userData.applicantId;
                      }
                    } else {
                      if (stryMutAct_9fa48("10079")) {
                        {}
                      } else {
                        stryCov_9fa48("10079");
                        // Create or get applicant to get the ID
                        const applicant = await databaseService.createOrGetApplicant(stryMutAct_9fa48("10082") ? userData.email && user.email : stryMutAct_9fa48("10081") ? false : stryMutAct_9fa48("10080") ? true : (stryCov_9fa48("10080", "10081", "10082"), userData.email || user.email), stryMutAct_9fa48("10085") ? (userData.firstName || userData.first_name || user.firstName) && user.first_name : stryMutAct_9fa48("10084") ? false : stryMutAct_9fa48("10083") ? true : (stryCov_9fa48("10083", "10084", "10085"), (stryMutAct_9fa48("10087") ? (userData.firstName || userData.first_name) && user.firstName : stryMutAct_9fa48("10086") ? false : (stryCov_9fa48("10086", "10087"), (stryMutAct_9fa48("10089") ? userData.firstName && userData.first_name : stryMutAct_9fa48("10088") ? false : (stryCov_9fa48("10088", "10089"), userData.firstName || userData.first_name)) || user.firstName)) || user.first_name), stryMutAct_9fa48("10092") ? (userData.lastName || userData.last_name || user.lastName) && user.last_name : stryMutAct_9fa48("10091") ? false : stryMutAct_9fa48("10090") ? true : (stryCov_9fa48("10090", "10091", "10092"), (stryMutAct_9fa48("10094") ? (userData.lastName || userData.last_name) && user.lastName : stryMutAct_9fa48("10093") ? false : (stryCov_9fa48("10093", "10094"), (stryMutAct_9fa48("10096") ? userData.lastName && userData.last_name : stryMutAct_9fa48("10095") ? false : (stryCov_9fa48("10095", "10096"), userData.lastName || userData.last_name)) || user.lastName)) || user.last_name));
                        applicantId = applicant.applicant_id;
                      }
                    }
                  }
                } catch (e) {
                  if (stryMutAct_9fa48("10097")) {
                    {}
                  } else {
                    stryCov_9fa48("10097");
                    console.warn(stryMutAct_9fa48("10098") ? "" : (stryCov_9fa48("10098"), 'Could not parse saved user data'));
                  }
                }
              }
            }
            if (stryMutAct_9fa48("10101") ? false : stryMutAct_9fa48("10100") ? true : stryMutAct_9fa48("10099") ? applicantId : (stryCov_9fa48("10099", "10100", "10101"), !applicantId)) {
              if (stryMutAct_9fa48("10102")) {
                {}
              } else {
                stryCov_9fa48("10102");
                alert(stryMutAct_9fa48("10103") ? "" : (stryCov_9fa48("10103"), 'Unable to find your application. Please try logging in again.'));
                return;
              }
            }

            // Set flag for ApplicationForm to handle the reset synchronously
            localStorage.setItem(stryMutAct_9fa48("10104") ? "" : (stryCov_9fa48("10104"), 'eligibilityResetForEditing'), stryMutAct_9fa48("10105") ? "" : (stryCov_9fa48("10105"), 'true'));
            console.log(stryMutAct_9fa48("10106") ? "" : (stryCov_9fa48("10106"), '🚀 DASHBOARD DEBUG: Set eligibilityResetForEditing flag to true'));

            // Update local state optimistically
            setStatuses(stryMutAct_9fa48("10107") ? () => undefined : (stryCov_9fa48("10107"), prev => stryMutAct_9fa48("10108") ? {} : (stryCov_9fa48("10108"), {
              ...prev,
              application: stryMutAct_9fa48("10109") ? "" : (stryCov_9fa48("10109"), 'in process')
            })));

            // Navigate to application form with a URL parameter to ensure the reset flag is preserved
            console.log(stryMutAct_9fa48("10110") ? "" : (stryCov_9fa48("10110"), '🚀 DASHBOARD DEBUG: Navigating to application form with reset parameter...'));
            navigate(stryMutAct_9fa48("10111") ? "" : (stryCov_9fa48("10111"), '/application-form?resetEligibility=true'));
          }
        } catch (error) {
          if (stryMutAct_9fa48("10112")) {
            {}
          } else {
            stryCov_9fa48("10112");
            console.error(stryMutAct_9fa48("10113") ? "" : (stryCov_9fa48("10113"), 'Error resetting eligibility:'), error);
            alert(stryMutAct_9fa48("10114") ? "" : (stryCov_9fa48("10114"), 'An error occurred while resetting your eligibility. Please try again.'));
          }
        }
      }
    };
    if (stryMutAct_9fa48("10117") ? false : stryMutAct_9fa48("10116") ? true : stryMutAct_9fa48("10115") ? user : (stryCov_9fa48("10115", "10116", "10117"), !user)) {
      if (stryMutAct_9fa48("10118")) {
        {}
      } else {
        stryCov_9fa48("10118");
        return <div className="admissions-dashboard__loading">Loading...</div>;
      }
    }
    if (stryMutAct_9fa48("10120") ? false : stryMutAct_9fa48("10119") ? true : (stryCov_9fa48("10119", "10120"), isLoading)) {
      if (stryMutAct_9fa48("10121")) {
        {}
      } else {
        stryCov_9fa48("10121");
        return <div className="admissions-dashboard">
        <div className="admissions-dashboard__loading">Loading your dashboard...</div>
      </div>;
      }
    }
    return <div className="admissions-dashboard">
      {/* Top Bar */}
      <div className="admissions-dashboard__topbar">
        <div className="admissions-dashboard__topbar-left">
          <div className="admissions-dashboard__logo-section">
            <Link to="/apply">
              <img src={pursuitLogoFull} alt="Pursuit Logo" className="admissions-dashboard__logo-full" />
            </Link>
          </div>
          <div className="admissions-dashboard__welcome-text">
            Welcome, {stryMutAct_9fa48("10124") ? user.firstName && user.first_name : stryMutAct_9fa48("10123") ? false : stryMutAct_9fa48("10122") ? true : (stryCov_9fa48("10122", "10123", "10124"), user.firstName || user.first_name)}!
          </div>
        </div>
        <div className="admissions-dashboard__topbar-right">
          <Link to="/apply" className="nav-link nav-link--active">Apply</Link>
          <Link to="/program-details" className="nav-link">Details</Link>
          {stryMutAct_9fa48("10127") ? user.userType === 'builder' || <button onClick={handleBackToMainApp} className="admissions-dashboard__button--secondary">
              Main App
            </button> : stryMutAct_9fa48("10126") ? false : stryMutAct_9fa48("10125") ? true : (stryCov_9fa48("10125", "10126", "10127"), (stryMutAct_9fa48("10129") ? user.userType !== 'builder' : stryMutAct_9fa48("10128") ? true : (stryCov_9fa48("10128", "10129"), user.userType === (stryMutAct_9fa48("10130") ? "" : (stryCov_9fa48("10130"), 'builder')))) && <button onClick={handleBackToMainApp} className="admissions-dashboard__button--secondary">
              Main App
            </button>)}
          <button onClick={handleLogout} className="admissions-dashboard__button--primary">
            Log Out
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="admissions-dashboard__title-section">
        <h1 className="admissions-dashboard__title">
          Start your AI-Native journey by completing the following steps.
        </h1>
      </div>
      
      {/* Main Content Layout */}
      <div className="admissions-dashboard__content">
        {/* Action Cards */}
        <div className="action-cards">
          {SECTION_CONFIG.map((section, index) => {
            if (stryMutAct_9fa48("10131")) {
              {}
            } else {
              stryCov_9fa48("10131");
              const status = statuses[section.key];
              const complete = isComplete(section.key, status);
              const ineligible = isIneligible(section.key, status);
              const enabled = isButtonEnabled(section);
              const locked = isLocked(section.key, status);
              return <div key={section.key} className={stryMutAct_9fa48("10132") ? `` : (stryCov_9fa48("10132"), `action-card ${locked ? stryMutAct_9fa48("10133") ? "" : (stryCov_9fa48("10133"), 'action-card--locked') : stryMutAct_9fa48("10134") ? "Stryker was here!" : (stryCov_9fa48("10134"), '')} ${ineligible ? stryMutAct_9fa48("10135") ? "" : (stryCov_9fa48("10135"), 'action-card--ineligible') : stryMutAct_9fa48("10136") ? "Stryker was here!" : (stryCov_9fa48("10136"), '')} ${complete ? stryMutAct_9fa48("10137") ? "" : (stryCov_9fa48("10137"), 'action-card--completed') : stryMutAct_9fa48("10138") ? "Stryker was here!" : (stryCov_9fa48("10138"), '')}`)}>
                {/* Icon and title */}
                <div className="action-card__header">
                  <div className={stryMutAct_9fa48("10139") ? `` : (stryCov_9fa48("10139"), `action-card__icon ${complete ? stryMutAct_9fa48("10140") ? "" : (stryCov_9fa48("10140"), 'action-card__icon--complete') : ineligible ? stryMutAct_9fa48("10141") ? "" : (stryCov_9fa48("10141"), 'action-card__icon--ineligible') : locked ? stryMutAct_9fa48("10142") ? "" : (stryCov_9fa48("10142"), 'action-card__icon--locked') : stryMutAct_9fa48("10143") ? "Stryker was here!" : (stryCov_9fa48("10143"), '')}`)}>
                    {complete ? <span>✔</span> : ineligible ? <span>❌</span> : <span className="action-card__number">
                        {stryMutAct_9fa48("10144") ? index - 1 : (stryCov_9fa48("10144"), index + 1)}
                      </span>}
                  </div>
                  <div className="action-card__title">{section.label}</div>
                  <div className="action-card__description">{section.description}</div>
                </div>
                
                {/* Details section */}
                <div className="action-card__details">
                  {/* Ineligible state message */}
                  {stryMutAct_9fa48("10147") ? section.key === 'application' && ineligible || <div className="action-card__ineligible-message">
                      You do not meet our current eligibility requirements.
                    </div> : stryMutAct_9fa48("10146") ? false : stryMutAct_9fa48("10145") ? true : (stryCov_9fa48("10145", "10146", "10147"), (stryMutAct_9fa48("10149") ? section.key === 'application' || ineligible : stryMutAct_9fa48("10148") ? true : (stryCov_9fa48("10148", "10149"), (stryMutAct_9fa48("10151") ? section.key !== 'application' : stryMutAct_9fa48("10150") ? true : (stryCov_9fa48("10150", "10151"), section.key === (stryMutAct_9fa48("10152") ? "" : (stryCov_9fa48("10152"), 'application')))) && ineligible)) && <div className="action-card__ineligible-message">
                      You do not meet our current eligibility requirements.
                    </div>)}
                  
                  {/* Locked state message for workshop */}
                  {stryMutAct_9fa48("10155") ? section.key === 'workshop' && locked || <div className="action-card__locked-message">
                      Workshop sign-up will be available after your application is reviewed and you are invited to the next stage.
                    </div> : stryMutAct_9fa48("10154") ? false : stryMutAct_9fa48("10153") ? true : (stryCov_9fa48("10153", "10154", "10155"), (stryMutAct_9fa48("10157") ? section.key === 'workshop' || locked : stryMutAct_9fa48("10156") ? true : (stryCov_9fa48("10156", "10157"), (stryMutAct_9fa48("10159") ? section.key !== 'workshop' : stryMutAct_9fa48("10158") ? true : (stryCov_9fa48("10158", "10159"), section.key === (stryMutAct_9fa48("10160") ? "" : (stryCov_9fa48("10160"), 'workshop')))) && locked)) && <div className="action-card__locked-message">
                      Workshop sign-up will be available after your application is reviewed and you are invited to the next stage.
                    </div>)}
                  
                  {/* Locked state message for pledge */}
                  {stryMutAct_9fa48("10163") ? section.key === 'pledge' && locked || <div className="action-card__locked-message">
                      Pledge will be available after you are admitted to the program.
                    </div> : stryMutAct_9fa48("10162") ? false : stryMutAct_9fa48("10161") ? true : (stryCov_9fa48("10161", "10162", "10163"), (stryMutAct_9fa48("10165") ? section.key === 'pledge' || locked : stryMutAct_9fa48("10164") ? true : (stryCov_9fa48("10164", "10165"), (stryMutAct_9fa48("10167") ? section.key !== 'pledge' : stryMutAct_9fa48("10166") ? true : (stryCov_9fa48("10166", "10167"), section.key === (stryMutAct_9fa48("10168") ? "" : (stryCov_9fa48("10168"), 'pledge')))) && locked)) && <div className="action-card__locked-message">
                      Pledge will be available after you are admitted to the program.
                    </div>)}

                  {stryMutAct_9fa48("10171") ? section.key === 'application' && status === 'in process' || <div className="session-details__container">
                      <div className="session-details">
                        <div className="session-details__icon">💾</div>
                        <div className="session-details__content">
                          <div className="session-details__date">Progress Saved</div>
                          <div className="session-details__time">{getApplicationProgressText()}</div>
                        </div>
                      </div>
                    </div> : stryMutAct_9fa48("10170") ? false : stryMutAct_9fa48("10169") ? true : (stryCov_9fa48("10169", "10170", "10171"), (stryMutAct_9fa48("10173") ? section.key === 'application' || status === 'in process' : stryMutAct_9fa48("10172") ? true : (stryCov_9fa48("10172", "10173"), (stryMutAct_9fa48("10175") ? section.key !== 'application' : stryMutAct_9fa48("10174") ? true : (stryCov_9fa48("10174", "10175"), section.key === (stryMutAct_9fa48("10176") ? "" : (stryCov_9fa48("10176"), 'application')))) && (stryMutAct_9fa48("10178") ? status !== 'in process' : stryMutAct_9fa48("10177") ? true : (stryCov_9fa48("10177", "10178"), status === (stryMutAct_9fa48("10179") ? "" : (stryCov_9fa48("10179"), 'in process')))))) && <div className="session-details__container">
                      <div className="session-details">
                        <div className="session-details__icon">💾</div>
                        <div className="session-details__content">
                          <div className="session-details__date">Progress Saved</div>
                          <div className="session-details__time">{getApplicationProgressText()}</div>
                        </div>
                      </div>
                    </div>)}
                  

                  {stryMutAct_9fa48("10182") ? section.key === 'infoSession' && (status === 'signed-up' || status === 'attended') && sessionDetails || <div className="session-details__container">
                      {getSessionDetailsText()}
                      {status === 'attended' && <div className="session-details__attended-badge">
                          ✅ Attended
                        </div>}
                    </div> : stryMutAct_9fa48("10181") ? false : stryMutAct_9fa48("10180") ? true : (stryCov_9fa48("10180", "10181", "10182"), (stryMutAct_9fa48("10184") ? section.key === 'infoSession' && (status === 'signed-up' || status === 'attended') || sessionDetails : stryMutAct_9fa48("10183") ? true : (stryCov_9fa48("10183", "10184"), (stryMutAct_9fa48("10186") ? section.key === 'infoSession' || status === 'signed-up' || status === 'attended' : stryMutAct_9fa48("10185") ? true : (stryCov_9fa48("10185", "10186"), (stryMutAct_9fa48("10188") ? section.key !== 'infoSession' : stryMutAct_9fa48("10187") ? true : (stryCov_9fa48("10187", "10188"), section.key === (stryMutAct_9fa48("10189") ? "" : (stryCov_9fa48("10189"), 'infoSession')))) && (stryMutAct_9fa48("10191") ? status === 'signed-up' && status === 'attended' : stryMutAct_9fa48("10190") ? true : (stryCov_9fa48("10190", "10191"), (stryMutAct_9fa48("10193") ? status !== 'signed-up' : stryMutAct_9fa48("10192") ? false : (stryCov_9fa48("10192", "10193"), status === (stryMutAct_9fa48("10194") ? "" : (stryCov_9fa48("10194"), 'signed-up')))) || (stryMutAct_9fa48("10196") ? status !== 'attended' : stryMutAct_9fa48("10195") ? false : (stryCov_9fa48("10195", "10196"), status === (stryMutAct_9fa48("10197") ? "" : (stryCov_9fa48("10197"), 'attended')))))))) && sessionDetails)) && <div className="session-details__container">
                      {getSessionDetailsText()}
                      {stryMutAct_9fa48("10200") ? status === 'attended' || <div className="session-details__attended-badge">
                          ✅ Attended
                        </div> : stryMutAct_9fa48("10199") ? false : stryMutAct_9fa48("10198") ? true : (stryCov_9fa48("10198", "10199", "10200"), (stryMutAct_9fa48("10202") ? status !== 'attended' : stryMutAct_9fa48("10201") ? true : (stryCov_9fa48("10201", "10202"), status === (stryMutAct_9fa48("10203") ? "" : (stryCov_9fa48("10203"), 'attended')))) && <div className="session-details__attended-badge">
                          ✅ Attended
                        </div>)}
                    </div>)}
                  
                  {stryMutAct_9fa48("10206") ? section.key === 'workshop' && (status === 'signed-up' || status === 'attended') && workshopDetails || <div className="session-details__container">
                      {getWorkshopDetailsText()}
                      {status === 'attended' && <div className="session-details__attended-badge">
                          ✅ Attended
                        </div>}
                    </div> : stryMutAct_9fa48("10205") ? false : stryMutAct_9fa48("10204") ? true : (stryCov_9fa48("10204", "10205", "10206"), (stryMutAct_9fa48("10208") ? section.key === 'workshop' && (status === 'signed-up' || status === 'attended') || workshopDetails : stryMutAct_9fa48("10207") ? true : (stryCov_9fa48("10207", "10208"), (stryMutAct_9fa48("10210") ? section.key === 'workshop' || status === 'signed-up' || status === 'attended' : stryMutAct_9fa48("10209") ? true : (stryCov_9fa48("10209", "10210"), (stryMutAct_9fa48("10212") ? section.key !== 'workshop' : stryMutAct_9fa48("10211") ? true : (stryCov_9fa48("10211", "10212"), section.key === (stryMutAct_9fa48("10213") ? "" : (stryCov_9fa48("10213"), 'workshop')))) && (stryMutAct_9fa48("10215") ? status === 'signed-up' && status === 'attended' : stryMutAct_9fa48("10214") ? true : (stryCov_9fa48("10214", "10215"), (stryMutAct_9fa48("10217") ? status !== 'signed-up' : stryMutAct_9fa48("10216") ? false : (stryCov_9fa48("10216", "10217"), status === (stryMutAct_9fa48("10218") ? "" : (stryCov_9fa48("10218"), 'signed-up')))) || (stryMutAct_9fa48("10220") ? status !== 'attended' : stryMutAct_9fa48("10219") ? false : (stryCov_9fa48("10219", "10220"), status === (stryMutAct_9fa48("10221") ? "" : (stryCov_9fa48("10221"), 'attended')))))))) && workshopDetails)) && <div className="session-details__container">
                      {getWorkshopDetailsText()}
                      {stryMutAct_9fa48("10224") ? status === 'attended' || <div className="session-details__attended-badge">
                          ✅ Attended
                        </div> : stryMutAct_9fa48("10223") ? false : stryMutAct_9fa48("10222") ? true : (stryCov_9fa48("10222", "10223", "10224"), (stryMutAct_9fa48("10226") ? status !== 'attended' : stryMutAct_9fa48("10225") ? true : (stryCov_9fa48("10225", "10226"), status === (stryMutAct_9fa48("10227") ? "" : (stryCov_9fa48("10227"), 'attended')))) && <div className="session-details__attended-badge">
                          ✅ Attended
                        </div>)}
                    </div>)}

                  {/* Pledge completed details with review buttons */}
                  {stryMutAct_9fa48("10230") ? section.key === 'pledge' && status === 'completed' || <div className="pledge-review-buttons" style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    justifyContent: 'center',
                    margin: '15px 0'
                  }}>
                        <button onClick={() => {
                      // Show Pledge content modal
                      const modal = document.createElement('div');
                      modal.innerHTML = `
                              <div class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center;" onclick="this.remove()">
                                <div style="background: var(--color-background-dark); padding: 30px; border-radius: 12px; max-width: 800px; max-height: 80vh; overflow-y: auto; margin: 20px;" onclick="event.stopPropagation()">
                                  <h3 style="color: #4242ea; margin-bottom: 20px;">PURSUIT AI-Native Program Pledge</h3>
                                  <div style="line-height: 1.6;">
                                    <h4>Everyone in the AI-Native Program is a Builder</h4>
                                    <p>The world is evolving at an unprecedented pace, driven by technology and innovation. By taking this pledge, you're committing not just to learn, but to drive your own transformation. You'll gain the skills to build powerful apps, harness the potential of AI, and position yourself as a leader in this rapidly changing digital age.</p>
                                    <p>This is your opportunity to become not just a consumer of technology, but a creator—an AI-native who shapes the future. Let's embark on this journey together.</p>
                                    
                                    <h4>As a Builder in the Pursuit AI-native Program, I commit to embracing learning and building with passion, curiosity, and determination. I pledge to:</h4>
                                    
                                    <h4>Learning</h4>
                                    <ul>
                                      <li>Cultivate a growth mindset, and engage deeply with every aspect of the program, such as workshops, projects, and community events.</li>
                                      <li>Drive my own learning through consistent practice and research.</li>
                                      <li>Share my learning openly and teach others.</li>
                                    </ul>
                                    
                                    <h4>Community</h4>
                                    <ul>
                                      <li>Foster a positive, inclusive, supportive community environment.</li>
                                      <li>Uphold Pursuit's code of conduct</li>
                                    </ul>
                                    
                                    <h4>Adapting</h4>
                                    <ul>
                                      <li>Embrace the uncertainty and fluidity of this ever-evolving program and the AI field itself.</li>
                                      <li>Remain resilient in the face of challenges, demonstrating initiative to solve problems.</li>
                                    </ul>
                                    
                                    <h4>Building</h4>
                                    <ul>
                                      <li>Consistently work on projects and apply my learning to real-world scenarios.</li>
                                      <li>Be proactive in seeking opportunities to build and create.</li>
                                      <li>Embrace a "building in public" approach to share my journey and contribute to the AI community.</li>
                                    </ul>
                                  </div>
                                  <button onclick="this.closest('.modal-overlay').remove()" style="background: #4242ea; color: white; border: none; padding: 8px 16px; border-radius: 6px; margin-top: 20px; cursor: pointer;">Close</button>
                                </div>
                              </div>
                            `;
                      document.body.appendChild(modal);
                    }} style={{
                      background: 'rgba(66, 66, 234, 0.1)',
                      color: 'var(--color-primary)',
                      padding: '10px 16px',
                      border: '1px solid var(--color-primary)',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }} onMouseEnter={e => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
                    }} onMouseLeave={e => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                    }}>
                          📜 Review Pledge
                        </button>
                        <button onClick={() => {
                      // Show Code of Conduct modal (we'll implement this)
                      const modal = document.createElement('div');
                      modal.innerHTML = `
                              <div class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center;" onclick="this.remove()">
                                <div style="background: var(--color-background-dark); padding: 30px; border-radius: 12px; max-width: 600px; max-height: 80vh; overflow-y: auto; margin: 20px;" onclick="event.stopPropagation()">
                                  <h3 style="color: #4242ea; margin-bottom: 20px;">Code of Conduct</h3>
                                  <div style="line-height: 1.6;">
                                    <p><strong>Mutual Respect:</strong> We foster an environment where everyone feels valued, heard, and respected, regardless of background, identity, or experience level.</p>
                                    <p><strong>Collaborative Learning:</strong> We commit to learning together, sharing knowledge openly, and supporting each other's growth without judgment.</p>
                                    <p><strong>Constructive Communication:</strong> We communicate thoughtfully and constructively, offering feedback that helps others improve while maintaining kindness and professionalism.</p>
                                    <p><strong>Inclusive Participation:</strong> We actively work to include all voices and perspectives, ensuring that everyone has the opportunity to contribute and succeed.</p>
                                    <p><strong>Accountability:</strong> We take responsibility for our actions, admit our mistakes, and work together to create solutions that benefit the entire community.</p>
                                  </div>
                                  <button onclick="this.closest('.modal-overlay').remove()" style="background: #4242ea; color: white; border: none; padding: 8px 16px; border-radius: 6px; margin-top: 20px; cursor: pointer;">Close</button>
                                </div>
                              </div>
                            `;
                      document.body.appendChild(modal);
                    }} style={{
                      background: 'rgba(108, 117, 125, 0.1)',
                      color: 'var(--color-secondary)',
                      padding: '10px 16px',
                      border: '1px solid var(--color-secondary)',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }} onMouseEnter={e => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
                    }} onMouseLeave={e => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                    }}>
                          📋 Code of Conduct
                        </button>
                        <button onClick={() => {
                      // Show Program Details modal
                      const modal = document.createElement('div');
                      modal.innerHTML = `
                              <div class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center;" onclick="this.remove()">
                                <div style="background: var(--color-background-dark); padding: 30px; border-radius: 12px; max-width: 700px; max-height: 80vh; overflow-y: auto; margin: 20px;" onclick="event.stopPropagation()">
                                  <h3 style="color: #4242ea; margin-bottom: 20px;">AI-Native Program Details</h3>
                                  <div style="line-height: 1.6;">
                                    <h4>Program Overview</h4>
                                    <p>The Pursuit AI-Native Program is a 7-month intensive program designed to empower individuals to become AI-natives, capable of securing good jobs and leading in the AI-driven future.</p>
                                    <h4>Core Pillars</h4>
                                    <ul>
                                      <li><strong>AI-Powered Individual Learning:</strong> Utilizing AI tools for personalized learning pathways and skill development.</li>
                                      <li><strong>Self-Driven, Active Learning Through Building:</strong> Focusing on practical application and project-based learning.</li>
                                      <li><strong>Many-to-Many Learning and Teaching:</strong> Fostering a collaborative environment where participants learn from each other.</li>
                                    </ul>
                                    <h4>What You'll Build</h4>
                                    <p>Throughout the program, you'll work on real-world AI projects, develop modern applications, and create solutions that demonstrate your AI-native capabilities.</p>
                                  </div>
                                  <button onclick="this.closest('.modal-overlay').remove()" style="background: #4242ea; color: white; border: none; padding: 8px 16px; border-radius: 6px; margin-top: 20px; cursor: pointer;">Close</button>
                                </div>
                              </div>
                            `;
                      document.body.appendChild(modal);
                    }} style={{
                      background: 'rgba(40, 167, 69, 0.1)',
                      color: '#28a745',
                      padding: '10px 16px',
                      border: '1px solid #28a745',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }} onMouseEnter={e => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
                    }} onMouseLeave={e => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                    }}>
                          📚 Program Details
                        </button>
                      </div> : stryMutAct_9fa48("10229") ? false : stryMutAct_9fa48("10228") ? true : (stryCov_9fa48("10228", "10229", "10230"), (stryMutAct_9fa48("10232") ? section.key === 'pledge' || status === 'completed' : stryMutAct_9fa48("10231") ? true : (stryCov_9fa48("10231", "10232"), (stryMutAct_9fa48("10234") ? section.key !== 'pledge' : stryMutAct_9fa48("10233") ? true : (stryCov_9fa48("10233", "10234"), section.key === (stryMutAct_9fa48("10235") ? "" : (stryCov_9fa48("10235"), 'pledge')))) && (stryMutAct_9fa48("10237") ? status !== 'completed' : stryMutAct_9fa48("10236") ? true : (stryCov_9fa48("10236", "10237"), status === (stryMutAct_9fa48("10238") ? "" : (stryCov_9fa48("10238"), 'completed')))))) && <div className="pledge-review-buttons" style={stryMutAct_9fa48("10239") ? {} : (stryCov_9fa48("10239"), {
                    display: stryMutAct_9fa48("10240") ? "" : (stryCov_9fa48("10240"), 'flex'),
                    flexWrap: stryMutAct_9fa48("10241") ? "" : (stryCov_9fa48("10241"), 'wrap'),
                    gap: stryMutAct_9fa48("10242") ? "" : (stryCov_9fa48("10242"), '10px'),
                    justifyContent: stryMutAct_9fa48("10243") ? "" : (stryCov_9fa48("10243"), 'center'),
                    margin: stryMutAct_9fa48("10244") ? "" : (stryCov_9fa48("10244"), '15px 0')
                  })}>
                        <button onClick={() => {
                      if (stryMutAct_9fa48("10245")) {
                        {}
                      } else {
                        stryCov_9fa48("10245");
                        // Show Pledge content modal
                        const modal = document.createElement(stryMutAct_9fa48("10246") ? "" : (stryCov_9fa48("10246"), 'div'));
                        modal.innerHTML = stryMutAct_9fa48("10247") ? `` : (stryCov_9fa48("10247"), `
                              <div class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center;" onclick="this.remove()">
                                <div style="background: var(--color-background-dark); padding: 30px; border-radius: 12px; max-width: 800px; max-height: 80vh; overflow-y: auto; margin: 20px;" onclick="event.stopPropagation()">
                                  <h3 style="color: #4242ea; margin-bottom: 20px;">PURSUIT AI-Native Program Pledge</h3>
                                  <div style="line-height: 1.6;">
                                    <h4>Everyone in the AI-Native Program is a Builder</h4>
                                    <p>The world is evolving at an unprecedented pace, driven by technology and innovation. By taking this pledge, you're committing not just to learn, but to drive your own transformation. You'll gain the skills to build powerful apps, harness the potential of AI, and position yourself as a leader in this rapidly changing digital age.</p>
                                    <p>This is your opportunity to become not just a consumer of technology, but a creator—an AI-native who shapes the future. Let's embark on this journey together.</p>
                                    
                                    <h4>As a Builder in the Pursuit AI-native Program, I commit to embracing learning and building with passion, curiosity, and determination. I pledge to:</h4>
                                    
                                    <h4>Learning</h4>
                                    <ul>
                                      <li>Cultivate a growth mindset, and engage deeply with every aspect of the program, such as workshops, projects, and community events.</li>
                                      <li>Drive my own learning through consistent practice and research.</li>
                                      <li>Share my learning openly and teach others.</li>
                                    </ul>
                                    
                                    <h4>Community</h4>
                                    <ul>
                                      <li>Foster a positive, inclusive, supportive community environment.</li>
                                      <li>Uphold Pursuit's code of conduct</li>
                                    </ul>
                                    
                                    <h4>Adapting</h4>
                                    <ul>
                                      <li>Embrace the uncertainty and fluidity of this ever-evolving program and the AI field itself.</li>
                                      <li>Remain resilient in the face of challenges, demonstrating initiative to solve problems.</li>
                                    </ul>
                                    
                                    <h4>Building</h4>
                                    <ul>
                                      <li>Consistently work on projects and apply my learning to real-world scenarios.</li>
                                      <li>Be proactive in seeking opportunities to build and create.</li>
                                      <li>Embrace a "building in public" approach to share my journey and contribute to the AI community.</li>
                                    </ul>
                                  </div>
                                  <button onclick="this.closest('.modal-overlay').remove()" style="background: #4242ea; color: white; border: none; padding: 8px 16px; border-radius: 6px; margin-top: 20px; cursor: pointer;">Close</button>
                                </div>
                              </div>
                            `);
                        document.body.appendChild(modal);
                      }
                    }} style={stryMutAct_9fa48("10248") ? {} : (stryCov_9fa48("10248"), {
                      background: stryMutAct_9fa48("10249") ? "" : (stryCov_9fa48("10249"), 'rgba(66, 66, 234, 0.1)'),
                      color: stryMutAct_9fa48("10250") ? "" : (stryCov_9fa48("10250"), 'var(--color-primary)'),
                      padding: stryMutAct_9fa48("10251") ? "" : (stryCov_9fa48("10251"), '10px 16px'),
                      border: stryMutAct_9fa48("10252") ? "" : (stryCov_9fa48("10252"), '1px solid var(--color-primary)'),
                      borderRadius: stryMutAct_9fa48("10253") ? "" : (stryCov_9fa48("10253"), '8px'),
                      fontSize: stryMutAct_9fa48("10254") ? "" : (stryCov_9fa48("10254"), '0.85rem'),
                      fontWeight: stryMutAct_9fa48("10255") ? "" : (stryCov_9fa48("10255"), '600'),
                      transition: stryMutAct_9fa48("10256") ? "" : (stryCov_9fa48("10256"), 'all 0.2s'),
                      cursor: stryMutAct_9fa48("10257") ? "" : (stryCov_9fa48("10257"), 'pointer'),
                      boxShadow: stryMutAct_9fa48("10258") ? "" : (stryCov_9fa48("10258"), '0 2px 4px rgba(0, 0, 0, 0.1)')
                    })} onMouseEnter={e => {
                      if (stryMutAct_9fa48("10259")) {
                        {}
                      } else {
                        stryCov_9fa48("10259");
                        e.target.style.transform = stryMutAct_9fa48("10260") ? "" : (stryCov_9fa48("10260"), "translateY(-2px)");
                        e.target.style.boxShadow = stryMutAct_9fa48("10261") ? "" : (stryCov_9fa48("10261"), "0 4px 8px rgba(0, 0, 0, 0.15)");
                      }
                    }} onMouseLeave={e => {
                      if (stryMutAct_9fa48("10262")) {
                        {}
                      } else {
                        stryCov_9fa48("10262");
                        e.target.style.transform = stryMutAct_9fa48("10263") ? "" : (stryCov_9fa48("10263"), "translateY(0)");
                        e.target.style.boxShadow = stryMutAct_9fa48("10264") ? "" : (stryCov_9fa48("10264"), "0 2px 4px rgba(0, 0, 0, 0.1)");
                      }
                    }}>
                          📜 Review Pledge
                        </button>
                        <button onClick={() => {
                      if (stryMutAct_9fa48("10265")) {
                        {}
                      } else {
                        stryCov_9fa48("10265");
                        // Show Code of Conduct modal (we'll implement this)
                        const modal = document.createElement(stryMutAct_9fa48("10266") ? "" : (stryCov_9fa48("10266"), 'div'));
                        modal.innerHTML = stryMutAct_9fa48("10267") ? `` : (stryCov_9fa48("10267"), `
                              <div class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center;" onclick="this.remove()">
                                <div style="background: var(--color-background-dark); padding: 30px; border-radius: 12px; max-width: 600px; max-height: 80vh; overflow-y: auto; margin: 20px;" onclick="event.stopPropagation()">
                                  <h3 style="color: #4242ea; margin-bottom: 20px;">Code of Conduct</h3>
                                  <div style="line-height: 1.6;">
                                    <p><strong>Mutual Respect:</strong> We foster an environment where everyone feels valued, heard, and respected, regardless of background, identity, or experience level.</p>
                                    <p><strong>Collaborative Learning:</strong> We commit to learning together, sharing knowledge openly, and supporting each other's growth without judgment.</p>
                                    <p><strong>Constructive Communication:</strong> We communicate thoughtfully and constructively, offering feedback that helps others improve while maintaining kindness and professionalism.</p>
                                    <p><strong>Inclusive Participation:</strong> We actively work to include all voices and perspectives, ensuring that everyone has the opportunity to contribute and succeed.</p>
                                    <p><strong>Accountability:</strong> We take responsibility for our actions, admit our mistakes, and work together to create solutions that benefit the entire community.</p>
                                  </div>
                                  <button onclick="this.closest('.modal-overlay').remove()" style="background: #4242ea; color: white; border: none; padding: 8px 16px; border-radius: 6px; margin-top: 20px; cursor: pointer;">Close</button>
                                </div>
                              </div>
                            `);
                        document.body.appendChild(modal);
                      }
                    }} style={stryMutAct_9fa48("10268") ? {} : (stryCov_9fa48("10268"), {
                      background: stryMutAct_9fa48("10269") ? "" : (stryCov_9fa48("10269"), 'rgba(108, 117, 125, 0.1)'),
                      color: stryMutAct_9fa48("10270") ? "" : (stryCov_9fa48("10270"), 'var(--color-secondary)'),
                      padding: stryMutAct_9fa48("10271") ? "" : (stryCov_9fa48("10271"), '10px 16px'),
                      border: stryMutAct_9fa48("10272") ? "" : (stryCov_9fa48("10272"), '1px solid var(--color-secondary)'),
                      borderRadius: stryMutAct_9fa48("10273") ? "" : (stryCov_9fa48("10273"), '8px'),
                      fontSize: stryMutAct_9fa48("10274") ? "" : (stryCov_9fa48("10274"), '0.85rem'),
                      fontWeight: stryMutAct_9fa48("10275") ? "" : (stryCov_9fa48("10275"), '600'),
                      cursor: stryMutAct_9fa48("10276") ? "" : (stryCov_9fa48("10276"), 'pointer'),
                      transition: stryMutAct_9fa48("10277") ? "" : (stryCov_9fa48("10277"), 'all 0.2s'),
                      boxShadow: stryMutAct_9fa48("10278") ? "" : (stryCov_9fa48("10278"), '0 2px 4px rgba(0, 0, 0, 0.1)')
                    })} onMouseEnter={e => {
                      if (stryMutAct_9fa48("10279")) {
                        {}
                      } else {
                        stryCov_9fa48("10279");
                        e.target.style.transform = stryMutAct_9fa48("10280") ? "" : (stryCov_9fa48("10280"), "translateY(-2px)");
                        e.target.style.boxShadow = stryMutAct_9fa48("10281") ? "" : (stryCov_9fa48("10281"), "0 4px 8px rgba(0, 0, 0, 0.15)");
                      }
                    }} onMouseLeave={e => {
                      if (stryMutAct_9fa48("10282")) {
                        {}
                      } else {
                        stryCov_9fa48("10282");
                        e.target.style.transform = stryMutAct_9fa48("10283") ? "" : (stryCov_9fa48("10283"), "translateY(0)");
                        e.target.style.boxShadow = stryMutAct_9fa48("10284") ? "" : (stryCov_9fa48("10284"), "0 2px 4px rgba(0, 0, 0, 0.1)");
                      }
                    }}>
                          📋 Code of Conduct
                        </button>
                        <button onClick={() => {
                      if (stryMutAct_9fa48("10285")) {
                        {}
                      } else {
                        stryCov_9fa48("10285");
                        // Show Program Details modal
                        const modal = document.createElement(stryMutAct_9fa48("10286") ? "" : (stryCov_9fa48("10286"), 'div'));
                        modal.innerHTML = stryMutAct_9fa48("10287") ? `` : (stryCov_9fa48("10287"), `
                              <div class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center;" onclick="this.remove()">
                                <div style="background: var(--color-background-dark); padding: 30px; border-radius: 12px; max-width: 700px; max-height: 80vh; overflow-y: auto; margin: 20px;" onclick="event.stopPropagation()">
                                  <h3 style="color: #4242ea; margin-bottom: 20px;">AI-Native Program Details</h3>
                                  <div style="line-height: 1.6;">
                                    <h4>Program Overview</h4>
                                    <p>The Pursuit AI-Native Program is a 7-month intensive program designed to empower individuals to become AI-natives, capable of securing good jobs and leading in the AI-driven future.</p>
                                    <h4>Core Pillars</h4>
                                    <ul>
                                      <li><strong>AI-Powered Individual Learning:</strong> Utilizing AI tools for personalized learning pathways and skill development.</li>
                                      <li><strong>Self-Driven, Active Learning Through Building:</strong> Focusing on practical application and project-based learning.</li>
                                      <li><strong>Many-to-Many Learning and Teaching:</strong> Fostering a collaborative environment where participants learn from each other.</li>
                                    </ul>
                                    <h4>What You'll Build</h4>
                                    <p>Throughout the program, you'll work on real-world AI projects, develop modern applications, and create solutions that demonstrate your AI-native capabilities.</p>
                                  </div>
                                  <button onclick="this.closest('.modal-overlay').remove()" style="background: #4242ea; color: white; border: none; padding: 8px 16px; border-radius: 6px; margin-top: 20px; cursor: pointer;">Close</button>
                                </div>
                              </div>
                            `);
                        document.body.appendChild(modal);
                      }
                    }} style={stryMutAct_9fa48("10288") ? {} : (stryCov_9fa48("10288"), {
                      background: stryMutAct_9fa48("10289") ? "" : (stryCov_9fa48("10289"), 'rgba(40, 167, 69, 0.1)'),
                      color: stryMutAct_9fa48("10290") ? "" : (stryCov_9fa48("10290"), '#28a745'),
                      padding: stryMutAct_9fa48("10291") ? "" : (stryCov_9fa48("10291"), '10px 16px'),
                      border: stryMutAct_9fa48("10292") ? "" : (stryCov_9fa48("10292"), '1px solid #28a745'),
                      borderRadius: stryMutAct_9fa48("10293") ? "" : (stryCov_9fa48("10293"), '8px'),
                      fontSize: stryMutAct_9fa48("10294") ? "" : (stryCov_9fa48("10294"), '0.85rem'),
                      fontWeight: stryMutAct_9fa48("10295") ? "" : (stryCov_9fa48("10295"), '600'),
                      cursor: stryMutAct_9fa48("10296") ? "" : (stryCov_9fa48("10296"), 'pointer'),
                      transition: stryMutAct_9fa48("10297") ? "" : (stryCov_9fa48("10297"), 'all 0.2s'),
                      boxShadow: stryMutAct_9fa48("10298") ? "" : (stryCov_9fa48("10298"), '0 2px 4px rgba(0, 0, 0, 0.1)')
                    })} onMouseEnter={e => {
                      if (stryMutAct_9fa48("10299")) {
                        {}
                      } else {
                        stryCov_9fa48("10299");
                        e.target.style.transform = stryMutAct_9fa48("10300") ? "" : (stryCov_9fa48("10300"), "translateY(-2px)");
                        e.target.style.boxShadow = stryMutAct_9fa48("10301") ? "" : (stryCov_9fa48("10301"), "0 4px 8px rgba(0, 0, 0, 0.15)");
                      }
                    }} onMouseLeave={e => {
                      if (stryMutAct_9fa48("10302")) {
                        {}
                      } else {
                        stryCov_9fa48("10302");
                        e.target.style.transform = stryMutAct_9fa48("10303") ? "" : (stryCov_9fa48("10303"), "translateY(0)");
                        e.target.style.boxShadow = stryMutAct_9fa48("10304") ? "" : (stryCov_9fa48("10304"), "0 2px 4px rgba(0, 0, 0, 0.1)");
                      }
                    }}>
                          📚 Program Details
                        </button>
                      </div>)}
                </div>
                
                {/* Button */}
                <div className="action-card__button-container">
                  {(stryMutAct_9fa48("10307") ? ineligible || section.key === 'application' : stryMutAct_9fa48("10306") ? false : stryMutAct_9fa48("10305") ? true : (stryCov_9fa48("10305", "10306", "10307"), ineligible && (stryMutAct_9fa48("10309") ? section.key !== 'application' : stryMutAct_9fa48("10308") ? true : (stryCov_9fa48("10308", "10309"), section.key === (stryMutAct_9fa48("10310") ? "" : (stryCov_9fa48("10310"), 'application')))))) ? <div style={stryMutAct_9fa48("10311") ? {} : (stryCov_9fa48("10311"), {
                    display: stryMutAct_9fa48("10312") ? "" : (stryCov_9fa48("10312"), 'flex'),
                    flexDirection: stryMutAct_9fa48("10313") ? "" : (stryCov_9fa48("10313"), 'column'),
                    alignItems: stryMutAct_9fa48("10314") ? "" : (stryCov_9fa48("10314"), 'center'),
                    width: stryMutAct_9fa48("10315") ? "" : (stryCov_9fa48("10315"), '100%')
                  })}>
                      <div style={stryMutAct_9fa48("10316") ? {} : (stryCov_9fa48("10316"), {
                      fontStyle: stryMutAct_9fa48("10317") ? "" : (stryCov_9fa48("10317"), 'italic'),
                      marginBottom: stryMutAct_9fa48("10318") ? "" : (stryCov_9fa48("10318"), '12px'),
                      textAlign: stryMutAct_9fa48("10319") ? "" : (stryCov_9fa48("10319"), 'center'),
                      color: stryMutAct_9fa48("10320") ? "" : (stryCov_9fa48("10320"), 'var(--color-text-secondary)'),
                      fontSize: stryMutAct_9fa48("10321") ? "" : (stryCov_9fa48("10321"), '0.85rem')
                    })}>
                        Made a mistake?
                      </div>
                      <button style={getButtonStyle(stryMutAct_9fa48("10322") ? false : (stryCov_9fa48("10322"), true), stryMutAct_9fa48("10323") ? true : (stryCov_9fa48("10323"), false), stryMutAct_9fa48("10324") ? true : (stryCov_9fa48("10324"), false), stryMutAct_9fa48("10325") ? true : (stryCov_9fa48("10325"), false))} onClick={handleEditEligibility}>
                        <span>
                          ✏️ Edit Responses
                        </span>
                      </button>
                    </div> : ineligible ? <button style={getButtonStyle(stryMutAct_9fa48("10326") ? true : (stryCov_9fa48("10326"), false), stryMutAct_9fa48("10327") ? true : (stryCov_9fa48("10327"), false), stryMutAct_9fa48("10328") ? false : (stryCov_9fa48("10328"), true), stryMutAct_9fa48("10329") ? true : (stryCov_9fa48("10329"), false))} disabled={stryMutAct_9fa48("10330") ? false : (stryCov_9fa48("10330"), true)}>
                      <span>
                        ❌ {section.getButtonLabel(status)}
                      </span>
                    </button> : locked ? <button style={getButtonStyle(stryMutAct_9fa48("10331") ? true : (stryCov_9fa48("10331"), false), stryMutAct_9fa48("10332") ? false : (stryCov_9fa48("10332"), true), stryMutAct_9fa48("10333") ? true : (stryCov_9fa48("10333"), false), stryMutAct_9fa48("10334") ? true : (stryCov_9fa48("10334"), false))} disabled={stryMutAct_9fa48("10335") ? false : (stryCov_9fa48("10335"), true)}>
                      <span>
                        🔒 {section.getButtonLabel(status)}
                      </span>
                    </button> : <Link to={enabled ? (stryMutAct_9fa48("10338") ? section.key !== 'infoSession' : stryMutAct_9fa48("10337") ? false : stryMutAct_9fa48("10336") ? true : (stryCov_9fa48("10336", "10337", "10338"), section.key === (stryMutAct_9fa48("10339") ? "" : (stryCov_9fa48("10339"), 'infoSession')))) ? stryMutAct_9fa48("10340") ? "" : (stryCov_9fa48("10340"), '/info-sessions') : (stryMutAct_9fa48("10343") ? section.key !== 'workshop' : stryMutAct_9fa48("10342") ? false : stryMutAct_9fa48("10341") ? true : (stryCov_9fa48("10341", "10342", "10343"), section.key === (stryMutAct_9fa48("10344") ? "" : (stryCov_9fa48("10344"), 'workshop')))) ? stryMutAct_9fa48("10345") ? "" : (stryCov_9fa48("10345"), '/workshops') : (stryMutAct_9fa48("10348") ? section.key !== 'application' : stryMutAct_9fa48("10347") ? false : stryMutAct_9fa48("10346") ? true : (stryCov_9fa48("10346", "10347", "10348"), section.key === (stryMutAct_9fa48("10349") ? "" : (stryCov_9fa48("10349"), 'application')))) ? stryMutAct_9fa48("10350") ? "" : (stryCov_9fa48("10350"), '/application-form') : (stryMutAct_9fa48("10353") ? section.key !== 'pledge' : stryMutAct_9fa48("10352") ? false : stryMutAct_9fa48("10351") ? true : (stryCov_9fa48("10351", "10352", "10353"), section.key === (stryMutAct_9fa48("10354") ? "" : (stryCov_9fa48("10354"), 'pledge')))) ? stryMutAct_9fa48("10355") ? "" : (stryCov_9fa48("10355"), '/pledge') : stryMutAct_9fa48("10356") ? "" : (stryCov_9fa48("10356"), '#') : stryMutAct_9fa48("10357") ? "" : (stryCov_9fa48("10357"), '#')} className="action-card__button-link">
                      <button style={getButtonStyle(enabled, stryMutAct_9fa48("10358") ? true : (stryCov_9fa48("10358"), false), stryMutAct_9fa48("10359") ? true : (stryCov_9fa48("10359"), false), stryMutAct_9fa48("10362") ? section.key === 'application' || status === 'submitted' : stryMutAct_9fa48("10361") ? false : stryMutAct_9fa48("10360") ? true : (stryCov_9fa48("10360", "10361", "10362"), (stryMutAct_9fa48("10364") ? section.key !== 'application' : stryMutAct_9fa48("10363") ? true : (stryCov_9fa48("10363", "10364"), section.key === (stryMutAct_9fa48("10365") ? "" : (stryCov_9fa48("10365"), 'application')))) && (stryMutAct_9fa48("10367") ? status !== 'submitted' : stryMutAct_9fa48("10366") ? true : (stryCov_9fa48("10366", "10367"), status === (stryMutAct_9fa48("10368") ? "" : (stryCov_9fa48("10368"), 'submitted'))))), stryMutAct_9fa48("10371") ? (section.key === 'infoSession' && status === 'attended' || section.key === 'workshop' && status === 'attended') && section.key === 'pledge' && status === 'completed' : stryMutAct_9fa48("10370") ? false : stryMutAct_9fa48("10369") ? true : (stryCov_9fa48("10369", "10370", "10371"), (stryMutAct_9fa48("10373") ? section.key === 'infoSession' && status === 'attended' && section.key === 'workshop' && status === 'attended' : stryMutAct_9fa48("10372") ? false : (stryCov_9fa48("10372", "10373"), (stryMutAct_9fa48("10375") ? section.key === 'infoSession' || status === 'attended' : stryMutAct_9fa48("10374") ? false : (stryCov_9fa48("10374", "10375"), (stryMutAct_9fa48("10377") ? section.key !== 'infoSession' : stryMutAct_9fa48("10376") ? true : (stryCov_9fa48("10376", "10377"), section.key === (stryMutAct_9fa48("10378") ? "" : (stryCov_9fa48("10378"), 'infoSession')))) && (stryMutAct_9fa48("10380") ? status !== 'attended' : stryMutAct_9fa48("10379") ? true : (stryCov_9fa48("10379", "10380"), status === (stryMutAct_9fa48("10381") ? "" : (stryCov_9fa48("10381"), 'attended')))))) || (stryMutAct_9fa48("10383") ? section.key === 'workshop' || status === 'attended' : stryMutAct_9fa48("10382") ? false : (stryCov_9fa48("10382", "10383"), (stryMutAct_9fa48("10385") ? section.key !== 'workshop' : stryMutAct_9fa48("10384") ? true : (stryCov_9fa48("10384", "10385"), section.key === (stryMutAct_9fa48("10386") ? "" : (stryCov_9fa48("10386"), 'workshop')))) && (stryMutAct_9fa48("10388") ? status !== 'attended' : stryMutAct_9fa48("10387") ? true : (stryCov_9fa48("10387", "10388"), status === (stryMutAct_9fa48("10389") ? "" : (stryCov_9fa48("10389"), 'attended')))))))) || (stryMutAct_9fa48("10391") ? section.key === 'pledge' || status === 'completed' : stryMutAct_9fa48("10390") ? false : (stryCov_9fa48("10390", "10391"), (stryMutAct_9fa48("10393") ? section.key !== 'pledge' : stryMutAct_9fa48("10392") ? true : (stryCov_9fa48("10392", "10393"), section.key === (stryMutAct_9fa48("10394") ? "" : (stryCov_9fa48("10394"), 'pledge')))) && (stryMutAct_9fa48("10396") ? status !== 'completed' : stryMutAct_9fa48("10395") ? true : (stryCov_9fa48("10395", "10396"), status === (stryMutAct_9fa48("10397") ? "" : (stryCov_9fa48("10397"), 'completed'))))))))} disabled={stryMutAct_9fa48("10398") ? enabled : (stryCov_9fa48("10398"), !enabled)}>
                        {section.getButtonLabel(status)}
                      </button>
                    </Link>}
                </div>
              </div>;
            }
          })}
        </div>
      </div>
    </div>;
  }
}
export default ApplicantDashboard;