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
import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Card, CardContent, CircularProgress, Chip, Divider, Alert, Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axios from 'axios';
const AITrendAnalysis = ({
  analysisType,
  cohortMonth,
  title
}) => {
  if (stryMutAct_9fa48("69")) {
    {}
  } else {
    stryCov_9fa48("69");
    const [startDate, setStartDate] = useState(stryMutAct_9fa48("70") ? "Stryker was here!" : (stryCov_9fa48("70"), ''));
    const [endDate, setEndDate] = useState(stryMutAct_9fa48("71") ? "Stryker was here!" : (stryCov_9fa48("71"), ''));
    const [loading, setLoading] = useState(stryMutAct_9fa48("72") ? true : (stryCov_9fa48("72"), false));
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(stryMutAct_9fa48("73") ? true : (stryCov_9fa48("73"), false));

    // Calculate cohort start date for date input limits
    const getCohortStartDate = () => {
      if (stryMutAct_9fa48("74")) {
        {}
      } else {
        stryCov_9fa48("74");
        if (stryMutAct_9fa48("77") ? !cohortMonth && typeof cohortMonth !== 'string' : stryMutAct_9fa48("76") ? false : stryMutAct_9fa48("75") ? true : (stryCov_9fa48("75", "76", "77"), (stryMutAct_9fa48("78") ? cohortMonth : (stryCov_9fa48("78"), !cohortMonth)) || (stryMutAct_9fa48("80") ? typeof cohortMonth === 'string' : stryMutAct_9fa48("79") ? false : (stryCov_9fa48("79", "80"), typeof cohortMonth !== (stryMutAct_9fa48("81") ? "" : (stryCov_9fa48("81"), 'string')))))) {
          if (stryMutAct_9fa48("82")) {
            {}
          } else {
            stryCov_9fa48("82");
            return stryMutAct_9fa48("83") ? "" : (stryCov_9fa48("83"), '2024-01-01');
          }
        }
        try {
          if (stryMutAct_9fa48("84")) {
            {}
          } else {
            stryCov_9fa48("84");
            const [year, month] = cohortMonth.split(stryMutAct_9fa48("85") ? "" : (stryCov_9fa48("85"), '-')).map(Number);

            // Validate year and month
            if (stryMutAct_9fa48("88") ? (!year || !month || year < 2020 || year > 2030 || month < 1) && month > 12 : stryMutAct_9fa48("87") ? false : stryMutAct_9fa48("86") ? true : (stryCov_9fa48("86", "87", "88"), (stryMutAct_9fa48("90") ? (!year || !month || year < 2020 || year > 2030) && month < 1 : stryMutAct_9fa48("89") ? false : (stryCov_9fa48("89", "90"), (stryMutAct_9fa48("92") ? (!year || !month || year < 2020) && year > 2030 : stryMutAct_9fa48("91") ? false : (stryCov_9fa48("91", "92"), (stryMutAct_9fa48("94") ? (!year || !month) && year < 2020 : stryMutAct_9fa48("93") ? false : (stryCov_9fa48("93", "94"), (stryMutAct_9fa48("96") ? !year && !month : stryMutAct_9fa48("95") ? false : (stryCov_9fa48("95", "96"), (stryMutAct_9fa48("97") ? year : (stryCov_9fa48("97"), !year)) || (stryMutAct_9fa48("98") ? month : (stryCov_9fa48("98"), !month)))) || (stryMutAct_9fa48("101") ? year >= 2020 : stryMutAct_9fa48("100") ? year <= 2020 : stryMutAct_9fa48("99") ? false : (stryCov_9fa48("99", "100", "101"), year < 2020)))) || (stryMutAct_9fa48("104") ? year <= 2030 : stryMutAct_9fa48("103") ? year >= 2030 : stryMutAct_9fa48("102") ? false : (stryCov_9fa48("102", "103", "104"), year > 2030)))) || (stryMutAct_9fa48("107") ? month >= 1 : stryMutAct_9fa48("106") ? month <= 1 : stryMutAct_9fa48("105") ? false : (stryCov_9fa48("105", "106", "107"), month < 1)))) || (stryMutAct_9fa48("110") ? month <= 12 : stryMutAct_9fa48("109") ? month >= 12 : stryMutAct_9fa48("108") ? false : (stryCov_9fa48("108", "109", "110"), month > 12)))) {
              if (stryMutAct_9fa48("111")) {
                {}
              } else {
                stryCov_9fa48("111");
                return stryMutAct_9fa48("112") ? "" : (stryCov_9fa48("112"), '2024-01-01');
              }
            }
            const date = new Date(year, stryMutAct_9fa48("113") ? month + 1 : (stryCov_9fa48("113"), month - 1), 1);

            // Check if the date is valid
            if (stryMutAct_9fa48("115") ? false : stryMutAct_9fa48("114") ? true : (stryCov_9fa48("114", "115"), isNaN(date.getTime()))) {
              if (stryMutAct_9fa48("116")) {
                {}
              } else {
                stryCov_9fa48("116");
                return stryMutAct_9fa48("117") ? "" : (stryCov_9fa48("117"), '2024-01-01');
              }
            }
            return date.toISOString().split(stryMutAct_9fa48("118") ? "" : (stryCov_9fa48("118"), 'T'))[0];
          }
        } catch (error) {
          if (stryMutAct_9fa48("119")) {
            {}
          } else {
            stryCov_9fa48("119");
            console.error(stryMutAct_9fa48("120") ? "" : (stryCov_9fa48("120"), 'Error parsing cohort month:'), error);
            return stryMutAct_9fa48("121") ? "" : (stryCov_9fa48("121"), '2024-01-01');
          }
        }
      }
    };
    const getTodayDate = () => {
      if (stryMutAct_9fa48("122")) {
        {}
      } else {
        stryCov_9fa48("122");
        return new Date().toISOString().split(stryMutAct_9fa48("123") ? "" : (stryCov_9fa48("123"), 'T'))[0];
      }
    };
    const handleGenerateAnalysis = async () => {
      if (stryMutAct_9fa48("124")) {
        {}
      } else {
        stryCov_9fa48("124");
        if (stryMutAct_9fa48("127") ? !startDate && !endDate : stryMutAct_9fa48("126") ? false : stryMutAct_9fa48("125") ? true : (stryCov_9fa48("125", "126", "127"), (stryMutAct_9fa48("128") ? startDate : (stryCov_9fa48("128"), !startDate)) || (stryMutAct_9fa48("129") ? endDate : (stryCov_9fa48("129"), !endDate)))) {
          if (stryMutAct_9fa48("130")) {
            {}
          } else {
            stryCov_9fa48("130");
            setError(stryMutAct_9fa48("131") ? "" : (stryCov_9fa48("131"), 'Please select both start and end dates'));
            return;
          }
        }
        if (stryMutAct_9fa48("135") ? startDate < endDate : stryMutAct_9fa48("134") ? startDate > endDate : stryMutAct_9fa48("133") ? false : stryMutAct_9fa48("132") ? true : (stryCov_9fa48("132", "133", "134", "135"), startDate >= endDate)) {
          if (stryMutAct_9fa48("136")) {
            {}
          } else {
            stryCov_9fa48("136");
            setError(stryMutAct_9fa48("137") ? "" : (stryCov_9fa48("137"), 'End date must be after start date'));
            return;
          }
        }
        setLoading(stryMutAct_9fa48("138") ? false : (stryCov_9fa48("138"), true));
        setError(null);
        try {
          if (stryMutAct_9fa48("139")) {
            {}
          } else {
            stryCov_9fa48("139");
            const token = localStorage.getItem(stryMutAct_9fa48("140") ? "" : (stryCov_9fa48("140"), 'token'));
            const response = await axios.post(stryMutAct_9fa48("141") ? `` : (stryCov_9fa48("141"), `${import.meta.env.VITE_API_URL}/api/analyze-task/trend-analysis`), stryMutAct_9fa48("142") ? {} : (stryCov_9fa48("142"), {
              startDate: startDate,
              endDate: endDate,
              analysisType: analysisType
            }), stryMutAct_9fa48("143") ? {} : (stryCov_9fa48("143"), {
              headers: stryMutAct_9fa48("144") ? {} : (stryCov_9fa48("144"), {
                'Authorization': stryMutAct_9fa48("145") ? `` : (stryCov_9fa48("145"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("146") ? "" : (stryCov_9fa48("146"), 'application/json')
              })
            }));
            setAnalysis(response.data);
            setExpanded(stryMutAct_9fa48("147") ? false : (stryCov_9fa48("147"), true));
          }
        } catch (err) {
          if (stryMutAct_9fa48("148")) {
            {}
          } else {
            stryCov_9fa48("148");
            console.error(stryMutAct_9fa48("149") ? "" : (stryCov_9fa48("149"), 'Error generating trend analysis:'), err);
            setError(stryMutAct_9fa48("152") ? err.response?.data?.error && 'Failed to generate analysis' : stryMutAct_9fa48("151") ? false : stryMutAct_9fa48("150") ? true : (stryCov_9fa48("150", "151", "152"), (stryMutAct_9fa48("154") ? err.response.data?.error : stryMutAct_9fa48("153") ? err.response?.data.error : (stryCov_9fa48("153", "154"), err.response?.data?.error)) || (stryMutAct_9fa48("155") ? "" : (stryCov_9fa48("155"), 'Failed to generate analysis'))));
          }
        } finally {
          if (stryMutAct_9fa48("156")) {
            {}
          } else {
            stryCov_9fa48("156");
            setLoading(stryMutAct_9fa48("157") ? true : (stryCov_9fa48("157"), false));
          }
        }
      }
    };
    const formatDate = dateString => {
      if (stryMutAct_9fa48("158")) {
        {}
      } else {
        stryCov_9fa48("158");
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, stryMutAct_9fa48("159") ? {} : (stryCov_9fa48("159"), {
          year: stryMutAct_9fa48("160") ? "" : (stryCov_9fa48("160"), 'numeric'),
          month: stryMutAct_9fa48("161") ? "" : (stryCov_9fa48("161"), 'long'),
          day: stryMutAct_9fa48("162") ? "" : (stryCov_9fa48("162"), 'numeric')
        }));
      }
    };
    return <Card variant="outlined" sx={stryMutAct_9fa48("163") ? {} : (stryCov_9fa48("163"), {
      mb: 3,
      backgroundColor: stryMutAct_9fa48("164") ? "" : (stryCov_9fa48("164"), '#1a1f2e'),
      border: stryMutAct_9fa48("165") ? "" : (stryCov_9fa48("165"), '1px solid var(--color-border)'),
      borderRadius: 2
    })}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <TrendingUpIcon sx={stryMutAct_9fa48("166") ? {} : (stryCov_9fa48("166"), {
            mr: 1,
            color: stryMutAct_9fa48("167") ? "" : (stryCov_9fa48("167"), 'var(--color-primary)')
          })} />
          <Typography variant="h6" sx={stryMutAct_9fa48("168") ? {} : (stryCov_9fa48("168"), {
            color: stryMutAct_9fa48("169") ? "" : (stryCov_9fa48("169"), 'var(--color-text-primary)'),
            fontWeight: stryMutAct_9fa48("170") ? "" : (stryCov_9fa48("170"), 'bold')
          })}>
            {title} Trend Analysis
          </Typography>
        </Box>

        <Typography variant="body2" sx={stryMutAct_9fa48("171") ? {} : (stryCov_9fa48("171"), {
          color: stryMutAct_9fa48("172") ? "" : (stryCov_9fa48("172"), 'var(--color-text-secondary)'),
          mb: 3
        })}>
          Generate AI-powered insights about your learning progress and trends over a selected time period.
        </Typography>

        {/* Date Selection */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
          <TextField label="Start Date" type="date" value={startDate} onChange={stryMutAct_9fa48("173") ? () => undefined : (stryCov_9fa48("173"), e => setStartDate(e.target.value))} InputLabelProps={stryMutAct_9fa48("174") ? {} : (stryCov_9fa48("174"), {
            shrink: stryMutAct_9fa48("175") ? false : (stryCov_9fa48("175"), true)
          })} inputProps={stryMutAct_9fa48("176") ? {} : (stryCov_9fa48("176"), {
            min: getCohortStartDate(),
            max: getTodayDate()
          })} size="small" sx={stryMutAct_9fa48("177") ? {} : (stryCov_9fa48("177"), {
            minWidth: 150,
            '& .MuiInputBase-root': stryMutAct_9fa48("178") ? {} : (stryCov_9fa48("178"), {
              backgroundColor: stryMutAct_9fa48("179") ? "" : (stryCov_9fa48("179"), 'rgba(255, 255, 255, 0.05)'),
              color: stryMutAct_9fa48("180") ? "" : (stryCov_9fa48("180"), 'var(--color-text-primary)')
            }),
            '& .MuiInputLabel-root': stryMutAct_9fa48("181") ? {} : (stryCov_9fa48("181"), {
              color: stryMutAct_9fa48("182") ? "" : (stryCov_9fa48("182"), 'var(--color-text-secondary)')
            })
          })} />
          
          <TextField label="End Date" type="date" value={endDate} onChange={stryMutAct_9fa48("183") ? () => undefined : (stryCov_9fa48("183"), e => setEndDate(e.target.value))} InputLabelProps={stryMutAct_9fa48("184") ? {} : (stryCov_9fa48("184"), {
            shrink: stryMutAct_9fa48("185") ? false : (stryCov_9fa48("185"), true)
          })} inputProps={stryMutAct_9fa48("186") ? {} : (stryCov_9fa48("186"), {
            min: stryMutAct_9fa48("189") ? startDate && getCohortStartDate() : stryMutAct_9fa48("188") ? false : stryMutAct_9fa48("187") ? true : (stryCov_9fa48("187", "188", "189"), startDate || getCohortStartDate()),
            max: getTodayDate()
          })} size="small" sx={stryMutAct_9fa48("190") ? {} : (stryCov_9fa48("190"), {
            minWidth: 150,
            '& .MuiInputBase-root': stryMutAct_9fa48("191") ? {} : (stryCov_9fa48("191"), {
              backgroundColor: stryMutAct_9fa48("192") ? "" : (stryCov_9fa48("192"), 'rgba(255, 255, 255, 0.05)'),
              color: stryMutAct_9fa48("193") ? "" : (stryCov_9fa48("193"), 'var(--color-text-primary)')
            }),
            '& .MuiInputLabel-root': stryMutAct_9fa48("194") ? {} : (stryCov_9fa48("194"), {
              color: stryMutAct_9fa48("195") ? "" : (stryCov_9fa48("195"), 'var(--color-text-secondary)')
            })
          })} />

          <Button variant="contained" onClick={handleGenerateAnalysis} disabled={stryMutAct_9fa48("198") ? (loading || !startDate) && !endDate : stryMutAct_9fa48("197") ? false : stryMutAct_9fa48("196") ? true : (stryCov_9fa48("196", "197", "198"), (stryMutAct_9fa48("200") ? loading && !startDate : stryMutAct_9fa48("199") ? false : (stryCov_9fa48("199", "200"), loading || (stryMutAct_9fa48("201") ? startDate : (stryCov_9fa48("201"), !startDate)))) || (stryMutAct_9fa48("202") ? endDate : (stryCov_9fa48("202"), !endDate)))} sx={stryMutAct_9fa48("203") ? {} : (stryCov_9fa48("203"), {
            backgroundColor: stryMutAct_9fa48("204") ? "" : (stryCov_9fa48("204"), 'var(--color-primary)'),
            '&:hover': stryMutAct_9fa48("205") ? {} : (stryCov_9fa48("205"), {
              backgroundColor: stryMutAct_9fa48("206") ? "" : (stryCov_9fa48("206"), 'var(--color-primary-dark)')
            })
          })}>
            {loading ? <CircularProgress size={20} color="inherit" /> : stryMutAct_9fa48("207") ? "" : (stryCov_9fa48("207"), 'Generate Analysis')}
          </Button>
        </Box>

        {/* Error Display */}
        {stryMutAct_9fa48("210") ? error || <Alert severity="error" sx={{
          mb: 2
        }}>
            {error}
          </Alert> : stryMutAct_9fa48("209") ? false : stryMutAct_9fa48("208") ? true : (stryCov_9fa48("208", "209", "210"), error && <Alert severity="error" sx={stryMutAct_9fa48("211") ? {} : (stryCov_9fa48("211"), {
          mb: 2
        })}>
            {error}
          </Alert>)}

        {/* Analysis Results */}
        {stryMutAct_9fa48("214") ? analysis || <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="subtitle1" sx={{
              color: 'var(--color-text-primary)',
              fontWeight: 'bold'
            }}>
                Analysis Results ({formatDate(analysis.period.startDate)} - {formatDate(analysis.period.endDate)})
              </Typography>
              <IconButton onClick={() => setExpanded(!expanded)}>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            {/* Statistics Summary */}
            <Box display="flex" gap={1} mb={2} flexWrap="wrap">
              <Chip label={`${analysis.dataCount} submissions`} size="small" color="primary" />
              {analysis.statistics?.averageScore > 0 && <Chip label={`${analysis.statistics.averageScore}% avg score`} size="small" color="success" />}
            </Box>

            <Collapse in={expanded}>
              {/* Summary */}
              <Box mb={3} sx={{
              textAlign: 'left'
            }}>
                <Typography variant="body1" sx={{
                color: 'var(--color-text-primary)',
                mb: 1,
                textAlign: 'left'
              }}>
                  <strong>Summary:</strong>
                </Typography>
                <Typography variant="body2" sx={{
                color: 'var(--color-text-primary)',
                opacity: 0.9,
                textAlign: 'left'
              }}>
                  {analysis.summary}
                </Typography>
              </Box>

              <Divider sx={{
              mb: 3
            }} />

              {/* Trends */}
              {analysis.trends && analysis.trends.length > 0 && <Box mb={3} sx={{
              textAlign: 'left'
            }}>
                  <Typography variant="subtitle2" sx={{
                color: 'var(--color-text-primary)',
                fontWeight: 'bold',
                mb: 1,
                textAlign: 'left'
              }}>
                    Key Trends:
                  </Typography>
                  <Box component="ul" sx={{
                pl: 2,
                m: 0,
                textAlign: 'left'
              }}>
                    {analysis.trends.map((trend, index) => <Typography key={index} component="li" variant="body2" sx={{
                  color: 'var(--color-text-primary)',
                  mb: 0.5,
                  textAlign: 'left'
                }}>
                        {trend}
                      </Typography>)}
                  </Box>
                </Box>}

              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && <Box mb={3} sx={{
              textAlign: 'left'
            }}>
                  <Typography variant="subtitle2" sx={{
                color: 'var(--color-text-primary)',
                fontWeight: 'bold',
                mb: 1,
                textAlign: 'left'
              }}>
                    Strengths:
                  </Typography>
                  <Box component="ul" sx={{
                pl: 2,
                m: 0,
                textAlign: 'left'
              }}>
                    {analysis.strengths.map((strength, index) => <Typography key={index} component="li" variant="body2" sx={{
                  color: '#2eae4f',
                  mb: 0.5,
                  textAlign: 'left',
                  fontWeight: 500
                }}>
                        {strength}
                      </Typography>)}
                  </Box>
                </Box>}

              {/* Growth Areas */}
              {analysis.growth_areas && analysis.growth_areas.length > 0 && <Box mb={3} sx={{
              textAlign: 'left'
            }}>
                  <Typography variant="subtitle2" sx={{
                color: 'var(--color-text-primary)',
                fontWeight: 'bold',
                mb: 1,
                textAlign: 'left'
              }}>
                    Growth Areas:
                  </Typography>
                  <Box component="ul" sx={{
                pl: 2,
                m: 0,
                textAlign: 'left'
              }}>
                    {analysis.growth_areas.map((area, index) => <Typography key={index} component="li" variant="body2" sx={{
                  color: '#ffab00',
                  mb: 0.5,
                  textAlign: 'left',
                  fontWeight: 500
                }}>
                        {area}
                      </Typography>)}
                  </Box>
                </Box>}

              {/* Recommendations */}
              {analysis.recommendations && analysis.recommendations.length > 0 && <Box sx={{
              textAlign: 'left'
            }}>
                  <Typography variant="subtitle2" sx={{
                color: 'var(--color-text-primary)',
                fontWeight: 'bold',
                mb: 1,
                textAlign: 'left'
              }}>
                    Recommendations:
                  </Typography>
                  <Box component="ul" sx={{
                pl: 2,
                m: 0,
                textAlign: 'left'
              }}>
                    {analysis.recommendations.map((recommendation, index) => <Typography key={index} component="li" variant="body2" sx={{
                  color: 'var(--color-text-primary)',
                  mb: 0.5,
                  textAlign: 'left'
                }}>
                        {recommendation}
                      </Typography>)}
                  </Box>
                </Box>}
            </Collapse>
          </Box> : stryMutAct_9fa48("213") ? false : stryMutAct_9fa48("212") ? true : (stryCov_9fa48("212", "213", "214"), analysis && <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="subtitle1" sx={stryMutAct_9fa48("215") ? {} : (stryCov_9fa48("215"), {
              color: stryMutAct_9fa48("216") ? "" : (stryCov_9fa48("216"), 'var(--color-text-primary)'),
              fontWeight: stryMutAct_9fa48("217") ? "" : (stryCov_9fa48("217"), 'bold')
            })}>
                Analysis Results ({formatDate(analysis.period.startDate)} - {formatDate(analysis.period.endDate)})
              </Typography>
              <IconButton onClick={stryMutAct_9fa48("218") ? () => undefined : (stryCov_9fa48("218"), () => setExpanded(stryMutAct_9fa48("219") ? expanded : (stryCov_9fa48("219"), !expanded)))}>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            {/* Statistics Summary */}
            <Box display="flex" gap={1} mb={2} flexWrap="wrap">
              <Chip label={stryMutAct_9fa48("220") ? `` : (stryCov_9fa48("220"), `${analysis.dataCount} submissions`)} size="small" color="primary" />
              {stryMutAct_9fa48("223") ? analysis.statistics?.averageScore > 0 || <Chip label={`${analysis.statistics.averageScore}% avg score`} size="small" color="success" /> : stryMutAct_9fa48("222") ? false : stryMutAct_9fa48("221") ? true : (stryCov_9fa48("221", "222", "223"), (stryMutAct_9fa48("226") ? analysis.statistics?.averageScore <= 0 : stryMutAct_9fa48("225") ? analysis.statistics?.averageScore >= 0 : stryMutAct_9fa48("224") ? true : (stryCov_9fa48("224", "225", "226"), (stryMutAct_9fa48("227") ? analysis.statistics.averageScore : (stryCov_9fa48("227"), analysis.statistics?.averageScore)) > 0)) && <Chip label={stryMutAct_9fa48("228") ? `` : (stryCov_9fa48("228"), `${analysis.statistics.averageScore}% avg score`)} size="small" color="success" />)}
            </Box>

            <Collapse in={expanded}>
              {/* Summary */}
              <Box mb={3} sx={stryMutAct_9fa48("229") ? {} : (stryCov_9fa48("229"), {
              textAlign: stryMutAct_9fa48("230") ? "" : (stryCov_9fa48("230"), 'left')
            })}>
                <Typography variant="body1" sx={stryMutAct_9fa48("231") ? {} : (stryCov_9fa48("231"), {
                color: stryMutAct_9fa48("232") ? "" : (stryCov_9fa48("232"), 'var(--color-text-primary)'),
                mb: 1,
                textAlign: stryMutAct_9fa48("233") ? "" : (stryCov_9fa48("233"), 'left')
              })}>
                  <strong>Summary:</strong>
                </Typography>
                <Typography variant="body2" sx={stryMutAct_9fa48("234") ? {} : (stryCov_9fa48("234"), {
                color: stryMutAct_9fa48("235") ? "" : (stryCov_9fa48("235"), 'var(--color-text-primary)'),
                opacity: 0.9,
                textAlign: stryMutAct_9fa48("236") ? "" : (stryCov_9fa48("236"), 'left')
              })}>
                  {analysis.summary}
                </Typography>
              </Box>

              <Divider sx={stryMutAct_9fa48("237") ? {} : (stryCov_9fa48("237"), {
              mb: 3
            })} />

              {/* Trends */}
              {stryMutAct_9fa48("240") ? analysis.trends && analysis.trends.length > 0 || <Box mb={3} sx={{
              textAlign: 'left'
            }}>
                  <Typography variant="subtitle2" sx={{
                color: 'var(--color-text-primary)',
                fontWeight: 'bold',
                mb: 1,
                textAlign: 'left'
              }}>
                    Key Trends:
                  </Typography>
                  <Box component="ul" sx={{
                pl: 2,
                m: 0,
                textAlign: 'left'
              }}>
                    {analysis.trends.map((trend, index) => <Typography key={index} component="li" variant="body2" sx={{
                  color: 'var(--color-text-primary)',
                  mb: 0.5,
                  textAlign: 'left'
                }}>
                        {trend}
                      </Typography>)}
                  </Box>
                </Box> : stryMutAct_9fa48("239") ? false : stryMutAct_9fa48("238") ? true : (stryCov_9fa48("238", "239", "240"), (stryMutAct_9fa48("242") ? analysis.trends || analysis.trends.length > 0 : stryMutAct_9fa48("241") ? true : (stryCov_9fa48("241", "242"), analysis.trends && (stryMutAct_9fa48("245") ? analysis.trends.length <= 0 : stryMutAct_9fa48("244") ? analysis.trends.length >= 0 : stryMutAct_9fa48("243") ? true : (stryCov_9fa48("243", "244", "245"), analysis.trends.length > 0)))) && <Box mb={3} sx={stryMutAct_9fa48("246") ? {} : (stryCov_9fa48("246"), {
              textAlign: stryMutAct_9fa48("247") ? "" : (stryCov_9fa48("247"), 'left')
            })}>
                  <Typography variant="subtitle2" sx={stryMutAct_9fa48("248") ? {} : (stryCov_9fa48("248"), {
                color: stryMutAct_9fa48("249") ? "" : (stryCov_9fa48("249"), 'var(--color-text-primary)'),
                fontWeight: stryMutAct_9fa48("250") ? "" : (stryCov_9fa48("250"), 'bold'),
                mb: 1,
                textAlign: stryMutAct_9fa48("251") ? "" : (stryCov_9fa48("251"), 'left')
              })}>
                    Key Trends:
                  </Typography>
                  <Box component="ul" sx={stryMutAct_9fa48("252") ? {} : (stryCov_9fa48("252"), {
                pl: 2,
                m: 0,
                textAlign: stryMutAct_9fa48("253") ? "" : (stryCov_9fa48("253"), 'left')
              })}>
                    {analysis.trends.map(stryMutAct_9fa48("254") ? () => undefined : (stryCov_9fa48("254"), (trend, index) => <Typography key={index} component="li" variant="body2" sx={stryMutAct_9fa48("255") ? {} : (stryCov_9fa48("255"), {
                  color: stryMutAct_9fa48("256") ? "" : (stryCov_9fa48("256"), 'var(--color-text-primary)'),
                  mb: 0.5,
                  textAlign: stryMutAct_9fa48("257") ? "" : (stryCov_9fa48("257"), 'left')
                })}>
                        {trend}
                      </Typography>))}
                  </Box>
                </Box>)}

              {/* Strengths */}
              {stryMutAct_9fa48("260") ? analysis.strengths && analysis.strengths.length > 0 || <Box mb={3} sx={{
              textAlign: 'left'
            }}>
                  <Typography variant="subtitle2" sx={{
                color: 'var(--color-text-primary)',
                fontWeight: 'bold',
                mb: 1,
                textAlign: 'left'
              }}>
                    Strengths:
                  </Typography>
                  <Box component="ul" sx={{
                pl: 2,
                m: 0,
                textAlign: 'left'
              }}>
                    {analysis.strengths.map((strength, index) => <Typography key={index} component="li" variant="body2" sx={{
                  color: '#2eae4f',
                  mb: 0.5,
                  textAlign: 'left',
                  fontWeight: 500
                }}>
                        {strength}
                      </Typography>)}
                  </Box>
                </Box> : stryMutAct_9fa48("259") ? false : stryMutAct_9fa48("258") ? true : (stryCov_9fa48("258", "259", "260"), (stryMutAct_9fa48("262") ? analysis.strengths || analysis.strengths.length > 0 : stryMutAct_9fa48("261") ? true : (stryCov_9fa48("261", "262"), analysis.strengths && (stryMutAct_9fa48("265") ? analysis.strengths.length <= 0 : stryMutAct_9fa48("264") ? analysis.strengths.length >= 0 : stryMutAct_9fa48("263") ? true : (stryCov_9fa48("263", "264", "265"), analysis.strengths.length > 0)))) && <Box mb={3} sx={stryMutAct_9fa48("266") ? {} : (stryCov_9fa48("266"), {
              textAlign: stryMutAct_9fa48("267") ? "" : (stryCov_9fa48("267"), 'left')
            })}>
                  <Typography variant="subtitle2" sx={stryMutAct_9fa48("268") ? {} : (stryCov_9fa48("268"), {
                color: stryMutAct_9fa48("269") ? "" : (stryCov_9fa48("269"), 'var(--color-text-primary)'),
                fontWeight: stryMutAct_9fa48("270") ? "" : (stryCov_9fa48("270"), 'bold'),
                mb: 1,
                textAlign: stryMutAct_9fa48("271") ? "" : (stryCov_9fa48("271"), 'left')
              })}>
                    Strengths:
                  </Typography>
                  <Box component="ul" sx={stryMutAct_9fa48("272") ? {} : (stryCov_9fa48("272"), {
                pl: 2,
                m: 0,
                textAlign: stryMutAct_9fa48("273") ? "" : (stryCov_9fa48("273"), 'left')
              })}>
                    {analysis.strengths.map(stryMutAct_9fa48("274") ? () => undefined : (stryCov_9fa48("274"), (strength, index) => <Typography key={index} component="li" variant="body2" sx={stryMutAct_9fa48("275") ? {} : (stryCov_9fa48("275"), {
                  color: stryMutAct_9fa48("276") ? "" : (stryCov_9fa48("276"), '#2eae4f'),
                  mb: 0.5,
                  textAlign: stryMutAct_9fa48("277") ? "" : (stryCov_9fa48("277"), 'left'),
                  fontWeight: 500
                })}>
                        {strength}
                      </Typography>))}
                  </Box>
                </Box>)}

              {/* Growth Areas */}
              {stryMutAct_9fa48("280") ? analysis.growth_areas && analysis.growth_areas.length > 0 || <Box mb={3} sx={{
              textAlign: 'left'
            }}>
                  <Typography variant="subtitle2" sx={{
                color: 'var(--color-text-primary)',
                fontWeight: 'bold',
                mb: 1,
                textAlign: 'left'
              }}>
                    Growth Areas:
                  </Typography>
                  <Box component="ul" sx={{
                pl: 2,
                m: 0,
                textAlign: 'left'
              }}>
                    {analysis.growth_areas.map((area, index) => <Typography key={index} component="li" variant="body2" sx={{
                  color: '#ffab00',
                  mb: 0.5,
                  textAlign: 'left',
                  fontWeight: 500
                }}>
                        {area}
                      </Typography>)}
                  </Box>
                </Box> : stryMutAct_9fa48("279") ? false : stryMutAct_9fa48("278") ? true : (stryCov_9fa48("278", "279", "280"), (stryMutAct_9fa48("282") ? analysis.growth_areas || analysis.growth_areas.length > 0 : stryMutAct_9fa48("281") ? true : (stryCov_9fa48("281", "282"), analysis.growth_areas && (stryMutAct_9fa48("285") ? analysis.growth_areas.length <= 0 : stryMutAct_9fa48("284") ? analysis.growth_areas.length >= 0 : stryMutAct_9fa48("283") ? true : (stryCov_9fa48("283", "284", "285"), analysis.growth_areas.length > 0)))) && <Box mb={3} sx={stryMutAct_9fa48("286") ? {} : (stryCov_9fa48("286"), {
              textAlign: stryMutAct_9fa48("287") ? "" : (stryCov_9fa48("287"), 'left')
            })}>
                  <Typography variant="subtitle2" sx={stryMutAct_9fa48("288") ? {} : (stryCov_9fa48("288"), {
                color: stryMutAct_9fa48("289") ? "" : (stryCov_9fa48("289"), 'var(--color-text-primary)'),
                fontWeight: stryMutAct_9fa48("290") ? "" : (stryCov_9fa48("290"), 'bold'),
                mb: 1,
                textAlign: stryMutAct_9fa48("291") ? "" : (stryCov_9fa48("291"), 'left')
              })}>
                    Growth Areas:
                  </Typography>
                  <Box component="ul" sx={stryMutAct_9fa48("292") ? {} : (stryCov_9fa48("292"), {
                pl: 2,
                m: 0,
                textAlign: stryMutAct_9fa48("293") ? "" : (stryCov_9fa48("293"), 'left')
              })}>
                    {analysis.growth_areas.map(stryMutAct_9fa48("294") ? () => undefined : (stryCov_9fa48("294"), (area, index) => <Typography key={index} component="li" variant="body2" sx={stryMutAct_9fa48("295") ? {} : (stryCov_9fa48("295"), {
                  color: stryMutAct_9fa48("296") ? "" : (stryCov_9fa48("296"), '#ffab00'),
                  mb: 0.5,
                  textAlign: stryMutAct_9fa48("297") ? "" : (stryCov_9fa48("297"), 'left'),
                  fontWeight: 500
                })}>
                        {area}
                      </Typography>))}
                  </Box>
                </Box>)}

              {/* Recommendations */}
              {stryMutAct_9fa48("300") ? analysis.recommendations && analysis.recommendations.length > 0 || <Box sx={{
              textAlign: 'left'
            }}>
                  <Typography variant="subtitle2" sx={{
                color: 'var(--color-text-primary)',
                fontWeight: 'bold',
                mb: 1,
                textAlign: 'left'
              }}>
                    Recommendations:
                  </Typography>
                  <Box component="ul" sx={{
                pl: 2,
                m: 0,
                textAlign: 'left'
              }}>
                    {analysis.recommendations.map((recommendation, index) => <Typography key={index} component="li" variant="body2" sx={{
                  color: 'var(--color-text-primary)',
                  mb: 0.5,
                  textAlign: 'left'
                }}>
                        {recommendation}
                      </Typography>)}
                  </Box>
                </Box> : stryMutAct_9fa48("299") ? false : stryMutAct_9fa48("298") ? true : (stryCov_9fa48("298", "299", "300"), (stryMutAct_9fa48("302") ? analysis.recommendations || analysis.recommendations.length > 0 : stryMutAct_9fa48("301") ? true : (stryCov_9fa48("301", "302"), analysis.recommendations && (stryMutAct_9fa48("305") ? analysis.recommendations.length <= 0 : stryMutAct_9fa48("304") ? analysis.recommendations.length >= 0 : stryMutAct_9fa48("303") ? true : (stryCov_9fa48("303", "304", "305"), analysis.recommendations.length > 0)))) && <Box sx={stryMutAct_9fa48("306") ? {} : (stryCov_9fa48("306"), {
              textAlign: stryMutAct_9fa48("307") ? "" : (stryCov_9fa48("307"), 'left')
            })}>
                  <Typography variant="subtitle2" sx={stryMutAct_9fa48("308") ? {} : (stryCov_9fa48("308"), {
                color: stryMutAct_9fa48("309") ? "" : (stryCov_9fa48("309"), 'var(--color-text-primary)'),
                fontWeight: stryMutAct_9fa48("310") ? "" : (stryCov_9fa48("310"), 'bold'),
                mb: 1,
                textAlign: stryMutAct_9fa48("311") ? "" : (stryCov_9fa48("311"), 'left')
              })}>
                    Recommendations:
                  </Typography>
                  <Box component="ul" sx={stryMutAct_9fa48("312") ? {} : (stryCov_9fa48("312"), {
                pl: 2,
                m: 0,
                textAlign: stryMutAct_9fa48("313") ? "" : (stryCov_9fa48("313"), 'left')
              })}>
                    {analysis.recommendations.map(stryMutAct_9fa48("314") ? () => undefined : (stryCov_9fa48("314"), (recommendation, index) => <Typography key={index} component="li" variant="body2" sx={stryMutAct_9fa48("315") ? {} : (stryCov_9fa48("315"), {
                  color: stryMutAct_9fa48("316") ? "" : (stryCov_9fa48("316"), 'var(--color-text-primary)'),
                  mb: 0.5,
                  textAlign: stryMutAct_9fa48("317") ? "" : (stryCov_9fa48("317"), 'left')
                })}>
                        {recommendation}
                      </Typography>))}
                  </Box>
                </Box>)}
            </Collapse>
          </Box>)}
      </CardContent>
    </Card>;
  }
};
export default AITrendAnalysis;