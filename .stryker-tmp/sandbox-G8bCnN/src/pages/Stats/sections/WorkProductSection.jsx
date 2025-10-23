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
import { Box, Typography, Paper, CircularProgress, Divider, Grid, Button, Modal, Card, CardContent, CardActions, Chip, Link, IconButton } from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import { fetchExternalWorkProduct } from '../../../utils/statsApi';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import MonthFilter from '../../../components/MonthFilter';
import AITrendAnalysis from '../../../components/AITrendAnalysis';
const WorkProductSection = ({
  cohortMonth
}) => {
  if (stryMutAct_9fa48("27410")) {
    {}
  } else {
    stryCov_9fa48("27410");
    const {
      user,
      token
    } = useAuth();
    const [workProductData, setWorkProductData] = useState(stryMutAct_9fa48("27411") ? ["Stryker was here"] : (stryCov_9fa48("27411"), []));
    const [loading, setLoading] = useState(stryMutAct_9fa48("27412") ? false : (stryCov_9fa48("27412"), true));
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalOpen, setModalOpen] = useState(stryMutAct_9fa48("27413") ? true : (stryCov_9fa48("27413"), false));
    const [selectedMonth, setSelectedMonth] = useState(stryMutAct_9fa48("27414") ? "" : (stryCov_9fa48("27414"), 'all'));

    // Filter out entries with technical errors
    const filterOutErrors = data => {
      if (stryMutAct_9fa48("27415")) {
        {}
      } else {
        stryCov_9fa48("27415");
        if (stryMutAct_9fa48("27418") ? false : stryMutAct_9fa48("27417") ? true : stryMutAct_9fa48("27416") ? Array.isArray(data) : (stryCov_9fa48("27416", "27417", "27418"), !Array.isArray(data))) return data;
        return stryMutAct_9fa48("27419") ? data : (stryCov_9fa48("27419"), data.filter(item => {
          if (stryMutAct_9fa48("27420")) {
            {}
          } else {
            stryCov_9fa48("27420");
            try {
              if (stryMutAct_9fa48("27421")) {
                {}
              } else {
                stryCov_9fa48("27421");
                const analysis = parseAnalysis(item);
                if (stryMutAct_9fa48("27424") ? false : stryMutAct_9fa48("27423") ? true : stryMutAct_9fa48("27422") ? analysis : (stryCov_9fa48("27422", "27423", "27424"), !analysis)) return stryMutAct_9fa48("27425") ? false : (stryCov_9fa48("27425"), true); // Keep items without analysis

                // Check areas_for_improvement for technical error messages
                if (stryMutAct_9fa48("27428") ? analysis.areas_for_improvement || Array.isArray(analysis.areas_for_improvement) : stryMutAct_9fa48("27427") ? false : stryMutAct_9fa48("27426") ? true : (stryCov_9fa48("27426", "27427", "27428"), analysis.areas_for_improvement && Array.isArray(analysis.areas_for_improvement))) {
                  if (stryMutAct_9fa48("27429")) {
                    {}
                  } else {
                    stryCov_9fa48("27429");
                    const hasError = stryMutAct_9fa48("27430") ? analysis.areas_for_improvement.every(area => typeof area === 'string' && area.toLowerCase().includes('technical issue') && area.toLowerCase().includes('try again')) : (stryCov_9fa48("27430"), analysis.areas_for_improvement.some(stryMutAct_9fa48("27431") ? () => undefined : (stryCov_9fa48("27431"), area => stryMutAct_9fa48("27434") ? typeof area === 'string' && area.toLowerCase().includes('technical issue') || area.toLowerCase().includes('try again') : stryMutAct_9fa48("27433") ? false : stryMutAct_9fa48("27432") ? true : (stryCov_9fa48("27432", "27433", "27434"), (stryMutAct_9fa48("27436") ? typeof area === 'string' || area.toLowerCase().includes('technical issue') : stryMutAct_9fa48("27435") ? true : (stryCov_9fa48("27435", "27436"), (stryMutAct_9fa48("27438") ? typeof area !== 'string' : stryMutAct_9fa48("27437") ? true : (stryCov_9fa48("27437", "27438"), typeof area === (stryMutAct_9fa48("27439") ? "" : (stryCov_9fa48("27439"), 'string')))) && (stryMutAct_9fa48("27440") ? area.toUpperCase().includes('technical issue') : (stryCov_9fa48("27440"), area.toLowerCase().includes(stryMutAct_9fa48("27441") ? "" : (stryCov_9fa48("27441"), 'technical issue')))))) && (stryMutAct_9fa48("27442") ? area.toUpperCase().includes('try again') : (stryCov_9fa48("27442"), area.toLowerCase().includes(stryMutAct_9fa48("27443") ? "" : (stryCov_9fa48("27443"), 'try again'))))))));
                    if (stryMutAct_9fa48("27445") ? false : stryMutAct_9fa48("27444") ? true : (stryCov_9fa48("27444", "27445"), hasError)) return stryMutAct_9fa48("27446") ? true : (stryCov_9fa48("27446"), false); // Filter out this item
                  }
                }

                // Check feedback for technical error messages
                if (stryMutAct_9fa48("27449") ? analysis.feedback || typeof analysis.feedback === 'string' : stryMutAct_9fa48("27448") ? false : stryMutAct_9fa48("27447") ? true : (stryCov_9fa48("27447", "27448", "27449"), analysis.feedback && (stryMutAct_9fa48("27451") ? typeof analysis.feedback !== 'string' : stryMutAct_9fa48("27450") ? true : (stryCov_9fa48("27450", "27451"), typeof analysis.feedback === (stryMutAct_9fa48("27452") ? "" : (stryCov_9fa48("27452"), 'string')))))) {
                  if (stryMutAct_9fa48("27453")) {
                    {}
                  } else {
                    stryCov_9fa48("27453");
                    const hasError = stryMutAct_9fa48("27456") ? analysis.feedback.toLowerCase().includes('technical issue') || analysis.feedback.toLowerCase().includes('try again') : stryMutAct_9fa48("27455") ? false : stryMutAct_9fa48("27454") ? true : (stryCov_9fa48("27454", "27455", "27456"), (stryMutAct_9fa48("27457") ? analysis.feedback.toUpperCase().includes('technical issue') : (stryCov_9fa48("27457"), analysis.feedback.toLowerCase().includes(stryMutAct_9fa48("27458") ? "" : (stryCov_9fa48("27458"), 'technical issue')))) && (stryMutAct_9fa48("27459") ? analysis.feedback.toUpperCase().includes('try again') : (stryCov_9fa48("27459"), analysis.feedback.toLowerCase().includes(stryMutAct_9fa48("27460") ? "" : (stryCov_9fa48("27460"), 'try again')))));
                    if (stryMutAct_9fa48("27462") ? false : stryMutAct_9fa48("27461") ? true : (stryCov_9fa48("27461", "27462"), hasError)) return stryMutAct_9fa48("27463") ? true : (stryCov_9fa48("27463"), false); // Filter out this item
                  }
                }
                return stryMutAct_9fa48("27464") ? false : (stryCov_9fa48("27464"), true); // Keep this item
              }
            } catch (err) {
              if (stryMutAct_9fa48("27465")) {
                {}
              } else {
                stryCov_9fa48("27465");
                console.error(stryMutAct_9fa48("27466") ? "" : (stryCov_9fa48("27466"), 'Error checking for technical errors:'), err);
                return stryMutAct_9fa48("27467") ? false : (stryCov_9fa48("27467"), true); // Keep item if we can't parse it
              }
            }
          }
        }));
      }
    };
    useEffect(() => {
      if (stryMutAct_9fa48("27468")) {
        {}
      } else {
        stryCov_9fa48("27468");
        const loadWorkProductData = async () => {
          if (stryMutAct_9fa48("27469")) {
            {}
          } else {
            stryCov_9fa48("27469");
            try {
              if (stryMutAct_9fa48("27470")) {
                {}
              } else {
                stryCov_9fa48("27470");
                console.log(stryMutAct_9fa48("27471") ? "" : (stryCov_9fa48("27471"), 'Starting to fetch work product data...'));
                setLoading(stryMutAct_9fa48("27472") ? false : (stryCov_9fa48("27472"), true));

                // Debug what's in the auth context
                console.log(stryMutAct_9fa48("27473") ? "" : (stryCov_9fa48("27473"), 'Auth context user:'), user);
                console.log(stryMutAct_9fa48("27474") ? "" : (stryCov_9fa48("27474"), 'Cohort month:'), cohortMonth);

                // Extract user ID from auth context
                const userId = stryMutAct_9fa48("27477") ? user?.user_id && 17 : stryMutAct_9fa48("27476") ? false : stryMutAct_9fa48("27475") ? true : (stryCov_9fa48("27475", "27476", "27477"), (stryMutAct_9fa48("27478") ? user.user_id : (stryCov_9fa48("27478"), user?.user_id)) || 17); // Use user_id from context or fallback to 17
                console.log(stryMutAct_9fa48("27479") ? "" : (stryCov_9fa48("27479"), 'Using user ID:'), userId);
                const data = await fetchExternalWorkProduct(userId, selectedMonth);
                console.log(stryMutAct_9fa48("27480") ? "" : (stryCov_9fa48("27480"), 'Received external work product data:'), data);

                // Filter out entries with technical errors
                const filteredData = filterOutErrors(data);
                console.log(stryMutAct_9fa48("27481") ? "" : (stryCov_9fa48("27481"), 'Filtered work product data (removed errors):'), filteredData);
                setWorkProductData(filteredData);
                setError(null);
              }
            } catch (err) {
              if (stryMutAct_9fa48("27482")) {
                {}
              } else {
                stryCov_9fa48("27482");
                console.error(stryMutAct_9fa48("27483") ? "" : (stryCov_9fa48("27483"), 'Failed to fetch work product data:'), err);
                setError(stryMutAct_9fa48("27486") ? err.message && 'Failed to load work product data' : stryMutAct_9fa48("27485") ? false : stryMutAct_9fa48("27484") ? true : (stryCov_9fa48("27484", "27485", "27486"), err.message || (stryMutAct_9fa48("27487") ? "" : (stryCov_9fa48("27487"), 'Failed to load work product data'))));
              }
            } finally {
              if (stryMutAct_9fa48("27488")) {
                {}
              } else {
                stryCov_9fa48("27488");
                setLoading(stryMutAct_9fa48("27489") ? true : (stryCov_9fa48("27489"), false));
              }
            }
          }
        };
        loadWorkProductData();
      }
    }, stryMutAct_9fa48("27490") ? [] : (stryCov_9fa48("27490"), [user, token, selectedMonth, cohortMonth]));
    const handleMonthChange = month => {
      if (stryMutAct_9fa48("27491")) {
        {}
      } else {
        stryCov_9fa48("27491");
        setSelectedMonth(month);
      }
    };
    const handleOpenModal = item => {
      if (stryMutAct_9fa48("27492")) {
        {}
      } else {
        stryCov_9fa48("27492");
        setSelectedItem(item);
        setModalOpen(stryMutAct_9fa48("27493") ? false : (stryCov_9fa48("27493"), true));
      }
    };
    const handleCloseModal = () => {
      if (stryMutAct_9fa48("27494")) {
        {}
      } else {
        stryCov_9fa48("27494");
        setModalOpen(stryMutAct_9fa48("27495") ? true : (stryCov_9fa48("27495"), false));
      }
    };
    const formatDate = dateString => {
      if (stryMutAct_9fa48("27496")) {
        {}
      } else {
        stryCov_9fa48("27496");
        if (stryMutAct_9fa48("27499") ? false : stryMutAct_9fa48("27498") ? true : stryMutAct_9fa48("27497") ? dateString : (stryCov_9fa48("27497", "27498", "27499"), !dateString)) return stryMutAct_9fa48("27500") ? "" : (stryCov_9fa48("27500"), 'Unknown date');

        // Check if dateString is already in a Date format
        const date = new Date(dateString);
        if (stryMutAct_9fa48("27502") ? false : stryMutAct_9fa48("27501") ? true : (stryCov_9fa48("27501", "27502"), isNaN(date.getTime()))) {
          if (stryMutAct_9fa48("27503")) {
            {}
          } else {
            stryCov_9fa48("27503");
            return dateString; // Return as is if it's not a valid date
          }
        }
        return date.toLocaleDateString(undefined, stryMutAct_9fa48("27504") ? {} : (stryCov_9fa48("27504"), {
          year: stryMutAct_9fa48("27505") ? "" : (stryCov_9fa48("27505"), 'numeric'),
          month: stryMutAct_9fa48("27506") ? "" : (stryCov_9fa48("27506"), 'long'),
          day: stryMutAct_9fa48("27507") ? "" : (stryCov_9fa48("27507"), 'numeric')
        }));
      }
    };
    const getGradeColor = score => {
      if (stryMutAct_9fa48("27508")) {
        {}
      } else {
        stryCov_9fa48("27508");
        if (stryMutAct_9fa48("27511") ? score !== 0 : stryMutAct_9fa48("27510") ? false : stryMutAct_9fa48("27509") ? true : (stryCov_9fa48("27509", "27510", "27511"), score === 0)) return stryMutAct_9fa48("27512") ? "" : (stryCov_9fa48("27512"), 'error');
        if (stryMutAct_9fa48("27515") ? (score === null || score === undefined) && isNaN(score) : stryMutAct_9fa48("27514") ? false : stryMutAct_9fa48("27513") ? true : (stryCov_9fa48("27513", "27514", "27515"), (stryMutAct_9fa48("27517") ? score === null && score === undefined : stryMutAct_9fa48("27516") ? false : (stryCov_9fa48("27516", "27517"), (stryMutAct_9fa48("27519") ? score !== null : stryMutAct_9fa48("27518") ? false : (stryCov_9fa48("27518", "27519"), score === null)) || (stryMutAct_9fa48("27521") ? score !== undefined : stryMutAct_9fa48("27520") ? false : (stryCov_9fa48("27520", "27521"), score === undefined)))) || isNaN(score))) return stryMutAct_9fa48("27522") ? "" : (stryCov_9fa48("27522"), 'error');
        if (stryMutAct_9fa48("27526") ? score < 80 : stryMutAct_9fa48("27525") ? score > 80 : stryMutAct_9fa48("27524") ? false : stryMutAct_9fa48("27523") ? true : (stryCov_9fa48("27523", "27524", "27525", "27526"), score >= 80)) return stryMutAct_9fa48("27527") ? "" : (stryCov_9fa48("27527"), 'success');
        if (stryMutAct_9fa48("27531") ? score < 50 : stryMutAct_9fa48("27530") ? score > 50 : stryMutAct_9fa48("27529") ? false : stryMutAct_9fa48("27528") ? true : (stryCov_9fa48("27528", "27529", "27530", "27531"), score >= 50)) return stryMutAct_9fa48("27532") ? "" : (stryCov_9fa48("27532"), 'warning');
        return stryMutAct_9fa48("27533") ? "" : (stryCov_9fa48("27533"), 'error');
      }
    };
    const getGradeLabel = score => {
      if (stryMutAct_9fa48("27534")) {
        {}
      } else {
        stryCov_9fa48("27534");
        if (stryMutAct_9fa48("27537") ? score !== 0 : stryMutAct_9fa48("27536") ? false : stryMutAct_9fa48("27535") ? true : (stryCov_9fa48("27535", "27536", "27537"), score === 0)) return stryMutAct_9fa48("27538") ? "" : (stryCov_9fa48("27538"), "Document Access Error");
        if (stryMutAct_9fa48("27541") ? (score === null || score === undefined) && isNaN(score) : stryMutAct_9fa48("27540") ? false : stryMutAct_9fa48("27539") ? true : (stryCov_9fa48("27539", "27540", "27541"), (stryMutAct_9fa48("27543") ? score === null && score === undefined : stryMutAct_9fa48("27542") ? false : (stryCov_9fa48("27542", "27543"), (stryMutAct_9fa48("27545") ? score !== null : stryMutAct_9fa48("27544") ? false : (stryCov_9fa48("27544", "27545"), score === null)) || (stryMutAct_9fa48("27547") ? score !== undefined : stryMutAct_9fa48("27546") ? false : (stryCov_9fa48("27546", "27547"), score === undefined)))) || isNaN(score))) return stryMutAct_9fa48("27548") ? "" : (stryCov_9fa48("27548"), "F");
        if (stryMutAct_9fa48("27552") ? score < 93 : stryMutAct_9fa48("27551") ? score > 93 : stryMutAct_9fa48("27550") ? false : stryMutAct_9fa48("27549") ? true : (stryCov_9fa48("27549", "27550", "27551", "27552"), score >= 93)) return stryMutAct_9fa48("27553") ? "" : (stryCov_9fa48("27553"), 'A+');
        if (stryMutAct_9fa48("27557") ? score < 85 : stryMutAct_9fa48("27556") ? score > 85 : stryMutAct_9fa48("27555") ? false : stryMutAct_9fa48("27554") ? true : (stryCov_9fa48("27554", "27555", "27556", "27557"), score >= 85)) return stryMutAct_9fa48("27558") ? "" : (stryCov_9fa48("27558"), 'A');
        if (stryMutAct_9fa48("27562") ? score < 80 : stryMutAct_9fa48("27561") ? score > 80 : stryMutAct_9fa48("27560") ? false : stryMutAct_9fa48("27559") ? true : (stryCov_9fa48("27559", "27560", "27561", "27562"), score >= 80)) return stryMutAct_9fa48("27563") ? "" : (stryCov_9fa48("27563"), 'A-');
        if (stryMutAct_9fa48("27567") ? score < 70 : stryMutAct_9fa48("27566") ? score > 70 : stryMutAct_9fa48("27565") ? false : stryMutAct_9fa48("27564") ? true : (stryCov_9fa48("27564", "27565", "27566", "27567"), score >= 70)) return stryMutAct_9fa48("27568") ? "" : (stryCov_9fa48("27568"), 'B+');
        if (stryMutAct_9fa48("27572") ? score < 60 : stryMutAct_9fa48("27571") ? score > 60 : stryMutAct_9fa48("27570") ? false : stryMutAct_9fa48("27569") ? true : (stryCov_9fa48("27569", "27570", "27571", "27572"), score >= 60)) return stryMutAct_9fa48("27573") ? "" : (stryCov_9fa48("27573"), 'B');
        if (stryMutAct_9fa48("27577") ? score < 50 : stryMutAct_9fa48("27576") ? score > 50 : stryMutAct_9fa48("27575") ? false : stryMutAct_9fa48("27574") ? true : (stryCov_9fa48("27574", "27575", "27576", "27577"), score >= 50)) return stryMutAct_9fa48("27578") ? "" : (stryCov_9fa48("27578"), 'B-');
        if (stryMutAct_9fa48("27582") ? score < 40 : stryMutAct_9fa48("27581") ? score > 40 : stryMutAct_9fa48("27580") ? false : stryMutAct_9fa48("27579") ? true : (stryCov_9fa48("27579", "27580", "27581", "27582"), score >= 40)) return stryMutAct_9fa48("27583") ? "" : (stryCov_9fa48("27583"), 'C+');
        return stryMutAct_9fa48("27584") ? "" : (stryCov_9fa48("27584"), 'C');
      }
    };
    const getCompletionScore = item => {
      if (stryMutAct_9fa48("27585")) {
        {}
      } else {
        stryCov_9fa48("27585");
        try {
          if (stryMutAct_9fa48("27586")) {
            {}
          } else {
            stryCov_9fa48("27586");
            const analysis = parseAnalysis(item);
            if (stryMutAct_9fa48("27589") ? analysis || !isNaN(analysis.completion_score) : stryMutAct_9fa48("27588") ? false : stryMutAct_9fa48("27587") ? true : (stryCov_9fa48("27587", "27588", "27589"), analysis && (stryMutAct_9fa48("27590") ? isNaN(analysis.completion_score) : (stryCov_9fa48("27590"), !isNaN(analysis.completion_score))))) {
              if (stryMutAct_9fa48("27591")) {
                {}
              } else {
                stryCov_9fa48("27591");
                return stryMutAct_9fa48("27594") ? analysis.completion_score && 0 : stryMutAct_9fa48("27593") ? false : stryMutAct_9fa48("27592") ? true : (stryCov_9fa48("27592", "27593", "27594"), analysis.completion_score || 0);
              }
            }
            return 0;
          }
        } catch (err) {
          if (stryMutAct_9fa48("27595")) {
            {}
          } else {
            stryCov_9fa48("27595");
            console.error(stryMutAct_9fa48("27596") ? "" : (stryCov_9fa48("27596"), 'Error getting completion score:'), err);
            return 0;
          }
        }
      }
    };
    const getFeedback = item => {
      if (stryMutAct_9fa48("27597")) {
        {}
      } else {
        stryCov_9fa48("27597");
        try {
          if (stryMutAct_9fa48("27598")) {
            {}
          } else {
            stryCov_9fa48("27598");
            const analysis = parseAnalysis(item);
            if (stryMutAct_9fa48("27600") ? false : stryMutAct_9fa48("27599") ? true : (stryCov_9fa48("27599", "27600"), analysis)) {
              if (stryMutAct_9fa48("27601")) {
                {}
              } else {
                stryCov_9fa48("27601");
                // Handle case where feedback might be NaN or null
                if (stryMutAct_9fa48("27604") ? (analysis.feedback === null || analysis.feedback === undefined) && typeof analysis.feedback === 'number' && isNaN(analysis.feedback) : stryMutAct_9fa48("27603") ? false : stryMutAct_9fa48("27602") ? true : (stryCov_9fa48("27602", "27603", "27604"), (stryMutAct_9fa48("27606") ? analysis.feedback === null && analysis.feedback === undefined : stryMutAct_9fa48("27605") ? false : (stryCov_9fa48("27605", "27606"), (stryMutAct_9fa48("27608") ? analysis.feedback !== null : stryMutAct_9fa48("27607") ? false : (stryCov_9fa48("27607", "27608"), analysis.feedback === null)) || (stryMutAct_9fa48("27610") ? analysis.feedback !== undefined : stryMutAct_9fa48("27609") ? false : (stryCov_9fa48("27609", "27610"), analysis.feedback === undefined)))) || (stryMutAct_9fa48("27612") ? typeof analysis.feedback === 'number' || isNaN(analysis.feedback) : stryMutAct_9fa48("27611") ? false : (stryCov_9fa48("27611", "27612"), (stryMutAct_9fa48("27614") ? typeof analysis.feedback !== 'number' : stryMutAct_9fa48("27613") ? true : (stryCov_9fa48("27613", "27614"), typeof analysis.feedback === (stryMutAct_9fa48("27615") ? "" : (stryCov_9fa48("27615"), 'number')))) && isNaN(analysis.feedback))))) {
                  if (stryMutAct_9fa48("27616")) {
                    {}
                  } else {
                    stryCov_9fa48("27616");
                    return stryMutAct_9fa48("27617") ? "Stryker was here!" : (stryCov_9fa48("27617"), ''); // Return empty string if feedback is NaN, null or undefined
                  }
                }
                return stryMutAct_9fa48("27620") ? analysis.feedback && '' : stryMutAct_9fa48("27619") ? false : stryMutAct_9fa48("27618") ? true : (stryCov_9fa48("27618", "27619", "27620"), analysis.feedback || (stryMutAct_9fa48("27621") ? "Stryker was here!" : (stryCov_9fa48("27621"), '')));
              }
            }
            return stryMutAct_9fa48("27622") ? "Stryker was here!" : (stryCov_9fa48("27622"), '');
          }
        } catch (err) {
          if (stryMutAct_9fa48("27623")) {
            {}
          } else {
            stryCov_9fa48("27623");
            console.error(stryMutAct_9fa48("27624") ? "" : (stryCov_9fa48("27624"), 'Error parsing feedback:'), err);
            return stryMutAct_9fa48("27625") ? "Stryker was here!" : (stryCov_9fa48("27625"), '');
          }
        }
      }
    };
    const getAnalyzedContent = item => {
      if (stryMutAct_9fa48("27626")) {
        {}
      } else {
        stryCov_9fa48("27626");
        try {
          if (stryMutAct_9fa48("27627")) {
            {}
          } else {
            stryCov_9fa48("27627");
            if (stryMutAct_9fa48("27630") ? false : stryMutAct_9fa48("27629") ? true : stryMutAct_9fa48("27628") ? item.analyzed_content : (stryCov_9fa48("27628", "27629", "27630"), !item.analyzed_content)) return stryMutAct_9fa48("27631") ? "Stryker was here!" : (stryCov_9fa48("27631"), '');

            // Handle case where analyzed_content is a string but might be JSON
            if (stryMutAct_9fa48("27634") ? typeof item.analyzed_content !== 'string' : stryMutAct_9fa48("27633") ? false : stryMutAct_9fa48("27632") ? true : (stryCov_9fa48("27632", "27633", "27634"), typeof item.analyzed_content === (stryMutAct_9fa48("27635") ? "" : (stryCov_9fa48("27635"), 'string')))) {
              if (stryMutAct_9fa48("27636")) {
                {}
              } else {
                stryCov_9fa48("27636");
                try {
                  if (stryMutAct_9fa48("27637")) {
                    {}
                  } else {
                    stryCov_9fa48("27637");
                    // Check if it's a JSON string
                    const parsed = JSON.parse(item.analyzed_content);

                    // Handle array of objects with type and content properties
                    if (stryMutAct_9fa48("27639") ? false : stryMutAct_9fa48("27638") ? true : (stryCov_9fa48("27638", "27639"), Array.isArray(parsed))) {
                      if (stryMutAct_9fa48("27640")) {
                        {}
                      } else {
                        stryCov_9fa48("27640");
                        const links = stryMutAct_9fa48("27641") ? parsed.map(p => p.content) : (stryCov_9fa48("27641"), parsed.filter(stryMutAct_9fa48("27642") ? () => undefined : (stryCov_9fa48("27642"), p => stryMutAct_9fa48("27645") ? p.type !== 'link' : stryMutAct_9fa48("27644") ? false : stryMutAct_9fa48("27643") ? true : (stryCov_9fa48("27643", "27644", "27645"), p.type === (stryMutAct_9fa48("27646") ? "" : (stryCov_9fa48("27646"), 'link'))))).map(stryMutAct_9fa48("27647") ? () => undefined : (stryCov_9fa48("27647"), p => p.content)));
                        return (stryMutAct_9fa48("27651") ? links.length <= 0 : stryMutAct_9fa48("27650") ? links.length >= 0 : stryMutAct_9fa48("27649") ? false : stryMutAct_9fa48("27648") ? true : (stryCov_9fa48("27648", "27649", "27650", "27651"), links.length > 0)) ? links[0] : stryMutAct_9fa48("27652") ? "Stryker was here!" : (stryCov_9fa48("27652"), '');
                      }
                    }

                    // Handle object with content property
                    if (stryMutAct_9fa48("27655") ? parsed || parsed.content : stryMutAct_9fa48("27654") ? false : stryMutAct_9fa48("27653") ? true : (stryCov_9fa48("27653", "27654", "27655"), parsed && parsed.content)) {
                      if (stryMutAct_9fa48("27656")) {
                        {}
                      } else {
                        stryCov_9fa48("27656");
                        return parsed.content;
                      }
                    }
                    return item.analyzed_content; // Return original if JSON parsing doesn't yield useful results
                  }
                } catch (e) {
                  if (stryMutAct_9fa48("27657")) {
                    {}
                  } else {
                    stryCov_9fa48("27657");
                    // Not a JSON string, just return as is
                    return item.analyzed_content;
                  }
                }
              }
            }

            // Handle object format
            if (stryMutAct_9fa48("27660") ? typeof item.analyzed_content !== 'object' : stryMutAct_9fa48("27659") ? false : stryMutAct_9fa48("27658") ? true : (stryCov_9fa48("27658", "27659", "27660"), typeof item.analyzed_content === (stryMutAct_9fa48("27661") ? "" : (stryCov_9fa48("27661"), 'object')))) {
              if (stryMutAct_9fa48("27662")) {
                {}
              } else {
                stryCov_9fa48("27662");
                if (stryMutAct_9fa48("27664") ? false : stryMutAct_9fa48("27663") ? true : (stryCov_9fa48("27663", "27664"), item.analyzed_content.content)) {
                  if (stryMutAct_9fa48("27665")) {
                    {}
                  } else {
                    stryCov_9fa48("27665");
                    return item.analyzed_content.content;
                  }
                }

                // For arrays of objects
                if (stryMutAct_9fa48("27667") ? false : stryMutAct_9fa48("27666") ? true : (stryCov_9fa48("27666", "27667"), Array.isArray(item.analyzed_content))) {
                  if (stryMutAct_9fa48("27668")) {
                    {}
                  } else {
                    stryCov_9fa48("27668");
                    const links = stryMutAct_9fa48("27669") ? item.analyzed_content.map(item => item.content) : (stryCov_9fa48("27669"), item.analyzed_content.filter(stryMutAct_9fa48("27670") ? () => undefined : (stryCov_9fa48("27670"), item => stryMutAct_9fa48("27673") ? item.type !== 'link' : stryMutAct_9fa48("27672") ? false : stryMutAct_9fa48("27671") ? true : (stryCov_9fa48("27671", "27672", "27673"), item.type === (stryMutAct_9fa48("27674") ? "" : (stryCov_9fa48("27674"), 'link'))))).map(stryMutAct_9fa48("27675") ? () => undefined : (stryCov_9fa48("27675"), item => item.content)));
                    return (stryMutAct_9fa48("27679") ? links.length <= 0 : stryMutAct_9fa48("27678") ? links.length >= 0 : stryMutAct_9fa48("27677") ? false : stryMutAct_9fa48("27676") ? true : (stryCov_9fa48("27676", "27677", "27678", "27679"), links.length > 0)) ? links[0] : stryMutAct_9fa48("27680") ? "Stryker was here!" : (stryCov_9fa48("27680"), '');
                  }
                }
              }
            }
            return stryMutAct_9fa48("27681") ? "Stryker was here!" : (stryCov_9fa48("27681"), '');
          }
        } catch (err) {
          if (stryMutAct_9fa48("27682")) {
            {}
          } else {
            stryCov_9fa48("27682");
            console.error(stryMutAct_9fa48("27683") ? "" : (stryCov_9fa48("27683"), 'Error extracting analyzed content:'), err);
            return stryMutAct_9fa48("27684") ? "Stryker was here!" : (stryCov_9fa48("27684"), '');
          }
        }
      }
    };

    // Parse the analysis object safely handling NaN and other edge cases
    const parseAnalysis = item => {
      if (stryMutAct_9fa48("27685")) {
        {}
      } else {
        stryCov_9fa48("27685");
        try {
          if (stryMutAct_9fa48("27686")) {
            {}
          } else {
            stryCov_9fa48("27686");
            if (stryMutAct_9fa48("27689") ? !item && !item.analysis : stryMutAct_9fa48("27688") ? false : stryMutAct_9fa48("27687") ? true : (stryCov_9fa48("27687", "27688", "27689"), (stryMutAct_9fa48("27690") ? item : (stryCov_9fa48("27690"), !item)) || (stryMutAct_9fa48("27691") ? item.analysis : (stryCov_9fa48("27691"), !item.analysis)))) return null;

            // Handle NaN values in the JSON by replacing them before parsing
            let analysisStr = item.analysis;
            if (stryMutAct_9fa48("27694") ? typeof analysisStr !== 'string' : stryMutAct_9fa48("27693") ? false : stryMutAct_9fa48("27692") ? true : (stryCov_9fa48("27692", "27693", "27694"), typeof analysisStr === (stryMutAct_9fa48("27695") ? "" : (stryCov_9fa48("27695"), 'string')))) {
              if (stryMutAct_9fa48("27696")) {
                {}
              } else {
                stryCov_9fa48("27696");
                // Replace NaN with null since NaN is not valid in JSON
                analysisStr = analysisStr.replace(stryMutAct_9fa48("27700") ? /"feedback"\s*:\S*NaN/g : stryMutAct_9fa48("27699") ? /"feedback"\s*:\sNaN/g : stryMutAct_9fa48("27698") ? /"feedback"\S*:\s*NaN/g : stryMutAct_9fa48("27697") ? /"feedback"\s:\s*NaN/g : (stryCov_9fa48("27697", "27698", "27699", "27700"), /"feedback"\s*:\s*NaN/g), stryMutAct_9fa48("27701") ? "" : (stryCov_9fa48("27701"), '"feedback": null'));
                analysisStr = analysisStr.replace(stryMutAct_9fa48("27703") ? /:\S*NaN/g : stryMutAct_9fa48("27702") ? /:\sNaN/g : (stryCov_9fa48("27702", "27703"), /:\s*NaN/g), stryMutAct_9fa48("27704") ? "" : (stryCov_9fa48("27704"), ': null'));
                try {
                  if (stryMutAct_9fa48("27705")) {
                    {}
                  } else {
                    stryCov_9fa48("27705");
                    return JSON.parse(analysisStr);
                  }
                } catch (jsonError) {
                  if (stryMutAct_9fa48("27706")) {
                    {}
                  } else {
                    stryCov_9fa48("27706");
                    console.error(stryMutAct_9fa48("27707") ? "" : (stryCov_9fa48("27707"), 'JSON parse error:'), jsonError);
                    console.log(stryMutAct_9fa48("27708") ? "" : (stryCov_9fa48("27708"), 'Problem string:'), analysisStr);
                    return {}; // Return empty object if parse fails
                  }
                }
              }
            } else if (stryMutAct_9fa48("27711") ? typeof item.analysis !== 'object' : stryMutAct_9fa48("27710") ? false : stryMutAct_9fa48("27709") ? true : (stryCov_9fa48("27709", "27710", "27711"), typeof item.analysis === (stryMutAct_9fa48("27712") ? "" : (stryCov_9fa48("27712"), 'object')))) {
              if (stryMutAct_9fa48("27713")) {
                {}
              } else {
                stryCov_9fa48("27713");
                return item.analysis;
              }
            }
            return {};
          }
        } catch (err) {
          if (stryMutAct_9fa48("27714")) {
            {}
          } else {
            stryCov_9fa48("27714");
            console.error(stryMutAct_9fa48("27715") ? "" : (stryCov_9fa48("27715"), 'Error parsing analysis:'), err);
            return {};
          }
        }
      }
    };
    if (stryMutAct_9fa48("27717") ? false : stryMutAct_9fa48("27716") ? true : (stryCov_9fa48("27716", "27717"), loading)) {
      if (stryMutAct_9fa48("27718")) {
        {}
      } else {
        stryCov_9fa48("27718");
        return <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress size={24} />
      </Box>;
      }
    }
    if (stryMutAct_9fa48("27720") ? false : stryMutAct_9fa48("27719") ? true : (stryCov_9fa48("27719", "27720"), error)) {
      if (stryMutAct_9fa48("27721")) {
        {}
      } else {
        stryCov_9fa48("27721");
        return <Box textAlign="center" py={4}>
        <Typography color="error" variant="h6" gutterBottom>
          Error Loading Work Product Data
        </Typography>
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      </Box>;
      }
    }
    if (stryMutAct_9fa48("27724") ? (!workProductData || !Array.isArray(workProductData)) && workProductData.length === 0 : stryMutAct_9fa48("27723") ? false : stryMutAct_9fa48("27722") ? true : (stryCov_9fa48("27722", "27723", "27724"), (stryMutAct_9fa48("27726") ? !workProductData && !Array.isArray(workProductData) : stryMutAct_9fa48("27725") ? false : (stryCov_9fa48("27725", "27726"), (stryMutAct_9fa48("27727") ? workProductData : (stryCov_9fa48("27727"), !workProductData)) || (stryMutAct_9fa48("27728") ? Array.isArray(workProductData) : (stryCov_9fa48("27728"), !Array.isArray(workProductData))))) || (stryMutAct_9fa48("27730") ? workProductData.length !== 0 : stryMutAct_9fa48("27729") ? false : (stryCov_9fa48("27729", "27730"), workProductData.length === 0)))) {
      if (stryMutAct_9fa48("27731")) {
        {}
      } else {
        stryCov_9fa48("27731");
        return <Box textAlign="center" py={4}>
        <Box sx={stryMutAct_9fa48("27732") ? {} : (stryCov_9fa48("27732"), {
            position: stryMutAct_9fa48("27733") ? "" : (stryCov_9fa48("27733"), 'relative'),
            mb: 4
          })}>
          <Typography variant="h6" sx={stryMutAct_9fa48("27734") ? {} : (stryCov_9fa48("27734"), {
              color: stryMutAct_9fa48("27735") ? "" : (stryCov_9fa48("27735"), 'var(--color-text-primary)'),
              mb: 3
            })}>
            Work Product Analysis
          </Typography>
          
          <Box sx={stryMutAct_9fa48("27736") ? {} : (stryCov_9fa48("27736"), {
              position: stryMutAct_9fa48("27737") ? "" : (stryCov_9fa48("27737"), 'absolute'),
              right: 0,
              top: 0
            })}>
            <MonthFilter selectedMonth={selectedMonth} onMonthChange={handleMonthChange} cohortMonth={cohortMonth} />
          </Box>
        </Box>
        <Typography sx={stryMutAct_9fa48("27738") ? {} : (stryCov_9fa48("27738"), {
            color: stryMutAct_9fa48("27739") ? "" : (stryCov_9fa48("27739"), 'var(--color-text-secondary)')
          })}>
          No work product data available for the selected month.
        </Typography>
      </Box>;
      }
    }
    return <Box className="work-product-section">
      <Box sx={stryMutAct_9fa48("27740") ? {} : (stryCov_9fa48("27740"), {
        position: stryMutAct_9fa48("27741") ? "" : (stryCov_9fa48("27741"), 'relative'),
        mb: 3
      })}>
        <Typography variant="h6" sx={stryMutAct_9fa48("27742") ? {} : (stryCov_9fa48("27742"), {
          color: stryMutAct_9fa48("27743") ? "" : (stryCov_9fa48("27743"), 'var(--color-text-primary)'),
          mb: 3
        })}>
          Work Product Analysis
        </Typography>
        
        <Box sx={stryMutAct_9fa48("27744") ? {} : (stryCov_9fa48("27744"), {
          position: stryMutAct_9fa48("27745") ? "" : (stryCov_9fa48("27745"), 'absolute'),
          right: 0,
          top: 0
        })}>
          <MonthFilter selectedMonth={selectedMonth} onMonthChange={handleMonthChange} cohortMonth={cohortMonth} />
        </Box>
      </Box>
      
      {/* List view of work products */}
      <Grid container spacing={2}>
        {/* AI Trend Analysis */}
        <Grid item xs={12}>
          <AITrendAnalysis analysisType="work_product" cohortMonth={cohortMonth} title="Work Product" />
        </Grid>
        
        {workProductData.map((item, index) => {
          if (stryMutAct_9fa48("27746")) {
            {}
          } else {
            stryCov_9fa48("27746");
            const score = getCompletionScore(item);
            const feedback = getFeedback(item);
            return <Grid item xs={12} key={index}>
              <Card variant="outlined" sx={stryMutAct_9fa48("27747") ? {} : (stryCov_9fa48("27747"), {
                backgroundColor: stryMutAct_9fa48("27748") ? "" : (stryCov_9fa48("27748"), '#171c28'),
                border: stryMutAct_9fa48("27749") ? "" : (stryCov_9fa48("27749"), '1px solid var(--color-border)'),
                borderRadius: 2
              })}>
                <CardContent sx={stryMutAct_9fa48("27750") ? {} : (stryCov_9fa48("27750"), {
                  pb: 1.5
                })}>
                  {/* Date at top - small */}
                  <Typography variant="caption" sx={stryMutAct_9fa48("27751") ? {} : (stryCov_9fa48("27751"), {
                    color: stryMutAct_9fa48("27752") ? "" : (stryCov_9fa48("27752"), 'var(--color-text-secondary)'),
                    display: stryMutAct_9fa48("27753") ? "" : (stryCov_9fa48("27753"), 'block'),
                    mb: 0.5,
                    textAlign: stryMutAct_9fa48("27754") ? "" : (stryCov_9fa48("27754"), 'left')
                  })}>
                    {formatDate(stryMutAct_9fa48("27757") ? (item.date?.value || item.analyzed_at) && item.curriculum_date : stryMutAct_9fa48("27756") ? false : stryMutAct_9fa48("27755") ? true : (stryCov_9fa48("27755", "27756", "27757"), (stryMutAct_9fa48("27759") ? item.date?.value && item.analyzed_at : stryMutAct_9fa48("27758") ? false : (stryCov_9fa48("27758", "27759"), (stryMutAct_9fa48("27760") ? item.date.value : (stryCov_9fa48("27760"), item.date?.value)) || item.analyzed_at)) || item.curriculum_date))}
                  </Typography>
                  
                  {/* Title and score on same line */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                    <Typography variant="subtitle1" sx={stryMutAct_9fa48("27761") ? {} : (stryCov_9fa48("27761"), {
                      color: stryMutAct_9fa48("27762") ? "" : (stryCov_9fa48("27762"), 'var(--color-text-primary)'),
                      fontWeight: 500,
                      textAlign: stryMutAct_9fa48("27763") ? "" : (stryCov_9fa48("27763"), 'left')
                    })}>
                      {stryMutAct_9fa48("27766") ? item.task_title && `Work Product ${item.task_id || ''}` : stryMutAct_9fa48("27765") ? false : stryMutAct_9fa48("27764") ? true : (stryCov_9fa48("27764", "27765", "27766"), item.task_title || (stryMutAct_9fa48("27767") ? `` : (stryCov_9fa48("27767"), `Work Product ${stryMutAct_9fa48("27770") ? item.task_id && '' : stryMutAct_9fa48("27769") ? false : stryMutAct_9fa48("27768") ? true : (stryCov_9fa48("27768", "27769", "27770"), item.task_id || (stryMutAct_9fa48("27771") ? "Stryker was here!" : (stryCov_9fa48("27771"), '')))}`)))}
                    </Typography>
                    
                    <Chip label={stryMutAct_9fa48("27772") ? `` : (stryCov_9fa48("27772"), `${score}% (${getGradeLabel(score)})`)} color={getGradeColor(score)} size="small" />
                  </Box>
                  
                  {/* Feedback summary */}
                  {stryMutAct_9fa48("27775") ? feedback || <Typography variant="body2" sx={{
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
                    </Typography> : stryMutAct_9fa48("27774") ? false : stryMutAct_9fa48("27773") ? true : (stryCov_9fa48("27773", "27774", "27775"), feedback && <Typography variant="body2" sx={stryMutAct_9fa48("27776") ? {} : (stryCov_9fa48("27776"), {
                    color: stryMutAct_9fa48("27777") ? "" : (stryCov_9fa48("27777"), 'var(--color-text-primary)'),
                    opacity: 0.8,
                    maxHeight: stryMutAct_9fa48("27778") ? "" : (stryCov_9fa48("27778"), '60px'),
                    overflow: stryMutAct_9fa48("27779") ? "" : (stryCov_9fa48("27779"), 'hidden'),
                    textOverflow: stryMutAct_9fa48("27780") ? "" : (stryCov_9fa48("27780"), 'ellipsis'),
                    display: stryMutAct_9fa48("27781") ? "" : (stryCov_9fa48("27781"), '-webkit-box'),
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: stryMutAct_9fa48("27782") ? "" : (stryCov_9fa48("27782"), 'vertical'),
                    textAlign: stryMutAct_9fa48("27783") ? "" : (stryCov_9fa48("27783"), 'left')
                  })}>
                      {feedback}
                    </Typography>)}
                </CardContent>
                <CardActions sx={stryMutAct_9fa48("27784") ? {} : (stryCov_9fa48("27784"), {
                  justifyContent: stryMutAct_9fa48("27785") ? "" : (stryCov_9fa48("27785"), 'flex-end'),
                  p: 1.5,
                  pt: 0
                })}>
                  <Button variant="outlined" size="small" onClick={stryMutAct_9fa48("27786") ? () => undefined : (stryCov_9fa48("27786"), () => handleOpenModal(item))}>
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>;
          }
        })}
      </Grid>
      
      {/* Modal for detailed view */}
      <Modal open={modalOpen} onClose={handleCloseModal} aria-labelledby="work-product-modal-title">
        <Box sx={stryMutAct_9fa48("27787") ? {} : (stryCov_9fa48("27787"), {
          position: stryMutAct_9fa48("27788") ? "" : (stryCov_9fa48("27788"), 'absolute'),
          top: stryMutAct_9fa48("27789") ? "" : (stryCov_9fa48("27789"), '50%'),
          left: stryMutAct_9fa48("27790") ? "" : (stryCov_9fa48("27790"), '50%'),
          transform: stryMutAct_9fa48("27791") ? "" : (stryCov_9fa48("27791"), 'translate(-50%, -50%)'),
          width: stryMutAct_9fa48("27792") ? {} : (stryCov_9fa48("27792"), {
            xs: stryMutAct_9fa48("27793") ? "" : (stryCov_9fa48("27793"), '90%'),
            sm: stryMutAct_9fa48("27794") ? "" : (stryCov_9fa48("27794"), '80%'),
            md: stryMutAct_9fa48("27795") ? "" : (stryCov_9fa48("27795"), '70%')
          }),
          maxWidth: stryMutAct_9fa48("27796") ? "" : (stryCov_9fa48("27796"), '800px'),
          maxHeight: stryMutAct_9fa48("27797") ? "" : (stryCov_9fa48("27797"), '90vh'),
          overflow: stryMutAct_9fa48("27798") ? "" : (stryCov_9fa48("27798"), 'auto'),
          bgcolor: stryMutAct_9fa48("27799") ? "" : (stryCov_9fa48("27799"), '#171c28'),
          border: stryMutAct_9fa48("27800") ? "" : (stryCov_9fa48("27800"), '1px solid var(--color-border)'),
          borderRadius: 1,
          boxShadow: 24,
          p: 4
        })}>
          {stryMutAct_9fa48("27803") ? selectedItem || <>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography id="work-product-modal-title" variant="h5" component="h2" sx={{
                  fontWeight: 'bold',
                  color: 'var(--color-text-primary)'
                }}>
                    {selectedItem.task_title || `Work Product ${selectedItem.task_id || ''}`}
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
                  {/* Score */}
                  {parseAnalysis(selectedItem).completion_score && <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Score: {parseAnalysis(selectedItem).completion_score} ({getGradeLabel(parseAnalysis(selectedItem).completion_score)})
                      </Typography>
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
                      
                      {Object.entries(parseAnalysis(selectedItem).specific_findings).map(([category, findings], idx) => <Box key={idx} mb={2}>
                          <Typography variant="subtitle2" sx={{
                    fontWeight: 'bold',
                    mt: 2
                  }}>
                            {category}:
                          </Typography>
                          
                          {findings.strengths && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(findings.strengths) ? findings.strengths.map((strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {findings.strengths}
                                  </Typography>}
                              </Box>
                            </Box>}
                          
                          {findings.weaknesses && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(findings.weaknesses) ? findings.weaknesses.map((weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {findings.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box>}
                          
                          {findings.score && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Score: {findings.score}
                              </Typography>
                            </Box>}
                        </Box>)}
                    </Box>}
                </Box>}
            </> : stryMutAct_9fa48("27802") ? false : stryMutAct_9fa48("27801") ? true : (stryCov_9fa48("27801", "27802", "27803"), selectedItem && <>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography id="work-product-modal-title" variant="h5" component="h2" sx={stryMutAct_9fa48("27804") ? {} : (stryCov_9fa48("27804"), {
                  fontWeight: stryMutAct_9fa48("27805") ? "" : (stryCov_9fa48("27805"), 'bold'),
                  color: stryMutAct_9fa48("27806") ? "" : (stryCov_9fa48("27806"), 'var(--color-text-primary)')
                })}>
                    {stryMutAct_9fa48("27809") ? selectedItem.task_title && `Work Product ${selectedItem.task_id || ''}` : stryMutAct_9fa48("27808") ? false : stryMutAct_9fa48("27807") ? true : (stryCov_9fa48("27807", "27808", "27809"), selectedItem.task_title || (stryMutAct_9fa48("27810") ? `` : (stryCov_9fa48("27810"), `Work Product ${stryMutAct_9fa48("27813") ? selectedItem.task_id && '' : stryMutAct_9fa48("27812") ? false : stryMutAct_9fa48("27811") ? true : (stryCov_9fa48("27811", "27812", "27813"), selectedItem.task_id || (stryMutAct_9fa48("27814") ? "Stryker was here!" : (stryCov_9fa48("27814"), '')))}`)))}
                  </Typography>
                  <Typography variant="subtitle1" sx={stryMutAct_9fa48("27815") ? {} : (stryCov_9fa48("27815"), {
                  color: stryMutAct_9fa48("27816") ? "" : (stryCov_9fa48("27816"), 'var(--color-text-secondary)'),
                  mt: 1
                })}>
                    Date: {formatDate(stryMutAct_9fa48("27819") ? (selectedItem.date?.value || selectedItem.analyzed_at) && selectedItem.curriculum_date : stryMutAct_9fa48("27818") ? false : stryMutAct_9fa48("27817") ? true : (stryCov_9fa48("27817", "27818", "27819"), (stryMutAct_9fa48("27821") ? selectedItem.date?.value && selectedItem.analyzed_at : stryMutAct_9fa48("27820") ? false : (stryCov_9fa48("27820", "27821"), (stryMutAct_9fa48("27822") ? selectedItem.date.value : (stryCov_9fa48("27822"), selectedItem.date?.value)) || selectedItem.analyzed_at)) || selectedItem.curriculum_date))}
                  </Typography>
                </Box>
                <IconButton onClick={handleCloseModal} sx={stryMutAct_9fa48("27823") ? {} : (stryCov_9fa48("27823"), {
                p: 1
              })}>
                  <CloseIcon />
                </IconButton>
              </Box>
              
              <Divider sx={stryMutAct_9fa48("27824") ? {} : (stryCov_9fa48("27824"), {
              mb: 3
            })} />
              
              {/* Analyzed Content */}
              {stryMutAct_9fa48("27827") ? getAnalyzedContent(selectedItem) || <Box mb={3}>
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
                </Box> : stryMutAct_9fa48("27826") ? false : stryMutAct_9fa48("27825") ? true : (stryCov_9fa48("27825", "27826", "27827"), getAnalyzedContent(selectedItem) && <Box mb={3}>
                  <Typography variant="subtitle1" sx={stryMutAct_9fa48("27828") ? {} : (stryCov_9fa48("27828"), {
                fontWeight: stryMutAct_9fa48("27829") ? "" : (stryCov_9fa48("27829"), 'bold'),
                mb: 1
              })}>
                    Analyzed Content:
                  </Typography>
                  {(stryMutAct_9fa48("27830") ? getAnalyzedContent(selectedItem).endsWith('https://') : (stryCov_9fa48("27830"), getAnalyzedContent(selectedItem).startsWith(stryMutAct_9fa48("27831") ? "" : (stryCov_9fa48("27831"), 'https://')))) ? <Link href={getAnalyzedContent(selectedItem)} target="_blank" rel="noopener noreferrer" sx={stryMutAct_9fa48("27832") ? {} : (stryCov_9fa48("27832"), {
                wordBreak: stryMutAct_9fa48("27833") ? "" : (stryCov_9fa48("27833"), 'break-all')
              })}>
                      {getAnalyzedContent(selectedItem)}
                    </Link> : <Typography variant="body2" sx={stryMutAct_9fa48("27834") ? {} : (stryCov_9fa48("27834"), {
                color: stryMutAct_9fa48("27835") ? "" : (stryCov_9fa48("27835"), 'var(--color-text-primary)'),
                whiteSpace: stryMutAct_9fa48("27836") ? "" : (stryCov_9fa48("27836"), 'pre-wrap'),
                fontFamily: stryMutAct_9fa48("27837") ? "" : (stryCov_9fa48("27837"), 'monospace'),
                backgroundColor: stryMutAct_9fa48("27838") ? "" : (stryCov_9fa48("27838"), 'rgba(255, 255, 255, 0.05)'),
                padding: 2,
                borderRadius: 1,
                border: stryMutAct_9fa48("27839") ? "" : (stryCov_9fa48("27839"), '1px solid var(--color-border)')
              })}>
                      {getAnalyzedContent(selectedItem)}
                    </Typography>}
                </Box>)}
              
              {/* Analysis Content */}
              {stryMutAct_9fa48("27842") ? parseAnalysis(selectedItem) || <Box>
                  {/* Score */}
                  {parseAnalysis(selectedItem).completion_score && <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Score: {parseAnalysis(selectedItem).completion_score} ({getGradeLabel(parseAnalysis(selectedItem).completion_score)})
                      </Typography>
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
                      
                      {Object.entries(parseAnalysis(selectedItem).specific_findings).map(([category, findings], idx) => <Box key={idx} mb={2}>
                          <Typography variant="subtitle2" sx={{
                    fontWeight: 'bold',
                    mt: 2
                  }}>
                            {category}:
                          </Typography>
                          
                          {findings.strengths && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(findings.strengths) ? findings.strengths.map((strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {findings.strengths}
                                  </Typography>}
                              </Box>
                            </Box>}
                          
                          {findings.weaknesses && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(findings.weaknesses) ? findings.weaknesses.map((weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {findings.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box>}
                          
                          {findings.score && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Score: {findings.score}
                              </Typography>
                            </Box>}
                        </Box>)}
                    </Box>}
                </Box> : stryMutAct_9fa48("27841") ? false : stryMutAct_9fa48("27840") ? true : (stryCov_9fa48("27840", "27841", "27842"), parseAnalysis(selectedItem) && <Box>
                  {/* Score */}
                  {stryMutAct_9fa48("27845") ? parseAnalysis(selectedItem).completion_score || <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Score: {parseAnalysis(selectedItem).completion_score} ({getGradeLabel(parseAnalysis(selectedItem).completion_score)})
                      </Typography>
                    </Box> : stryMutAct_9fa48("27844") ? false : stryMutAct_9fa48("27843") ? true : (stryCov_9fa48("27843", "27844", "27845"), parseAnalysis(selectedItem).completion_score && <Box mb={3}>
                      <Typography variant="subtitle1" sx={stryMutAct_9fa48("27846") ? {} : (stryCov_9fa48("27846"), {
                  fontWeight: stryMutAct_9fa48("27847") ? "" : (stryCov_9fa48("27847"), 'bold'),
                  mb: 1
                })}>
                        Score: {parseAnalysis(selectedItem).completion_score} ({getGradeLabel(parseAnalysis(selectedItem).completion_score)})
                      </Typography>
                    </Box>)}
                  
                  {/* Submission Summary */}
                  {stryMutAct_9fa48("27850") ? parseAnalysis(selectedItem).submission_summary || <Box mb={3}>
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
                    </Box> : stryMutAct_9fa48("27849") ? false : stryMutAct_9fa48("27848") ? true : (stryCov_9fa48("27848", "27849", "27850"), parseAnalysis(selectedItem).submission_summary && <Box mb={3}>
                      <Typography variant="subtitle1" sx={stryMutAct_9fa48("27851") ? {} : (stryCov_9fa48("27851"), {
                  fontWeight: stryMutAct_9fa48("27852") ? "" : (stryCov_9fa48("27852"), 'bold'),
                  mb: 1
                })}>
                        Submission Summary:
                      </Typography>
                      <Typography variant="body2" sx={stryMutAct_9fa48("27853") ? {} : (stryCov_9fa48("27853"), {
                  color: stryMutAct_9fa48("27854") ? "" : (stryCov_9fa48("27854"), 'var(--color-text-primary)')
                })}>
                        {parseAnalysis(selectedItem).submission_summary}
                      </Typography>
                    </Box>)}
                  
                  {/* Feedback */}
                  {stryMutAct_9fa48("27857") ? parseAnalysis(selectedItem).feedback || <Box mb={3}>
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
                    </Box> : stryMutAct_9fa48("27856") ? false : stryMutAct_9fa48("27855") ? true : (stryCov_9fa48("27855", "27856", "27857"), parseAnalysis(selectedItem).feedback && <Box mb={3}>
                      <Typography variant="subtitle1" sx={stryMutAct_9fa48("27858") ? {} : (stryCov_9fa48("27858"), {
                  fontWeight: stryMutAct_9fa48("27859") ? "" : (stryCov_9fa48("27859"), 'bold'),
                  mb: 1
                })}>
                        Feedback:
                      </Typography>
                      <Typography variant="body2" sx={stryMutAct_9fa48("27860") ? {} : (stryCov_9fa48("27860"), {
                  color: stryMutAct_9fa48("27861") ? "" : (stryCov_9fa48("27861"), 'var(--color-text-primary)')
                })}>
                        {parseAnalysis(selectedItem).feedback}
                      </Typography>
                    </Box>)}
                  
                  {/* Criteria Met */}
                  {stryMutAct_9fa48("27864") ? parseAnalysis(selectedItem).criteria_met && parseAnalysis(selectedItem).criteria_met.length > 0 || <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Criteria Met:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {parseAnalysis(selectedItem).criteria_met.map((criterion, idx) => <Chip key={idx} label={criterion} color="success" size="small" />)}
                      </Box>
                    </Box> : stryMutAct_9fa48("27863") ? false : stryMutAct_9fa48("27862") ? true : (stryCov_9fa48("27862", "27863", "27864"), (stryMutAct_9fa48("27866") ? parseAnalysis(selectedItem).criteria_met || parseAnalysis(selectedItem).criteria_met.length > 0 : stryMutAct_9fa48("27865") ? true : (stryCov_9fa48("27865", "27866"), parseAnalysis(selectedItem).criteria_met && (stryMutAct_9fa48("27869") ? parseAnalysis(selectedItem).criteria_met.length <= 0 : stryMutAct_9fa48("27868") ? parseAnalysis(selectedItem).criteria_met.length >= 0 : stryMutAct_9fa48("27867") ? true : (stryCov_9fa48("27867", "27868", "27869"), parseAnalysis(selectedItem).criteria_met.length > 0)))) && <Box mb={3}>
                      <Typography variant="subtitle1" sx={stryMutAct_9fa48("27870") ? {} : (stryCov_9fa48("27870"), {
                  fontWeight: stryMutAct_9fa48("27871") ? "" : (stryCov_9fa48("27871"), 'bold'),
                  mb: 1
                })}>
                        Criteria Met:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {parseAnalysis(selectedItem).criteria_met.map(stryMutAct_9fa48("27872") ? () => undefined : (stryCov_9fa48("27872"), (criterion, idx) => <Chip key={idx} label={criterion} color="success" size="small" />))}
                      </Box>
                    </Box>)}
                  
                  {/* Areas for Improvement */}
                  {stryMutAct_9fa48("27875") ? parseAnalysis(selectedItem).areas_for_improvement && parseAnalysis(selectedItem).areas_for_improvement.length > 0 || <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Areas for Improvement:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {parseAnalysis(selectedItem).areas_for_improvement.map((area, idx) => <Chip key={idx} label={area} color="warning" size="small" />)}
                      </Box>
                    </Box> : stryMutAct_9fa48("27874") ? false : stryMutAct_9fa48("27873") ? true : (stryCov_9fa48("27873", "27874", "27875"), (stryMutAct_9fa48("27877") ? parseAnalysis(selectedItem).areas_for_improvement || parseAnalysis(selectedItem).areas_for_improvement.length > 0 : stryMutAct_9fa48("27876") ? true : (stryCov_9fa48("27876", "27877"), parseAnalysis(selectedItem).areas_for_improvement && (stryMutAct_9fa48("27880") ? parseAnalysis(selectedItem).areas_for_improvement.length <= 0 : stryMutAct_9fa48("27879") ? parseAnalysis(selectedItem).areas_for_improvement.length >= 0 : stryMutAct_9fa48("27878") ? true : (stryCov_9fa48("27878", "27879", "27880"), parseAnalysis(selectedItem).areas_for_improvement.length > 0)))) && <Box mb={3}>
                      <Typography variant="subtitle1" sx={stryMutAct_9fa48("27881") ? {} : (stryCov_9fa48("27881"), {
                  fontWeight: stryMutAct_9fa48("27882") ? "" : (stryCov_9fa48("27882"), 'bold'),
                  mb: 1
                })}>
                        Areas for Improvement:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {parseAnalysis(selectedItem).areas_for_improvement.map(stryMutAct_9fa48("27883") ? () => undefined : (stryCov_9fa48("27883"), (area, idx) => <Chip key={idx} label={area} color="warning" size="small" />))}
                      </Box>
                    </Box>)}
                  
                  {/* Specific Findings */}
                  {stryMutAct_9fa48("27886") ? parseAnalysis(selectedItem).specific_findings || <Box mb={3}>
                      <Typography variant="subtitle1" sx={{
                  fontWeight: 'bold',
                  mb: 1
                }}>
                        Specific Findings:
                      </Typography>
                      
                      {Object.entries(parseAnalysis(selectedItem).specific_findings).map(([category, findings], idx) => <Box key={idx} mb={2}>
                          <Typography variant="subtitle2" sx={{
                    fontWeight: 'bold',
                    mt: 2
                  }}>
                            {category}:
                          </Typography>
                          
                          {findings.strengths && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(findings.strengths) ? findings.strengths.map((strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {findings.strengths}
                                  </Typography>}
                              </Box>
                            </Box>}
                          
                          {findings.weaknesses && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(findings.weaknesses) ? findings.weaknesses.map((weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {findings.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box>}
                          
                          {findings.score && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Score: {findings.score}
                              </Typography>
                            </Box>}
                        </Box>)}
                    </Box> : stryMutAct_9fa48("27885") ? false : stryMutAct_9fa48("27884") ? true : (stryCov_9fa48("27884", "27885", "27886"), parseAnalysis(selectedItem).specific_findings && <Box mb={3}>
                      <Typography variant="subtitle1" sx={stryMutAct_9fa48("27887") ? {} : (stryCov_9fa48("27887"), {
                  fontWeight: stryMutAct_9fa48("27888") ? "" : (stryCov_9fa48("27888"), 'bold'),
                  mb: 1
                })}>
                        Specific Findings:
                      </Typography>
                      
                      {Object.entries(parseAnalysis(selectedItem).specific_findings).map(stryMutAct_9fa48("27889") ? () => undefined : (stryCov_9fa48("27889"), ([category, findings], idx) => <Box key={idx} mb={2}>
                          <Typography variant="subtitle2" sx={stryMutAct_9fa48("27890") ? {} : (stryCov_9fa48("27890"), {
                    fontWeight: stryMutAct_9fa48("27891") ? "" : (stryCov_9fa48("27891"), 'bold'),
                    mt: 2
                  })}>
                            {category}:
                          </Typography>
                          
                          {stryMutAct_9fa48("27894") ? findings.strengths || <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(findings.strengths) ? findings.strengths.map((strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {findings.strengths}
                                  </Typography>}
                              </Box>
                            </Box> : stryMutAct_9fa48("27893") ? false : stryMutAct_9fa48("27892") ? true : (stryCov_9fa48("27892", "27893", "27894"), findings.strengths && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={stryMutAct_9fa48("27895") ? {} : (stryCov_9fa48("27895"), {
                      fontWeight: stryMutAct_9fa48("27896") ? "" : (stryCov_9fa48("27896"), 'bold')
                    })}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={stryMutAct_9fa48("27897") ? {} : (stryCov_9fa48("27897"), {
                      mt: 0.5,
                      pl: 2
                    })}>
                                {Array.isArray(findings.strengths) ? findings.strengths.map(stryMutAct_9fa48("27898") ? () => undefined : (stryCov_9fa48("27898"), (strength, sIdx) => <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>)) : <Typography component="li" variant="body2">
                                    {findings.strengths}
                                  </Typography>}
                              </Box>
                            </Box>)}
                          
                          {stryMutAct_9fa48("27901") ? findings.weaknesses || <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{
                      mt: 0.5,
                      pl: 2
                    }}>
                                {Array.isArray(findings.weaknesses) ? findings.weaknesses.map((weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>) : <Typography component="li" variant="body2">
                                    {findings.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box> : stryMutAct_9fa48("27900") ? false : stryMutAct_9fa48("27899") ? true : (stryCov_9fa48("27899", "27900", "27901"), findings.weaknesses && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={stryMutAct_9fa48("27902") ? {} : (stryCov_9fa48("27902"), {
                      fontWeight: stryMutAct_9fa48("27903") ? "" : (stryCov_9fa48("27903"), 'bold')
                    })}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={stryMutAct_9fa48("27904") ? {} : (stryCov_9fa48("27904"), {
                      mt: 0.5,
                      pl: 2
                    })}>
                                {Array.isArray(findings.weaknesses) ? findings.weaknesses.map(stryMutAct_9fa48("27905") ? () => undefined : (stryCov_9fa48("27905"), (weakness, wIdx) => <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>)) : <Typography component="li" variant="body2">
                                    {findings.weaknesses}
                                  </Typography>}
                              </Box>
                            </Box>)}
                          
                          {stryMutAct_9fa48("27908") ? findings.score || <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                Score: {findings.score}
                              </Typography>
                            </Box> : stryMutAct_9fa48("27907") ? false : stryMutAct_9fa48("27906") ? true : (stryCov_9fa48("27906", "27907", "27908"), findings.score && <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={stryMutAct_9fa48("27909") ? {} : (stryCov_9fa48("27909"), {
                      fontWeight: stryMutAct_9fa48("27910") ? "" : (stryCov_9fa48("27910"), 'bold')
                    })}>
                                Score: {findings.score}
                              </Typography>
                            </Box>)}
                        </Box>))}
                    </Box>)}
                </Box>)}
            </>)}
        </Box>
      </Modal>
    </Box>;
  }
};
export default WorkProductSection;