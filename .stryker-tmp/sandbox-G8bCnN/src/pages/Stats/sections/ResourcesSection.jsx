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
import { Box, Typography, CircularProgress, Card, CardContent, Link, List, ListItem, ListItemIcon, ListItemText, TextField, InputAdornment, Divider, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';
import { Search, Link as LinkIcon, VideoLibrary, MenuBook, Article, FilterList, Close } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { fetchUserResources } from '../../../utils/statsApi';
import { formatDate } from '../../../utils/dateHelpers';
const ResourcesSection = ({
  cohortMonth
}) => {
  if (stryMutAct_9fa48("26922")) {
    {}
  } else {
    stryCov_9fa48("26922");
    const {
      token
    } = useAuth();
    const [taskResources, setTaskResources] = useState(stryMutAct_9fa48("26923") ? ["Stryker was here"] : (stryCov_9fa48("26923"), []));
    const [flattenedResources, setFlattenedResources] = useState(stryMutAct_9fa48("26924") ? ["Stryker was here"] : (stryCov_9fa48("26924"), []));
    const [filteredResources, setFilteredResources] = useState(stryMutAct_9fa48("26925") ? ["Stryker was here"] : (stryCov_9fa48("26925"), []));
    const [searchTerm, setSearchTerm] = useState(stryMutAct_9fa48("26926") ? "Stryker was here!" : (stryCov_9fa48("26926"), ''));
    const [resourceType, setResourceType] = useState(stryMutAct_9fa48("26927") ? "" : (stryCov_9fa48("26927"), 'all'));
    const [loading, setLoading] = useState(stryMutAct_9fa48("26928") ? false : (stryCov_9fa48("26928"), true));
    const [error, setError] = useState(null);
    useEffect(() => {
      if (stryMutAct_9fa48("26929")) {
        {}
      } else {
        stryCov_9fa48("26929");
        const loadResources = async () => {
          if (stryMutAct_9fa48("26930")) {
            {}
          } else {
            stryCov_9fa48("26930");
            try {
              if (stryMutAct_9fa48("26931")) {
                {}
              } else {
                stryCov_9fa48("26931");
                setLoading(stryMutAct_9fa48("26932") ? false : (stryCov_9fa48("26932"), true));
                console.log(stryMutAct_9fa48("26933") ? "" : (stryCov_9fa48("26933"), 'Cohort month:'), cohortMonth);
                const resourcesData = await fetchUserResources(token);
                setTaskResources(resourcesData);

                // Flatten resources into a single array
                const flattened = stryMutAct_9fa48("26934") ? ["Stryker was here"] : (stryCov_9fa48("26934"), []);
                resourcesData.forEach(task => {
                  if (stryMutAct_9fa48("26935")) {
                    {}
                  } else {
                    stryCov_9fa48("26935");
                    task.resources.forEach(resource => {
                      if (stryMutAct_9fa48("26936")) {
                        {}
                      } else {
                        stryCov_9fa48("26936");
                        flattened.push(stryMutAct_9fa48("26937") ? {} : (stryCov_9fa48("26937"), {
                          ...resource,
                          task_title: task.task_title,
                          task_id: task.task_id,
                          assigned_date: task.assigned_date
                        }));
                      }
                    });
                  }
                });
                setFlattenedResources(flattened);
                setFilteredResources(flattened);
                setError(null);
              }
            } catch (err) {
              if (stryMutAct_9fa48("26938")) {
                {}
              } else {
                stryCov_9fa48("26938");
                console.error(stryMutAct_9fa48("26939") ? "" : (stryCov_9fa48("26939"), 'Failed to fetch resources:'), err);
                setError(stryMutAct_9fa48("26940") ? "" : (stryCov_9fa48("26940"), 'Failed to load resources. Please try again later.'));
              }
            } finally {
              if (stryMutAct_9fa48("26941")) {
                {}
              } else {
                stryCov_9fa48("26941");
                setLoading(stryMutAct_9fa48("26942") ? true : (stryCov_9fa48("26942"), false));
              }
            }
          }
        };
        if (stryMutAct_9fa48("26944") ? false : stryMutAct_9fa48("26943") ? true : (stryCov_9fa48("26943", "26944"), token)) {
          if (stryMutAct_9fa48("26945")) {
            {}
          } else {
            stryCov_9fa48("26945");
            loadResources();
          }
        }
      }
    }, stryMutAct_9fa48("26946") ? [] : (stryCov_9fa48("26946"), [token, cohortMonth]));
    useEffect(() => {
      if (stryMutAct_9fa48("26947")) {
        {}
      } else {
        stryCov_9fa48("26947");
        let filtered = flattenedResources;

        // Apply search filter
        if (stryMutAct_9fa48("26950") ? searchTerm.trim() === '' : stryMutAct_9fa48("26949") ? false : stryMutAct_9fa48("26948") ? true : (stryCov_9fa48("26948", "26949", "26950"), (stryMutAct_9fa48("26951") ? searchTerm : (stryCov_9fa48("26951"), searchTerm.trim())) !== (stryMutAct_9fa48("26952") ? "Stryker was here!" : (stryCov_9fa48("26952"), '')))) {
          if (stryMutAct_9fa48("26953")) {
            {}
          } else {
            stryCov_9fa48("26953");
            const searchTermLower = stryMutAct_9fa48("26954") ? searchTerm.toUpperCase() : (stryCov_9fa48("26954"), searchTerm.toLowerCase());
            filtered = stryMutAct_9fa48("26955") ? filtered : (stryCov_9fa48("26955"), filtered.filter(stryMutAct_9fa48("26956") ? () => undefined : (stryCov_9fa48("26956"), resource => stryMutAct_9fa48("26959") ? (resource.title && resource.title.toLowerCase().includes(searchTermLower) || resource.description && resource.description.toLowerCase().includes(searchTermLower)) && resource.task_title && resource.task_title.toLowerCase().includes(searchTermLower) : stryMutAct_9fa48("26958") ? false : stryMutAct_9fa48("26957") ? true : (stryCov_9fa48("26957", "26958", "26959"), (stryMutAct_9fa48("26961") ? resource.title && resource.title.toLowerCase().includes(searchTermLower) && resource.description && resource.description.toLowerCase().includes(searchTermLower) : stryMutAct_9fa48("26960") ? false : (stryCov_9fa48("26960", "26961"), (stryMutAct_9fa48("26963") ? resource.title || resource.title.toLowerCase().includes(searchTermLower) : stryMutAct_9fa48("26962") ? false : (stryCov_9fa48("26962", "26963"), resource.title && (stryMutAct_9fa48("26964") ? resource.title.toUpperCase().includes(searchTermLower) : (stryCov_9fa48("26964"), resource.title.toLowerCase().includes(searchTermLower))))) || (stryMutAct_9fa48("26966") ? resource.description || resource.description.toLowerCase().includes(searchTermLower) : stryMutAct_9fa48("26965") ? false : (stryCov_9fa48("26965", "26966"), resource.description && (stryMutAct_9fa48("26967") ? resource.description.toUpperCase().includes(searchTermLower) : (stryCov_9fa48("26967"), resource.description.toLowerCase().includes(searchTermLower))))))) || (stryMutAct_9fa48("26969") ? resource.task_title || resource.task_title.toLowerCase().includes(searchTermLower) : stryMutAct_9fa48("26968") ? false : (stryCov_9fa48("26968", "26969"), resource.task_title && (stryMutAct_9fa48("26970") ? resource.task_title.toUpperCase().includes(searchTermLower) : (stryCov_9fa48("26970"), resource.task_title.toLowerCase().includes(searchTermLower)))))))));
          }
        }

        // Apply type filter
        if (stryMutAct_9fa48("26973") ? resourceType === 'all' : stryMutAct_9fa48("26972") ? false : stryMutAct_9fa48("26971") ? true : (stryCov_9fa48("26971", "26972", "26973"), resourceType !== (stryMutAct_9fa48("26974") ? "" : (stryCov_9fa48("26974"), 'all')))) {
          if (stryMutAct_9fa48("26975")) {
            {}
          } else {
            stryCov_9fa48("26975");
            filtered = stryMutAct_9fa48("26976") ? filtered : (stryCov_9fa48("26976"), filtered.filter(resource => {
              if (stryMutAct_9fa48("26977")) {
                {}
              } else {
                stryCov_9fa48("26977");
                const lowerType = stryMutAct_9fa48("26978") ? (resource.type || '').toUpperCase() : (stryCov_9fa48("26978"), (stryMutAct_9fa48("26981") ? resource.type && '' : stryMutAct_9fa48("26980") ? false : stryMutAct_9fa48("26979") ? true : (stryCov_9fa48("26979", "26980", "26981"), resource.type || (stryMutAct_9fa48("26982") ? "Stryker was here!" : (stryCov_9fa48("26982"), '')))).toLowerCase());
                switch (resourceType) {
                  case stryMutAct_9fa48("26984") ? "" : (stryCov_9fa48("26984"), 'video'):
                    if (stryMutAct_9fa48("26983")) {} else {
                      stryCov_9fa48("26983");
                      return lowerType.includes(stryMutAct_9fa48("26985") ? "" : (stryCov_9fa48("26985"), 'video'));
                    }
                  case stryMutAct_9fa48("26987") ? "" : (stryCov_9fa48("26987"), 'document'):
                    if (stryMutAct_9fa48("26986")) {} else {
                      stryCov_9fa48("26986");
                      return stryMutAct_9fa48("26990") ? lowerType.includes('book') && lowerType.includes('doc') : stryMutAct_9fa48("26989") ? false : stryMutAct_9fa48("26988") ? true : (stryCov_9fa48("26988", "26989", "26990"), lowerType.includes(stryMutAct_9fa48("26991") ? "" : (stryCov_9fa48("26991"), 'book')) || lowerType.includes(stryMutAct_9fa48("26992") ? "" : (stryCov_9fa48("26992"), 'doc')));
                    }
                  case stryMutAct_9fa48("26994") ? "" : (stryCov_9fa48("26994"), 'article'):
                    if (stryMutAct_9fa48("26993")) {} else {
                      stryCov_9fa48("26993");
                      return lowerType.includes(stryMutAct_9fa48("26995") ? "" : (stryCov_9fa48("26995"), 'article'));
                    }
                  case stryMutAct_9fa48("26997") ? "" : (stryCov_9fa48("26997"), 'link'):
                    if (stryMutAct_9fa48("26996")) {} else {
                      stryCov_9fa48("26996");
                      return stryMutAct_9fa48("27000") ? !lowerType.includes('video') && !lowerType.includes('book') && !lowerType.includes('doc') || !lowerType.includes('article') : stryMutAct_9fa48("26999") ? false : stryMutAct_9fa48("26998") ? true : (stryCov_9fa48("26998", "26999", "27000"), (stryMutAct_9fa48("27002") ? !lowerType.includes('video') && !lowerType.includes('book') || !lowerType.includes('doc') : stryMutAct_9fa48("27001") ? true : (stryCov_9fa48("27001", "27002"), (stryMutAct_9fa48("27004") ? !lowerType.includes('video') || !lowerType.includes('book') : stryMutAct_9fa48("27003") ? true : (stryCov_9fa48("27003", "27004"), (stryMutAct_9fa48("27005") ? lowerType.includes('video') : (stryCov_9fa48("27005"), !lowerType.includes(stryMutAct_9fa48("27006") ? "" : (stryCov_9fa48("27006"), 'video')))) && (stryMutAct_9fa48("27007") ? lowerType.includes('book') : (stryCov_9fa48("27007"), !lowerType.includes(stryMutAct_9fa48("27008") ? "" : (stryCov_9fa48("27008"), 'book')))))) && (stryMutAct_9fa48("27009") ? lowerType.includes('doc') : (stryCov_9fa48("27009"), !lowerType.includes(stryMutAct_9fa48("27010") ? "" : (stryCov_9fa48("27010"), 'doc')))))) && (stryMutAct_9fa48("27011") ? lowerType.includes('article') : (stryCov_9fa48("27011"), !lowerType.includes(stryMutAct_9fa48("27012") ? "" : (stryCov_9fa48("27012"), 'article')))));
                    }
                  default:
                    if (stryMutAct_9fa48("27013")) {} else {
                      stryCov_9fa48("27013");
                      return stryMutAct_9fa48("27014") ? false : (stryCov_9fa48("27014"), true);
                    }
                }
              }
            }));
          }
        }
        setFilteredResources(filtered);
      }
    }, stryMutAct_9fa48("27015") ? [] : (stryCov_9fa48("27015"), [searchTerm, resourceType, flattenedResources]));
    const handleSearchChange = event => {
      if (stryMutAct_9fa48("27016")) {
        {}
      } else {
        stryCov_9fa48("27016");
        setSearchTerm(event.target.value);
      }
    };
    const handleTypeChange = event => {
      if (stryMutAct_9fa48("27017")) {
        {}
      } else {
        stryCov_9fa48("27017");
        setResourceType(event.target.value);
      }
    };
    const getResourceIcon = type => {
      if (stryMutAct_9fa48("27018")) {
        {}
      } else {
        stryCov_9fa48("27018");
        const lowerType = stryMutAct_9fa48("27019") ? (type || '').toUpperCase() : (stryCov_9fa48("27019"), (stryMutAct_9fa48("27022") ? type && '' : stryMutAct_9fa48("27021") ? false : stryMutAct_9fa48("27020") ? true : (stryCov_9fa48("27020", "27021", "27022"), type || (stryMutAct_9fa48("27023") ? "Stryker was here!" : (stryCov_9fa48("27023"), '')))).toLowerCase());
        if (stryMutAct_9fa48("27025") ? false : stryMutAct_9fa48("27024") ? true : (stryCov_9fa48("27024", "27025"), lowerType.includes(stryMutAct_9fa48("27026") ? "" : (stryCov_9fa48("27026"), 'video')))) return <VideoLibrary />;
        if (stryMutAct_9fa48("27029") ? lowerType.includes('book') && lowerType.includes('doc') : stryMutAct_9fa48("27028") ? false : stryMutAct_9fa48("27027") ? true : (stryCov_9fa48("27027", "27028", "27029"), lowerType.includes(stryMutAct_9fa48("27030") ? "" : (stryCov_9fa48("27030"), 'book')) || lowerType.includes(stryMutAct_9fa48("27031") ? "" : (stryCov_9fa48("27031"), 'doc')))) return <MenuBook />;
        if (stryMutAct_9fa48("27033") ? false : stryMutAct_9fa48("27032") ? true : (stryCov_9fa48("27032", "27033"), lowerType.includes(stryMutAct_9fa48("27034") ? "" : (stryCov_9fa48("27034"), 'article')))) return <Article />;
        return <LinkIcon />;
      }
    };
    if (stryMutAct_9fa48("27036") ? false : stryMutAct_9fa48("27035") ? true : (stryCov_9fa48("27035", "27036"), loading)) {
      if (stryMutAct_9fa48("27037")) {
        {}
      } else {
        stryCov_9fa48("27037");
        return <Box className="resources-section__loading" sx={stryMutAct_9fa48("27038") ? {} : (stryCov_9fa48("27038"), {
          display: stryMutAct_9fa48("27039") ? "" : (stryCov_9fa48("27039"), 'flex'),
          justifyContent: stryMutAct_9fa48("27040") ? "" : (stryCov_9fa48("27040"), 'center'),
          p: 4
        })}>
        <CircularProgress size={40} />
      </Box>;
      }
    }
    if (stryMutAct_9fa48("27042") ? false : stryMutAct_9fa48("27041") ? true : (stryCov_9fa48("27041", "27042"), error)) {
      if (stryMutAct_9fa48("27043")) {
        {}
      } else {
        stryCov_9fa48("27043");
        return <Box className="resources-section__error" sx={stryMutAct_9fa48("27044") ? {} : (stryCov_9fa48("27044"), {
          p: 2
        })}>
        <Typography color="error">{error}</Typography>
      </Box>;
      }
    }
    if (stryMutAct_9fa48("27047") ? taskResources.length !== 0 : stryMutAct_9fa48("27046") ? false : stryMutAct_9fa48("27045") ? true : (stryCov_9fa48("27045", "27046", "27047"), taskResources.length === 0)) {
      if (stryMutAct_9fa48("27048")) {
        {}
      } else {
        stryCov_9fa48("27048");
        return <Box className="resources-section__empty" sx={stryMutAct_9fa48("27049") ? {} : (stryCov_9fa48("27049"), {
          p: 2
        })}>
        <Card className="resources-section__empty-card">
          <CardContent>
            <Typography variant="h6" align="center">No Resources Found</Typography>
            <Typography variant="body2" align="center" sx={stryMutAct_9fa48("27050") ? {} : (stryCov_9fa48("27050"), {
                mt: 1
              })}>
              There are no resources linked to your tasks yet.
            </Typography>
          </CardContent>
        </Card>
      </Box>;
      }
    }
    return <Box className="resources-section" sx={stryMutAct_9fa48("27051") ? {} : (stryCov_9fa48("27051"), {
      display: stryMutAct_9fa48("27052") ? "" : (stryCov_9fa48("27052"), 'flex'),
      flexDirection: stryMutAct_9fa48("27053") ? "" : (stryCov_9fa48("27053"), 'column'),
      height: stryMutAct_9fa48("27054") ? "" : (stryCov_9fa48("27054"), '100%')
    })}>
      <Box className="resources-section__filters" mb={3} display="flex" flexWrap="wrap" gap={2}>
        <TextField placeholder="Search resources..." variant="outlined" size="small" value={searchTerm} onChange={handleSearchChange} className="resources-section__search" InputProps={stryMutAct_9fa48("27055") ? {} : (stryCov_9fa48("27055"), {
          startAdornment: <InputAdornment position="start">
                <Search sx={stryMutAct_9fa48("27056") ? {} : (stryCov_9fa48("27056"), {
              color: stryMutAct_9fa48("27057") ? "" : (stryCov_9fa48("27057"), 'var(--color-text-secondary)')
            })} />
              </InputAdornment>,
          endAdornment: stryMutAct_9fa48("27060") ? searchTerm || <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')} sx={{
              color: 'var(--color-text-secondary)'
            }}>
                  <Close fontSize="small" />
                </IconButton>
              </InputAdornment> : stryMutAct_9fa48("27059") ? false : stryMutAct_9fa48("27058") ? true : (stryCov_9fa48("27058", "27059", "27060"), searchTerm && <InputAdornment position="end">
                <IconButton size="small" onClick={stryMutAct_9fa48("27061") ? () => undefined : (stryCov_9fa48("27061"), () => setSearchTerm(stryMutAct_9fa48("27062") ? "Stryker was here!" : (stryCov_9fa48("27062"), '')))} sx={stryMutAct_9fa48("27063") ? {} : (stryCov_9fa48("27063"), {
              color: stryMutAct_9fa48("27064") ? "" : (stryCov_9fa48("27064"), 'var(--color-text-secondary)')
            })}>
                  <Close fontSize="small" />
                </IconButton>
              </InputAdornment>)
        })} sx={stryMutAct_9fa48("27065") ? {} : (stryCov_9fa48("27065"), {
          flexGrow: 1,
          minWidth: stryMutAct_9fa48("27066") ? "" : (stryCov_9fa48("27066"), '200px'),
          '& .MuiInputBase-root': stryMutAct_9fa48("27067") ? {} : (stryCov_9fa48("27067"), {
            height: stryMutAct_9fa48("27068") ? "" : (stryCov_9fa48("27068"), '36px'),
            fontSize: stryMutAct_9fa48("27069") ? "" : (stryCov_9fa48("27069"), '0.85rem'),
            backgroundColor: stryMutAct_9fa48("27070") ? "" : (stryCov_9fa48("27070"), 'var(--color-background-darker)')
          })
        })} />
        
        <FormControl size="small" sx={stryMutAct_9fa48("27071") ? {} : (stryCov_9fa48("27071"), {
          minWidth: stryMutAct_9fa48("27072") ? "" : (stryCov_9fa48("27072"), '160px'),
          '& .MuiInputBase-root': stryMutAct_9fa48("27073") ? {} : (stryCov_9fa48("27073"), {
            height: stryMutAct_9fa48("27074") ? "" : (stryCov_9fa48("27074"), '36px')
          }),
          '& .MuiOutlinedInput-root': stryMutAct_9fa48("27075") ? {} : (stryCov_9fa48("27075"), {
            backgroundColor: stryMutAct_9fa48("27076") ? "" : (stryCov_9fa48("27076"), 'var(--color-background-darker)')
          }),
          '& .MuiSelect-icon': stryMutAct_9fa48("27077") ? {} : (stryCov_9fa48("27077"), {
            color: stryMutAct_9fa48("27078") ? "" : (stryCov_9fa48("27078"), 'var(--color-text-secondary)')
          })
        })}>
          <InputLabel id="resource-type-label" sx={stryMutAct_9fa48("27079") ? {} : (stryCov_9fa48("27079"), {
            fontSize: stryMutAct_9fa48("27080") ? "" : (stryCov_9fa48("27080"), '0.85rem')
          })}>Resource Type</InputLabel>
          <Select labelId="resource-type-label" value={resourceType} onChange={handleTypeChange} label="Resource Type" sx={stryMutAct_9fa48("27081") ? {} : (stryCov_9fa48("27081"), {
            fontSize: stryMutAct_9fa48("27082") ? "" : (stryCov_9fa48("27082"), '0.85rem')
          })}>
            <MenuItem value="all" sx={stryMutAct_9fa48("27083") ? {} : (stryCov_9fa48("27083"), {
              fontSize: stryMutAct_9fa48("27084") ? "" : (stryCov_9fa48("27084"), '0.85rem')
            })}>All Resources</MenuItem>
            <MenuItem value="video" sx={stryMutAct_9fa48("27085") ? {} : (stryCov_9fa48("27085"), {
              fontSize: stryMutAct_9fa48("27086") ? "" : (stryCov_9fa48("27086"), '0.85rem')
            })}>Videos</MenuItem>
            <MenuItem value="document" sx={stryMutAct_9fa48("27087") ? {} : (stryCov_9fa48("27087"), {
              fontSize: stryMutAct_9fa48("27088") ? "" : (stryCov_9fa48("27088"), '0.85rem')
            })}>Documents</MenuItem>
            <MenuItem value="article" sx={stryMutAct_9fa48("27089") ? {} : (stryCov_9fa48("27089"), {
              fontSize: stryMutAct_9fa48("27090") ? "" : (stryCov_9fa48("27090"), '0.85rem')
            })}>Articles</MenuItem>
            <MenuItem value="link" sx={stryMutAct_9fa48("27091") ? {} : (stryCov_9fa48("27091"), {
              fontSize: stryMutAct_9fa48("27092") ? "" : (stryCov_9fa48("27092"), '0.85rem')
            })}>Other Links</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {(stryMutAct_9fa48("27095") ? filteredResources.length !== 0 : stryMutAct_9fa48("27094") ? false : stryMutAct_9fa48("27093") ? true : (stryCov_9fa48("27093", "27094", "27095"), filteredResources.length === 0)) ? <Box className="resources-section__no-results" sx={stryMutAct_9fa48("27096") ? {} : (stryCov_9fa48("27096"), {
        p: 2
      })}>
          <Card className="resources-section__empty-card">
            <CardContent>
              <Typography variant="h6" align="center">No Matching Resources</Typography>
              <Typography variant="body2" align="center" sx={stryMutAct_9fa48("27097") ? {} : (stryCov_9fa48("27097"), {
              mt: 1
            })}>
                No resources match your filter criteria. Try adjusting your filters.
              </Typography>
            </CardContent>
          </Card>
        </Box> : <Box className="resources-section__list-container" sx={stryMutAct_9fa48("27098") ? {} : (stryCov_9fa48("27098"), {
        flex: 1,
        overflow: stryMutAct_9fa48("27099") ? "" : (stryCov_9fa48("27099"), 'auto')
      })}>
          <List className="resources-section__list">
            {filteredResources.map(stryMutAct_9fa48("27100") ? () => undefined : (stryCov_9fa48("27100"), (resource, index) => <React.Fragment key={index}>
                {stryMutAct_9fa48("27103") ? index > 0 || <Divider component="li" /> : stryMutAct_9fa48("27102") ? false : stryMutAct_9fa48("27101") ? true : (stryCov_9fa48("27101", "27102", "27103"), (stryMutAct_9fa48("27106") ? index <= 0 : stryMutAct_9fa48("27105") ? index >= 0 : stryMutAct_9fa48("27104") ? true : (stryCov_9fa48("27104", "27105", "27106"), index > 0)) && <Divider component="li" />)}
                <ListItem component={Link} href={resource.url} target="_blank" rel="noopener noreferrer" underline="none" className="resources-section__list-item">
                  <ListItemIcon sx={stryMutAct_9fa48("27107") ? {} : (stryCov_9fa48("27107"), {
                minWidth: stryMutAct_9fa48("27108") ? "" : (stryCov_9fa48("27108"), '40px'),
                color: stryMutAct_9fa48("27109") ? "" : (stryCov_9fa48("27109"), 'var(--color-text-secondary)')
              })}>
                    {getResourceIcon(resource.type)}
                  </ListItemIcon>
                  <ListItemText primary={<Typography variant="subtitle1" className="resources-section__resource-title">
                        {stryMutAct_9fa48("27112") ? resource.title && 'Unnamed Resource' : stryMutAct_9fa48("27111") ? false : stryMutAct_9fa48("27110") ? true : (stryCov_9fa48("27110", "27111", "27112"), resource.title || (stryMutAct_9fa48("27113") ? "" : (stryCov_9fa48("27113"), 'Unnamed Resource')))}
                      </Typography>} secondary={<Typography variant="body2" color="textSecondary" component="span">
                        {stryMutAct_9fa48("27116") ? resource.description || <Typography variant="body2" component="span" className="resources-section__resource-description" sx={{
                  display: 'block'
                }}>
                            {resource.description}
                          </Typography> : stryMutAct_9fa48("27115") ? false : stryMutAct_9fa48("27114") ? true : (stryCov_9fa48("27114", "27115", "27116"), resource.description && <Typography variant="body2" component="span" className="resources-section__resource-description" sx={stryMutAct_9fa48("27117") ? {} : (stryCov_9fa48("27117"), {
                  display: stryMutAct_9fa48("27118") ? "" : (stryCov_9fa48("27118"), 'block')
                })}>
                            {resource.description}
                          </Typography>)}
                        <Typography variant="caption" component="span" className="resources-section__resource-task" sx={stryMutAct_9fa48("27119") ? {} : (stryCov_9fa48("27119"), {
                  display: stryMutAct_9fa48("27120") ? "" : (stryCov_9fa48("27120"), 'block')
                })}>
                          From: {resource.task_title} {resource.assigned_date ? stryMutAct_9fa48("27121") ? `` : (stryCov_9fa48("27121"), `(${formatDate(new Date(resource.assigned_date))})`) : stryMutAct_9fa48("27122") ? "Stryker was here!" : (stryCov_9fa48("27122"), '')}
                        </Typography>
                      </Typography>} />
                </ListItem>
              </React.Fragment>))}
          </List>
        </Box>}
    </Box>;
  }
};
export default ResourcesSection;