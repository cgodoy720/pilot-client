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
import { useAuth } from '../../context/AuthContext';
import { Tabs, Tab, Box } from '@mui/material';
import Swal from 'sweetalert2';
import './AssessmentGrades.css';
const AssessmentGrades = () => {
  if (stryMutAct_9fa48("14850")) {
    {}
  } else {
    stryCov_9fa48("14850");
    const {
      user,
      token: authToken
    } = useAuth();
    const [assessmentGrades, setAssessmentGrades] = useState(stryMutAct_9fa48("14851") ? ["Stryker was here"] : (stryCov_9fa48("14851"), []));
    const [loading, setLoading] = useState(stryMutAct_9fa48("14852") ? false : (stryCov_9fa48("14852"), true));
    const [error, setError] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const [showGradeModal, setShowGradeModal] = useState(stryMutAct_9fa48("14853") ? true : (stryCov_9fa48("14853"), false));
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [showEmailModal, setShowEmailModal] = useState(stryMutAct_9fa48("14854") ? true : (stryCov_9fa48("14854"), false));

    // Editing states for Overview tab
    const [isEditingOverview, setIsEditingOverview] = useState(stryMutAct_9fa48("14855") ? true : (stryCov_9fa48("14855"), false));
    const [editingStrengths, setEditingStrengths] = useState(stryMutAct_9fa48("14856") ? "Stryker was here!" : (stryCov_9fa48("14856"), ''));
    const [editingGrowthAreas, setEditingGrowthAreas] = useState(stryMutAct_9fa48("14857") ? "Stryker was here!" : (stryCov_9fa48("14857"), ''));
    const [savingOverview, setSavingOverview] = useState(stryMutAct_9fa48("14858") ? true : (stryCov_9fa48("14858"), false));

    // Filter states
    const [filters, setFilters] = useState(stryMutAct_9fa48("14859") ? {} : (stryCov_9fa48("14859"), {
      cohort: stryMutAct_9fa48("14860") ? "Stryker was here!" : (stryCov_9fa48("14860"), ''),
      date: stryMutAct_9fa48("14861") ? "Stryker was here!" : (stryCov_9fa48("14861"), ''),
      startDate: stryMutAct_9fa48("14862") ? "Stryker was here!" : (stryCov_9fa48("14862"), ''),
      endDate: stryMutAct_9fa48("14863") ? "Stryker was here!" : (stryCov_9fa48("14863"), ''),
      assessmentType: stryMutAct_9fa48("14864") ? "Stryker was here!" : (stryCov_9fa48("14864"), '')
    }));
    const [availableCohorts, setAvailableCohorts] = useState(stryMutAct_9fa48("14865") ? ["Stryker was here"] : (stryCov_9fa48("14865"), []));

    // Pagination - Increased limit to get more records per request
    const [pagination, setPagination] = useState(stryMutAct_9fa48("14866") ? {} : (stryCov_9fa48("14866"), {
      total: 0,
      limit: 100,
      offset: 0,
      hasMore: stryMutAct_9fa48("14867") ? true : (stryCov_9fa48("14867"), false)
    }));

    // Check if user has admin access
    useEffect(() => {
      if (stryMutAct_9fa48("14868")) {
        {}
      } else {
        stryCov_9fa48("14868");
        if (stryMutAct_9fa48("14871") ? !user && user.role !== 'admin' && user.role !== 'staff' : stryMutAct_9fa48("14870") ? false : stryMutAct_9fa48("14869") ? true : (stryCov_9fa48("14869", "14870", "14871"), (stryMutAct_9fa48("14872") ? user : (stryCov_9fa48("14872"), !user)) || (stryMutAct_9fa48("14874") ? user.role !== 'admin' || user.role !== 'staff' : stryMutAct_9fa48("14873") ? false : (stryCov_9fa48("14873", "14874"), (stryMutAct_9fa48("14876") ? user.role === 'admin' : stryMutAct_9fa48("14875") ? true : (stryCov_9fa48("14875", "14876"), user.role !== (stryMutAct_9fa48("14877") ? "" : (stryCov_9fa48("14877"), 'admin')))) && (stryMutAct_9fa48("14879") ? user.role === 'staff' : stryMutAct_9fa48("14878") ? true : (stryCov_9fa48("14878", "14879"), user.role !== (stryMutAct_9fa48("14880") ? "" : (stryCov_9fa48("14880"), 'staff')))))))) {
          if (stryMutAct_9fa48("14881")) {
            {}
          } else {
            stryCov_9fa48("14881");
            setError(stryMutAct_9fa48("14882") ? "" : (stryCov_9fa48("14882"), 'Access denied. Admin or staff privileges required.'));
            setLoading(stryMutAct_9fa48("14883") ? true : (stryCov_9fa48("14883"), false));
            return;
          }
        }
        fetchInitialData();
      }
    }, stryMutAct_9fa48("14884") ? [] : (stryCov_9fa48("14884"), [user, authToken]));
    const fetchInitialData = async () => {
      if (stryMutAct_9fa48("14885")) {
        {}
      } else {
        stryCov_9fa48("14885");
        try {
          if (stryMutAct_9fa48("14886")) {
            {}
          } else {
            stryCov_9fa48("14886");
            await Promise.all(stryMutAct_9fa48("14887") ? [] : (stryCov_9fa48("14887"), [fetchAvailableCohorts(), fetchAssessmentGrades(stryMutAct_9fa48("14888") ? false : (stryCov_9fa48("14888"), true))]));
          }
        } catch (err) {
          if (stryMutAct_9fa48("14889")) {
            {}
          } else {
            stryCov_9fa48("14889");
            console.error(stryMutAct_9fa48("14890") ? "" : (stryCov_9fa48("14890"), 'Error fetching initial data:'), err);
            setError(stryMutAct_9fa48("14891") ? "" : (stryCov_9fa48("14891"), 'Failed to load initial data'));
          }
        } finally {
          if (stryMutAct_9fa48("14892")) {
            {}
          } else {
            stryCov_9fa48("14892");
            setLoading(stryMutAct_9fa48("14893") ? true : (stryCov_9fa48("14893"), false));
          }
        }
      }
    };
    const fetchAvailableCohorts = async () => {
      if (stryMutAct_9fa48("14894")) {
        {}
      } else {
        stryCov_9fa48("14894");
        try {
          if (stryMutAct_9fa48("14895")) {
            {}
          } else {
            stryCov_9fa48("14895");
            const response = await fetch(stryMutAct_9fa48("14896") ? `` : (stryCov_9fa48("14896"), `${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/cohorts`), stryMutAct_9fa48("14897") ? {} : (stryCov_9fa48("14897"), {
              headers: stryMutAct_9fa48("14898") ? {} : (stryCov_9fa48("14898"), {
                'Authorization': stryMutAct_9fa48("14899") ? `` : (stryCov_9fa48("14899"), `Bearer ${authToken}`),
                'Content-Type': stryMutAct_9fa48("14900") ? "" : (stryCov_9fa48("14900"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("14903") ? false : stryMutAct_9fa48("14902") ? true : stryMutAct_9fa48("14901") ? response.ok : (stryCov_9fa48("14901", "14902", "14903"), !response.ok)) {
              if (stryMutAct_9fa48("14904")) {
                {}
              } else {
                stryCov_9fa48("14904");
                throw new Error(stryMutAct_9fa48("14905") ? "" : (stryCov_9fa48("14905"), 'Failed to fetch cohorts'));
              }
            }
            const data = await response.json();
            setAvailableCohorts(stryMutAct_9fa48("14908") ? data.cohorts && [] : stryMutAct_9fa48("14907") ? false : stryMutAct_9fa48("14906") ? true : (stryCov_9fa48("14906", "14907", "14908"), data.cohorts || (stryMutAct_9fa48("14909") ? ["Stryker was here"] : (stryCov_9fa48("14909"), []))));
          }
        } catch (err) {
          if (stryMutAct_9fa48("14910")) {
            {}
          } else {
            stryCov_9fa48("14910");
            console.error(stryMutAct_9fa48("14911") ? "" : (stryCov_9fa48("14911"), 'Error fetching cohorts:'), err);
          }
        }
      }
    };
    const fetchAssessmentGrades = async (resetOffset = stryMutAct_9fa48("14912") ? true : (stryCov_9fa48("14912"), false)) => {
      if (stryMutAct_9fa48("14913")) {
        {}
      } else {
        stryCov_9fa48("14913");
        try {
          if (stryMutAct_9fa48("14914")) {
            {}
          } else {
            stryCov_9fa48("14914");
            setLoading(stryMutAct_9fa48("14915") ? false : (stryCov_9fa48("14915"), true));
            const currentOffset = resetOffset ? 0 : pagination.offset;
            const queryParams = new URLSearchParams(stryMutAct_9fa48("14916") ? {} : (stryCov_9fa48("14916"), {
              limit: pagination.limit.toString(),
              offset: currentOffset.toString()
            }));

            // Add filters
            Object.entries(filters).forEach(([key, value]) => {
              if (stryMutAct_9fa48("14917")) {
                {}
              } else {
                stryCov_9fa48("14917");
                if (stryMutAct_9fa48("14919") ? false : stryMutAct_9fa48("14918") ? true : (stryCov_9fa48("14918", "14919"), value)) {
                  if (stryMutAct_9fa48("14920")) {
                    {}
                  } else {
                    stryCov_9fa48("14920");
                    queryParams.append(key, value);
                  }
                }
              }
            });
            const response = await fetch(stryMutAct_9fa48("14921") ? `` : (stryCov_9fa48("14921"), `${import.meta.env.VITE_API_URL}/api/admin/assessment-grades?${queryParams}`), stryMutAct_9fa48("14922") ? {} : (stryCov_9fa48("14922"), {
              headers: stryMutAct_9fa48("14923") ? {} : (stryCov_9fa48("14923"), {
                'Authorization': stryMutAct_9fa48("14924") ? `` : (stryCov_9fa48("14924"), `Bearer ${authToken}`),
                'Content-Type': stryMutAct_9fa48("14925") ? "" : (stryCov_9fa48("14925"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("14928") ? false : stryMutAct_9fa48("14927") ? true : stryMutAct_9fa48("14926") ? response.ok : (stryCov_9fa48("14926", "14927", "14928"), !response.ok)) {
              if (stryMutAct_9fa48("14929")) {
                {}
              } else {
                stryCov_9fa48("14929");
                throw new Error(stryMutAct_9fa48("14930") ? "" : (stryCov_9fa48("14930"), 'Failed to fetch assessment grades'));
              }
            }
            const data = await response.json();

            // Debug pagination
            console.log(stryMutAct_9fa48("14931") ? "" : (stryCov_9fa48("14931"), '📊 Pagination Debug:'), stryMutAct_9fa48("14932") ? {} : (stryCov_9fa48("14932"), {
              resetOffset,
              requestedLimit: pagination.limit,
              requestedOffset: resetOffset ? 0 : pagination.offset,
              receivedRecords: stryMutAct_9fa48("14935") ? data.data?.length && 0 : stryMutAct_9fa48("14934") ? false : stryMutAct_9fa48("14933") ? true : (stryCov_9fa48("14933", "14934", "14935"), (stryMutAct_9fa48("14936") ? data.data.length : (stryCov_9fa48("14936"), data.data?.length)) || 0),
              currentTotal: assessmentGrades.length,
              paginationData: data.pagination,
              filters: filters,
              queryUrl: stryMutAct_9fa48("14937") ? `` : (stryCov_9fa48("14937"), `${import.meta.env.VITE_API_URL}/api/admin/assessment-grades?${queryParams}`)
            }));
            if (stryMutAct_9fa48("14939") ? false : stryMutAct_9fa48("14938") ? true : (stryCov_9fa48("14938", "14939"), resetOffset)) {
              if (stryMutAct_9fa48("14940")) {
                {}
              } else {
                stryCov_9fa48("14940");
                setAssessmentGrades(stryMutAct_9fa48("14943") ? data.data && [] : stryMutAct_9fa48("14942") ? false : stryMutAct_9fa48("14941") ? true : (stryCov_9fa48("14941", "14942", "14943"), data.data || (stryMutAct_9fa48("14944") ? ["Stryker was here"] : (stryCov_9fa48("14944"), []))));
                setPagination(stryMutAct_9fa48("14945") ? () => undefined : (stryCov_9fa48("14945"), prev => stryMutAct_9fa48("14946") ? {} : (stryCov_9fa48("14946"), {
                  ...prev,
                  offset: 0,
                  ...data.pagination
                })));
              }
            } else {
              if (stryMutAct_9fa48("14947")) {
                {}
              } else {
                stryCov_9fa48("14947");
                setAssessmentGrades(stryMutAct_9fa48("14948") ? () => undefined : (stryCov_9fa48("14948"), prev => stryMutAct_9fa48("14949") ? [] : (stryCov_9fa48("14949"), [...prev, ...(stryMutAct_9fa48("14952") ? data.data && [] : stryMutAct_9fa48("14951") ? false : stryMutAct_9fa48("14950") ? true : (stryCov_9fa48("14950", "14951", "14952"), data.data || (stryMutAct_9fa48("14953") ? ["Stryker was here"] : (stryCov_9fa48("14953"), []))))])));
                setPagination(stryMutAct_9fa48("14954") ? () => undefined : (stryCov_9fa48("14954"), prev => stryMutAct_9fa48("14955") ? {} : (stryCov_9fa48("14955"), {
                  ...prev,
                  ...data.pagination
                })));
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("14956")) {
            {}
          } else {
            stryCov_9fa48("14956");
            console.error(stryMutAct_9fa48("14957") ? "" : (stryCov_9fa48("14957"), 'Error fetching assessment grades:'), err);
            setError(stryMutAct_9fa48("14958") ? "" : (stryCov_9fa48("14958"), 'Failed to fetch assessment grades'));
          }
        } finally {
          if (stryMutAct_9fa48("14959")) {
            {}
          } else {
            stryCov_9fa48("14959");
            setLoading(stryMutAct_9fa48("14960") ? true : (stryCov_9fa48("14960"), false));
          }
        }
      }
    };

    // Statistics function removed

    const handleFilterChange = (key, value) => {
      if (stryMutAct_9fa48("14961")) {
        {}
      } else {
        stryCov_9fa48("14961");
        setFilters(stryMutAct_9fa48("14962") ? () => undefined : (stryCov_9fa48("14962"), prev => stryMutAct_9fa48("14963") ? {} : (stryCov_9fa48("14963"), {
          ...prev,
          [key]: value
        })));
      }
    };
    const applyFilters = () => {
      if (stryMutAct_9fa48("14964")) {
        {}
      } else {
        stryCov_9fa48("14964");
        setSelectedUsers(new Set());
        fetchAssessmentGrades(stryMutAct_9fa48("14965") ? false : (stryCov_9fa48("14965"), true));
      }
    };
    const clearFilters = () => {
      if (stryMutAct_9fa48("14966")) {
        {}
      } else {
        stryCov_9fa48("14966");
        setFilters(stryMutAct_9fa48("14967") ? {} : (stryCov_9fa48("14967"), {
          cohort: stryMutAct_9fa48("14968") ? "Stryker was here!" : (stryCov_9fa48("14968"), ''),
          date: stryMutAct_9fa48("14969") ? "Stryker was here!" : (stryCov_9fa48("14969"), ''),
          startDate: stryMutAct_9fa48("14970") ? "Stryker was here!" : (stryCov_9fa48("14970"), ''),
          endDate: stryMutAct_9fa48("14971") ? "Stryker was here!" : (stryCov_9fa48("14971"), ''),
          assessmentType: stryMutAct_9fa48("14972") ? "Stryker was here!" : (stryCov_9fa48("14972"), '')
        }));
        setSelectedUsers(new Set());
        fetchAssessmentGrades(stryMutAct_9fa48("14973") ? false : (stryCov_9fa48("14973"), true));
      }
    };
    const handleUserSelection = (userId, isSelected) => {
      if (stryMutAct_9fa48("14974")) {
        {}
      } else {
        stryCov_9fa48("14974");
        setSelectedUsers(prev => {
          if (stryMutAct_9fa48("14975")) {
            {}
          } else {
            stryCov_9fa48("14975");
            const newSet = new Set(prev);
            if (stryMutAct_9fa48("14977") ? false : stryMutAct_9fa48("14976") ? true : (stryCov_9fa48("14976", "14977"), isSelected)) {
              if (stryMutAct_9fa48("14978")) {
                {}
              } else {
                stryCov_9fa48("14978");
                newSet.add(userId);
              }
            } else {
              if (stryMutAct_9fa48("14979")) {
                {}
              } else {
                stryCov_9fa48("14979");
                newSet.delete(userId);
              }
            }
            return newSet;
          }
        });
      }
    };
    const handleSelectAll = () => {
      if (stryMutAct_9fa48("14980")) {
        {}
      } else {
        stryCov_9fa48("14980");
        if (stryMutAct_9fa48("14983") ? selectedUsers.size !== assessmentGrades.length : stryMutAct_9fa48("14982") ? false : stryMutAct_9fa48("14981") ? true : (stryCov_9fa48("14981", "14982", "14983"), selectedUsers.size === assessmentGrades.length)) {
          if (stryMutAct_9fa48("14984")) {
            {}
          } else {
            stryCov_9fa48("14984");
            setSelectedUsers(new Set());
          }
        } else {
          if (stryMutAct_9fa48("14985")) {
            {}
          } else {
            stryCov_9fa48("14985");
            setSelectedUsers(new Set(assessmentGrades.map(stryMutAct_9fa48("14986") ? () => undefined : (stryCov_9fa48("14986"), grade => grade.user_id))));
          }
        }
      }
    };
    const viewGrade = grade => {
      if (stryMutAct_9fa48("14987")) {
        {}
      } else {
        stryCov_9fa48("14987");
        setSelectedGrade(grade);
        setShowGradeModal(stryMutAct_9fa48("14988") ? false : (stryCov_9fa48("14988"), true));
      }
    };
    const handleSendEmails = () => {
      if (stryMutAct_9fa48("14989")) {
        {}
      } else {
        stryCov_9fa48("14989");
        if (stryMutAct_9fa48("14992") ? selectedUsers.size !== 0 : stryMutAct_9fa48("14991") ? false : stryMutAct_9fa48("14990") ? true : (stryCov_9fa48("14990", "14991", "14992"), selectedUsers.size === 0)) {
          if (stryMutAct_9fa48("14993")) {
            {}
          } else {
            stryCov_9fa48("14993");
            Swal.fire(stryMutAct_9fa48("14994") ? {} : (stryCov_9fa48("14994"), {
              icon: stryMutAct_9fa48("14995") ? "" : (stryCov_9fa48("14995"), 'warning'),
              title: stryMutAct_9fa48("14996") ? "" : (stryCov_9fa48("14996"), 'No Users Selected'),
              text: stryMutAct_9fa48("14997") ? "" : (stryCov_9fa48("14997"), 'Please select at least one user to send emails to.'),
              confirmButtonColor: stryMutAct_9fa48("14998") ? "" : (stryCov_9fa48("14998"), '#3085d6'),
              background: stryMutAct_9fa48("14999") ? "" : (stryCov_9fa48("14999"), '#1f2937'),
              color: stryMutAct_9fa48("15000") ? "" : (stryCov_9fa48("15000"), '#f9fafb'),
              customClass: stryMutAct_9fa48("15001") ? {} : (stryCov_9fa48("15001"), {
                popup: stryMutAct_9fa48("15002") ? "" : (stryCov_9fa48("15002"), 'swal-dark-popup'),
                title: stryMutAct_9fa48("15003") ? "" : (stryCov_9fa48("15003"), 'swal-dark-title'),
                content: stryMutAct_9fa48("15004") ? "" : (stryCov_9fa48("15004"), 'swal-dark-content')
              })
            }));
            return;
          }
        }
        setShowEmailModal(stryMutAct_9fa48("15005") ? false : (stryCov_9fa48("15005"), true));
      }
    };
    const exportData = async (format = stryMutAct_9fa48("15006") ? "" : (stryCov_9fa48("15006"), 'csv')) => {
      if (stryMutAct_9fa48("15007")) {
        {}
      } else {
        stryCov_9fa48("15007");
        try {
          if (stryMutAct_9fa48("15008")) {
            {}
          } else {
            stryCov_9fa48("15008");
            const queryParams = new URLSearchParams(stryMutAct_9fa48("15009") ? {} : (stryCov_9fa48("15009"), {
              format
            }));

            // Add current filters to export
            Object.entries(filters).forEach(([key, value]) => {
              if (stryMutAct_9fa48("15010")) {
                {}
              } else {
                stryCov_9fa48("15010");
                if (stryMutAct_9fa48("15012") ? false : stryMutAct_9fa48("15011") ? true : (stryCov_9fa48("15011", "15012"), value)) {
                  if (stryMutAct_9fa48("15013")) {
                    {}
                  } else {
                    stryCov_9fa48("15013");
                    queryParams.append(key, value);
                  }
                }
              }
            });
            const response = await fetch(stryMutAct_9fa48("15014") ? `` : (stryCov_9fa48("15014"), `${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/export?${queryParams}`), stryMutAct_9fa48("15015") ? {} : (stryCov_9fa48("15015"), {
              headers: stryMutAct_9fa48("15016") ? {} : (stryCov_9fa48("15016"), {
                'Authorization': stryMutAct_9fa48("15017") ? `` : (stryCov_9fa48("15017"), `Bearer ${authToken}`),
                'Content-Type': stryMutAct_9fa48("15018") ? "" : (stryCov_9fa48("15018"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("15021") ? false : stryMutAct_9fa48("15020") ? true : stryMutAct_9fa48("15019") ? response.ok : (stryCov_9fa48("15019", "15020", "15021"), !response.ok)) {
              if (stryMutAct_9fa48("15022")) {
                {}
              } else {
                stryCov_9fa48("15022");
                throw new Error(stryMutAct_9fa48("15023") ? "" : (stryCov_9fa48("15023"), 'Failed to export data'));
              }
            }
            if (stryMutAct_9fa48("15026") ? format !== 'csv' : stryMutAct_9fa48("15025") ? false : stryMutAct_9fa48("15024") ? true : (stryCov_9fa48("15024", "15025", "15026"), format === (stryMutAct_9fa48("15027") ? "" : (stryCov_9fa48("15027"), 'csv')))) {
              if (stryMutAct_9fa48("15028")) {
                {}
              } else {
                stryCov_9fa48("15028");
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement(stryMutAct_9fa48("15029") ? "" : (stryCov_9fa48("15029"), 'a'));
                a.style.display = stryMutAct_9fa48("15030") ? "" : (stryCov_9fa48("15030"), 'none');
                a.href = url;
                a.download = stryMutAct_9fa48("15031") ? `` : (stryCov_9fa48("15031"), `assessment-grades-${new Date().toISOString().split(stryMutAct_9fa48("15032") ? "" : (stryCov_9fa48("15032"), 'T'))[0]}.csv`);
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
              }
            } else {
              if (stryMutAct_9fa48("15033")) {
                {}
              } else {
                stryCov_9fa48("15033");
                const data = await response.json();
                const blob = new Blob(stryMutAct_9fa48("15034") ? [] : (stryCov_9fa48("15034"), [JSON.stringify(data, null, 2)]), stryMutAct_9fa48("15035") ? {} : (stryCov_9fa48("15035"), {
                  type: stryMutAct_9fa48("15036") ? "" : (stryCov_9fa48("15036"), 'application/json')
                }));
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement(stryMutAct_9fa48("15037") ? "" : (stryCov_9fa48("15037"), 'a'));
                a.style.display = stryMutAct_9fa48("15038") ? "" : (stryCov_9fa48("15038"), 'none');
                a.href = url;
                a.download = stryMutAct_9fa48("15039") ? `` : (stryCov_9fa48("15039"), `assessment-grades-${new Date().toISOString().split(stryMutAct_9fa48("15040") ? "" : (stryCov_9fa48("15040"), 'T'))[0]}.json`);
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("15041")) {
            {}
          } else {
            stryCov_9fa48("15041");
            console.error(stryMutAct_9fa48("15042") ? "" : (stryCov_9fa48("15042"), 'Error exporting data:'), err);
            Swal.fire(stryMutAct_9fa48("15043") ? {} : (stryCov_9fa48("15043"), {
              icon: stryMutAct_9fa48("15044") ? "" : (stryCov_9fa48("15044"), 'error'),
              title: stryMutAct_9fa48("15045") ? "" : (stryCov_9fa48("15045"), 'Export Failed'),
              text: stryMutAct_9fa48("15046") ? "" : (stryCov_9fa48("15046"), 'Failed to export data. Please try again.'),
              confirmButtonColor: stryMutAct_9fa48("15047") ? "" : (stryCov_9fa48("15047"), '#d33'),
              background: stryMutAct_9fa48("15048") ? "" : (stryCov_9fa48("15048"), '#1f2937'),
              color: stryMutAct_9fa48("15049") ? "" : (stryCov_9fa48("15049"), '#f9fafb'),
              customClass: stryMutAct_9fa48("15050") ? {} : (stryCov_9fa48("15050"), {
                popup: stryMutAct_9fa48("15051") ? "" : (stryCov_9fa48("15051"), 'swal-dark-popup'),
                title: stryMutAct_9fa48("15052") ? "" : (stryCov_9fa48("15052"), 'swal-dark-title'),
                content: stryMutAct_9fa48("15053") ? "" : (stryCov_9fa48("15053"), 'swal-dark-content')
              })
            }));
          }
        }
      }
    };
    const loadMore = () => {
      if (stryMutAct_9fa48("15054")) {
        {}
      } else {
        stryCov_9fa48("15054");
        if (stryMutAct_9fa48("15057") ? pagination.hasMore || !loading : stryMutAct_9fa48("15056") ? false : stryMutAct_9fa48("15055") ? true : (stryCov_9fa48("15055", "15056", "15057"), pagination.hasMore && (stryMutAct_9fa48("15058") ? loading : (stryCov_9fa48("15058"), !loading)))) {
          if (stryMutAct_9fa48("15059")) {
            {}
          } else {
            stryCov_9fa48("15059");
            setPagination(stryMutAct_9fa48("15060") ? () => undefined : (stryCov_9fa48("15060"), prev => stryMutAct_9fa48("15061") ? {} : (stryCov_9fa48("15061"), {
              ...prev,
              offset: stryMutAct_9fa48("15062") ? prev.offset - prev.limit : (stryCov_9fa48("15062"), prev.offset + prev.limit)
            })));
            fetchAssessmentGrades(stryMutAct_9fa48("15063") ? true : (stryCov_9fa48("15063"), false));
          }
        }
      }
    };
    const loadAllRecords = async () => {
      if (stryMutAct_9fa48("15064")) {
        {}
      } else {
        stryCov_9fa48("15064");
        try {
          if (stryMutAct_9fa48("15065")) {
            {}
          } else {
            stryCov_9fa48("15065");
            setLoading(stryMutAct_9fa48("15066") ? false : (stryCov_9fa48("15066"), true));
            console.log(stryMutAct_9fa48("15067") ? "" : (stryCov_9fa48("15067"), '📊 Loading all assessment grades with no limit...'));

            // Fetch without any limit to get all records
            const queryParams = new URLSearchParams();

            // Add filters but NO limit/offset
            Object.entries(filters).forEach(([key, value]) => {
              if (stryMutAct_9fa48("15068")) {
                {}
              } else {
                stryCov_9fa48("15068");
                if (stryMutAct_9fa48("15070") ? false : stryMutAct_9fa48("15069") ? true : (stryCov_9fa48("15069", "15070"), value)) {
                  if (stryMutAct_9fa48("15071")) {
                    {}
                  } else {
                    stryCov_9fa48("15071");
                    queryParams.append(key, value);
                  }
                }
              }
            });

            // Don't add limit or offset parameters at all
            const url = stryMutAct_9fa48("15072") ? `` : (stryCov_9fa48("15072"), `${import.meta.env.VITE_API_URL}/api/admin/assessment-grades${queryParams.toString() ? (stryMutAct_9fa48("15073") ? "" : (stryCov_9fa48("15073"), '?')) + queryParams.toString() : stryMutAct_9fa48("15074") ? "Stryker was here!" : (stryCov_9fa48("15074"), '')}`);
            console.log(stryMutAct_9fa48("15075") ? "" : (stryCov_9fa48("15075"), '🔗 Load All URL:'), url);
            const response = await fetch(url, stryMutAct_9fa48("15076") ? {} : (stryCov_9fa48("15076"), {
              headers: stryMutAct_9fa48("15077") ? {} : (stryCov_9fa48("15077"), {
                'Authorization': stryMutAct_9fa48("15078") ? `` : (stryCov_9fa48("15078"), `Bearer ${authToken}`),
                'Content-Type': stryMutAct_9fa48("15079") ? "" : (stryCov_9fa48("15079"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("15082") ? false : stryMutAct_9fa48("15081") ? true : stryMutAct_9fa48("15080") ? response.ok : (stryCov_9fa48("15080", "15081", "15082"), !response.ok)) {
              if (stryMutAct_9fa48("15083")) {
                {}
              } else {
                stryCov_9fa48("15083");
                throw new Error(stryMutAct_9fa48("15084") ? "" : (stryCov_9fa48("15084"), 'Failed to fetch all assessment grades'));
              }
            }
            const data = await response.json();
            console.log(stryMutAct_9fa48("15085") ? `` : (stryCov_9fa48("15085"), `📊 Load All - API returned ${stryMutAct_9fa48("15088") ? data.data?.length && 0 : stryMutAct_9fa48("15087") ? false : stryMutAct_9fa48("15086") ? true : (stryCov_9fa48("15086", "15087", "15088"), (stryMutAct_9fa48("15089") ? data.data.length : (stryCov_9fa48("15089"), data.data?.length)) || 0)} records`));
            console.log(stryMutAct_9fa48("15090") ? "" : (stryCov_9fa48("15090"), '📊 Load All - Pagination data:'), data.pagination);
            setAssessmentGrades(stryMutAct_9fa48("15093") ? data.data && [] : stryMutAct_9fa48("15092") ? false : stryMutAct_9fa48("15091") ? true : (stryCov_9fa48("15091", "15092", "15093"), data.data || (stryMutAct_9fa48("15094") ? ["Stryker was here"] : (stryCov_9fa48("15094"), []))));
            setPagination(stryMutAct_9fa48("15095") ? {} : (stryCov_9fa48("15095"), {
              total: stryMutAct_9fa48("15098") ? (data.pagination?.total || data.data?.length) && 0 : stryMutAct_9fa48("15097") ? false : stryMutAct_9fa48("15096") ? true : (stryCov_9fa48("15096", "15097", "15098"), (stryMutAct_9fa48("15100") ? data.pagination?.total && data.data?.length : stryMutAct_9fa48("15099") ? false : (stryCov_9fa48("15099", "15100"), (stryMutAct_9fa48("15101") ? data.pagination.total : (stryCov_9fa48("15101"), data.pagination?.total)) || (stryMutAct_9fa48("15102") ? data.data.length : (stryCov_9fa48("15102"), data.data?.length)))) || 0),
              limit: stryMutAct_9fa48("15105") ? data.data?.length && 0 : stryMutAct_9fa48("15104") ? false : stryMutAct_9fa48("15103") ? true : (stryCov_9fa48("15103", "15104", "15105"), (stryMutAct_9fa48("15106") ? data.data.length : (stryCov_9fa48("15106"), data.data?.length)) || 0),
              offset: 0,
              hasMore: stryMutAct_9fa48("15107") ? true : (stryCov_9fa48("15107"), false)
            }));
            console.log(stryMutAct_9fa48("15108") ? `` : (stryCov_9fa48("15108"), `✅ Load All - Successfully loaded ${stryMutAct_9fa48("15111") ? data.data?.length && 0 : stryMutAct_9fa48("15110") ? false : stryMutAct_9fa48("15109") ? true : (stryCov_9fa48("15109", "15110", "15111"), (stryMutAct_9fa48("15112") ? data.data.length : (stryCov_9fa48("15112"), data.data?.length)) || 0)} assessment grades`));
          }
        } catch (err) {
          if (stryMutAct_9fa48("15113")) {
            {}
          } else {
            stryCov_9fa48("15113");
            console.error(stryMutAct_9fa48("15114") ? "" : (stryCov_9fa48("15114"), 'Error in Load All:'), err);
            setError(stryMutAct_9fa48("15115") ? "" : (stryCov_9fa48("15115"), 'Failed to load all assessment grades'));
          }
        } finally {
          if (stryMutAct_9fa48("15116")) {
            {}
          } else {
            stryCov_9fa48("15116");
            setLoading(stryMutAct_9fa48("15117") ? true : (stryCov_9fa48("15117"), false));
          }
        }
      }
    };
    const debugBigQuery = async () => {
      if (stryMutAct_9fa48("15118")) {
        {}
      } else {
        stryCov_9fa48("15118");
        try {
          if (stryMutAct_9fa48("15119")) {
            {}
          } else {
            stryCov_9fa48("15119");
            console.log(stryMutAct_9fa48("15120") ? "" : (stryCov_9fa48("15120"), '🔍 Debugging BigQuery data...'));
            const response = await fetch(stryMutAct_9fa48("15121") ? `` : (stryCov_9fa48("15121"), `${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/debug/bigquery-data`), stryMutAct_9fa48("15122") ? {} : (stryCov_9fa48("15122"), {
              headers: stryMutAct_9fa48("15123") ? {} : (stryCov_9fa48("15123"), {
                'Authorization': stryMutAct_9fa48("15124") ? `` : (stryCov_9fa48("15124"), `Bearer ${authToken}`),
                'Content-Type': stryMutAct_9fa48("15125") ? "" : (stryCov_9fa48("15125"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("15128") ? false : stryMutAct_9fa48("15127") ? true : stryMutAct_9fa48("15126") ? response.ok : (stryCov_9fa48("15126", "15127", "15128"), !response.ok)) {
              if (stryMutAct_9fa48("15129")) {
                {}
              } else {
                stryCov_9fa48("15129");
                throw new Error(stryMutAct_9fa48("15130") ? "" : (stryCov_9fa48("15130"), 'Failed to fetch BigQuery debug data'));
              }
            }
            const debugData = await response.json();
            console.log(stryMutAct_9fa48("15131") ? "" : (stryCov_9fa48("15131"), '🔍 BigQuery Debug Results:'), debugData);
            console.log(stryMutAct_9fa48("15132") ? "" : (stryCov_9fa48("15132"), '📊 Total Records:'), debugData.debug.counts.total_records);
            console.log(stryMutAct_9fa48("15133") ? "" : (stryCov_9fa48("15133"), '👥 Unique Users:'), debugData.debug.counts.unique_users);
            console.log(stryMutAct_9fa48("15134") ? "" : (stryCov_9fa48("15134"), '📋 Sample Records:'), debugData.debug.sampleRecords);
            console.log(stryMutAct_9fa48("15135") ? "" : (stryCov_9fa48("15135"), '🎯 Latest Per User:'), debugData.debug.latestPerUser);
            alert(stryMutAct_9fa48("15136") ? `` : (stryCov_9fa48("15136"), `BigQuery Debug Results:
Total Records: ${debugData.debug.counts.total_records}
Unique Users: ${debugData.debug.counts.unique_users}
Latest Per User: ${debugData.debug.latestPerUser.length}

Check console for detailed results.`));
          }
        } catch (err) {
          if (stryMutAct_9fa48("15137")) {
            {}
          } else {
            stryCov_9fa48("15137");
            console.error(stryMutAct_9fa48("15138") ? "" : (stryCov_9fa48("15138"), 'Error debugging BigQuery:'), err);
            alert(stryMutAct_9fa48("15139") ? "" : (stryCov_9fa48("15139"), 'Failed to debug BigQuery data. Check console for details.'));
          }
        }
      }
    };

    // Overview editing functions
    const handleStartEditing = grade => {
      if (stryMutAct_9fa48("15140")) {
        {}
      } else {
        stryCov_9fa48("15140");
        setIsEditingOverview(stryMutAct_9fa48("15141") ? false : (stryCov_9fa48("15141"), true));
        setEditingStrengths(stryMutAct_9fa48("15144") ? grade.strengths_summary && '' : stryMutAct_9fa48("15143") ? false : stryMutAct_9fa48("15142") ? true : (stryCov_9fa48("15142", "15143", "15144"), grade.strengths_summary || (stryMutAct_9fa48("15145") ? "Stryker was here!" : (stryCov_9fa48("15145"), ''))));
        setEditingGrowthAreas(stryMutAct_9fa48("15148") ? grade.growth_areas_summary && '' : stryMutAct_9fa48("15147") ? false : stryMutAct_9fa48("15146") ? true : (stryCov_9fa48("15146", "15147", "15148"), grade.growth_areas_summary || (stryMutAct_9fa48("15149") ? "Stryker was here!" : (stryCov_9fa48("15149"), ''))));
      }
    };
    const handleCancelEditing = () => {
      if (stryMutAct_9fa48("15150")) {
        {}
      } else {
        stryCov_9fa48("15150");
        setIsEditingOverview(stryMutAct_9fa48("15151") ? true : (stryCov_9fa48("15151"), false));
        setEditingStrengths(stryMutAct_9fa48("15152") ? "Stryker was here!" : (stryCov_9fa48("15152"), ''));
        setEditingGrowthAreas(stryMutAct_9fa48("15153") ? "Stryker was here!" : (stryCov_9fa48("15153"), ''));
      }
    };
    const handleSaveOverview = async userId => {
      if (stryMutAct_9fa48("15154")) {
        {}
      } else {
        stryCov_9fa48("15154");
        try {
          if (stryMutAct_9fa48("15155")) {
            {}
          } else {
            stryCov_9fa48("15155");
            setSavingOverview(stryMutAct_9fa48("15156") ? false : (stryCov_9fa48("15156"), true));
            const response = await fetch(stryMutAct_9fa48("15157") ? `` : (stryCov_9fa48("15157"), `${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/update-feedback`), stryMutAct_9fa48("15158") ? {} : (stryCov_9fa48("15158"), {
              method: stryMutAct_9fa48("15159") ? "" : (stryCov_9fa48("15159"), 'POST'),
              headers: stryMutAct_9fa48("15160") ? {} : (stryCov_9fa48("15160"), {
                'Content-Type': stryMutAct_9fa48("15161") ? "" : (stryCov_9fa48("15161"), 'application/json'),
                'Authorization': stryMutAct_9fa48("15162") ? `` : (stryCov_9fa48("15162"), `Bearer ${authToken}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("15163") ? {} : (stryCov_9fa48("15163"), {
                userId: userId,
                strengths_summary: editingStrengths,
                growth_areas_summary: editingGrowthAreas
              }))
            }));
            if (stryMutAct_9fa48("15166") ? false : stryMutAct_9fa48("15165") ? true : stryMutAct_9fa48("15164") ? response.ok : (stryCov_9fa48("15164", "15165", "15166"), !response.ok)) {
              if (stryMutAct_9fa48("15167")) {
                {}
              } else {
                stryCov_9fa48("15167");
                throw new Error(stryMutAct_9fa48("15168") ? "" : (stryCov_9fa48("15168"), 'Failed to update feedback'));
              }
            }
            const result = await response.json();

            // Update the local state
            setAssessmentGrades(stryMutAct_9fa48("15169") ? () => undefined : (stryCov_9fa48("15169"), prev => prev.map(stryMutAct_9fa48("15170") ? () => undefined : (stryCov_9fa48("15170"), grade => (stryMutAct_9fa48("15173") ? grade.user_id !== userId : stryMutAct_9fa48("15172") ? false : stryMutAct_9fa48("15171") ? true : (stryCov_9fa48("15171", "15172", "15173"), grade.user_id === userId)) ? stryMutAct_9fa48("15174") ? {} : (stryCov_9fa48("15174"), {
              ...grade,
              strengths_summary: editingStrengths,
              growth_areas_summary: editingGrowthAreas
            }) : grade))));

            // Update selectedGrade if it's the same user
            if (stryMutAct_9fa48("15177") ? selectedGrade || selectedGrade.user_id === userId : stryMutAct_9fa48("15176") ? false : stryMutAct_9fa48("15175") ? true : (stryCov_9fa48("15175", "15176", "15177"), selectedGrade && (stryMutAct_9fa48("15179") ? selectedGrade.user_id !== userId : stryMutAct_9fa48("15178") ? true : (stryCov_9fa48("15178", "15179"), selectedGrade.user_id === userId)))) {
              if (stryMutAct_9fa48("15180")) {
                {}
              } else {
                stryCov_9fa48("15180");
                setSelectedGrade(stryMutAct_9fa48("15181") ? () => undefined : (stryCov_9fa48("15181"), prev => stryMutAct_9fa48("15182") ? {} : (stryCov_9fa48("15182"), {
                  ...prev,
                  strengths_summary: editingStrengths,
                  growth_areas_summary: editingGrowthAreas
                })));
              }
            }
            setIsEditingOverview(stryMutAct_9fa48("15183") ? true : (stryCov_9fa48("15183"), false));
            setEditingStrengths(stryMutAct_9fa48("15184") ? "Stryker was here!" : (stryCov_9fa48("15184"), ''));
            setEditingGrowthAreas(stryMutAct_9fa48("15185") ? "Stryker was here!" : (stryCov_9fa48("15185"), ''));
            Swal.fire(stryMutAct_9fa48("15186") ? {} : (stryCov_9fa48("15186"), {
              icon: stryMutAct_9fa48("15187") ? "" : (stryCov_9fa48("15187"), 'success'),
              title: stryMutAct_9fa48("15188") ? "" : (stryCov_9fa48("15188"), 'Feedback Updated!'),
              text: stryMutAct_9fa48("15189") ? "" : (stryCov_9fa48("15189"), 'The feedback has been successfully updated in the database.'),
              confirmButtonColor: stryMutAct_9fa48("15190") ? "" : (stryCov_9fa48("15190"), '#10b981'),
              timer: 3000,
              timerProgressBar: stryMutAct_9fa48("15191") ? false : (stryCov_9fa48("15191"), true),
              background: stryMutAct_9fa48("15192") ? "" : (stryCov_9fa48("15192"), '#1f2937'),
              color: stryMutAct_9fa48("15193") ? "" : (stryCov_9fa48("15193"), '#f9fafb'),
              customClass: stryMutAct_9fa48("15194") ? {} : (stryCov_9fa48("15194"), {
                popup: stryMutAct_9fa48("15195") ? "" : (stryCov_9fa48("15195"), 'swal-dark-popup'),
                title: stryMutAct_9fa48("15196") ? "" : (stryCov_9fa48("15196"), 'swal-dark-title'),
                content: stryMutAct_9fa48("15197") ? "" : (stryCov_9fa48("15197"), 'swal-dark-content')
              })
            }));
          }
        } catch (error) {
          if (stryMutAct_9fa48("15198")) {
            {}
          } else {
            stryCov_9fa48("15198");
            console.error(stryMutAct_9fa48("15199") ? "" : (stryCov_9fa48("15199"), 'Error updating feedback:'), error);
            Swal.fire(stryMutAct_9fa48("15200") ? {} : (stryCov_9fa48("15200"), {
              icon: stryMutAct_9fa48("15201") ? "" : (stryCov_9fa48("15201"), 'error'),
              title: stryMutAct_9fa48("15202") ? "" : (stryCov_9fa48("15202"), 'Update Failed'),
              text: stryMutAct_9fa48("15203") ? "" : (stryCov_9fa48("15203"), 'Failed to update feedback. Please try again.'),
              confirmButtonColor: stryMutAct_9fa48("15204") ? "" : (stryCov_9fa48("15204"), '#d33'),
              background: stryMutAct_9fa48("15205") ? "" : (stryCov_9fa48("15205"), '#1f2937'),
              color: stryMutAct_9fa48("15206") ? "" : (stryCov_9fa48("15206"), '#f9fafb'),
              customClass: stryMutAct_9fa48("15207") ? {} : (stryCov_9fa48("15207"), {
                popup: stryMutAct_9fa48("15208") ? "" : (stryCov_9fa48("15208"), 'swal-dark-popup'),
                title: stryMutAct_9fa48("15209") ? "" : (stryCov_9fa48("15209"), 'swal-dark-title'),
                content: stryMutAct_9fa48("15210") ? "" : (stryCov_9fa48("15210"), 'swal-dark-content')
              })
            }));
          }
        } finally {
          if (stryMutAct_9fa48("15211")) {
            {}
          } else {
            stryCov_9fa48("15211");
            setSavingOverview(stryMutAct_9fa48("15212") ? true : (stryCov_9fa48("15212"), false));
          }
        }
      }
    };
    if (stryMutAct_9fa48("15214") ? false : stryMutAct_9fa48("15213") ? true : (stryCov_9fa48("15213", "15214"), error)) {
      if (stryMutAct_9fa48("15215")) {
        {}
      } else {
        stryCov_9fa48("15215");
        return <div className="assessment-grades">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>;
      }
    }
    return <div className="assessment-grades">
      <div className="assessment-grades__content">

      {/* Filters */}
      <div className="assessment-grades__filters">
        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="cohort">Cohort:</label>
            <select id="cohort" value={filters.cohort} onChange={stryMutAct_9fa48("15216") ? () => undefined : (stryCov_9fa48("15216"), e => handleFilterChange(stryMutAct_9fa48("15217") ? "" : (stryCov_9fa48("15217"), 'cohort'), e.target.value))}>
              <option value="">All Cohorts</option>
              {availableCohorts.map(stryMutAct_9fa48("15218") ? () => undefined : (stryCov_9fa48("15218"), cohort => <option key={cohort} value={cohort}>{cohort}</option>))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="date">Specific Date:</label>
            <input type="date" id="date" value={filters.date} onChange={stryMutAct_9fa48("15219") ? () => undefined : (stryCov_9fa48("15219"), e => handleFilterChange(stryMutAct_9fa48("15220") ? "" : (stryCov_9fa48("15220"), 'date'), e.target.value))} />
          </div>

          <div className="filter-group">
            <label htmlFor="startDate">Date Range:</label>
            <div className="date-range">
              <input type="date" id="startDate" value={filters.startDate} onChange={stryMutAct_9fa48("15221") ? () => undefined : (stryCov_9fa48("15221"), e => handleFilterChange(stryMutAct_9fa48("15222") ? "" : (stryCov_9fa48("15222"), 'startDate'), e.target.value))} placeholder="Start Date" />
              <span>to</span>
              <input type="date" value={filters.endDate} onChange={stryMutAct_9fa48("15223") ? () => undefined : (stryCov_9fa48("15223"), e => handleFilterChange(stryMutAct_9fa48("15224") ? "" : (stryCov_9fa48("15224"), 'endDate'), e.target.value))} placeholder="End Date" />
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="assessmentType">Assessment Type:</label>
            <select id="assessmentType" value={filters.assessmentType} onChange={stryMutAct_9fa48("15225") ? () => undefined : (stryCov_9fa48("15225"), e => handleFilterChange(stryMutAct_9fa48("15226") ? "" : (stryCov_9fa48("15226"), 'assessmentType'), e.target.value))}>
              <option value="">All Types</option>
              <option value="technical">Technical</option>
              <option value="business">Business</option>
              <option value="professional">Professional</option>
              <option value="self">Self Assessment</option>
            </select>
          </div>
        </div>

        <div className="filters-actions">
          <button className="btn btn-primary" onClick={applyFilters}>
            Apply Filters
          </button>
          <button className="btn btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="assessment-grades__actions">
        <div className="actions-left">
          <button className="btn btn-outline" onClick={handleSelectAll}>
            {(stryMutAct_9fa48("15229") ? selectedUsers.size !== assessmentGrades.length : stryMutAct_9fa48("15228") ? false : stryMutAct_9fa48("15227") ? true : (stryCov_9fa48("15227", "15228", "15229"), selectedUsers.size === assessmentGrades.length)) ? stryMutAct_9fa48("15230") ? "" : (stryCov_9fa48("15230"), 'Deselect All') : stryMutAct_9fa48("15231") ? "" : (stryCov_9fa48("15231"), 'Select All')}
          </button>
          <span className="selection-count">
            {selectedUsers.size} user{(stryMutAct_9fa48("15234") ? selectedUsers.size === 1 : stryMutAct_9fa48("15233") ? false : stryMutAct_9fa48("15232") ? true : (stryCov_9fa48("15232", "15233", "15234"), selectedUsers.size !== 1)) ? stryMutAct_9fa48("15235") ? "" : (stryCov_9fa48("15235"), 's') : stryMutAct_9fa48("15236") ? "Stryker was here!" : (stryCov_9fa48("15236"), '')} selected
          </span>
        </div>

        <div className="actions-right">
          <button className="btn btn-success" onClick={handleSendEmails} disabled={stryMutAct_9fa48("15239") ? selectedUsers.size !== 0 : stryMutAct_9fa48("15238") ? false : stryMutAct_9fa48("15237") ? true : (stryCov_9fa48("15237", "15238", "15239"), selectedUsers.size === 0)}>
            Send Mass Email
          </button>
          <button className="btn btn-primary" onClick={loadAllRecords} disabled={loading} title="Load all assessment grades (may take a moment)">
            {loading ? stryMutAct_9fa48("15240") ? "" : (stryCov_9fa48("15240"), 'Loading...') : stryMutAct_9fa48("15241") ? "" : (stryCov_9fa48("15241"), 'Load All')}
          </button>
          <button className="btn btn-outline" onClick={stryMutAct_9fa48("15242") ? () => undefined : (stryCov_9fa48("15242"), () => exportData(stryMutAct_9fa48("15243") ? "" : (stryCov_9fa48("15243"), 'csv')))}>
            Export CSV
          </button>
          <button className="btn btn-outline" onClick={stryMutAct_9fa48("15244") ? () => undefined : (stryCov_9fa48("15244"), () => exportData(stryMutAct_9fa48("15245") ? "" : (stryCov_9fa48("15245"), 'json')))}>
            Export JSON
          </button>
          <button className="btn btn-outline" onClick={stryMutAct_9fa48("15246") ? () => undefined : (stryCov_9fa48("15246"), () => fetchAssessmentGrades(stryMutAct_9fa48("15247") ? false : (stryCov_9fa48("15247"), true)))}>
            Refresh
          </button>
        </div>
      </div>

      {/* Pagination Info */}
      {stryMutAct_9fa48("15250") ? assessmentGrades.length > 0 || <div className="assessment-grades__info">
          <div className="pagination-info">
            Showing {assessmentGrades.length} of {pagination.total} assessment grades
            {pagination.hasMore && <span className="more-available"> • {pagination.total - assessmentGrades.length} more available</span>}
          </div>
        </div> : stryMutAct_9fa48("15249") ? false : stryMutAct_9fa48("15248") ? true : (stryCov_9fa48("15248", "15249", "15250"), (stryMutAct_9fa48("15253") ? assessmentGrades.length <= 0 : stryMutAct_9fa48("15252") ? assessmentGrades.length >= 0 : stryMutAct_9fa48("15251") ? true : (stryCov_9fa48("15251", "15252", "15253"), assessmentGrades.length > 0)) && <div className="assessment-grades__info">
          <div className="pagination-info">
            Showing {assessmentGrades.length} of {pagination.total} assessment grades
            {stryMutAct_9fa48("15256") ? pagination.hasMore || <span className="more-available"> • {pagination.total - assessmentGrades.length} more available</span> : stryMutAct_9fa48("15255") ? false : stryMutAct_9fa48("15254") ? true : (stryCov_9fa48("15254", "15255", "15256"), pagination.hasMore && <span className="more-available"> • {stryMutAct_9fa48("15257") ? pagination.total + assessmentGrades.length : (stryCov_9fa48("15257"), pagination.total - assessmentGrades.length)} more available</span>)}
          </div>
        </div>)}

      {/* Assessment Grades Table */}
      <div className="assessment-grades__table">
        {(stryMutAct_9fa48("15260") ? loading || assessmentGrades.length === 0 : stryMutAct_9fa48("15259") ? false : stryMutAct_9fa48("15258") ? true : (stryCov_9fa48("15258", "15259", "15260"), loading && (stryMutAct_9fa48("15262") ? assessmentGrades.length !== 0 : stryMutAct_9fa48("15261") ? true : (stryCov_9fa48("15261", "15262"), assessmentGrades.length === 0)))) ? <div className="loading">Loading assessment grades...</div> : (stryMutAct_9fa48("15265") ? assessmentGrades.length !== 0 : stryMutAct_9fa48("15264") ? false : stryMutAct_9fa48("15263") ? true : (stryCov_9fa48("15263", "15264", "15265"), assessmentGrades.length === 0)) ? <div className="no-data">No assessment grades found with current filters.</div> : <table>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" checked={stryMutAct_9fa48("15268") ? selectedUsers.size === assessmentGrades.length || assessmentGrades.length > 0 : stryMutAct_9fa48("15267") ? false : stryMutAct_9fa48("15266") ? true : (stryCov_9fa48("15266", "15267", "15268"), (stryMutAct_9fa48("15270") ? selectedUsers.size !== assessmentGrades.length : stryMutAct_9fa48("15269") ? true : (stryCov_9fa48("15269", "15270"), selectedUsers.size === assessmentGrades.length)) && (stryMutAct_9fa48("15273") ? assessmentGrades.length <= 0 : stryMutAct_9fa48("15272") ? assessmentGrades.length >= 0 : stryMutAct_9fa48("15271") ? true : (stryCov_9fa48("15271", "15272", "15273"), assessmentGrades.length > 0)))} onChange={handleSelectAll} />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Cohort</th>
                <th>Assessment Type</th>
                <th>Date Graded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessmentGrades.map(stryMutAct_9fa48("15274") ? () => undefined : (stryCov_9fa48("15274"), (grade, index) => <tr key={grade.user_id}>
                  <td>
                    <input type="checkbox" checked={selectedUsers.has(grade.user_id)} onChange={stryMutAct_9fa48("15275") ? () => undefined : (stryCov_9fa48("15275"), e => handleUserSelection(grade.user_id, e.target.checked))} />
                  </td>
                  <td>{grade.user_first_name} {grade.user_last_name}</td>
                  <td>{grade.user_email}</td>
                  <td>{grade.cohort}</td>
                  <td className="assessment-type">
                    <span className={stryMutAct_9fa48("15276") ? `` : (stryCov_9fa48("15276"), `type-badge type-holistic`)}>
                      holistic
                    </span>
                  </td>
                  <td>{new Date(stryMutAct_9fa48("15279") ? grade.created_at?.value && grade.created_at : stryMutAct_9fa48("15278") ? false : stryMutAct_9fa48("15277") ? true : (stryCov_9fa48("15277", "15278", "15279"), (stryMutAct_9fa48("15280") ? grade.created_at.value : (stryCov_9fa48("15280"), grade.created_at?.value)) || grade.created_at)).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={stryMutAct_9fa48("15281") ? () => undefined : (stryCov_9fa48("15281"), () => viewGrade(grade))}>
                      View Grade
                    </button>
                  </td>
                </tr>))}
            </tbody>
          </table>}

        {/* Load More Section */}
        {stryMutAct_9fa48("15284") ? pagination.hasMore || <div className="load-more">
            <div className="load-more-info">
              <p>Showing {assessmentGrades.length} of {pagination.total} records</p>
              <p>{pagination.total - assessmentGrades.length} more records available</p>
            </div>
            <div className="load-more-actions">
              <button className="btn btn-outline" onClick={loadMore} disabled={loading}>
                {loading ? 'Loading...' : `Load Next ${Math.min(pagination.limit, pagination.total - assessmentGrades.length)}`}
              </button>
              <button className="btn btn-primary" onClick={loadAllRecords} disabled={loading}>
                {loading ? 'Loading...' : 'Load All Remaining'}
              </button>
            </div>
          </div> : stryMutAct_9fa48("15283") ? false : stryMutAct_9fa48("15282") ? true : (stryCov_9fa48("15282", "15283", "15284"), pagination.hasMore && <div className="load-more">
            <div className="load-more-info">
              <p>Showing {assessmentGrades.length} of {pagination.total} records</p>
              <p>{stryMutAct_9fa48("15285") ? pagination.total + assessmentGrades.length : (stryCov_9fa48("15285"), pagination.total - assessmentGrades.length)} more records available</p>
            </div>
            <div className="load-more-actions">
              <button className="btn btn-outline" onClick={loadMore} disabled={loading}>
                {loading ? stryMutAct_9fa48("15286") ? "" : (stryCov_9fa48("15286"), 'Loading...') : stryMutAct_9fa48("15287") ? `` : (stryCov_9fa48("15287"), `Load Next ${stryMutAct_9fa48("15288") ? Math.max(pagination.limit, pagination.total - assessmentGrades.length) : (stryCov_9fa48("15288"), Math.min(pagination.limit, stryMutAct_9fa48("15289") ? pagination.total + assessmentGrades.length : (stryCov_9fa48("15289"), pagination.total - assessmentGrades.length)))}`)}
              </button>
              <button className="btn btn-primary" onClick={loadAllRecords} disabled={loading}>
                {loading ? stryMutAct_9fa48("15290") ? "" : (stryCov_9fa48("15290"), 'Loading...') : stryMutAct_9fa48("15291") ? "" : (stryCov_9fa48("15291"), 'Load All Remaining')}
              </button>
            </div>
          </div>)}
      </div>

      {/* Grade View Modal */}
      {stryMutAct_9fa48("15294") ? showGradeModal && selectedGrade || <GradeViewModal grade={selectedGrade} onClose={() => {
          setShowGradeModal(false);
          setSelectedGrade(null);
        }} isEditingOverview={isEditingOverview} editingStrengths={editingStrengths} editingGrowthAreas={editingGrowthAreas} savingOverview={savingOverview} onStartEditing={handleStartEditing} onCancelEditing={handleCancelEditing} onSaveOverview={handleSaveOverview} setEditingStrengths={setEditingStrengths} setEditingGrowthAreas={setEditingGrowthAreas} /> : stryMutAct_9fa48("15293") ? false : stryMutAct_9fa48("15292") ? true : (stryCov_9fa48("15292", "15293", "15294"), (stryMutAct_9fa48("15296") ? showGradeModal || selectedGrade : stryMutAct_9fa48("15295") ? true : (stryCov_9fa48("15295", "15296"), showGradeModal && selectedGrade)) && <GradeViewModal grade={selectedGrade} onClose={() => {
          if (stryMutAct_9fa48("15297")) {
            {}
          } else {
            stryCov_9fa48("15297");
            setShowGradeModal(stryMutAct_9fa48("15298") ? true : (stryCov_9fa48("15298"), false));
            setSelectedGrade(null);
          }
        }} isEditingOverview={isEditingOverview} editingStrengths={editingStrengths} editingGrowthAreas={editingGrowthAreas} savingOverview={savingOverview} onStartEditing={handleStartEditing} onCancelEditing={handleCancelEditing} onSaveOverview={handleSaveOverview} setEditingStrengths={setEditingStrengths} setEditingGrowthAreas={setEditingGrowthAreas} />)}

      {/* Mass Email Modal */}
      {stryMutAct_9fa48("15301") ? showEmailModal || <MassEmailModal selectedUsers={Array.from(selectedUsers)} assessmentGrades={assessmentGrades.filter(grade => selectedUsers.has(grade.user_id))} authToken={authToken} onClose={() => setShowEmailModal(false)} onEmailSent={() => {
          setShowEmailModal(false);
          setSelectedUsers(new Set());
        }} /> : stryMutAct_9fa48("15300") ? false : stryMutAct_9fa48("15299") ? true : (stryCov_9fa48("15299", "15300", "15301"), showEmailModal && <MassEmailModal selectedUsers={Array.from(selectedUsers)} assessmentGrades={stryMutAct_9fa48("15302") ? assessmentGrades : (stryCov_9fa48("15302"), assessmentGrades.filter(stryMutAct_9fa48("15303") ? () => undefined : (stryCov_9fa48("15303"), grade => selectedUsers.has(grade.user_id))))} authToken={authToken} onClose={stryMutAct_9fa48("15304") ? () => undefined : (stryCov_9fa48("15304"), () => setShowEmailModal(stryMutAct_9fa48("15305") ? true : (stryCov_9fa48("15305"), false)))} onEmailSent={() => {
          if (stryMutAct_9fa48("15306")) {
            {}
          } else {
            stryCov_9fa48("15306");
            setShowEmailModal(stryMutAct_9fa48("15307") ? true : (stryCov_9fa48("15307"), false));
            setSelectedUsers(new Set());
          }
        }} />)}
      </div>
    </div>;
  }
};

// Grade View Modal Component
const GradeViewModal = ({
  grade,
  onClose,
  isEditingOverview,
  editingStrengths,
  editingGrowthAreas,
  savingOverview,
  onStartEditing,
  onCancelEditing,
  onSaveOverview,
  setEditingStrengths,
  setEditingGrowthAreas
}) => {
  if (stryMutAct_9fa48("15308")) {
    {}
  } else {
    stryCov_9fa48("15308");
    const {
      token: authToken
    } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [userSubmissions, setUserSubmissions] = useState(stryMutAct_9fa48("15309") ? ["Stryker was here"] : (stryCov_9fa48("15309"), []));
    const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState(stryMutAct_9fa48("15310") ? ["Stryker was here"] : (stryCov_9fa48("15310"), []));
    const [loading, setLoading] = useState(stryMutAct_9fa48("15311") ? false : (stryCov_9fa48("15311"), true));
    const [error, setError] = useState(null);

    // Website preview states
    const [previewMode, setPreviewMode] = useState(stryMutAct_9fa48("15312") ? "" : (stryCov_9fa48("15312"), 'desktop'));
    const [showCode, setShowCode] = useState(stryMutAct_9fa48("15313") ? false : (stryCov_9fa48("15313"), true));
    const [websitePreview, setWebsitePreview] = useState(stryMutAct_9fa48("15314") ? "Stryker was here!" : (stryCov_9fa48("15314"), ''));

    // Assessment types mapping from BigQuery to our display names
    const assessmentTypeMapping = stryMutAct_9fa48("15315") ? {} : (stryCov_9fa48("15315"), {
      'quiz': stryMutAct_9fa48("15316") ? "" : (stryCov_9fa48("15316"), 'self'),
      'project': stryMutAct_9fa48("15317") ? "" : (stryCov_9fa48("15317"), 'technical'),
      'problem_solution': stryMutAct_9fa48("15318") ? "" : (stryCov_9fa48("15318"), 'business'),
      'video': stryMutAct_9fa48("15319") ? "" : (stryCov_9fa48("15319"), 'professional')
    });
    const assessmentTypes = stryMutAct_9fa48("15320") ? [] : (stryCov_9fa48("15320"), [stryMutAct_9fa48("15321") ? "" : (stryCov_9fa48("15321"), 'technical'), stryMutAct_9fa48("15322") ? "" : (stryCov_9fa48("15322"), 'business'), stryMutAct_9fa48("15323") ? "" : (stryCov_9fa48("15323"), 'professional'), stryMutAct_9fa48("15324") ? "" : (stryCov_9fa48("15324"), 'self')]);

    // Helper function to determine file language for syntax highlighting
    const getFileLanguage = filename => {
      if (stryMutAct_9fa48("15325")) {
        {}
      } else {
        stryCov_9fa48("15325");
        if (stryMutAct_9fa48("15328") ? !filename && typeof filename !== 'string' : stryMutAct_9fa48("15327") ? false : stryMutAct_9fa48("15326") ? true : (stryCov_9fa48("15326", "15327", "15328"), (stryMutAct_9fa48("15329") ? filename : (stryCov_9fa48("15329"), !filename)) || (stryMutAct_9fa48("15331") ? typeof filename === 'string' : stryMutAct_9fa48("15330") ? false : (stryCov_9fa48("15330", "15331"), typeof filename !== (stryMutAct_9fa48("15332") ? "" : (stryCov_9fa48("15332"), 'string')))))) {
          if (stryMutAct_9fa48("15333")) {
            {}
          } else {
            stryCov_9fa48("15333");
            return stryMutAct_9fa48("15334") ? "" : (stryCov_9fa48("15334"), 'text');
          }
        }
        const ext = stryMutAct_9fa48("15336") ? filename.split('.').pop().toLowerCase() : stryMutAct_9fa48("15335") ? filename.split('.').pop()?.toUpperCase() : (stryCov_9fa48("15335", "15336"), filename.split(stryMutAct_9fa48("15337") ? "" : (stryCov_9fa48("15337"), '.')).pop()?.toLowerCase());
        const languageMap = stryMutAct_9fa48("15338") ? {} : (stryCov_9fa48("15338"), {
          'js': stryMutAct_9fa48("15339") ? "" : (stryCov_9fa48("15339"), 'javascript'),
          'html': stryMutAct_9fa48("15340") ? "" : (stryCov_9fa48("15340"), 'html'),
          'css': stryMutAct_9fa48("15341") ? "" : (stryCov_9fa48("15341"), 'css'),
          'py': stryMutAct_9fa48("15342") ? "" : (stryCov_9fa48("15342"), 'python'),
          'txt': stryMutAct_9fa48("15343") ? "" : (stryCov_9fa48("15343"), 'text'),
          'md': stryMutAct_9fa48("15344") ? "" : (stryCov_9fa48("15344"), 'markdown')
        });
        return stryMutAct_9fa48("15347") ? languageMap[ext] && 'text' : stryMutAct_9fa48("15346") ? false : stryMutAct_9fa48("15345") ? true : (stryCov_9fa48("15345", "15346", "15347"), languageMap[ext] || (stryMutAct_9fa48("15348") ? "" : (stryCov_9fa48("15348"), 'text')));
      }
    };

    // Smart website preview generator
    const createWebsitePreview = files => {
      if (stryMutAct_9fa48("15349")) {
        {}
      } else {
        stryCov_9fa48("15349");
        if (stryMutAct_9fa48("15352") ? !files && files.length === 0 : stryMutAct_9fa48("15351") ? false : stryMutAct_9fa48("15350") ? true : (stryCov_9fa48("15350", "15351", "15352"), (stryMutAct_9fa48("15353") ? files : (stryCov_9fa48("15353"), !files)) || (stryMutAct_9fa48("15355") ? files.length !== 0 : stryMutAct_9fa48("15354") ? false : (stryCov_9fa48("15354", "15355"), files.length === 0)))) {
          if (stryMutAct_9fa48("15356")) {
            {}
          } else {
            stryCov_9fa48("15356");
            return stryMutAct_9fa48("15357") ? "" : (stryCov_9fa48("15357"), '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>No Files</title></head><body><div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;"><h2>No files found</h2><p>No HTML, CSS, or JS files were submitted.</p></div></body></html>');
          }
        }

        // Find different file types (with null checks)
        const htmlFiles = stryMutAct_9fa48("15358") ? files : (stryCov_9fa48("15358"), files.filter(stryMutAct_9fa48("15359") ? () => undefined : (stryCov_9fa48("15359"), f => stryMutAct_9fa48("15362") ? f && f.name || f.name.toLowerCase().endsWith('.html') : stryMutAct_9fa48("15361") ? false : stryMutAct_9fa48("15360") ? true : (stryCov_9fa48("15360", "15361", "15362"), (stryMutAct_9fa48("15364") ? f || f.name : stryMutAct_9fa48("15363") ? true : (stryCov_9fa48("15363", "15364"), f && f.name)) && (stryMutAct_9fa48("15366") ? f.name.toUpperCase().endsWith('.html') : stryMutAct_9fa48("15365") ? f.name.toLowerCase().startsWith('.html') : (stryCov_9fa48("15365", "15366"), f.name.toLowerCase().endsWith(stryMutAct_9fa48("15367") ? "" : (stryCov_9fa48("15367"), '.html'))))))));
        const cssFiles = stryMutAct_9fa48("15368") ? files : (stryCov_9fa48("15368"), files.filter(stryMutAct_9fa48("15369") ? () => undefined : (stryCov_9fa48("15369"), f => stryMutAct_9fa48("15372") ? f && f.name || f.name.toLowerCase().endsWith('.css') : stryMutAct_9fa48("15371") ? false : stryMutAct_9fa48("15370") ? true : (stryCov_9fa48("15370", "15371", "15372"), (stryMutAct_9fa48("15374") ? f || f.name : stryMutAct_9fa48("15373") ? true : (stryCov_9fa48("15373", "15374"), f && f.name)) && (stryMutAct_9fa48("15376") ? f.name.toUpperCase().endsWith('.css') : stryMutAct_9fa48("15375") ? f.name.toLowerCase().startsWith('.css') : (stryCov_9fa48("15375", "15376"), f.name.toLowerCase().endsWith(stryMutAct_9fa48("15377") ? "" : (stryCov_9fa48("15377"), '.css'))))))));
        const jsFiles = stryMutAct_9fa48("15378") ? files : (stryCov_9fa48("15378"), files.filter(stryMutAct_9fa48("15379") ? () => undefined : (stryCov_9fa48("15379"), f => stryMutAct_9fa48("15382") ? f && f.name || f.name.toLowerCase().endsWith('.js') : stryMutAct_9fa48("15381") ? false : stryMutAct_9fa48("15380") ? true : (stryCov_9fa48("15380", "15381", "15382"), (stryMutAct_9fa48("15384") ? f || f.name : stryMutAct_9fa48("15383") ? true : (stryCov_9fa48("15383", "15384"), f && f.name)) && (stryMutAct_9fa48("15386") ? f.name.toUpperCase().endsWith('.js') : stryMutAct_9fa48("15385") ? f.name.toLowerCase().startsWith('.js') : (stryCov_9fa48("15385", "15386"), f.name.toLowerCase().endsWith(stryMutAct_9fa48("15387") ? "" : (stryCov_9fa48("15387"), '.js'))))))));
        console.log(stryMutAct_9fa48("15388") ? "" : (stryCov_9fa48("15388"), 'Files found:'), stryMutAct_9fa48("15389") ? {} : (stryCov_9fa48("15389"), {
          htmlFiles: htmlFiles.length,
          cssFiles: cssFiles.length,
          jsFiles: jsFiles.length
        }));
        let htmlContent = stryMutAct_9fa48("15390") ? "Stryker was here!" : (stryCov_9fa48("15390"), '');
        if (stryMutAct_9fa48("15394") ? htmlFiles.length <= 0 : stryMutAct_9fa48("15393") ? htmlFiles.length >= 0 : stryMutAct_9fa48("15392") ? false : stryMutAct_9fa48("15391") ? true : (stryCov_9fa48("15391", "15392", "15393", "15394"), htmlFiles.length > 0)) {
          if (stryMutAct_9fa48("15395")) {
            {}
          } else {
            stryCov_9fa48("15395");
            // Use the first HTML file as base
            htmlContent = stryMutAct_9fa48("15398") ? htmlFiles[0].content && '' : stryMutAct_9fa48("15397") ? false : stryMutAct_9fa48("15396") ? true : (stryCov_9fa48("15396", "15397", "15398"), htmlFiles[0].content || (stryMutAct_9fa48("15399") ? "Stryker was here!" : (stryCov_9fa48("15399"), '')));
            console.log(stryMutAct_9fa48("15400") ? "" : (stryCov_9fa48("15400"), 'Base HTML content length:'), htmlContent.length);

            // Check if content appears truncated
            const possiblyTruncated = stryMutAct_9fa48("15403") ? htmlContent.length > 0 && !htmlContent.includes('</html>') && !htmlContent.includes('</body>') || !htmlContent.endsWith('>') : stryMutAct_9fa48("15402") ? false : stryMutAct_9fa48("15401") ? true : (stryCov_9fa48("15401", "15402", "15403"), (stryMutAct_9fa48("15405") ? htmlContent.length > 0 && !htmlContent.includes('</html>') || !htmlContent.includes('</body>') : stryMutAct_9fa48("15404") ? true : (stryCov_9fa48("15404", "15405"), (stryMutAct_9fa48("15407") ? htmlContent.length > 0 || !htmlContent.includes('</html>') : stryMutAct_9fa48("15406") ? true : (stryCov_9fa48("15406", "15407"), (stryMutAct_9fa48("15410") ? htmlContent.length <= 0 : stryMutAct_9fa48("15409") ? htmlContent.length >= 0 : stryMutAct_9fa48("15408") ? true : (stryCov_9fa48("15408", "15409", "15410"), htmlContent.length > 0)) && (stryMutAct_9fa48("15411") ? htmlContent.includes('</html>') : (stryCov_9fa48("15411"), !htmlContent.includes(stryMutAct_9fa48("15412") ? "" : (stryCov_9fa48("15412"), '</html>')))))) && (stryMutAct_9fa48("15413") ? htmlContent.includes('</body>') : (stryCov_9fa48("15413"), !htmlContent.includes(stryMutAct_9fa48("15414") ? "" : (stryCov_9fa48("15414"), '</body>')))))) && (stryMutAct_9fa48("15415") ? htmlContent.endsWith('>') : (stryCov_9fa48("15415"), !(stryMutAct_9fa48("15416") ? htmlContent.startsWith('>') : (stryCov_9fa48("15416"), htmlContent.endsWith(stryMutAct_9fa48("15417") ? "" : (stryCov_9fa48("15417"), '>')))))));
            if (stryMutAct_9fa48("15419") ? false : stryMutAct_9fa48("15418") ? true : (stryCov_9fa48("15418", "15419"), possiblyTruncated)) {
              if (stryMutAct_9fa48("15420")) {
                {}
              } else {
                stryCov_9fa48("15420");
                console.warn(stryMutAct_9fa48("15421") ? "" : (stryCov_9fa48("15421"), '⚠️ HTML content appears to be truncated!'), stryMutAct_9fa48("15422") ? {} : (stryCov_9fa48("15422"), {
                  length: htmlContent.length,
                  endsWithTag: stryMutAct_9fa48("15423") ? htmlContent.startsWith('>') : (stryCov_9fa48("15423"), htmlContent.endsWith(stryMutAct_9fa48("15424") ? "" : (stryCov_9fa48("15424"), '>'))),
                  lastChars: stryMutAct_9fa48("15425") ? htmlContent : (stryCov_9fa48("15425"), htmlContent.substring(stryMutAct_9fa48("15426") ? htmlContent.length + 50 : (stryCov_9fa48("15426"), htmlContent.length - 50)))
                }));

                // Attempt to repair truncated HTML
                if (stryMutAct_9fa48("15429") ? !htmlContent.endsWith('>') || !htmlContent.endsWith('</') : stryMutAct_9fa48("15428") ? false : stryMutAct_9fa48("15427") ? true : (stryCov_9fa48("15427", "15428", "15429"), (stryMutAct_9fa48("15430") ? htmlContent.endsWith('>') : (stryCov_9fa48("15430"), !(stryMutAct_9fa48("15431") ? htmlContent.startsWith('>') : (stryCov_9fa48("15431"), htmlContent.endsWith(stryMutAct_9fa48("15432") ? "" : (stryCov_9fa48("15432"), '>')))))) && (stryMutAct_9fa48("15433") ? htmlContent.endsWith('</') : (stryCov_9fa48("15433"), !(stryMutAct_9fa48("15434") ? htmlContent.startsWith('</') : (stryCov_9fa48("15434"), htmlContent.endsWith(stryMutAct_9fa48("15435") ? "" : (stryCov_9fa48("15435"), '</')))))))) {
                  if (stryMutAct_9fa48("15436")) {
                    {}
                  } else {
                    stryCov_9fa48("15436");
                    // Find the last complete tag
                    const lastTagMatch = htmlContent.lastIndexOf(stryMutAct_9fa48("15437") ? "" : (stryCov_9fa48("15437"), '<'));
                    if (stryMutAct_9fa48("15441") ? lastTagMatch <= htmlContent.lastIndexOf('>') : stryMutAct_9fa48("15440") ? lastTagMatch >= htmlContent.lastIndexOf('>') : stryMutAct_9fa48("15439") ? false : stryMutAct_9fa48("15438") ? true : (stryCov_9fa48("15438", "15439", "15440", "15441"), lastTagMatch > htmlContent.lastIndexOf(stryMutAct_9fa48("15442") ? "" : (stryCov_9fa48("15442"), '>')))) {
                      if (stryMutAct_9fa48("15443")) {
                        {}
                      } else {
                        stryCov_9fa48("15443");
                        // There's an incomplete tag, remove it
                        htmlContent = stryMutAct_9fa48("15444") ? htmlContent : (stryCov_9fa48("15444"), htmlContent.substring(0, lastTagMatch));
                        console.log(stryMutAct_9fa48("15445") ? "" : (stryCov_9fa48("15445"), '🔧 Removed incomplete tag, new length:'), htmlContent.length);
                      }
                    }
                  }
                }
              }
            }

            // Check if HTML already has embedded styles/scripts
            const hasEmbeddedCSS = stryMutAct_9fa48("15448") ? htmlContent.includes('<style') && htmlContent.includes('<link') : stryMutAct_9fa48("15447") ? false : stryMutAct_9fa48("15446") ? true : (stryCov_9fa48("15446", "15447", "15448"), htmlContent.includes(stryMutAct_9fa48("15449") ? "" : (stryCov_9fa48("15449"), '<style')) || htmlContent.includes(stryMutAct_9fa48("15450") ? "" : (stryCov_9fa48("15450"), '<link')));
            const hasEmbeddedJS = htmlContent.includes(stryMutAct_9fa48("15451") ? "" : (stryCov_9fa48("15451"), '<script'));
            console.log(stryMutAct_9fa48("15452") ? "" : (stryCov_9fa48("15452"), 'Embedded content check:'), stryMutAct_9fa48("15453") ? {} : (stryCov_9fa48("15453"), {
              hasEmbeddedCSS,
              hasEmbeddedJS,
              possiblyTruncated
            }));

            // If we have separate CSS files, inject them (even if there's embedded CSS)
            if (stryMutAct_9fa48("15457") ? cssFiles.length <= 0 : stryMutAct_9fa48("15456") ? cssFiles.length >= 0 : stryMutAct_9fa48("15455") ? false : stryMutAct_9fa48("15454") ? true : (stryCov_9fa48("15454", "15455", "15456", "15457"), cssFiles.length > 0)) {
              if (stryMutAct_9fa48("15458")) {
                {}
              } else {
                stryCov_9fa48("15458");
                const combinedCSS = stryMutAct_9fa48("15459") ? cssFiles.map(f => f.content || '').join('\n\n') : (stryCov_9fa48("15459"), cssFiles.map(stryMutAct_9fa48("15460") ? () => undefined : (stryCov_9fa48("15460"), f => stryMutAct_9fa48("15463") ? f.content && '' : stryMutAct_9fa48("15462") ? false : stryMutAct_9fa48("15461") ? true : (stryCov_9fa48("15461", "15462", "15463"), f.content || (stryMutAct_9fa48("15464") ? "Stryker was here!" : (stryCov_9fa48("15464"), ''))))).filter(stryMutAct_9fa48("15465") ? () => undefined : (stryCov_9fa48("15465"), content => stryMutAct_9fa48("15466") ? content : (stryCov_9fa48("15466"), content.trim()))).join(stryMutAct_9fa48("15467") ? "" : (stryCov_9fa48("15467"), '\n\n')));
                if (stryMutAct_9fa48("15470") ? combinedCSS : stryMutAct_9fa48("15469") ? false : stryMutAct_9fa48("15468") ? true : (stryCov_9fa48("15468", "15469", "15470"), combinedCSS.trim())) {
                  if (stryMutAct_9fa48("15471")) {
                    {}
                  } else {
                    stryCov_9fa48("15471");
                    console.log(stryMutAct_9fa48("15472") ? "" : (stryCov_9fa48("15472"), 'Injecting CSS, length:'), combinedCSS.length);

                    // Clean up and format CSS
                    const formattedCSS = stryMutAct_9fa48("15473") ? `` : (stryCov_9fa48("15473"), `/* Injected External CSS Files */\n${combinedCSS}`);

                    // Remove any existing external CSS links that won't work in iframe
                    htmlContent = htmlContent.replace(stryMutAct_9fa48("15479") ? /<link[^>]*rel=["']stylesheet["'][>]*>/gi : stryMutAct_9fa48("15478") ? /<link[^>]*rel=["']stylesheet["'][^>]>/gi : stryMutAct_9fa48("15477") ? /<link[^>]*rel=["']stylesheet[^"'][^>]*>/gi : stryMutAct_9fa48("15476") ? /<link[^>]*rel=[^"']stylesheet["'][^>]*>/gi : stryMutAct_9fa48("15475") ? /<link[>]*rel=["']stylesheet["'][^>]*>/gi : stryMutAct_9fa48("15474") ? /<link[^>]rel=["']stylesheet["'][^>]*>/gi : (stryCov_9fa48("15474", "15475", "15476", "15477", "15478", "15479"), /<link[^>]*rel=["']stylesheet["'][^>]*>/gi), stryMutAct_9fa48("15480") ? "" : (stryCov_9fa48("15480"), '<!-- External CSS link removed and replaced with inline styles -->'));

                    // Try to inject before </head>, or create head if it doesn't exist
                    if (stryMutAct_9fa48("15482") ? false : stryMutAct_9fa48("15481") ? true : (stryCov_9fa48("15481", "15482"), htmlContent.includes(stryMutAct_9fa48("15483") ? "" : (stryCov_9fa48("15483"), '</head>')))) {
                      if (stryMutAct_9fa48("15484")) {
                        {}
                      } else {
                        stryCov_9fa48("15484");
                        htmlContent = htmlContent.replace(stryMutAct_9fa48("15485") ? "" : (stryCov_9fa48("15485"), '</head>'), stryMutAct_9fa48("15486") ? `` : (stryCov_9fa48("15486"), `  <style type="text/css">\n${formattedCSS}\n  </style>\n</head>`));
                      }
                    } else if (stryMutAct_9fa48("15488") ? false : stryMutAct_9fa48("15487") ? true : (stryCov_9fa48("15487", "15488"), htmlContent.includes(stryMutAct_9fa48("15489") ? "" : (stryCov_9fa48("15489"), '<head>')))) {
                      if (stryMutAct_9fa48("15490")) {
                        {}
                      } else {
                        stryCov_9fa48("15490");
                        htmlContent = htmlContent.replace(stryMutAct_9fa48("15491") ? "" : (stryCov_9fa48("15491"), '<head>'), stryMutAct_9fa48("15492") ? `` : (stryCov_9fa48("15492"), `<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <style type="text/css">\n${formattedCSS}\n  </style>`));
                      }
                    } else if (stryMutAct_9fa48("15494") ? false : stryMutAct_9fa48("15493") ? true : (stryCov_9fa48("15493", "15494"), htmlContent.includes(stryMutAct_9fa48("15495") ? "" : (stryCov_9fa48("15495"), '<html>')))) {
                      if (stryMutAct_9fa48("15496")) {
                        {}
                      } else {
                        stryCov_9fa48("15496");
                        // No head tag, add it after <html>
                        htmlContent = htmlContent.replace(stryMutAct_9fa48("15497") ? "" : (stryCov_9fa48("15497"), '<html>'), stryMutAct_9fa48("15498") ? `` : (stryCov_9fa48("15498"), `<html>\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <style type="text/css">\n${formattedCSS}\n  </style>\n</head>`));
                      }
                    } else {
                      if (stryMutAct_9fa48("15499")) {
                        {}
                      } else {
                        stryCov_9fa48("15499");
                        // No html tag either, wrap everything
                        htmlContent = stryMutAct_9fa48("15500") ? `` : (stryCov_9fa48("15500"), `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <style type="text/css">\n${formattedCSS}\n  </style>\n</head>\n<body>\n${htmlContent}\n</body>\n</html>`);
                      }
                    }
                  }
                }
              }
            }

            // If we have separate JS files, inject them (even if there's embedded JS)
            if (stryMutAct_9fa48("15504") ? jsFiles.length <= 0 : stryMutAct_9fa48("15503") ? jsFiles.length >= 0 : stryMutAct_9fa48("15502") ? false : stryMutAct_9fa48("15501") ? true : (stryCov_9fa48("15501", "15502", "15503", "15504"), jsFiles.length > 0)) {
              if (stryMutAct_9fa48("15505")) {
                {}
              } else {
                stryCov_9fa48("15505");
                const combinedJS = stryMutAct_9fa48("15506") ? jsFiles.map(f => f.content || '').join('\n\n') : (stryCov_9fa48("15506"), jsFiles.map(stryMutAct_9fa48("15507") ? () => undefined : (stryCov_9fa48("15507"), f => stryMutAct_9fa48("15510") ? f.content && '' : stryMutAct_9fa48("15509") ? false : stryMutAct_9fa48("15508") ? true : (stryCov_9fa48("15508", "15509", "15510"), f.content || (stryMutAct_9fa48("15511") ? "Stryker was here!" : (stryCov_9fa48("15511"), ''))))).filter(stryMutAct_9fa48("15512") ? () => undefined : (stryCov_9fa48("15512"), content => stryMutAct_9fa48("15513") ? content : (stryCov_9fa48("15513"), content.trim()))).join(stryMutAct_9fa48("15514") ? "" : (stryCov_9fa48("15514"), '\n\n')));
                if (stryMutAct_9fa48("15517") ? combinedJS : stryMutAct_9fa48("15516") ? false : stryMutAct_9fa48("15515") ? true : (stryCov_9fa48("15515", "15516", "15517"), combinedJS.trim())) {
                  if (stryMutAct_9fa48("15518")) {
                    {}
                  } else {
                    stryCov_9fa48("15518");
                    console.log(stryMutAct_9fa48("15519") ? "" : (stryCov_9fa48("15519"), 'Injecting JS, length:'), combinedJS.length);

                    // Clean up and format JS
                    const formattedJS = stryMutAct_9fa48("15520") ? `` : (stryCov_9fa48("15520"), `/* Injected External JS Files */\n${combinedJS}`);

                    // Always inject JS before </body> for better loading
                    if (stryMutAct_9fa48("15522") ? false : stryMutAct_9fa48("15521") ? true : (stryCov_9fa48("15521", "15522"), htmlContent.includes(stryMutAct_9fa48("15523") ? "" : (stryCov_9fa48("15523"), '</body>')))) {
                      if (stryMutAct_9fa48("15524")) {
                        {}
                      } else {
                        stryCov_9fa48("15524");
                        htmlContent = htmlContent.replace(stryMutAct_9fa48("15525") ? "" : (stryCov_9fa48("15525"), '</body>'), stryMutAct_9fa48("15526") ? `` : (stryCov_9fa48("15526"), `  <script type="text/javascript">\n${formattedJS}\n  </script>\n</body>`));
                      }
                    } else {
                      if (stryMutAct_9fa48("15527")) {
                        {}
                      } else {
                        stryCov_9fa48("15527");
                        // No body tag, add it
                        if (stryMutAct_9fa48("15530") ? false : stryMutAct_9fa48("15529") ? true : stryMutAct_9fa48("15528") ? htmlContent.includes('<body>') : (stryCov_9fa48("15528", "15529", "15530"), !htmlContent.includes(stryMutAct_9fa48("15531") ? "" : (stryCov_9fa48("15531"), '<body>')))) {
                          if (stryMutAct_9fa48("15532")) {
                            {}
                          } else {
                            stryCov_9fa48("15532");
                            htmlContent = htmlContent.replace(stryMutAct_9fa48("15533") ? "" : (stryCov_9fa48("15533"), '</head>'), stryMutAct_9fa48("15534") ? `` : (stryCov_9fa48("15534"), `</head>\n<body>`));
                          }
                        }
                        htmlContent += stryMutAct_9fa48("15535") ? `` : (stryCov_9fa48("15535"), `\n  <script type="text/javascript">\n${formattedJS}\n  </script>\n</body>`);
                      }
                    }
                  }
                }
              }
            }
          }
        } else if (stryMutAct_9fa48("15538") ? cssFiles.length > 0 && jsFiles.length > 0 : stryMutAct_9fa48("15537") ? false : stryMutAct_9fa48("15536") ? true : (stryCov_9fa48("15536", "15537", "15538"), (stryMutAct_9fa48("15541") ? cssFiles.length <= 0 : stryMutAct_9fa48("15540") ? cssFiles.length >= 0 : stryMutAct_9fa48("15539") ? false : (stryCov_9fa48("15539", "15540", "15541"), cssFiles.length > 0)) || (stryMutAct_9fa48("15544") ? jsFiles.length <= 0 : stryMutAct_9fa48("15543") ? jsFiles.length >= 0 : stryMutAct_9fa48("15542") ? false : (stryCov_9fa48("15542", "15543", "15544"), jsFiles.length > 0)))) {
          if (stryMutAct_9fa48("15545")) {
            {}
          } else {
            stryCov_9fa48("15545");
            // No HTML file, but we have CSS/JS - create a basic HTML structure
            const combinedCSS = cssFiles.map(stryMutAct_9fa48("15546") ? () => undefined : (stryCov_9fa48("15546"), f => stryMutAct_9fa48("15549") ? f.content && '' : stryMutAct_9fa48("15548") ? false : stryMutAct_9fa48("15547") ? true : (stryCov_9fa48("15547", "15548", "15549"), f.content || (stryMutAct_9fa48("15550") ? "Stryker was here!" : (stryCov_9fa48("15550"), ''))))).join(stryMutAct_9fa48("15551") ? "" : (stryCov_9fa48("15551"), '\n'));
            const combinedJS = jsFiles.map(stryMutAct_9fa48("15552") ? () => undefined : (stryCov_9fa48("15552"), f => stryMutAct_9fa48("15555") ? f.content && '' : stryMutAct_9fa48("15554") ? false : stryMutAct_9fa48("15553") ? true : (stryCov_9fa48("15553", "15554", "15555"), f.content || (stryMutAct_9fa48("15556") ? "Stryker was here!" : (stryCov_9fa48("15556"), ''))))).join(stryMutAct_9fa48("15557") ? "" : (stryCov_9fa48("15557"), '\n'));
            console.log(stryMutAct_9fa48("15558") ? "" : (stryCov_9fa48("15558"), 'Creating HTML structure from CSS/JS files'));
            htmlContent = stryMutAct_9fa48("15559") ? `` : (stryCov_9fa48("15559"), `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Submission Preview</title>
  ${combinedCSS ? stryMutAct_9fa48("15560") ? `` : (stryCov_9fa48("15560"), `<style>\n${combinedCSS}\n</style>`) : stryMutAct_9fa48("15561") ? "Stryker was here!" : (stryCov_9fa48("15561"), '')}
</head>
<body>
  <div style="padding: 20px; font-family: Arial, sans-serif;">
    <h2>Preview Generated</h2>
    <p>No HTML file was submitted, but CSS/JS files were found and included.</p>
    <p>Add some HTML content to see the styling in action!</p>
  </div>
  ${combinedJS ? stryMutAct_9fa48("15562") ? `` : (stryCov_9fa48("15562"), `<script>\n${combinedJS}\n</script>`) : stryMutAct_9fa48("15563") ? "Stryker was here!" : (stryCov_9fa48("15563"), '')}
</body>
</html>`);
          }
        } else {
          if (stryMutAct_9fa48("15564")) {
            {}
          } else {
            stryCov_9fa48("15564");
            // No web files found
            return stryMutAct_9fa48("15565") ? "" : (stryCov_9fa48("15565"), '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>No Web Files</title></head><body><div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;"><h2>No web files found</h2><p>No HTML, CSS, or JS files were submitted for preview.</p></div></body></html>');
          }
        }

        // Ensure we have a complete HTML document
        if (stryMutAct_9fa48("15568") ? false : stryMutAct_9fa48("15567") ? true : stryMutAct_9fa48("15566") ? htmlContent.includes('<!DOCTYPE html>') : (stryCov_9fa48("15566", "15567", "15568"), !htmlContent.includes(stryMutAct_9fa48("15569") ? "" : (stryCov_9fa48("15569"), '<!DOCTYPE html>')))) {
          if (stryMutAct_9fa48("15570")) {
            {}
          } else {
            stryCov_9fa48("15570");
            if (stryMutAct_9fa48("15573") ? false : stryMutAct_9fa48("15572") ? true : stryMutAct_9fa48("15571") ? htmlContent.includes('<html') : (stryCov_9fa48("15571", "15572", "15573"), !htmlContent.includes(stryMutAct_9fa48("15574") ? "" : (stryCov_9fa48("15574"), '<html')))) {
              if (stryMutAct_9fa48("15575")) {
                {}
              } else {
                stryCov_9fa48("15575");
                htmlContent = stryMutAct_9fa48("15576") ? `` : (stryCov_9fa48("15576"), `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Student Submission</title>\n</head>\n<body>\n${htmlContent}\n</body>\n</html>`);
              }
            } else {
              if (stryMutAct_9fa48("15577")) {
                {}
              } else {
                stryCov_9fa48("15577");
                htmlContent = stryMutAct_9fa48("15578") ? `` : (stryCov_9fa48("15578"), `<!DOCTYPE html>\n${htmlContent}`);
              }
            }
          }
        }
        console.log(stryMutAct_9fa48("15579") ? "" : (stryCov_9fa48("15579"), 'Final HTML content length:'), htmlContent.length);
        console.log(stryMutAct_9fa48("15580") ? "" : (stryCov_9fa48("15580"), 'Final HTML content preview (first 300 chars):'), (stryMutAct_9fa48("15581") ? htmlContent : (stryCov_9fa48("15581"), htmlContent.substring(0, 300))) + (stryMutAct_9fa48("15582") ? "" : (stryCov_9fa48("15582"), '...')));
        console.log(stryMutAct_9fa48("15583") ? "" : (stryCov_9fa48("15583"), 'Final HTML content preview (last 300 chars):'), (stryMutAct_9fa48("15584") ? "" : (stryCov_9fa48("15584"), '...')) + (stryMutAct_9fa48("15585") ? htmlContent : (stryCov_9fa48("15585"), htmlContent.substring(stryMutAct_9fa48("15586") ? htmlContent.length + 300 : (stryCov_9fa48("15586"), htmlContent.length - 300)))));

        // Validate HTML structure
        if (stryMutAct_9fa48("15589") ? false : stryMutAct_9fa48("15588") ? true : stryMutAct_9fa48("15587") ? htmlContent.includes('</html>') : (stryCov_9fa48("15587", "15588", "15589"), !htmlContent.includes(stryMutAct_9fa48("15590") ? "" : (stryCov_9fa48("15590"), '</html>')))) {
          if (stryMutAct_9fa48("15591")) {
            {}
          } else {
            stryCov_9fa48("15591");
            console.warn(stryMutAct_9fa48("15592") ? "" : (stryCov_9fa48("15592"), '⚠️ HTML missing closing </html> tag'));
            if (stryMutAct_9fa48("15595") ? false : stryMutAct_9fa48("15594") ? true : stryMutAct_9fa48("15593") ? htmlContent.endsWith('</html>') : (stryCov_9fa48("15593", "15594", "15595"), !(stryMutAct_9fa48("15596") ? htmlContent.startsWith('</html>') : (stryCov_9fa48("15596"), htmlContent.endsWith(stryMutAct_9fa48("15597") ? "" : (stryCov_9fa48("15597"), '</html>')))))) {
              if (stryMutAct_9fa48("15598")) {
                {}
              } else {
                stryCov_9fa48("15598");
                htmlContent += stryMutAct_9fa48("15599") ? "" : (stryCov_9fa48("15599"), '\n</html>');
              }
            }
          }
        }
        if (stryMutAct_9fa48("15602") ? false : stryMutAct_9fa48("15601") ? true : stryMutAct_9fa48("15600") ? htmlContent.includes('</body>') : (stryCov_9fa48("15600", "15601", "15602"), !htmlContent.includes(stryMutAct_9fa48("15603") ? "" : (stryCov_9fa48("15603"), '</body>')))) {
          if (stryMutAct_9fa48("15604")) {
            {}
          } else {
            stryCov_9fa48("15604");
            console.warn(stryMutAct_9fa48("15605") ? "" : (stryCov_9fa48("15605"), '⚠️ HTML missing closing </body> tag'));
            if (stryMutAct_9fa48("15608") ? htmlContent.includes('<body>') || !htmlContent.includes('</body>') : stryMutAct_9fa48("15607") ? false : stryMutAct_9fa48("15606") ? true : (stryCov_9fa48("15606", "15607", "15608"), htmlContent.includes(stryMutAct_9fa48("15609") ? "" : (stryCov_9fa48("15609"), '<body>')) && (stryMutAct_9fa48("15610") ? htmlContent.includes('</body>') : (stryCov_9fa48("15610"), !htmlContent.includes(stryMutAct_9fa48("15611") ? "" : (stryCov_9fa48("15611"), '</body>')))))) {
              if (stryMutAct_9fa48("15612")) {
                {}
              } else {
                stryCov_9fa48("15612");
                htmlContent = htmlContent.replace(stryMutAct_9fa48("15613") ? "" : (stryCov_9fa48("15613"), '</html>'), stryMutAct_9fa48("15614") ? "" : (stryCov_9fa48("15614"), '</body>\n</html>'));
              }
            }
          }
        }
        return htmlContent;
      }
    };
    useEffect(() => {
      if (stryMutAct_9fa48("15615")) {
        {}
      } else {
        stryCov_9fa48("15615");
        const fetchUserData = async () => {
          if (stryMutAct_9fa48("15616")) {
            {}
          } else {
            stryCov_9fa48("15616");
            try {
              if (stryMutAct_9fa48("15617")) {
                {}
              } else {
                stryCov_9fa48("15617");
                setLoading(stryMutAct_9fa48("15618") ? false : (stryCov_9fa48("15618"), true));

                // Fetch user submissions (keep for overview)
                const submissionsResponse = await fetch(stryMutAct_9fa48("15619") ? `` : (stryCov_9fa48("15619"), `${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/user-submissions/${grade.user_id}`), stryMutAct_9fa48("15620") ? {} : (stryCov_9fa48("15620"), {
                  headers: stryMutAct_9fa48("15621") ? {} : (stryCov_9fa48("15621"), {
                    'Authorization': stryMutAct_9fa48("15622") ? `` : (stryCov_9fa48("15622"), `Bearer ${authToken}`),
                    'Content-Type': stryMutAct_9fa48("15623") ? "" : (stryCov_9fa48("15623"), 'application/json')
                  })
                }));
                if (stryMutAct_9fa48("15625") ? false : stryMutAct_9fa48("15624") ? true : (stryCov_9fa48("15624", "15625"), submissionsResponse.ok)) {
                  if (stryMutAct_9fa48("15626")) {
                    {}
                  } else {
                    stryCov_9fa48("15626");
                    const submissionsData = await submissionsResponse.json();
                    setUserSubmissions(stryMutAct_9fa48("15629") ? submissionsData.submissions && [] : stryMutAct_9fa48("15628") ? false : stryMutAct_9fa48("15627") ? true : (stryCov_9fa48("15627", "15628", "15629"), submissionsData.submissions || (stryMutAct_9fa48("15630") ? ["Stryker was here"] : (stryCov_9fa48("15630"), []))));
                  }
                }

                // Fetch comprehensive analysis data
                const analysisResponse = await fetch(stryMutAct_9fa48("15631") ? `` : (stryCov_9fa48("15631"), `${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/comprehensive-analysis/${grade.user_id}`), stryMutAct_9fa48("15632") ? {} : (stryCov_9fa48("15632"), {
                  headers: stryMutAct_9fa48("15633") ? {} : (stryCov_9fa48("15633"), {
                    'Authorization': stryMutAct_9fa48("15634") ? `` : (stryCov_9fa48("15634"), `Bearer ${authToken}`),
                    'Content-Type': stryMutAct_9fa48("15635") ? "" : (stryCov_9fa48("15635"), 'application/json')
                  })
                }));
                if (stryMutAct_9fa48("15637") ? false : stryMutAct_9fa48("15636") ? true : (stryCov_9fa48("15636", "15637"), analysisResponse.ok)) {
                  if (stryMutAct_9fa48("15638")) {
                    {}
                  } else {
                    stryCov_9fa48("15638");
                    const analysisData = await analysisResponse.json();
                    setComprehensiveAnalysis(stryMutAct_9fa48("15641") ? analysisData.analysis && [] : stryMutAct_9fa48("15640") ? false : stryMutAct_9fa48("15639") ? true : (stryCov_9fa48("15639", "15640", "15641"), analysisData.analysis || (stryMutAct_9fa48("15642") ? ["Stryker was here"] : (stryCov_9fa48("15642"), []))));
                  }
                }
              }
            } catch (err) {
              if (stryMutAct_9fa48("15643")) {
                {}
              } else {
                stryCov_9fa48("15643");
                console.error(stryMutAct_9fa48("15644") ? "" : (stryCov_9fa48("15644"), 'Error fetching user data:'), err);
                setError(stryMutAct_9fa48("15645") ? "" : (stryCov_9fa48("15645"), 'Failed to fetch user data'));
              }
            } finally {
              if (stryMutAct_9fa48("15646")) {
                {}
              } else {
                stryCov_9fa48("15646");
                setLoading(stryMutAct_9fa48("15647") ? true : (stryCov_9fa48("15647"), false));
              }
            }
          }
        };
        fetchUserData();
      }
    }, stryMutAct_9fa48("15648") ? [] : (stryCov_9fa48("15648"), [grade.user_id, authToken]));

    // Generate website preview when technical submission data is available
    useEffect(() => {
      if (stryMutAct_9fa48("15649")) {
        {}
      } else {
        stryCov_9fa48("15649");
        if (stryMutAct_9fa48("15652") ? !userSubmissions && userSubmissions.length === 0 : stryMutAct_9fa48("15651") ? false : stryMutAct_9fa48("15650") ? true : (stryCov_9fa48("15650", "15651", "15652"), (stryMutAct_9fa48("15653") ? userSubmissions : (stryCov_9fa48("15653"), !userSubmissions)) || (stryMutAct_9fa48("15655") ? userSubmissions.length !== 0 : stryMutAct_9fa48("15654") ? false : (stryCov_9fa48("15654", "15655"), userSubmissions.length === 0)))) {
          if (stryMutAct_9fa48("15656")) {
            {}
          } else {
            stryCov_9fa48("15656");
            console.log(stryMutAct_9fa48("15657") ? "" : (stryCov_9fa48("15657"), 'No user submissions available yet'));
            return;
          }
        }
        const technicalSubmission = userSubmissions.find(stryMutAct_9fa48("15658") ? () => undefined : (stryCov_9fa48("15658"), sub => stryMutAct_9fa48("15661") ? sub.assessment_type !== 'technical' : stryMutAct_9fa48("15660") ? false : stryMutAct_9fa48("15659") ? true : (stryCov_9fa48("15659", "15660", "15661"), sub.assessment_type === (stryMutAct_9fa48("15662") ? "" : (stryCov_9fa48("15662"), 'technical')))));
        if (stryMutAct_9fa48("15665") ? technicalSubmission && technicalSubmission.submission_data || technicalSubmission.submission_data.files : stryMutAct_9fa48("15664") ? false : stryMutAct_9fa48("15663") ? true : (stryCov_9fa48("15663", "15664", "15665"), (stryMutAct_9fa48("15667") ? technicalSubmission || technicalSubmission.submission_data : stryMutAct_9fa48("15666") ? true : (stryCov_9fa48("15666", "15667"), technicalSubmission && technicalSubmission.submission_data)) && technicalSubmission.submission_data.files)) {
          if (stryMutAct_9fa48("15668")) {
            {}
          } else {
            stryCov_9fa48("15668");
            try {
              if (stryMutAct_9fa48("15669")) {
                {}
              } else {
                stryCov_9fa48("15669");
                const preview = createWebsitePreview(technicalSubmission.submission_data.files);
                setWebsitePreview(preview);
                console.log(stryMutAct_9fa48("15670") ? "" : (stryCov_9fa48("15670"), 'Website preview generated for technical submission'));
              }
            } catch (error) {
              if (stryMutAct_9fa48("15671")) {
                {}
              } else {
                stryCov_9fa48("15671");
                console.error(stryMutAct_9fa48("15672") ? "" : (stryCov_9fa48("15672"), 'Error generating website preview:'), error);
                setWebsitePreview(stryMutAct_9fa48("15673") ? "" : (stryCov_9fa48("15673"), '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Preview Error</title></head><body><div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;"><h2>Preview Error</h2><p>Unable to generate website preview due to invalid file data.</p></div></body></html>'));
              }
            }
          }
        } else {
          if (stryMutAct_9fa48("15674")) {
            {}
          } else {
            stryCov_9fa48("15674");
            console.log(stryMutAct_9fa48("15675") ? "" : (stryCov_9fa48("15675"), 'No technical submission with files found'));
          }
        }
      }
    }, stryMutAct_9fa48("15676") ? [] : (stryCov_9fa48("15676"), [userSubmissions]));
    const handleTabChange = (event, newValue) => {
      if (stryMutAct_9fa48("15677")) {
        {}
      } else {
        stryCov_9fa48("15677");
        console.log(stryMutAct_9fa48("15678") ? "" : (stryCov_9fa48("15678"), 'Tab clicked:'), newValue, stryMutAct_9fa48("15679") ? "" : (stryCov_9fa48("15679"), 'Type:'), availableTabs[newValue]);
        setTabValue(newValue);
      }
    };

    // Group comprehensive analysis by our assessment types
    const analysisByType = comprehensiveAnalysis.reduce((acc, analysis) => {
      if (stryMutAct_9fa48("15680")) {
        {}
      } else {
        stryCov_9fa48("15680");
        const mappedType = stryMutAct_9fa48("15683") ? assessmentTypeMapping[analysis.assessment_type] && analysis.assessment_type : stryMutAct_9fa48("15682") ? false : stryMutAct_9fa48("15681") ? true : (stryCov_9fa48("15681", "15682", "15683"), assessmentTypeMapping[analysis.assessment_type] || analysis.assessment_type);
        if (stryMutAct_9fa48("15686") ? false : stryMutAct_9fa48("15685") ? true : stryMutAct_9fa48("15684") ? acc[mappedType] : (stryCov_9fa48("15684", "15685", "15686"), !acc[mappedType])) {
          if (stryMutAct_9fa48("15687")) {
            {}
          } else {
            stryCov_9fa48("15687");
            acc[mappedType] = stryMutAct_9fa48("15688") ? ["Stryker was here"] : (stryCov_9fa48("15688"), []);
          }
        }
        acc[mappedType].push(analysis);
        return acc;
      }
    }, {});

    // Group submissions by assessment type (for overview)
    const submissionsByType = userSubmissions.reduce((acc, submission) => {
      if (stryMutAct_9fa48("15689")) {
        {}
      } else {
        stryCov_9fa48("15689");
        const type = stryMutAct_9fa48("15692") ? submission.assessment_type && 'unknown' : stryMutAct_9fa48("15691") ? false : stryMutAct_9fa48("15690") ? true : (stryCov_9fa48("15690", "15691", "15692"), submission.assessment_type || (stryMutAct_9fa48("15693") ? "" : (stryCov_9fa48("15693"), 'unknown')));
        if (stryMutAct_9fa48("15696") ? false : stryMutAct_9fa48("15695") ? true : stryMutAct_9fa48("15694") ? acc[type] : (stryCov_9fa48("15694", "15695", "15696"), !acc[type])) {
          if (stryMutAct_9fa48("15697")) {
            {}
          } else {
            stryCov_9fa48("15697");
            acc[type] = stryMutAct_9fa48("15698") ? ["Stryker was here"] : (stryCov_9fa48("15698"), []);
          }
        }
        acc[type].push(submission);
        return acc;
      }
    }, {});

    // Create tabs: Overview + individual assessment types (show all types even if no data)
    const availableTabs = stryMutAct_9fa48("15699") ? [] : (stryCov_9fa48("15699"), [stryMutAct_9fa48("15700") ? "" : (stryCov_9fa48("15700"), 'overview'), ...assessmentTypes]);

    // Get the current tab's data
    const currentTabType = stryMutAct_9fa48("15703") ? availableTabs[tabValue] && 'overview' : stryMutAct_9fa48("15702") ? false : stryMutAct_9fa48("15701") ? true : (stryCov_9fa48("15701", "15702", "15703"), availableTabs[tabValue] || (stryMutAct_9fa48("15704") ? "" : (stryCov_9fa48("15704"), 'overview')));
    const currentAnalysis = stryMutAct_9fa48("15707") ? analysisByType[currentTabType] && [] : stryMutAct_9fa48("15706") ? false : stryMutAct_9fa48("15705") ? true : (stryCov_9fa48("15705", "15706", "15707"), analysisByType[currentTabType] || (stryMutAct_9fa48("15708") ? ["Stryker was here"] : (stryCov_9fa48("15708"), [])));
    const currentSubmissions = stryMutAct_9fa48("15711") ? submissionsByType[currentTabType] && [] : stryMutAct_9fa48("15710") ? false : stryMutAct_9fa48("15709") ? true : (stryCov_9fa48("15709", "15710", "15711"), submissionsByType[currentTabType] || (stryMutAct_9fa48("15712") ? ["Stryker was here"] : (stryCov_9fa48("15712"), [])));
    console.log(stryMutAct_9fa48("15713") ? "" : (stryCov_9fa48("15713"), 'Current tab:'), currentTabType, stryMutAct_9fa48("15714") ? "" : (stryCov_9fa48("15714"), 'Analysis:'), currentAnalysis.length, stryMutAct_9fa48("15715") ? "" : (stryCov_9fa48("15715"), 'Submissions:'), currentSubmissions.length);

    // Function to render user submission content for individual tabs
    const renderUserSubmissionContent = currentTabType => {
      if (stryMutAct_9fa48("15716")) {
        {}
      } else {
        stryCov_9fa48("15716");
        // Find the actual submission data for this assessment type
        const submission = userSubmissions.find(sub => {
          if (stryMutAct_9fa48("15717")) {
            {}
          } else {
            stryCov_9fa48("15717");
            const mappedType = stryMutAct_9fa48("15720") ? assessmentTypeMapping[sub.assessment_type] && sub.assessment_type : stryMutAct_9fa48("15719") ? false : stryMutAct_9fa48("15718") ? true : (stryCov_9fa48("15718", "15719", "15720"), assessmentTypeMapping[sub.assessment_type] || sub.assessment_type);
            return stryMutAct_9fa48("15723") ? mappedType !== currentTabType : stryMutAct_9fa48("15722") ? false : stryMutAct_9fa48("15721") ? true : (stryCov_9fa48("15721", "15722", "15723"), mappedType === currentTabType);
          }
        });
        if (stryMutAct_9fa48("15726") ? false : stryMutAct_9fa48("15725") ? true : stryMutAct_9fa48("15724") ? submission : (stryCov_9fa48("15724", "15725", "15726"), !submission)) {
          if (stryMutAct_9fa48("15727")) {
            {}
          } else {
            stryCov_9fa48("15727");
            return <div className="no-submission">
          <p>No submission found for {currentTabType} assessment.</p>
          <p>This student may not have completed this assessment type yet.</p>
        </div>;
          }
        }
        const submissionData = stryMutAct_9fa48("15730") ? submission.submission_data && {} : stryMutAct_9fa48("15729") ? false : stryMutAct_9fa48("15728") ? true : (stryCov_9fa48("15728", "15729", "15730"), submission.submission_data || {});
        const conversationData = stryMutAct_9fa48("15733") ? submission.llm_conversation_data && {} : stryMutAct_9fa48("15732") ? false : stryMutAct_9fa48("15731") ? true : (stryCov_9fa48("15731", "15732", "15733"), submission.llm_conversation_data || {});
        if (stryMutAct_9fa48("15736") ? currentTabType !== 'technical' : stryMutAct_9fa48("15735") ? false : stryMutAct_9fa48("15734") ? true : (stryCov_9fa48("15734", "15735", "15736"), currentTabType === (stryMutAct_9fa48("15737") ? "" : (stryCov_9fa48("15737"), 'technical')))) {
          if (stryMutAct_9fa48("15738")) {
            {}
          } else {
            stryCov_9fa48("15738");
            return <div className="user-submission-content">
          <div className="submission-display-content">
            {/* AI Conversation */}
            <div className="submission-display-item">
              <div className="submission-display-label">
                💬 AI Conversation
              </div>
              <div className="submission-display-value submission-display-value--conversation">
                {stryMutAct_9fa48("15741") ? submissionData.conversationText && 'No conversation provided' : stryMutAct_9fa48("15740") ? false : stryMutAct_9fa48("15739") ? true : (stryCov_9fa48("15739", "15740", "15741"), submissionData.conversationText || (stryMutAct_9fa48("15742") ? "" : (stryCov_9fa48("15742"), 'No conversation provided')))}
              </div>
            </div>
            
            {/* GitHub/Deployed Link */}
            {stryMutAct_9fa48("15745") ? submissionData.githubUrl || <div className="submission-display-item">
                <div className="submission-display-label">
                  🔗 GitHub/Deployed Link
                </div>
                <div className="submission-display-value">
                  <a href={submissionData.githubUrl} target="_blank" rel="noopener noreferrer" className="submission-display-link">
                    {submissionData.githubUrl}
                  </a>
                </div>
              </div> : stryMutAct_9fa48("15744") ? false : stryMutAct_9fa48("15743") ? true : (stryCov_9fa48("15743", "15744", "15745"), submissionData.githubUrl && <div className="submission-display-item">
                <div className="submission-display-label">
                  🔗 GitHub/Deployed Link
                </div>
                <div className="submission-display-value">
                  <a href={submissionData.githubUrl} target="_blank" rel="noopener noreferrer" className="submission-display-link">
                    {submissionData.githubUrl}
                  </a>
                </div>
              </div>)}
            
            {/* Website Preview */}
            {stryMutAct_9fa48("15748") ? submissionData.files && submissionData.files.length > 0 || <div className="submission-display-item">
                <div className="submission-display-label">
                  🌐 Website Preview
                </div>
                <div className="submission-display-value">
                  <div className="website-preview-container">
                    {/* Preview Controls */}
                    <div className="preview-controls">
                      <div className="preview-mode-buttons">
                        <button className={`preview-mode-btn ${previewMode === 'desktop' ? 'active' : ''}`} onClick={() => setPreviewMode('desktop')}>
                          🖥️ Desktop
                        </button>
                        <button className={`preview-mode-btn ${previewMode === 'mobile' ? 'active' : ''}`} onClick={() => setPreviewMode('mobile')}>
                          📱 Mobile
                        </button>
                      </div>
                      <div className="preview-right-controls">
                        <button className="toggle-code-btn" onClick={() => setShowCode(!showCode)}>
                          {showCode ? '🙈 Hide Code' : '👀 Show Code'}
                        </button>
                        <button className="refresh-btn" onClick={() => {
                            if (submissionData.files) {
                              const newPreview = createWebsitePreview(submissionData.files);
                              setWebsitePreview(newPreview);
                              console.log('🔄 Website preview refreshed');
                            }
                          }}>
                          🔄 Refresh
                        </button>
                        <button className="copy-html-btn" onClick={() => {
                            if (submissionData.files) {
                              const generatedHTML = createWebsitePreview(submissionData.files);
                              navigator.clipboard.writeText(generatedHTML).then(() => {
                                console.log('✅ Full HTML copied to clipboard');
                                alert('Full HTML copied to clipboard! You can paste it into a text editor to inspect.');
                              }).catch(err => {
                                console.error('❌ Failed to copy HTML:', err);
                                // Fallback: create a downloadable file
                                const blob = new Blob([generatedHTML], {
                                  type: 'text/html'
                                });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'generated-website.html';
                                a.click();
                                URL.revokeObjectURL(url);
                                console.log('✅ HTML downloaded as file');
                              });
                            }
                          }}>
                          📋 Copy HTML
                        </button>
                        <button className="debug-btn" onClick={() => {
                            console.log('=== WEBSITE PREVIEW DEBUG ===');
                            console.log('Current websitePreview state:', websitePreview);
                            console.log('Files available:', submissionData.files);
                            if (submissionData.files && Array.isArray(submissionData.files)) {
                              const htmlFiles = submissionData.files.filter(f => f && f.name && f.name.toLowerCase().endsWith('.html'));
                              const cssFiles = submissionData.files.filter(f => f && f.name && f.name.toLowerCase().endsWith('.css'));
                              const jsFiles = submissionData.files.filter(f => f && f.name && f.name.toLowerCase().endsWith('.js'));
                              console.log('File breakdown:', {
                                html: htmlFiles.map(f => ({
                                  name: f.name,
                                  hasContent: !!f.content,
                                  contentLength: f.content?.length,
                                  endsWithTag: f.content?.endsWith('>'),
                                  lastChars: f.content?.substring(f.content.length - 30)
                                })),
                                css: cssFiles.map(f => ({
                                  name: f.name,
                                  hasContent: !!f.content,
                                  contentLength: f.content?.length,
                                  endsWithBrace: f.content?.endsWith('}'),
                                  lastChars: f.content?.substring(f.content.length - 30)
                                })),
                                js: jsFiles.map(f => ({
                                  name: f.name,
                                  hasContent: !!f.content,
                                  contentLength: f.content?.length,
                                  lastChars: f.content?.substring(f.content.length - 30)
                                }))
                              });
                              console.log('Sample HTML content (first 200):', htmlFiles[0]?.content?.substring(0, 200) + '...');
                              console.log('Sample HTML content (last 200):', '...' + htmlFiles[0]?.content?.substring(htmlFiles[0]?.content?.length - 200));
                              console.log('Sample CSS content:', cssFiles[0]?.content?.substring(0, 200) + '...');
                              console.log('Sample JS content:', jsFiles[0]?.content?.substring(0, 200) + '...');

                              // Content integrity check
                              htmlFiles.forEach((file, index) => {
                                if (file.content) {
                                  const expectedTags = ['<html', '</html>', '<head', '</head>', '<body', '</body>'];
                                  const foundTags = expectedTags.filter(tag => file.content.includes(tag));
                                  console.log(`HTML File ${index + 1} (${file.name}) integrity:`, {
                                    hasAllTags: foundTags.length === expectedTags.length,
                                    foundTags: foundTags,
                                    missingTags: expectedTags.filter(tag => !file.content.includes(tag))
                                  });
                                }
                              });
                            }
                            const generatedHTML = createWebsitePreview(submissionData.files);
                            console.log('Generated HTML length:', generatedHTML.length);
                            console.log('Generated HTML preview (first 500):', generatedHTML.substring(0, 500) + '...');
                            console.log('Generated HTML preview (last 500):', '...' + generatedHTML.substring(generatedHTML.length - 500));

                            // Check iframe content
                            const iframe = document.querySelector('.website-preview-iframe');
                            if (iframe) {
                              console.log('Iframe srcDoc length:', iframe.getAttribute('srcDoc')?.length || 'No srcDoc');
                              console.log('Iframe content matches generated:', iframe.getAttribute('srcDoc') === generatedHTML);
                            }

                            // Test if HTML is structurally complete
                            const hasClosingHtml = generatedHTML.includes('</html>');
                            const hasClosingBody = generatedHTML.includes('</body>');
                            const htmlTagCount = (generatedHTML.match(/<html/g) || []).length;
                            const closingHtmlTagCount = (generatedHTML.match(/<\/html>/g) || []).length;
                            console.log('HTML Structure Check:', {
                              hasClosingHtml,
                              hasClosingBody,
                              htmlTagCount,
                              closingHtmlTagCount,
                              structurallyComplete: hasClosingHtml && hasClosingBody && htmlTagCount === closingHtmlTagCount
                            });
                            console.log('=== END DEBUG ===');
                          }}>
                          🐛 Debug
                        </button>
                      </div>
                    </div>

                    {/* Website Preview Iframe */}
                    <div className="preview-iframe-container">
                      <iframe key={`preview-${(websitePreview || '').length}`} srcDoc={websitePreview || createWebsitePreview(submissionData.files)} className={`website-preview-iframe ${previewMode}`} sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-presentation" title="Student Website Preview" onLoad={() => console.log('Website preview loaded')} onError={e => console.error('Iframe error:', e)} />
                    </div>
                  </div>
                </div>
              </div> : stryMutAct_9fa48("15747") ? false : stryMutAct_9fa48("15746") ? true : (stryCov_9fa48("15746", "15747", "15748"), (stryMutAct_9fa48("15750") ? submissionData.files || submissionData.files.length > 0 : stryMutAct_9fa48("15749") ? true : (stryCov_9fa48("15749", "15750"), submissionData.files && (stryMutAct_9fa48("15753") ? submissionData.files.length <= 0 : stryMutAct_9fa48("15752") ? submissionData.files.length >= 0 : stryMutAct_9fa48("15751") ? true : (stryCov_9fa48("15751", "15752", "15753"), submissionData.files.length > 0)))) && <div className="submission-display-item">
                <div className="submission-display-label">
                  🌐 Website Preview
                </div>
                <div className="submission-display-value">
                  <div className="website-preview-container">
                    {/* Preview Controls */}
                    <div className="preview-controls">
                      <div className="preview-mode-buttons">
                        <button className={stryMutAct_9fa48("15754") ? `` : (stryCov_9fa48("15754"), `preview-mode-btn ${(stryMutAct_9fa48("15757") ? previewMode !== 'desktop' : stryMutAct_9fa48("15756") ? false : stryMutAct_9fa48("15755") ? true : (stryCov_9fa48("15755", "15756", "15757"), previewMode === (stryMutAct_9fa48("15758") ? "" : (stryCov_9fa48("15758"), 'desktop')))) ? stryMutAct_9fa48("15759") ? "" : (stryCov_9fa48("15759"), 'active') : stryMutAct_9fa48("15760") ? "Stryker was here!" : (stryCov_9fa48("15760"), '')}`)} onClick={stryMutAct_9fa48("15761") ? () => undefined : (stryCov_9fa48("15761"), () => setPreviewMode(stryMutAct_9fa48("15762") ? "" : (stryCov_9fa48("15762"), 'desktop')))}>
                          🖥️ Desktop
                        </button>
                        <button className={stryMutAct_9fa48("15763") ? `` : (stryCov_9fa48("15763"), `preview-mode-btn ${(stryMutAct_9fa48("15766") ? previewMode !== 'mobile' : stryMutAct_9fa48("15765") ? false : stryMutAct_9fa48("15764") ? true : (stryCov_9fa48("15764", "15765", "15766"), previewMode === (stryMutAct_9fa48("15767") ? "" : (stryCov_9fa48("15767"), 'mobile')))) ? stryMutAct_9fa48("15768") ? "" : (stryCov_9fa48("15768"), 'active') : stryMutAct_9fa48("15769") ? "Stryker was here!" : (stryCov_9fa48("15769"), '')}`)} onClick={stryMutAct_9fa48("15770") ? () => undefined : (stryCov_9fa48("15770"), () => setPreviewMode(stryMutAct_9fa48("15771") ? "" : (stryCov_9fa48("15771"), 'mobile')))}>
                          📱 Mobile
                        </button>
                      </div>
                      <div className="preview-right-controls">
                        <button className="toggle-code-btn" onClick={stryMutAct_9fa48("15772") ? () => undefined : (stryCov_9fa48("15772"), () => setShowCode(stryMutAct_9fa48("15773") ? showCode : (stryCov_9fa48("15773"), !showCode)))}>
                          {showCode ? stryMutAct_9fa48("15774") ? "" : (stryCov_9fa48("15774"), '🙈 Hide Code') : stryMutAct_9fa48("15775") ? "" : (stryCov_9fa48("15775"), '👀 Show Code')}
                        </button>
                        <button className="refresh-btn" onClick={() => {
                            if (stryMutAct_9fa48("15776")) {
                              {}
                            } else {
                              stryCov_9fa48("15776");
                              if (stryMutAct_9fa48("15778") ? false : stryMutAct_9fa48("15777") ? true : (stryCov_9fa48("15777", "15778"), submissionData.files)) {
                                if (stryMutAct_9fa48("15779")) {
                                  {}
                                } else {
                                  stryCov_9fa48("15779");
                                  const newPreview = createWebsitePreview(submissionData.files);
                                  setWebsitePreview(newPreview);
                                  console.log(stryMutAct_9fa48("15780") ? "" : (stryCov_9fa48("15780"), '🔄 Website preview refreshed'));
                                }
                              }
                            }
                          }}>
                          🔄 Refresh
                        </button>
                        <button className="copy-html-btn" onClick={() => {
                            if (stryMutAct_9fa48("15781")) {
                              {}
                            } else {
                              stryCov_9fa48("15781");
                              if (stryMutAct_9fa48("15783") ? false : stryMutAct_9fa48("15782") ? true : (stryCov_9fa48("15782", "15783"), submissionData.files)) {
                                if (stryMutAct_9fa48("15784")) {
                                  {}
                                } else {
                                  stryCov_9fa48("15784");
                                  const generatedHTML = createWebsitePreview(submissionData.files);
                                  navigator.clipboard.writeText(generatedHTML).then(() => {
                                    if (stryMutAct_9fa48("15785")) {
                                      {}
                                    } else {
                                      stryCov_9fa48("15785");
                                      console.log(stryMutAct_9fa48("15786") ? "" : (stryCov_9fa48("15786"), '✅ Full HTML copied to clipboard'));
                                      alert(stryMutAct_9fa48("15787") ? "" : (stryCov_9fa48("15787"), 'Full HTML copied to clipboard! You can paste it into a text editor to inspect.'));
                                    }
                                  }).catch(err => {
                                    if (stryMutAct_9fa48("15788")) {
                                      {}
                                    } else {
                                      stryCov_9fa48("15788");
                                      console.error(stryMutAct_9fa48("15789") ? "" : (stryCov_9fa48("15789"), '❌ Failed to copy HTML:'), err);
                                      // Fallback: create a downloadable file
                                      const blob = new Blob(stryMutAct_9fa48("15790") ? [] : (stryCov_9fa48("15790"), [generatedHTML]), stryMutAct_9fa48("15791") ? {} : (stryCov_9fa48("15791"), {
                                        type: stryMutAct_9fa48("15792") ? "" : (stryCov_9fa48("15792"), 'text/html')
                                      }));
                                      const url = URL.createObjectURL(blob);
                                      const a = document.createElement(stryMutAct_9fa48("15793") ? "" : (stryCov_9fa48("15793"), 'a'));
                                      a.href = url;
                                      a.download = stryMutAct_9fa48("15794") ? "" : (stryCov_9fa48("15794"), 'generated-website.html');
                                      a.click();
                                      URL.revokeObjectURL(url);
                                      console.log(stryMutAct_9fa48("15795") ? "" : (stryCov_9fa48("15795"), '✅ HTML downloaded as file'));
                                    }
                                  });
                                }
                              }
                            }
                          }}>
                          📋 Copy HTML
                        </button>
                        <button className="debug-btn" onClick={() => {
                            if (stryMutAct_9fa48("15796")) {
                              {}
                            } else {
                              stryCov_9fa48("15796");
                              console.log(stryMutAct_9fa48("15797") ? "" : (stryCov_9fa48("15797"), '=== WEBSITE PREVIEW DEBUG ==='));
                              console.log(stryMutAct_9fa48("15798") ? "" : (stryCov_9fa48("15798"), 'Current websitePreview state:'), websitePreview);
                              console.log(stryMutAct_9fa48("15799") ? "" : (stryCov_9fa48("15799"), 'Files available:'), submissionData.files);
                              if (stryMutAct_9fa48("15802") ? submissionData.files || Array.isArray(submissionData.files) : stryMutAct_9fa48("15801") ? false : stryMutAct_9fa48("15800") ? true : (stryCov_9fa48("15800", "15801", "15802"), submissionData.files && Array.isArray(submissionData.files))) {
                                if (stryMutAct_9fa48("15803")) {
                                  {}
                                } else {
                                  stryCov_9fa48("15803");
                                  const htmlFiles = stryMutAct_9fa48("15804") ? submissionData.files : (stryCov_9fa48("15804"), submissionData.files.filter(stryMutAct_9fa48("15805") ? () => undefined : (stryCov_9fa48("15805"), f => stryMutAct_9fa48("15808") ? f && f.name || f.name.toLowerCase().endsWith('.html') : stryMutAct_9fa48("15807") ? false : stryMutAct_9fa48("15806") ? true : (stryCov_9fa48("15806", "15807", "15808"), (stryMutAct_9fa48("15810") ? f || f.name : stryMutAct_9fa48("15809") ? true : (stryCov_9fa48("15809", "15810"), f && f.name)) && (stryMutAct_9fa48("15812") ? f.name.toUpperCase().endsWith('.html') : stryMutAct_9fa48("15811") ? f.name.toLowerCase().startsWith('.html') : (stryCov_9fa48("15811", "15812"), f.name.toLowerCase().endsWith(stryMutAct_9fa48("15813") ? "" : (stryCov_9fa48("15813"), '.html'))))))));
                                  const cssFiles = stryMutAct_9fa48("15814") ? submissionData.files : (stryCov_9fa48("15814"), submissionData.files.filter(stryMutAct_9fa48("15815") ? () => undefined : (stryCov_9fa48("15815"), f => stryMutAct_9fa48("15818") ? f && f.name || f.name.toLowerCase().endsWith('.css') : stryMutAct_9fa48("15817") ? false : stryMutAct_9fa48("15816") ? true : (stryCov_9fa48("15816", "15817", "15818"), (stryMutAct_9fa48("15820") ? f || f.name : stryMutAct_9fa48("15819") ? true : (stryCov_9fa48("15819", "15820"), f && f.name)) && (stryMutAct_9fa48("15822") ? f.name.toUpperCase().endsWith('.css') : stryMutAct_9fa48("15821") ? f.name.toLowerCase().startsWith('.css') : (stryCov_9fa48("15821", "15822"), f.name.toLowerCase().endsWith(stryMutAct_9fa48("15823") ? "" : (stryCov_9fa48("15823"), '.css'))))))));
                                  const jsFiles = stryMutAct_9fa48("15824") ? submissionData.files : (stryCov_9fa48("15824"), submissionData.files.filter(stryMutAct_9fa48("15825") ? () => undefined : (stryCov_9fa48("15825"), f => stryMutAct_9fa48("15828") ? f && f.name || f.name.toLowerCase().endsWith('.js') : stryMutAct_9fa48("15827") ? false : stryMutAct_9fa48("15826") ? true : (stryCov_9fa48("15826", "15827", "15828"), (stryMutAct_9fa48("15830") ? f || f.name : stryMutAct_9fa48("15829") ? true : (stryCov_9fa48("15829", "15830"), f && f.name)) && (stryMutAct_9fa48("15832") ? f.name.toUpperCase().endsWith('.js') : stryMutAct_9fa48("15831") ? f.name.toLowerCase().startsWith('.js') : (stryCov_9fa48("15831", "15832"), f.name.toLowerCase().endsWith(stryMutAct_9fa48("15833") ? "" : (stryCov_9fa48("15833"), '.js'))))))));
                                  console.log(stryMutAct_9fa48("15834") ? "" : (stryCov_9fa48("15834"), 'File breakdown:'), stryMutAct_9fa48("15835") ? {} : (stryCov_9fa48("15835"), {
                                    html: htmlFiles.map(stryMutAct_9fa48("15836") ? () => undefined : (stryCov_9fa48("15836"), f => stryMutAct_9fa48("15837") ? {} : (stryCov_9fa48("15837"), {
                                      name: f.name,
                                      hasContent: stryMutAct_9fa48("15838") ? !f.content : (stryCov_9fa48("15838"), !(stryMutAct_9fa48("15839") ? f.content : (stryCov_9fa48("15839"), !f.content))),
                                      contentLength: stryMutAct_9fa48("15840") ? f.content.length : (stryCov_9fa48("15840"), f.content?.length),
                                      endsWithTag: stryMutAct_9fa48("15842") ? f.content.endsWith('>') : stryMutAct_9fa48("15841") ? f.content?.startsWith('>') : (stryCov_9fa48("15841", "15842"), f.content?.endsWith(stryMutAct_9fa48("15843") ? "" : (stryCov_9fa48("15843"), '>'))),
                                      lastChars: stryMutAct_9fa48("15845") ? f.content.substring(f.content.length - 30) : stryMutAct_9fa48("15844") ? f.content : (stryCov_9fa48("15844", "15845"), f.content?.substring(stryMutAct_9fa48("15846") ? f.content.length + 30 : (stryCov_9fa48("15846"), f.content.length - 30)))
                                    }))),
                                    css: cssFiles.map(stryMutAct_9fa48("15847") ? () => undefined : (stryCov_9fa48("15847"), f => stryMutAct_9fa48("15848") ? {} : (stryCov_9fa48("15848"), {
                                      name: f.name,
                                      hasContent: stryMutAct_9fa48("15849") ? !f.content : (stryCov_9fa48("15849"), !(stryMutAct_9fa48("15850") ? f.content : (stryCov_9fa48("15850"), !f.content))),
                                      contentLength: stryMutAct_9fa48("15851") ? f.content.length : (stryCov_9fa48("15851"), f.content?.length),
                                      endsWithBrace: stryMutAct_9fa48("15853") ? f.content.endsWith('}') : stryMutAct_9fa48("15852") ? f.content?.startsWith('}') : (stryCov_9fa48("15852", "15853"), f.content?.endsWith(stryMutAct_9fa48("15854") ? "" : (stryCov_9fa48("15854"), '}'))),
                                      lastChars: stryMutAct_9fa48("15856") ? f.content.substring(f.content.length - 30) : stryMutAct_9fa48("15855") ? f.content : (stryCov_9fa48("15855", "15856"), f.content?.substring(stryMutAct_9fa48("15857") ? f.content.length + 30 : (stryCov_9fa48("15857"), f.content.length - 30)))
                                    }))),
                                    js: jsFiles.map(stryMutAct_9fa48("15858") ? () => undefined : (stryCov_9fa48("15858"), f => stryMutAct_9fa48("15859") ? {} : (stryCov_9fa48("15859"), {
                                      name: f.name,
                                      hasContent: stryMutAct_9fa48("15860") ? !f.content : (stryCov_9fa48("15860"), !(stryMutAct_9fa48("15861") ? f.content : (stryCov_9fa48("15861"), !f.content))),
                                      contentLength: stryMutAct_9fa48("15862") ? f.content.length : (stryCov_9fa48("15862"), f.content?.length),
                                      lastChars: stryMutAct_9fa48("15864") ? f.content.substring(f.content.length - 30) : stryMutAct_9fa48("15863") ? f.content : (stryCov_9fa48("15863", "15864"), f.content?.substring(stryMutAct_9fa48("15865") ? f.content.length + 30 : (stryCov_9fa48("15865"), f.content.length - 30)))
                                    })))
                                  }));
                                  console.log(stryMutAct_9fa48("15866") ? "" : (stryCov_9fa48("15866"), 'Sample HTML content (first 200):'), (stryMutAct_9fa48("15869") ? htmlFiles[0].content?.substring(0, 200) : stryMutAct_9fa48("15868") ? htmlFiles[0]?.content.substring(0, 200) : stryMutAct_9fa48("15867") ? htmlFiles[0]?.content : (stryCov_9fa48("15867", "15868", "15869"), htmlFiles[0]?.content?.substring(0, 200))) + (stryMutAct_9fa48("15870") ? "" : (stryCov_9fa48("15870"), '...')));
                                  console.log(stryMutAct_9fa48("15871") ? "" : (stryCov_9fa48("15871"), 'Sample HTML content (last 200):'), (stryMutAct_9fa48("15872") ? "" : (stryCov_9fa48("15872"), '...')) + (stryMutAct_9fa48("15875") ? htmlFiles[0].content?.substring(htmlFiles[0]?.content?.length - 200) : stryMutAct_9fa48("15874") ? htmlFiles[0]?.content.substring(htmlFiles[0]?.content?.length - 200) : stryMutAct_9fa48("15873") ? htmlFiles[0]?.content : (stryCov_9fa48("15873", "15874", "15875"), htmlFiles[0]?.content?.substring(stryMutAct_9fa48("15876") ? htmlFiles[0]?.content?.length + 200 : (stryCov_9fa48("15876"), (stryMutAct_9fa48("15878") ? htmlFiles[0].content?.length : stryMutAct_9fa48("15877") ? htmlFiles[0]?.content.length : (stryCov_9fa48("15877", "15878"), htmlFiles[0]?.content?.length)) - 200)))));
                                  console.log(stryMutAct_9fa48("15879") ? "" : (stryCov_9fa48("15879"), 'Sample CSS content:'), (stryMutAct_9fa48("15882") ? cssFiles[0].content?.substring(0, 200) : stryMutAct_9fa48("15881") ? cssFiles[0]?.content.substring(0, 200) : stryMutAct_9fa48("15880") ? cssFiles[0]?.content : (stryCov_9fa48("15880", "15881", "15882"), cssFiles[0]?.content?.substring(0, 200))) + (stryMutAct_9fa48("15883") ? "" : (stryCov_9fa48("15883"), '...')));
                                  console.log(stryMutAct_9fa48("15884") ? "" : (stryCov_9fa48("15884"), 'Sample JS content:'), (stryMutAct_9fa48("15887") ? jsFiles[0].content?.substring(0, 200) : stryMutAct_9fa48("15886") ? jsFiles[0]?.content.substring(0, 200) : stryMutAct_9fa48("15885") ? jsFiles[0]?.content : (stryCov_9fa48("15885", "15886", "15887"), jsFiles[0]?.content?.substring(0, 200))) + (stryMutAct_9fa48("15888") ? "" : (stryCov_9fa48("15888"), '...')));

                                  // Content integrity check
                                  htmlFiles.forEach((file, index) => {
                                    if (stryMutAct_9fa48("15889")) {
                                      {}
                                    } else {
                                      stryCov_9fa48("15889");
                                      if (stryMutAct_9fa48("15891") ? false : stryMutAct_9fa48("15890") ? true : (stryCov_9fa48("15890", "15891"), file.content)) {
                                        if (stryMutAct_9fa48("15892")) {
                                          {}
                                        } else {
                                          stryCov_9fa48("15892");
                                          const expectedTags = stryMutAct_9fa48("15893") ? [] : (stryCov_9fa48("15893"), [stryMutAct_9fa48("15894") ? "" : (stryCov_9fa48("15894"), '<html'), stryMutAct_9fa48("15895") ? "" : (stryCov_9fa48("15895"), '</html>'), stryMutAct_9fa48("15896") ? "" : (stryCov_9fa48("15896"), '<head'), stryMutAct_9fa48("15897") ? "" : (stryCov_9fa48("15897"), '</head>'), stryMutAct_9fa48("15898") ? "" : (stryCov_9fa48("15898"), '<body'), stryMutAct_9fa48("15899") ? "" : (stryCov_9fa48("15899"), '</body>')]);
                                          const foundTags = stryMutAct_9fa48("15900") ? expectedTags : (stryCov_9fa48("15900"), expectedTags.filter(stryMutAct_9fa48("15901") ? () => undefined : (stryCov_9fa48("15901"), tag => file.content.includes(tag))));
                                          console.log(stryMutAct_9fa48("15902") ? `` : (stryCov_9fa48("15902"), `HTML File ${stryMutAct_9fa48("15903") ? index - 1 : (stryCov_9fa48("15903"), index + 1)} (${file.name}) integrity:`), stryMutAct_9fa48("15904") ? {} : (stryCov_9fa48("15904"), {
                                            hasAllTags: stryMutAct_9fa48("15907") ? foundTags.length !== expectedTags.length : stryMutAct_9fa48("15906") ? false : stryMutAct_9fa48("15905") ? true : (stryCov_9fa48("15905", "15906", "15907"), foundTags.length === expectedTags.length),
                                            foundTags: foundTags,
                                            missingTags: stryMutAct_9fa48("15908") ? expectedTags : (stryCov_9fa48("15908"), expectedTags.filter(stryMutAct_9fa48("15909") ? () => undefined : (stryCov_9fa48("15909"), tag => stryMutAct_9fa48("15910") ? file.content.includes(tag) : (stryCov_9fa48("15910"), !file.content.includes(tag)))))
                                          }));
                                        }
                                      }
                                    }
                                  });
                                }
                              }
                              const generatedHTML = createWebsitePreview(submissionData.files);
                              console.log(stryMutAct_9fa48("15911") ? "" : (stryCov_9fa48("15911"), 'Generated HTML length:'), generatedHTML.length);
                              console.log(stryMutAct_9fa48("15912") ? "" : (stryCov_9fa48("15912"), 'Generated HTML preview (first 500):'), (stryMutAct_9fa48("15913") ? generatedHTML : (stryCov_9fa48("15913"), generatedHTML.substring(0, 500))) + (stryMutAct_9fa48("15914") ? "" : (stryCov_9fa48("15914"), '...')));
                              console.log(stryMutAct_9fa48("15915") ? "" : (stryCov_9fa48("15915"), 'Generated HTML preview (last 500):'), (stryMutAct_9fa48("15916") ? "" : (stryCov_9fa48("15916"), '...')) + (stryMutAct_9fa48("15917") ? generatedHTML : (stryCov_9fa48("15917"), generatedHTML.substring(stryMutAct_9fa48("15918") ? generatedHTML.length + 500 : (stryCov_9fa48("15918"), generatedHTML.length - 500)))));

                              // Check iframe content
                              const iframe = document.querySelector(stryMutAct_9fa48("15919") ? "" : (stryCov_9fa48("15919"), '.website-preview-iframe'));
                              if (stryMutAct_9fa48("15921") ? false : stryMutAct_9fa48("15920") ? true : (stryCov_9fa48("15920", "15921"), iframe)) {
                                if (stryMutAct_9fa48("15922")) {
                                  {}
                                } else {
                                  stryCov_9fa48("15922");
                                  console.log(stryMutAct_9fa48("15923") ? "" : (stryCov_9fa48("15923"), 'Iframe srcDoc length:'), stryMutAct_9fa48("15926") ? iframe.getAttribute('srcDoc')?.length && 'No srcDoc' : stryMutAct_9fa48("15925") ? false : stryMutAct_9fa48("15924") ? true : (stryCov_9fa48("15924", "15925", "15926"), (stryMutAct_9fa48("15927") ? iframe.getAttribute('srcDoc').length : (stryCov_9fa48("15927"), iframe.getAttribute(stryMutAct_9fa48("15928") ? "" : (stryCov_9fa48("15928"), 'srcDoc'))?.length)) || (stryMutAct_9fa48("15929") ? "" : (stryCov_9fa48("15929"), 'No srcDoc'))));
                                  console.log(stryMutAct_9fa48("15930") ? "" : (stryCov_9fa48("15930"), 'Iframe content matches generated:'), stryMutAct_9fa48("15933") ? iframe.getAttribute('srcDoc') !== generatedHTML : stryMutAct_9fa48("15932") ? false : stryMutAct_9fa48("15931") ? true : (stryCov_9fa48("15931", "15932", "15933"), iframe.getAttribute(stryMutAct_9fa48("15934") ? "" : (stryCov_9fa48("15934"), 'srcDoc')) === generatedHTML));
                                }
                              }

                              // Test if HTML is structurally complete
                              const hasClosingHtml = generatedHTML.includes(stryMutAct_9fa48("15935") ? "" : (stryCov_9fa48("15935"), '</html>'));
                              const hasClosingBody = generatedHTML.includes(stryMutAct_9fa48("15936") ? "" : (stryCov_9fa48("15936"), '</body>'));
                              const htmlTagCount = (stryMutAct_9fa48("15939") ? generatedHTML.match(/<html/g) && [] : stryMutAct_9fa48("15938") ? false : stryMutAct_9fa48("15937") ? true : (stryCov_9fa48("15937", "15938", "15939"), generatedHTML.match(/<html/g) || (stryMutAct_9fa48("15940") ? ["Stryker was here"] : (stryCov_9fa48("15940"), [])))).length;
                              const closingHtmlTagCount = (stryMutAct_9fa48("15943") ? generatedHTML.match(/<\/html>/g) && [] : stryMutAct_9fa48("15942") ? false : stryMutAct_9fa48("15941") ? true : (stryCov_9fa48("15941", "15942", "15943"), generatedHTML.match(/<\/html>/g) || (stryMutAct_9fa48("15944") ? ["Stryker was here"] : (stryCov_9fa48("15944"), [])))).length;
                              console.log(stryMutAct_9fa48("15945") ? "" : (stryCov_9fa48("15945"), 'HTML Structure Check:'), stryMutAct_9fa48("15946") ? {} : (stryCov_9fa48("15946"), {
                                hasClosingHtml,
                                hasClosingBody,
                                htmlTagCount,
                                closingHtmlTagCount,
                                structurallyComplete: stryMutAct_9fa48("15949") ? hasClosingHtml && hasClosingBody || htmlTagCount === closingHtmlTagCount : stryMutAct_9fa48("15948") ? false : stryMutAct_9fa48("15947") ? true : (stryCov_9fa48("15947", "15948", "15949"), (stryMutAct_9fa48("15951") ? hasClosingHtml || hasClosingBody : stryMutAct_9fa48("15950") ? true : (stryCov_9fa48("15950", "15951"), hasClosingHtml && hasClosingBody)) && (stryMutAct_9fa48("15953") ? htmlTagCount !== closingHtmlTagCount : stryMutAct_9fa48("15952") ? true : (stryCov_9fa48("15952", "15953"), htmlTagCount === closingHtmlTagCount)))
                              }));
                              console.log(stryMutAct_9fa48("15954") ? "" : (stryCov_9fa48("15954"), '=== END DEBUG ==='));
                            }
                          }}>
                          🐛 Debug
                        </button>
                      </div>
                    </div>

                    {/* Website Preview Iframe */}
                    <div className="preview-iframe-container">
                      <iframe key={stryMutAct_9fa48("15955") ? `` : (stryCov_9fa48("15955"), `preview-${(stryMutAct_9fa48("15958") ? websitePreview && '' : stryMutAct_9fa48("15957") ? false : stryMutAct_9fa48("15956") ? true : (stryCov_9fa48("15956", "15957", "15958"), websitePreview || (stryMutAct_9fa48("15959") ? "Stryker was here!" : (stryCov_9fa48("15959"), '')))).length}`)} srcDoc={stryMutAct_9fa48("15962") ? websitePreview && createWebsitePreview(submissionData.files) : stryMutAct_9fa48("15961") ? false : stryMutAct_9fa48("15960") ? true : (stryCov_9fa48("15960", "15961", "15962"), websitePreview || createWebsitePreview(submissionData.files))} className={stryMutAct_9fa48("15963") ? `` : (stryCov_9fa48("15963"), `website-preview-iframe ${previewMode}`)} sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-presentation" title="Student Website Preview" onLoad={stryMutAct_9fa48("15964") ? () => undefined : (stryCov_9fa48("15964"), () => console.log(stryMutAct_9fa48("15965") ? "" : (stryCov_9fa48("15965"), 'Website preview loaded')))} onError={stryMutAct_9fa48("15966") ? () => undefined : (stryCov_9fa48("15966"), e => console.error(stryMutAct_9fa48("15967") ? "" : (stryCov_9fa48("15967"), 'Iframe error:'), e))} />
                    </div>
                  </div>
                </div>
              </div>)}

            {/* Uploaded Files */}
            {stryMutAct_9fa48("15970") ? submissionData.files && submissionData.files.length > 0 && showCode || <div className="submission-display-item">
                <div className="submission-display-label">
                  📁 Source Code ({submissionData.files.length} files)
                </div>
                <div className="submission-display-value">
                  <div className="file-contents-container">
                    {submissionData.files.map((file, index) => <div key={index} className="file-content-item">
                        <div className="file-header">
                          <div className="file-info">
                            <strong className="file-name">{file.name}</strong>
                            <span className="file-metadata">
                              {file.size && `${Math.round(file.size / 1024)}KB`}
                              {file.type && ` • ${file.type}`}
                              {file.uploadedAt && ` • ${new Date(file.uploadedAt).toLocaleString()}`}
                            </span>
                          </div>
                        </div>
                        
                        {file.content ? <div className="file-content-display">
                            <pre className={`file-content file-content--${getFileLanguage(file.name)}`}>
                              <code>{file.content}</code>
                            </pre>
                          </div> : <div className="file-content-missing">
                            <p>⚠️ File content not available (uploaded before content capture was implemented)</p>
                            <p>Only metadata was stored: {file.name} ({Math.round(file.size / 1024)}KB)</p>
                          </div>}
                      </div>)}
                  </div>
                </div>
              </div> : stryMutAct_9fa48("15969") ? false : stryMutAct_9fa48("15968") ? true : (stryCov_9fa48("15968", "15969", "15970"), (stryMutAct_9fa48("15972") ? submissionData.files && submissionData.files.length > 0 || showCode : stryMutAct_9fa48("15971") ? true : (stryCov_9fa48("15971", "15972"), (stryMutAct_9fa48("15974") ? submissionData.files || submissionData.files.length > 0 : stryMutAct_9fa48("15973") ? true : (stryCov_9fa48("15973", "15974"), submissionData.files && (stryMutAct_9fa48("15977") ? submissionData.files.length <= 0 : stryMutAct_9fa48("15976") ? submissionData.files.length >= 0 : stryMutAct_9fa48("15975") ? true : (stryCov_9fa48("15975", "15976", "15977"), submissionData.files.length > 0)))) && showCode)) && <div className="submission-display-item">
                <div className="submission-display-label">
                  📁 Source Code ({submissionData.files.length} files)
                </div>
                <div className="submission-display-value">
                  <div className="file-contents-container">
                    {submissionData.files.map(stryMutAct_9fa48("15978") ? () => undefined : (stryCov_9fa48("15978"), (file, index) => <div key={index} className="file-content-item">
                        <div className="file-header">
                          <div className="file-info">
                            <strong className="file-name">{file.name}</strong>
                            <span className="file-metadata">
                              {stryMutAct_9fa48("15981") ? file.size || `${Math.round(file.size / 1024)}KB` : stryMutAct_9fa48("15980") ? false : stryMutAct_9fa48("15979") ? true : (stryCov_9fa48("15979", "15980", "15981"), file.size && (stryMutAct_9fa48("15982") ? `` : (stryCov_9fa48("15982"), `${Math.round(stryMutAct_9fa48("15983") ? file.size * 1024 : (stryCov_9fa48("15983"), file.size / 1024))}KB`)))}
                              {stryMutAct_9fa48("15986") ? file.type || ` • ${file.type}` : stryMutAct_9fa48("15985") ? false : stryMutAct_9fa48("15984") ? true : (stryCov_9fa48("15984", "15985", "15986"), file.type && (stryMutAct_9fa48("15987") ? `` : (stryCov_9fa48("15987"), ` • ${file.type}`)))}
                              {stryMutAct_9fa48("15990") ? file.uploadedAt || ` • ${new Date(file.uploadedAt).toLocaleString()}` : stryMutAct_9fa48("15989") ? false : stryMutAct_9fa48("15988") ? true : (stryCov_9fa48("15988", "15989", "15990"), file.uploadedAt && (stryMutAct_9fa48("15991") ? `` : (stryCov_9fa48("15991"), ` • ${new Date(file.uploadedAt).toLocaleString()}`)))}
                            </span>
                          </div>
                        </div>
                        
                        {file.content ? <div className="file-content-display">
                            <pre className={stryMutAct_9fa48("15992") ? `` : (stryCov_9fa48("15992"), `file-content file-content--${getFileLanguage(file.name)}`)}>
                              <code>{file.content}</code>
                            </pre>
                          </div> : <div className="file-content-missing">
                            <p>⚠️ File content not available (uploaded before content capture was implemented)</p>
                            <p>Only metadata was stored: {file.name} ({Math.round(stryMutAct_9fa48("15993") ? file.size * 1024 : (stryCov_9fa48("15993"), file.size / 1024))}KB)</p>
                          </div>}
                      </div>))}
                  </div>
                </div>
              </div>)}
          </div>
        </div>;
          }
        }
        if (stryMutAct_9fa48("15996") ? currentTabType !== 'business' : stryMutAct_9fa48("15995") ? false : stryMutAct_9fa48("15994") ? true : (stryCov_9fa48("15994", "15995", "15996"), currentTabType === (stryMutAct_9fa48("15997") ? "" : (stryCov_9fa48("15997"), 'business')))) {
          if (stryMutAct_9fa48("15998")) {
            {}
          } else {
            stryCov_9fa48("15998");
            return <div className="user-submission-content">
          <div className="submission-display-content">
            {/* Problem Statement */}
            <div className="submission-display-item">
              <div className="submission-display-label">
                📄 Problem Statement
              </div>
              <div className="submission-display-value user-content">
                {stryMutAct_9fa48("16001") ? (submissionData.problemStatement || submissionData.deliverables?.problem_statement?.content) && 'No problem statement provided' : stryMutAct_9fa48("16000") ? false : stryMutAct_9fa48("15999") ? true : (stryCov_9fa48("15999", "16000", "16001"), (stryMutAct_9fa48("16003") ? submissionData.problemStatement && submissionData.deliverables?.problem_statement?.content : stryMutAct_9fa48("16002") ? false : (stryCov_9fa48("16002", "16003"), submissionData.problemStatement || (stryMutAct_9fa48("16005") ? submissionData.deliverables.problem_statement?.content : stryMutAct_9fa48("16004") ? submissionData.deliverables?.problem_statement.content : (stryCov_9fa48("16004", "16005"), submissionData.deliverables?.problem_statement?.content)))) || (stryMutAct_9fa48("16006") ? "" : (stryCov_9fa48("16006"), 'No problem statement provided')))}
              </div>
            </div>
            
            {/* Proposed Solution */}
            <div className="submission-display-item">
              <div className="submission-display-label">
                💡 Proposed Solution
              </div>
              <div className="submission-display-value user-content">
                {stryMutAct_9fa48("16009") ? (submissionData.proposedSolution || submissionData.deliverables?.proposed_solution?.content) && 'No solution provided' : stryMutAct_9fa48("16008") ? false : stryMutAct_9fa48("16007") ? true : (stryCov_9fa48("16007", "16008", "16009"), (stryMutAct_9fa48("16011") ? submissionData.proposedSolution && submissionData.deliverables?.proposed_solution?.content : stryMutAct_9fa48("16010") ? false : (stryCov_9fa48("16010", "16011"), submissionData.proposedSolution || (stryMutAct_9fa48("16013") ? submissionData.deliverables.proposed_solution?.content : stryMutAct_9fa48("16012") ? submissionData.deliverables?.proposed_solution.content : (stryCov_9fa48("16012", "16013"), submissionData.deliverables?.proposed_solution?.content)))) || (stryMutAct_9fa48("16014") ? "" : (stryCov_9fa48("16014"), 'No solution provided')))}
              </div>
            </div>
            
            {/* Show conversation if available */}
            {stryMutAct_9fa48("16017") ? conversationData.messages && conversationData.messages.length > 0 || <div className="submission-display-item">
                <div className="submission-display-label">
                  💬 AI Discussion ({conversationData.messages.length} messages)
                </div>
                <div className="submission-display-value">
                  <div className="conversation-messages">
                    {conversationData.messages.map((message, i) => <div key={i} className={`message-item ${message.role}`}>
                        <strong>{message.role === 'user' ? 'Student' : 'AI'}:</strong>
                        <div className="message-content">
                          {message.content}
                        </div>
                      </div>)}
                  </div>
                </div>
              </div> : stryMutAct_9fa48("16016") ? false : stryMutAct_9fa48("16015") ? true : (stryCov_9fa48("16015", "16016", "16017"), (stryMutAct_9fa48("16019") ? conversationData.messages || conversationData.messages.length > 0 : stryMutAct_9fa48("16018") ? true : (stryCov_9fa48("16018", "16019"), conversationData.messages && (stryMutAct_9fa48("16022") ? conversationData.messages.length <= 0 : stryMutAct_9fa48("16021") ? conversationData.messages.length >= 0 : stryMutAct_9fa48("16020") ? true : (stryCov_9fa48("16020", "16021", "16022"), conversationData.messages.length > 0)))) && <div className="submission-display-item">
                <div className="submission-display-label">
                  💬 AI Discussion ({conversationData.messages.length} messages)
                </div>
                <div className="submission-display-value">
                  <div className="conversation-messages">
                    {conversationData.messages.map(stryMutAct_9fa48("16023") ? () => undefined : (stryCov_9fa48("16023"), (message, i) => <div key={i} className={stryMutAct_9fa48("16024") ? `` : (stryCov_9fa48("16024"), `message-item ${message.role}`)}>
                        <strong>{(stryMutAct_9fa48("16027") ? message.role !== 'user' : stryMutAct_9fa48("16026") ? false : stryMutAct_9fa48("16025") ? true : (stryCov_9fa48("16025", "16026", "16027"), message.role === (stryMutAct_9fa48("16028") ? "" : (stryCov_9fa48("16028"), 'user')))) ? stryMutAct_9fa48("16029") ? "" : (stryCov_9fa48("16029"), 'Student') : stryMutAct_9fa48("16030") ? "" : (stryCov_9fa48("16030"), 'AI')}:</strong>
                        <div className="message-content">
                          {message.content}
                        </div>
                      </div>))}
                  </div>
                </div>
              </div>)}
          </div>
        </div>;
          }
        }
        if (stryMutAct_9fa48("16033") ? currentTabType !== 'professional' : stryMutAct_9fa48("16032") ? false : stryMutAct_9fa48("16031") ? true : (stryCov_9fa48("16031", "16032", "16033"), currentTabType === (stryMutAct_9fa48("16034") ? "" : (stryCov_9fa48("16034"), 'professional')))) {
          if (stryMutAct_9fa48("16035")) {
            {}
          } else {
            stryCov_9fa48("16035");
            const loomUrl = stryMutAct_9fa48("16038") ? (submissionData.loomUrl || submissionData.deliverables?.video_url?.content) && submissionData.deliverables?.video_url?.value : stryMutAct_9fa48("16037") ? false : stryMutAct_9fa48("16036") ? true : (stryCov_9fa48("16036", "16037", "16038"), (stryMutAct_9fa48("16040") ? submissionData.loomUrl && submissionData.deliverables?.video_url?.content : stryMutAct_9fa48("16039") ? false : (stryCov_9fa48("16039", "16040"), submissionData.loomUrl || (stryMutAct_9fa48("16042") ? submissionData.deliverables.video_url?.content : stryMutAct_9fa48("16041") ? submissionData.deliverables?.video_url.content : (stryCov_9fa48("16041", "16042"), submissionData.deliverables?.video_url?.content)))) || (stryMutAct_9fa48("16044") ? submissionData.deliverables.video_url?.value : stryMutAct_9fa48("16043") ? submissionData.deliverables?.video_url.value : (stryCov_9fa48("16043", "16044"), submissionData.deliverables?.video_url?.value)));
            return <div className="user-submission-content">
          <div className="submission-display-content">
            {/* Video Presentation */}
            <div className="submission-display-item">
              <div className="submission-display-label">
                🎥 Video Presentation
              </div>
              <div className="submission-display-value">
                {loomUrl ? <div className="video-submission-container">
                    <a href={loomUrl} target="_blank" rel="noopener noreferrer" className="video-link-button">
                      🎬 Watch Video on Loom
                    </a>
                    
                    {/* Video Preview/Embed */}
                    <div className="video-preview-container">
                      {loomUrl.includes(stryMutAct_9fa48("16045") ? "" : (stryCov_9fa48("16045"), 'loom.com')) ? <iframe src={loomUrl.replace(stryMutAct_9fa48("16046") ? "" : (stryCov_9fa48("16046"), '/share/'), stryMutAct_9fa48("16047") ? "" : (stryCov_9fa48("16047"), '/embed/'))} frameBorder="0" webkitallowfullscreen mozallowfullscreen allowFullScreen className="loom-embed" title="Student Video Presentation" /> : <div className="video-placeholder">
                          <p>🎥 Video Preview</p>
                          <p><em>Click the link above to watch the presentation</em></p>
                        </div>}
                    </div>
                    
                    <div className="video-url-display">
                      <strong>Video URL:</strong> {loomUrl}
                    </div>
                  </div> : <p>No video URL provided</p>}
              </div>
            </div>
            
            {/* Show conversation if available */}
            {stryMutAct_9fa48("16050") ? conversationData.messages && conversationData.messages.length > 0 || <div className="submission-display-item">
                <div className="submission-display-label">
                  💬 AI Discussion ({conversationData.messages.length} messages)
                </div>
                <div className="submission-display-value">
                  <div className="conversation-messages">
                    {conversationData.messages.map((message, i) => <div key={i} className={`message-item ${message.role}`}>
                        <strong>{message.role === 'user' ? 'Student' : 'AI'}:</strong>
                        <div className="message-content">
                          {message.content}
                        </div>
                      </div>)}
                  </div>
                </div>
              </div> : stryMutAct_9fa48("16049") ? false : stryMutAct_9fa48("16048") ? true : (stryCov_9fa48("16048", "16049", "16050"), (stryMutAct_9fa48("16052") ? conversationData.messages || conversationData.messages.length > 0 : stryMutAct_9fa48("16051") ? true : (stryCov_9fa48("16051", "16052"), conversationData.messages && (stryMutAct_9fa48("16055") ? conversationData.messages.length <= 0 : stryMutAct_9fa48("16054") ? conversationData.messages.length >= 0 : stryMutAct_9fa48("16053") ? true : (stryCov_9fa48("16053", "16054", "16055"), conversationData.messages.length > 0)))) && <div className="submission-display-item">
                <div className="submission-display-label">
                  💬 AI Discussion ({conversationData.messages.length} messages)
                </div>
                <div className="submission-display-value">
                  <div className="conversation-messages">
                    {conversationData.messages.map(stryMutAct_9fa48("16056") ? () => undefined : (stryCov_9fa48("16056"), (message, i) => <div key={i} className={stryMutAct_9fa48("16057") ? `` : (stryCov_9fa48("16057"), `message-item ${message.role}`)}>
                        <strong>{(stryMutAct_9fa48("16060") ? message.role !== 'user' : stryMutAct_9fa48("16059") ? false : stryMutAct_9fa48("16058") ? true : (stryCov_9fa48("16058", "16059", "16060"), message.role === (stryMutAct_9fa48("16061") ? "" : (stryCov_9fa48("16061"), 'user')))) ? stryMutAct_9fa48("16062") ? "" : (stryCov_9fa48("16062"), 'Student') : stryMutAct_9fa48("16063") ? "" : (stryCov_9fa48("16063"), 'AI')}:</strong>
                        <div className="message-content">
                          {message.content}
                        </div>
                      </div>))}
                  </div>
                </div>
              </div>)}
          </div>
        </div>;
          }
        }
        if (stryMutAct_9fa48("16066") ? currentTabType !== 'self' : stryMutAct_9fa48("16065") ? false : stryMutAct_9fa48("16064") ? true : (stryCov_9fa48("16064", "16065", "16066"), currentTabType === (stryMutAct_9fa48("16067") ? "" : (stryCov_9fa48("16067"), 'self')))) {
          if (stryMutAct_9fa48("16068")) {
            {}
          } else {
            stryCov_9fa48("16068");
            return <div className="user-submission-content">
          <div className="self-assessment-responses">
            {/* Show actual responses */}
            {stryMutAct_9fa48("16071") ? submissionData.responses || <div className="responses-list">
                <h5>Student's Self-Assessment Responses</h5>
                {Object.entries(submissionData.responses).map(([qNum, response]) => <div key={qNum} className="self-response-item">
                    <div className="response-text">
                      <strong>Question {qNum}:</strong> {response}/5
                    </div>
                  </div>)}
              </div> : stryMutAct_9fa48("16070") ? false : stryMutAct_9fa48("16069") ? true : (stryCov_9fa48("16069", "16070", "16071"), submissionData.responses && <div className="responses-list">
                <h5>Student's Self-Assessment Responses</h5>
                {Object.entries(submissionData.responses).map(stryMutAct_9fa48("16072") ? () => undefined : (stryCov_9fa48("16072"), ([qNum, response]) => <div key={qNum} className="self-response-item">
                    <div className="response-text">
                      <strong>Question {qNum}:</strong> {response}/5
                    </div>
                  </div>))}
              </div>)}
            
            {/* Show timing information if available */}
            {stryMutAct_9fa48("16075") ? submissionData.completionTime || <div className="assessment-stats">
                <h5>Assessment Statistics</h5>
                <p><strong>Completion Time:</strong> {new Date(submissionData.completionTime).toLocaleTimeString()}</p>
                <p><strong>Start Time:</strong> {new Date(submissionData.startTime).toLocaleTimeString()}</p>
                {submissionData.questionTimes && <p><strong>Questions Completed:</strong> {Object.keys(submissionData.questionTimes).length}</p>}
              </div> : stryMutAct_9fa48("16074") ? false : stryMutAct_9fa48("16073") ? true : (stryCov_9fa48("16073", "16074", "16075"), submissionData.completionTime && <div className="assessment-stats">
                <h5>Assessment Statistics</h5>
                <p><strong>Completion Time:</strong> {new Date(submissionData.completionTime).toLocaleTimeString()}</p>
                <p><strong>Start Time:</strong> {new Date(submissionData.startTime).toLocaleTimeString()}</p>
                {stryMutAct_9fa48("16078") ? submissionData.questionTimes || <p><strong>Questions Completed:</strong> {Object.keys(submissionData.questionTimes).length}</p> : stryMutAct_9fa48("16077") ? false : stryMutAct_9fa48("16076") ? true : (stryCov_9fa48("16076", "16077", "16078"), submissionData.questionTimes && <p><strong>Questions Completed:</strong> {Object.keys(submissionData.questionTimes).length}</p>)}
              </div>)}
            
            {/* Show section times if available */}
            {stryMutAct_9fa48("16081") ? submissionData.sectionTimes || <div className="section-times">
                <h5>Time Per Section</h5>
                {Object.entries(submissionData.sectionTimes).map(([section, time]) => <div key={section} className="section-time-item">
                    <strong>Section {section}:</strong> {Math.round(time)} seconds
                  </div>)}
              </div> : stryMutAct_9fa48("16080") ? false : stryMutAct_9fa48("16079") ? true : (stryCov_9fa48("16079", "16080", "16081"), submissionData.sectionTimes && <div className="section-times">
                <h5>Time Per Section</h5>
                {Object.entries(submissionData.sectionTimes).map(stryMutAct_9fa48("16082") ? () => undefined : (stryCov_9fa48("16082"), ([section, time]) => <div key={section} className="section-time-item">
                    <strong>Section {section}:</strong> {Math.round(time)} seconds
                  </div>))}
              </div>)}
          </div>
        </div>;
          }
        }
        return <p>No submission content available for this assessment type</p>;
      }
    };

    // Function to render feedback content
    const renderAnalysisFeedback = analysis => {
      if (stryMutAct_9fa48("16083")) {
        {}
      } else {
        stryCov_9fa48("16083");
        if (stryMutAct_9fa48("16086") ? false : stryMutAct_9fa48("16085") ? true : stryMutAct_9fa48("16084") ? analysis : (stryCov_9fa48("16084", "16085", "16086"), !analysis)) return <p>No feedback available for this assessment type</p>;
        return <div className="analysis-feedback">
        <div className="feedback-score">
          <h4>Overall Score: {(stryMutAct_9fa48("16087") ? analysis.overall_score / 100 : (stryCov_9fa48("16087"), analysis.overall_score * 100)).toFixed(1)}%</h4>
        </div>
        
        <div className="detailed-feedback">
          <h4>Detailed Feedback</h4>
          <div className="grade-text">{analysis.feedback}</div>
        </div>
        
        {/* Show strengths and growth areas if available */}
        {stryMutAct_9fa48("16090") ? analysis.strengths_summary || analysis.growth_areas_summary || <div className="strengths-improvements">
            {analysis.strengths_summary && <div className="strengths-section">
                <h4>Strengths</h4>
                <div className="grade-text">{analysis.strengths_summary}</div>
              </div>}
            
            {analysis.growth_areas_summary && <div className="improvements-section">
                <h4>Areas for Growth</h4>
                <div className="grade-text">{analysis.growth_areas_summary}</div>
              </div>}
          </div> : stryMutAct_9fa48("16089") ? false : stryMutAct_9fa48("16088") ? true : (stryCov_9fa48("16088", "16089", "16090"), (stryMutAct_9fa48("16092") ? analysis.strengths_summary && analysis.growth_areas_summary : stryMutAct_9fa48("16091") ? true : (stryCov_9fa48("16091", "16092"), analysis.strengths_summary || analysis.growth_areas_summary)) && <div className="strengths-improvements">
            {stryMutAct_9fa48("16095") ? analysis.strengths_summary || <div className="strengths-section">
                <h4>Strengths</h4>
                <div className="grade-text">{analysis.strengths_summary}</div>
              </div> : stryMutAct_9fa48("16094") ? false : stryMutAct_9fa48("16093") ? true : (stryCov_9fa48("16093", "16094", "16095"), analysis.strengths_summary && <div className="strengths-section">
                <h4>Strengths</h4>
                <div className="grade-text">{analysis.strengths_summary}</div>
              </div>)}
            
            {stryMutAct_9fa48("16098") ? analysis.growth_areas_summary || <div className="improvements-section">
                <h4>Areas for Growth</h4>
                <div className="grade-text">{analysis.growth_areas_summary}</div>
              </div> : stryMutAct_9fa48("16097") ? false : stryMutAct_9fa48("16096") ? true : (stryCov_9fa48("16096", "16097", "16098"), analysis.growth_areas_summary && <div className="improvements-section">
                <h4>Areas for Growth</h4>
                <div className="grade-text">{analysis.growth_areas_summary}</div>
              </div>)}
          </div>)}

        {/* Show type-specific insights */}
        {(() => {
            if (stryMutAct_9fa48("16099")) {
              {}
            } else {
              stryCov_9fa48("16099");
              try {
                if (stryMutAct_9fa48("16100")) {
                  {}
                } else {
                  stryCov_9fa48("16100");
                  const typeSpecificData = JSON.parse(stryMutAct_9fa48("16103") ? analysis.type_specific_data && '{}' : stryMutAct_9fa48("16102") ? false : stryMutAct_9fa48("16101") ? true : (stryCov_9fa48("16101", "16102", "16103"), analysis.type_specific_data || (stryMutAct_9fa48("16104") ? "" : (stryCov_9fa48("16104"), '{}'))));
                  if (stryMutAct_9fa48("16106") ? false : stryMutAct_9fa48("16105") ? true : (stryCov_9fa48("16105", "16106"), typeSpecificData.key_insights)) {
                    if (stryMutAct_9fa48("16107")) {
                      {}
                    } else {
                      stryCov_9fa48("16107");
                      return <div className="key-insights">
                  <h4>Key Insights</h4>
                  <ul>
                    {typeSpecificData.key_insights.map(stryMutAct_9fa48("16108") ? () => undefined : (stryCov_9fa48("16108"), (insight, i) => <li key={i}>{insight}</li>))}
                  </ul>
                </div>;
                    }
                  }
                  if (stryMutAct_9fa48("16111") ? typeSpecificData.strengths || typeSpecificData.improvements : stryMutAct_9fa48("16110") ? false : stryMutAct_9fa48("16109") ? true : (stryCov_9fa48("16109", "16110", "16111"), typeSpecificData.strengths && typeSpecificData.improvements)) {
                    if (stryMutAct_9fa48("16112")) {
                      {}
                    } else {
                      stryCov_9fa48("16112");
                      return <div className="strengths-improvements">
                  <div className="strengths-section">
                    <h4>Strengths</h4>
                    <ul>
                      {typeSpecificData.strengths.map(stryMutAct_9fa48("16113") ? () => undefined : (stryCov_9fa48("16113"), (strength, i) => <li key={i}>{strength}</li>))}
                    </ul>
                  </div>
                  <div className="improvements-section">
                    <h4>Areas for Improvement</h4>
                    <ul>
                      {typeSpecificData.improvements.map(stryMutAct_9fa48("16114") ? () => undefined : (stryCov_9fa48("16114"), (improvement, i) => <li key={i}>{improvement}</li>))}
                    </ul>
                  </div>
                </div>;
                    }
                  }
                  return null;
                }
              } catch (parseError) {
                if (stryMutAct_9fa48("16115")) {
                  {}
                } else {
                  stryCov_9fa48("16115");
                  console.warn(stryMutAct_9fa48("16116") ? "" : (stryCov_9fa48("16116"), 'Failed to parse type_specific_data for analysis:'), parseError);
                  return null;
                }
              }
            }
          })()}
      </div>;
      }
    };

    // Render feedback content
    const renderFeedbackContent = feedback => {
      if (stryMutAct_9fa48("16117")) {
        {}
      } else {
        stryCov_9fa48("16117");
        if (stryMutAct_9fa48("16120") ? false : stryMutAct_9fa48("16119") ? true : stryMutAct_9fa48("16118") ? feedback : (stryCov_9fa48("16118", "16119", "16120"), !feedback)) return <p>No feedback available for this assessment type</p>;
        return <div className="feedback-content">
        {stryMutAct_9fa48("16123") ? feedback.strengths_summary || <div className="strengths-section">
            <h4>Strengths</h4>
            <div className="grade-text">{feedback.strengths_summary}</div>
          </div> : stryMutAct_9fa48("16122") ? false : stryMutAct_9fa48("16121") ? true : (stryCov_9fa48("16121", "16122", "16123"), feedback.strengths_summary && <div className="strengths-section">
            <h4>Strengths</h4>
            <div className="grade-text">{feedback.strengths_summary}</div>
          </div>)}
        
        {stryMutAct_9fa48("16126") ? feedback.growth_areas_summary || <div className="growth-areas-section">
            <h4>Growth Areas</h4>
            <div className="grade-text">{feedback.growth_areas_summary}</div>
          </div> : stryMutAct_9fa48("16125") ? false : stryMutAct_9fa48("16124") ? true : (stryCov_9fa48("16124", "16125", "16126"), feedback.growth_areas_summary && <div className="growth-areas-section">
            <h4>Growth Areas</h4>
            <div className="grade-text">{feedback.growth_areas_summary}</div>
          </div>)}
        
        {stryMutAct_9fa48("16129") ? feedback.technical_feedback || <div className="specific-feedback">
            <h4>Technical Feedback</h4>
            <div className="grade-text">{feedback.technical_feedback}</div>
          </div> : stryMutAct_9fa48("16128") ? false : stryMutAct_9fa48("16127") ? true : (stryCov_9fa48("16127", "16128", "16129"), feedback.technical_feedback && <div className="specific-feedback">
            <h4>Technical Feedback</h4>
            <div className="grade-text">{feedback.technical_feedback}</div>
          </div>)}
        
        {stryMutAct_9fa48("16132") ? feedback.business_feedback || <div className="specific-feedback">
            <h4>Business Feedback</h4>
            <div className="grade-text">{feedback.business_feedback}</div>
          </div> : stryMutAct_9fa48("16131") ? false : stryMutAct_9fa48("16130") ? true : (stryCov_9fa48("16130", "16131", "16132"), feedback.business_feedback && <div className="specific-feedback">
            <h4>Business Feedback</h4>
            <div className="grade-text">{feedback.business_feedback}</div>
          </div>)}
        
        {stryMutAct_9fa48("16135") ? feedback.professional_feedback || <div className="specific-feedback">
            <h4>Professional Feedback</h4>
            <div className="grade-text">{feedback.professional_feedback}</div>
          </div> : stryMutAct_9fa48("16134") ? false : stryMutAct_9fa48("16133") ? true : (stryCov_9fa48("16133", "16134", "16135"), feedback.professional_feedback && <div className="specific-feedback">
            <h4>Professional Feedback</h4>
            <div className="grade-text">{feedback.professional_feedback}</div>
          </div>)}
        
        {stryMutAct_9fa48("16138") ? feedback.self_assessment_feedback || <div className="specific-feedback">
            <h4>Self Assessment Feedback</h4>
            <div className="grade-text">{feedback.self_assessment_feedback}</div>
          </div> : stryMutAct_9fa48("16137") ? false : stryMutAct_9fa48("16136") ? true : (stryCov_9fa48("16136", "16137", "16138"), feedback.self_assessment_feedback && <div className="specific-feedback">
            <h4>Self Assessment Feedback</h4>
            <div className="grade-text">{feedback.self_assessment_feedback}</div>
          </div>)}
      </div>;
      }
    };
    return <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content grade-modal-wide" onClick={stryMutAct_9fa48("16139") ? () => undefined : (stryCov_9fa48("16139"), e => e.stopPropagation())}>
        <div className="modal-header">
          <div className="student-header-info-compact">
            <h2>{grade.user_first_name} {grade.user_last_name}</h2>
            <span className="header-separator">•</span>
            <span><strong>Email:</strong> {grade.user_email}</span>
            <span className="header-separator">•</span>
            <span><strong>Cohort:</strong> {grade.cohort}</span>
            <span className="header-separator">•</span>
            <span><strong>Analysis:</strong> {new Date(stryMutAct_9fa48("16142") ? grade.created_at?.value && grade.created_at : stryMutAct_9fa48("16141") ? false : stryMutAct_9fa48("16140") ? true : (stryCov_9fa48("16140", "16141", "16142"), (stryMutAct_9fa48("16143") ? grade.created_at.value : (stryCov_9fa48("16143"), grade.created_at?.value)) || grade.created_at)).toLocaleDateString()}</span>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          
          <div className="grade-details">
            <Box sx={stryMutAct_9fa48("16144") ? {} : (stryCov_9fa48("16144"), {
              borderBottom: 1,
              borderColor: stryMutAct_9fa48("16145") ? "" : (stryCov_9fa48("16145"), 'divider'),
              width: stryMutAct_9fa48("16146") ? "" : (stryCov_9fa48("16146"), '100%'),
              maxWidth: stryMutAct_9fa48("16147") ? "" : (stryCov_9fa48("16147"), 'none')
            })}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="assessment tabs" variant="scrollable" scrollButtons="auto" sx={stryMutAct_9fa48("16148") ? {} : (stryCov_9fa48("16148"), {
                width: stryMutAct_9fa48("16149") ? "" : (stryCov_9fa48("16149"), '100%'),
                maxWidth: stryMutAct_9fa48("16150") ? "" : (stryCov_9fa48("16150"), 'none')
              })}>
                {availableTabs.map(stryMutAct_9fa48("16151") ? () => undefined : (stryCov_9fa48("16151"), (type, index) => <Tab key={type} label={(stryMutAct_9fa48("16154") ? type !== 'overview' : stryMutAct_9fa48("16153") ? false : stryMutAct_9fa48("16152") ? true : (stryCov_9fa48("16152", "16153", "16154"), type === (stryMutAct_9fa48("16155") ? "" : (stryCov_9fa48("16155"), 'overview')))) ? stryMutAct_9fa48("16156") ? "" : (stryCov_9fa48("16156"), 'Overview') : stryMutAct_9fa48("16157") ? type.charAt(0).toUpperCase() - type.slice(1) : (stryCov_9fa48("16157"), (stryMutAct_9fa48("16159") ? type.toUpperCase() : stryMutAct_9fa48("16158") ? type.charAt(0).toLowerCase() : (stryCov_9fa48("16158", "16159"), type.charAt(0).toUpperCase())) + (stryMutAct_9fa48("16160") ? type : (stryCov_9fa48("16160"), type.slice(1))))} id={stryMutAct_9fa48("16161") ? `` : (stryCov_9fa48("16161"), `tab-${index}`)} aria-controls={stryMutAct_9fa48("16162") ? `` : (stryCov_9fa48("16162"), `tabpanel-${index}`)} />))}
              </Tabs>
            </Box>
            
            <div className="tab-content">
              {loading ? <div className="loading">Loading assessment data...</div> : error ? <div className="error">{error}</div> : (stryMutAct_9fa48("16165") ? userSubmissions.length === 0 || comprehensiveAnalysis.length === 0 : stryMutAct_9fa48("16164") ? false : stryMutAct_9fa48("16163") ? true : (stryCov_9fa48("16163", "16164", "16165"), (stryMutAct_9fa48("16167") ? userSubmissions.length !== 0 : stryMutAct_9fa48("16166") ? true : (stryCov_9fa48("16166", "16167"), userSubmissions.length === 0)) && (stryMutAct_9fa48("16169") ? comprehensiveAnalysis.length !== 0 : stryMutAct_9fa48("16168") ? true : (stryCov_9fa48("16168", "16169"), comprehensiveAnalysis.length === 0)))) ? <div className="no-data">
                  <h3>No Assessment Data Available</h3>
                  <p>This user has no assessment submissions or analysis data yet.</p>
                  <p>Assessment data will appear here once the user completes assessments and they are analyzed.</p>
                </div> : (stryMutAct_9fa48("16172") ? currentTabType !== 'overview' : stryMutAct_9fa48("16171") ? false : stryMutAct_9fa48("16170") ? true : (stryCov_9fa48("16170", "16171", "16172"), currentTabType === (stryMutAct_9fa48("16173") ? "" : (stryCov_9fa48("16173"), 'overview')))) ? <div className="overview-content">
                  <div className="content-grid">
                    <div className="submissions-overview">
                      {/* Detailed Feedback Section */}
                      <div className="detailed-feedback-overview">
                        <h3>Detailed Feedback by Assessment</h3>
                        {(stryMutAct_9fa48("16177") ? comprehensiveAnalysis.length <= 0 : stryMutAct_9fa48("16176") ? comprehensiveAnalysis.length >= 0 : stryMutAct_9fa48("16175") ? false : stryMutAct_9fa48("16174") ? true : (stryCov_9fa48("16174", "16175", "16176", "16177"), comprehensiveAnalysis.length > 0)) ? <div className="feedback-by-type">
                            {Object.entries(analysisByType).map(([type, analyses]) => {
                          if (stryMutAct_9fa48("16178")) {
                            {}
                          } else {
                            stryCov_9fa48("16178");
                            const latestAnalysis = analyses[0]; // Get the most recent analysis for this type
                            return <div key={type} className="assessment-feedback-section">
                                  <h4>
                                    {stryMutAct_9fa48("16179") ? type.charAt(0).toUpperCase() - type.slice(1) : (stryCov_9fa48("16179"), (stryMutAct_9fa48("16181") ? type.toUpperCase() : stryMutAct_9fa48("16180") ? type.charAt(0).toLowerCase() : (stryCov_9fa48("16180", "16181"), type.charAt(0).toUpperCase())) + (stryMutAct_9fa48("16182") ? type : (stryCov_9fa48("16182"), type.slice(1))))} Assessment
                                    {stryMutAct_9fa48("16185") ? latestAnalysis || <span className="feedback-score">
                                        <strong>Score: {(latestAnalysis.overall_score * 100).toFixed(1)}%</strong>
                                      </span> : stryMutAct_9fa48("16184") ? false : stryMutAct_9fa48("16183") ? true : (stryCov_9fa48("16183", "16184", "16185"), latestAnalysis && <span className="feedback-score">
                                        <strong>Score: {(stryMutAct_9fa48("16186") ? latestAnalysis.overall_score / 100 : (stryCov_9fa48("16186"), latestAnalysis.overall_score * 100)).toFixed(1)}%</strong>
                                      </span>)}
                                  </h4>
                                  {latestAnalysis ? <div className="feedback-content">
                                      <div className="detailed-feedback">
                                        <h5>Detailed Feedback</h5>
                                        <div className="grade-text">{latestAnalysis.feedback}</div>
                                      </div>
                                      {(() => {
                                  if (stryMutAct_9fa48("16187")) {
                                    {}
                                  } else {
                                    stryCov_9fa48("16187");
                                    try {
                                      if (stryMutAct_9fa48("16188")) {
                                        {}
                                      } else {
                                        stryCov_9fa48("16188");
                                        const typeSpecificData = JSON.parse(stryMutAct_9fa48("16191") ? latestAnalysis.type_specific_data && '{}' : stryMutAct_9fa48("16190") ? false : stryMutAct_9fa48("16189") ? true : (stryCov_9fa48("16189", "16190", "16191"), latestAnalysis.type_specific_data || (stryMutAct_9fa48("16192") ? "" : (stryCov_9fa48("16192"), '{}'))));
                                        if (stryMutAct_9fa48("16194") ? false : stryMutAct_9fa48("16193") ? true : (stryCov_9fa48("16193", "16194"), typeSpecificData.key_insights)) {
                                          if (stryMutAct_9fa48("16195")) {
                                            {}
                                          } else {
                                            stryCov_9fa48("16195");
                                            return <div className="key-insights">
                                                <h5>Key Insights</h5>
                                                <ul>
                                                  {typeSpecificData.key_insights.map(stryMutAct_9fa48("16196") ? () => undefined : (stryCov_9fa48("16196"), (insight, i) => <li key={i}>{insight}</li>))}
                                                </ul>
                                              </div>;
                                          }
                                        }
                                        return null;
                                      }
                                    } catch (parseError) {
                                      if (stryMutAct_9fa48("16197")) {
                                        {}
                                      } else {
                                        stryCov_9fa48("16197");
                                        console.warn(stryMutAct_9fa48("16198") ? "" : (stryCov_9fa48("16198"), 'Failed to parse type_specific_data for'), type, stryMutAct_9fa48("16199") ? "" : (stryCov_9fa48("16199"), ':'), parseError);
                                        return null;
                                      }
                                    }
                                  }
                                })()}
                                    </div> : <p>No detailed feedback available</p>}
                                </div>;
                          }
                        })}
                          </div> : <p>No detailed feedback available</p>}
                      </div>
                    </div>
                    
                    <div className="feedback-overview">
                      <div className="overview-header">
                        <h3>Overall Feedback</h3>
                        {stryMutAct_9fa48("16202") ? !isEditingOverview || <button className="edit-feedback-btn" onClick={() => onStartEditing(grade)} title="Edit feedback">
                            ✏️ Edit
                          </button> : stryMutAct_9fa48("16201") ? false : stryMutAct_9fa48("16200") ? true : (stryCov_9fa48("16200", "16201", "16202"), (stryMutAct_9fa48("16203") ? isEditingOverview : (stryCov_9fa48("16203"), !isEditingOverview)) && <button className="edit-feedback-btn" onClick={stryMutAct_9fa48("16204") ? () => undefined : (stryCov_9fa48("16204"), () => onStartEditing(grade))} title="Edit feedback">
                            ✏️ Edit
                          </button>)}
                      </div>

                      {isEditingOverview ? <div className="editing-feedback">
                          <div className="editing-section">
                            <h4>Strengths Summary</h4>
                            <textarea value={editingStrengths} onChange={stryMutAct_9fa48("16205") ? () => undefined : (stryCov_9fa48("16205"), e => setEditingStrengths(e.target.value))} className="feedback-textarea" rows="4" placeholder="Enter strengths summary..." />
                          </div>

                          <div className="editing-section">
                            <h4>Growth Areas Summary</h4>
                            <textarea value={editingGrowthAreas} onChange={stryMutAct_9fa48("16206") ? () => undefined : (stryCov_9fa48("16206"), e => setEditingGrowthAreas(e.target.value))} className="feedback-textarea" rows="4" placeholder="Enter growth areas summary..." />
                          </div>

                          <div className="editing-actions">
                            <button className="save-btn" onClick={stryMutAct_9fa48("16207") ? () => undefined : (stryCov_9fa48("16207"), () => onSaveOverview(grade.user_id))} disabled={savingOverview}>
                              {savingOverview ? stryMutAct_9fa48("16208") ? "" : (stryCov_9fa48("16208"), 'Saving...') : stryMutAct_9fa48("16209") ? "" : (stryCov_9fa48("16209"), '💾 Save')}
                            </button>
                            <button className="cancel-btn" onClick={onCancelEditing} disabled={savingOverview}>
                              ❌ Cancel
                            </button>
                          </div>
                        </div> : <div className="readonly-feedback">
                          <div className="strengths-section">
                            <h4>Strengths Summary</h4>
                            <div className="grade-text">
                              {stryMutAct_9fa48("16212") ? grade.strengths_summary && 'No strengths summary available' : stryMutAct_9fa48("16211") ? false : stryMutAct_9fa48("16210") ? true : (stryCov_9fa48("16210", "16211", "16212"), grade.strengths_summary || (stryMutAct_9fa48("16213") ? "" : (stryCov_9fa48("16213"), 'No strengths summary available')))}
                            </div>
                          </div>

                          <div className="growth-areas-section">
                            <h4>Growth Areas Summary</h4>
                            <div className="grade-text">
                              {stryMutAct_9fa48("16216") ? grade.growth_areas_summary && 'No growth areas summary available' : stryMutAct_9fa48("16215") ? false : stryMutAct_9fa48("16214") ? true : (stryCov_9fa48("16214", "16215", "16216"), grade.growth_areas_summary || (stryMutAct_9fa48("16217") ? "" : (stryCov_9fa48("16217"), 'No growth areas summary available')))}
                            </div>
                          </div>
                        </div>}
                    </div>
                  </div>
                </div> : <div className="assessment-content">
                  <div className="content-grid">
                    <div className="student-submission-content">
                      {renderUserSubmissionContent(currentTabType)}
                    </div>
                    
                    <div className="feedback-panel">
                      <h3>AI Analysis & Feedback</h3>
                      {(stryMutAct_9fa48("16221") ? currentAnalysis.length <= 0 : stryMutAct_9fa48("16220") ? currentAnalysis.length >= 0 : stryMutAct_9fa48("16219") ? false : stryMutAct_9fa48("16218") ? true : (stryCov_9fa48("16218", "16219", "16220", "16221"), currentAnalysis.length > 0)) ? renderAnalysisFeedback(currentAnalysis[0]) : <div className="no-feedback">
                          <p>No specific feedback available for {currentTabType} assessment.</p>
                          <div className="fallback-feedback">
                            <h4>Overall Feedback</h4>
                            <div className="strengths-section">
                              <h5>Strengths</h5>
                              <div className="grade-text">{stryMutAct_9fa48("16224") ? grade.strengths_summary && 'No strengths summary available' : stryMutAct_9fa48("16223") ? false : stryMutAct_9fa48("16222") ? true : (stryCov_9fa48("16222", "16223", "16224"), grade.strengths_summary || (stryMutAct_9fa48("16225") ? "" : (stryCov_9fa48("16225"), 'No strengths summary available')))}</div>
                            </div>
                            <div className="growth-areas-section">
                              <h5>Growth Areas</h5>
                              <div className="grade-text">{stryMutAct_9fa48("16228") ? grade.growth_areas_summary && 'No growth areas summary available' : stryMutAct_9fa48("16227") ? false : stryMutAct_9fa48("16226") ? true : (stryCov_9fa48("16226", "16227", "16228"), grade.growth_areas_summary || (stryMutAct_9fa48("16229") ? "" : (stryCov_9fa48("16229"), 'No growth areas summary available')))}</div>
                            </div>
                          </div>
                        </div>}
                    </div>
                  </div>
                </div>}
            </div>
          </div>
        </div>
      </div>
    </div>;
  }
};

// Mass Email Modal Component
const MassEmailModal = ({
  selectedUsers,
  assessmentGrades,
  authToken,
  onClose,
  onEmailSent
}) => {
  if (stryMutAct_9fa48("16230")) {
    {}
  } else {
    stryCov_9fa48("16230");
    const [emailSubject, setEmailSubject] = useState(stryMutAct_9fa48("16231") ? "" : (stryCov_9fa48("16231"), 'Your L1 Assessment Feedback - Great Work, [Builder Name]!'));
    const [emailTemplate, setEmailTemplate] = useState(stryMutAct_9fa48("16232") ? "" : (stryCov_9fa48("16232"), 'pursuit_feedback'));
    const [customMessage, setCustomMessage] = useState(stryMutAct_9fa48("16233") ? "Stryker was here!" : (stryCov_9fa48("16233"), ''));
    const [sending, setSending] = useState(stryMutAct_9fa48("16234") ? true : (stryCov_9fa48("16234"), false));
    const [previews, setPreviews] = useState(stryMutAct_9fa48("16235") ? ["Stryker was here"] : (stryCov_9fa48("16235"), []));
    const [loadingPreviews, setLoadingPreviews] = useState(stryMutAct_9fa48("16236") ? true : (stryCov_9fa48("16236"), false));
    const [showPreviews, setShowPreviews] = useState(stryMutAct_9fa48("16237") ? true : (stryCov_9fa48("16237"), false));
    const handlePreviewEmails = async () => {
      if (stryMutAct_9fa48("16238")) {
        {}
      } else {
        stryCov_9fa48("16238");
        try {
          if (stryMutAct_9fa48("16239")) {
            {}
          } else {
            stryCov_9fa48("16239");
            setLoadingPreviews(stryMutAct_9fa48("16240") ? false : (stryCov_9fa48("16240"), true));
            const response = await fetch(stryMutAct_9fa48("16241") ? `` : (stryCov_9fa48("16241"), `${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/email-preview`), stryMutAct_9fa48("16242") ? {} : (stryCov_9fa48("16242"), {
              method: stryMutAct_9fa48("16243") ? "" : (stryCov_9fa48("16243"), 'POST'),
              headers: stryMutAct_9fa48("16244") ? {} : (stryCov_9fa48("16244"), {
                'Authorization': stryMutAct_9fa48("16245") ? `` : (stryCov_9fa48("16245"), `Bearer ${authToken}`),
                'Content-Type': stryMutAct_9fa48("16246") ? "" : (stryCov_9fa48("16246"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("16247") ? {} : (stryCov_9fa48("16247"), {
                userIds: selectedUsers,
                subject: emailSubject,
                emailTemplate: emailTemplate,
                customMessage: customMessage
              }))
            }));
            if (stryMutAct_9fa48("16250") ? false : stryMutAct_9fa48("16249") ? true : stryMutAct_9fa48("16248") ? response.ok : (stryCov_9fa48("16248", "16249", "16250"), !response.ok)) {
              if (stryMutAct_9fa48("16251")) {
                {}
              } else {
                stryCov_9fa48("16251");
                throw new Error(stryMutAct_9fa48("16252") ? "" : (stryCov_9fa48("16252"), 'Failed to generate previews'));
              }
            }
            const result = await response.json();
            setPreviews(result.previews);
            setShowPreviews(stryMutAct_9fa48("16253") ? false : (stryCov_9fa48("16253"), true));
          }
        } catch (err) {
          if (stryMutAct_9fa48("16254")) {
            {}
          } else {
            stryCov_9fa48("16254");
            console.error(stryMutAct_9fa48("16255") ? "" : (stryCov_9fa48("16255"), 'Error generating previews:'), err);
            Swal.fire(stryMutAct_9fa48("16256") ? {} : (stryCov_9fa48("16256"), {
              icon: stryMutAct_9fa48("16257") ? "" : (stryCov_9fa48("16257"), 'error'),
              title: stryMutAct_9fa48("16258") ? "" : (stryCov_9fa48("16258"), 'Preview Generation Failed'),
              text: stryMutAct_9fa48("16259") ? "" : (stryCov_9fa48("16259"), 'Failed to generate email previews. Please try again.'),
              confirmButtonColor: stryMutAct_9fa48("16260") ? "" : (stryCov_9fa48("16260"), '#d33'),
              background: stryMutAct_9fa48("16261") ? "" : (stryCov_9fa48("16261"), '#1f2937'),
              color: stryMutAct_9fa48("16262") ? "" : (stryCov_9fa48("16262"), '#f9fafb'),
              customClass: stryMutAct_9fa48("16263") ? {} : (stryCov_9fa48("16263"), {
                popup: stryMutAct_9fa48("16264") ? "" : (stryCov_9fa48("16264"), 'swal-dark-popup'),
                title: stryMutAct_9fa48("16265") ? "" : (stryCov_9fa48("16265"), 'swal-dark-title'),
                content: stryMutAct_9fa48("16266") ? "" : (stryCov_9fa48("16266"), 'swal-dark-content')
              })
            }));
          }
        } finally {
          if (stryMutAct_9fa48("16267")) {
            {}
          } else {
            stryCov_9fa48("16267");
            setLoadingPreviews(stryMutAct_9fa48("16268") ? true : (stryCov_9fa48("16268"), false));
          }
        }
      }
    };
    const handleSendEmails = async () => {
      if (stryMutAct_9fa48("16269")) {
        {}
      } else {
        stryCov_9fa48("16269");
        try {
          if (stryMutAct_9fa48("16270")) {
            {}
          } else {
            stryCov_9fa48("16270");
            setSending(stryMutAct_9fa48("16271") ? false : (stryCov_9fa48("16271"), true));
            const response = await fetch(stryMutAct_9fa48("16272") ? `` : (stryCov_9fa48("16272"), `${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/email`), stryMutAct_9fa48("16273") ? {} : (stryCov_9fa48("16273"), {
              method: stryMutAct_9fa48("16274") ? "" : (stryCov_9fa48("16274"), 'POST'),
              headers: stryMutAct_9fa48("16275") ? {} : (stryCov_9fa48("16275"), {
                'Authorization': stryMutAct_9fa48("16276") ? `` : (stryCov_9fa48("16276"), `Bearer ${authToken}`),
                'Content-Type': stryMutAct_9fa48("16277") ? "" : (stryCov_9fa48("16277"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("16278") ? {} : (stryCov_9fa48("16278"), {
                userIds: selectedUsers,
                subject: emailSubject,
                emailTemplate: emailTemplate,
                customMessage: customMessage
              }))
            }));
            if (stryMutAct_9fa48("16281") ? false : stryMutAct_9fa48("16280") ? true : stryMutAct_9fa48("16279") ? response.ok : (stryCov_9fa48("16279", "16280", "16281"), !response.ok)) {
              if (stryMutAct_9fa48("16282")) {
                {}
              } else {
                stryCov_9fa48("16282");
                throw new Error(stryMutAct_9fa48("16283") ? "" : (stryCov_9fa48("16283"), 'Failed to send emails'));
              }
            }
            const result = await response.json();
            Swal.fire(stryMutAct_9fa48("16284") ? {} : (stryCov_9fa48("16284"), {
              icon: stryMutAct_9fa48("16285") ? "" : (stryCov_9fa48("16285"), 'success'),
              title: stryMutAct_9fa48("16286") ? "" : (stryCov_9fa48("16286"), 'Emails Sent Successfully!'),
              text: stryMutAct_9fa48("16287") ? `` : (stryCov_9fa48("16287"), `Successfully processed ${result.results.length} emails`),
              confirmButtonColor: stryMutAct_9fa48("16288") ? "" : (stryCov_9fa48("16288"), '#10b981'),
              timer: 4000,
              timerProgressBar: stryMutAct_9fa48("16289") ? false : (stryCov_9fa48("16289"), true),
              background: stryMutAct_9fa48("16290") ? "" : (stryCov_9fa48("16290"), '#1f2937'),
              color: stryMutAct_9fa48("16291") ? "" : (stryCov_9fa48("16291"), '#f9fafb'),
              customClass: stryMutAct_9fa48("16292") ? {} : (stryCov_9fa48("16292"), {
                popup: stryMutAct_9fa48("16293") ? "" : (stryCov_9fa48("16293"), 'swal-dark-popup'),
                title: stryMutAct_9fa48("16294") ? "" : (stryCov_9fa48("16294"), 'swal-dark-title'),
                content: stryMutAct_9fa48("16295") ? "" : (stryCov_9fa48("16295"), 'swal-dark-content')
              })
            }));
            onEmailSent();
          }
        } catch (err) {
          if (stryMutAct_9fa48("16296")) {
            {}
          } else {
            stryCov_9fa48("16296");
            console.error(stryMutAct_9fa48("16297") ? "" : (stryCov_9fa48("16297"), 'Error sending emails:'), err);
            Swal.fire(stryMutAct_9fa48("16298") ? {} : (stryCov_9fa48("16298"), {
              icon: stryMutAct_9fa48("16299") ? "" : (stryCov_9fa48("16299"), 'error'),
              title: stryMutAct_9fa48("16300") ? "" : (stryCov_9fa48("16300"), 'Email Sending Failed'),
              text: stryMutAct_9fa48("16301") ? "" : (stryCov_9fa48("16301"), 'Failed to send emails. Please check your connection and try again.'),
              confirmButtonColor: stryMutAct_9fa48("16302") ? "" : (stryCov_9fa48("16302"), '#d33'),
              background: stryMutAct_9fa48("16303") ? "" : (stryCov_9fa48("16303"), '#1f2937'),
              color: stryMutAct_9fa48("16304") ? "" : (stryCov_9fa48("16304"), '#f9fafb'),
              customClass: stryMutAct_9fa48("16305") ? {} : (stryCov_9fa48("16305"), {
                popup: stryMutAct_9fa48("16306") ? "" : (stryCov_9fa48("16306"), 'swal-dark-popup'),
                title: stryMutAct_9fa48("16307") ? "" : (stryCov_9fa48("16307"), 'swal-dark-title'),
                content: stryMutAct_9fa48("16308") ? "" : (stryCov_9fa48("16308"), 'swal-dark-content')
              })
            }));
          }
        } finally {
          if (stryMutAct_9fa48("16309")) {
            {}
          } else {
            stryCov_9fa48("16309");
            setSending(stryMutAct_9fa48("16310") ? true : (stryCov_9fa48("16310"), false));
          }
        }
      }
    };
    const handleSendTestEmail = async () => {
      if (stryMutAct_9fa48("16311")) {
        {}
      } else {
        stryCov_9fa48("16311");
        const {
          value: testEmail
        } = await Swal.fire(stryMutAct_9fa48("16312") ? {} : (stryCov_9fa48("16312"), {
          title: stryMutAct_9fa48("16313") ? "" : (stryCov_9fa48("16313"), 'Send Test Email'),
          text: stryMutAct_9fa48("16314") ? "" : (stryCov_9fa48("16314"), 'Enter your email address for the test:'),
          input: stryMutAct_9fa48("16315") ? "" : (stryCov_9fa48("16315"), 'email'),
          inputPlaceholder: stryMutAct_9fa48("16316") ? "" : (stryCov_9fa48("16316"), 'your.email@example.com'),
          showCancelButton: stryMutAct_9fa48("16317") ? false : (stryCov_9fa48("16317"), true),
          confirmButtonColor: stryMutAct_9fa48("16318") ? "" : (stryCov_9fa48("16318"), '#10b981'),
          cancelButtonColor: stryMutAct_9fa48("16319") ? "" : (stryCov_9fa48("16319"), '#6b7280'),
          confirmButtonText: stryMutAct_9fa48("16320") ? "" : (stryCov_9fa48("16320"), 'Send Test'),
          background: stryMutAct_9fa48("16321") ? "" : (stryCov_9fa48("16321"), '#1f2937'),
          color: stryMutAct_9fa48("16322") ? "" : (stryCov_9fa48("16322"), '#f9fafb'),
          customClass: stryMutAct_9fa48("16323") ? {} : (stryCov_9fa48("16323"), {
            popup: stryMutAct_9fa48("16324") ? "" : (stryCov_9fa48("16324"), 'swal-dark-popup'),
            title: stryMutAct_9fa48("16325") ? "" : (stryCov_9fa48("16325"), 'swal-dark-title'),
            content: stryMutAct_9fa48("16326") ? "" : (stryCov_9fa48("16326"), 'swal-dark-content'),
            input: stryMutAct_9fa48("16327") ? "" : (stryCov_9fa48("16327"), 'swal-dark-input')
          }),
          inputValidator: value => {
            if (stryMutAct_9fa48("16328")) {
              {}
            } else {
              stryCov_9fa48("16328");
              if (stryMutAct_9fa48("16331") ? false : stryMutAct_9fa48("16330") ? true : stryMutAct_9fa48("16329") ? value : (stryCov_9fa48("16329", "16330", "16331"), !value)) {
                if (stryMutAct_9fa48("16332")) {
                  {}
                } else {
                  stryCov_9fa48("16332");
                  return stryMutAct_9fa48("16333") ? "" : (stryCov_9fa48("16333"), 'You need to enter an email address!');
                }
              }
              if (stryMutAct_9fa48("16336") ? false : stryMutAct_9fa48("16335") ? true : stryMutAct_9fa48("16334") ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : (stryCov_9fa48("16334", "16335", "16336"), !(stryMutAct_9fa48("16347") ? /^[^\s@]+@[^\s@]+\.[^\S@]+$/ : stryMutAct_9fa48("16346") ? /^[^\s@]+@[^\s@]+\.[\s@]+$/ : stryMutAct_9fa48("16345") ? /^[^\s@]+@[^\s@]+\.[^\s@]$/ : stryMutAct_9fa48("16344") ? /^[^\s@]+@[^\S@]+\.[^\s@]+$/ : stryMutAct_9fa48("16343") ? /^[^\s@]+@[\s@]+\.[^\s@]+$/ : stryMutAct_9fa48("16342") ? /^[^\s@]+@[^\s@]\.[^\s@]+$/ : stryMutAct_9fa48("16341") ? /^[^\S@]+@[^\s@]+\.[^\s@]+$/ : stryMutAct_9fa48("16340") ? /^[\s@]+@[^\s@]+\.[^\s@]+$/ : stryMutAct_9fa48("16339") ? /^[^\s@]@[^\s@]+\.[^\s@]+$/ : stryMutAct_9fa48("16338") ? /^[^\s@]+@[^\s@]+\.[^\s@]+/ : stryMutAct_9fa48("16337") ? /[^\s@]+@[^\s@]+\.[^\s@]+$/ : (stryCov_9fa48("16337", "16338", "16339", "16340", "16341", "16342", "16343", "16344", "16345", "16346", "16347"), /^[^\s@]+@[^\s@]+\.[^\s@]+$/)).test(value))) {
                if (stryMutAct_9fa48("16348")) {
                  {}
                } else {
                  stryCov_9fa48("16348");
                  return stryMutAct_9fa48("16349") ? "" : (stryCov_9fa48("16349"), 'Please enter a valid email address!');
                }
              }
            }
          }
        }));
        if (stryMutAct_9fa48("16352") ? false : stryMutAct_9fa48("16351") ? true : stryMutAct_9fa48("16350") ? testEmail : (stryCov_9fa48("16350", "16351", "16352"), !testEmail)) return;
        try {
          if (stryMutAct_9fa48("16353")) {
            {}
          } else {
            stryCov_9fa48("16353");
            const response = await fetch(stryMutAct_9fa48("16354") ? `` : (stryCov_9fa48("16354"), `${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/test-email`), stryMutAct_9fa48("16355") ? {} : (stryCov_9fa48("16355"), {
              method: stryMutAct_9fa48("16356") ? "" : (stryCov_9fa48("16356"), 'POST'),
              headers: stryMutAct_9fa48("16357") ? {} : (stryCov_9fa48("16357"), {
                'Authorization': stryMutAct_9fa48("16358") ? `` : (stryCov_9fa48("16358"), `Bearer ${authToken}`),
                'Content-Type': stryMutAct_9fa48("16359") ? "" : (stryCov_9fa48("16359"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("16360") ? {} : (stryCov_9fa48("16360"), {
                recipientEmail: testEmail,
                testData: stryMutAct_9fa48("16361") ? {} : (stryCov_9fa48("16361"), {
                  subject: emailSubject,
                  customMessage: customMessage
                })
              }))
            }));
            if (stryMutAct_9fa48("16364") ? false : stryMutAct_9fa48("16363") ? true : stryMutAct_9fa48("16362") ? response.ok : (stryCov_9fa48("16362", "16363", "16364"), !response.ok)) {
              if (stryMutAct_9fa48("16365")) {
                {}
              } else {
                stryCov_9fa48("16365");
                throw new Error(stryMutAct_9fa48("16366") ? "" : (stryCov_9fa48("16366"), 'Failed to send test email'));
              }
            }
            const result = await response.json();
            Swal.fire(stryMutAct_9fa48("16367") ? {} : (stryCov_9fa48("16367"), {
              icon: stryMutAct_9fa48("16368") ? "" : (stryCov_9fa48("16368"), 'success'),
              title: stryMutAct_9fa48("16369") ? "" : (stryCov_9fa48("16369"), 'Test Email Sent!'),
              html: stryMutAct_9fa48("16370") ? `` : (stryCov_9fa48("16370"), `✅ Test email sent successfully to <strong>${testEmail}</strong><br><small>Message ID: ${result.messageId}</small>`),
              confirmButtonColor: stryMutAct_9fa48("16371") ? "" : (stryCov_9fa48("16371"), '#10b981'),
              timer: 5000,
              timerProgressBar: stryMutAct_9fa48("16372") ? false : (stryCov_9fa48("16372"), true),
              background: stryMutAct_9fa48("16373") ? "" : (stryCov_9fa48("16373"), '#1f2937'),
              color: stryMutAct_9fa48("16374") ? "" : (stryCov_9fa48("16374"), '#f9fafb'),
              customClass: stryMutAct_9fa48("16375") ? {} : (stryCov_9fa48("16375"), {
                popup: stryMutAct_9fa48("16376") ? "" : (stryCov_9fa48("16376"), 'swal-dark-popup'),
                title: stryMutAct_9fa48("16377") ? "" : (stryCov_9fa48("16377"), 'swal-dark-title'),
                content: stryMutAct_9fa48("16378") ? "" : (stryCov_9fa48("16378"), 'swal-dark-content')
              })
            }));
          }
        } catch (err) {
          if (stryMutAct_9fa48("16379")) {
            {}
          } else {
            stryCov_9fa48("16379");
            console.error(stryMutAct_9fa48("16380") ? "" : (stryCov_9fa48("16380"), 'Error sending test email:'), err);
            Swal.fire(stryMutAct_9fa48("16381") ? {} : (stryCov_9fa48("16381"), {
              icon: stryMutAct_9fa48("16382") ? "" : (stryCov_9fa48("16382"), 'error'),
              title: stryMutAct_9fa48("16383") ? "" : (stryCov_9fa48("16383"), 'Test Email Failed'),
              text: stryMutAct_9fa48("16384") ? "" : (stryCov_9fa48("16384"), 'Failed to send test email. Check console for details.'),
              confirmButtonColor: stryMutAct_9fa48("16385") ? "" : (stryCov_9fa48("16385"), '#d33'),
              background: stryMutAct_9fa48("16386") ? "" : (stryCov_9fa48("16386"), '#1f2937'),
              color: stryMutAct_9fa48("16387") ? "" : (stryCov_9fa48("16387"), '#f9fafb'),
              customClass: stryMutAct_9fa48("16388") ? {} : (stryCov_9fa48("16388"), {
                popup: stryMutAct_9fa48("16389") ? "" : (stryCov_9fa48("16389"), 'swal-dark-popup'),
                title: stryMutAct_9fa48("16390") ? "" : (stryCov_9fa48("16390"), 'swal-dark-title'),
                content: stryMutAct_9fa48("16391") ? "" : (stryCov_9fa48("16391"), 'swal-dark-content')
              })
            }));
          }
        }
      }
    };
    return <div className="assessment-grades-email-modal-overlay" onClick={onClose}>
      <div className="assessment-grades-email-modal" onClick={stryMutAct_9fa48("16392") ? () => undefined : (stryCov_9fa48("16392"), e => e.stopPropagation())}>
        <div className="assessment-grades-email-modal__header">
          <h2 className="assessment-grades-email-modal__title">Send Mass Email</h2>
          <button className="assessment-grades-email-modal__close" onClick={onClose}>×</button>
        </div>
        
        <div className="assessment-grades-email-modal__body">
          <div className="assessment-grades-email-modal__form">
            <div className="assessment-grades-email-modal__field">
              <label htmlFor="recipients" className="assessment-grades-email-modal__label">Recipients ({selectedUsers.length} users):</label>
              <div className="assessment-grades-email-modal__recipients">
                {stryMutAct_9fa48("16393") ? assessmentGrades.map(grade => <div key={grade.user_id} className="assessment-grades-email-modal__recipient">
                    {grade.user_first_name} {grade.user_last_name} ({grade.user_email})
                  </div>) : (stryCov_9fa48("16393"), assessmentGrades.slice(0, 5).map(stryMutAct_9fa48("16394") ? () => undefined : (stryCov_9fa48("16394"), grade => <div key={grade.user_id} className="assessment-grades-email-modal__recipient">
                    {grade.user_first_name} {grade.user_last_name} ({grade.user_email})
                  </div>)))}
                {stryMutAct_9fa48("16397") ? assessmentGrades.length > 5 || <div className="assessment-grades-email-modal__recipient assessment-grades-email-modal__recipient--more">... and {assessmentGrades.length - 5} more</div> : stryMutAct_9fa48("16396") ? false : stryMutAct_9fa48("16395") ? true : (stryCov_9fa48("16395", "16396", "16397"), (stryMutAct_9fa48("16400") ? assessmentGrades.length <= 5 : stryMutAct_9fa48("16399") ? assessmentGrades.length >= 5 : stryMutAct_9fa48("16398") ? true : (stryCov_9fa48("16398", "16399", "16400"), assessmentGrades.length > 5)) && <div className="assessment-grades-email-modal__recipient assessment-grades-email-modal__recipient--more">... and {stryMutAct_9fa48("16401") ? assessmentGrades.length + 5 : (stryCov_9fa48("16401"), assessmentGrades.length - 5)} more</div>)}
              </div>
            </div>

            <div className="assessment-grades-email-modal__field">
              <label htmlFor="subject" className="assessment-grades-email-modal__label">Subject:</label>
              <input type="text" id="subject" className="assessment-grades-email-modal__input" value={emailSubject} onChange={stryMutAct_9fa48("16402") ? () => undefined : (stryCov_9fa48("16402"), e => setEmailSubject(e.target.value))} />
            </div>

            <div className="assessment-grades-email-modal__field">
              <label htmlFor="template" className="assessment-grades-email-modal__label">Email Template:</label>
              <select id="template" className="assessment-grades-email-modal__select" value={emailTemplate} onChange={stryMutAct_9fa48("16403") ? () => undefined : (stryCov_9fa48("16403"), e => setEmailTemplate(e.target.value))}>
                <option value="pursuit_feedback">Pursuit Assessment Feedback</option>
                <option value="detailed">Detailed Feedback</option>
                <option value="encouragement">Encouragement Focus</option>
              </select>
            </div>

            <div className="assessment-grades-email-modal__field">
              <label htmlFor="customMessage" className="assessment-grades-email-modal__label">Custom Message (optional):</label>
              <textarea id="customMessage" className="assessment-grades-email-modal__textarea" value={customMessage} onChange={stryMutAct_9fa48("16404") ? () => undefined : (stryCov_9fa48("16404"), e => setCustomMessage(e.target.value))} placeholder="Add a personal message that will be included in all emails..." rows="4" />
            </div>

            <div className="assessment-grades-email-modal__preview-section">
              <div className="assessment-grades-email-modal__preview-actions">
                <button className="assessment-grades-email-modal__btn assessment-grades-email-modal__btn--outline assessment-grades-email-modal__btn--preview" onClick={handlePreviewEmails} disabled={stryMutAct_9fa48("16407") ? loadingPreviews && selectedUsers.length === 0 : stryMutAct_9fa48("16406") ? false : stryMutAct_9fa48("16405") ? true : (stryCov_9fa48("16405", "16406", "16407"), loadingPreviews || (stryMutAct_9fa48("16409") ? selectedUsers.length !== 0 : stryMutAct_9fa48("16408") ? false : (stryCov_9fa48("16408", "16409"), selectedUsers.length === 0)))}>
                  {loadingPreviews ? stryMutAct_9fa48("16410") ? "" : (stryCov_9fa48("16410"), 'Generating Previews...') : stryMutAct_9fa48("16411") ? `` : (stryCov_9fa48("16411"), `Preview Emails (${stryMutAct_9fa48("16412") ? Math.max(selectedUsers.length, 3) : (stryCov_9fa48("16412"), Math.min(selectedUsers.length, 3))})`)}
                </button>
                {stryMutAct_9fa48("16415") ? showPreviews || <button className="assessment-grades-email-modal__btn assessment-grades-email-modal__btn--secondary" onClick={() => setShowPreviews(false)}>
                    Hide Previews
                  </button> : stryMutAct_9fa48("16414") ? false : stryMutAct_9fa48("16413") ? true : (stryCov_9fa48("16413", "16414", "16415"), showPreviews && <button className="assessment-grades-email-modal__btn assessment-grades-email-modal__btn--secondary" onClick={stryMutAct_9fa48("16416") ? () => undefined : (stryCov_9fa48("16416"), () => setShowPreviews(stryMutAct_9fa48("16417") ? true : (stryCov_9fa48("16417"), false)))}>
                    Hide Previews
                  </button>)}
              </div>

              {stryMutAct_9fa48("16420") ? showPreviews && previews.length > 0 || <div className="assessment-grades-email-modal__previews">
                  <h4 className="assessment-grades-email-modal__previews-title">Email Previews ({previews.length} of {selectedUsers.length} selected):</h4>
                  {previews.map((preview, index) => <div key={preview.user_id} className="assessment-grades-email-modal__preview-item">
                      <div className="assessment-grades-email-modal__preview-header">
                        <h5 className="assessment-grades-email-modal__preview-name">📧 {preview.name} ({preview.email})</h5>
                        <span className={`assessment-grades-email-modal__preview-status assessment-grades-email-modal__preview-status--${preview.status}`}>
                          {preview.status === 'preview_ready' ? '✅ Ready' : preview.status === 'no_feedback' ? '⚠️ No Feedback' : '❌ Error'}
                        </span>
                      </div>
                      
                      {preview.status === 'preview_ready' && preview.preview && <div className="assessment-grades-email-modal__preview-content">
                          <div className="assessment-grades-email-modal__preview-subject">
                            <strong>Subject:</strong> {preview.preview.subject}
                          </div>
                          <div className="assessment-grades-email-modal__preview-body">
                            <div className="assessment-grades-email-modal__preview-html" dangerouslySetInnerHTML={{
                        __html: preview.preview.html
                      }} />
                          </div>
                        </div>}
                      
                      {preview.status === 'no_feedback' && <div className="assessment-grades-email-modal__preview-warning">
                          <p>⚠️ No assessment feedback found for this user. Email will be skipped.</p>
                        </div>}
                      
                      {preview.status === 'preview_error' && <div className="assessment-grades-email-modal__preview-error">
                          <p>❌ Error generating preview for this user.</p>
                        </div>}
                    </div>)}
                </div> : stryMutAct_9fa48("16419") ? false : stryMutAct_9fa48("16418") ? true : (stryCov_9fa48("16418", "16419", "16420"), (stryMutAct_9fa48("16422") ? showPreviews || previews.length > 0 : stryMutAct_9fa48("16421") ? true : (stryCov_9fa48("16421", "16422"), showPreviews && (stryMutAct_9fa48("16425") ? previews.length <= 0 : stryMutAct_9fa48("16424") ? previews.length >= 0 : stryMutAct_9fa48("16423") ? true : (stryCov_9fa48("16423", "16424", "16425"), previews.length > 0)))) && <div className="assessment-grades-email-modal__previews">
                  <h4 className="assessment-grades-email-modal__previews-title">Email Previews ({previews.length} of {selectedUsers.length} selected):</h4>
                  {previews.map(stryMutAct_9fa48("16426") ? () => undefined : (stryCov_9fa48("16426"), (preview, index) => <div key={preview.user_id} className="assessment-grades-email-modal__preview-item">
                      <div className="assessment-grades-email-modal__preview-header">
                        <h5 className="assessment-grades-email-modal__preview-name">📧 {preview.name} ({preview.email})</h5>
                        <span className={stryMutAct_9fa48("16427") ? `` : (stryCov_9fa48("16427"), `assessment-grades-email-modal__preview-status assessment-grades-email-modal__preview-status--${preview.status}`)}>
                          {(stryMutAct_9fa48("16430") ? preview.status !== 'preview_ready' : stryMutAct_9fa48("16429") ? false : stryMutAct_9fa48("16428") ? true : (stryCov_9fa48("16428", "16429", "16430"), preview.status === (stryMutAct_9fa48("16431") ? "" : (stryCov_9fa48("16431"), 'preview_ready')))) ? stryMutAct_9fa48("16432") ? "" : (stryCov_9fa48("16432"), '✅ Ready') : (stryMutAct_9fa48("16435") ? preview.status !== 'no_feedback' : stryMutAct_9fa48("16434") ? false : stryMutAct_9fa48("16433") ? true : (stryCov_9fa48("16433", "16434", "16435"), preview.status === (stryMutAct_9fa48("16436") ? "" : (stryCov_9fa48("16436"), 'no_feedback')))) ? stryMutAct_9fa48("16437") ? "" : (stryCov_9fa48("16437"), '⚠️ No Feedback') : stryMutAct_9fa48("16438") ? "" : (stryCov_9fa48("16438"), '❌ Error')}
                        </span>
                      </div>
                      
                      {stryMutAct_9fa48("16441") ? preview.status === 'preview_ready' && preview.preview || <div className="assessment-grades-email-modal__preview-content">
                          <div className="assessment-grades-email-modal__preview-subject">
                            <strong>Subject:</strong> {preview.preview.subject}
                          </div>
                          <div className="assessment-grades-email-modal__preview-body">
                            <div className="assessment-grades-email-modal__preview-html" dangerouslySetInnerHTML={{
                        __html: preview.preview.html
                      }} />
                          </div>
                        </div> : stryMutAct_9fa48("16440") ? false : stryMutAct_9fa48("16439") ? true : (stryCov_9fa48("16439", "16440", "16441"), (stryMutAct_9fa48("16443") ? preview.status === 'preview_ready' || preview.preview : stryMutAct_9fa48("16442") ? true : (stryCov_9fa48("16442", "16443"), (stryMutAct_9fa48("16445") ? preview.status !== 'preview_ready' : stryMutAct_9fa48("16444") ? true : (stryCov_9fa48("16444", "16445"), preview.status === (stryMutAct_9fa48("16446") ? "" : (stryCov_9fa48("16446"), 'preview_ready')))) && preview.preview)) && <div className="assessment-grades-email-modal__preview-content">
                          <div className="assessment-grades-email-modal__preview-subject">
                            <strong>Subject:</strong> {preview.preview.subject}
                          </div>
                          <div className="assessment-grades-email-modal__preview-body">
                            <div className="assessment-grades-email-modal__preview-html" dangerouslySetInnerHTML={stryMutAct_9fa48("16447") ? {} : (stryCov_9fa48("16447"), {
                        __html: preview.preview.html
                      })} />
                          </div>
                        </div>)}
                      
                      {stryMutAct_9fa48("16450") ? preview.status === 'no_feedback' || <div className="assessment-grades-email-modal__preview-warning">
                          <p>⚠️ No assessment feedback found for this user. Email will be skipped.</p>
                        </div> : stryMutAct_9fa48("16449") ? false : stryMutAct_9fa48("16448") ? true : (stryCov_9fa48("16448", "16449", "16450"), (stryMutAct_9fa48("16452") ? preview.status !== 'no_feedback' : stryMutAct_9fa48("16451") ? true : (stryCov_9fa48("16451", "16452"), preview.status === (stryMutAct_9fa48("16453") ? "" : (stryCov_9fa48("16453"), 'no_feedback')))) && <div className="assessment-grades-email-modal__preview-warning">
                          <p>⚠️ No assessment feedback found for this user. Email will be skipped.</p>
                        </div>)}
                      
                      {stryMutAct_9fa48("16456") ? preview.status === 'preview_error' || <div className="assessment-grades-email-modal__preview-error">
                          <p>❌ Error generating preview for this user.</p>
                        </div> : stryMutAct_9fa48("16455") ? false : stryMutAct_9fa48("16454") ? true : (stryCov_9fa48("16454", "16455", "16456"), (stryMutAct_9fa48("16458") ? preview.status !== 'preview_error' : stryMutAct_9fa48("16457") ? true : (stryCov_9fa48("16457", "16458"), preview.status === (stryMutAct_9fa48("16459") ? "" : (stryCov_9fa48("16459"), 'preview_error')))) && <div className="assessment-grades-email-modal__preview-error">
                          <p>❌ Error generating preview for this user.</p>
                        </div>)}
                    </div>))}
                </div>)}
            </div>
          </div>
        </div>

        <div className="assessment-grades-email-modal__footer">
          <button className="assessment-grades-email-modal__btn assessment-grades-email-modal__btn--outline assessment-grades-email-modal__btn--test" onClick={handleSendTestEmail} disabled={stryMutAct_9fa48("16462") ? sending && loadingPreviews : stryMutAct_9fa48("16461") ? false : stryMutAct_9fa48("16460") ? true : (stryCov_9fa48("16460", "16461", "16462"), sending || loadingPreviews)}>
            📧 Send Test Email
          </button>
          <div className="assessment-grades-email-modal__footer-actions">
            <button className="assessment-grades-email-modal__btn assessment-grades-email-modal__btn--secondary" onClick={onClose} disabled={sending}>
              Cancel
            </button>
            <button className="assessment-grades-email-modal__btn assessment-grades-email-modal__btn--success" onClick={handleSendEmails} disabled={stryMutAct_9fa48("16465") ? (sending || !emailSubject) && selectedUsers.length === 0 : stryMutAct_9fa48("16464") ? false : stryMutAct_9fa48("16463") ? true : (stryCov_9fa48("16463", "16464", "16465"), (stryMutAct_9fa48("16467") ? sending && !emailSubject : stryMutAct_9fa48("16466") ? false : (stryCov_9fa48("16466", "16467"), sending || (stryMutAct_9fa48("16468") ? emailSubject : (stryCov_9fa48("16468"), !emailSubject)))) || (stryMutAct_9fa48("16470") ? selectedUsers.length !== 0 : stryMutAct_9fa48("16469") ? false : (stryCov_9fa48("16469", "16470"), selectedUsers.length === 0)))}>
              {sending ? stryMutAct_9fa48("16471") ? "" : (stryCov_9fa48("16471"), 'Sending...') : stryMutAct_9fa48("16472") ? `` : (stryCov_9fa48("16472"), `Send to ${selectedUsers.length} Users`)}
            </button>
          </div>
        </div>
      </div>
    </div>;
  }
};
export default AssessmentGrades;