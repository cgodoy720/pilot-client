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
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaCheck, FaClock, FaExternalLinkAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Assessment.css';
function Assessment() {
  if (stryMutAct_9fa48("11535")) {
    {}
  } else {
    stryCov_9fa48("11535");
    const {
      token,
      user
    } = useAuth();
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState(stryMutAct_9fa48("11536") ? ["Stryker was here"] : (stryCov_9fa48("11536"), []));
    const [loading, setLoading] = useState(stryMutAct_9fa48("11537") ? false : (stryCov_9fa48("11537"), true));
    const [error, setError] = useState(stryMutAct_9fa48("11538") ? "Stryker was here!" : (stryCov_9fa48("11538"), ''));

    // Check if user has active status
    const isActive = stryMutAct_9fa48("11541") ? user?.active === false : stryMutAct_9fa48("11540") ? false : stryMutAct_9fa48("11539") ? true : (stryCov_9fa48("11539", "11540", "11541"), (stryMutAct_9fa48("11542") ? user.active : (stryCov_9fa48("11542"), user?.active)) !== (stryMutAct_9fa48("11543") ? true : (stryCov_9fa48("11543"), false)));
    useEffect(() => {
      if (stryMutAct_9fa48("11544")) {
        {}
      } else {
        stryCov_9fa48("11544");
        fetchAssessments();
      }
    }, stryMutAct_9fa48("11545") ? ["Stryker was here"] : (stryCov_9fa48("11545"), []));
    const fetchAssessments = async () => {
      if (stryMutAct_9fa48("11546")) {
        {}
      } else {
        stryCov_9fa48("11546");
        try {
          if (stryMutAct_9fa48("11547")) {
            {}
          } else {
            stryCov_9fa48("11547");
            setLoading(stryMutAct_9fa48("11548") ? false : (stryCov_9fa48("11548"), true));
            const response = await fetch(stryMutAct_9fa48("11549") ? `` : (stryCov_9fa48("11549"), `${import.meta.env.VITE_API_URL}/api/assessments`), stryMutAct_9fa48("11550") ? {} : (stryCov_9fa48("11550"), {
              headers: stryMutAct_9fa48("11551") ? {} : (stryCov_9fa48("11551"), {
                'Authorization': stryMutAct_9fa48("11552") ? `` : (stryCov_9fa48("11552"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("11553") ? "" : (stryCov_9fa48("11553"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("11555") ? false : stryMutAct_9fa48("11554") ? true : (stryCov_9fa48("11554", "11555"), response.ok)) {
              if (stryMutAct_9fa48("11556")) {
                {}
              } else {
                stryCov_9fa48("11556");
                const data = await response.json();
                setAssessments(stryMutAct_9fa48("11559") ? data.assessments && [] : stryMutAct_9fa48("11558") ? false : stryMutAct_9fa48("11557") ? true : (stryCov_9fa48("11557", "11558", "11559"), data.assessments || (stryMutAct_9fa48("11560") ? ["Stryker was here"] : (stryCov_9fa48("11560"), []))));
              }
            } else {
              if (stryMutAct_9fa48("11561")) {
                {}
              } else {
                stryCov_9fa48("11561");
                const errorData = await response.json();
                setError(stryMutAct_9fa48("11564") ? errorData.error && 'Failed to load assessments' : stryMutAct_9fa48("11563") ? false : stryMutAct_9fa48("11562") ? true : (stryCov_9fa48("11562", "11563", "11564"), errorData.error || (stryMutAct_9fa48("11565") ? "" : (stryCov_9fa48("11565"), 'Failed to load assessments'))));
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("11566")) {
            {}
          } else {
            stryCov_9fa48("11566");
            console.error(stryMutAct_9fa48("11567") ? "" : (stryCov_9fa48("11567"), 'Error fetching assessments:'), err);
            setError(stryMutAct_9fa48("11568") ? "" : (stryCov_9fa48("11568"), 'Unable to load assessments. Please try again later.'));
          }
        } finally {
          if (stryMutAct_9fa48("11569")) {
            {}
          } else {
            stryCov_9fa48("11569");
            setLoading(stryMutAct_9fa48("11570") ? true : (stryCov_9fa48("11570"), false));
          }
        }
      }
    };
    const getStatusIcon = assessment => {
      if (stryMutAct_9fa48("11571")) {
        {}
      } else {
        stryCov_9fa48("11571");
        // Check for resubmission requirements first
        if (stryMutAct_9fa48("11574") ? assessment.available && assessment.reason || assessment.reason.includes('resubmission') : stryMutAct_9fa48("11573") ? false : stryMutAct_9fa48("11572") ? true : (stryCov_9fa48("11572", "11573", "11574"), (stryMutAct_9fa48("11576") ? assessment.available || assessment.reason : stryMutAct_9fa48("11575") ? true : (stryCov_9fa48("11575", "11576"), assessment.available && assessment.reason)) && assessment.reason.includes(stryMutAct_9fa48("11577") ? "" : (stryCov_9fa48("11577"), 'resubmission')))) {
          if (stryMutAct_9fa48("11578")) {
            {}
          } else {
            stryCov_9fa48("11578");
            return <FaClock className="assessment__status-icon assessment__status-icon--resubmission" />;
          }
        }

        // Prioritize submission status over availability
        if (stryMutAct_9fa48("11581") ? assessment.submission_status !== 'submitted' : stryMutAct_9fa48("11580") ? false : stryMutAct_9fa48("11579") ? true : (stryCov_9fa48("11579", "11580", "11581"), assessment.submission_status === (stryMutAct_9fa48("11582") ? "" : (stryCov_9fa48("11582"), 'submitted')))) {
          if (stryMutAct_9fa48("11583")) {
            {}
          } else {
            stryCov_9fa48("11583");
            return <FaCheck className="assessment__status-icon assessment__status-icon--completed" />;
          }
        }
        if (stryMutAct_9fa48("11586") ? assessment.submission_status !== 'draft' : stryMutAct_9fa48("11585") ? false : stryMutAct_9fa48("11584") ? true : (stryCov_9fa48("11584", "11585", "11586"), assessment.submission_status === (stryMutAct_9fa48("11587") ? "" : (stryCov_9fa48("11587"), 'draft')))) {
          if (stryMutAct_9fa48("11588")) {
            {}
          } else {
            stryCov_9fa48("11588");
            return <FaClock className="assessment__status-icon assessment__status-icon--draft" />;
          }
        }
        if (stryMutAct_9fa48("11591") ? false : stryMutAct_9fa48("11590") ? true : stryMutAct_9fa48("11589") ? assessment.available : (stryCov_9fa48("11589", "11590", "11591"), !assessment.available)) {
          if (stryMutAct_9fa48("11592")) {
            {}
          } else {
            stryCov_9fa48("11592");
            return <FaLock className="assessment__status-icon assessment__status-icon--locked" />;
          }
        }
        return <FaClock className="assessment__status-icon assessment__status-icon--available" />;
      }
    };
    const getStatusText = assessment => {
      if (stryMutAct_9fa48("11593")) {
        {}
      } else {
        stryCov_9fa48("11593");
        // Check for resubmission requirements first
        if (stryMutAct_9fa48("11596") ? assessment.available && assessment.reason || assessment.reason.includes('resubmission') : stryMutAct_9fa48("11595") ? false : stryMutAct_9fa48("11594") ? true : (stryCov_9fa48("11594", "11595", "11596"), (stryMutAct_9fa48("11598") ? assessment.available || assessment.reason : stryMutAct_9fa48("11597") ? true : (stryCov_9fa48("11597", "11598"), assessment.available && assessment.reason)) && assessment.reason.includes(stryMutAct_9fa48("11599") ? "" : (stryCov_9fa48("11599"), 'resubmission')))) {
          if (stryMutAct_9fa48("11600")) {
            {}
          } else {
            stryCov_9fa48("11600");
            if (stryMutAct_9fa48("11602") ? false : stryMutAct_9fa48("11601") ? true : (stryCov_9fa48("11601", "11602"), assessment.reason.includes(stryMutAct_9fa48("11603") ? "" : (stryCov_9fa48("11603"), 'File resubmission')))) {
              if (stryMutAct_9fa48("11604")) {
                {}
              } else {
                stryCov_9fa48("11604");
                return stryMutAct_9fa48("11605") ? "" : (stryCov_9fa48("11605"), 'Files Required');
              }
            } else if (stryMutAct_9fa48("11607") ? false : stryMutAct_9fa48("11606") ? true : (stryCov_9fa48("11606", "11607"), assessment.reason.includes(stryMutAct_9fa48("11608") ? "" : (stryCov_9fa48("11608"), 'Video resubmission')))) {
              if (stryMutAct_9fa48("11609")) {
                {}
              } else {
                stryCov_9fa48("11609");
                return stryMutAct_9fa48("11610") ? "" : (stryCov_9fa48("11610"), 'Video Required');
              }
            } else if (stryMutAct_9fa48("11612") ? false : stryMutAct_9fa48("11611") ? true : (stryCov_9fa48("11611", "11612"), assessment.reason.includes(stryMutAct_9fa48("11613") ? "" : (stryCov_9fa48("11613"), 'Files and video resubmission')))) {
              if (stryMutAct_9fa48("11614")) {
                {}
              } else {
                stryCov_9fa48("11614");
                return stryMutAct_9fa48("11615") ? "" : (stryCov_9fa48("11615"), 'Files & Video Required');
              }
            } else {
              if (stryMutAct_9fa48("11616")) {
                {}
              } else {
                stryCov_9fa48("11616");
                return stryMutAct_9fa48("11617") ? "" : (stryCov_9fa48("11617"), 'Resubmission Required');
              }
            }
          }
        }

        // Prioritize submission status over availability
        if (stryMutAct_9fa48("11620") ? assessment.submission_status !== 'submitted' : stryMutAct_9fa48("11619") ? false : stryMutAct_9fa48("11618") ? true : (stryCov_9fa48("11618", "11619", "11620"), assessment.submission_status === (stryMutAct_9fa48("11621") ? "" : (stryCov_9fa48("11621"), 'submitted')))) {
          if (stryMutAct_9fa48("11622")) {
            {}
          } else {
            stryCov_9fa48("11622");
            return stryMutAct_9fa48("11623") ? "" : (stryCov_9fa48("11623"), 'Completed');
          }
        }
        if (stryMutAct_9fa48("11626") ? assessment.submission_status !== 'draft' : stryMutAct_9fa48("11625") ? false : stryMutAct_9fa48("11624") ? true : (stryCov_9fa48("11624", "11625", "11626"), assessment.submission_status === (stryMutAct_9fa48("11627") ? "" : (stryCov_9fa48("11627"), 'draft')))) {
          if (stryMutAct_9fa48("11628")) {
            {}
          } else {
            stryCov_9fa48("11628");
            return stryMutAct_9fa48("11629") ? "" : (stryCov_9fa48("11629"), 'In Progress');
          }
        }
        if (stryMutAct_9fa48("11632") ? false : stryMutAct_9fa48("11631") ? true : stryMutAct_9fa48("11630") ? assessment.available : (stryCov_9fa48("11630", "11631", "11632"), !assessment.available)) {
          if (stryMutAct_9fa48("11633")) {
            {}
          } else {
            stryCov_9fa48("11633");
            return stryMutAct_9fa48("11636") ? assessment.reason && 'Locked' : stryMutAct_9fa48("11635") ? false : stryMutAct_9fa48("11634") ? true : (stryCov_9fa48("11634", "11635", "11636"), assessment.reason || (stryMutAct_9fa48("11637") ? "" : (stryCov_9fa48("11637"), 'Locked')));
          }
        }
        return stryMutAct_9fa48("11638") ? "" : (stryCov_9fa48("11638"), 'Available');
      }
    };
    const getStatusClass = assessment => {
      if (stryMutAct_9fa48("11639")) {
        {}
      } else {
        stryCov_9fa48("11639");
        // Check for resubmission requirements first
        if (stryMutAct_9fa48("11642") ? assessment.available && assessment.reason || assessment.reason.includes('resubmission') : stryMutAct_9fa48("11641") ? false : stryMutAct_9fa48("11640") ? true : (stryCov_9fa48("11640", "11641", "11642"), (stryMutAct_9fa48("11644") ? assessment.available || assessment.reason : stryMutAct_9fa48("11643") ? true : (stryCov_9fa48("11643", "11644"), assessment.available && assessment.reason)) && assessment.reason.includes(stryMutAct_9fa48("11645") ? "" : (stryCov_9fa48("11645"), 'resubmission')))) {
          if (stryMutAct_9fa48("11646")) {
            {}
          } else {
            stryCov_9fa48("11646");
            return stryMutAct_9fa48("11647") ? "" : (stryCov_9fa48("11647"), 'assessment__status--resubmission');
          }
        }

        // Prioritize submission status over availability
        if (stryMutAct_9fa48("11650") ? assessment.submission_status !== 'submitted' : stryMutAct_9fa48("11649") ? false : stryMutAct_9fa48("11648") ? true : (stryCov_9fa48("11648", "11649", "11650"), assessment.submission_status === (stryMutAct_9fa48("11651") ? "" : (stryCov_9fa48("11651"), 'submitted')))) {
          if (stryMutAct_9fa48("11652")) {
            {}
          } else {
            stryCov_9fa48("11652");
            return stryMutAct_9fa48("11653") ? "" : (stryCov_9fa48("11653"), 'assessment__status--completed');
          }
        }
        if (stryMutAct_9fa48("11656") ? assessment.submission_status !== 'draft' : stryMutAct_9fa48("11655") ? false : stryMutAct_9fa48("11654") ? true : (stryCov_9fa48("11654", "11655", "11656"), assessment.submission_status === (stryMutAct_9fa48("11657") ? "" : (stryCov_9fa48("11657"), 'draft')))) {
          if (stryMutAct_9fa48("11658")) {
            {}
          } else {
            stryCov_9fa48("11658");
            return stryMutAct_9fa48("11659") ? "" : (stryCov_9fa48("11659"), 'assessment__status--draft');
          }
        }
        if (stryMutAct_9fa48("11662") ? false : stryMutAct_9fa48("11661") ? true : stryMutAct_9fa48("11660") ? assessment.available : (stryCov_9fa48("11660", "11661", "11662"), !assessment.available)) {
          if (stryMutAct_9fa48("11663")) {
            {}
          } else {
            stryCov_9fa48("11663");
            return stryMutAct_9fa48("11664") ? "" : (stryCov_9fa48("11664"), 'assessment__status--locked');
          }
        }
        return stryMutAct_9fa48("11665") ? "" : (stryCov_9fa48("11665"), 'assessment__status--available');
      }
    };
    const handleAssessmentClick = (periodSlug, assessmentType, assessmentId, assessment) => {
      if (stryMutAct_9fa48("11666")) {
        {}
      } else {
        stryCov_9fa48("11666");
        // Allow clicks on available assessments (for active users) or submitted assessments (for viewing)
        if (stryMutAct_9fa48("11669") ? !assessment.available || !isActive || assessment.submission_status !== 'submitted' : stryMutAct_9fa48("11668") ? false : stryMutAct_9fa48("11667") ? true : (stryCov_9fa48("11667", "11668", "11669"), (stryMutAct_9fa48("11671") ? !assessment.available && !isActive : stryMutAct_9fa48("11670") ? true : (stryCov_9fa48("11670", "11671"), (stryMutAct_9fa48("11672") ? assessment.available : (stryCov_9fa48("11672"), !assessment.available)) || (stryMutAct_9fa48("11673") ? isActive : (stryCov_9fa48("11673"), !isActive)))) && (stryMutAct_9fa48("11675") ? assessment.submission_status === 'submitted' : stryMutAct_9fa48("11674") ? true : (stryCov_9fa48("11674", "11675"), assessment.submission_status !== (stryMutAct_9fa48("11676") ? "" : (stryCov_9fa48("11676"), 'submitted')))))) {
          if (stryMutAct_9fa48("11677")) {
            {}
          } else {
            stryCov_9fa48("11677");
            return;
          }
        }

        // Check if this is a resubmission case - go to resubmission mode instead of read-only
        if (stryMutAct_9fa48("11680") ? assessment.available && assessment.reason || assessment.reason.includes('resubmission') : stryMutAct_9fa48("11679") ? false : stryMutAct_9fa48("11678") ? true : (stryCov_9fa48("11678", "11679", "11680"), (stryMutAct_9fa48("11682") ? assessment.available || assessment.reason : stryMutAct_9fa48("11681") ? true : (stryCov_9fa48("11681", "11682"), assessment.available && assessment.reason)) && assessment.reason.includes(stryMutAct_9fa48("11683") ? "" : (stryCov_9fa48("11683"), 'resubmission')))) {
          if (stryMutAct_9fa48("11684")) {
            {}
          } else {
            stryCov_9fa48("11684");
            navigate(stryMutAct_9fa48("11685") ? `` : (stryCov_9fa48("11685"), `/assessment/${periodSlug}/${assessmentType}/${assessmentId}`));
          }
        } else if (stryMutAct_9fa48("11688") ? assessment.submission_status !== 'submitted' : stryMutAct_9fa48("11687") ? false : stryMutAct_9fa48("11686") ? true : (stryCov_9fa48("11686", "11687", "11688"), assessment.submission_status === (stryMutAct_9fa48("11689") ? "" : (stryCov_9fa48("11689"), 'submitted')))) {
          if (stryMutAct_9fa48("11690")) {
            {}
          } else {
            stryCov_9fa48("11690");
            // If assessment is submitted (and NOT resubmission), navigate to read-only mode
            navigate(stryMutAct_9fa48("11691") ? `` : (stryCov_9fa48("11691"), `/assessment/${periodSlug}/${assessmentType}/${assessmentId}/readonly`));
          }
        } else {
          if (stryMutAct_9fa48("11692")) {
            {}
          } else {
            stryCov_9fa48("11692");
            // Navigate to specific assessment page
            navigate(stryMutAct_9fa48("11693") ? `` : (stryCov_9fa48("11693"), `/assessment/${periodSlug}/${assessmentType}/${assessmentId}`));
          }
        }
      }
    };
    const createPeriodSlug = period => {
      if (stryMutAct_9fa48("11694")) {
        {}
      } else {
        stryCov_9fa48("11694");
        return stryMutAct_9fa48("11695") ? period.toUpperCase().replace(/\s+/g, '-') : (stryCov_9fa48("11695"), period.toLowerCase().replace(stryMutAct_9fa48("11697") ? /\S+/g : stryMutAct_9fa48("11696") ? /\s/g : (stryCov_9fa48("11696", "11697"), /\s+/g), stryMutAct_9fa48("11698") ? "" : (stryCov_9fa48("11698"), '-')));
      }
    };
    const createAssessmentTypeSlug = assessmentType => {
      if (stryMutAct_9fa48("11699")) {
        {}
      } else {
        stryCov_9fa48("11699");
        return stryMutAct_9fa48("11700") ? assessmentType.toUpperCase() : (stryCov_9fa48("11700"), assessmentType.toLowerCase());
      }
    };
    if (stryMutAct_9fa48("11702") ? false : stryMutAct_9fa48("11701") ? true : (stryCov_9fa48("11701", "11702"), loading)) {
      if (stryMutAct_9fa48("11703")) {
        {}
      } else {
        stryCov_9fa48("11703");
        return <div className="assessment">
        <div className="assessment__loading">
          <div className="assessment__loading-spinner"></div>
          <p>Loading assessments...</p>
        </div>
      </div>;
      }
    }
    if (stryMutAct_9fa48("11705") ? false : stryMutAct_9fa48("11704") ? true : (stryCov_9fa48("11704", "11705"), error)) {
      if (stryMutAct_9fa48("11706")) {
        {}
      } else {
        stryCov_9fa48("11706");
        return <div className="assessment">
        <div className="assessment__error">
          <h2>Error Loading Assessments</h2>
          <p>{error}</p>
          <button onClick={fetchAssessments} className="assessment__retry-btn">
            Try Again
          </button>
        </div>
      </div>;
      }
    }
    return <div className="assessment">
      {stryMutAct_9fa48("11709") ? !isActive || <div className="assessment__inactive-notice">
          <p>You have historical access only and cannot take new assessments.</p>
        </div> : stryMutAct_9fa48("11708") ? false : stryMutAct_9fa48("11707") ? true : (stryCov_9fa48("11707", "11708", "11709"), (stryMutAct_9fa48("11710") ? isActive : (stryCov_9fa48("11710"), !isActive)) && <div className="assessment__inactive-notice">
          <p>You have historical access only and cannot take new assessments.</p>
        </div>)}

      {(stryMutAct_9fa48("11713") ? assessments.length !== 0 : stryMutAct_9fa48("11712") ? false : stryMutAct_9fa48("11711") ? true : (stryCov_9fa48("11711", "11712", "11713"), assessments.length === 0)) ? <div className="assessment__empty">
          <h2>No Assessments Available</h2>
          <p>Assessments will appear here when they become available based on your program progress.</p>
        </div> : <div className="assessment__content">
          {assessments.map(stryMutAct_9fa48("11714") ? () => undefined : (stryCov_9fa48("11714"), period => <div key={period.period} className="assessment__period">
              <div className="assessment__period-header">
                <h2 className="assessment__period-title">{period.period} Assessment</h2>
                <span className="assessment__period-day">Day {period.trigger_day_number}</span>
              </div>
              
              <div className="assessment__table">
                <div className="assessment__table-header">
                  <div className="assessment__table-col assessment__table-col--type">Assessment Type</div>
                  <div className="assessment__table-col assessment__table-col--status">Status</div>
                  <div className="assessment__table-col assessment__table-col--submitted">Submitted</div>
                  <div className="assessment__table-col assessment__table-col--action">Action</div>
                </div>
                
                {period.assessments.map(stryMutAct_9fa48("11715") ? () => undefined : (stryCov_9fa48("11715"), assessment => <div key={assessment.assessment_id} className={stryMutAct_9fa48("11716") ? `` : (stryCov_9fa48("11716"), `assessment__table-row ${getStatusClass(assessment)} ${(stryMutAct_9fa48("11719") ? assessment.available || isActive : stryMutAct_9fa48("11718") ? false : stryMutAct_9fa48("11717") ? true : (stryCov_9fa48("11717", "11718", "11719"), assessment.available && isActive)) ? stryMutAct_9fa48("11720") ? "" : (stryCov_9fa48("11720"), 'assessment__table-row--clickable') : stryMutAct_9fa48("11721") ? "Stryker was here!" : (stryCov_9fa48("11721"), '')}`)} onClick={stryMutAct_9fa48("11722") ? () => undefined : (stryCov_9fa48("11722"), () => handleAssessmentClick(createPeriodSlug(period.period), createAssessmentTypeSlug(assessment.assessment_type), assessment.assessment_id, assessment))}>
                    <div className="assessment__table-col assessment__table-col--type">
                      <div className="assessment__table-type">
                        {getStatusIcon(assessment)}
                        <span className="assessment__table-type-text">
                          {(stryMutAct_9fa48("11725") ? assessment.assessment_type !== 'business' : stryMutAct_9fa48("11724") ? false : stryMutAct_9fa48("11723") ? true : (stryCov_9fa48("11723", "11724", "11725"), assessment.assessment_type === (stryMutAct_9fa48("11726") ? "" : (stryCov_9fa48("11726"), 'business')))) ? stryMutAct_9fa48("11727") ? "" : (stryCov_9fa48("11727"), 'Business Assessment') : (stryMutAct_9fa48("11730") ? assessment.assessment_type !== 'technical' : stryMutAct_9fa48("11729") ? false : stryMutAct_9fa48("11728") ? true : (stryCov_9fa48("11728", "11729", "11730"), assessment.assessment_type === (stryMutAct_9fa48("11731") ? "" : (stryCov_9fa48("11731"), 'technical')))) ? stryMutAct_9fa48("11732") ? "" : (stryCov_9fa48("11732"), 'Technical Assessment') : (stryMutAct_9fa48("11735") ? assessment.assessment_type !== 'professional' : stryMutAct_9fa48("11734") ? false : stryMutAct_9fa48("11733") ? true : (stryCov_9fa48("11733", "11734", "11735"), assessment.assessment_type === (stryMutAct_9fa48("11736") ? "" : (stryCov_9fa48("11736"), 'professional')))) ? stryMutAct_9fa48("11737") ? "" : (stryCov_9fa48("11737"), 'Professional Assessment') : (stryMutAct_9fa48("11740") ? assessment.assessment_type !== 'self' : stryMutAct_9fa48("11739") ? false : stryMutAct_9fa48("11738") ? true : (stryCov_9fa48("11738", "11739", "11740"), assessment.assessment_type === (stryMutAct_9fa48("11741") ? "" : (stryCov_9fa48("11741"), 'self')))) ? stryMutAct_9fa48("11742") ? "" : (stryCov_9fa48("11742"), 'Self Assessment') : (stryMutAct_9fa48("11743") ? assessment.assessment_type.charAt(0).toUpperCase() - assessment.assessment_type.slice(1) : (stryCov_9fa48("11743"), (stryMutAct_9fa48("11745") ? assessment.assessment_type.toUpperCase() : stryMutAct_9fa48("11744") ? assessment.assessment_type.charAt(0).toLowerCase() : (stryCov_9fa48("11744", "11745"), assessment.assessment_type.charAt(0).toUpperCase())) + (stryMutAct_9fa48("11746") ? assessment.assessment_type : (stryCov_9fa48("11746"), assessment.assessment_type.slice(1))))) + (stryMutAct_9fa48("11747") ? "" : (stryCov_9fa48("11747"), ' Assessment'))}
                        </span>
                      </div>
                    </div>
                    
                    <div className="assessment__table-col assessment__table-col--status">
                      <span className={stryMutAct_9fa48("11748") ? `` : (stryCov_9fa48("11748"), `assessment__status ${getStatusClass(assessment)}`)}>
                        {getStatusText(assessment)}
                      </span>
                    </div>
                    
                    <div className="assessment__table-col assessment__table-col--submitted">
                      {assessment.submitted_at ? <span className="assessment__submitted-date">
                          {new Date(assessment.submitted_at).toLocaleDateString()}
                        </span> : <span className="assessment__table-empty">—</span>}
                    </div>
                    
                    <div className="assessment__table-col assessment__table-col--action">
                      {(stryMutAct_9fa48("11751") ? assessment.available && isActive && assessment.submission_status === 'submitted' : stryMutAct_9fa48("11750") ? false : stryMutAct_9fa48("11749") ? true : (stryCov_9fa48("11749", "11750", "11751"), (stryMutAct_9fa48("11753") ? assessment.available || isActive : stryMutAct_9fa48("11752") ? false : (stryCov_9fa48("11752", "11753"), assessment.available && isActive)) || (stryMutAct_9fa48("11755") ? assessment.submission_status !== 'submitted' : stryMutAct_9fa48("11754") ? false : (stryCov_9fa48("11754", "11755"), assessment.submission_status === (stryMutAct_9fa48("11756") ? "" : (stryCov_9fa48("11756"), 'submitted')))))) ? <div className="assessment__table-action">
                          <FaExternalLinkAlt className="assessment__table-icon" />
                          <span>
                            {(stryMutAct_9fa48("11759") ? assessment.available && assessment.reason || assessment.reason.includes('resubmission') : stryMutAct_9fa48("11758") ? false : stryMutAct_9fa48("11757") ? true : (stryCov_9fa48("11757", "11758", "11759"), (stryMutAct_9fa48("11761") ? assessment.available || assessment.reason : stryMutAct_9fa48("11760") ? true : (stryCov_9fa48("11760", "11761"), assessment.available && assessment.reason)) && assessment.reason.includes(stryMutAct_9fa48("11762") ? "" : (stryCov_9fa48("11762"), 'resubmission')))) ? stryMutAct_9fa48("11763") ? "" : (stryCov_9fa48("11763"), 'Resubmit') : (stryMutAct_9fa48("11766") ? assessment.submission_status !== 'submitted' : stryMutAct_9fa48("11765") ? false : stryMutAct_9fa48("11764") ? true : (stryCov_9fa48("11764", "11765", "11766"), assessment.submission_status === (stryMutAct_9fa48("11767") ? "" : (stryCov_9fa48("11767"), 'submitted')))) ? stryMutAct_9fa48("11768") ? "" : (stryCov_9fa48("11768"), 'View') : stryMutAct_9fa48("11769") ? "" : (stryCov_9fa48("11769"), 'Start')}
                          </span>
                        </div> : <span className="assessment__table-empty">—</span>}
                    </div>
                  </div>))}
              </div>
            </div>))}
        </div>}
    </div>;
  }
}
export default Assessment;