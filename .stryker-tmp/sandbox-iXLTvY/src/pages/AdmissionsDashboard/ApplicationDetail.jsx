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
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotesModal from '../../components/NotesModal';
import BulkActionsModal from '../../components/BulkActionsModal';
import './ApplicationDetail.css';

// Utility functions for formatting response values
const formatResponseValue = (value, questionType) => {
  if (stryMutAct_9fa48("8572")) {
    {}
  } else {
    stryCov_9fa48("8572");
    if (stryMutAct_9fa48("8575") ? false : stryMutAct_9fa48("8574") ? true : stryMutAct_9fa48("8573") ? value : (stryCov_9fa48("8573", "8574", "8575"), !value)) return <span className="no-response">No response provided</span>;

    // Try to detect if the value is an array (JSON string)
    try {
      if (stryMutAct_9fa48("8576")) {
        {}
      } else {
        stryCov_9fa48("8576");
        const parsedValue = JSON.parse(value);
        if (stryMutAct_9fa48("8578") ? false : stryMutAct_9fa48("8577") ? true : (stryCov_9fa48("8577", "8578"), Array.isArray(parsedValue))) {
          if (stryMutAct_9fa48("8579")) {
            {}
          } else {
            stryCov_9fa48("8579");
            return <ul className="response-list">
                    {parsedValue.map(stryMutAct_9fa48("8580") ? () => undefined : (stryCov_9fa48("8580"), (item, i) => <li key={i}>{item}</li>))}
                </ul>;
          }
        }
      }
    } catch (e) {
      // Not a valid JSON, continue with other formatting
    }

    // Check for date format (YYYY-MM-DD)
    if (stryMutAct_9fa48("8582") ? false : stryMutAct_9fa48("8581") ? true : (stryCov_9fa48("8581", "8582"), (stryMutAct_9fa48("8589") ? /^\d{4}-\d{2}-\D{2}/ : stryMutAct_9fa48("8588") ? /^\d{4}-\d{2}-\d/ : stryMutAct_9fa48("8587") ? /^\d{4}-\D{2}-\d{2}/ : stryMutAct_9fa48("8586") ? /^\d{4}-\d-\d{2}/ : stryMutAct_9fa48("8585") ? /^\D{4}-\d{2}-\d{2}/ : stryMutAct_9fa48("8584") ? /^\d-\d{2}-\d{2}/ : stryMutAct_9fa48("8583") ? /\d{4}-\d{2}-\d{2}/ : (stryCov_9fa48("8583", "8584", "8585", "8586", "8587", "8588", "8589"), /^\d{4}-\d{2}-\d{2}/)).test(value))) {
      if (stryMutAct_9fa48("8590")) {
        {}
      } else {
        stryCov_9fa48("8590");
        try {
          if (stryMutAct_9fa48("8591")) {
            {}
          } else {
            stryCov_9fa48("8591");
            const date = new Date(value);
            if (stryMutAct_9fa48("8594") ? false : stryMutAct_9fa48("8593") ? true : stryMutAct_9fa48("8592") ? isNaN(date.getTime()) : (stryCov_9fa48("8592", "8593", "8594"), !isNaN(date.getTime()))) {
              if (stryMutAct_9fa48("8595")) {
                {}
              } else {
                stryCov_9fa48("8595");
                return date.toLocaleDateString(stryMutAct_9fa48("8596") ? "" : (stryCov_9fa48("8596"), 'en-US'), stryMutAct_9fa48("8597") ? {} : (stryCov_9fa48("8597"), {
                  year: stryMutAct_9fa48("8598") ? "" : (stryCov_9fa48("8598"), 'numeric'),
                  month: stryMutAct_9fa48("8599") ? "" : (stryCov_9fa48("8599"), 'long'),
                  day: stryMutAct_9fa48("8600") ? "" : (stryCov_9fa48("8600"), 'numeric')
                }));
              }
            }
          }
        } catch (e) {
          // Not a valid date, continue with other formatting
        }
      }
    }

    // Check for phone number format
    if (stryMutAct_9fa48("8602") ? false : stryMutAct_9fa48("8601") ? true : (stryCov_9fa48("8601", "8602"), (stryMutAct_9fa48("8606") ? /^\D{10}$/ : stryMutAct_9fa48("8605") ? /^\d$/ : stryMutAct_9fa48("8604") ? /^\d{10}/ : stryMutAct_9fa48("8603") ? /\d{10}$/ : (stryCov_9fa48("8603", "8604", "8605", "8606"), /^\d{10}$/)).test(value.replace(stryMutAct_9fa48("8607") ? /\d/g : (stryCov_9fa48("8607"), /\D/g), stryMutAct_9fa48("8608") ? "Stryker was here!" : (stryCov_9fa48("8608"), ''))))) {
      if (stryMutAct_9fa48("8609")) {
        {}
      } else {
        stryCov_9fa48("8609");
        const cleaned = value.replace(stryMutAct_9fa48("8610") ? /\d/g : (stryCov_9fa48("8610"), /\D/g), stryMutAct_9fa48("8611") ? "Stryker was here!" : (stryCov_9fa48("8611"), ''));
        return stryMutAct_9fa48("8612") ? `` : (stryCov_9fa48("8612"), `(${stryMutAct_9fa48("8613") ? cleaned : (stryCov_9fa48("8613"), cleaned.substring(0, 3))}) ${stryMutAct_9fa48("8614") ? cleaned : (stryCov_9fa48("8614"), cleaned.substring(3, 6))}-${stryMutAct_9fa48("8615") ? cleaned : (stryCov_9fa48("8615"), cleaned.substring(6, 10))}`);
      }
    }

    // Check for dollar amount
    if (stryMutAct_9fa48("8617") ? false : stryMutAct_9fa48("8616") ? true : (stryCov_9fa48("8616", "8617"), (stryMutAct_9fa48("8625") ? /^\$?\d+(\.\D{2})?$/ : stryMutAct_9fa48("8624") ? /^\$?\d+(\.\d)?$/ : stryMutAct_9fa48("8623") ? /^\$?\d+(\.\d{2})$/ : stryMutAct_9fa48("8622") ? /^\$?\D+(\.\d{2})?$/ : stryMutAct_9fa48("8621") ? /^\$?\d(\.\d{2})?$/ : stryMutAct_9fa48("8620") ? /^\$\d+(\.\d{2})?$/ : stryMutAct_9fa48("8619") ? /^\$?\d+(\.\d{2})?/ : stryMutAct_9fa48("8618") ? /\$?\d+(\.\d{2})?$/ : (stryCov_9fa48("8618", "8619", "8620", "8621", "8622", "8623", "8624", "8625"), /^\$?\d+(\.\d{2})?$/)).test(value.replace(/,/g, stryMutAct_9fa48("8626") ? "Stryker was here!" : (stryCov_9fa48("8626"), ''))))) {
      if (stryMutAct_9fa48("8627")) {
        {}
      } else {
        stryCov_9fa48("8627");
        const amount = parseFloat(value.replace(stryMutAct_9fa48("8628") ? /[^$,]/g : (stryCov_9fa48("8628"), /[$,]/g), stryMutAct_9fa48("8629") ? "Stryker was here!" : (stryCov_9fa48("8629"), '')));
        if (stryMutAct_9fa48("8632") ? false : stryMutAct_9fa48("8631") ? true : stryMutAct_9fa48("8630") ? isNaN(amount) : (stryCov_9fa48("8630", "8631", "8632"), !isNaN(amount))) {
          if (stryMutAct_9fa48("8633")) {
            {}
          } else {
            stryCov_9fa48("8633");
            return new Intl.NumberFormat(stryMutAct_9fa48("8634") ? "" : (stryCov_9fa48("8634"), 'en-US'), stryMutAct_9fa48("8635") ? {} : (stryCov_9fa48("8635"), {
              style: stryMutAct_9fa48("8636") ? "" : (stryCov_9fa48("8636"), 'currency'),
              currency: stryMutAct_9fa48("8637") ? "" : (stryCov_9fa48("8637"), 'USD'),
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })).format(amount);
          }
        }
      }
    }

    // Check if it's a number that should be formatted
    if (stryMutAct_9fa48("8640") ? /^\d+(\.\d+)?$/.test(value) || questionType?.toLowerCase().includes('income') : stryMutAct_9fa48("8639") ? false : stryMutAct_9fa48("8638") ? true : (stryCov_9fa48("8638", "8639", "8640"), (stryMutAct_9fa48("8647") ? /^\d+(\.\D+)?$/ : stryMutAct_9fa48("8646") ? /^\d+(\.\d)?$/ : stryMutAct_9fa48("8645") ? /^\d+(\.\d+)$/ : stryMutAct_9fa48("8644") ? /^\D+(\.\d+)?$/ : stryMutAct_9fa48("8643") ? /^\d(\.\d+)?$/ : stryMutAct_9fa48("8642") ? /^\d+(\.\d+)?/ : stryMutAct_9fa48("8641") ? /\d+(\.\d+)?$/ : (stryCov_9fa48("8641", "8642", "8643", "8644", "8645", "8646", "8647"), /^\d+(\.\d+)?$/)).test(value) && (stryMutAct_9fa48("8649") ? questionType.toLowerCase().includes('income') : stryMutAct_9fa48("8648") ? questionType?.toUpperCase().includes('income') : (stryCov_9fa48("8648", "8649"), questionType?.toLowerCase().includes(stryMutAct_9fa48("8650") ? "" : (stryCov_9fa48("8650"), 'income')))))) {
      if (stryMutAct_9fa48("8651")) {
        {}
      } else {
        stryCov_9fa48("8651");
        const number = parseFloat(value);
        if (stryMutAct_9fa48("8654") ? false : stryMutAct_9fa48("8653") ? true : stryMutAct_9fa48("8652") ? isNaN(number) : (stryCov_9fa48("8652", "8653", "8654"), !isNaN(number))) {
          if (stryMutAct_9fa48("8655")) {
            {}
          } else {
            stryCov_9fa48("8655");
            return new Intl.NumberFormat(stryMutAct_9fa48("8656") ? "" : (stryCov_9fa48("8656"), 'en-US'), stryMutAct_9fa48("8657") ? {} : (stryCov_9fa48("8657"), {
              style: stryMutAct_9fa48("8658") ? "" : (stryCov_9fa48("8658"), 'currency'),
              currency: stryMutAct_9fa48("8659") ? "" : (stryCov_9fa48("8659"), 'USD'),
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })).format(number);
          }
        }
      }
    }

    // Default: return as is
    return value;
  }
};
const ApplicationDetail = () => {
  if (stryMutAct_9fa48("8660")) {
    {}
  } else {
    stryCov_9fa48("8660");
    const {
      applicationId
    } = useParams();
    const {
      token
    } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(stryMutAct_9fa48("8661") ? false : (stryCov_9fa48("8661"), true));
    const [error, setError] = useState(null);
    const [applicationData, setApplicationData] = useState(null);

    // Notes modal management
    const [notesModalOpen, setNotesModalOpen] = useState(stryMutAct_9fa48("8662") ? true : (stryCov_9fa48("8662"), false));

    // Actions modal management
    const [actionsModalOpen, setActionsModalOpen] = useState(stryMutAct_9fa48("8663") ? true : (stryCov_9fa48("8663"), false));
    const [actionInProgress, setActionInProgress] = useState(stryMutAct_9fa48("8664") ? true : (stryCov_9fa48("8664"), false));

    // Email tracking data
    const [emailTrackingData, setEmailTrackingData] = useState(null);
    const [emailTrackingLoading, setEmailTrackingLoading] = useState(stryMutAct_9fa48("8665") ? true : (stryCov_9fa48("8665"), false));

    // Collapsible sections state - all collapsed by default
    const [expandedSections, setExpandedSections] = useState({});

    // Toggle section expansion
    const toggleSection = sectionKey => {
      if (stryMutAct_9fa48("8666")) {
        {}
      } else {
        stryCov_9fa48("8666");
        setExpandedSections(stryMutAct_9fa48("8667") ? () => undefined : (stryCov_9fa48("8667"), prev => stryMutAct_9fa48("8668") ? {} : (stryCov_9fa48("8668"), {
          ...prev,
          [sectionKey]: stryMutAct_9fa48("8669") ? prev[sectionKey] : (stryCov_9fa48("8669"), !prev[sectionKey])
        })));
      }
    };

    // Fetch application details
    const fetchApplicationDetail = async () => {
      if (stryMutAct_9fa48("8670")) {
        {}
      } else {
        stryCov_9fa48("8670");
        try {
          if (stryMutAct_9fa48("8671")) {
            {}
          } else {
            stryCov_9fa48("8671");
            setLoading(stryMutAct_9fa48("8672") ? false : (stryCov_9fa48("8672"), true));
            setError(null);
            const response = await fetch(stryMutAct_9fa48("8673") ? `` : (stryCov_9fa48("8673"), `${import.meta.env.VITE_API_URL}/api/admissions/application/${applicationId}`), stryMutAct_9fa48("8674") ? {} : (stryCov_9fa48("8674"), {
              headers: stryMutAct_9fa48("8675") ? {} : (stryCov_9fa48("8675"), {
                'Authorization': stryMutAct_9fa48("8676") ? `` : (stryCov_9fa48("8676"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("8677") ? "" : (stryCov_9fa48("8677"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("8680") ? false : stryMutAct_9fa48("8679") ? true : stryMutAct_9fa48("8678") ? response.ok : (stryCov_9fa48("8678", "8679", "8680"), !response.ok)) {
              if (stryMutAct_9fa48("8681")) {
                {}
              } else {
                stryCov_9fa48("8681");
                throw new Error(stryMutAct_9fa48("8682") ? "" : (stryCov_9fa48("8682"), 'Failed to fetch application details'));
              }
            }
            const data = await response.json();
            setApplicationData(data);

            // Also fetch email tracking data
            if (stryMutAct_9fa48("8685") ? data.applicant.applicant_id : stryMutAct_9fa48("8684") ? false : stryMutAct_9fa48("8683") ? true : (stryCov_9fa48("8683", "8684", "8685"), data.applicant?.applicant_id)) {
              if (stryMutAct_9fa48("8686")) {
                {}
              } else {
                stryCov_9fa48("8686");
                fetchEmailTrackingData(data.applicant.applicant_id);
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("8687")) {
            {}
          } else {
            stryCov_9fa48("8687");
            console.error(stryMutAct_9fa48("8688") ? "" : (stryCov_9fa48("8688"), 'Error fetching application details:'), error);
            setError(stryMutAct_9fa48("8689") ? "" : (stryCov_9fa48("8689"), 'Failed to load application details. Please try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("8690")) {
            {}
          } else {
            stryCov_9fa48("8690");
            setLoading(stryMutAct_9fa48("8691") ? true : (stryCov_9fa48("8691"), false));
          }
        }
      }
    };

    // Fetch email tracking data
    const fetchEmailTrackingData = async applicantId => {
      if (stryMutAct_9fa48("8692")) {
        {}
      } else {
        stryCov_9fa48("8692");
        try {
          if (stryMutAct_9fa48("8693")) {
            {}
          } else {
            stryCov_9fa48("8693");
            setEmailTrackingLoading(stryMutAct_9fa48("8694") ? false : (stryCov_9fa48("8694"), true));
            const response = await fetch(stryMutAct_9fa48("8695") ? `` : (stryCov_9fa48("8695"), `${import.meta.env.VITE_API_URL}/api/admissions/applicants/${applicantId}/email-tracking`), stryMutAct_9fa48("8696") ? {} : (stryCov_9fa48("8696"), {
              headers: stryMutAct_9fa48("8697") ? {} : (stryCov_9fa48("8697"), {
                'Authorization': stryMutAct_9fa48("8698") ? `` : (stryCov_9fa48("8698"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("8699") ? "" : (stryCov_9fa48("8699"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("8701") ? false : stryMutAct_9fa48("8700") ? true : (stryCov_9fa48("8700", "8701"), response.ok)) {
              if (stryMutAct_9fa48("8702")) {
                {}
              } else {
                stryCov_9fa48("8702");
                const data = await response.json();
                setEmailTrackingData(data);
              }
            } else {
              if (stryMutAct_9fa48("8703")) {
                {}
              } else {
                stryCov_9fa48("8703");
                console.log(stryMutAct_9fa48("8704") ? "" : (stryCov_9fa48("8704"), 'No email tracking data available for this applicant'));
                setEmailTrackingData(null);
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("8705")) {
            {}
          } else {
            stryCov_9fa48("8705");
            console.error(stryMutAct_9fa48("8706") ? "" : (stryCov_9fa48("8706"), 'Error fetching email tracking data:'), error);
            setEmailTrackingData(null);
          }
        } finally {
          if (stryMutAct_9fa48("8707")) {
            {}
          } else {
            stryCov_9fa48("8707");
            setEmailTrackingLoading(stryMutAct_9fa48("8708") ? true : (stryCov_9fa48("8708"), false));
          }
        }
      }
    };
    useEffect(() => {
      if (stryMutAct_9fa48("8709")) {
        {}
      } else {
        stryCov_9fa48("8709");
        if (stryMutAct_9fa48("8712") ? applicationId || token : stryMutAct_9fa48("8711") ? false : stryMutAct_9fa48("8710") ? true : (stryCov_9fa48("8710", "8711", "8712"), applicationId && token)) {
          if (stryMutAct_9fa48("8713")) {
            {}
          } else {
            stryCov_9fa48("8713");
            fetchApplicationDetail();
          }
        }
      }
    }, stryMutAct_9fa48("8714") ? [] : (stryCov_9fa48("8714"), [applicationId, token]));

    // Handle notes modal
    const openNotesModal = () => {
      if (stryMutAct_9fa48("8715")) {
        {}
      } else {
        stryCov_9fa48("8715");
        setNotesModalOpen(stryMutAct_9fa48("8716") ? false : (stryCov_9fa48("8716"), true));
      }
    };
    const closeNotesModal = () => {
      if (stryMutAct_9fa48("8717")) {
        {}
      } else {
        stryCov_9fa48("8717");
        setNotesModalOpen(stryMutAct_9fa48("8718") ? true : (stryCov_9fa48("8718"), false));
      }
    };

    // Handle actions modal
    const openActionsModal = () => {
      if (stryMutAct_9fa48("8719")) {
        {}
      } else {
        stryCov_9fa48("8719");
        setActionsModalOpen(stryMutAct_9fa48("8720") ? false : (stryCov_9fa48("8720"), true));
      }
    };
    const closeActionsModal = () => {
      if (stryMutAct_9fa48("8721")) {
        {}
      } else {
        stryCov_9fa48("8721");
        setActionsModalOpen(stryMutAct_9fa48("8722") ? true : (stryCov_9fa48("8722"), false));
      }
    };

    // Handle single applicant action
    const handleApplicantAction = async (action, customSubject = stryMutAct_9fa48("8723") ? "Stryker was here!" : (stryCov_9fa48("8723"), ''), customBody = stryMutAct_9fa48("8724") ? "Stryker was here!" : (stryCov_9fa48("8724"), '')) => {
      if (stryMutAct_9fa48("8725")) {
        {}
      } else {
        stryCov_9fa48("8725");
        if (stryMutAct_9fa48("8728") ? false : stryMutAct_9fa48("8727") ? true : stryMutAct_9fa48("8726") ? applicant?.applicant_id : (stryCov_9fa48("8726", "8727", "8728"), !(stryMutAct_9fa48("8729") ? applicant.applicant_id : (stryCov_9fa48("8729"), applicant?.applicant_id)))) return;
        setActionInProgress(stryMutAct_9fa48("8730") ? false : (stryCov_9fa48("8730"), true));
        try {
          if (stryMutAct_9fa48("8731")) {
            {}
          } else {
            stryCov_9fa48("8731");
            const requestBody = stryMutAct_9fa48("8732") ? {} : (stryCov_9fa48("8732"), {
              action,
              applicant_ids: stryMutAct_9fa48("8733") ? [] : (stryCov_9fa48("8733"), [applicant.applicant_id])
            });
            if (stryMutAct_9fa48("8736") ? action !== 'send_custom_email' : stryMutAct_9fa48("8735") ? false : stryMutAct_9fa48("8734") ? true : (stryCov_9fa48("8734", "8735", "8736"), action === (stryMutAct_9fa48("8737") ? "" : (stryCov_9fa48("8737"), 'send_custom_email')))) {
              if (stryMutAct_9fa48("8738")) {
                {}
              } else {
                stryCov_9fa48("8738");
                requestBody.custom_subject = customSubject;
                requestBody.custom_body = customBody;
              }
            }
            const response = await fetch(stryMutAct_9fa48("8739") ? `` : (stryCov_9fa48("8739"), `${import.meta.env.VITE_API_URL}/api/admissions/bulk-actions`), stryMutAct_9fa48("8740") ? {} : (stryCov_9fa48("8740"), {
              method: stryMutAct_9fa48("8741") ? "" : (stryCov_9fa48("8741"), 'POST'),
              headers: stryMutAct_9fa48("8742") ? {} : (stryCov_9fa48("8742"), {
                'Authorization': stryMutAct_9fa48("8743") ? `` : (stryCov_9fa48("8743"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("8744") ? "" : (stryCov_9fa48("8744"), 'application/json')
              }),
              body: JSON.stringify(requestBody)
            }));
            if (stryMutAct_9fa48("8746") ? false : stryMutAct_9fa48("8745") ? true : (stryCov_9fa48("8745", "8746"), response.ok)) {
              if (stryMutAct_9fa48("8747")) {
                {}
              } else {
                stryCov_9fa48("8747");
                const result = await response.json();
                console.log(stryMutAct_9fa48("8748") ? "" : (stryCov_9fa48("8748"), 'Action completed:'), result);

                // Refresh application data
                await fetchApplicationDetail();

                // Close modal
                setActionsModalOpen(stryMutAct_9fa48("8749") ? true : (stryCov_9fa48("8749"), false));

                // Show success message (you could add a toast notification here)
                console.log(stryMutAct_9fa48("8750") ? "" : (stryCov_9fa48("8750"), 'Action completed successfully'));
              }
            } else {
              if (stryMutAct_9fa48("8751")) {
                {}
              } else {
                stryCov_9fa48("8751");
                const errorData = await response.json();
                console.error(stryMutAct_9fa48("8752") ? "" : (stryCov_9fa48("8752"), 'Action failed:'), errorData);
                // You could show an error message here
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("8753")) {
            {}
          } else {
            stryCov_9fa48("8753");
            console.error(stryMutAct_9fa48("8754") ? "" : (stryCov_9fa48("8754"), 'Error performing action:'), error);
            // You could show an error message here
          }
        } finally {
          if (stryMutAct_9fa48("8755")) {
            {}
          } else {
            stryCov_9fa48("8755");
            setActionInProgress(stryMutAct_9fa48("8756") ? true : (stryCov_9fa48("8756"), false));
          }
        }
      }
    };

    // Create shorthand labels for common questions
    const getShorthandLabel = (prompt, questionId) => {
      if (stryMutAct_9fa48("8757")) {
        {}
      } else {
        stryCov_9fa48("8757");
        if (stryMutAct_9fa48("8760") ? false : stryMutAct_9fa48("8759") ? true : stryMutAct_9fa48("8758") ? prompt : (stryCov_9fa48("8758", "8759", "8760"), !prompt)) return stryMutAct_9fa48("8761") ? "" : (stryCov_9fa48("8761"), 'Unknown Question');

        // Special handling for key analysis questions
        const keyQuestionLabels = stryMutAct_9fa48("8762") ? {} : (stryCov_9fa48("8762"), {
          1046: stryMutAct_9fa48("8763") ? "" : (stryCov_9fa48("8763"), 'Education & Work History'),
          1052: stryMutAct_9fa48("8764") ? "" : (stryCov_9fa48("8764"), 'AI Perspectives & Career Impact'),
          1053: stryMutAct_9fa48("8765") ? "" : (stryCov_9fa48("8765"), 'Personal Background Story'),
          1055: stryMutAct_9fa48("8766") ? "" : (stryCov_9fa48("8766"), 'AI Learning Questions Used'),
          1056: stryMutAct_9fa48("8767") ? "" : (stryCov_9fa48("8767"), 'Neural Network Definition'),
          1057: stryMutAct_9fa48("8768") ? "" : (stryCov_9fa48("8768"), 'Neural Network Structure & Function'),
          1059: stryMutAct_9fa48("8769") ? "" : (stryCov_9fa48("8769"), 'Most Intriguing Neural Network Aspect'),
          1061: stryMutAct_9fa48("8770") ? "" : (stryCov_9fa48("8770"), 'Learning About Intriguing Aspect'),
          1062: stryMutAct_9fa48("8771") ? "" : (stryCov_9fa48("8771"), 'AI Tools Learning Process Impact')
        });
        if (stryMutAct_9fa48("8774") ? questionId || keyQuestionLabels[questionId] : stryMutAct_9fa48("8773") ? false : stryMutAct_9fa48("8772") ? true : (stryCov_9fa48("8772", "8773", "8774"), questionId && keyQuestionLabels[questionId])) {
          if (stryMutAct_9fa48("8775")) {
            {}
          } else {
            stryCov_9fa48("8775");
            return keyQuestionLabels[questionId];
          }
        }
        const lowercasePrompt = stryMutAct_9fa48("8776") ? prompt.toUpperCase() : (stryCov_9fa48("8776"), prompt.toLowerCase());

        // Common question mappings
        if (stryMutAct_9fa48("8778") ? false : stryMutAct_9fa48("8777") ? true : (stryCov_9fa48("8777", "8778"), lowercasePrompt.includes(stryMutAct_9fa48("8779") ? "" : (stryCov_9fa48("8779"), 'first name')))) return stryMutAct_9fa48("8780") ? "" : (stryCov_9fa48("8780"), 'First Name');
        if (stryMutAct_9fa48("8782") ? false : stryMutAct_9fa48("8781") ? true : (stryCov_9fa48("8781", "8782"), lowercasePrompt.includes(stryMutAct_9fa48("8783") ? "" : (stryCov_9fa48("8783"), 'last name')))) return stryMutAct_9fa48("8784") ? "" : (stryCov_9fa48("8784"), 'Last Name');
        if (stryMutAct_9fa48("8787") ? lowercasePrompt.includes('date of birth') && lowercasePrompt.includes('birthday') : stryMutAct_9fa48("8786") ? false : stryMutAct_9fa48("8785") ? true : (stryCov_9fa48("8785", "8786", "8787"), lowercasePrompt.includes(stryMutAct_9fa48("8788") ? "" : (stryCov_9fa48("8788"), 'date of birth')) || lowercasePrompt.includes(stryMutAct_9fa48("8789") ? "" : (stryCov_9fa48("8789"), 'birthday')))) return stryMutAct_9fa48("8790") ? "" : (stryCov_9fa48("8790"), 'Date of Birth');
        if (stryMutAct_9fa48("8793") ? lowercasePrompt.includes('annual') || lowercasePrompt.includes('personal income') : stryMutAct_9fa48("8792") ? false : stryMutAct_9fa48("8791") ? true : (stryCov_9fa48("8791", "8792", "8793"), lowercasePrompt.includes(stryMutAct_9fa48("8794") ? "" : (stryCov_9fa48("8794"), 'annual')) && lowercasePrompt.includes(stryMutAct_9fa48("8795") ? "" : (stryCov_9fa48("8795"), 'personal income')))) return stryMutAct_9fa48("8796") ? "" : (stryCov_9fa48("8796"), 'Personal Annual Income');
        if (stryMutAct_9fa48("8799") ? lowercasePrompt.includes('annual') || lowercasePrompt.includes('household income') : stryMutAct_9fa48("8798") ? false : stryMutAct_9fa48("8797") ? true : (stryCov_9fa48("8797", "8798", "8799"), lowercasePrompt.includes(stryMutAct_9fa48("8800") ? "" : (stryCov_9fa48("8800"), 'annual')) && lowercasePrompt.includes(stryMutAct_9fa48("8801") ? "" : (stryCov_9fa48("8801"), 'household income')))) return stryMutAct_9fa48("8802") ? "" : (stryCov_9fa48("8802"), 'Household Annual Income');
        if (stryMutAct_9fa48("8805") ? lowercasePrompt.includes('annual') && lowercasePrompt.includes('income') && !lowercasePrompt.includes('personal') || !lowercasePrompt.includes('household') : stryMutAct_9fa48("8804") ? false : stryMutAct_9fa48("8803") ? true : (stryCov_9fa48("8803", "8804", "8805"), (stryMutAct_9fa48("8807") ? lowercasePrompt.includes('annual') && lowercasePrompt.includes('income') || !lowercasePrompt.includes('personal') : stryMutAct_9fa48("8806") ? true : (stryCov_9fa48("8806", "8807"), (stryMutAct_9fa48("8809") ? lowercasePrompt.includes('annual') || lowercasePrompt.includes('income') : stryMutAct_9fa48("8808") ? true : (stryCov_9fa48("8808", "8809"), lowercasePrompt.includes(stryMutAct_9fa48("8810") ? "" : (stryCov_9fa48("8810"), 'annual')) && lowercasePrompt.includes(stryMutAct_9fa48("8811") ? "" : (stryCov_9fa48("8811"), 'income')))) && (stryMutAct_9fa48("8812") ? lowercasePrompt.includes('personal') : (stryCov_9fa48("8812"), !lowercasePrompt.includes(stryMutAct_9fa48("8813") ? "" : (stryCov_9fa48("8813"), 'personal')))))) && (stryMutAct_9fa48("8814") ? lowercasePrompt.includes('household') : (stryCov_9fa48("8814"), !lowercasePrompt.includes(stryMutAct_9fa48("8815") ? "" : (stryCov_9fa48("8815"), 'household')))))) return stryMutAct_9fa48("8816") ? "" : (stryCov_9fa48("8816"), 'Annual Income');
        if (stryMutAct_9fa48("8819") ? lowercasePrompt.includes('home address') && lowercasePrompt.includes('street address') : stryMutAct_9fa48("8818") ? false : stryMutAct_9fa48("8817") ? true : (stryCov_9fa48("8817", "8818", "8819"), lowercasePrompt.includes(stryMutAct_9fa48("8820") ? "" : (stryCov_9fa48("8820"), 'home address')) || lowercasePrompt.includes(stryMutAct_9fa48("8821") ? "" : (stryCov_9fa48("8821"), 'street address')))) return stryMutAct_9fa48("8822") ? "" : (stryCov_9fa48("8822"), 'Address');
        if (stryMutAct_9fa48("8825") ? lowercasePrompt.includes('phone') && lowercasePrompt.includes('mobile') : stryMutAct_9fa48("8824") ? false : stryMutAct_9fa48("8823") ? true : (stryCov_9fa48("8823", "8824", "8825"), lowercasePrompt.includes(stryMutAct_9fa48("8826") ? "" : (stryCov_9fa48("8826"), 'phone')) || lowercasePrompt.includes(stryMutAct_9fa48("8827") ? "" : (stryCov_9fa48("8827"), 'mobile')))) return stryMutAct_9fa48("8828") ? "" : (stryCov_9fa48("8828"), 'Phone');
        if (stryMutAct_9fa48("8830") ? false : stryMutAct_9fa48("8829") ? true : (stryCov_9fa48("8829", "8830"), lowercasePrompt.includes(stryMutAct_9fa48("8831") ? "" : (stryCov_9fa48("8831"), 'email')))) return stryMutAct_9fa48("8832") ? "" : (stryCov_9fa48("8832"), 'Email');
        if (stryMutAct_9fa48("8834") ? false : stryMutAct_9fa48("8833") ? true : (stryCov_9fa48("8833", "8834"), lowercasePrompt.includes(stryMutAct_9fa48("8835") ? "" : (stryCov_9fa48("8835"), 'gender')))) return stryMutAct_9fa48("8836") ? "" : (stryCov_9fa48("8836"), 'Gender');
        if (stryMutAct_9fa48("8839") ? lowercasePrompt.includes('race') && lowercasePrompt.includes('ethnicity') : stryMutAct_9fa48("8838") ? false : stryMutAct_9fa48("8837") ? true : (stryCov_9fa48("8837", "8838", "8839"), lowercasePrompt.includes(stryMutAct_9fa48("8840") ? "" : (stryCov_9fa48("8840"), 'race')) || lowercasePrompt.includes(stryMutAct_9fa48("8841") ? "" : (stryCov_9fa48("8841"), 'ethnicity')))) return stryMutAct_9fa48("8842") ? "" : (stryCov_9fa48("8842"), 'Race/Ethnicity');
        if (stryMutAct_9fa48("8845") ? lowercasePrompt.includes('education') || lowercasePrompt.includes('level') : stryMutAct_9fa48("8844") ? false : stryMutAct_9fa48("8843") ? true : (stryCov_9fa48("8843", "8844", "8845"), lowercasePrompt.includes(stryMutAct_9fa48("8846") ? "" : (stryCov_9fa48("8846"), 'education')) && lowercasePrompt.includes(stryMutAct_9fa48("8847") ? "" : (stryCov_9fa48("8847"), 'level')))) return stryMutAct_9fa48("8848") ? "" : (stryCov_9fa48("8848"), 'Education Level');
        if (stryMutAct_9fa48("8851") ? lowercasePrompt.includes('work') || lowercasePrompt.includes('experience') : stryMutAct_9fa48("8850") ? false : stryMutAct_9fa48("8849") ? true : (stryCov_9fa48("8849", "8850", "8851"), lowercasePrompt.includes(stryMutAct_9fa48("8852") ? "" : (stryCov_9fa48("8852"), 'work')) && lowercasePrompt.includes(stryMutAct_9fa48("8853") ? "" : (stryCov_9fa48("8853"), 'experience')))) return stryMutAct_9fa48("8854") ? "" : (stryCov_9fa48("8854"), 'Work Experience');
        if (stryMutAct_9fa48("8857") ? lowercasePrompt.includes('why') || lowercasePrompt.includes('pursuit') : stryMutAct_9fa48("8856") ? false : stryMutAct_9fa48("8855") ? true : (stryCov_9fa48("8855", "8856", "8857"), lowercasePrompt.includes(stryMutAct_9fa48("8858") ? "" : (stryCov_9fa48("8858"), 'why')) && lowercasePrompt.includes(stryMutAct_9fa48("8859") ? "" : (stryCov_9fa48("8859"), 'pursuit')))) return stryMutAct_9fa48("8860") ? "" : (stryCov_9fa48("8860"), 'Why Pursuit?');
        if (stryMutAct_9fa48("8863") ? lowercasePrompt.includes('programming') || lowercasePrompt.includes('experience') : stryMutAct_9fa48("8862") ? false : stryMutAct_9fa48("8861") ? true : (stryCov_9fa48("8861", "8862", "8863"), lowercasePrompt.includes(stryMutAct_9fa48("8864") ? "" : (stryCov_9fa48("8864"), 'programming')) && lowercasePrompt.includes(stryMutAct_9fa48("8865") ? "" : (stryCov_9fa48("8865"), 'experience')))) return stryMutAct_9fa48("8866") ? "" : (stryCov_9fa48("8866"), 'Programming Experience');
        if (stryMutAct_9fa48("8869") ? lowercasePrompt.includes('obstacle') && lowercasePrompt.includes('challenge') : stryMutAct_9fa48("8868") ? false : stryMutAct_9fa48("8867") ? true : (stryCov_9fa48("8867", "8868", "8869"), lowercasePrompt.includes(stryMutAct_9fa48("8870") ? "" : (stryCov_9fa48("8870"), 'obstacle')) || lowercasePrompt.includes(stryMutAct_9fa48("8871") ? "" : (stryCov_9fa48("8871"), 'challenge')))) return stryMutAct_9fa48("8872") ? "" : (stryCov_9fa48("8872"), 'Challenges/Obstacles');
        if (stryMutAct_9fa48("8875") ? lowercasePrompt.includes('goal') && lowercasePrompt.includes('career') : stryMutAct_9fa48("8874") ? false : stryMutAct_9fa48("8873") ? true : (stryCov_9fa48("8873", "8874", "8875"), lowercasePrompt.includes(stryMutAct_9fa48("8876") ? "" : (stryCov_9fa48("8876"), 'goal')) || lowercasePrompt.includes(stryMutAct_9fa48("8877") ? "" : (stryCov_9fa48("8877"), 'career')))) return stryMutAct_9fa48("8878") ? "" : (stryCov_9fa48("8878"), 'Career Goals');
        if (stryMutAct_9fa48("8881") ? lowercasePrompt.includes('reference') && lowercasePrompt.includes('contact') : stryMutAct_9fa48("8880") ? false : stryMutAct_9fa48("8879") ? true : (stryCov_9fa48("8879", "8880", "8881"), lowercasePrompt.includes(stryMutAct_9fa48("8882") ? "" : (stryCov_9fa48("8882"), 'reference')) || lowercasePrompt.includes(stryMutAct_9fa48("8883") ? "" : (stryCov_9fa48("8883"), 'contact')))) return stryMutAct_9fa48("8884") ? "" : (stryCov_9fa48("8884"), 'Reference Contact');
        if (stryMutAct_9fa48("8887") ? lowercasePrompt.includes('privacy') || lowercasePrompt.includes('policy') : stryMutAct_9fa48("8886") ? false : stryMutAct_9fa48("8885") ? true : (stryCov_9fa48("8885", "8886", "8887"), lowercasePrompt.includes(stryMutAct_9fa48("8888") ? "" : (stryCov_9fa48("8888"), 'privacy')) && lowercasePrompt.includes(stryMutAct_9fa48("8889") ? "" : (stryCov_9fa48("8889"), 'policy')))) return stryMutAct_9fa48("8890") ? "" : (stryCov_9fa48("8890"), 'Privacy Policy Agreement');
        if (stryMutAct_9fa48("8893") ? lowercasePrompt.includes('citizen') && lowercasePrompt.includes('authorized') : stryMutAct_9fa48("8892") ? false : stryMutAct_9fa48("8891") ? true : (stryCov_9fa48("8891", "8892", "8893"), lowercasePrompt.includes(stryMutAct_9fa48("8894") ? "" : (stryCov_9fa48("8894"), 'citizen')) || lowercasePrompt.includes(stryMutAct_9fa48("8895") ? "" : (stryCov_9fa48("8895"), 'authorized')))) return stryMutAct_9fa48("8896") ? "" : (stryCov_9fa48("8896"), 'Work Authorization');
        if (stryMutAct_9fa48("8899") ? lowercasePrompt.includes('conviction') && lowercasePrompt.includes('criminal') : stryMutAct_9fa48("8898") ? false : stryMutAct_9fa48("8897") ? true : (stryCov_9fa48("8897", "8898", "8899"), lowercasePrompt.includes(stryMutAct_9fa48("8900") ? "" : (stryCov_9fa48("8900"), 'conviction')) || lowercasePrompt.includes(stryMutAct_9fa48("8901") ? "" : (stryCov_9fa48("8901"), 'criminal')))) return stryMutAct_9fa48("8902") ? "" : (stryCov_9fa48("8902"), 'Criminal Background');

        // If no match found, try to create a shortened version
        if (stryMutAct_9fa48("8906") ? prompt.length <= 50 : stryMutAct_9fa48("8905") ? prompt.length >= 50 : stryMutAct_9fa48("8904") ? false : stryMutAct_9fa48("8903") ? true : (stryCov_9fa48("8903", "8904", "8905", "8906"), prompt.length > 50)) {
          if (stryMutAct_9fa48("8907")) {
            {}
          } else {
            stryCov_9fa48("8907");
            return (stryMutAct_9fa48("8908") ? prompt : (stryCov_9fa48("8908"), prompt.substring(0, 47))) + (stryMutAct_9fa48("8909") ? "" : (stryCov_9fa48("8909"), '...'));
          }
        }
        return prompt;
      }
    };

    // Helper function to convert arrays or semicolon-separated text to bullet points
    const formatBulletPoints = data => {
      if (stryMutAct_9fa48("8910")) {
        {}
      } else {
        stryCov_9fa48("8910");
        if (stryMutAct_9fa48("8913") ? false : stryMutAct_9fa48("8912") ? true : stryMutAct_9fa48("8911") ? data : (stryCov_9fa48("8911", "8912", "8913"), !data)) return null;
        let points = stryMutAct_9fa48("8914") ? ["Stryker was here"] : (stryCov_9fa48("8914"), []);

        // Check if data is already an array
        if (stryMutAct_9fa48("8916") ? false : stryMutAct_9fa48("8915") ? true : (stryCov_9fa48("8915", "8916"), Array.isArray(data))) {
          if (stryMutAct_9fa48("8917")) {
            {}
          } else {
            stryCov_9fa48("8917");
            points = stryMutAct_9fa48("8918") ? data : (stryCov_9fa48("8918"), data.filter(stryMutAct_9fa48("8919") ? () => undefined : (stryCov_9fa48("8919"), item => stryMutAct_9fa48("8922") ? item || item.trim() : stryMutAct_9fa48("8921") ? false : stryMutAct_9fa48("8920") ? true : (stryCov_9fa48("8920", "8921", "8922"), item && (stryMutAct_9fa48("8923") ? item : (stryCov_9fa48("8923"), item.trim()))))));
          }
        } else if (stryMutAct_9fa48("8926") ? typeof data !== 'string' : stryMutAct_9fa48("8925") ? false : stryMutAct_9fa48("8924") ? true : (stryCov_9fa48("8924", "8925", "8926"), typeof data === (stryMutAct_9fa48("8927") ? "" : (stryCov_9fa48("8927"), 'string')))) {
          if (stryMutAct_9fa48("8928")) {
            {}
          } else {
            stryCov_9fa48("8928");
            // Try to parse as JSON first (in case it's a JSON string)
            try {
              if (stryMutAct_9fa48("8929")) {
                {}
              } else {
                stryCov_9fa48("8929");
                const parsed = JSON.parse(data);
                if (stryMutAct_9fa48("8931") ? false : stryMutAct_9fa48("8930") ? true : (stryCov_9fa48("8930", "8931"), Array.isArray(parsed))) {
                  if (stryMutAct_9fa48("8932")) {
                    {}
                  } else {
                    stryCov_9fa48("8932");
                    points = stryMutAct_9fa48("8933") ? parsed : (stryCov_9fa48("8933"), parsed.filter(stryMutAct_9fa48("8934") ? () => undefined : (stryCov_9fa48("8934"), item => stryMutAct_9fa48("8937") ? item || item.trim() : stryMutAct_9fa48("8936") ? false : stryMutAct_9fa48("8935") ? true : (stryCov_9fa48("8935", "8936", "8937"), item && (stryMutAct_9fa48("8938") ? item : (stryCov_9fa48("8938"), item.trim()))))));
                  }
                } else {
                  if (stryMutAct_9fa48("8939")) {
                    {}
                  } else {
                    stryCov_9fa48("8939");
                    // Fall back to semicolon-separated splitting
                    points = stryMutAct_9fa48("8940") ? data.split(';').map(item => item.trim()) : (stryCov_9fa48("8940"), data.split(stryMutAct_9fa48("8941") ? "" : (stryCov_9fa48("8941"), ';')).map(stryMutAct_9fa48("8942") ? () => undefined : (stryCov_9fa48("8942"), item => stryMutAct_9fa48("8943") ? item : (stryCov_9fa48("8943"), item.trim()))).filter(stryMutAct_9fa48("8944") ? () => undefined : (stryCov_9fa48("8944"), item => item)));
                  }
                }
              }
            } catch (e) {
              if (stryMutAct_9fa48("8945")) {
                {}
              } else {
                stryCov_9fa48("8945");
                // Not valid JSON, split by semicolons
                points = stryMutAct_9fa48("8946") ? data.split(';').map(item => item.trim()) : (stryCov_9fa48("8946"), data.split(stryMutAct_9fa48("8947") ? "" : (stryCov_9fa48("8947"), ';')).map(stryMutAct_9fa48("8948") ? () => undefined : (stryCov_9fa48("8948"), item => stryMutAct_9fa48("8949") ? item : (stryCov_9fa48("8949"), item.trim()))).filter(stryMutAct_9fa48("8950") ? () => undefined : (stryCov_9fa48("8950"), item => item)));
              }
            }
          }
        }
        if (stryMutAct_9fa48("8953") ? points.length !== 0 : stryMutAct_9fa48("8952") ? false : stryMutAct_9fa48("8951") ? true : (stryCov_9fa48("8951", "8952", "8953"), points.length === 0)) return null;

        // Return as bullet point list
        return <ul className="bullet-list">
                {points.map(stryMutAct_9fa48("8954") ? () => undefined : (stryCov_9fa48("8954"), (point, index) => <li key={index}>{point}</li>))}
            </ul>;
      }
    };

    // Create logical groupings based on question content instead of database sections
    const getQuestionCategory = prompt => {
      if (stryMutAct_9fa48("8955")) {
        {}
      } else {
        stryCov_9fa48("8955");
        if (stryMutAct_9fa48("8958") ? false : stryMutAct_9fa48("8957") ? true : stryMutAct_9fa48("8956") ? prompt : (stryCov_9fa48("8956", "8957", "8958"), !prompt)) return stryMutAct_9fa48("8959") ? "" : (stryCov_9fa48("8959"), 'Other');
        const lowercasePrompt = stryMutAct_9fa48("8960") ? prompt.toUpperCase() : (stryCov_9fa48("8960"), prompt.toLowerCase());

        // Personal/Basic Information
        if (stryMutAct_9fa48("8963") ? (lowercasePrompt.includes('first name') || lowercasePrompt.includes('last name') || lowercasePrompt.includes('date of birth') || lowercasePrompt.includes('email') || lowercasePrompt.includes('phone') || lowercasePrompt.includes('address')) && lowercasePrompt.includes('gender') : stryMutAct_9fa48("8962") ? false : stryMutAct_9fa48("8961") ? true : (stryCov_9fa48("8961", "8962", "8963"), (stryMutAct_9fa48("8965") ? (lowercasePrompt.includes('first name') || lowercasePrompt.includes('last name') || lowercasePrompt.includes('date of birth') || lowercasePrompt.includes('email') || lowercasePrompt.includes('phone')) && lowercasePrompt.includes('address') : stryMutAct_9fa48("8964") ? false : (stryCov_9fa48("8964", "8965"), (stryMutAct_9fa48("8967") ? (lowercasePrompt.includes('first name') || lowercasePrompt.includes('last name') || lowercasePrompt.includes('date of birth') || lowercasePrompt.includes('email')) && lowercasePrompt.includes('phone') : stryMutAct_9fa48("8966") ? false : (stryCov_9fa48("8966", "8967"), (stryMutAct_9fa48("8969") ? (lowercasePrompt.includes('first name') || lowercasePrompt.includes('last name') || lowercasePrompt.includes('date of birth')) && lowercasePrompt.includes('email') : stryMutAct_9fa48("8968") ? false : (stryCov_9fa48("8968", "8969"), (stryMutAct_9fa48("8971") ? (lowercasePrompt.includes('first name') || lowercasePrompt.includes('last name')) && lowercasePrompt.includes('date of birth') : stryMutAct_9fa48("8970") ? false : (stryCov_9fa48("8970", "8971"), (stryMutAct_9fa48("8973") ? lowercasePrompt.includes('first name') && lowercasePrompt.includes('last name') : stryMutAct_9fa48("8972") ? false : (stryCov_9fa48("8972", "8973"), lowercasePrompt.includes(stryMutAct_9fa48("8974") ? "" : (stryCov_9fa48("8974"), 'first name')) || lowercasePrompt.includes(stryMutAct_9fa48("8975") ? "" : (stryCov_9fa48("8975"), 'last name')))) || lowercasePrompt.includes(stryMutAct_9fa48("8976") ? "" : (stryCov_9fa48("8976"), 'date of birth')))) || lowercasePrompt.includes(stryMutAct_9fa48("8977") ? "" : (stryCov_9fa48("8977"), 'email')))) || lowercasePrompt.includes(stryMutAct_9fa48("8978") ? "" : (stryCov_9fa48("8978"), 'phone')))) || lowercasePrompt.includes(stryMutAct_9fa48("8979") ? "" : (stryCov_9fa48("8979"), 'address')))) || lowercasePrompt.includes(stryMutAct_9fa48("8980") ? "" : (stryCov_9fa48("8980"), 'gender')))) {
          if (stryMutAct_9fa48("8981")) {
            {}
          } else {
            stryCov_9fa48("8981");
            return stryMutAct_9fa48("8982") ? "" : (stryCov_9fa48("8982"), 'Personal Information');
          }
        }

        // Background & Demographics
        if (stryMutAct_9fa48("8985") ? (lowercasePrompt.includes('race') || lowercasePrompt.includes('ethnicity') || lowercasePrompt.includes('education') || lowercasePrompt.includes('income') || lowercasePrompt.includes('citizen')) && lowercasePrompt.includes('authorized') : stryMutAct_9fa48("8984") ? false : stryMutAct_9fa48("8983") ? true : (stryCov_9fa48("8983", "8984", "8985"), (stryMutAct_9fa48("8987") ? (lowercasePrompt.includes('race') || lowercasePrompt.includes('ethnicity') || lowercasePrompt.includes('education') || lowercasePrompt.includes('income')) && lowercasePrompt.includes('citizen') : stryMutAct_9fa48("8986") ? false : (stryCov_9fa48("8986", "8987"), (stryMutAct_9fa48("8989") ? (lowercasePrompt.includes('race') || lowercasePrompt.includes('ethnicity') || lowercasePrompt.includes('education')) && lowercasePrompt.includes('income') : stryMutAct_9fa48("8988") ? false : (stryCov_9fa48("8988", "8989"), (stryMutAct_9fa48("8991") ? (lowercasePrompt.includes('race') || lowercasePrompt.includes('ethnicity')) && lowercasePrompt.includes('education') : stryMutAct_9fa48("8990") ? false : (stryCov_9fa48("8990", "8991"), (stryMutAct_9fa48("8993") ? lowercasePrompt.includes('race') && lowercasePrompt.includes('ethnicity') : stryMutAct_9fa48("8992") ? false : (stryCov_9fa48("8992", "8993"), lowercasePrompt.includes(stryMutAct_9fa48("8994") ? "" : (stryCov_9fa48("8994"), 'race')) || lowercasePrompt.includes(stryMutAct_9fa48("8995") ? "" : (stryCov_9fa48("8995"), 'ethnicity')))) || lowercasePrompt.includes(stryMutAct_9fa48("8996") ? "" : (stryCov_9fa48("8996"), 'education')))) || lowercasePrompt.includes(stryMutAct_9fa48("8997") ? "" : (stryCov_9fa48("8997"), 'income')))) || lowercasePrompt.includes(stryMutAct_9fa48("8998") ? "" : (stryCov_9fa48("8998"), 'citizen')))) || lowercasePrompt.includes(stryMutAct_9fa48("8999") ? "" : (stryCov_9fa48("8999"), 'authorized')))) {
          if (stryMutAct_9fa48("9000")) {
            {}
          } else {
            stryCov_9fa48("9000");
            return stryMutAct_9fa48("9001") ? "" : (stryCov_9fa48("9001"), 'Background & Demographics');
          }
        }

        // Experience & Work
        if (stryMutAct_9fa48("9004") ? (lowercasePrompt.includes('work') || lowercasePrompt.includes('job') || lowercasePrompt.includes('experience') || lowercasePrompt.includes('programming')) && lowercasePrompt.includes('technical') : stryMutAct_9fa48("9003") ? false : stryMutAct_9fa48("9002") ? true : (stryCov_9fa48("9002", "9003", "9004"), (stryMutAct_9fa48("9006") ? (lowercasePrompt.includes('work') || lowercasePrompt.includes('job') || lowercasePrompt.includes('experience')) && lowercasePrompt.includes('programming') : stryMutAct_9fa48("9005") ? false : (stryCov_9fa48("9005", "9006"), (stryMutAct_9fa48("9008") ? (lowercasePrompt.includes('work') || lowercasePrompt.includes('job')) && lowercasePrompt.includes('experience') : stryMutAct_9fa48("9007") ? false : (stryCov_9fa48("9007", "9008"), (stryMutAct_9fa48("9010") ? lowercasePrompt.includes('work') && lowercasePrompt.includes('job') : stryMutAct_9fa48("9009") ? false : (stryCov_9fa48("9009", "9010"), lowercasePrompt.includes(stryMutAct_9fa48("9011") ? "" : (stryCov_9fa48("9011"), 'work')) || lowercasePrompt.includes(stryMutAct_9fa48("9012") ? "" : (stryCov_9fa48("9012"), 'job')))) || lowercasePrompt.includes(stryMutAct_9fa48("9013") ? "" : (stryCov_9fa48("9013"), 'experience')))) || lowercasePrompt.includes(stryMutAct_9fa48("9014") ? "" : (stryCov_9fa48("9014"), 'programming')))) || lowercasePrompt.includes(stryMutAct_9fa48("9015") ? "" : (stryCov_9fa48("9015"), 'technical')))) {
          if (stryMutAct_9fa48("9016")) {
            {}
          } else {
            stryCov_9fa48("9016");
            return stryMutAct_9fa48("9017") ? "" : (stryCov_9fa48("9017"), 'Experience & Background');
          }
        }

        // Program Interest & Motivation - now grouped into Other
        // if (lowercasePrompt.includes('why') || lowercasePrompt.includes('pursuit') ||
        //     lowercasePrompt.includes('goal') || lowercasePrompt.includes('career') ||
        //     lowercasePrompt.includes('motivation') || lowercasePrompt.includes('interest')) {
        //     return 'Program Interest';
        // }

        // Challenges & Personal - now grouped into Other
        // if (lowercasePrompt.includes('obstacle') || lowercasePrompt.includes('challenge') ||
        //     lowercasePrompt.includes('overcome') || lowercasePrompt.includes('difficult')) {
        //     return 'Personal Story';
        // }

        // References & Additional
        if (stryMutAct_9fa48("9020") ? (lowercasePrompt.includes('reference') || lowercasePrompt.includes('contact') || lowercasePrompt.includes('privacy') || lowercasePrompt.includes('conviction')) && lowercasePrompt.includes('criminal') : stryMutAct_9fa48("9019") ? false : stryMutAct_9fa48("9018") ? true : (stryCov_9fa48("9018", "9019", "9020"), (stryMutAct_9fa48("9022") ? (lowercasePrompt.includes('reference') || lowercasePrompt.includes('contact') || lowercasePrompt.includes('privacy')) && lowercasePrompt.includes('conviction') : stryMutAct_9fa48("9021") ? false : (stryCov_9fa48("9021", "9022"), (stryMutAct_9fa48("9024") ? (lowercasePrompt.includes('reference') || lowercasePrompt.includes('contact')) && lowercasePrompt.includes('privacy') : stryMutAct_9fa48("9023") ? false : (stryCov_9fa48("9023", "9024"), (stryMutAct_9fa48("9026") ? lowercasePrompt.includes('reference') && lowercasePrompt.includes('contact') : stryMutAct_9fa48("9025") ? false : (stryCov_9fa48("9025", "9026"), lowercasePrompt.includes(stryMutAct_9fa48("9027") ? "" : (stryCov_9fa48("9027"), 'reference')) || lowercasePrompt.includes(stryMutAct_9fa48("9028") ? "" : (stryCov_9fa48("9028"), 'contact')))) || lowercasePrompt.includes(stryMutAct_9fa48("9029") ? "" : (stryCov_9fa48("9029"), 'privacy')))) || lowercasePrompt.includes(stryMutAct_9fa48("9030") ? "" : (stryCov_9fa48("9030"), 'conviction')))) || lowercasePrompt.includes(stryMutAct_9fa48("9031") ? "" : (stryCov_9fa48("9031"), 'criminal')))) {
          if (stryMutAct_9fa48("9032")) {
            {}
          } else {
            stryCov_9fa48("9032");
            return stryMutAct_9fa48("9033") ? "" : (stryCov_9fa48("9033"), 'Additional Information');
          }
        }
        return stryMutAct_9fa48("9034") ? "" : (stryCov_9fa48("9034"), 'Other');
      }
    };

    // Loading state
    if (stryMutAct_9fa48("9036") ? false : stryMutAct_9fa48("9035") ? true : (stryCov_9fa48("9035", "9036"), loading)) {
      if (stryMutAct_9fa48("9037")) {
        {}
      } else {
        stryCov_9fa48("9037");
        return <div className="application-detail">
                <div className="application-detail__loading">
                    <div className="application-detail__loading-spinner"></div>
                    <p>Loading application details...</p>
                </div>
            </div>;
      }
    }

    // Error state
    if (stryMutAct_9fa48("9039") ? false : stryMutAct_9fa48("9038") ? true : (stryCov_9fa48("9038", "9039"), error)) {
      if (stryMutAct_9fa48("9040")) {
        {}
      } else {
        stryCov_9fa48("9040");
        return <div className="application-detail">
                <div className="application-detail__error">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={fetchApplicationDetail} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>;
      }
    }

    // No data state
    if (stryMutAct_9fa48("9043") ? false : stryMutAct_9fa48("9042") ? true : stryMutAct_9fa48("9041") ? applicationData : (stryCov_9fa48("9041", "9042", "9043"), !applicationData)) {
      if (stryMutAct_9fa48("9044")) {
        {}
      } else {
        stryCov_9fa48("9044");
        return <div className="application-detail">
                <div className="application-detail__no-data">
                    <h2>Application Not Found</h2>
                    <p>The requested application could not be found.</p>
                    <button onClick={stryMutAct_9fa48("9045") ? () => undefined : (stryCov_9fa48("9045"), () => navigate(stryMutAct_9fa48("9046") ? "" : (stryCov_9fa48("9046"), '/admissions-dashboard')))} className="back-btn">
                        Back to Admissions
                    </button>
                </div>
            </div>;
      }
    }
    const {
      applicant,
      application,
      assessment,
      responses,
      questions
    } = applicationData;
    return <div className="application-detail">
            {/* Header */}
            <div className="application-detail__header">
                <div className="application-detail__header-content">
                    <button onClick={stryMutAct_9fa48("9047") ? () => undefined : (stryCov_9fa48("9047"), () => navigate(stryMutAct_9fa48("9048") ? "" : (stryCov_9fa48("9048"), '/admissions-dashboard?tab=applications')))} className="application-detail__back-btn">
                        ← Back to Applicants
                    </button>
                    <div className="application-detail__title">
                        <h1>Applicant Details</h1>
                        <span className={stryMutAct_9fa48("9049") ? `` : (stryCov_9fa48("9049"), `status-badge status-badge--${application.status}`)}>
                            {application.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="application-detail__content">
                {/* Condensed Header with Applicant Info and Assessment */}
                <div className="application-detail__section application-detail__section--condensed">
                    <div className="application-detail__condensed-header">
                        <div className="application-detail__condensed-header-left">
                            <div className="application-detail__applicant-name-section">
                                <h1 className="application-detail__applicant-name">
                                    {applicant.first_name} {applicant.last_name}
                                    {stryMutAct_9fa48("9052") ? assessment?.has_masters_degree || <span className="application-detail__masters-flag" title="Has Masters Degree">🎓</span> : stryMutAct_9fa48("9051") ? false : stryMutAct_9fa48("9050") ? true : (stryCov_9fa48("9050", "9051", "9052"), (stryMutAct_9fa48("9053") ? assessment.has_masters_degree : (stryCov_9fa48("9053"), assessment?.has_masters_degree)) && <span className="application-detail__masters-flag" title="Has Masters Degree">🎓</span>)}
                                </h1>
                                <div className="application-detail__applicant-details">
                                    <span className="application-detail__applicant-email">{applicant.email}</span>
                                    <span className="application-detail__applicant-applied">
                                        APPLIED: {new Date(application.created_at).toLocaleDateString(stryMutAct_9fa48("9054") ? "" : (stryCov_9fa48("9054"), 'en-US'), stryMutAct_9fa48("9055") ? {} : (stryCov_9fa48("9055"), {
                      month: stryMutAct_9fa48("9056") ? "" : (stryCov_9fa48("9056"), 'numeric'),
                      day: stryMutAct_9fa48("9057") ? "" : (stryCov_9fa48("9057"), 'numeric'),
                      year: stryMutAct_9fa48("9058") ? "" : (stryCov_9fa48("9058"), 'numeric')
                    }))}
                                    </span>
                                </div>
                            </div>
                            <div className="application-detail__action-buttons">
                                <button className="application-detail__notes-btn application-detail__notes-btn--header" onClick={openNotesModal}>
                                    📝 Notes
                                </button>
                                <button className="application-detail__actions-btn" onClick={openActionsModal}>
                                    ⚡ Actions
                                </button>
                            </div>
                        </div>

                        <div className="application-detail__condensed-header-right">
                            {(stryMutAct_9fa48("9061") ? assessment || assessment.recommendation : stryMutAct_9fa48("9060") ? false : stryMutAct_9fa48("9059") ? true : (stryCov_9fa48("9059", "9060", "9061"), assessment && assessment.recommendation)) ? <>
                                    <div className="application-detail__recommendation-badge-condensed">
                                        <div className={stryMutAct_9fa48("9062") ? `` : (stryCov_9fa48("9062"), `application-detail__recommendation-status application-detail__recommendation-status--${assessment.recommendation}`)}>
                                            <div className="application-detail__recommendation-icon">
                                                {stryMutAct_9fa48("9065") ? assessment.recommendation === 'strong_recommend' || '✓' : stryMutAct_9fa48("9064") ? false : stryMutAct_9fa48("9063") ? true : (stryCov_9fa48("9063", "9064", "9065"), (stryMutAct_9fa48("9067") ? assessment.recommendation !== 'strong_recommend' : stryMutAct_9fa48("9066") ? true : (stryCov_9fa48("9066", "9067"), assessment.recommendation === (stryMutAct_9fa48("9068") ? "" : (stryCov_9fa48("9068"), 'strong_recommend')))) && (stryMutAct_9fa48("9069") ? "" : (stryCov_9fa48("9069"), '✓')))}
                                                {stryMutAct_9fa48("9072") ? assessment.recommendation === 'recommend' || '✓' : stryMutAct_9fa48("9071") ? false : stryMutAct_9fa48("9070") ? true : (stryCov_9fa48("9070", "9071", "9072"), (stryMutAct_9fa48("9074") ? assessment.recommendation !== 'recommend' : stryMutAct_9fa48("9073") ? true : (stryCov_9fa48("9073", "9074"), assessment.recommendation === (stryMutAct_9fa48("9075") ? "" : (stryCov_9fa48("9075"), 'recommend')))) && (stryMutAct_9fa48("9076") ? "" : (stryCov_9fa48("9076"), '✓')))}
                                                {stryMutAct_9fa48("9079") ? assessment.recommendation === 'review_needed' || '⚠️' : stryMutAct_9fa48("9078") ? false : stryMutAct_9fa48("9077") ? true : (stryCov_9fa48("9077", "9078", "9079"), (stryMutAct_9fa48("9081") ? assessment.recommendation !== 'review_needed' : stryMutAct_9fa48("9080") ? true : (stryCov_9fa48("9080", "9081"), assessment.recommendation === (stryMutAct_9fa48("9082") ? "" : (stryCov_9fa48("9082"), 'review_needed')))) && (stryMutAct_9fa48("9083") ? "" : (stryCov_9fa48("9083"), '⚠️')))}
                                                {stryMutAct_9fa48("9086") ? assessment.recommendation === 'not_recommend' || '✗' : stryMutAct_9fa48("9085") ? false : stryMutAct_9fa48("9084") ? true : (stryCov_9fa48("9084", "9085", "9086"), (stryMutAct_9fa48("9088") ? assessment.recommendation !== 'not_recommend' : stryMutAct_9fa48("9087") ? true : (stryCov_9fa48("9087", "9088"), assessment.recommendation === (stryMutAct_9fa48("9089") ? "" : (stryCov_9fa48("9089"), 'not_recommend')))) && (stryMutAct_9fa48("9090") ? "" : (stryCov_9fa48("9090"), '✗')))}
                                            </div>
                                            <span>{assessment.recommendation.replace(stryMutAct_9fa48("9091") ? "" : (stryCov_9fa48("9091"), '_'), stryMutAct_9fa48("9092") ? "" : (stryCov_9fa48("9092"), ' '))}</span>
                                        </div>
                                    </div>

                                    <div className="application-detail__assessment-scores-condensed">
                                        <div className="application-detail__score-item-condensed application-detail__score-item-condensed--overall">
                                            <div className="application-detail__score-circle-condensed">
                                                <svg viewBox="0 0 100 100">
                                                    <defs>
                                                        <linearGradient id="overallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#06d6a0" />
                                                            <stop offset="50%" stopColor="#4ecdc4" />
                                                            <stop offset="100%" stopColor="#45b7d1" />
                                                        </linearGradient>
                                                    </defs>
                                                    <circle cx="50" cy="50" r="40" className="application-detail__score-circle-bg" />
                                                    <circle cx="50" cy="50" r="40" className="application-detail__score-circle-progress application-detail__score-circle-progress--overall" strokeDasharray={stryMutAct_9fa48("9093") ? `` : (stryCov_9fa48("9093"), `${stryMutAct_9fa48("9094") ? assessment.overall_score / 100 / 251.2 : (stryCov_9fa48("9094"), (stryMutAct_9fa48("9095") ? assessment.overall_score * 100 : (stryCov_9fa48("9095"), assessment.overall_score / 100)) * 251.2)} 251.2`)} />
                                                </svg>
                                                <div className="application-detail__score-value-condensed">{assessment.overall_score}</div>
                                            </div>
                                            <div className="application-detail__score-label-condensed">Overall<br />Score</div>
                                        </div>

                                        <div className="application-detail__score-arrow">→</div>

                                        <div className="application-detail__detailed-scores">
                                            <div className="application-detail__score-item-condensed">
                                                <div className="application-detail__score-circle-condensed application-detail__score-circle-condensed--small">
                                                    <svg viewBox="0 0 100 100">
                                                        <defs>
                                                            <linearGradient id="learningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="0%" stopColor="#ff6b6b" />
                                                                <stop offset="50%" stopColor="#4ecdc4" />
                                                                <stop offset="100%" stopColor="#45b7d1" />
                                                            </linearGradient>
                                                        </defs>
                                                        <circle cx="50" cy="50" r="40" className="application-detail__score-circle-bg" />
                                                        <circle cx="50" cy="50" r="40" className="application-detail__score-circle-progress application-detail__score-circle-progress--learning" strokeDasharray={stryMutAct_9fa48("9096") ? `` : (stryCov_9fa48("9096"), `${stryMutAct_9fa48("9097") ? assessment.learning_score / 100 / 251.2 : (stryCov_9fa48("9097"), (stryMutAct_9fa48("9098") ? assessment.learning_score * 100 : (stryCov_9fa48("9098"), assessment.learning_score / 100)) * 251.2)} 251.2`)} />
                                                    </svg>
                                                    <div className="application-detail__score-value-condensed application-detail__score-value-condensed--small">{assessment.learning_score}</div>
                                                </div>
                                                <div className="application-detail__score-label-condensed">Learning<br />Ability</div>
                                            </div>

                                            <div className="application-detail__score-item-condensed">
                                                <div className="application-detail__score-circle-condensed application-detail__score-circle-condensed--small">
                                                    <svg viewBox="0 0 100 100">
                                                        <defs>
                                                            <linearGradient id="gritGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="0%" stopColor="#ffd93d" />
                                                                <stop offset="50%" stopColor="#ff9a3c" />
                                                                <stop offset="100%" stopColor="#ff6b6b" />
                                                            </linearGradient>
                                                        </defs>
                                                        <circle cx="50" cy="50" r="40" className="application-detail__score-circle-bg" />
                                                        <circle cx="50" cy="50" r="40" className="application-detail__score-circle-progress application-detail__score-circle-progress--grit" strokeDasharray={stryMutAct_9fa48("9099") ? `` : (stryCov_9fa48("9099"), `${stryMutAct_9fa48("9100") ? assessment.grit_score / 100 / 251.2 : (stryCov_9fa48("9100"), (stryMutAct_9fa48("9101") ? assessment.grit_score * 100 : (stryCov_9fa48("9101"), assessment.grit_score / 100)) * 251.2)} 251.2`)} />
                                                    </svg>
                                                    <div className="application-detail__score-value-condensed application-detail__score-value-condensed--small">{assessment.grit_score}</div>
                                                </div>
                                                <div className="application-detail__score-label-condensed">Grit &<br />Perseverance</div>
                                            </div>

                                            <div className="application-detail__score-item-condensed">
                                                <div className="application-detail__score-circle-condensed application-detail__score-circle-condensed--small">
                                                    <svg viewBox="0 0 100 100">
                                                        <defs>
                                                            <linearGradient id="thinkingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="0%" stopColor="#a855f7" />
                                                                <stop offset="50%" stopColor="#3b82f6" />
                                                                <stop offset="100%" stopColor="#06b6d4" />
                                                            </linearGradient>
                                                        </defs>
                                                        <circle cx="50" cy="50" r="40" className="application-detail__score-circle-bg" />
                                                        <circle cx="50" cy="50" r="40" className="application-detail__score-circle-progress application-detail__score-circle-progress--thinking" strokeDasharray={stryMutAct_9fa48("9102") ? `` : (stryCov_9fa48("9102"), `${stryMutAct_9fa48("9103") ? assessment.critical_thinking_score / 100 / 251.2 : (stryCov_9fa48("9103"), (stryMutAct_9fa48("9104") ? assessment.critical_thinking_score * 100 : (stryCov_9fa48("9104"), assessment.critical_thinking_score / 100)) * 251.2)} 251.2`)} />
                                                    </svg>
                                                    <div className="application-detail__score-value-condensed application-detail__score-value-condensed--small">{assessment.critical_thinking_score}</div>
                                                </div>
                                                <div className="application-detail__score-label-condensed">Critical<br />Thinking</div>
                                            </div>
                                        </div>
                                    </div>
                                </> : <div className="application-detail__assessment-pending-condensed">
                                    <div className="application-detail__pending-badge">Assessment Pending</div>
                                </div>}
                        </div>
                    </div>

                    {/* Assessment Flags */}
                    {stryMutAct_9fa48("9107") ? assessment || <div className="application-detail__assessment-flags-condensed">
                            {(() => {
              const flags = [];

              // Missing questions flag
              if (assessment.missing_count > 0) {
                flags.push(<div key="missing" className="application-detail__assessment-flag application-detail__assessment-flag--warning">
                                            <span className="application-detail__flag-icon">⚠️</span>
                                            <span className="application-detail__flag-text">{assessment.missing_count} key question{assessment.missing_count > 1 ? 's' : ''} incomplete</span>
                                        </div>);
              }

              // Creation sharing link flag
              const creationQuestion = responses?.find(r => {
                const question = questions?.find(q => q.question_id === r.question_id);
                return question?.prompt?.toLowerCase().includes('created') && question?.prompt?.toLowerCase().includes('share') && question?.prompt?.toLowerCase().includes('link');
              });
              if (creationQuestion?.response_value && creationQuestion.response_value.trim()) {
                const isUrl = /^https?:\/\//.test(creationQuestion.response_value.trim());
                flags.push(<div key="creation" className="application-detail__assessment-flag application-detail__assessment-flag--info">
                                            <span className="application-detail__flag-icon">🔗</span>
                                            <span className="application-detail__flag-text">
                                                Shared creation: {isUrl ? <a href={creationQuestion.response_value.trim()} target="_blank" rel="noopener noreferrer" className="application-detail__creation-link">
                                                        {creationQuestion.response_value.trim()}
                                                    </a> : <span className="application-detail__creation-text">{creationQuestion.response_value.trim()}</span>}
                                            </span>
                                        </div>);
              }
              return flags.length > 0 ? flags : null;
            })()}
                        </div> : stryMutAct_9fa48("9106") ? false : stryMutAct_9fa48("9105") ? true : (stryCov_9fa48("9105", "9106", "9107"), assessment && <div className="application-detail__assessment-flags-condensed">
                            {(() => {
              if (stryMutAct_9fa48("9108")) {
                {}
              } else {
                stryCov_9fa48("9108");
                const flags = stryMutAct_9fa48("9109") ? ["Stryker was here"] : (stryCov_9fa48("9109"), []);

                // Missing questions flag
                if (stryMutAct_9fa48("9113") ? assessment.missing_count <= 0 : stryMutAct_9fa48("9112") ? assessment.missing_count >= 0 : stryMutAct_9fa48("9111") ? false : stryMutAct_9fa48("9110") ? true : (stryCov_9fa48("9110", "9111", "9112", "9113"), assessment.missing_count > 0)) {
                  if (stryMutAct_9fa48("9114")) {
                    {}
                  } else {
                    stryCov_9fa48("9114");
                    flags.push(<div key="missing" className="application-detail__assessment-flag application-detail__assessment-flag--warning">
                                            <span className="application-detail__flag-icon">⚠️</span>
                                            <span className="application-detail__flag-text">{assessment.missing_count} key question{(stryMutAct_9fa48("9118") ? assessment.missing_count <= 1 : stryMutAct_9fa48("9117") ? assessment.missing_count >= 1 : stryMutAct_9fa48("9116") ? false : stryMutAct_9fa48("9115") ? true : (stryCov_9fa48("9115", "9116", "9117", "9118"), assessment.missing_count > 1)) ? stryMutAct_9fa48("9119") ? "" : (stryCov_9fa48("9119"), 's') : stryMutAct_9fa48("9120") ? "Stryker was here!" : (stryCov_9fa48("9120"), '')} incomplete</span>
                                        </div>);
                  }
                }

                // Creation sharing link flag
                const creationQuestion = stryMutAct_9fa48("9121") ? responses.find(r => {
                  const question = questions?.find(q => q.question_id === r.question_id);
                  return question?.prompt?.toLowerCase().includes('created') && question?.prompt?.toLowerCase().includes('share') && question?.prompt?.toLowerCase().includes('link');
                }) : (stryCov_9fa48("9121"), responses?.find(r => {
                  if (stryMutAct_9fa48("9122")) {
                    {}
                  } else {
                    stryCov_9fa48("9122");
                    const question = stryMutAct_9fa48("9123") ? questions.find(q => q.question_id === r.question_id) : (stryCov_9fa48("9123"), questions?.find(stryMutAct_9fa48("9124") ? () => undefined : (stryCov_9fa48("9124"), q => stryMutAct_9fa48("9127") ? q.question_id !== r.question_id : stryMutAct_9fa48("9126") ? false : stryMutAct_9fa48("9125") ? true : (stryCov_9fa48("9125", "9126", "9127"), q.question_id === r.question_id))));
                    return stryMutAct_9fa48("9130") ? question?.prompt?.toLowerCase().includes('created') && question?.prompt?.toLowerCase().includes('share') || question?.prompt?.toLowerCase().includes('link') : stryMutAct_9fa48("9129") ? false : stryMutAct_9fa48("9128") ? true : (stryCov_9fa48("9128", "9129", "9130"), (stryMutAct_9fa48("9132") ? question?.prompt?.toLowerCase().includes('created') || question?.prompt?.toLowerCase().includes('share') : stryMutAct_9fa48("9131") ? true : (stryCov_9fa48("9131", "9132"), (stryMutAct_9fa48("9135") ? question.prompt?.toLowerCase().includes('created') : stryMutAct_9fa48("9134") ? question?.prompt.toLowerCase().includes('created') : stryMutAct_9fa48("9133") ? question?.prompt?.toUpperCase().includes('created') : (stryCov_9fa48("9133", "9134", "9135"), question?.prompt?.toLowerCase().includes(stryMutAct_9fa48("9136") ? "" : (stryCov_9fa48("9136"), 'created')))) && (stryMutAct_9fa48("9139") ? question.prompt?.toLowerCase().includes('share') : stryMutAct_9fa48("9138") ? question?.prompt.toLowerCase().includes('share') : stryMutAct_9fa48("9137") ? question?.prompt?.toUpperCase().includes('share') : (stryCov_9fa48("9137", "9138", "9139"), question?.prompt?.toLowerCase().includes(stryMutAct_9fa48("9140") ? "" : (stryCov_9fa48("9140"), 'share')))))) && (stryMutAct_9fa48("9143") ? question.prompt?.toLowerCase().includes('link') : stryMutAct_9fa48("9142") ? question?.prompt.toLowerCase().includes('link') : stryMutAct_9fa48("9141") ? question?.prompt?.toUpperCase().includes('link') : (stryCov_9fa48("9141", "9142", "9143"), question?.prompt?.toLowerCase().includes(stryMutAct_9fa48("9144") ? "" : (stryCov_9fa48("9144"), 'link')))));
                  }
                }));
                if (stryMutAct_9fa48("9147") ? creationQuestion?.response_value || creationQuestion.response_value.trim() : stryMutAct_9fa48("9146") ? false : stryMutAct_9fa48("9145") ? true : (stryCov_9fa48("9145", "9146", "9147"), (stryMutAct_9fa48("9148") ? creationQuestion.response_value : (stryCov_9fa48("9148"), creationQuestion?.response_value)) && (stryMutAct_9fa48("9149") ? creationQuestion.response_value : (stryCov_9fa48("9149"), creationQuestion.response_value.trim())))) {
                  if (stryMutAct_9fa48("9150")) {
                    {}
                  } else {
                    stryCov_9fa48("9150");
                    const isUrl = (stryMutAct_9fa48("9152") ? /^https:\/\// : stryMutAct_9fa48("9151") ? /https?:\/\// : (stryCov_9fa48("9151", "9152"), /^https?:\/\//)).test(stryMutAct_9fa48("9153") ? creationQuestion.response_value : (stryCov_9fa48("9153"), creationQuestion.response_value.trim()));
                    flags.push(<div key="creation" className="application-detail__assessment-flag application-detail__assessment-flag--info">
                                            <span className="application-detail__flag-icon">🔗</span>
                                            <span className="application-detail__flag-text">
                                                Shared creation: {isUrl ? <a href={stryMutAct_9fa48("9154") ? creationQuestion.response_value : (stryCov_9fa48("9154"), creationQuestion.response_value.trim())} target="_blank" rel="noopener noreferrer" className="application-detail__creation-link">
                                                        {stryMutAct_9fa48("9155") ? creationQuestion.response_value : (stryCov_9fa48("9155"), creationQuestion.response_value.trim())}
                                                    </a> : <span className="application-detail__creation-text">{stryMutAct_9fa48("9156") ? creationQuestion.response_value : (stryCov_9fa48("9156"), creationQuestion.response_value.trim())}</span>}
                                            </span>
                                        </div>);
                  }
                }
                return (stryMutAct_9fa48("9160") ? flags.length <= 0 : stryMutAct_9fa48("9159") ? flags.length >= 0 : stryMutAct_9fa48("9158") ? false : stryMutAct_9fa48("9157") ? true : (stryCov_9fa48("9157", "9158", "9159", "9160"), flags.length > 0)) ? flags : null;
              }
            })()}
                        </div>)}

                    {/* Detailed Analysis - Expandable */}
                    {stryMutAct_9fa48("9163") ? assessment && assessment.recommendation || <div className="application-detail__detailed-analysis">
                            <details className="assessment-expandable">
                                <summary className="assessment-expandable__summary">
                                    📋 View Detailed Analysis
                                </summary>
                                <div className="assessment-expandable__content">
                                    {assessment.strengths && <div className="assessment-detail-item">
                                            <h4>Strengths</h4>
                                            {formatBulletPoints(assessment.strengths)}
                                        </div>}

                                    {assessment.concerns && <div className="assessment-detail-item">
                                            <h4>Areas of Concern</h4>
                                            {formatBulletPoints(assessment.concerns)}
                                        </div>}

                                    {assessment.weaknesses && <div className="assessment-detail-item">
                                            <h4>Weaknesses</h4>
                                            {formatBulletPoints(assessment.weaknesses)}
                                        </div>}

                                    {assessment.areas_for_development && <div className="assessment-detail-item">
                                            <h4>Areas for Development</h4>
                                            {formatBulletPoints(assessment.areas_for_development)}
                                        </div>}

                                    {assessment.analysis_notes && <div className="assessment-detail-item">
                                            <h4>Analysis Notes</h4>
                                            <p>{assessment.analysis_notes}</p>
                                        </div>}

                                    {assessment.recommendation_reason && <div className="assessment-detail-item">
                                            <h4>Recommendation Reasoning</h4>
                                            <p>{assessment.recommendation_reason}</p>
                                        </div>}

                                    <div className="assessment-metadata">
                                        <p className="assessment-meta">
                                            Assessment completed on {new Date(assessment.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </details>
                        </div> : stryMutAct_9fa48("9162") ? false : stryMutAct_9fa48("9161") ? true : (stryCov_9fa48("9161", "9162", "9163"), (stryMutAct_9fa48("9165") ? assessment || assessment.recommendation : stryMutAct_9fa48("9164") ? true : (stryCov_9fa48("9164", "9165"), assessment && assessment.recommendation)) && <div className="application-detail__detailed-analysis">
                            <details className="assessment-expandable">
                                <summary className="assessment-expandable__summary">
                                    📋 View Detailed Analysis
                                </summary>
                                <div className="assessment-expandable__content">
                                    {stryMutAct_9fa48("9168") ? assessment.strengths || <div className="assessment-detail-item">
                                            <h4>Strengths</h4>
                                            {formatBulletPoints(assessment.strengths)}
                                        </div> : stryMutAct_9fa48("9167") ? false : stryMutAct_9fa48("9166") ? true : (stryCov_9fa48("9166", "9167", "9168"), assessment.strengths && <div className="assessment-detail-item">
                                            <h4>Strengths</h4>
                                            {formatBulletPoints(assessment.strengths)}
                                        </div>)}

                                    {stryMutAct_9fa48("9171") ? assessment.concerns || <div className="assessment-detail-item">
                                            <h4>Areas of Concern</h4>
                                            {formatBulletPoints(assessment.concerns)}
                                        </div> : stryMutAct_9fa48("9170") ? false : stryMutAct_9fa48("9169") ? true : (stryCov_9fa48("9169", "9170", "9171"), assessment.concerns && <div className="assessment-detail-item">
                                            <h4>Areas of Concern</h4>
                                            {formatBulletPoints(assessment.concerns)}
                                        </div>)}

                                    {stryMutAct_9fa48("9174") ? assessment.weaknesses || <div className="assessment-detail-item">
                                            <h4>Weaknesses</h4>
                                            {formatBulletPoints(assessment.weaknesses)}
                                        </div> : stryMutAct_9fa48("9173") ? false : stryMutAct_9fa48("9172") ? true : (stryCov_9fa48("9172", "9173", "9174"), assessment.weaknesses && <div className="assessment-detail-item">
                                            <h4>Weaknesses</h4>
                                            {formatBulletPoints(assessment.weaknesses)}
                                        </div>)}

                                    {stryMutAct_9fa48("9177") ? assessment.areas_for_development || <div className="assessment-detail-item">
                                            <h4>Areas for Development</h4>
                                            {formatBulletPoints(assessment.areas_for_development)}
                                        </div> : stryMutAct_9fa48("9176") ? false : stryMutAct_9fa48("9175") ? true : (stryCov_9fa48("9175", "9176", "9177"), assessment.areas_for_development && <div className="assessment-detail-item">
                                            <h4>Areas for Development</h4>
                                            {formatBulletPoints(assessment.areas_for_development)}
                                        </div>)}

                                    {stryMutAct_9fa48("9180") ? assessment.analysis_notes || <div className="assessment-detail-item">
                                            <h4>Analysis Notes</h4>
                                            <p>{assessment.analysis_notes}</p>
                                        </div> : stryMutAct_9fa48("9179") ? false : stryMutAct_9fa48("9178") ? true : (stryCov_9fa48("9178", "9179", "9180"), assessment.analysis_notes && <div className="assessment-detail-item">
                                            <h4>Analysis Notes</h4>
                                            <p>{assessment.analysis_notes}</p>
                                        </div>)}

                                    {stryMutAct_9fa48("9183") ? assessment.recommendation_reason || <div className="assessment-detail-item">
                                            <h4>Recommendation Reasoning</h4>
                                            <p>{assessment.recommendation_reason}</p>
                                        </div> : stryMutAct_9fa48("9182") ? false : stryMutAct_9fa48("9181") ? true : (stryCov_9fa48("9181", "9182", "9183"), assessment.recommendation_reason && <div className="assessment-detail-item">
                                            <h4>Recommendation Reasoning</h4>
                                            <p>{assessment.recommendation_reason}</p>
                                        </div>)}

                                    <div className="assessment-metadata">
                                        <p className="assessment-meta">
                                            Assessment completed on {new Date(assessment.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </details>
                        </div>)}
                </div>



                {/* Application Responses */}
                <div className="application-detail__section">
                    <h2>Application Responses</h2>
                    {(stryMutAct_9fa48("9186") ? responses || responses.length > 0 : stryMutAct_9fa48("9185") ? false : stryMutAct_9fa48("9184") ? true : (stryCov_9fa48("9184", "9185", "9186"), responses && (stryMutAct_9fa48("9189") ? responses.length <= 0 : stryMutAct_9fa48("9188") ? responses.length >= 0 : stryMutAct_9fa48("9187") ? true : (stryCov_9fa48("9187", "9188", "9189"), responses.length > 0)))) ? <div className="responses-by-section">
                            {(() => {
              if (stryMutAct_9fa48("9190")) {
                {}
              } else {
                stryCov_9fa48("9190");
                // Define the 9 key analysis questions in order
                const keyAnalysisQuestions = stryMutAct_9fa48("9191") ? [] : (stryCov_9fa48("9191"), [1046,
                // "Please explain your education and work history in more detail."
                1052,
                // "Share your thoughts and perspectives on AI..."
                1053,
                // "Some applicants have a background, identity, interest, or talent..."
                1055,
                // "List all of the questions you used to ask the AI to learn."
                1056,
                // "Explain, in your own words, what a neural network is."
                1057,
                // "What is the basic structure and function of a neural network?"
                1059,
                // "What aspect of neural networks did you find most intriguing..."
                1061,
                // "What did you learn about this new aspect you listed above? (optional)"
                1062 // "How did using AI tools to learn about a new topic influence your learning process?"
                ]);

                // Separate key analysis questions from other responses
                const keyResponses = stryMutAct_9fa48("9192") ? ["Stryker was here"] : (stryCov_9fa48("9192"), []);
                const otherResponses = stryMutAct_9fa48("9193") ? ["Stryker was here"] : (stryCov_9fa48("9193"), []);
                responses.forEach(response => {
                  if (stryMutAct_9fa48("9194")) {
                    {}
                  } else {
                    stryCov_9fa48("9194");
                    const question = stryMutAct_9fa48("9195") ? questions.find(q => q.question_id === response.question_id) : (stryCov_9fa48("9195"), questions?.find(stryMutAct_9fa48("9196") ? () => undefined : (stryCov_9fa48("9196"), q => stryMutAct_9fa48("9199") ? q.question_id !== response.question_id : stryMutAct_9fa48("9198") ? false : stryMutAct_9fa48("9197") ? true : (stryCov_9fa48("9197", "9198", "9199"), q.question_id === response.question_id))));
                    if (stryMutAct_9fa48("9201") ? false : stryMutAct_9fa48("9200") ? true : (stryCov_9fa48("9200", "9201"), question)) {
                      if (stryMutAct_9fa48("9202")) {
                        {}
                      } else {
                        stryCov_9fa48("9202");
                        const responseData = stryMutAct_9fa48("9203") ? {} : (stryCov_9fa48("9203"), {
                          response,
                          question,
                          shortLabel: getShorthandLabel(question.prompt, question.question_id)
                        });
                        if (stryMutAct_9fa48("9205") ? false : stryMutAct_9fa48("9204") ? true : (stryCov_9fa48("9204", "9205"), keyAnalysisQuestions.includes(question.question_id))) {
                          if (stryMutAct_9fa48("9206")) {
                            {}
                          } else {
                            stryCov_9fa48("9206");
                            keyResponses.push(responseData);
                          }
                        } else {
                          if (stryMutAct_9fa48("9207")) {
                            {}
                          } else {
                            stryCov_9fa48("9207");
                            otherResponses.push(responseData);
                          }
                        }
                      }
                    }
                  }
                });

                // Sort key responses by the defined order
                stryMutAct_9fa48("9208") ? keyResponses : (stryCov_9fa48("9208"), keyResponses.sort((a, b) => {
                  if (stryMutAct_9fa48("9209")) {
                    {}
                  } else {
                    stryCov_9fa48("9209");
                    const indexA = keyAnalysisQuestions.indexOf(a.question.question_id);
                    const indexB = keyAnalysisQuestions.indexOf(b.question.question_id);
                    return stryMutAct_9fa48("9210") ? indexA + indexB : (stryCov_9fa48("9210"), indexA - indexB);
                  }
                }));

                // Group other responses by logical categories
                const responsesByCategory = {};
                const categoryOrder = stryMutAct_9fa48("9211") ? [] : (stryCov_9fa48("9211"), [stryMutAct_9fa48("9212") ? "" : (stryCov_9fa48("9212"), 'Personal Information'), stryMutAct_9fa48("9213") ? "" : (stryCov_9fa48("9213"), 'Background & Demographics'), stryMutAct_9fa48("9214") ? "" : (stryCov_9fa48("9214"), 'Experience & Background'), stryMutAct_9fa48("9215") ? "" : (stryCov_9fa48("9215"), 'Additional Information'), stryMutAct_9fa48("9216") ? "" : (stryCov_9fa48("9216"), 'Other')]);
                otherResponses.forEach(responseData => {
                  if (stryMutAct_9fa48("9217")) {
                    {}
                  } else {
                    stryCov_9fa48("9217");
                    const category = getQuestionCategory(responseData.question.prompt);
                    if (stryMutAct_9fa48("9220") ? false : stryMutAct_9fa48("9219") ? true : stryMutAct_9fa48("9218") ? responsesByCategory[category] : (stryCov_9fa48("9218", "9219", "9220"), !responsesByCategory[category])) {
                      if (stryMutAct_9fa48("9221")) {
                        {}
                      } else {
                        stryCov_9fa48("9221");
                        responsesByCategory[category] = stryMutAct_9fa48("9222") ? ["Stryker was here"] : (stryCov_9fa48("9222"), []);
                      }
                    }
                    responsesByCategory[category].push(responseData);
                  }
                });
                const sections = stryMutAct_9fa48("9223") ? ["Stryker was here"] : (stryCov_9fa48("9223"), []);

                // First section: Key Analysis Questions
                if (stryMutAct_9fa48("9227") ? keyResponses.length <= 0 : stryMutAct_9fa48("9226") ? keyResponses.length >= 0 : stryMutAct_9fa48("9225") ? false : stryMutAct_9fa48("9224") ? true : (stryCov_9fa48("9224", "9225", "9226", "9227"), keyResponses.length > 0)) {
                  if (stryMutAct_9fa48("9228")) {
                    {}
                  } else {
                    stryCov_9fa48("9228");
                    const sectionKey = stryMutAct_9fa48("9229") ? "" : (stryCov_9fa48("9229"), 'key-analysis');
                    const isExpanded = expandedSections[sectionKey];
                    sections.push(<div key="key-analysis" className="response-section">
                                            <h3 className="response-section__title response-section__title--collapsible" onClick={stryMutAct_9fa48("9230") ? () => undefined : (stryCov_9fa48("9230"), () => toggleSection(sectionKey))}>
                                                <span className="section-toggle-arrow">
                                                    {isExpanded ? stryMutAct_9fa48("9231") ? "" : (stryCov_9fa48("9231"), '▼') : stryMutAct_9fa48("9232") ? "" : (stryCov_9fa48("9232"), '▶')}
                                                </span>
                                                Key Analysis Questions
                                                <span className="section-count">({keyResponses.length})</span>
                                            </h3>
                                            {stryMutAct_9fa48("9235") ? isExpanded || <div className="responses-list responses-list--compact">
                                                    {keyResponses.map(({
                          response,
                          question,
                          shortLabel
                        }, index) => <div key={response.question_id || index} className="response-item response-item--compact">
                                                            <div className="response-item__question">
                                                                <h4>
                                                                    <span className="question-number">Q{keyAnalysisQuestions.indexOf(question.question_id) + 1}</span>
                                                                    {shortLabel}
                                                                </h4>
                                                                <div className="response-item__full-question">
                                                                    {question.prompt}
                                                                </div>
                                                            </div>
                                                            <div className="response-item__answer">
                                                                {response.response_value ? <p>{formatResponseValue(response.response_value, question?.response_type)}</p> : <p className="no-response">No response provided</p>}
                                                            </div>
                                                        </div>)}
                                                </div> : stryMutAct_9fa48("9234") ? false : stryMutAct_9fa48("9233") ? true : (stryCov_9fa48("9233", "9234", "9235"), isExpanded && <div className="responses-list responses-list--compact">
                                                    {keyResponses.map(stryMutAct_9fa48("9236") ? () => undefined : (stryCov_9fa48("9236"), ({
                          response,
                          question,
                          shortLabel
                        }, index) => <div key={stryMutAct_9fa48("9239") ? response.question_id && index : stryMutAct_9fa48("9238") ? false : stryMutAct_9fa48("9237") ? true : (stryCov_9fa48("9237", "9238", "9239"), response.question_id || index)} className="response-item response-item--compact">
                                                            <div className="response-item__question">
                                                                <h4>
                                                                    <span className="question-number">Q{stryMutAct_9fa48("9240") ? keyAnalysisQuestions.indexOf(question.question_id) - 1 : (stryCov_9fa48("9240"), keyAnalysisQuestions.indexOf(question.question_id) + 1)}</span>
                                                                    {shortLabel}
                                                                </h4>
                                                                <div className="response-item__full-question">
                                                                    {question.prompt}
                                                                </div>
                                                            </div>
                                                            <div className="response-item__answer">
                                                                {response.response_value ? <p>{formatResponseValue(response.response_value, stryMutAct_9fa48("9241") ? question.response_type : (stryCov_9fa48("9241"), question?.response_type))}</p> : <p className="no-response">No response provided</p>}
                                                            </div>
                                                        </div>))}
                                                </div>)}
                                        </div>);
                  }
                }

                // Then add other sections in logical order
                stryMutAct_9fa48("9242") ? categoryOrder.forEach(category => {
                  const sectionKey = category.toLowerCase().replace(/\s+/g, '-');
                  const isExpanded = expandedSections[sectionKey];
                  sections.push(<div key={category} className="response-section">
                                                <h3 className="response-section__title response-section__title--collapsible" onClick={() => toggleSection(sectionKey)}>
                                                    <span className="section-toggle-arrow">
                                                        {isExpanded ? '▼' : '▶'}
                                                    </span>
                                                    {category}
                                                    <span className="section-count">({responsesByCategory[category].length})</span>
                                                </h3>
                                                {isExpanded && <div className="responses-list responses-list--compact">
                                                        {responsesByCategory[category].map(({
                        response,
                        question,
                        shortLabel
                      }, index) => <div key={response.question_id || index} className="response-item response-item--compact">
                                                                <div className="response-item__question">
                                                                    <h4>{shortLabel}</h4>
                                                                </div>
                                                                <div className="response-item__answer">
                                                                    {response.response_value ? <p>{formatResponseValue(response.response_value, question?.response_type)}</p> : <p className="no-response">No response provided</p>}
                                                                </div>
                                                            </div>)}
                                                    </div>}
                                            </div>);
                }) : (stryCov_9fa48("9242"), categoryOrder.filter(stryMutAct_9fa48("9243") ? () => undefined : (stryCov_9fa48("9243"), category => stryMutAct_9fa48("9247") ? responsesByCategory[category]?.length <= 0 : stryMutAct_9fa48("9246") ? responsesByCategory[category]?.length >= 0 : stryMutAct_9fa48("9245") ? false : stryMutAct_9fa48("9244") ? true : (stryCov_9fa48("9244", "9245", "9246", "9247"), (stryMutAct_9fa48("9248") ? responsesByCategory[category].length : (stryCov_9fa48("9248"), responsesByCategory[category]?.length)) > 0))).forEach(category => {
                  if (stryMutAct_9fa48("9249")) {
                    {}
                  } else {
                    stryCov_9fa48("9249");
                    const sectionKey = stryMutAct_9fa48("9250") ? category.toUpperCase().replace(/\s+/g, '-') : (stryCov_9fa48("9250"), category.toLowerCase().replace(stryMutAct_9fa48("9252") ? /\S+/g : stryMutAct_9fa48("9251") ? /\s/g : (stryCov_9fa48("9251", "9252"), /\s+/g), stryMutAct_9fa48("9253") ? "" : (stryCov_9fa48("9253"), '-')));
                    const isExpanded = expandedSections[sectionKey];
                    sections.push(<div key={category} className="response-section">
                                                <h3 className="response-section__title response-section__title--collapsible" onClick={stryMutAct_9fa48("9254") ? () => undefined : (stryCov_9fa48("9254"), () => toggleSection(sectionKey))}>
                                                    <span className="section-toggle-arrow">
                                                        {isExpanded ? stryMutAct_9fa48("9255") ? "" : (stryCov_9fa48("9255"), '▼') : stryMutAct_9fa48("9256") ? "" : (stryCov_9fa48("9256"), '▶')}
                                                    </span>
                                                    {category}
                                                    <span className="section-count">({responsesByCategory[category].length})</span>
                                                </h3>
                                                {stryMutAct_9fa48("9259") ? isExpanded || <div className="responses-list responses-list--compact">
                                                        {responsesByCategory[category].map(({
                          response,
                          question,
                          shortLabel
                        }, index) => <div key={response.question_id || index} className="response-item response-item--compact">
                                                                <div className="response-item__question">
                                                                    <h4>{shortLabel}</h4>
                                                                </div>
                                                                <div className="response-item__answer">
                                                                    {response.response_value ? <p>{formatResponseValue(response.response_value, question?.response_type)}</p> : <p className="no-response">No response provided</p>}
                                                                </div>
                                                            </div>)}
                                                    </div> : stryMutAct_9fa48("9258") ? false : stryMutAct_9fa48("9257") ? true : (stryCov_9fa48("9257", "9258", "9259"), isExpanded && <div className="responses-list responses-list--compact">
                                                        {responsesByCategory[category].map(stryMutAct_9fa48("9260") ? () => undefined : (stryCov_9fa48("9260"), ({
                          response,
                          question,
                          shortLabel
                        }, index) => <div key={stryMutAct_9fa48("9263") ? response.question_id && index : stryMutAct_9fa48("9262") ? false : stryMutAct_9fa48("9261") ? true : (stryCov_9fa48("9261", "9262", "9263"), response.question_id || index)} className="response-item response-item--compact">
                                                                <div className="response-item__question">
                                                                    <h4>{shortLabel}</h4>
                                                                </div>
                                                                <div className="response-item__answer">
                                                                    {response.response_value ? <p>{formatResponseValue(response.response_value, stryMutAct_9fa48("9264") ? question.response_type : (stryCov_9fa48("9264"), question?.response_type))}</p> : <p className="no-response">No response provided</p>}
                                                                </div>
                                                            </div>))}
                                                    </div>)}
                                            </div>);
                  }
                }));
                return sections;
              }
            })()}
                        </div> : <div className="no-responses">
                            <p>No responses found for this application.</p>
                        </div>}
                </div>

                {/* Email Tracking Section */}
                <div className="application-detail__section">
                    <h2>Email Tracking</h2>
                    {emailTrackingLoading ? <div className="application-detail__loading">
                            <div className="application-detail__loading-spinner"></div>
                            <p>Loading email tracking data...</p>
                        </div> : emailTrackingData ? <div className="application-detail__email-tracking">
                            <div className="application-detail__email-tracking-stats">
                                <div className="application-detail__email-stat">
                                    <div className="application-detail__email-stat-value">
                                        {Math.floor(emailTrackingData.days_since_account_created)} days
                                    </div>
                                    <div className="application-detail__email-stat-label">Days Since Account</div>
                                </div>
                                
                                <div className="application-detail__email-stat">
                                    <div className="application-detail__email-stat-value">
                                        {(stryMutAct_9fa48("9267") ? emailTrackingData.email_logs || emailTrackingData.email_logs.length > 0 : stryMutAct_9fa48("9266") ? false : stryMutAct_9fa48("9265") ? true : (stryCov_9fa48("9265", "9266", "9267"), emailTrackingData.email_logs && (stryMutAct_9fa48("9270") ? emailTrackingData.email_logs.length <= 0 : stryMutAct_9fa48("9269") ? emailTrackingData.email_logs.length >= 0 : stryMutAct_9fa48("9268") ? true : (stryCov_9fa48("9268", "9269", "9270"), emailTrackingData.email_logs.length > 0)))) ? emailTrackingData.email_logs.reduce(stryMutAct_9fa48("9271") ? () => undefined : (stryCov_9fa48("9271"), (total, log) => stryMutAct_9fa48("9272") ? total - (log.send_count || 0) : (stryCov_9fa48("9272"), total + (stryMutAct_9fa48("9275") ? log.send_count && 0 : stryMutAct_9fa48("9274") ? false : stryMutAct_9fa48("9273") ? true : (stryCov_9fa48("9273", "9274", "9275"), log.send_count || 0)))), 0) : 0}
                                    </div>
                                    <div className="application-detail__email-stat-label">Total Emails Sent</div>
                                </div>
                                
                                <div className="application-detail__email-stat">
                                    <div className="application-detail__email-stat-value">
                                        {(() => {
                    if (stryMutAct_9fa48("9276")) {
                      {}
                    } else {
                      stryCov_9fa48("9276");
                      if (stryMutAct_9fa48("9279") ? !emailTrackingData.email_logs && emailTrackingData.email_logs.length === 0 : stryMutAct_9fa48("9278") ? false : stryMutAct_9fa48("9277") ? true : (stryCov_9fa48("9277", "9278", "9279"), (stryMutAct_9fa48("9280") ? emailTrackingData.email_logs : (stryCov_9fa48("9280"), !emailTrackingData.email_logs)) || (stryMutAct_9fa48("9282") ? emailTrackingData.email_logs.length !== 0 : stryMutAct_9fa48("9281") ? false : (stryCov_9fa48("9281", "9282"), emailTrackingData.email_logs.length === 0)))) {
                        if (stryMutAct_9fa48("9283")) {
                          {}
                        } else {
                          stryCov_9fa48("9283");
                          return stryMutAct_9fa48("9284") ? "" : (stryCov_9fa48("9284"), 'None');
                        }
                      }
                      const nextEmails = stryMutAct_9fa48("9288") ? emailTrackingData.email_logs.filter(log => log.next_send_at && !log.is_queued)?.sort((a, b) => new Date(a.next_send_at) - new Date(b.next_send_at)) : stryMutAct_9fa48("9287") ? emailTrackingData.email_logs?.sort((a, b) => new Date(a.next_send_at) - new Date(b.next_send_at)) : stryMutAct_9fa48("9286") ? emailTrackingData.email_logs?.filter(log => log.next_send_at && !log.is_queued).sort((a, b) => new Date(a.next_send_at) - new Date(b.next_send_at)) : stryMutAct_9fa48("9285") ? emailTrackingData.email_logs?.filter(log => log.next_send_at && !log.is_queued) : (stryCov_9fa48("9285", "9286", "9287", "9288"), emailTrackingData.email_logs?.filter(stryMutAct_9fa48("9289") ? () => undefined : (stryCov_9fa48("9289"), log => stryMutAct_9fa48("9292") ? log.next_send_at || !log.is_queued : stryMutAct_9fa48("9291") ? false : stryMutAct_9fa48("9290") ? true : (stryCov_9fa48("9290", "9291", "9292"), log.next_send_at && (stryMutAct_9fa48("9293") ? log.is_queued : (stryCov_9fa48("9293"), !log.is_queued)))))?.sort(stryMutAct_9fa48("9294") ? () => undefined : (stryCov_9fa48("9294"), (a, b) => stryMutAct_9fa48("9295") ? new Date(a.next_send_at) + new Date(b.next_send_at) : (stryCov_9fa48("9295"), new Date(a.next_send_at) - new Date(b.next_send_at)))));
                      if (stryMutAct_9fa48("9298") ? nextEmails || nextEmails.length > 0 : stryMutAct_9fa48("9297") ? false : stryMutAct_9fa48("9296") ? true : (stryCov_9fa48("9296", "9297", "9298"), nextEmails && (stryMutAct_9fa48("9301") ? nextEmails.length <= 0 : stryMutAct_9fa48("9300") ? nextEmails.length >= 0 : stryMutAct_9fa48("9299") ? true : (stryCov_9fa48("9299", "9300", "9301"), nextEmails.length > 0)))) {
                        if (stryMutAct_9fa48("9302")) {
                          {}
                        } else {
                          stryCov_9fa48("9302");
                          const nextEmail = nextEmails[0];
                          const nextDate = new Date(nextEmail.next_send_at);
                          return nextDate.toLocaleDateString();
                        }
                      } else {
                        if (stryMutAct_9fa48("9303")) {
                          {}
                        } else {
                          stryCov_9fa48("9303");
                          return stryMutAct_9fa48("9304") ? "" : (stryCov_9fa48("9304"), 'None');
                        }
                      }
                    }
                  })()}
                                    </div>
                                    <div className="application-detail__email-stat-label">Next Email</div>
                                </div>
                            </div>

                            {stryMutAct_9fa48("9307") ? emailTrackingData.email_logs && emailTrackingData.email_logs.length > 0 || <div className="application-detail__email-logs">
                                    <h3>Email History</h3>
                                    <div className="application-detail__email-logs-list">
                                        {emailTrackingData.email_logs.map((log, index) => <div key={index} className="application-detail__email-log-item">
                                                <div className="application-detail__email-log-type">
                                                    {log.email_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </div>
                                                <div className="application-detail__email-log-count">
                                                    Sent {log.send_count} time{log.send_count !== 1 ? 's' : ''}
                                                </div>
                                                {log.email_sent_at && <div className="application-detail__email-log-date">
                                                        Last sent: {new Date(log.email_sent_at).toLocaleDateString()}
                                                    </div>}
                                                {log.is_queued && <div className="application-detail__email-log-queued">
                                                        📋 Queued for next send
                                                    </div>}
                                            </div>)}
                                    </div>
                                </div> : stryMutAct_9fa48("9306") ? false : stryMutAct_9fa48("9305") ? true : (stryCov_9fa48("9305", "9306", "9307"), (stryMutAct_9fa48("9309") ? emailTrackingData.email_logs || emailTrackingData.email_logs.length > 0 : stryMutAct_9fa48("9308") ? true : (stryCov_9fa48("9308", "9309"), emailTrackingData.email_logs && (stryMutAct_9fa48("9312") ? emailTrackingData.email_logs.length <= 0 : stryMutAct_9fa48("9311") ? emailTrackingData.email_logs.length >= 0 : stryMutAct_9fa48("9310") ? true : (stryCov_9fa48("9310", "9311", "9312"), emailTrackingData.email_logs.length > 0)))) && <div className="application-detail__email-logs">
                                    <h3>Email History</h3>
                                    <div className="application-detail__email-logs-list">
                                        {emailTrackingData.email_logs.map(stryMutAct_9fa48("9313") ? () => undefined : (stryCov_9fa48("9313"), (log, index) => <div key={index} className="application-detail__email-log-item">
                                                <div className="application-detail__email-log-type">
                                                    {log.email_type.replace(/_/g, stryMutAct_9fa48("9314") ? "" : (stryCov_9fa48("9314"), ' ')).replace(stryMutAct_9fa48("9315") ? /\b\W/g : (stryCov_9fa48("9315"), /\b\w/g), stryMutAct_9fa48("9316") ? () => undefined : (stryCov_9fa48("9316"), l => stryMutAct_9fa48("9317") ? l.toLowerCase() : (stryCov_9fa48("9317"), l.toUpperCase())))}
                                                </div>
                                                <div className="application-detail__email-log-count">
                                                    Sent {log.send_count} time{(stryMutAct_9fa48("9320") ? log.send_count === 1 : stryMutAct_9fa48("9319") ? false : stryMutAct_9fa48("9318") ? true : (stryCov_9fa48("9318", "9319", "9320"), log.send_count !== 1)) ? stryMutAct_9fa48("9321") ? "" : (stryCov_9fa48("9321"), 's') : stryMutAct_9fa48("9322") ? "Stryker was here!" : (stryCov_9fa48("9322"), '')}
                                                </div>
                                                {stryMutAct_9fa48("9325") ? log.email_sent_at || <div className="application-detail__email-log-date">
                                                        Last sent: {new Date(log.email_sent_at).toLocaleDateString()}
                                                    </div> : stryMutAct_9fa48("9324") ? false : stryMutAct_9fa48("9323") ? true : (stryCov_9fa48("9323", "9324", "9325"), log.email_sent_at && <div className="application-detail__email-log-date">
                                                        Last sent: {new Date(log.email_sent_at).toLocaleDateString()}
                                                    </div>)}
                                                {stryMutAct_9fa48("9328") ? log.is_queued || <div className="application-detail__email-log-queued">
                                                        📋 Queued for next send
                                                    </div> : stryMutAct_9fa48("9327") ? false : stryMutAct_9fa48("9326") ? true : (stryCov_9fa48("9326", "9327", "9328"), log.is_queued && <div className="application-detail__email-log-queued">
                                                        📋 Queued for next send
                                                    </div>)}
                                            </div>))}
                                    </div>
                                </div>)}

                            {stryMutAct_9fa48("9331") ? emailTrackingData.email_opt_out || <div className="application-detail__opt-out-info">
                                    <h3>Opt-out Information</h3>
                                    <div className="application-detail__opt-out-details">
                                        <p><strong>Status:</strong> Opted out of automated emails</p>
                                        <p><strong>Date:</strong> {new Date(emailTrackingData.email_opt_out_date_est).toLocaleDateString()}</p>
                                        <p><strong>Reason:</strong> {emailTrackingData.email_opt_out_reason}</p>
                                    </div>
                                </div> : stryMutAct_9fa48("9330") ? false : stryMutAct_9fa48("9329") ? true : (stryCov_9fa48("9329", "9330", "9331"), emailTrackingData.email_opt_out && <div className="application-detail__opt-out-info">
                                    <h3>Opt-out Information</h3>
                                    <div className="application-detail__opt-out-details">
                                        <p><strong>Status:</strong> Opted out of automated emails</p>
                                        <p><strong>Date:</strong> {new Date(emailTrackingData.email_opt_out_date_est).toLocaleDateString()}</p>
                                        <p><strong>Reason:</strong> {emailTrackingData.email_opt_out_reason}</p>
                                    </div>
                                </div>)}
                        </div> : <div className="application-detail__no-email-data">
                            <p>No email tracking data available for this applicant.</p>
                        </div>}
                </div>

            </div>

            {/* Actions Modal */}
            {stryMutAct_9fa48("9334") ? actionsModalOpen || <BulkActionsModal selectedCount={1} onClose={closeActionsModal} onAction={handleApplicantAction} isLoading={actionInProgress} /> : stryMutAct_9fa48("9333") ? false : stryMutAct_9fa48("9332") ? true : (stryCov_9fa48("9332", "9333", "9334"), actionsModalOpen && <BulkActionsModal selectedCount={1} onClose={closeActionsModal} onAction={handleApplicantAction} isLoading={actionInProgress} />)}

            {/* Notes Modal */}
            <NotesModal isOpen={notesModalOpen} onClose={closeNotesModal} applicantId={stryMutAct_9fa48("9335") ? applicant.applicant_id : (stryCov_9fa48("9335"), applicant?.applicant_id)} applicantName={stryMutAct_9fa48("9336") ? `` : (stryCov_9fa48("9336"), `${stryMutAct_9fa48("9337") ? applicant.first_name : (stryCov_9fa48("9337"), applicant?.first_name)} ${stryMutAct_9fa48("9338") ? applicant.last_name : (stryCov_9fa48("9338"), applicant?.last_name)}`)} />
        </div>;
  }
};
export default ApplicationDetail;