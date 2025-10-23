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
import { Box, Typography, CircularProgress, Divider, Grid, Card, CardContent } from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import { fetchExternalPeerFeedback } from '../../../utils/statsApi';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MonthFilter from '../../../components/MonthFilter';
const FeedbackSection = ({
  cohortMonth
}) => {
  if (stryMutAct_9fa48("26771")) {
    {}
  } else {
    stryCov_9fa48("26771");
    const {
      user,
      token
    } = useAuth();
    const [feedbackData, setFeedbackData] = useState(null);
    const [loading, setLoading] = useState(stryMutAct_9fa48("26772") ? false : (stryCov_9fa48("26772"), true));
    const [error, setError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(stryMutAct_9fa48("26773") ? "" : (stryCov_9fa48("26773"), 'all'));
    useEffect(() => {
      if (stryMutAct_9fa48("26774")) {
        {}
      } else {
        stryCov_9fa48("26774");
        const loadFeedbackData = async () => {
          if (stryMutAct_9fa48("26775")) {
            {}
          } else {
            stryCov_9fa48("26775");
            try {
              if (stryMutAct_9fa48("26776")) {
                {}
              } else {
                stryCov_9fa48("26776");
                console.log(stryMutAct_9fa48("26777") ? "" : (stryCov_9fa48("26777"), 'Starting to fetch peer feedback data...'));
                setLoading(stryMutAct_9fa48("26778") ? false : (stryCov_9fa48("26778"), true));

                // Debug what's in the auth context
                console.log(stryMutAct_9fa48("26779") ? "" : (stryCov_9fa48("26779"), 'Auth context user:'), user);
                console.log(stryMutAct_9fa48("26780") ? "" : (stryCov_9fa48("26780"), 'Cohort month:'), cohortMonth);

                // Extract user ID from auth context
                const userId = stryMutAct_9fa48("26783") ? user?.user_id && 25 : stryMutAct_9fa48("26782") ? false : stryMutAct_9fa48("26781") ? true : (stryCov_9fa48("26781", "26782", "26783"), (stryMutAct_9fa48("26784") ? user.user_id : (stryCov_9fa48("26784"), user?.user_id)) || 25); // Use user_id from context or fallback to 25
                console.log(stryMutAct_9fa48("26785") ? "" : (stryCov_9fa48("26785"), 'Using user ID:'), userId);
                const data = await fetchExternalPeerFeedback(userId, selectedMonth);
                console.log(stryMutAct_9fa48("26786") ? "" : (stryCov_9fa48("26786"), 'Received external peer feedback data:'), data);

                // Filter out feedback items with error messages
                const filteredData = stryMutAct_9fa48("26787") ? data : (stryCov_9fa48("26787"), data.filter(stryMutAct_9fa48("26788") ? () => undefined : (stryCov_9fa48("26788"), item => stryMutAct_9fa48("26791") ? item.summary || !item.summary.includes('Error analyzing feedback') : stryMutAct_9fa48("26790") ? false : stryMutAct_9fa48("26789") ? true : (stryCov_9fa48("26789", "26790", "26791"), item.summary && (stryMutAct_9fa48("26792") ? item.summary.includes('Error analyzing feedback') : (stryCov_9fa48("26792"), !item.summary.includes(stryMutAct_9fa48("26793") ? "" : (stryCov_9fa48("26793"), 'Error analyzing feedback'))))))));
                console.log(stryMutAct_9fa48("26794") ? "" : (stryCov_9fa48("26794"), 'Filtered feedback data:'), filteredData);
                setFeedbackData(filteredData);
                setError(null);
              }
            } catch (err) {
              if (stryMutAct_9fa48("26795")) {
                {}
              } else {
                stryCov_9fa48("26795");
                console.error(stryMutAct_9fa48("26796") ? "" : (stryCov_9fa48("26796"), 'Failed to fetch peer feedback data:'), err);
                setError(stryMutAct_9fa48("26799") ? err.message && 'Failed to load peer feedback data' : stryMutAct_9fa48("26798") ? false : stryMutAct_9fa48("26797") ? true : (stryCov_9fa48("26797", "26798", "26799"), err.message || (stryMutAct_9fa48("26800") ? "" : (stryCov_9fa48("26800"), 'Failed to load peer feedback data'))));
              }
            } finally {
              if (stryMutAct_9fa48("26801")) {
                {}
              } else {
                stryCov_9fa48("26801");
                setLoading(stryMutAct_9fa48("26802") ? true : (stryCov_9fa48("26802"), false));
              }
            }
          }
        };
        loadFeedbackData();
      }
    }, stryMutAct_9fa48("26803") ? [] : (stryCov_9fa48("26803"), [user, token, selectedMonth, cohortMonth]));
    const handleMonthChange = month => {
      if (stryMutAct_9fa48("26804")) {
        {}
      } else {
        stryCov_9fa48("26804");
        setSelectedMonth(month);
      }
    };
    const formatDate = timestamp => {
      if (stryMutAct_9fa48("26805")) {
        {}
      } else {
        stryCov_9fa48("26805");
        if (stryMutAct_9fa48("26808") ? !timestamp && !timestamp.value : stryMutAct_9fa48("26807") ? false : stryMutAct_9fa48("26806") ? true : (stryCov_9fa48("26806", "26807", "26808"), (stryMutAct_9fa48("26809") ? timestamp : (stryCov_9fa48("26809"), !timestamp)) || (stryMutAct_9fa48("26810") ? timestamp.value : (stryCov_9fa48("26810"), !timestamp.value)))) return stryMutAct_9fa48("26811") ? "" : (stryCov_9fa48("26811"), 'Unknown date');

        // Parse the timestamp value (which is in format: '2025-05-20T01:54:19.570238000Z')
        const date = new Date(timestamp.value);
        return date.toLocaleDateString(undefined, stryMutAct_9fa48("26812") ? {} : (stryCov_9fa48("26812"), {
          year: stryMutAct_9fa48("26813") ? "" : (stryCov_9fa48("26813"), 'numeric'),
          month: stryMutAct_9fa48("26814") ? "" : (stryCov_9fa48("26814"), 'short'),
          day: stryMutAct_9fa48("26815") ? "" : (stryCov_9fa48("26815"), 'numeric')
        }));
      }
    };
    if (stryMutAct_9fa48("26817") ? false : stryMutAct_9fa48("26816") ? true : (stryCov_9fa48("26816", "26817"), loading)) {
      if (stryMutAct_9fa48("26818")) {
        {}
      } else {
        stryCov_9fa48("26818");
        return <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress size={24} />
      </Box>;
      }
    }
    if (stryMutAct_9fa48("26820") ? false : stryMutAct_9fa48("26819") ? true : (stryCov_9fa48("26819", "26820"), error)) {
      if (stryMutAct_9fa48("26821")) {
        {}
      } else {
        stryCov_9fa48("26821");
        return <Box textAlign="center" py={4}>
        <Typography color="error" variant="h6" gutterBottom>
          Error Loading Peer Feedback
        </Typography>
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      </Box>;
      }
    }
    if (stryMutAct_9fa48("26824") ? (!feedbackData || !Array.isArray(feedbackData)) && feedbackData.length === 0 : stryMutAct_9fa48("26823") ? false : stryMutAct_9fa48("26822") ? true : (stryCov_9fa48("26822", "26823", "26824"), (stryMutAct_9fa48("26826") ? !feedbackData && !Array.isArray(feedbackData) : stryMutAct_9fa48("26825") ? false : (stryCov_9fa48("26825", "26826"), (stryMutAct_9fa48("26827") ? feedbackData : (stryCov_9fa48("26827"), !feedbackData)) || (stryMutAct_9fa48("26828") ? Array.isArray(feedbackData) : (stryCov_9fa48("26828"), !Array.isArray(feedbackData))))) || (stryMutAct_9fa48("26830") ? feedbackData.length !== 0 : stryMutAct_9fa48("26829") ? false : (stryCov_9fa48("26829", "26830"), feedbackData.length === 0)))) {
      if (stryMutAct_9fa48("26831")) {
        {}
      } else {
        stryCov_9fa48("26831");
        return <Box textAlign="center" py={4}>
        <Box sx={stryMutAct_9fa48("26832") ? {} : (stryCov_9fa48("26832"), {
            position: stryMutAct_9fa48("26833") ? "" : (stryCov_9fa48("26833"), 'relative'),
            mb: 4
          })}>
          <Typography variant="h6" sx={stryMutAct_9fa48("26834") ? {} : (stryCov_9fa48("26834"), {
              color: stryMutAct_9fa48("26835") ? "" : (stryCov_9fa48("26835"), 'var(--color-text-primary)'),
              mb: 3
            })}>
            Peer Feedback
          </Typography>
          
          <Box sx={stryMutAct_9fa48("26836") ? {} : (stryCov_9fa48("26836"), {
              position: stryMutAct_9fa48("26837") ? "" : (stryCov_9fa48("26837"), 'absolute'),
              right: 0,
              top: 0
            })}>
            <MonthFilter selectedMonth={selectedMonth} onMonthChange={handleMonthChange} cohortMonth={cohortMonth} />
          </Box>
        </Box>
        <Typography sx={stryMutAct_9fa48("26838") ? {} : (stryCov_9fa48("26838"), {
            color: stryMutAct_9fa48("26839") ? "" : (stryCov_9fa48("26839"), 'var(--color-text-secondary)')
          })}>
          No peer feedback available for the selected month.
        </Typography>
      </Box>;
      }
    }
    return <Box className="feedback-section">
      <Box sx={stryMutAct_9fa48("26840") ? {} : (stryCov_9fa48("26840"), {
        position: stryMutAct_9fa48("26841") ? "" : (stryCov_9fa48("26841"), 'relative'),
        mb: 3
      })}>
        <Typography variant="h6" sx={stryMutAct_9fa48("26842") ? {} : (stryCov_9fa48("26842"), {
          color: stryMutAct_9fa48("26843") ? "" : (stryCov_9fa48("26843"), 'var(--color-text-primary)'),
          mb: 3
        })}>
          Peer Feedback
        </Typography>
        
        <Box sx={stryMutAct_9fa48("26844") ? {} : (stryCov_9fa48("26844"), {
          position: stryMutAct_9fa48("26845") ? "" : (stryCov_9fa48("26845"), 'absolute'),
          right: 0,
          top: 0
        })}>
          <MonthFilter selectedMonth={selectedMonth} onMonthChange={handleMonthChange} cohortMonth={cohortMonth} />
        </Box>
      </Box>
      
      <Grid container spacing={2}>
        {feedbackData.map(stryMutAct_9fa48("26846") ? () => undefined : (stryCov_9fa48("26846"), (item, index) => <Grid item xs={12} key={index}>
            <Card variant="outlined" sx={stryMutAct_9fa48("26847") ? {} : (stryCov_9fa48("26847"), {
            backgroundColor: stryMutAct_9fa48("26848") ? "" : (stryCov_9fa48("26848"), 'var(--color-background-darker)'),
            border: stryMutAct_9fa48("26849") ? "" : (stryCov_9fa48("26849"), '1px solid var(--color-border)')
          })}>
              <CardContent sx={stryMutAct_9fa48("26850") ? {} : (stryCov_9fa48("26850"), {
              p: 2
            })}>
                <Box display="flex" alignItems="center" mb={1.5}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CalendarTodayIcon fontSize="small" sx={stryMutAct_9fa48("26851") ? {} : (stryCov_9fa48("26851"), {
                    color: stryMutAct_9fa48("26852") ? "" : (stryCov_9fa48("26852"), 'var(--color-text-secondary)'),
                    fontSize: 14
                  })} />
                    <Typography variant="caption" sx={stryMutAct_9fa48("26853") ? {} : (stryCov_9fa48("26853"), {
                    color: stryMutAct_9fa48("26854") ? "" : (stryCov_9fa48("26854"), 'var(--color-text-secondary)')
                  })}>
                      {formatDate(item.timestamp)}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" sx={stryMutAct_9fa48("26855") ? {} : (stryCov_9fa48("26855"), {
                color: stryMutAct_9fa48("26856") ? "" : (stryCov_9fa48("26856"), 'var(--color-text-primary)'),
                whiteSpace: stryMutAct_9fa48("26857") ? "" : (stryCov_9fa48("26857"), 'pre-wrap'),
                py: 1,
                px: 2,
                backgroundColor: stryMutAct_9fa48("26858") ? "" : (stryCov_9fa48("26858"), 'var(--color-background)'),
                borderRadius: 1,
                textAlign: stryMutAct_9fa48("26859") ? "" : (stryCov_9fa48("26859"), 'left')
              })}>
                  {stryMutAct_9fa48("26862") ? item.summary && 'No summary available.' : stryMutAct_9fa48("26861") ? false : stryMutAct_9fa48("26860") ? true : (stryCov_9fa48("26860", "26861", "26862"), item.summary || (stryMutAct_9fa48("26863") ? "" : (stryCov_9fa48("26863"), 'No summary available.')))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>))}
      </Grid>
    </Box>;
  }
};
export default FeedbackSection;