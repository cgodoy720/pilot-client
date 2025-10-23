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
import { Box, Typography, CircularProgress, Divider, Grid, Button, Modal, Card, CardContent, CardActions, Chip, Link, IconButton } from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import { fetchExternalComprehension } from '../../../utils/statsApi';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import MonthFilter from '../../../components/MonthFilter';
import AITrendAnalysis from '../../../components/AITrendAnalysis';
const ComprehensionSection = ({
  cohortMonth
}) => {
  if (stryMutAct_9fa48("25902")) {
    {}
  } else {
    stryCov_9fa48("25902");
    const {
      user,
      token
    } = useAuth();
    const [comprehensionData, setComprehensionData] = useState(stryMutAct_9fa48("25903") ? ["Stryker was here"] : (stryCov_9fa48("25903"), []));
    const [loading, setLoading] = useState(stryMutAct_9fa48("25904") ? false : (stryCov_9fa48("25904"), true));
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalOpen, setModalOpen] = useState(stryMutAct_9fa48("25905") ? true : (stryCov_9fa48("25905"), false));
    const [selectedMonth, setSelectedMonth] = useState(stryMutAct_9fa48("25906") ? "" : (stryCov_9fa48("25906"), 'all'));

    // Filter out entries with technical errors
    const filterOutErrors = data => {
      if (stryMutAct_9fa48("25907")) {
        {}
      } else {
        stryCov_9fa48("25907");
        if (stryMutAct_9fa48("25910") ? false : stryMutAct_9fa48("25909") ? true : stryMutAct_9fa48("25908") ? Array.isArray(data) : (stryCov_9fa48("25908", "25909", "25910"), !Array.isArray(data))) return data;
        return stryMutAct_9fa48("25911") ? data : (stryCov_9fa48("25911"), data.filter(item => {
          if (stryMutAct_9fa48("25912")) {
            {}
          } else {
            stryCov_9fa48("25912");
            try {
              if (stryMutAct_9fa48("25913")) {
                {}
              } else {
                stryCov_9fa48("25913");
                const analysis = parseAnalysis(item);
                if (stryMutAct_9fa48("25916") ? false : stryMutAct_9fa48("25915") ? true : stryMutAct_9fa48("25914") ? analysis : (stryCov_9fa48("25914", "25915", "25916"), !analysis)) return stryMutAct_9fa48("25917") ? false : (stryCov_9fa48("25917"), true); // Keep items without analysis

                // Check areas_for_improvement for technical error messages
                if (stryMutAct_9fa48("25920") ? analysis.areas_for_improvement || Array.isArray(analysis.areas_for_improvement) : stryMutAct_9fa48("25919") ? false : stryMutAct_9fa48("25918") ? true : (stryCov_9fa48("25918", "25919", "25920"), analysis.areas_for_improvement && Array.isArray(analysis.areas_for_improvement))) {
                  if (stryMutAct_9fa48("25921")) {
                    {}
                  } else {
                    stryCov_9fa48("25921");
                    const hasError = stryMutAct_9fa48("25922") ? analysis.areas_for_improvement.every(area => typeof area === 'string' && area.toLowerCase().includes('technical issue') && area.toLowerCase().includes('try again')) : (stryCov_9fa48("25922"), analysis.areas_for_improvement.some(stryMutAct_9fa48("25923") ? () => undefined : (stryCov_9fa48("25923"), area => stryMutAct_9fa48("25926") ? typeof area === 'string' && area.toLowerCase().includes('technical issue') || area.toLowerCase().includes('try again') : stryMutAct_9fa48("25925") ? false : stryMutAct_9fa48("25924") ? true : (stryCov_9fa48("25924", "25925", "25926"), (stryMutAct_9fa48("25928") ? typeof area === 'string' || area.toLowerCase().includes('technical issue') : stryMutAct_9fa48("25927") ? true : (stryCov_9fa48("25927", "25928"), (stryMutAct_9fa48("25930") ? typeof area !== 'string' : stryMutAct_9fa48("25929") ? true : (stryCov_9fa48("25929", "25930"), typeof area === (stryMutAct_9fa48("25931") ? "" : (stryCov_9fa48("25931"), 'string')))) && (stryMutAct_9fa48("25932") ? area.toUpperCase().includes('technical issue') : (stryCov_9fa48("25932"), area.toLowerCase().includes(stryMutAct_9fa48("25933") ? "" : (stryCov_9fa48("25933"), 'technical issue')))))) && (stryMutAct_9fa48("25934") ? area.toUpperCase().includes('try again') : (stryCov_9fa48("25934"), area.toLowerCase().includes(stryMutAct_9fa48("25935") ? "" : (stryCov_9fa48("25935"), 'try again'))))))));
                    if (stryMutAct_9fa48("25937") ? false : stryMutAct_9fa48("25936") ? true : (stryCov_9fa48("25936", "25937"), hasError)) return stryMutAct_9fa48("25938") ? true : (stryCov_9fa48("25938"), false); // Filter out this item
                  }
                }

                // Check feedback for technical error messages
                if (stryMutAct_9fa48("25941") ? analysis.feedback || typeof analysis.feedback === 'string' : stryMutAct_9fa48("25940") ? false : stryMutAct_9fa48("25939") ? true : (stryCov_9fa48("25939", "25940", "25941"), analysis.feedback && (stryMutAct_9fa48("25943") ? typeof analysis.feedback !== 'string' : stryMutAct_9fa48("25942") ? true : (stryCov_9fa48("25942", "25943"), typeof analysis.feedback === (stryMutAct_9fa48("25944") ? "" : (stryCov_9fa48("25944"), 'string')))))) {
                  if (stryMutAct_9fa48("25945")) {
                    {}
                  } else {
                    stryCov_9fa48("25945");
                    const hasError = stryMutAct_9fa48("25948") ? analysis.feedback.toLowerCase().includes('technical issue') || analysis.feedback.toLowerCase().includes('try again') : stryMutAct_9fa48("25947") ? false : stryMutAct_9fa48("25946") ? true : (stryCov_9fa48("25946", "25947", "25948"), (stryMutAct_9fa48("25949") ? analysis.feedback.toUpperCase().includes('technical issue') : (stryCov_9fa48("25949"), analysis.feedback.toLowerCase().includes(stryMutAct_9fa48("25950") ? "" : (stryCov_9fa48("25950"), 'technical issue')))) && (stryMutAct_9fa48("25951") ? analysis.feedback.toUpperCase().includes('try again') : (stryCov_9fa48("25951"), analysis.feedback.toLowerCase().includes(stryMutAct_9fa48("25952") ? "" : (stryCov_9fa48("25952"), 'try again')))));
                    if (stryMutAct_9fa48("25954") ? false : stryMutAct_9fa48("25953") ? true : (stryCov_9fa48("25953", "25954"), hasError)) return stryMutAct_9fa48("25955") ? true : (stryCov_9fa48("25955"), false); // Filter out this item
                  }
                }
                return stryMutAct_9fa48("25956") ? false : (stryCov_9fa48("25956"), true); // Keep this item
              }
            } catch (err) {
              if (stryMutAct_9fa48("25957")) {
                {}
              } else {
                stryCov_9fa48("25957");
                console.error(stryMutAct_9fa48("25958") ? "" : (stryCov_9fa48("25958"), 'Error checking for technical errors:'), err);
                return stryMutAct_9fa48("25959") ? false : (stryCov_9fa48("25959"), true); // Keep item if we can't parse it
              }
            }
          }
        }));
      }
    };
    useEffect(() => {
      if (stryMutAct_9fa48("25960")) {
        {}
      } else {
        stryCov_9fa48("25960");
        const loadComprehensionData = async () => {
          if (stryMutAct_9fa48("25961")) {
            {}
          } else {
            stryCov_9fa48("25961");
            try {
              if (stryMutAct_9fa48("25962")) {
                {}
              } else {
                stryCov_9fa48("25962");
                console.log(stryMutAct_9fa48("25963") ? "" : (stryCov_9fa48("25963"), 'Starting to fetch comprehension data...'));
                setLoading(stryMutAct_9fa48("25964") ? false : (stryCov_9fa48("25964"), true));

                // Debug what's in the auth context
                console.log(stryMutAct_9fa48("25965") ? "" : (stryCov_9fa48("25965"), 'Auth context user:'), user);
                console.log(stryMutAct_9fa48("25966") ? "" : (stryCov_9fa48("25966"), 'Cohort month:'), cohortMonth);

                // Extract user ID from auth context
                const userId = stryMutAct_9fa48("25969") ? user?.user_id && 17 : stryMutAct_9fa48("25968") ? false : stryMutAct_9fa48("25967") ? true : (stryCov_9fa48("25967", "25968", "25969"), (stryMutAct_9fa48("25970") ? user.user_id : (stryCov_9fa48("25970"), user?.user_id)) || 17); // Use user_id from context or fallback to 17
                console.log(stryMutAct_9fa48("25971") ? "" : (stryCov_9fa48("25971"), 'Using user ID:'), userId);
                const data = await fetchExternalComprehension(userId, selectedMonth);
                console.log(stryMutAct_9fa48("25972") ? "" : (stryCov_9fa48("25972"), 'Received external comprehension data:'), data);

                // Filter out entries with technical errors
                const filteredData = filterOutErrors(data);
                console.log(stryMutAct_9fa48("25973") ? "" : (stryCov_9fa48("25973"), 'Filtered comprehension data (removed errors):'), filteredData);
                setComprehensionData(filteredData);
                setError(null);
              }
            } catch (err) {
              if (stryMutAct_9fa48("25974")) {
                {}
              } else {
                stryCov_9fa48("25974");
                console.error(stryMutAct_9fa48("25975") ? "" : (stryCov_9fa48("25975"), 'Failed to fetch comprehension data:'), err);
                setError(stryMutAct_9fa48("25978") ? err.message && 'Failed to load comprehension data' : stryMutAct_9fa48("25977") ? false : stryMutAct_9fa48("25976") ? true : (stryCov_9fa48("25976", "25977", "25978"), err.message || (stryMutAct_9fa48("25979") ? "" : (stryCov_9fa48("25979"), 'Failed to load comprehension data'))));
              }
            } finally {
              if (stryMutAct_9fa48("25980")) {
                {}
              } else {
                stryCov_9fa48("25980");
                setLoading(stryMutAct_9fa48("25981") ? true : (stryCov_9fa48("25981"), false));
              }
            }
          }
        };
        loadComprehensionData();
      }
    }, stryMutAct_9fa48("25982") ? [] : (stryCov_9fa48("25982"), [user, token, selectedMonth, cohortMonth]));
    const handleMonthChange = month => {
      if (stryMutAct_9fa48("25983")) {
        {}
      } else {
        stryCov_9fa48("25983");
        setSelectedMonth(month);
      }
    };
    const handleOpenModal = item => {
      if (stryMutAct_9fa48("25984")) {
        {}
      } else {
        stryCov_9fa48("25984");
        setSelectedItem(item);
        setModalOpen(stryMutAct_9fa48("25985") ? false : (stryCov_9fa48("25985"), true));
      }
    };
    const handleCloseModal = () => {
      if (stryMutAct_9fa48("25986")) {
        {}
      } else {
        stryCov_9fa48("25986");
        setModalOpen(stryMutAct_9fa48("25987") ? true : (stryCov_9fa48("25987"), false));
      }
    };
    const formatDate = dateString => {
      if (stryMutAct_9fa48("25988")) {
        {}
      } else {
        stryCov_9fa48("25988");
        if (stryMutAct_9fa48("25991") ? false : stryMutAct_9fa48("25990") ? true : stryMutAct_9fa48("25989") ? dateString : (stryCov_9fa48("25989", "25990", "25991"), !dateString)) return stryMutAct_9fa48("25992") ? "" : (stryCov_9fa48("25992"), 'Unknown date');

        // Check if dateString is already in a Date format
        const date = new Date(dateString);
        if (stryMutAct_9fa48("25994") ? false : stryMutAct_9fa48("25993") ? true : (stryCov_9fa48("25993", "25994"), isNaN(date.getTime()))) {
          if (stryMutAct_9fa48("25995")) {
            {}
          } else {
            stryCov_9fa48("25995");
            return dateString; // Return as is if it's not a valid date
          }
        }
        return date.toLocaleDateString(undefined, stryMutAct_9fa48("25996") ? {} : (stryCov_9fa48("25996"), {
          year: stryMutAct_9fa48("25997") ? "" : (stryCov_9fa48("25997"), 'numeric'),
          month: stryMutAct_9fa48("25998") ? "" : (stryCov_9fa48("25998"), 'long'),
          day: stryMutAct_9fa48("25999") ? "" : (stryCov_9fa48("25999"), 'numeric')
        }));
      }
    };
    const getGradeColor = score => {
      if (stryMutAct_9fa48("26000")) {
        {}
      } else {
        stryCov_9fa48("26000");
        if (stryMutAct_9fa48("26003") ? score !== 0 : stryMutAct_9fa48("26002") ? false : stryMutAct_9fa48("26001") ? true : (stryCov_9fa48("26001", "26002", "26003"), score === 0)) return stryMutAct_9fa48("26004") ? "" : (stryCov_9fa48("26004"), 'error');
        if (stryMutAct_9fa48("26007") ? (score === null || score === undefined) && isNaN(score) : stryMutAct_9fa48("26006") ? false : stryMutAct_9fa48("26005") ? true : (stryCov_9fa48("26005", "26006", "26007"), (stryMutAct_9fa48("26009") ? score === null && score === undefined : stryMutAct_9fa48("26008") ? false : (stryCov_9fa48("26008", "26009"), (stryMutAct_9fa48("26011") ? score !== null : stryMutAct_9fa48("26010") ? false : (stryCov_9fa48("26010", "26011"), score === null)) || (stryMutAct_9fa48("26013") ? score !== undefined : stryMutAct_9fa48("26012") ? false : (stryCov_9fa48("26012", "26013"), score === undefined)))) || isNaN(score))) return stryMutAct_9fa48("26014") ? "" : (stryCov_9fa48("26014"), 'error');
        if (stryMutAct_9fa48("26018") ? score < 80 : stryMutAct_9fa48("26017") ? score > 80 : stryMutAct_9fa48("26016") ? false : stryMutAct_9fa48("26015") ? true : (stryCov_9fa48("26015", "26016", "26017", "26018"), score >= 80)) return stryMutAct_9fa48("26019") ? "" : (stryCov_9fa48("26019"), 'success');
        if (stryMutAct_9fa48("26023") ? score < 50 : stryMutAct_9fa48("26022") ? score > 50 : stryMutAct_9fa48("26021") ? false : stryMutAct_9fa48("26020") ? true : (stryCov_9fa48("26020", "26021", "26022", "26023"), score >= 50)) return stryMutAct_9fa48("26024") ? "" : (stryCov_9fa48("26024"), 'warning');
        return stryMutAct_9fa48("26025") ? "" : (stryCov_9fa48("26025"), 'error');
      }
    };
    const getGradeLabel = score => {
      if (stryMutAct_9fa48("26026")) {
        {}
      } else {
        stryCov_9fa48("26026");
        if (stryMutAct_9fa48("26029") ? score !== 0 : stryMutAct_9fa48("26028") ? false : stryMutAct_9fa48("26027") ? true : (stryCov_9fa48("26027", "26028", "26029"), score === 0)) return stryMutAct_9fa48("26030") ? "" : (stryCov_9fa48("26030"), "Document Access Error");
        if (stryMutAct_9fa48("26033") ? (score === null || score === undefined) && isNaN(score) : stryMutAct_9fa48("26032") ? false : stryMutAct_9fa48("26031") ? true : (stryCov_9fa48("26031", "26032", "26033"), (stryMutAct_9fa48("26035") ? score === null && score === undefined : stryMutAct_9fa48("26034") ? false : (stryCov_9fa48("26034", "26035"), (stryMutAct_9fa48("26037") ? score !== null : stryMutAct_9fa48("26036") ? false : (stryCov_9fa48("26036", "26037"), score === null)) || (stryMutAct_9fa48("26039") ? score !== undefined : stryMutAct_9fa48("26038") ? false : (stryCov_9fa48("26038", "26039"), score === undefined)))) || isNaN(score))) return stryMutAct_9fa48("26040") ? "" : (stryCov_9fa48("26040"), "F");
        if (stryMutAct_9fa48("26044") ? score < 93 : stryMutAct_9fa48("26043") ? score > 93 : stryMutAct_9fa48("26042") ? false : stryMutAct_9fa48("26041") ? true : (stryCov_9fa48("26041", "26042", "26043", "26044"), score >= 93)) return stryMutAct_9fa48("26045") ? "" : (stryCov_9fa48("26045"), 'A+');
        if (stryMutAct_9fa48("26049") ? score < 85 : stryMutAct_9fa48("26048") ? score > 85 : stryMutAct_9fa48("26047") ? false : stryMutAct_9fa48("26046") ? true : (stryCov_9fa48("26046", "26047", "26048", "26049"), score >= 85)) return stryMutAct_9fa48("26050") ? "" : (stryCov_9fa48("26050"), 'A');
        if (stryMutAct_9fa48("26054") ? score < 80 : stryMutAct_9fa48("26053") ? score > 80 : stryMutAct_9fa48("26052") ? false : stryMutAct_9fa48("26051") ? true : (stryCov_9fa48("26051", "26052", "26053", "26054"), score >= 80)) return stryMutAct_9fa48("26055") ? "" : (stryCov_9fa48("26055"), 'A-');
        if (stryMutAct_9fa48("26059") ? score < 70 : stryMutAct_9fa48("26058") ? score > 70 : stryMutAct_9fa48("26057") ? false : stryMutAct_9fa48("26056") ? true : (stryCov_9fa48("26056", "26057", "26058", "26059"), score >= 70)) return stryMutAct_9fa48("26060") ? "" : (stryCov_9fa48("26060"), 'B+');
        if (stryMutAct_9fa48("26064") ? score < 60 : stryMutAct_9fa48("26063") ? score > 60 : stryMutAct_9fa48("26062") ? false : stryMutAct_9fa48("26061") ? true : (stryCov_9fa48("26061", "26062", "26063", "26064"), score >= 60)) return stryMutAct_9fa48("26065") ? "" : (stryCov_9fa48("26065"), 'B');
        if (stryMutAct_9fa48("26069") ? score < 50 : stryMutAct_9fa48("26068") ? score > 50 : stryMutAct_9fa48("26067") ? false : stryMutAct_9fa48("26066") ? true : (stryCov_9fa48("26066", "26067", "26068", "26069"), score >= 50)) return stryMutAct_9fa48("26070") ? "" : (stryCov_9fa48("26070"), 'B-');
        if (stryMutAct_9fa48("26074") ? score < 40 : stryMutAct_9fa48("26073") ? score > 40 : stryMutAct_9fa48("26072") ? false : stryMutAct_9fa48("26071") ? true : (stryCov_9fa48("26071", "26072", "26073", "26074"), score >= 40)) return stryMutAct_9fa48("26075") ? "" : (stryCov_9fa48("26075"), 'C+');
        return stryMutAct_9fa48("26076") ? "" : (stryCov_9fa48("26076"), 'C');
      }
    };
    const getCompletionScore = item => {
      if (stryMutAct_9fa48("26077")) {
        {}
      } else {
        stryCov_9fa48("26077");
        try {
          if (stryMutAct_9fa48("26078")) {
            {}
          } else {
            stryCov_9fa48("26078");
            const analysis = parseAnalysis(item);
            if (stryMutAct_9fa48("26081") ? analysis || !isNaN(analysis.completion_score) : stryMutAct_9fa48("26080") ? false : stryMutAct_9fa48("26079") ? true : (stryCov_9fa48("26079", "26080", "26081"), analysis && (stryMutAct_9fa48("26082") ? isNaN(analysis.completion_score) : (stryCov_9fa48("26082"), !isNaN(analysis.completion_score))))) {
              if (stryMutAct_9fa48("26083")) {
                {}
              } else {
                stryCov_9fa48("26083");
                return stryMutAct_9fa48("26086") ? analysis.completion_score && 0 : stryMutAct_9fa48("26085") ? false : stryMutAct_9fa48("26084") ? true : (stryCov_9fa48("26084", "26085", "26086"), analysis.completion_score || 0);
              }
            }
            return 0;
          }
        } catch (err) {
          if (stryMutAct_9fa48("26087")) {
            {}
          } else {
            stryCov_9fa48("26087");
            console.error(stryMutAct_9fa48("26088") ? "" : (stryCov_9fa48("26088"), 'Error getting completion score:'), err);
            return 0;
          }
        }
      }
    };

    // Get all section scores from the analysis
    const getAllSectionScores = item => {
      if (stryMutAct_9fa48("26089")) {
        {}
      } else {
        stryCov_9fa48("26089");
        try {
          if (stryMutAct_9fa48("26090")) {
            {}
          } else {
            stryCov_9fa48("26090");
            const analysis = parseAnalysis(item);
            if (stryMutAct_9fa48("26093") ? !analysis && !analysis.specific_findings : stryMutAct_9fa48("26092") ? false : stryMutAct_9fa48("26091") ? true : (stryCov_9fa48("26091", "26092", "26093"), (stryMutAct_9fa48("26094") ? analysis : (stryCov_9fa48("26094"), !analysis)) || (stryMutAct_9fa48("26095") ? analysis.specific_findings : (stryCov_9fa48("26095"), !analysis.specific_findings)))) return stryMutAct_9fa48("26096") ? ["Stryker was here"] : (stryCov_9fa48("26096"), []);
            const scores = stryMutAct_9fa48("26097") ? ["Stryker was here"] : (stryCov_9fa48("26097"), []);
            const findings = analysis.specific_findings;

            // Check for comprehension score (both cases)
            const comprehensionData = stryMutAct_9fa48("26100") ? findings.comprehension && findings.Comprehension : stryMutAct_9fa48("26099") ? false : stryMutAct_9fa48("26098") ? true : (stryCov_9fa48("26098", "26099", "26100"), findings.comprehension || findings.Comprehension);
            if (stryMutAct_9fa48("26103") ? comprehensionData || comprehensionData.score !== undefined : stryMutAct_9fa48("26102") ? false : stryMutAct_9fa48("26101") ? true : (stryCov_9fa48("26101", "26102", "26103"), comprehensionData && (stryMutAct_9fa48("26105") ? comprehensionData.score === undefined : stryMutAct_9fa48("26104") ? true : (stryCov_9fa48("26104", "26105"), comprehensionData.score !== undefined)))) {
              if (stryMutAct_9fa48("26106")) {
                {}
              } else {
                stryCov_9fa48("26106");
                scores.push(stryMutAct_9fa48("26107") ? {} : (stryCov_9fa48("26107"), {
                  section: stryMutAct_9fa48("26108") ? "" : (stryCov_9fa48("26108"), 'Comprehension'),
                  score: comprehensionData.score
                }));
              }
            }

            // Check for business value score (multiple possible keys)
            const businessValueData = stryMutAct_9fa48("26111") ? (findings.business_value || findings.Business_value) && findings['Business Value'] : stryMutAct_9fa48("26110") ? false : stryMutAct_9fa48("26109") ? true : (stryCov_9fa48("26109", "26110", "26111"), (stryMutAct_9fa48("26113") ? findings.business_value && findings.Business_value : stryMutAct_9fa48("26112") ? false : (stryCov_9fa48("26112", "26113"), findings.business_value || findings.Business_value)) || findings[stryMutAct_9fa48("26114") ? "" : (stryCov_9fa48("26114"), 'Business Value')]);
            if (stryMutAct_9fa48("26117") ? businessValueData || businessValueData.score !== undefined : stryMutAct_9fa48("26116") ? false : stryMutAct_9fa48("26115") ? true : (stryCov_9fa48("26115", "26116", "26117"), businessValueData && (stryMutAct_9fa48("26119") ? businessValueData.score === undefined : stryMutAct_9fa48("26118") ? true : (stryCov_9fa48("26118", "26119"), businessValueData.score !== undefined)))) {
              if (stryMutAct_9fa48("26120")) {
                {}
              } else {
                stryCov_9fa48("26120");
                scores.push(stryMutAct_9fa48("26121") ? {} : (stryCov_9fa48("26121"), {
                  section: stryMutAct_9fa48("26122") ? "" : (stryCov_9fa48("26122"), 'Business Value'),
                  score: businessValueData.score
                }));
              }
            }

            // Check for professional skills score (multiple possible keys)
            const professionalSkillsData = stryMutAct_9fa48("26125") ? (findings.professional_skills || findings.Professional_skills) && findings['Professional Skills'] : stryMutAct_9fa48("26124") ? false : stryMutAct_9fa48("26123") ? true : (stryCov_9fa48("26123", "26124", "26125"), (stryMutAct_9fa48("26127") ? findings.professional_skills && findings.Professional_skills : stryMutAct_9fa48("26126") ? false : (stryCov_9fa48("26126", "26127"), findings.professional_skills || findings.Professional_skills)) || findings[stryMutAct_9fa48("26128") ? "" : (stryCov_9fa48("26128"), 'Professional Skills')]);
            if (stryMutAct_9fa48("26131") ? professionalSkillsData || professionalSkillsData.score !== undefined : stryMutAct_9fa48("26130") ? false : stryMutAct_9fa48("26129") ? true : (stryCov_9fa48("26129", "26130", "26131"), professionalSkillsData && (stryMutAct_9fa48("26133") ? professionalSkillsData.score === undefined : stryMutAct_9fa48("26132") ? true : (stryCov_9fa48("26132", "26133"), professionalSkillsData.score !== undefined)))) {
              if (stryMutAct_9fa48("26134")) {
                {}
              } else {
                stryCov_9fa48("26134");
                scores.push(stryMutAct_9fa48("26135") ? {} : (stryCov_9fa48("26135"), {
                  section: stryMutAct_9fa48("26136") ? "" : (stryCov_9fa48("26136"), 'Professional Skills'),
                  score: professionalSkillsData.score
                }));
              }
            }

            // If no section scores found, fall back to overall completion score
            if (stryMutAct_9fa48("26139") ? scores.length === 0 || analysis.completion_score !== undefined : stryMutAct_9fa48("26138") ? false : stryMutAct_9fa48("26137") ? true : (stryCov_9fa48("26137", "26138", "26139"), (stryMutAct_9fa48("26141") ? scores.length !== 0 : stryMutAct_9fa48("26140") ? true : (stryCov_9fa48("26140", "26141"), scores.length === 0)) && (stryMutAct_9fa48("26143") ? analysis.completion_score === undefined : stryMutAct_9fa48("26142") ? true : (stryCov_9fa48("26142", "26143"), analysis.completion_score !== undefined)))) {
              if (stryMutAct_9fa48("26144")) {
                {}
              } else {
                stryCov_9fa48("26144");
                scores.push(stryMutAct_9fa48("26145") ? {} : (stryCov_9fa48("26145"), {
                  section: stryMutAct_9fa48("26146") ? "" : (stryCov_9fa48("26146"), 'Overall'),
                  score: analysis.completion_score
                }));
              }
            }
            return scores;
          }
        } catch (err) {
          if (stryMutAct_9fa48("26147")) {
            {}
          } else {
            stryCov_9fa48("26147");
            console.error(stryMutAct_9fa48("26148") ? "" : (stryCov_9fa48("26148"), 'Error getting section scores:'), err);
            return stryMutAct_9fa48("26149") ? ["Stryker was here"] : (stryCov_9fa48("26149"), []);
          }
        }
      }
    };
    const getFeedback = item => {
      if (stryMutAct_9fa48("26150")) {
        {}
      } else {
        stryCov_9fa48("26150");
        try {
          if (stryMutAct_9fa48("26151")) {
            {}
          } else {
            stryCov_9fa48("26151");
            const analysis = parseAnalysis(item);
            if (stryMutAct_9fa48("26153") ? false : stryMutAct_9fa48("26152") ? true : (stryCov_9fa48("26152", "26153"), analysis)) {
              if (stryMutAct_9fa48("26154")) {
                {}
              } else {
                stryCov_9fa48("26154");
                // Handle case where feedback might be NaN or null
                if (stryMutAct_9fa48("26157") ? (analysis.feedback === null || analysis.feedback === undefined) && typeof analysis.feedback === 'number' && isNaN(analysis.feedback) : stryMutAct_9fa48("26156") ? false : stryMutAct_9fa48("26155") ? true : (stryCov_9fa48("26155", "26156", "26157"), (stryMutAct_9fa48("26159") ? analysis.feedback === null && analysis.feedback === undefined : stryMutAct_9fa48("26158") ? false : (stryCov_9fa48("26158", "26159"), (stryMutAct_9fa48("26161") ? analysis.feedback !== null : stryMutAct_9fa48("26160") ? false : (stryCov_9fa48("26160", "26161"), analysis.feedback === null)) || (stryMutAct_9fa48("26163") ? analysis.feedback !== undefined : stryMutAct_9fa48("26162") ? false : (stryCov_9fa48("26162", "26163"), analysis.feedback === undefined)))) || (stryMutAct_9fa48("26165") ? typeof analysis.feedback === 'number' || isNaN(analysis.feedback) : stryMutAct_9fa48("26164") ? false : (stryCov_9fa48("26164", "26165"), (stryMutAct_9fa48("26167") ? typeof analysis.feedback !== 'number' : stryMutAct_9fa48("26166") ? true : (stryCov_9fa48("26166", "26167"), typeof analysis.feedback === (stryMutAct_9fa48("26168") ? "" : (stryCov_9fa48("26168"), 'number')))) && isNaN(analysis.feedback))))) {
                  if (stryMutAct_9fa48("26169")) {
                    {}
                  } else {
                    stryCov_9fa48("26169");
                    return stryMutAct_9fa48("26170") ? "Stryker was here!" : (stryCov_9fa48("26170"), ''); // Return empty string if feedback is NaN, null or undefined
                  }
                }
                return stryMutAct_9fa48("26173") ? analysis.feedback && '' : stryMutAct_9fa48("26172") ? false : stryMutAct_9fa48("26171") ? true : (stryCov_9fa48("26171", "26172", "26173"), analysis.feedback || (stryMutAct_9fa48("26174") ? "Stryker was here!" : (stryCov_9fa48("26174"), '')));
              }
            }
            return stryMutAct_9fa48("26175") ? "Stryker was here!" : (stryCov_9fa48("26175"), '');
          }
        } catch (err) {
          if (stryMutAct_9fa48("26176")) {
            {}
          } else {
            stryCov_9fa48("26176");
            console.error(stryMutAct_9fa48("26177") ? "" : (stryCov_9fa48("26177"), 'Error parsing feedback:'), err);
            return stryMutAct_9fa48("26178") ? "Stryker was here!" : (stryCov_9fa48("26178"), '');
          }
        }
      }
    };
    const getAnalyzedContent = item => {
      if (stryMutAct_9fa48("26179")) {
        {}
      } else {
        stryCov_9fa48("26179");
        try {
          if (stryMutAct_9fa48("26180")) {
            {}
          } else {
            stryCov_9fa48("26180");
            if (stryMutAct_9fa48("26183") ? false : stryMutAct_9fa48("26182") ? true : stryMutAct_9fa48("26181") ? item.analyzed_content : (stryCov_9fa48("26181", "26182", "26183"), !item.analyzed_content)) return stryMutAct_9fa48("26184") ? "Stryker was here!" : (stryCov_9fa48("26184"), '');

            // Handle case where analyzed_content is a string but might be JSON
            if (stryMutAct_9fa48("26187") ? typeof item.analyzed_content !== 'string' : stryMutAct_9fa48("26186") ? false : stryMutAct_9fa48("26185") ? true : (stryCov_9fa48("26185", "26186", "26187"), typeof item.analyzed_content === (stryMutAct_9fa48("26188") ? "" : (stryCov_9fa48("26188"), 'string')))) {
              if (stryMutAct_9fa48("26189")) {
                {}
              } else {
                stryCov_9fa48("26189");
                try {
                  if (stryMutAct_9fa48("26190")) {
                    {}
                  } else {
                    stryCov_9fa48("26190");
                    // Check if it's a JSON string
                    const parsed = JSON.parse(item.analyzed_content);

                    // Handle array of objects with type and content properties
                    if (stryMutAct_9fa48("26192") ? false : stryMutAct_9fa48("26191") ? true : (stryCov_9fa48("26191", "26192"), Array.isArray(parsed))) {
                      if (stryMutAct_9fa48("26193")) {
                        {}
                      } else {
                        stryCov_9fa48("26193");
                        const links = stryMutAct_9fa48("26194") ? parsed.map(p => p.content) : (stryCov_9fa48("26194"), parsed.filter(stryMutAct_9fa48("26195") ? () => undefined : (stryCov_9fa48("26195"), p => stryMutAct_9fa48("26198") ? p.type !== 'link' : stryMutAct_9fa48("26197") ? false : stryMutAct_9fa48("26196") ? true : (stryCov_9fa48("26196", "26197", "26198"), p.type === (stryMutAct_9fa48("26199") ? "" : (stryCov_9fa48("26199"), 'link'))))).map(stryMutAct_9fa48("26200") ? () => undefined : (stryCov_9fa48("26200"), p => p.content)));
                        return (stryMutAct_9fa48("26204") ? links.length <= 0 : stryMutAct_9fa48("26203") ? links.length >= 0 : stryMutAct_9fa48("26202") ? false : stryMutAct_9fa48("26201") ? true : (stryCov_9fa48("26201", "26202", "26203", "26204"), links.length > 0)) ? links[0] : stryMutAct_9fa48("26205") ? "Stryker was here!" : (stryCov_9fa48("26205"), '');
                      }
                    }

                    // Handle object with content property
                    if (stryMutAct_9fa48("26208") ? parsed || parsed.content : stryMutAct_9fa48("26207") ? false : stryMutAct_9fa48("26206") ? true : (stryCov_9fa48("26206", "26207", "26208"), parsed && parsed.content)) {
                      if (stryMutAct_9fa48("26209")) {
                        {}
                      } else {
                        stryCov_9fa48("26209");
                        return parsed.content;
                      }
                    }
                    return item.analyzed_content; // Return original if JSON parsing doesn't yield useful results
                  }
                } catch (e) {
                  if (stryMutAct_9fa48("26210")) {
                    {}
                  } else {
                    stryCov_9fa48("26210");
                    // Not a JSON string, just return as is
                    return item.analyzed_content;
                  }
                }
              }
            }

            // Handle object format
            if (stryMutAct_9fa48("26213") ? typeof item.analyzed_content !== 'object' : stryMutAct_9fa48("26212") ? false : stryMutAct_9fa48("26211") ? true : (stryCov_9fa48("26211", "26212", "26213"), typeof item.analyzed_content === (stryMutAct_9fa48("26214") ? "" : (stryCov_9fa48("26214"), 'object')))) {
              if (stryMutAct_9fa48("26215")) {
                {}
              } else {
                stryCov_9fa48("26215");
                if (stryMutAct_9fa48("26217") ? false : stryMutAct_9fa48("26216") ? true : (stryCov_9fa48("26216", "26217"), item.analyzed_content.content)) {
                  if (stryMutAct_9fa48("26218")) {
                    {}
                  } else {
                    stryCov_9fa48("26218");
                    return item.analyzed_content.content;
                  }
                }

                // For arrays of objects
                if (stryMutAct_9fa48("26220") ? false : stryMutAct_9fa48("26219") ? true : (stryCov_9fa48("26219", "26220"), Array.isArray(item.analyzed_content))) {
                  if (stryMutAct_9fa48("26221")) {
                    {}
                  } else {
                    stryCov_9fa48("26221");
                    const links = stryMutAct_9fa48("26222") ? item.analyzed_content.map(item => item.content) : (stryCov_9fa48("26222"), item.analyzed_content.filter(stryMutAct_9fa48("26223") ? () => undefined : (stryCov_9fa48("26223"), item => stryMutAct_9fa48("26226") ? item.type !== 'link' : stryMutAct_9fa48("26225") ? false : stryMutAct_9fa48("26224") ? true : (stryCov_9fa48("26224", "26225", "26226"), item.type === (stryMutAct_9fa48("26227") ? "" : (stryCov_9fa48("26227"), 'link'))))).map(stryMutAct_9fa48("26228") ? () => undefined : (stryCov_9fa48("26228"), item => item.content)));
                    return (stryMutAct_9fa48("26232") ? links.length <= 0 : stryMutAct_9fa48("26231") ? links.length >= 0 : stryMutAct_9fa48("26230") ? false : stryMutAct_9fa48("26229") ? true : (stryCov_9fa48("26229", "26230", "26231", "26232"), links.length > 0)) ? links[0] : stryMutAct_9fa48("26233") ? "Stryker was here!" : (stryCov_9fa48("26233"), '');
                  }
                }
              }
            }
            return stryMutAct_9fa48("26234") ? "Stryker was here!" : (stryCov_9fa48("26234"), '');
          }
        } catch (err) {
          if (stryMutAct_9fa48("26235")) {
            {}
          } else {
            stryCov_9fa48("26235");
            console.error(stryMutAct_9fa48("26236") ? "" : (stryCov_9fa48("26236"), 'Error extracting analyzed content:'), err);
            return stryMutAct_9fa48("26237") ? "Stryker was here!" : (stryCov_9fa48("26237"), '');
          }
        }
      }
    };

    // Parse the analysis object safely handling NaN and other edge cases
    const parseAnalysis = item => {
      if (stryMutAct_9fa48("26238")) {
        {}
      } else {
        stryCov_9fa48("26238");
        try {
          if (stryMutAct_9fa48("26239")) {
            {}
          } else {
            stryCov_9fa48("26239");
            if (stryMutAct_9fa48("26242") ? !item && !item.analysis : stryMutAct_9fa48("26241") ? false : stryMutAct_9fa48("26240") ? true : (stryCov_9fa48("26240", "26241", "26242"), (stryMutAct_9fa48("26243") ? item : (stryCov_9fa48("26243"), !item)) || (stryMutAct_9fa48("26244") ? item.analysis : (stryCov_9fa48("26244"), !item.analysis)))) return null;

            // Handle NaN values in the JSON by replacing them before parsing
            let analysisStr = item.analysis;
            if (stryMutAct_9fa48("26247") ? typeof analysisStr !== 'string' : stryMutAct_9fa48("26246") ? false : stryMutAct_9fa48("26245") ? true : (stryCov_9fa48("26245", "26246", "26247"), typeof analysisStr === (stryMutAct_9fa48("26248") ? "" : (stryCov_9fa48("26248"), 'string')))) {
              if (stryMutAct_9fa48("26249")) {
                {}
              } else {
                stryCov_9fa48("26249");
                // Replace NaN with null since NaN is not valid in JSON
                analysisStr = analysisStr.replace(stryMutAct_9fa48("26253") ? /"feedback"\s*:\S*NaN/g : stryMutAct_9fa48("26252") ? /"feedback"\s*:\sNaN/g : stryMutAct_9fa48("26251") ? /"feedback"\S*:\s*NaN/g : stryMutAct_9fa48("26250") ? /"feedback"\s:\s*NaN/g : (stryCov_9fa48("26250", "26251", "26252", "26253"), /"feedback"\s*:\s*NaN/g), stryMutAct_9fa48("26254") ? "" : (stryCov_9fa48("26254"), '"feedback": null'));
                analysisStr = analysisStr.replace(stryMutAct_9fa48("26256") ? /:\S*NaN/g : stryMutAct_9fa48("26255") ? /:\sNaN/g : (stryCov_9fa48("26255", "26256"), /:\s*NaN/g), stryMutAct_9fa48("26257") ? "" : (stryCov_9fa48("26257"), ': null'));
                try {
                  if (stryMutAct_9fa48("26258")) {
                    {}
                  } else {
                    stryCov_9fa48("26258");
                    return JSON.parse(analysisStr);
                  }
                } catch (jsonError) {
                  if (stryMutAct_9fa48("26259")) {
                    {}
                  } else {
                    stryCov_9fa48("26259");
                    console.error(stryMutAct_9fa48("26260") ? "" : (stryCov_9fa48("26260"), 'JSON parse error:'), jsonError);
                    console.log(stryMutAct_9fa48("26261") ? "" : (stryCov_9fa48("26261"), 'Problem string:'), analysisStr);
                    return {}; // Return empty object if parse fails
                  }
                }
              }
            } else if (stryMutAct_9fa48("26264") ? typeof item.analysis !== 'object' : stryMutAct_9fa48("26263") ? false : stryMutAct_9fa48("26262") ? true : (stryCov_9fa48("26262", "26263", "26264"), typeof item.analysis === (stryMutAct_9fa48("26265") ? "" : (stryCov_9fa48("26265"), 'object')))) {
              if (stryMutAct_9fa48("26266")) {
                {}
              } else {
                stryCov_9fa48("26266");
                return item.analysis;
              }
            }
            return {};
          }
        } catch (err) {
          if (stryMutAct_9fa48("26267")) {
            {}
          } else {
            stryCov_9fa48("26267");
            console.error(stryMutAct_9fa48("26268") ? "" : (stryCov_9fa48("26268"), 'Error parsing analysis:'), err);
            return {};
          }
        }
      }
    };
    if (stryMutAct_9fa48("26270") ? false : stryMutAct_9fa48("26269") ? true : (stryCov_9fa48("26269", "26270"), loading)) {
      if (stryMutAct_9fa48("26271")) {
        {}
      } else {
        stryCov_9fa48("26271");
        return <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress size={24} />
      </Box>;
      }
    }
    if (stryMutAct_9fa48("26273") ? false : stryMutAct_9fa48("26272") ? true : (stryCov_9fa48("26272", "26273"), error)) {
      if (stryMutAct_9fa48("26274")) {
        {}
      } else {
        stryCov_9fa48("26274");
        return <Box textAlign="center" py={4}>
        <Typography color="error" variant="h6" gutterBottom>
          Error Loading Comprehension Data
        </Typography>
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      </Box>;
      }
    }
    if (stryMutAct_9fa48("26277") ? (!comprehensionData || !Array.isArray(comprehensionData)) && comprehensionData.length === 0 : stryMutAct_9fa48("26276") ? false : stryMutAct_9fa48("26275") ? true : (stryCov_9fa48("26275", "26276", "26277"), (stryMutAct_9fa48("26279") ? !comprehensionData && !Array.isArray(comprehensionData) : stryMutAct_9fa48("26278") ? false : (stryCov_9fa48("26278", "26279"), (stryMutAct_9fa48("26280") ? comprehensionData : (stryCov_9fa48("26280"), !comprehensionData)) || (stryMutAct_9fa48("26281") ? Array.isArray(comprehensionData) : (stryCov_9fa48("26281"), !Array.isArray(comprehensionData))))) || (stryMutAct_9fa48("26283") ? comprehensionData.length !== 0 : stryMutAct_9fa48("26282") ? false : (stryCov_9fa48("26282", "26283"), comprehensionData.length === 0)))) {
      if (stryMutAct_9fa48("26284")) {
        {}
      } else {
        stryCov_9fa48("26284");
        return <Box textAlign="center" py={4}>
        <Box sx={stryMutAct_9fa48("26285") ? {} : (stryCov_9fa48("26285"), {
            position: stryMutAct_9fa48("26286") ? "" : (stryCov_9fa48("26286"), 'relative'),
            mb: 4
          })}>
          <Typography variant="h6" sx={stryMutAct_9fa48("26287") ? {} : (stryCov_9fa48("26287"), {
              color: stryMutAct_9fa48("26288") ? "" : (stryCov_9fa48("26288"), 'var(--color-text-primary)'),
              mb: 3
            })}>
            Comprehension Analysis
          </Typography>
          
          <Box sx={stryMutAct_9fa48("26289") ? {} : (stryCov_9fa48("26289"), {
              position: stryMutAct_9fa48("26290") ? "" : (stryCov_9fa48("26290"), 'absolute'),
              right: 0,
              top: 0
            })}>
            <MonthFilter selectedMonth={selectedMonth} onMonthChange={handleMonthChange} cohortMonth={cohortMonth} />
          </Box>
        </Box>
        <Typography sx={stryMutAct_9fa48("26291") ? {} : (stryCov_9fa48("26291"), {
            color: stryMutAct_9fa48("26292") ? "" : (stryCov_9fa48("26292"), 'var(--color-text-secondary)')
          })}>
          No comprehension data available for the selected month.
        </Typography>
      </Box>;
      }
    }
    return <Box className="comprehension-section">
      <Box sx={stryMutAct_9fa48("26293") ? {} : (stryCov_9fa48("26293"), {
        position: stryMutAct_9fa48("26294") ? "" : (stryCov_9fa48("26294"), 'relative'),
        mb: 3
      })}>
        <Typography variant="h6" sx={stryMutAct_9fa48("26295") ? {} : (stryCov_9fa48("26295"), {
          color: stryMutAct_9fa48("26296") ? "" : (stryCov_9fa48("26296"), 'var(--color-text-primary)'),
          mb: 3
        })}>
          Comprehension Analysis
        </Typography>
        
        <Box sx={stryMutAct_9fa48("26297") ? {} : (stryCov_9fa48("26297"), {
          position: stryMutAct_9fa48("26298") ? "" : (stryCov_9fa48("26298"), 'absolute'),
          right: 0,
          top: 0
        })}>
          <MonthFilter selectedMonth={selectedMonth} onMonthChange={handleMonthChange} cohortMonth={cohortMonth} />
        </Box>
      </Box>
      
      {/* AI Trend Analysis */}
      <AITrendAnalysis analysisType="comprehension" cohortMonth={cohortMonth} title="Comprehension" />
      
      {/* List view of comprehension items */}
      <Grid container spacing={2}>
        {comprehensionData.map((item, index) => {
          if (stryMutAct_9fa48("26299")) {
            {}
          } else {
            stryCov_9fa48("26299");
            const score = getCompletionScore(item);
            const feedback = getFeedback(item);
            return <Grid item xs={12} key={index}>
              <Card variant="outlined" sx={stryMutAct_9fa48("26300") ? {} : (stryCov_9fa48("26300"), {
                backgroundColor: stryMutAct_9fa48("26301") ? "" : (stryCov_9fa48("26301"), '#171c28'),
                border: stryMutAct_9fa48("26302") ? "" : (stryCov_9fa48("26302"), '1px solid var(--color-border)'),
                borderRadius: 2
              })}>
                <CardContent sx={stryMutAct_9fa48("26303") ? {} : (stryCov_9fa48("26303"), {
                  pb: 1.5
                })}>
                  {/* Date at top - small */}
                  <Typography variant="caption" sx={stryMutAct_9fa48("26304") ? {} : (stryCov_9fa48("26304"), {
                    color: stryMutAct_9fa48("26305") ? "" : (stryCov_9fa48("26305"), 'var(--color-text-secondary)'),
                    display: stryMutAct_9fa48("26306") ? "" : (stryCov_9fa48("26306"), 'block'),
                    mb: 0.5,
                    textAlign: stryMutAct_9fa48("26307") ? "" : (stryCov_9fa48("26307"), 'left')
                  })}>
                    {formatDate(stryMutAct_9fa48("26310") ? (item.date?.value || item.analyzed_at) && item.curriculum_date : stryMutAct_9fa48("26309") ? false : stryMutAct_9fa48("26308") ? true : (stryCov_9fa48("26308", "26309", "26310"), (stryMutAct_9fa48("26312") ? item.date?.value && item.analyzed_at : stryMutAct_9fa48("26311") ? false : (stryCov_9fa48("26311", "26312"), (stryMutAct_9fa48("26313") ? item.date.value : (stryCov_9fa48("26313"), item.date?.value)) || item.analyzed_at)) || item.curriculum_date))}
                  </Typography>
                  
                  {/* Title and score on same line */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                    <Typography variant="subtitle1" sx={stryMutAct_9fa48("26314") ? {} : (stryCov_9fa48("26314"), {
                      color: stryMutAct_9fa48("26315") ? "" : (stryCov_9fa48("26315"), 'var(--color-text-primary)'),
                      fontWeight: 500,
                      textAlign: stryMutAct_9fa48("26316") ? "" : (stryCov_9fa48("26316"), 'left')
                    })}>
                      {stryMutAct_9fa48("26319") ? item.task_title && `Comprehension ${item.task_id || ''}` : stryMutAct_9fa48("26318") ? false : stryMutAct_9fa48("26317") ? true : (stryCov_9fa48("26317", "26318", "26319"), item.task_title || (stryMutAct_9fa48("26320") ? `` : (stryCov_9fa48("26320"), `Comprehension ${stryMutAct_9fa48("26323") ? item.task_id && '' : stryMutAct_9fa48("26322") ? false : stryMutAct_9fa48("26321") ? true : (stryCov_9fa48("26321", "26322", "26323"), item.task_id || (stryMutAct_9fa48("26324") ? "Stryker was here!" : (stryCov_9fa48("26324"), '')))}`)))}
                    </Typography>
                    
                    <Chip label={stryMutAct_9fa48("26325") ? `` : (stryCov_9fa48("26325"), `${score}% (${getGradeLabel(score)})`)} color={getGradeColor(score)} size="small" />
                  </Box>
                  
                  {/* Feedback summary */}
                  {stryMutAct_9fa48("26328") ? feedback || <Typography variant="body2" sx={{
                    color: 'var(--color-text-primary)',
                    opacity: 0.8,
                    maxHeight: '60px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    textAlign: 'left'
                  }}>
                      {feedback}
                    </Typography> : stryMutAct_9fa48("26327") ? false : stryMutAct_9fa48("26326") ? true : (stryCov_9fa48("26326", "26327", "26328"), feedback && <Typography variant="body2" sx={stryMutAct_9fa48("26329") ? {} : (stryCov_9fa48("26329"), {
                    color: stryMutAct_9fa48("26330") ? "" : (stryCov_9fa48("26330"), 'var(--color-text-primary)'),
                    opacity: 0.8,
                    maxHeight: stryMutAct_9fa48("26331") ? "" : (stryCov_9fa48("26331"), '60px'),
                    overflow: stryMutAct_9fa48("26332") ? "" : (stryCov_9fa48("26332"), 'hidden'),
                    textOverflow: stryMutAct_9fa48("26333") ? "" : (stryCov_9fa48("26333"), 'ellipsis'),
                    display: stryMutAct_9fa48("26334") ? "" : (stryCov_9fa48("26334"), '-webkit-box'),
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: stryMutAct_9fa48("26335") ? "" : (stryCov_9fa48("26335"), 'vertical'),
                    textAlign: stryMutAct_9fa48("26336") ? "" : (stryCov_9fa48("26336"), 'left')
                  })}>
                      {feedback}
                    </Typography>)}
                </CardContent>
                <CardActions sx={stryMutAct_9fa48("26337") ? {} : (stryCov_9fa48("26337"), {
                  justifyContent: stryMutAct_9fa48("26338") ? "" : (stryCov_9fa48("26338"), 'flex-end'),
                  p: 1.5,
                  pt: 0
                })}>
                  <Button variant="outlined" size="small" onClick={stryMutAct_9fa48("26339") ? () => undefined : (stryCov_9fa48("26339"), () => handleOpenModal(item))}>
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>;
          }
        })}
      </Grid>
      
      {/* Modal for detailed view */}
      <Modal open={modalOpen} onClose={handleCloseModal} aria-labelledby="comprehension-modal-title">
        <Box sx={stryMutAct_9fa48("26340") ? {} : (stryCov_9fa48("26340"), {
          position: stryMutAct_9fa48("26341") ? "" : (stryCov_9fa48("26341"), 'absolute'),
          top: stryMutAct_9fa48("26342") ? "" : (stryCov_9fa48("26342"), '50%'),
          left: stryMutAct_9fa48("26343") ? "" : (stryCov_9fa48("26343"), '50%'),
          transform: stryMutAct_9fa48("26344") ? "" : (stryCov_9fa48("26344"), 'translate(-50%, -50%)'),
          width: stryMutAct_9fa48("26345") ? {} : (stryCov_9fa48("26345"), {
            xs: stryMutAct_9fa48("26346") ? "" : (stryCov_9fa48("26346"), '90%'),
            sm: stryMutAct_9fa48("26347") ? "" : (stryCov_9fa48("26347"), '80%'),
            md: stryMutAct_9fa48("26348") ? "" : (stryCov_9fa48("26348"), '70%')
          }),
          maxWidth: stryMutAct_9fa48("26349") ? "" : (stryCov_9fa48("26349"), '800px'),
          maxHeight: stryMutAct_9fa48("26350") ? "" : (stryCov_9fa48("26350"), '90vh'),
          overflow: stryMutAct_9fa48("26351") ? "" : (stryCov_9fa48("26351"), 'auto'),
          bgcolor: stryMutAct_9fa48("26352") ? "" : (stryCov_9fa48("26352"), '#171c28'),
          border: stryMutAct_9fa48("26353") ? "" : (stryCov_9fa48("26353"), '1px solid var(--color-border)'),
          borderRadius: 1,
          boxShadow: 24,
          p: 4
        })}>
          {stryMutAct_9fa48("26356") ? selectedItem || <>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography id="comprehension-modal-title" variant="h5" component="h2" sx={{
                  fontWeight: 'bold',
                  color: 'var(--color-text-primary)'
                }}>
                    {selectedItem.task_title || `Comprehension ${selectedItem.task_id || ''}`}
                  </Typography>
                  <Typography variant="subtitle1" sx={{
                  color: 'var(--color-text-secondary)',
                  mt: 1
                }}>
                    Date: {formatDate(selectedItem.date?.value || selectedItem.analyzed_at || selectedItem.curriculum_date)}
                  </Typography>
                </Box>
                <IconButton onClick={handleCloseModal} sx={{
                p: 1
              }}>
                  <CloseIcon />
                </IconButton>
              </Box>
              
              <Divider sx={{
              mb: 3
            }} />
              
              {/* Analyzed Content */}
              {getAnalyzedContent(selectedItem) && <Box mb={3}>
                  <Typography variant="subtitle1" sx={{
                fontWeight: 'bold',
                mb: 1
              }}>
                    Analyzed Content:
                  </Typography>
                  {getAnalyzedContent(selectedItem).startsWith('https://') ? <Link href={getAnalyzedContent(selectedItem)} target="_blank" rel="noopener noreferrer" sx={{
                wordBreak: 'break-all'
              }}>
                      {getAnalyzedContent(selectedItem)}
                    </Link> : <Typography variant="body2" sx={{
                color: 'var(--color-text-primary)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: 2,
                borderRadius: 1,
                border: '1px solid var(--color-border)'
              }}>
                      {getAnalyzedContent(selectedItem)}
                    </Typography>}
                </Box>}
              
              {/* Analysis Content */}
              {parseAnalysis(selectedItem) && <Box>
                  {/* Section Scores Summary */}
                  {getAllSectionScores(selectedItem).length > 0 && <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Section Scores:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {getAllSectionScores(selectedItem).map((scoreData, idx) => <Chip key={idx} label={`${scoreData.section}: ${scoreData.score}% (${getGradeLabel(scoreData.score)})`} color={getGradeColor(scoreData.score)} size="medium" sx={{
                    fontWeight: 'bold'
                  }} />)}
                      </Box>
                    </Box>}
                  
                  {/* Submission Summary */}
                  {parseAnalysis(selectedItem).submission_summary && <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Submission Summary:
                      </Typography>
                      <Typography variant="body2" sx={{
                  color: 'var(--color-text-primary)'
                }}>
                        {parseAnalysis(selectedItem).submission_summary}
                      </Typography>
                    </Box>}
                  
                  {/* Feedback */}
                  {parseAnalysis(selectedItem).feedback && <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Feedback:
                      </Typography>
                      <Typography variant="body2" sx={{
                  color: 'var(--color-text-primary)'
                }}>
                        {parseAnalysis(selectedItem).feedback}
                      </Typography>
                    </Box>}
                  
                  {/* Criteria Met */}
                  {parseAnalysis(selectedItem).criteria_met && parseAnalysis(selectedItem).criteria_met.length > 0 && <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Criteria Met:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {parseAnalysis(selectedItem).criteria_met.map((criterion, idx) => <Chip key={idx} label={criterion} color="success" size="small" />)}
                      </Box>
                    </Box>}
                  
                  {/* Areas for Improvement */}
                  {parseAnalysis(selectedItem).areas_for_improvement && parseAnalysis(selectedItem).areas_for_improvement.length > 0 && <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Areas for Improvement:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {parseAnalysis(selectedItem).areas_for_improvement.map((area, idx) => <Chip key={idx} label={area} color="warning" size="small" />)}
                      </Box>
                    </Box>}
                  
                  {/* Specific Findings */}
                  {parseAnalysis(selectedItem).specific_findings && <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Specific Findings:
                      </Typography>
                      
                      {/* Comprehension Section - handle both cases: lowercase and uppercase 'c' */}
                      {(parseAnalysis(selectedItem).specific_findings.comprehension || parseAnalysis(selectedItem).specific_findings.Comprehension) && <Box mb={2}>
                          <Typography variant="subtitle2" sx={{
                    fontWeight: 'bold',
                    mt: 2
                  }}>
                            Comprehension:
                          </Typography>
                          
                          {/* Display Comprehension Score if available */}
                          {(parseAnalysis(selectedItem).specific_findings.comprehension?.score || parseAnalysis(selectedItem).specific_findings.Comprehension?.score) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Score: {parseAnalysis(selectedItem).specific_findings.comprehension?.score || parseAnalysis(selectedItem).specific_findings.Comprehension?.score}
                              </Typography>
                            </Box>}
                          
                          {/* Get strengths from either case version */}
                          {(parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths) ? (parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths).map((strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths}
                                  </Typography>}
                              </Box>
                            </Box>}
                          
                          {/* Get weaknesses from either case version */}
                          {(parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses) ? (parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses).map((weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box>}
                        </Box>}
                      
                      {/* Business Value Section - keep existing code but make the check case-insensitive */}
                      {(parseAnalysis(selectedItem).specific_findings.business_value || parseAnalysis(selectedItem).specific_findings.Business_value || parseAnalysis(selectedItem).specific_findings['Business Value']) && <Box mb={2}>
                          <Typography variant="subtitle2" sx={{
                    fontWeight: 'bold',
                    mt: 2
                  }}>
                            Business Value:
                          </Typography>
                          
                          {/* Display Business Value Score if available */}
                          {(parseAnalysis(selectedItem).specific_findings.business_value?.score || parseAnalysis(selectedItem).specific_findings.Business_value?.score || parseAnalysis(selectedItem).specific_findings['Business Value']?.score) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Score: {parseAnalysis(selectedItem).specific_findings.business_value?.score || parseAnalysis(selectedItem).specific_findings.Business_value?.score || parseAnalysis(selectedItem).specific_findings['Business Value']?.score}
                              </Typography>
                            </Box>}
                          
                          {/* Use the first available property for strengths */}
                          {(parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths) ? (parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths).map((strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths}
                                  </Typography>}
                              </Box>
                            </Box>}
                          
                          {/* Use the first available property for weaknesses */}
                          {(parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses) ? (parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses).map((weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box>}
                        </Box>}
                      
                      {/* Professional Skills Section - keep existing code but make the check case-insensitive */}
                      {(parseAnalysis(selectedItem).specific_findings.professional_skills || parseAnalysis(selectedItem).specific_findings.Professional_skills || parseAnalysis(selectedItem).specific_findings['Professional Skills']) && <Box mb={2}>
                          <Typography variant="subtitle2" sx={{
                    fontWeight: 'bold',
                    mt: 2
                  }}>
                            Professional Skills:
                          </Typography>
                          
                          {/* Display Professional Skills Score if available */}
                          {(parseAnalysis(selectedItem).specific_findings.professional_skills?.score || parseAnalysis(selectedItem).specific_findings.Professional_skills?.score || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.score) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Score: {parseAnalysis(selectedItem).specific_findings.professional_skills?.score || parseAnalysis(selectedItem).specific_findings.Professional_skills?.score || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.score}
                              </Typography>
                            </Box>}
                          
                          {/* Use the first available property for strengths */}
                          {(parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths) ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths).map((strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths}
                                  </Typography>}
                              </Box>
                            </Box>}
                          
                          {/* Use the first available property for weaknesses */}
                          {(parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses) ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses).map((weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box>}
                        </Box>}
                      
                      {/* Display AI Generation Information if available */}
                      {(parseAnalysis(selectedItem).ai_generated_likelihood || parseAnalysis(selectedItem).ai_detection_reasoning) && <Box mb={2}>
                          <Typography variant="subtitle2" sx={{
                    fontWeight: 'bold',
                    mt: 2
                  }}>
                            AI Detection:
                          </Typography>
                          
                          {parseAnalysis(selectedItem).ai_generated_likelihood && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                AI Generated Likelihood:
                              </Typography>
                              <Typography variant="body2">
                                {parseAnalysis(selectedItem).ai_generated_likelihood}
                              </Typography>
                            </Box>}
                          
                          {parseAnalysis(selectedItem).ai_detection_reasoning && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Reasoning:
                              </Typography>
                              <Typography variant="body2">
                                {parseAnalysis(selectedItem).ai_detection_reasoning}
                              </Typography>
                            </Box>}
                        </Box>}
                    </Box>}
                </Box>}
            </> : stryMutAct_9fa48("26355") ? false : stryMutAct_9fa48("26354") ? true : (stryCov_9fa48("26354", "26355", "26356"), selectedItem && <>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography id="comprehension-modal-title" variant="h5" component="h2" sx={stryMutAct_9fa48("26357") ? {} : (stryCov_9fa48("26357"), {
                  fontWeight: stryMutAct_9fa48("26358") ? "" : (stryCov_9fa48("26358"), 'bold'),
                  color: stryMutAct_9fa48("26359") ? "" : (stryCov_9fa48("26359"), 'var(--color-text-primary)')
                })}>
                    {stryMutAct_9fa48("26362") ? selectedItem.task_title && `Comprehension ${selectedItem.task_id || ''}` : stryMutAct_9fa48("26361") ? false : stryMutAct_9fa48("26360") ? true : (stryCov_9fa48("26360", "26361", "26362"), selectedItem.task_title || (stryMutAct_9fa48("26363") ? `` : (stryCov_9fa48("26363"), `Comprehension ${stryMutAct_9fa48("26366") ? selectedItem.task_id && '' : stryMutAct_9fa48("26365") ? false : stryMutAct_9fa48("26364") ? true : (stryCov_9fa48("26364", "26365", "26366"), selectedItem.task_id || (stryMutAct_9fa48("26367") ? "Stryker was here!" : (stryCov_9fa48("26367"), '')))}`)))}
                  </Typography>
                  <Typography variant="subtitle1" sx={stryMutAct_9fa48("26368") ? {} : (stryCov_9fa48("26368"), {
                  color: stryMutAct_9fa48("26369") ? "" : (stryCov_9fa48("26369"), 'var(--color-text-secondary)'),
                  mt: 1
                })}>
                    Date: {formatDate(stryMutAct_9fa48("26372") ? (selectedItem.date?.value || selectedItem.analyzed_at) && selectedItem.curriculum_date : stryMutAct_9fa48("26371") ? false : stryMutAct_9fa48("26370") ? true : (stryCov_9fa48("26370", "26371", "26372"), (stryMutAct_9fa48("26374") ? selectedItem.date?.value && selectedItem.analyzed_at : stryMutAct_9fa48("26373") ? false : (stryCov_9fa48("26373", "26374"), (stryMutAct_9fa48("26375") ? selectedItem.date.value : (stryCov_9fa48("26375"), selectedItem.date?.value)) || selectedItem.analyzed_at)) || selectedItem.curriculum_date))}
                  </Typography>
                </Box>
                <IconButton onClick={handleCloseModal} sx={stryMutAct_9fa48("26376") ? {} : (stryCov_9fa48("26376"), {
                p: 1
              })}>
                  <CloseIcon />
                </IconButton>
              </Box>
              
              <Divider sx={stryMutAct_9fa48("26377") ? {} : (stryCov_9fa48("26377"), {
              mb: 3
            })} />
              
              {/* Analyzed Content */}
              {stryMutAct_9fa48("26380") ? getAnalyzedContent(selectedItem) || <Box mb={3}>
                  <Typography variant="subtitle1" sx={{
                fontWeight: 'bold',
                mb: 1
              }}>
                    Analyzed Content:
                  </Typography>
                  {getAnalyzedContent(selectedItem).startsWith('https://') ? <Link href={getAnalyzedContent(selectedItem)} target="_blank" rel="noopener noreferrer" sx={{
                wordBreak: 'break-all'
              }}>
                      {getAnalyzedContent(selectedItem)}
                    </Link> : <Typography variant="body2" sx={{
                color: 'var(--color-text-primary)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: 2,
                borderRadius: 1,
                border: '1px solid var(--color-border)'
              }}>
                      {getAnalyzedContent(selectedItem)}
                    </Typography>}
                </Box> : stryMutAct_9fa48("26379") ? false : stryMutAct_9fa48("26378") ? true : (stryCov_9fa48("26378", "26379", "26380"), getAnalyzedContent(selectedItem) && <Box mb={3}>
                  <Typography variant="subtitle1" sx={stryMutAct_9fa48("26381") ? {} : (stryCov_9fa48("26381"), {
                fontWeight: stryMutAct_9fa48("26382") ? "" : (stryCov_9fa48("26382"), 'bold'),
                mb: 1
              })}>
                    Analyzed Content:
                  </Typography>
                  {(stryMutAct_9fa48("26383") ? getAnalyzedContent(selectedItem).endsWith('https://') : (stryCov_9fa48("26383"), getAnalyzedContent(selectedItem).startsWith(stryMutAct_9fa48("26384") ? "" : (stryCov_9fa48("26384"), 'https://')))) ? <Link href={getAnalyzedContent(selectedItem)} target="_blank" rel="noopener noreferrer" sx={stryMutAct_9fa48("26385") ? {} : (stryCov_9fa48("26385"), {
                wordBreak: stryMutAct_9fa48("26386") ? "" : (stryCov_9fa48("26386"), 'break-all')
              })}>
                      {getAnalyzedContent(selectedItem)}
                    </Link> : <Typography variant="body2" sx={stryMutAct_9fa48("26387") ? {} : (stryCov_9fa48("26387"), {
                color: stryMutAct_9fa48("26388") ? "" : (stryCov_9fa48("26388"), 'var(--color-text-primary)'),
                whiteSpace: stryMutAct_9fa48("26389") ? "" : (stryCov_9fa48("26389"), 'pre-wrap'),
                fontFamily: stryMutAct_9fa48("26390") ? "" : (stryCov_9fa48("26390"), 'monospace'),
                backgroundColor: stryMutAct_9fa48("26391") ? "" : (stryCov_9fa48("26391"), 'rgba(255, 255, 255, 0.05)'),
                padding: 2,
                borderRadius: 1,
                border: stryMutAct_9fa48("26392") ? "" : (stryCov_9fa48("26392"), '1px solid var(--color-border)')
              })}>
                      {getAnalyzedContent(selectedItem)}
                    </Typography>}
                </Box>)}
              
              {/* Analysis Content */}
              {stryMutAct_9fa48("26395") ? parseAnalysis(selectedItem) || <Box>
                  {/* Section Scores Summary */}
                  {getAllSectionScores(selectedItem).length > 0 && <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Section Scores:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {getAllSectionScores(selectedItem).map((scoreData, idx) => <Chip key={idx} label={`${scoreData.section}: ${scoreData.score}% (${getGradeLabel(scoreData.score)})`} color={getGradeColor(scoreData.score)} size="medium" sx={{
                    fontWeight: 'bold'
                  }} />)}
                      </Box>
                    </Box>}
                  
                  {/* Submission Summary */}
                  {parseAnalysis(selectedItem).submission_summary && <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Submission Summary:
                      </Typography>
                      <Typography variant="body2" sx={{
                  color: 'var(--color-text-primary)'
                }}>
                        {parseAnalysis(selectedItem).submission_summary}
                      </Typography>
                    </Box>}
                  
                  {/* Feedback */}
                  {parseAnalysis(selectedItem).feedback && <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Feedback:
                      </Typography>
                      <Typography variant="body2" sx={{
                  color: 'var(--color-text-primary)'
                }}>
                        {parseAnalysis(selectedItem).feedback}
                      </Typography>
                    </Box>}
                  
                  {/* Criteria Met */}
                  {parseAnalysis(selectedItem).criteria_met && parseAnalysis(selectedItem).criteria_met.length > 0 && <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Criteria Met:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {parseAnalysis(selectedItem).criteria_met.map((criterion, idx) => <Chip key={idx} label={criterion} color="success" size="small" />)}
                      </Box>
                    </Box>}
                  
                  {/* Areas for Improvement */}
                  {parseAnalysis(selectedItem).areas_for_improvement && parseAnalysis(selectedItem).areas_for_improvement.length > 0 && <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Areas for Improvement:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {parseAnalysis(selectedItem).areas_for_improvement.map((area, idx) => <Chip key={idx} label={area} color="warning" size="small" />)}
                      </Box>
                    </Box>}
                  
                  {/* Specific Findings */}
                  {parseAnalysis(selectedItem).specific_findings && <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Specific Findings:
                      </Typography>
                      
                      {/* Comprehension Section - handle both cases: lowercase and uppercase 'c' */}
                      {(parseAnalysis(selectedItem).specific_findings.comprehension || parseAnalysis(selectedItem).specific_findings.Comprehension) && <Box mb={2}>
                          <Typography variant="subtitle2" sx={{
                    fontWeight: 'bold',
                    mt: 2
                  }}>
                            Comprehension:
                          </Typography>
                          
                          {/* Display Comprehension Score if available */}
                          {(parseAnalysis(selectedItem).specific_findings.comprehension?.score || parseAnalysis(selectedItem).specific_findings.Comprehension?.score) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Score: {parseAnalysis(selectedItem).specific_findings.comprehension?.score || parseAnalysis(selectedItem).specific_findings.Comprehension?.score}
                              </Typography>
                            </Box>}
                          
                          {/* Get strengths from either case version */}
                          {(parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths) ? (parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths).map((strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths}
                                  </Typography>}
                              </Box>
                            </Box>}
                          
                          {/* Get weaknesses from either case version */}
                          {(parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses) ? (parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses).map((weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box>}
                        </Box>}
                      
                      {/* Business Value Section - keep existing code but make the check case-insensitive */}
                      {(parseAnalysis(selectedItem).specific_findings.business_value || parseAnalysis(selectedItem).specific_findings.Business_value || parseAnalysis(selectedItem).specific_findings['Business Value']) && <Box mb={2}>
                          <Typography variant="subtitle2" sx={{
                    fontWeight: 'bold',
                    mt: 2
                  }}>
                            Business Value:
                          </Typography>
                          
                          {/* Display Business Value Score if available */}
                          {(parseAnalysis(selectedItem).specific_findings.business_value?.score || parseAnalysis(selectedItem).specific_findings.Business_value?.score || parseAnalysis(selectedItem).specific_findings['Business Value']?.score) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Score: {parseAnalysis(selectedItem).specific_findings.business_value?.score || parseAnalysis(selectedItem).specific_findings.Business_value?.score || parseAnalysis(selectedItem).specific_findings['Business Value']?.score}
                              </Typography>
                            </Box>}
                          
                          {/* Use the first available property for strengths */}
                          {(parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths) ? (parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths).map((strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths}
                                  </Typography>}
                              </Box>
                            </Box>}
                          
                          {/* Use the first available property for weaknesses */}
                          {(parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses) ? (parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses).map((weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box>}
                        </Box>}
                      
                      {/* Professional Skills Section - keep existing code but make the check case-insensitive */}
                      {(parseAnalysis(selectedItem).specific_findings.professional_skills || parseAnalysis(selectedItem).specific_findings.Professional_skills || parseAnalysis(selectedItem).specific_findings['Professional Skills']) && <Box mb={2}>
                          <Typography variant="subtitle2" sx={{
                    fontWeight: 'bold',
                    mt: 2
                  }}>
                            Professional Skills:
                          </Typography>
                          
                          {/* Display Professional Skills Score if available */}
                          {(parseAnalysis(selectedItem).specific_findings.professional_skills?.score || parseAnalysis(selectedItem).specific_findings.Professional_skills?.score || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.score) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Score: {parseAnalysis(selectedItem).specific_findings.professional_skills?.score || parseAnalysis(selectedItem).specific_findings.Professional_skills?.score || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.score}
                              </Typography>
                            </Box>}
                          
                          {/* Use the first available property for strengths */}
                          {(parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths) ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths).map((strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths}
                                  </Typography>}
                              </Box>
                            </Box>}
                          
                          {/* Use the first available property for weaknesses */}
                          {(parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses) ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses).map((weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box>}
                        </Box>}
                      
                      {/* Display AI Generation Information if available */}
                      {(parseAnalysis(selectedItem).ai_generated_likelihood || parseAnalysis(selectedItem).ai_detection_reasoning) && <Box mb={2}>
                          <Typography variant="subtitle2" sx={{
                    fontWeight: 'bold',
                    mt: 2
                  }}>
                            AI Detection:
                          </Typography>
                          
                          {parseAnalysis(selectedItem).ai_generated_likelihood && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                AI Generated Likelihood:
                              </Typography>
                              <Typography variant="body2">
                                {parseAnalysis(selectedItem).ai_generated_likelihood}
                              </Typography>
                            </Box>}
                          
                          {parseAnalysis(selectedItem).ai_detection_reasoning && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Reasoning:
                              </Typography>
                              <Typography variant="body2">
                                {parseAnalysis(selectedItem).ai_detection_reasoning}
                              </Typography>
                            </Box>}
                        </Box>}
                    </Box>}
                </Box> : stryMutAct_9fa48("26394") ? false : stryMutAct_9fa48("26393") ? true : (stryCov_9fa48("26393", "26394", "26395"), parseAnalysis(selectedItem) && <Box>
                  {/* Section Scores Summary */}
                  {stryMutAct_9fa48("26398") ? getAllSectionScores(selectedItem).length > 0 || <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Section Scores:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {getAllSectionScores(selectedItem).map((scoreData, idx) => <Chip key={idx} label={`${scoreData.section}: ${scoreData.score}% (${getGradeLabel(scoreData.score)})`} color={getGradeColor(scoreData.score)} size="medium" sx={{
                    fontWeight: 'bold'
                  }} />)}
                      </Box>
                    </Box> : stryMutAct_9fa48("26397") ? false : stryMutAct_9fa48("26396") ? true : (stryCov_9fa48("26396", "26397", "26398"), (stryMutAct_9fa48("26401") ? getAllSectionScores(selectedItem).length <= 0 : stryMutAct_9fa48("26400") ? getAllSectionScores(selectedItem).length >= 0 : stryMutAct_9fa48("26399") ? true : (stryCov_9fa48("26399", "26400", "26401"), getAllSectionScores(selectedItem).length > 0)) && <Box mb={3}>
                      <Typography variant="subtitle1" sx={stryMutAct_9fa48("26402") ? {} : (stryCov_9fa48("26402"), {
                  fontWeight: stryMutAct_9fa48("26403") ? "" : (stryCov_9fa48("26403"), 'bold'),
                  mb: 1
                })}>
                        Section Scores:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {getAllSectionScores(selectedItem).map(stryMutAct_9fa48("26404") ? () => undefined : (stryCov_9fa48("26404"), (scoreData, idx) => <Chip key={idx} label={stryMutAct_9fa48("26405") ? `` : (stryCov_9fa48("26405"), `${scoreData.section}: ${scoreData.score}% (${getGradeLabel(scoreData.score)})`)} color={getGradeColor(scoreData.score)} size="medium" sx={stryMutAct_9fa48("26406") ? {} : (stryCov_9fa48("26406"), {
                    fontWeight: stryMutAct_9fa48("26407") ? "" : (stryCov_9fa48("26407"), 'bold')
                  })} />))}
                      </Box>
                    </Box>)}
                  
                  {/* Submission Summary */}
                  {stryMutAct_9fa48("26410") ? parseAnalysis(selectedItem).submission_summary || <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Submission Summary:
                      </Typography>
                      <Typography variant="body2" sx={{
                  color: 'var(--color-text-primary)'
                }}>
                        {parseAnalysis(selectedItem).submission_summary}
                      </Typography>
                    </Box> : stryMutAct_9fa48("26409") ? false : stryMutAct_9fa48("26408") ? true : (stryCov_9fa48("26408", "26409", "26410"), parseAnalysis(selectedItem).submission_summary && <Box mb={3}>
                      <Typography variant="subtitle1" sx={stryMutAct_9fa48("26411") ? {} : (stryCov_9fa48("26411"), {
                  fontWeight: stryMutAct_9fa48("26412") ? "" : (stryCov_9fa48("26412"), 'bold'),
                  mb: 1
                })}>
                        Submission Summary:
                      </Typography>
                      <Typography variant="body2" sx={stryMutAct_9fa48("26413") ? {} : (stryCov_9fa48("26413"), {
                  color: stryMutAct_9fa48("26414") ? "" : (stryCov_9fa48("26414"), 'var(--color-text-primary)')
                })}>
                        {parseAnalysis(selectedItem).submission_summary}
                      </Typography>
                    </Box>)}
                  
                  {/* Feedback */}
                  {stryMutAct_9fa48("26417") ? parseAnalysis(selectedItem).feedback || <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Feedback:
                      </Typography>
                      <Typography variant="body2" sx={{
                  color: 'var(--color-text-primary)'
                }}>
                        {parseAnalysis(selectedItem).feedback}
                      </Typography>
                    </Box> : stryMutAct_9fa48("26416") ? false : stryMutAct_9fa48("26415") ? true : (stryCov_9fa48("26415", "26416", "26417"), parseAnalysis(selectedItem).feedback && <Box mb={3}>
                      <Typography variant="subtitle1" sx={stryMutAct_9fa48("26418") ? {} : (stryCov_9fa48("26418"), {
                  fontWeight: stryMutAct_9fa48("26419") ? "" : (stryCov_9fa48("26419"), 'bold'),
                  mb: 1
                })}>
                        Feedback:
                      </Typography>
                      <Typography variant="body2" sx={stryMutAct_9fa48("26420") ? {} : (stryCov_9fa48("26420"), {
                  color: stryMutAct_9fa48("26421") ? "" : (stryCov_9fa48("26421"), 'var(--color-text-primary)')
                })}>
                        {parseAnalysis(selectedItem).feedback}
                      </Typography>
                    </Box>)}
                  
                  {/* Criteria Met */}
                  {stryMutAct_9fa48("26424") ? parseAnalysis(selectedItem).criteria_met && parseAnalysis(selectedItem).criteria_met.length > 0 || <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Criteria Met:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {parseAnalysis(selectedItem).criteria_met.map((criterion, idx) => <Chip key={idx} label={criterion} color="success" size="small" />)}
                      </Box>
                    </Box> : stryMutAct_9fa48("26423") ? false : stryMutAct_9fa48("26422") ? true : (stryCov_9fa48("26422", "26423", "26424"), (stryMutAct_9fa48("26426") ? parseAnalysis(selectedItem).criteria_met || parseAnalysis(selectedItem).criteria_met.length > 0 : stryMutAct_9fa48("26425") ? true : (stryCov_9fa48("26425", "26426"), parseAnalysis(selectedItem).criteria_met && (stryMutAct_9fa48("26429") ? parseAnalysis(selectedItem).criteria_met.length <= 0 : stryMutAct_9fa48("26428") ? parseAnalysis(selectedItem).criteria_met.length >= 0 : stryMutAct_9fa48("26427") ? true : (stryCov_9fa48("26427", "26428", "26429"), parseAnalysis(selectedItem).criteria_met.length > 0)))) && <Box mb={3}>
                      <Typography variant="subtitle1" sx={stryMutAct_9fa48("26430") ? {} : (stryCov_9fa48("26430"), {
                  fontWeight: stryMutAct_9fa48("26431") ? "" : (stryCov_9fa48("26431"), 'bold'),
                  mb: 1
                })}>
                        Criteria Met:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {parseAnalysis(selectedItem).criteria_met.map(stryMutAct_9fa48("26432") ? () => undefined : (stryCov_9fa48("26432"), (criterion, idx) => <Chip key={idx} label={criterion} color="success" size="small" />))}
                      </Box>
                    </Box>)}
                  
                  {/* Areas for Improvement */}
                  {stryMutAct_9fa48("26435") ? parseAnalysis(selectedItem).areas_for_improvement && parseAnalysis(selectedItem).areas_for_improvement.length > 0 || <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Areas for Improvement:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {parseAnalysis(selectedItem).areas_for_improvement.map((area, idx) => <Chip key={idx} label={area} color="warning" size="small" />)}
                      </Box>
                    </Box> : stryMutAct_9fa48("26434") ? false : stryMutAct_9fa48("26433") ? true : (stryCov_9fa48("26433", "26434", "26435"), (stryMutAct_9fa48("26437") ? parseAnalysis(selectedItem).areas_for_improvement || parseAnalysis(selectedItem).areas_for_improvement.length > 0 : stryMutAct_9fa48("26436") ? true : (stryCov_9fa48("26436", "26437"), parseAnalysis(selectedItem).areas_for_improvement && (stryMutAct_9fa48("26440") ? parseAnalysis(selectedItem).areas_for_improvement.length <= 0 : stryMutAct_9fa48("26439") ? parseAnalysis(selectedItem).areas_for_improvement.length >= 0 : stryMutAct_9fa48("26438") ? true : (stryCov_9fa48("26438", "26439", "26440"), parseAnalysis(selectedItem).areas_for_improvement.length > 0)))) && <Box mb={3}>
                      <Typography variant="subtitle1" sx={stryMutAct_9fa48("26441") ? {} : (stryCov_9fa48("26441"), {
                  fontWeight: stryMutAct_9fa48("26442") ? "" : (stryCov_9fa48("26442"), 'bold'),
                  mb: 1
                })}>
                        Areas for Improvement:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {parseAnalysis(selectedItem).areas_for_improvement.map(stryMutAct_9fa48("26443") ? () => undefined : (stryCov_9fa48("26443"), (area, idx) => <Chip key={idx} label={area} color="warning" size="small" />))}
                      </Box>
                    </Box>)}
                  
                  {/* Specific Findings */}
                  {stryMutAct_9fa48("26446") ? parseAnalysis(selectedItem).specific_findings || <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Specific Findings:
                      </Typography>
                      
                      {/* Comprehension Section - handle both cases: lowercase and uppercase 'c' */}
                      {(parseAnalysis(selectedItem).specific_findings.comprehension || parseAnalysis(selectedItem).specific_findings.Comprehension) && <Box mb={2}>
                          <Typography variant="subtitle2" sx={{
                    fontWeight: 'bold',
                    mt: 2
                  }}>
                            Comprehension:
                          </Typography>
                          
                          {/* Display Comprehension Score if available */}
                          {(parseAnalysis(selectedItem).specific_findings.comprehension?.score || parseAnalysis(selectedItem).specific_findings.Comprehension?.score) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Score: {parseAnalysis(selectedItem).specific_findings.comprehension?.score || parseAnalysis(selectedItem).specific_findings.Comprehension?.score}
                              </Typography>
                            </Box>}
                          
                          {/* Get strengths from either case version */}
                          {(parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths) ? (parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths).map((strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths}
                                  </Typography>}
                              </Box>
                            </Box>}
                          
                          {/* Get weaknesses from either case version */}
                          {(parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses) ? (parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses).map((weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box>}
                        </Box>}
                      
                      {/* Business Value Section - keep existing code but make the check case-insensitive */}
                      {(parseAnalysis(selectedItem).specific_findings.business_value || parseAnalysis(selectedItem).specific_findings.Business_value || parseAnalysis(selectedItem).specific_findings['Business Value']) && <Box mb={2}>
                          <Typography variant="subtitle2" sx={{
                    fontWeight: 'bold',
                    mt: 2
                  }}>
                            Business Value:
                          </Typography>
                          
                          {/* Display Business Value Score if available */}
                          {(parseAnalysis(selectedItem).specific_findings.business_value?.score || parseAnalysis(selectedItem).specific_findings.Business_value?.score || parseAnalysis(selectedItem).specific_findings['Business Value']?.score) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Score: {parseAnalysis(selectedItem).specific_findings.business_value?.score || parseAnalysis(selectedItem).specific_findings.Business_value?.score || parseAnalysis(selectedItem).specific_findings['Business Value']?.score}
                              </Typography>
                            </Box>}
                          
                          {/* Use the first available property for strengths */}
                          {(parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths) ? (parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths).map((strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths}
                                  </Typography>}
                              </Box>
                            </Box>}
                          
                          {/* Use the first available property for weaknesses */}
                          {(parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses) ? (parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses).map((weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box>}
                        </Box>}
                      
                      {/* Professional Skills Section - keep existing code but make the check case-insensitive */}
                      {(parseAnalysis(selectedItem).specific_findings.professional_skills || parseAnalysis(selectedItem).specific_findings.Professional_skills || parseAnalysis(selectedItem).specific_findings['Professional Skills']) && <Box mb={2}>
                          <Typography variant="subtitle2" sx={{
                    fontWeight: 'bold',
                    mt: 2
                  }}>
                            Professional Skills:
                          </Typography>
                          
                          {/* Display Professional Skills Score if available */}
                          {(parseAnalysis(selectedItem).specific_findings.professional_skills?.score || parseAnalysis(selectedItem).specific_findings.Professional_skills?.score || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.score) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Score: {parseAnalysis(selectedItem).specific_findings.professional_skills?.score || parseAnalysis(selectedItem).specific_findings.Professional_skills?.score || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.score}
                              </Typography>
                            </Box>}
                          
                          {/* Use the first available property for strengths */}
                          {(parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths) ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths).map((strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths}
                                  </Typography>}
                              </Box>
                            </Box>}
                          
                          {/* Use the first available property for weaknesses */}
                          {(parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses) ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses).map((weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box>}
                        </Box>}
                      
                      {/* Display AI Generation Information if available */}
                      {(parseAnalysis(selectedItem).ai_generated_likelihood || parseAnalysis(selectedItem).ai_detection_reasoning) && <Box mb={2}>
                          <Typography variant="subtitle2" sx={{
                    fontWeight: 'bold',
                    mt: 2
                  }}>
                            AI Detection:
                          </Typography>
                          
                          {parseAnalysis(selectedItem).ai_generated_likelihood && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                AI Generated Likelihood:
                              </Typography>
                              <Typography variant="body2">
                                {parseAnalysis(selectedItem).ai_generated_likelihood}
                              </Typography>
                            </Box>}
                          
                          {parseAnalysis(selectedItem).ai_detection_reasoning && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Reasoning:
                              </Typography>
                              <Typography variant="body2">
                                {parseAnalysis(selectedItem).ai_detection_reasoning}
                              </Typography>
                            </Box>}
                        </Box>}
                    </Box> : stryMutAct_9fa48("26445") ? false : stryMutAct_9fa48("26444") ? true : (stryCov_9fa48("26444", "26445", "26446"), parseAnalysis(selectedItem).specific_findings && <Box mb={3}>
                      <Typography variant="subtitle1" sx={stryMutAct_9fa48("26447") ? {} : (stryCov_9fa48("26447"), {
                  fontWeight: stryMutAct_9fa48("26448") ? "" : (stryCov_9fa48("26448"), 'bold'),
                  mb: 1
                })}>
                        Specific Findings:
                      </Typography>
                      
                      {/* Comprehension Section - handle both cases: lowercase and uppercase 'c' */}
                      {stryMutAct_9fa48("26451") ? parseAnalysis(selectedItem).specific_findings.comprehension || parseAnalysis(selectedItem).specific_findings.Comprehension || <Box mb={2}>
                          <Typography variant="subtitle2" sx={{
                    fontWeight: 'bold',
                    mt: 2
                  }}>
                            Comprehension:
                          </Typography>
                          
                          {/* Display Comprehension Score if available */}
                          {(parseAnalysis(selectedItem).specific_findings.comprehension?.score || parseAnalysis(selectedItem).specific_findings.Comprehension?.score) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Score: {parseAnalysis(selectedItem).specific_findings.comprehension?.score || parseAnalysis(selectedItem).specific_findings.Comprehension?.score}
                              </Typography>
                            </Box>}
                          
                          {/* Get strengths from either case version */}
                          {(parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths) ? (parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths).map((strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths}
                                  </Typography>}
                              </Box>
                            </Box>}
                          
                          {/* Get weaknesses from either case version */}
                          {(parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses) ? (parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses).map((weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box>}
                        </Box> : stryMutAct_9fa48("26450") ? false : stryMutAct_9fa48("26449") ? true : (stryCov_9fa48("26449", "26450", "26451"), (stryMutAct_9fa48("26453") ? parseAnalysis(selectedItem).specific_findings.comprehension && parseAnalysis(selectedItem).specific_findings.Comprehension : stryMutAct_9fa48("26452") ? true : (stryCov_9fa48("26452", "26453"), parseAnalysis(selectedItem).specific_findings.comprehension || parseAnalysis(selectedItem).specific_findings.Comprehension)) && <Box mb={2}>
                          <Typography variant="subtitle2" sx={stryMutAct_9fa48("26454") ? {} : (stryCov_9fa48("26454"), {
                    fontWeight: stryMutAct_9fa48("26455") ? "" : (stryCov_9fa48("26455"), 'bold'),
                    mt: 2
                  })}>
                            Comprehension:
                          </Typography>
                          
                          {/* Display Comprehension Score if available */}
                          {stryMutAct_9fa48("26458") ? parseAnalysis(selectedItem).specific_findings.comprehension?.score || parseAnalysis(selectedItem).specific_findings.Comprehension?.score || <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Score: {parseAnalysis(selectedItem).specific_findings.comprehension?.score || parseAnalysis(selectedItem).specific_findings.Comprehension?.score}
                              </Typography>
                            </Box> : stryMutAct_9fa48("26457") ? false : stryMutAct_9fa48("26456") ? true : (stryCov_9fa48("26456", "26457", "26458"), (stryMutAct_9fa48("26460") ? parseAnalysis(selectedItem).specific_findings.comprehension?.score && parseAnalysis(selectedItem).specific_findings.Comprehension?.score : stryMutAct_9fa48("26459") ? true : (stryCov_9fa48("26459", "26460"), (stryMutAct_9fa48("26461") ? parseAnalysis(selectedItem).specific_findings.comprehension.score : (stryCov_9fa48("26461"), parseAnalysis(selectedItem).specific_findings.comprehension?.score)) || (stryMutAct_9fa48("26462") ? parseAnalysis(selectedItem).specific_findings.Comprehension.score : (stryCov_9fa48("26462"), parseAnalysis(selectedItem).specific_findings.Comprehension?.score)))) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={stryMutAct_9fa48("26463") ? {} : (stryCov_9fa48("26463"), {
                      fontWeight: stryMutAct_9fa48("26464") ? "" : (stryCov_9fa48("26464"), 'bold')
                    })}>
                                Score: {stryMutAct_9fa48("26467") ? parseAnalysis(selectedItem).specific_findings.comprehension?.score && parseAnalysis(selectedItem).specific_findings.Comprehension?.score : stryMutAct_9fa48("26466") ? false : stryMutAct_9fa48("26465") ? true : (stryCov_9fa48("26465", "26466", "26467"), (stryMutAct_9fa48("26468") ? parseAnalysis(selectedItem).specific_findings.comprehension.score : (stryCov_9fa48("26468"), parseAnalysis(selectedItem).specific_findings.comprehension?.score)) || (stryMutAct_9fa48("26469") ? parseAnalysis(selectedItem).specific_findings.Comprehension.score : (stryCov_9fa48("26469"), parseAnalysis(selectedItem).specific_findings.Comprehension?.score)))}
                              </Typography>
                            </Box>)}
                          
                          {/* Get strengths from either case version */}
                          {stryMutAct_9fa48("26472") ? parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths || <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths) ? (parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths).map((strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths}
                                  </Typography>}
                              </Box>
                            </Box> : stryMutAct_9fa48("26471") ? false : stryMutAct_9fa48("26470") ? true : (stryCov_9fa48("26470", "26471", "26472"), (stryMutAct_9fa48("26474") ? parseAnalysis(selectedItem).specific_findings.comprehension?.strengths && parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths : stryMutAct_9fa48("26473") ? true : (stryCov_9fa48("26473", "26474"), (stryMutAct_9fa48("26475") ? parseAnalysis(selectedItem).specific_findings.comprehension.strengths : (stryCov_9fa48("26475"), parseAnalysis(selectedItem).specific_findings.comprehension?.strengths)) || (stryMutAct_9fa48("26476") ? parseAnalysis(selectedItem).specific_findings.Comprehension.strengths : (stryCov_9fa48("26476"), parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths)))) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={stryMutAct_9fa48("26477") ? {} : (stryCov_9fa48("26477"), {
                      fontWeight: stryMutAct_9fa48("26478") ? "" : (stryCov_9fa48("26478"), 'bold')
                    })}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={stryMutAct_9fa48("26479") ? {} : (stryCov_9fa48("26479"), {
                      mt: 0.5,
                      pl: 2
                    })}>
                                {Array.isArray(stryMutAct_9fa48("26482") ? parseAnalysis(selectedItem).specific_findings.comprehension?.strengths && parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths : stryMutAct_9fa48("26481") ? false : stryMutAct_9fa48("26480") ? true : (stryCov_9fa48("26480", "26481", "26482"), (stryMutAct_9fa48("26483") ? parseAnalysis(selectedItem).specific_findings.comprehension.strengths : (stryCov_9fa48("26483"), parseAnalysis(selectedItem).specific_findings.comprehension?.strengths)) || (stryMutAct_9fa48("26484") ? parseAnalysis(selectedItem).specific_findings.Comprehension.strengths : (stryCov_9fa48("26484"), parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths)))) ? (stryMutAct_9fa48("26487") ? parseAnalysis(selectedItem).specific_findings.comprehension?.strengths && parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths : stryMutAct_9fa48("26486") ? false : stryMutAct_9fa48("26485") ? true : (stryCov_9fa48("26485", "26486", "26487"), (stryMutAct_9fa48("26488") ? parseAnalysis(selectedItem).specific_findings.comprehension.strengths : (stryCov_9fa48("26488"), parseAnalysis(selectedItem).specific_findings.comprehension?.strengths)) || (stryMutAct_9fa48("26489") ? parseAnalysis(selectedItem).specific_findings.Comprehension.strengths : (stryCov_9fa48("26489"), parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths)))).map(stryMutAct_9fa48("26490") ? () => undefined : (stryCov_9fa48("26490"), (strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>)) : <Typography component="li" variant="body2">
                                    {stryMutAct_9fa48("26493") ? parseAnalysis(selectedItem).specific_findings.comprehension?.strengths && parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths : stryMutAct_9fa48("26492") ? false : stryMutAct_9fa48("26491") ? true : (stryCov_9fa48("26491", "26492", "26493"), (stryMutAct_9fa48("26494") ? parseAnalysis(selectedItem).specific_findings.comprehension.strengths : (stryCov_9fa48("26494"), parseAnalysis(selectedItem).specific_findings.comprehension?.strengths)) || (stryMutAct_9fa48("26495") ? parseAnalysis(selectedItem).specific_findings.Comprehension.strengths : (stryCov_9fa48("26495"), parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths)))}
                                  </Typography>}
                              </Box>
                            </Box>)}
                          
                          {/* Get weaknesses from either case version */}
                          {stryMutAct_9fa48("26498") ? parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses || <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses) ? (parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses).map((weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box> : stryMutAct_9fa48("26497") ? false : stryMutAct_9fa48("26496") ? true : (stryCov_9fa48("26496", "26497", "26498"), (stryMutAct_9fa48("26500") ? parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses && parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses : stryMutAct_9fa48("26499") ? true : (stryCov_9fa48("26499", "26500"), (stryMutAct_9fa48("26501") ? parseAnalysis(selectedItem).specific_findings.comprehension.weaknesses : (stryCov_9fa48("26501"), parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses)) || (stryMutAct_9fa48("26502") ? parseAnalysis(selectedItem).specific_findings.Comprehension.weaknesses : (stryCov_9fa48("26502"), parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses)))) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={stryMutAct_9fa48("26503") ? {} : (stryCov_9fa48("26503"), {
                      fontWeight: stryMutAct_9fa48("26504") ? "" : (stryCov_9fa48("26504"), 'bold')
                    })}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={stryMutAct_9fa48("26505") ? {} : (stryCov_9fa48("26505"), {
                      mt: 0.5,
                      pl: 2
                    })}>
                                {Array.isArray(stryMutAct_9fa48("26508") ? parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses && parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses : stryMutAct_9fa48("26507") ? false : stryMutAct_9fa48("26506") ? true : (stryCov_9fa48("26506", "26507", "26508"), (stryMutAct_9fa48("26509") ? parseAnalysis(selectedItem).specific_findings.comprehension.weaknesses : (stryCov_9fa48("26509"), parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses)) || (stryMutAct_9fa48("26510") ? parseAnalysis(selectedItem).specific_findings.Comprehension.weaknesses : (stryCov_9fa48("26510"), parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses)))) ? (stryMutAct_9fa48("26513") ? parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses && parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses : stryMutAct_9fa48("26512") ? false : stryMutAct_9fa48("26511") ? true : (stryCov_9fa48("26511", "26512", "26513"), (stryMutAct_9fa48("26514") ? parseAnalysis(selectedItem).specific_findings.comprehension.weaknesses : (stryCov_9fa48("26514"), parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses)) || (stryMutAct_9fa48("26515") ? parseAnalysis(selectedItem).specific_findings.Comprehension.weaknesses : (stryCov_9fa48("26515"), parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses)))).map(stryMutAct_9fa48("26516") ? () => undefined : (stryCov_9fa48("26516"), (weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>)) : <Typography component="li" variant="body2">
                                    {stryMutAct_9fa48("26519") ? parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses && parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses : stryMutAct_9fa48("26518") ? false : stryMutAct_9fa48("26517") ? true : (stryCov_9fa48("26517", "26518", "26519"), (stryMutAct_9fa48("26520") ? parseAnalysis(selectedItem).specific_findings.comprehension.weaknesses : (stryCov_9fa48("26520"), parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses)) || (stryMutAct_9fa48("26521") ? parseAnalysis(selectedItem).specific_findings.Comprehension.weaknesses : (stryCov_9fa48("26521"), parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses)))}
                                  </Typography>}
                              </Box>
                            </Box>)}
                        </Box>)}
                      
                      {/* Business Value Section - keep existing code but make the check case-insensitive */}
                      {stryMutAct_9fa48("26524") ? parseAnalysis(selectedItem).specific_findings.business_value || parseAnalysis(selectedItem).specific_findings.Business_value || parseAnalysis(selectedItem).specific_findings['Business Value'] || <Box mb={2}>
                          <Typography variant="subtitle2" sx={{
                    fontWeight: 'bold',
                    mt: 2
                  }}>
                            Business Value:
                          </Typography>
                          
                          {/* Display Business Value Score if available */}
                          {(parseAnalysis(selectedItem).specific_findings.business_value?.score || parseAnalysis(selectedItem).specific_findings.Business_value?.score || parseAnalysis(selectedItem).specific_findings['Business Value']?.score) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Score: {parseAnalysis(selectedItem).specific_findings.business_value?.score || parseAnalysis(selectedItem).specific_findings.Business_value?.score || parseAnalysis(selectedItem).specific_findings['Business Value']?.score}
                              </Typography>
                            </Box>}
                          
                          {/* Use the first available property for strengths */}
                          {(parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths) ? (parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths).map((strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths}
                                  </Typography>}
                              </Box>
                            </Box>}
                          
                          {/* Use the first available property for weaknesses */}
                          {(parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses) ? (parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses).map((weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box>}
                        </Box> : stryMutAct_9fa48("26523") ? false : stryMutAct_9fa48("26522") ? true : (stryCov_9fa48("26522", "26523", "26524"), (stryMutAct_9fa48("26526") ? (parseAnalysis(selectedItem).specific_findings.business_value || parseAnalysis(selectedItem).specific_findings.Business_value) && parseAnalysis(selectedItem).specific_findings['Business Value'] : stryMutAct_9fa48("26525") ? true : (stryCov_9fa48("26525", "26526"), (stryMutAct_9fa48("26528") ? parseAnalysis(selectedItem).specific_findings.business_value && parseAnalysis(selectedItem).specific_findings.Business_value : stryMutAct_9fa48("26527") ? false : (stryCov_9fa48("26527", "26528"), parseAnalysis(selectedItem).specific_findings.business_value || parseAnalysis(selectedItem).specific_findings.Business_value)) || parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26529") ? "" : (stryCov_9fa48("26529"), 'Business Value')])) && <Box mb={2}>
                          <Typography variant="subtitle2" sx={stryMutAct_9fa48("26530") ? {} : (stryCov_9fa48("26530"), {
                    fontWeight: stryMutAct_9fa48("26531") ? "" : (stryCov_9fa48("26531"), 'bold'),
                    mt: 2
                  })}>
                            Business Value:
                          </Typography>
                          
                          {/* Display Business Value Score if available */}
                          {stryMutAct_9fa48("26534") ? parseAnalysis(selectedItem).specific_findings.business_value?.score || parseAnalysis(selectedItem).specific_findings.Business_value?.score || parseAnalysis(selectedItem).specific_findings['Business Value']?.score || <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Score: {parseAnalysis(selectedItem).specific_findings.business_value?.score || parseAnalysis(selectedItem).specific_findings.Business_value?.score || parseAnalysis(selectedItem).specific_findings['Business Value']?.score}
                              </Typography>
                            </Box> : stryMutAct_9fa48("26533") ? false : stryMutAct_9fa48("26532") ? true : (stryCov_9fa48("26532", "26533", "26534"), (stryMutAct_9fa48("26536") ? (parseAnalysis(selectedItem).specific_findings.business_value?.score || parseAnalysis(selectedItem).specific_findings.Business_value?.score) && parseAnalysis(selectedItem).specific_findings['Business Value']?.score : stryMutAct_9fa48("26535") ? true : (stryCov_9fa48("26535", "26536"), (stryMutAct_9fa48("26538") ? parseAnalysis(selectedItem).specific_findings.business_value?.score && parseAnalysis(selectedItem).specific_findings.Business_value?.score : stryMutAct_9fa48("26537") ? false : (stryCov_9fa48("26537", "26538"), (stryMutAct_9fa48("26539") ? parseAnalysis(selectedItem).specific_findings.business_value.score : (stryCov_9fa48("26539"), parseAnalysis(selectedItem).specific_findings.business_value?.score)) || (stryMutAct_9fa48("26540") ? parseAnalysis(selectedItem).specific_findings.Business_value.score : (stryCov_9fa48("26540"), parseAnalysis(selectedItem).specific_findings.Business_value?.score)))) || (stryMutAct_9fa48("26541") ? parseAnalysis(selectedItem).specific_findings['Business Value'].score : (stryCov_9fa48("26541"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26542") ? "" : (stryCov_9fa48("26542"), 'Business Value')]?.score)))) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={stryMutAct_9fa48("26543") ? {} : (stryCov_9fa48("26543"), {
                      fontWeight: stryMutAct_9fa48("26544") ? "" : (stryCov_9fa48("26544"), 'bold')
                    })}>
                                Score: {stryMutAct_9fa48("26547") ? (parseAnalysis(selectedItem).specific_findings.business_value?.score || parseAnalysis(selectedItem).specific_findings.Business_value?.score) && parseAnalysis(selectedItem).specific_findings['Business Value']?.score : stryMutAct_9fa48("26546") ? false : stryMutAct_9fa48("26545") ? true : (stryCov_9fa48("26545", "26546", "26547"), (stryMutAct_9fa48("26549") ? parseAnalysis(selectedItem).specific_findings.business_value?.score && parseAnalysis(selectedItem).specific_findings.Business_value?.score : stryMutAct_9fa48("26548") ? false : (stryCov_9fa48("26548", "26549"), (stryMutAct_9fa48("26550") ? parseAnalysis(selectedItem).specific_findings.business_value.score : (stryCov_9fa48("26550"), parseAnalysis(selectedItem).specific_findings.business_value?.score)) || (stryMutAct_9fa48("26551") ? parseAnalysis(selectedItem).specific_findings.Business_value.score : (stryCov_9fa48("26551"), parseAnalysis(selectedItem).specific_findings.Business_value?.score)))) || (stryMutAct_9fa48("26552") ? parseAnalysis(selectedItem).specific_findings['Business Value'].score : (stryCov_9fa48("26552"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26553") ? "" : (stryCov_9fa48("26553"), 'Business Value')]?.score)))}
                              </Typography>
                            </Box>)}
                          
                          {/* Use the first available property for strengths */}
                          {stryMutAct_9fa48("26556") ? parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths || <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths) ? (parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths).map((strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths || parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths}
                                  </Typography>}
                              </Box>
                            </Box> : stryMutAct_9fa48("26555") ? false : stryMutAct_9fa48("26554") ? true : (stryCov_9fa48("26554", "26555", "26556"), (stryMutAct_9fa48("26558") ? (parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths) && parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths : stryMutAct_9fa48("26557") ? true : (stryCov_9fa48("26557", "26558"), (stryMutAct_9fa48("26560") ? parseAnalysis(selectedItem).specific_findings.business_value?.strengths && parseAnalysis(selectedItem).specific_findings.Business_value?.strengths : stryMutAct_9fa48("26559") ? false : (stryCov_9fa48("26559", "26560"), (stryMutAct_9fa48("26561") ? parseAnalysis(selectedItem).specific_findings.business_value.strengths : (stryCov_9fa48("26561"), parseAnalysis(selectedItem).specific_findings.business_value?.strengths)) || (stryMutAct_9fa48("26562") ? parseAnalysis(selectedItem).specific_findings.Business_value.strengths : (stryCov_9fa48("26562"), parseAnalysis(selectedItem).specific_findings.Business_value?.strengths)))) || (stryMutAct_9fa48("26563") ? parseAnalysis(selectedItem).specific_findings['Business Value'].strengths : (stryCov_9fa48("26563"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26564") ? "" : (stryCov_9fa48("26564"), 'Business Value')]?.strengths)))) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={stryMutAct_9fa48("26565") ? {} : (stryCov_9fa48("26565"), {
                      fontWeight: stryMutAct_9fa48("26566") ? "" : (stryCov_9fa48("26566"), 'bold')
                    })}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={stryMutAct_9fa48("26567") ? {} : (stryCov_9fa48("26567"), {
                      mt: 0.5,
                      pl: 2
                    })}>
                                {Array.isArray(stryMutAct_9fa48("26570") ? (parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths) && parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths : stryMutAct_9fa48("26569") ? false : stryMutAct_9fa48("26568") ? true : (stryCov_9fa48("26568", "26569", "26570"), (stryMutAct_9fa48("26572") ? parseAnalysis(selectedItem).specific_findings.business_value?.strengths && parseAnalysis(selectedItem).specific_findings.Business_value?.strengths : stryMutAct_9fa48("26571") ? false : (stryCov_9fa48("26571", "26572"), (stryMutAct_9fa48("26573") ? parseAnalysis(selectedItem).specific_findings.business_value.strengths : (stryCov_9fa48("26573"), parseAnalysis(selectedItem).specific_findings.business_value?.strengths)) || (stryMutAct_9fa48("26574") ? parseAnalysis(selectedItem).specific_findings.Business_value.strengths : (stryCov_9fa48("26574"), parseAnalysis(selectedItem).specific_findings.Business_value?.strengths)))) || (stryMutAct_9fa48("26575") ? parseAnalysis(selectedItem).specific_findings['Business Value'].strengths : (stryCov_9fa48("26575"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26576") ? "" : (stryCov_9fa48("26576"), 'Business Value')]?.strengths)))) ? (stryMutAct_9fa48("26579") ? (parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths) && parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths : stryMutAct_9fa48("26578") ? false : stryMutAct_9fa48("26577") ? true : (stryCov_9fa48("26577", "26578", "26579"), (stryMutAct_9fa48("26581") ? parseAnalysis(selectedItem).specific_findings.business_value?.strengths && parseAnalysis(selectedItem).specific_findings.Business_value?.strengths : stryMutAct_9fa48("26580") ? false : (stryCov_9fa48("26580", "26581"), (stryMutAct_9fa48("26582") ? parseAnalysis(selectedItem).specific_findings.business_value.strengths : (stryCov_9fa48("26582"), parseAnalysis(selectedItem).specific_findings.business_value?.strengths)) || (stryMutAct_9fa48("26583") ? parseAnalysis(selectedItem).specific_findings.Business_value.strengths : (stryCov_9fa48("26583"), parseAnalysis(selectedItem).specific_findings.Business_value?.strengths)))) || (stryMutAct_9fa48("26584") ? parseAnalysis(selectedItem).specific_findings['Business Value'].strengths : (stryCov_9fa48("26584"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26585") ? "" : (stryCov_9fa48("26585"), 'Business Value')]?.strengths)))).map(stryMutAct_9fa48("26586") ? () => undefined : (stryCov_9fa48("26586"), (strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>)) : <Typography component="li" variant="body2">
                                    {stryMutAct_9fa48("26589") ? (parseAnalysis(selectedItem).specific_findings.business_value?.strengths || parseAnalysis(selectedItem).specific_findings.Business_value?.strengths) && parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths : stryMutAct_9fa48("26588") ? false : stryMutAct_9fa48("26587") ? true : (stryCov_9fa48("26587", "26588", "26589"), (stryMutAct_9fa48("26591") ? parseAnalysis(selectedItem).specific_findings.business_value?.strengths && parseAnalysis(selectedItem).specific_findings.Business_value?.strengths : stryMutAct_9fa48("26590") ? false : (stryCov_9fa48("26590", "26591"), (stryMutAct_9fa48("26592") ? parseAnalysis(selectedItem).specific_findings.business_value.strengths : (stryCov_9fa48("26592"), parseAnalysis(selectedItem).specific_findings.business_value?.strengths)) || (stryMutAct_9fa48("26593") ? parseAnalysis(selectedItem).specific_findings.Business_value.strengths : (stryCov_9fa48("26593"), parseAnalysis(selectedItem).specific_findings.Business_value?.strengths)))) || (stryMutAct_9fa48("26594") ? parseAnalysis(selectedItem).specific_findings['Business Value'].strengths : (stryCov_9fa48("26594"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26595") ? "" : (stryCov_9fa48("26595"), 'Business Value')]?.strengths)))}
                                  </Typography>}
                              </Box>
                            </Box>)}
                          
                          {/* Use the first available property for weaknesses */}
                          {stryMutAct_9fa48("26598") ? parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses || <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses) ? (parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses).map((weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box> : stryMutAct_9fa48("26597") ? false : stryMutAct_9fa48("26596") ? true : (stryCov_9fa48("26596", "26597", "26598"), (stryMutAct_9fa48("26600") ? (parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses) && parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses : stryMutAct_9fa48("26599") ? true : (stryCov_9fa48("26599", "26600"), (stryMutAct_9fa48("26602") ? parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses && parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses : stryMutAct_9fa48("26601") ? false : (stryCov_9fa48("26601", "26602"), (stryMutAct_9fa48("26603") ? parseAnalysis(selectedItem).specific_findings.business_value.weaknesses : (stryCov_9fa48("26603"), parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses)) || (stryMutAct_9fa48("26604") ? parseAnalysis(selectedItem).specific_findings.Business_value.weaknesses : (stryCov_9fa48("26604"), parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses)))) || (stryMutAct_9fa48("26605") ? parseAnalysis(selectedItem).specific_findings['Business Value'].weaknesses : (stryCov_9fa48("26605"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26606") ? "" : (stryCov_9fa48("26606"), 'Business Value')]?.weaknesses)))) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={stryMutAct_9fa48("26607") ? {} : (stryCov_9fa48("26607"), {
                      fontWeight: stryMutAct_9fa48("26608") ? "" : (stryCov_9fa48("26608"), 'bold')
                    })}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={stryMutAct_9fa48("26609") ? {} : (stryCov_9fa48("26609"), {
                      mt: 0.5,
                      pl: 2
                    })}>
                                {Array.isArray(stryMutAct_9fa48("26612") ? (parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses) && parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses : stryMutAct_9fa48("26611") ? false : stryMutAct_9fa48("26610") ? true : (stryCov_9fa48("26610", "26611", "26612"), (stryMutAct_9fa48("26614") ? parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses && parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses : stryMutAct_9fa48("26613") ? false : (stryCov_9fa48("26613", "26614"), (stryMutAct_9fa48("26615") ? parseAnalysis(selectedItem).specific_findings.business_value.weaknesses : (stryCov_9fa48("26615"), parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses)) || (stryMutAct_9fa48("26616") ? parseAnalysis(selectedItem).specific_findings.Business_value.weaknesses : (stryCov_9fa48("26616"), parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses)))) || (stryMutAct_9fa48("26617") ? parseAnalysis(selectedItem).specific_findings['Business Value'].weaknesses : (stryCov_9fa48("26617"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26618") ? "" : (stryCov_9fa48("26618"), 'Business Value')]?.weaknesses)))) ? (stryMutAct_9fa48("26621") ? (parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses) && parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses : stryMutAct_9fa48("26620") ? false : stryMutAct_9fa48("26619") ? true : (stryCov_9fa48("26619", "26620", "26621"), (stryMutAct_9fa48("26623") ? parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses && parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses : stryMutAct_9fa48("26622") ? false : (stryCov_9fa48("26622", "26623"), (stryMutAct_9fa48("26624") ? parseAnalysis(selectedItem).specific_findings.business_value.weaknesses : (stryCov_9fa48("26624"), parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses)) || (stryMutAct_9fa48("26625") ? parseAnalysis(selectedItem).specific_findings.Business_value.weaknesses : (stryCov_9fa48("26625"), parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses)))) || (stryMutAct_9fa48("26626") ? parseAnalysis(selectedItem).specific_findings['Business Value'].weaknesses : (stryCov_9fa48("26626"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26627") ? "" : (stryCov_9fa48("26627"), 'Business Value')]?.weaknesses)))).map(stryMutAct_9fa48("26628") ? () => undefined : (stryCov_9fa48("26628"), (weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>)) : <Typography component="li" variant="body2">
                                    {stryMutAct_9fa48("26631") ? (parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses) && parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses : stryMutAct_9fa48("26630") ? false : stryMutAct_9fa48("26629") ? true : (stryCov_9fa48("26629", "26630", "26631"), (stryMutAct_9fa48("26633") ? parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses && parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses : stryMutAct_9fa48("26632") ? false : (stryCov_9fa48("26632", "26633"), (stryMutAct_9fa48("26634") ? parseAnalysis(selectedItem).specific_findings.business_value.weaknesses : (stryCov_9fa48("26634"), parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses)) || (stryMutAct_9fa48("26635") ? parseAnalysis(selectedItem).specific_findings.Business_value.weaknesses : (stryCov_9fa48("26635"), parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses)))) || (stryMutAct_9fa48("26636") ? parseAnalysis(selectedItem).specific_findings['Business Value'].weaknesses : (stryCov_9fa48("26636"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26637") ? "" : (stryCov_9fa48("26637"), 'Business Value')]?.weaknesses)))}
                                  </Typography>}
                              </Box>
                            </Box>)}
                        </Box>)}
                      
                      {/* Professional Skills Section - keep existing code but make the check case-insensitive */}
                      {stryMutAct_9fa48("26640") ? parseAnalysis(selectedItem).specific_findings.professional_skills || parseAnalysis(selectedItem).specific_findings.Professional_skills || parseAnalysis(selectedItem).specific_findings['Professional Skills'] || <Box mb={2}>
                          <Typography variant="subtitle2" sx={{
                    fontWeight: 'bold',
                    mt: 2
                  }}>
                            Professional Skills:
                          </Typography>
                          
                          {/* Display Professional Skills Score if available */}
                          {(parseAnalysis(selectedItem).specific_findings.professional_skills?.score || parseAnalysis(selectedItem).specific_findings.Professional_skills?.score || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.score) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Score: {parseAnalysis(selectedItem).specific_findings.professional_skills?.score || parseAnalysis(selectedItem).specific_findings.Professional_skills?.score || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.score}
                              </Typography>
                            </Box>}
                          
                          {/* Use the first available property for strengths */}
                          {(parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths) ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths).map((strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths}
                                  </Typography>}
                              </Box>
                            </Box>}
                          
                          {/* Use the first available property for weaknesses */}
                          {(parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses) ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses).map((weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box>}
                        </Box> : stryMutAct_9fa48("26639") ? false : stryMutAct_9fa48("26638") ? true : (stryCov_9fa48("26638", "26639", "26640"), (stryMutAct_9fa48("26642") ? (parseAnalysis(selectedItem).specific_findings.professional_skills || parseAnalysis(selectedItem).specific_findings.Professional_skills) && parseAnalysis(selectedItem).specific_findings['Professional Skills'] : stryMutAct_9fa48("26641") ? true : (stryCov_9fa48("26641", "26642"), (stryMutAct_9fa48("26644") ? parseAnalysis(selectedItem).specific_findings.professional_skills && parseAnalysis(selectedItem).specific_findings.Professional_skills : stryMutAct_9fa48("26643") ? false : (stryCov_9fa48("26643", "26644"), parseAnalysis(selectedItem).specific_findings.professional_skills || parseAnalysis(selectedItem).specific_findings.Professional_skills)) || parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26645") ? "" : (stryCov_9fa48("26645"), 'Professional Skills')])) && <Box mb={2}>
                          <Typography variant="subtitle2" sx={stryMutAct_9fa48("26646") ? {} : (stryCov_9fa48("26646"), {
                    fontWeight: stryMutAct_9fa48("26647") ? "" : (stryCov_9fa48("26647"), 'bold'),
                    mt: 2
                  })}>
                            Professional Skills:
                          </Typography>
                          
                          {/* Display Professional Skills Score if available */}
                          {stryMutAct_9fa48("26650") ? parseAnalysis(selectedItem).specific_findings.professional_skills?.score || parseAnalysis(selectedItem).specific_findings.Professional_skills?.score || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.score || <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Score: {parseAnalysis(selectedItem).specific_findings.professional_skills?.score || parseAnalysis(selectedItem).specific_findings.Professional_skills?.score || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.score}
                              </Typography>
                            </Box> : stryMutAct_9fa48("26649") ? false : stryMutAct_9fa48("26648") ? true : (stryCov_9fa48("26648", "26649", "26650"), (stryMutAct_9fa48("26652") ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.score || parseAnalysis(selectedItem).specific_findings.Professional_skills?.score) && parseAnalysis(selectedItem).specific_findings['Professional Skills']?.score : stryMutAct_9fa48("26651") ? true : (stryCov_9fa48("26651", "26652"), (stryMutAct_9fa48("26654") ? parseAnalysis(selectedItem).specific_findings.professional_skills?.score && parseAnalysis(selectedItem).specific_findings.Professional_skills?.score : stryMutAct_9fa48("26653") ? false : (stryCov_9fa48("26653", "26654"), (stryMutAct_9fa48("26655") ? parseAnalysis(selectedItem).specific_findings.professional_skills.score : (stryCov_9fa48("26655"), parseAnalysis(selectedItem).specific_findings.professional_skills?.score)) || (stryMutAct_9fa48("26656") ? parseAnalysis(selectedItem).specific_findings.Professional_skills.score : (stryCov_9fa48("26656"), parseAnalysis(selectedItem).specific_findings.Professional_skills?.score)))) || (stryMutAct_9fa48("26657") ? parseAnalysis(selectedItem).specific_findings['Professional Skills'].score : (stryCov_9fa48("26657"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26658") ? "" : (stryCov_9fa48("26658"), 'Professional Skills')]?.score)))) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={stryMutAct_9fa48("26659") ? {} : (stryCov_9fa48("26659"), {
                      fontWeight: stryMutAct_9fa48("26660") ? "" : (stryCov_9fa48("26660"), 'bold')
                    })}>
                                Score: {stryMutAct_9fa48("26663") ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.score || parseAnalysis(selectedItem).specific_findings.Professional_skills?.score) && parseAnalysis(selectedItem).specific_findings['Professional Skills']?.score : stryMutAct_9fa48("26662") ? false : stryMutAct_9fa48("26661") ? true : (stryCov_9fa48("26661", "26662", "26663"), (stryMutAct_9fa48("26665") ? parseAnalysis(selectedItem).specific_findings.professional_skills?.score && parseAnalysis(selectedItem).specific_findings.Professional_skills?.score : stryMutAct_9fa48("26664") ? false : (stryCov_9fa48("26664", "26665"), (stryMutAct_9fa48("26666") ? parseAnalysis(selectedItem).specific_findings.professional_skills.score : (stryCov_9fa48("26666"), parseAnalysis(selectedItem).specific_findings.professional_skills?.score)) || (stryMutAct_9fa48("26667") ? parseAnalysis(selectedItem).specific_findings.Professional_skills.score : (stryCov_9fa48("26667"), parseAnalysis(selectedItem).specific_findings.Professional_skills?.score)))) || (stryMutAct_9fa48("26668") ? parseAnalysis(selectedItem).specific_findings['Professional Skills'].score : (stryCov_9fa48("26668"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26669") ? "" : (stryCov_9fa48("26669"), 'Professional Skills')]?.score)))}
                              </Typography>
                            </Box>)}
                          
                          {/* Use the first available property for strengths */}
                          {stryMutAct_9fa48("26672") ? parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths || <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths) ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths).map((strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths}
                                  </Typography>}
                              </Box>
                            </Box> : stryMutAct_9fa48("26671") ? false : stryMutAct_9fa48("26670") ? true : (stryCov_9fa48("26670", "26671", "26672"), (stryMutAct_9fa48("26674") ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths) && parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths : stryMutAct_9fa48("26673") ? true : (stryCov_9fa48("26673", "26674"), (stryMutAct_9fa48("26676") ? parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths && parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths : stryMutAct_9fa48("26675") ? false : (stryCov_9fa48("26675", "26676"), (stryMutAct_9fa48("26677") ? parseAnalysis(selectedItem).specific_findings.professional_skills.strengths : (stryCov_9fa48("26677"), parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths)) || (stryMutAct_9fa48("26678") ? parseAnalysis(selectedItem).specific_findings.Professional_skills.strengths : (stryCov_9fa48("26678"), parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths)))) || (stryMutAct_9fa48("26679") ? parseAnalysis(selectedItem).specific_findings['Professional Skills'].strengths : (stryCov_9fa48("26679"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26680") ? "" : (stryCov_9fa48("26680"), 'Professional Skills')]?.strengths)))) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={stryMutAct_9fa48("26681") ? {} : (stryCov_9fa48("26681"), {
                      fontWeight: stryMutAct_9fa48("26682") ? "" : (stryCov_9fa48("26682"), 'bold')
                    })}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={stryMutAct_9fa48("26683") ? {} : (stryCov_9fa48("26683"), {
                      mt: 0.5,
                      pl: 2
                    })}>
                                {Array.isArray(stryMutAct_9fa48("26686") ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths) && parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths : stryMutAct_9fa48("26685") ? false : stryMutAct_9fa48("26684") ? true : (stryCov_9fa48("26684", "26685", "26686"), (stryMutAct_9fa48("26688") ? parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths && parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths : stryMutAct_9fa48("26687") ? false : (stryCov_9fa48("26687", "26688"), (stryMutAct_9fa48("26689") ? parseAnalysis(selectedItem).specific_findings.professional_skills.strengths : (stryCov_9fa48("26689"), parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths)) || (stryMutAct_9fa48("26690") ? parseAnalysis(selectedItem).specific_findings.Professional_skills.strengths : (stryCov_9fa48("26690"), parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths)))) || (stryMutAct_9fa48("26691") ? parseAnalysis(selectedItem).specific_findings['Professional Skills'].strengths : (stryCov_9fa48("26691"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26692") ? "" : (stryCov_9fa48("26692"), 'Professional Skills')]?.strengths)))) ? (stryMutAct_9fa48("26695") ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths) && parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths : stryMutAct_9fa48("26694") ? false : stryMutAct_9fa48("26693") ? true : (stryCov_9fa48("26693", "26694", "26695"), (stryMutAct_9fa48("26697") ? parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths && parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths : stryMutAct_9fa48("26696") ? false : (stryCov_9fa48("26696", "26697"), (stryMutAct_9fa48("26698") ? parseAnalysis(selectedItem).specific_findings.professional_skills.strengths : (stryCov_9fa48("26698"), parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths)) || (stryMutAct_9fa48("26699") ? parseAnalysis(selectedItem).specific_findings.Professional_skills.strengths : (stryCov_9fa48("26699"), parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths)))) || (stryMutAct_9fa48("26700") ? parseAnalysis(selectedItem).specific_findings['Professional Skills'].strengths : (stryCov_9fa48("26700"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26701") ? "" : (stryCov_9fa48("26701"), 'Professional Skills')]?.strengths)))).map(stryMutAct_9fa48("26702") ? () => undefined : (stryCov_9fa48("26702"), (strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>)) : <Typography component="li" variant="body2">
                                    {stryMutAct_9fa48("26705") ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths) && parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths : stryMutAct_9fa48("26704") ? false : stryMutAct_9fa48("26703") ? true : (stryCov_9fa48("26703", "26704", "26705"), (stryMutAct_9fa48("26707") ? parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths && parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths : stryMutAct_9fa48("26706") ? false : (stryCov_9fa48("26706", "26707"), (stryMutAct_9fa48("26708") ? parseAnalysis(selectedItem).specific_findings.professional_skills.strengths : (stryCov_9fa48("26708"), parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths)) || (stryMutAct_9fa48("26709") ? parseAnalysis(selectedItem).specific_findings.Professional_skills.strengths : (stryCov_9fa48("26709"), parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths)))) || (stryMutAct_9fa48("26710") ? parseAnalysis(selectedItem).specific_findings['Professional Skills'].strengths : (stryCov_9fa48("26710"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26711") ? "" : (stryCov_9fa48("26711"), 'Professional Skills')]?.strengths)))}
                                  </Typography>}
                              </Box>
                            </Box>)}
                          
                          {/* Use the first available property for weaknesses */}
                          {stryMutAct_9fa48("26714") ? parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses || <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses) ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses).map((weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box> : stryMutAct_9fa48("26713") ? false : stryMutAct_9fa48("26712") ? true : (stryCov_9fa48("26712", "26713", "26714"), (stryMutAct_9fa48("26716") ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses) && parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses : stryMutAct_9fa48("26715") ? true : (stryCov_9fa48("26715", "26716"), (stryMutAct_9fa48("26718") ? parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses && parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses : stryMutAct_9fa48("26717") ? false : (stryCov_9fa48("26717", "26718"), (stryMutAct_9fa48("26719") ? parseAnalysis(selectedItem).specific_findings.professional_skills.weaknesses : (stryCov_9fa48("26719"), parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses)) || (stryMutAct_9fa48("26720") ? parseAnalysis(selectedItem).specific_findings.Professional_skills.weaknesses : (stryCov_9fa48("26720"), parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses)))) || (stryMutAct_9fa48("26721") ? parseAnalysis(selectedItem).specific_findings['Professional Skills'].weaknesses : (stryCov_9fa48("26721"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26722") ? "" : (stryCov_9fa48("26722"), 'Professional Skills')]?.weaknesses)))) && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={stryMutAct_9fa48("26723") ? {} : (stryCov_9fa48("26723"), {
                      fontWeight: stryMutAct_9fa48("26724") ? "" : (stryCov_9fa48("26724"), 'bold')
                    })}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={stryMutAct_9fa48("26725") ? {} : (stryCov_9fa48("26725"), {
                      mt: 0.5,
                      pl: 2
                    })}>
                                {Array.isArray(stryMutAct_9fa48("26728") ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses) && parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses : stryMutAct_9fa48("26727") ? false : stryMutAct_9fa48("26726") ? true : (stryCov_9fa48("26726", "26727", "26728"), (stryMutAct_9fa48("26730") ? parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses && parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses : stryMutAct_9fa48("26729") ? false : (stryCov_9fa48("26729", "26730"), (stryMutAct_9fa48("26731") ? parseAnalysis(selectedItem).specific_findings.professional_skills.weaknesses : (stryCov_9fa48("26731"), parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses)) || (stryMutAct_9fa48("26732") ? parseAnalysis(selectedItem).specific_findings.Professional_skills.weaknesses : (stryCov_9fa48("26732"), parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses)))) || (stryMutAct_9fa48("26733") ? parseAnalysis(selectedItem).specific_findings['Professional Skills'].weaknesses : (stryCov_9fa48("26733"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26734") ? "" : (stryCov_9fa48("26734"), 'Professional Skills')]?.weaknesses)))) ? (stryMutAct_9fa48("26737") ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses) && parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses : stryMutAct_9fa48("26736") ? false : stryMutAct_9fa48("26735") ? true : (stryCov_9fa48("26735", "26736", "26737"), (stryMutAct_9fa48("26739") ? parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses && parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses : stryMutAct_9fa48("26738") ? false : (stryCov_9fa48("26738", "26739"), (stryMutAct_9fa48("26740") ? parseAnalysis(selectedItem).specific_findings.professional_skills.weaknesses : (stryCov_9fa48("26740"), parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses)) || (stryMutAct_9fa48("26741") ? parseAnalysis(selectedItem).specific_findings.Professional_skills.weaknesses : (stryCov_9fa48("26741"), parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses)))) || (stryMutAct_9fa48("26742") ? parseAnalysis(selectedItem).specific_findings['Professional Skills'].weaknesses : (stryCov_9fa48("26742"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26743") ? "" : (stryCov_9fa48("26743"), 'Professional Skills')]?.weaknesses)))).map(stryMutAct_9fa48("26744") ? () => undefined : (stryCov_9fa48("26744"), (weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>)) : <Typography component="li" variant="body2">
                                    {stryMutAct_9fa48("26747") ? (parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses) && parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses : stryMutAct_9fa48("26746") ? false : stryMutAct_9fa48("26745") ? true : (stryCov_9fa48("26745", "26746", "26747"), (stryMutAct_9fa48("26749") ? parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses && parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses : stryMutAct_9fa48("26748") ? false : (stryCov_9fa48("26748", "26749"), (stryMutAct_9fa48("26750") ? parseAnalysis(selectedItem).specific_findings.professional_skills.weaknesses : (stryCov_9fa48("26750"), parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses)) || (stryMutAct_9fa48("26751") ? parseAnalysis(selectedItem).specific_findings.Professional_skills.weaknesses : (stryCov_9fa48("26751"), parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses)))) || (stryMutAct_9fa48("26752") ? parseAnalysis(selectedItem).specific_findings['Professional Skills'].weaknesses : (stryCov_9fa48("26752"), parseAnalysis(selectedItem).specific_findings[stryMutAct_9fa48("26753") ? "" : (stryCov_9fa48("26753"), 'Professional Skills')]?.weaknesses)))}
                                  </Typography>}
                              </Box>
                            </Box>)}
                        </Box>)}
                      
                      {/* Display AI Generation Information if available */}
                      {stryMutAct_9fa48("26756") ? parseAnalysis(selectedItem).ai_generated_likelihood || parseAnalysis(selectedItem).ai_detection_reasoning || <Box mb={2}>
                          <Typography variant="subtitle2" sx={{
                    fontWeight: 'bold',
                    mt: 2
                  }}>
                            AI Detection:
                          </Typography>
                          
                          {parseAnalysis(selectedItem).ai_generated_likelihood && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                AI Generated Likelihood:
                              </Typography>
                              <Typography variant="body2">
                                {parseAnalysis(selectedItem).ai_generated_likelihood}
                              </Typography>
                            </Box>}
                          
                          {parseAnalysis(selectedItem).ai_detection_reasoning && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Reasoning:
                              </Typography>
                              <Typography variant="body2">
                                {parseAnalysis(selectedItem).ai_detection_reasoning}
                              </Typography>
                            </Box>}
                        </Box> : stryMutAct_9fa48("26755") ? false : stryMutAct_9fa48("26754") ? true : (stryCov_9fa48("26754", "26755", "26756"), (stryMutAct_9fa48("26758") ? parseAnalysis(selectedItem).ai_generated_likelihood && parseAnalysis(selectedItem).ai_detection_reasoning : stryMutAct_9fa48("26757") ? true : (stryCov_9fa48("26757", "26758"), parseAnalysis(selectedItem).ai_generated_likelihood || parseAnalysis(selectedItem).ai_detection_reasoning)) && <Box mb={2}>
                          <Typography variant="subtitle2" sx={stryMutAct_9fa48("26759") ? {} : (stryCov_9fa48("26759"), {
                    fontWeight: stryMutAct_9fa48("26760") ? "" : (stryCov_9fa48("26760"), 'bold'),
                    mt: 2
                  })}>
                            AI Detection:
                          </Typography>
                          
                          {stryMutAct_9fa48("26763") ? parseAnalysis(selectedItem).ai_generated_likelihood || <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                AI Generated Likelihood:
                              </Typography>
                              <Typography variant="body2">
                                {parseAnalysis(selectedItem).ai_generated_likelihood}
                              </Typography>
                            </Box> : stryMutAct_9fa48("26762") ? false : stryMutAct_9fa48("26761") ? true : (stryCov_9fa48("26761", "26762", "26763"), parseAnalysis(selectedItem).ai_generated_likelihood && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={stryMutAct_9fa48("26764") ? {} : (stryCov_9fa48("26764"), {
                      fontWeight: stryMutAct_9fa48("26765") ? "" : (stryCov_9fa48("26765"), 'bold')
                    })}>
                                AI Generated Likelihood:
                              </Typography>
                              <Typography variant="body2">
                                {parseAnalysis(selectedItem).ai_generated_likelihood}
                              </Typography>
                            </Box>)}
                          
                          {stryMutAct_9fa48("26768") ? parseAnalysis(selectedItem).ai_detection_reasoning || <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Reasoning:
                              </Typography>
                              <Typography variant="body2">
                                {parseAnalysis(selectedItem).ai_detection_reasoning}
                              </Typography>
                            </Box> : stryMutAct_9fa48("26767") ? false : stryMutAct_9fa48("26766") ? true : (stryCov_9fa48("26766", "26767", "26768"), parseAnalysis(selectedItem).ai_detection_reasoning && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={stryMutAct_9fa48("26769") ? {} : (stryCov_9fa48("26769"), {
                      fontWeight: stryMutAct_9fa48("26770") ? "" : (stryCov_9fa48("26770"), 'bold')
                    })}>
                                Reasoning:
                              </Typography>
                              <Typography variant="body2">
                                {parseAnalysis(selectedItem).ai_detection_reasoning}
                              </Typography>
                            </Box>)}
                        </Box>)}
                    </Box>)}
                </Box>)}
            </>)}
        </Box>
      </Modal>
    </Box>;
  }
};
export default ComprehensionSection;