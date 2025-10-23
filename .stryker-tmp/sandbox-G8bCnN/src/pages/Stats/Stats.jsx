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
import { Box, Typography, CircularProgress, Tabs, Tab, Container } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { fetchUserStats } from '../../utils/statsApi';
import FeedbackSection from './sections/FeedbackSection';
import WorkProductSection from './sections/WorkProductSection';
import ComprehensionSection from './sections/ComprehensionSection';
import ResourcesSection from './sections/ResourcesSection';
import './Stats.css';
const Stats = () => {
  if (stryMutAct_9fa48("25833")) {
    {}
  } else {
    stryCov_9fa48("25833");
    const {
      user,
      token
    } = useAuth();
    const [loading, setLoading] = useState(stryMutAct_9fa48("25834") ? false : (stryCov_9fa48("25834"), true));
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [cohortMonth, setCohortMonth] = useState(null);
    useEffect(() => {
      if (stryMutAct_9fa48("25835")) {
        {}
      } else {
        stryCov_9fa48("25835");
        const loadUserStats = async () => {
          if (stryMutAct_9fa48("25836")) {
            {}
          } else {
            stryCov_9fa48("25836");
            try {
              if (stryMutAct_9fa48("25837")) {
                {}
              } else {
                stryCov_9fa48("25837");
                setLoading(stryMutAct_9fa48("25838") ? false : (stryCov_9fa48("25838"), true));
                const userStats = await fetchUserStats(token);
                setStats(userStats);

                // Extract cohort month from the first task's day date if available
                if (stryMutAct_9fa48("25841") ? userStats.tasks || userStats.tasks.length > 0 : stryMutAct_9fa48("25840") ? false : stryMutAct_9fa48("25839") ? true : (stryCov_9fa48("25839", "25840", "25841"), userStats.tasks && (stryMutAct_9fa48("25844") ? userStats.tasks.length <= 0 : stryMutAct_9fa48("25843") ? userStats.tasks.length >= 0 : stryMutAct_9fa48("25842") ? true : (stryCov_9fa48("25842", "25843", "25844"), userStats.tasks.length > 0)))) {
                  if (stryMutAct_9fa48("25845")) {
                    {}
                  } else {
                    stryCov_9fa48("25845");
                    const firstTask = userStats.tasks[0];
                    if (stryMutAct_9fa48("25847") ? false : stryMutAct_9fa48("25846") ? true : (stryCov_9fa48("25846", "25847"), firstTask.assigned_date)) {
                      if (stryMutAct_9fa48("25848")) {
                        {}
                      } else {
                        stryCov_9fa48("25848");
                        const date = new Date(firstTask.assigned_date);
                        // Format as "Month YYYY" (e.g., "March 2025")
                        const cohortMonthStr = date.toLocaleDateString(stryMutAct_9fa48("25849") ? "" : (stryCov_9fa48("25849"), 'en-US'), stryMutAct_9fa48("25850") ? {} : (stryCov_9fa48("25850"), {
                          month: stryMutAct_9fa48("25851") ? "" : (stryCov_9fa48("25851"), 'long'),
                          year: stryMutAct_9fa48("25852") ? "" : (stryCov_9fa48("25852"), 'numeric')
                        }));
                        setCohortMonth(cohortMonthStr);
                      }
                    }
                  }
                }
                setError(null);
              }
            } catch (err) {
              if (stryMutAct_9fa48("25853")) {
                {}
              } else {
                stryCov_9fa48("25853");
                console.error(stryMutAct_9fa48("25854") ? "" : (stryCov_9fa48("25854"), 'Failed to fetch user stats:'), err);
                setError(stryMutAct_9fa48("25855") ? "" : (stryCov_9fa48("25855"), 'Failed to load your statistics. Please try again later.'));
              }
            } finally {
              if (stryMutAct_9fa48("25856")) {
                {}
              } else {
                stryCov_9fa48("25856");
                setLoading(stryMutAct_9fa48("25857") ? true : (stryCov_9fa48("25857"), false));
              }
            }
          }
        };
        if (stryMutAct_9fa48("25859") ? false : stryMutAct_9fa48("25858") ? true : (stryCov_9fa48("25858", "25859"), token)) {
          if (stryMutAct_9fa48("25860")) {
            {}
          } else {
            stryCov_9fa48("25860");
            loadUserStats();
          }
        }
      }
    }, stryMutAct_9fa48("25861") ? [] : (stryCov_9fa48("25861"), [token]));
    const handleTabChange = (event, newValue) => {
      if (stryMutAct_9fa48("25862")) {
        {}
      } else {
        stryCov_9fa48("25862");
        setActiveTab(newValue);
      }
    };
    if (stryMutAct_9fa48("25864") ? false : stryMutAct_9fa48("25863") ? true : (stryCov_9fa48("25863", "25864"), loading)) {
      if (stryMutAct_9fa48("25865")) {
        {}
      } else {
        stryCov_9fa48("25865");
        return <Box className="stats__loading-container">
        <CircularProgress style={stryMutAct_9fa48("25866") ? {} : (stryCov_9fa48("25866"), {
            color: stryMutAct_9fa48("25867") ? "" : (stryCov_9fa48("25867"), 'var(--color-primary)')
          })} />
        <Typography variant="body1">Loading your statistics...</Typography>
      </Box>;
      }
    }
    if (stryMutAct_9fa48("25869") ? false : stryMutAct_9fa48("25868") ? true : (stryCov_9fa48("25868", "25869"), error)) {
      if (stryMutAct_9fa48("25870")) {
        {}
      } else {
        stryCov_9fa48("25870");
        return <Box className="stats__error-container">
        <Typography variant="h6" style={stryMutAct_9fa48("25871") ? {} : (stryCov_9fa48("25871"), {
            color: stryMutAct_9fa48("25872") ? "" : (stryCov_9fa48("25872"), 'var(--color-error)')
          })}>
          {error}
        </Typography>
      </Box>;
      }
    }
    return <Box className="stats">
      <Container maxWidth="xl" sx={stryMutAct_9fa48("25873") ? {} : (stryCov_9fa48("25873"), {
        pt: 1,
        pb: 1,
        height: stryMutAct_9fa48("25874") ? "" : (stryCov_9fa48("25874"), '100%'),
        display: stryMutAct_9fa48("25875") ? "" : (stryCov_9fa48("25875"), 'flex'),
        flexDirection: stryMutAct_9fa48("25876") ? "" : (stryCov_9fa48("25876"), 'column')
      })}>
        {stryMutAct_9fa48("25879") ? stats || <>
            <Box className="stats__tabs-container">
              <Tabs value={activeTab} onChange={handleTabChange} className="stats__tabs" variant="fullWidth" aria-label="Statistics tabs">
                <Tab label="Work Product" id="stats-tab-0" aria-controls="stats-tabpanel-0" />
                <Tab label="Comprehension" id="stats-tab-1" aria-controls="stats-tabpanel-1" />
                <Tab label="Feedback" id="stats-tab-2" aria-controls="stats-tabpanel-2" />
                <Tab label="Resources" id="stats-tab-3" aria-controls="stats-tabpanel-3" />
              </Tabs>

              <Box className="stats__tab-content" role="tabpanel" id={`stats-tabpanel-${activeTab}`} aria-labelledby={`stats-tab-${activeTab}`}>
                {activeTab === 0 && <WorkProductSection cohortMonth={cohortMonth} />}
                {activeTab === 1 && <ComprehensionSection cohortMonth={cohortMonth} />}
                {activeTab === 2 && <FeedbackSection feedback={stats.feedback} user={user} cohortMonth={cohortMonth} />}
                {activeTab === 3 && <ResourcesSection cohortMonth={cohortMonth} />}
              </Box>
            </Box>
          </> : stryMutAct_9fa48("25878") ? false : stryMutAct_9fa48("25877") ? true : (stryCov_9fa48("25877", "25878", "25879"), stats && <>
            <Box className="stats__tabs-container">
              <Tabs value={activeTab} onChange={handleTabChange} className="stats__tabs" variant="fullWidth" aria-label="Statistics tabs">
                <Tab label="Work Product" id="stats-tab-0" aria-controls="stats-tabpanel-0" />
                <Tab label="Comprehension" id="stats-tab-1" aria-controls="stats-tabpanel-1" />
                <Tab label="Feedback" id="stats-tab-2" aria-controls="stats-tabpanel-2" />
                <Tab label="Resources" id="stats-tab-3" aria-controls="stats-tabpanel-3" />
              </Tabs>

              <Box className="stats__tab-content" role="tabpanel" id={stryMutAct_9fa48("25880") ? `` : (stryCov_9fa48("25880"), `stats-tabpanel-${activeTab}`)} aria-labelledby={stryMutAct_9fa48("25881") ? `` : (stryCov_9fa48("25881"), `stats-tab-${activeTab}`)}>
                {stryMutAct_9fa48("25884") ? activeTab === 0 || <WorkProductSection cohortMonth={cohortMonth} /> : stryMutAct_9fa48("25883") ? false : stryMutAct_9fa48("25882") ? true : (stryCov_9fa48("25882", "25883", "25884"), (stryMutAct_9fa48("25886") ? activeTab !== 0 : stryMutAct_9fa48("25885") ? true : (stryCov_9fa48("25885", "25886"), activeTab === 0)) && <WorkProductSection cohortMonth={cohortMonth} />)}
                {stryMutAct_9fa48("25889") ? activeTab === 1 || <ComprehensionSection cohortMonth={cohortMonth} /> : stryMutAct_9fa48("25888") ? false : stryMutAct_9fa48("25887") ? true : (stryCov_9fa48("25887", "25888", "25889"), (stryMutAct_9fa48("25891") ? activeTab !== 1 : stryMutAct_9fa48("25890") ? true : (stryCov_9fa48("25890", "25891"), activeTab === 1)) && <ComprehensionSection cohortMonth={cohortMonth} />)}
                {stryMutAct_9fa48("25894") ? activeTab === 2 || <FeedbackSection feedback={stats.feedback} user={user} cohortMonth={cohortMonth} /> : stryMutAct_9fa48("25893") ? false : stryMutAct_9fa48("25892") ? true : (stryCov_9fa48("25892", "25893", "25894"), (stryMutAct_9fa48("25896") ? activeTab !== 2 : stryMutAct_9fa48("25895") ? true : (stryCov_9fa48("25895", "25896"), activeTab === 2)) && <FeedbackSection feedback={stats.feedback} user={user} cohortMonth={cohortMonth} />)}
                {stryMutAct_9fa48("25899") ? activeTab === 3 || <ResourcesSection cohortMonth={cohortMonth} /> : stryMutAct_9fa48("25898") ? false : stryMutAct_9fa48("25897") ? true : (stryCov_9fa48("25897", "25898", "25899"), (stryMutAct_9fa48("25901") ? activeTab !== 3 : stryMutAct_9fa48("25900") ? true : (stryCov_9fa48("25900", "25901"), activeTab === 3)) && <ResourcesSection cohortMonth={cohortMonth} />)}
              </Box>
            </Box>
          </>)}
      </Container>
    </Box>;
  }
};
export default Stats;