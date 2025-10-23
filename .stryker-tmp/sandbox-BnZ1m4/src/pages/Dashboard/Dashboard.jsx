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
import { AlertTriangle, Calendar, BookOpen, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RippleButton } from '../../components/animate-ui/components/buttons/ripple';
import MissedAssignmentsSidebar from '../../components/MissedAssignmentsSidebar/MissedAssignmentsSidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import './Dashboard.css';
function Dashboard() {
  if (stryMutAct_9fa48("765")) {
    {}
  } else {
    stryCov_9fa48("765");
    const navigate = useNavigate();
    const {
      token,
      user
    } = useAuth();

    // Check if user has active status
    const isActive = stryMutAct_9fa48("768") ? user?.active === false : stryMutAct_9fa48("767") ? false : stryMutAct_9fa48("766") ? true : (stryCov_9fa48("766", "767", "768"), (stryMutAct_9fa48("769") ? user.active : (stryCov_9fa48("769"), user?.active)) !== (stryMutAct_9fa48("770") ? true : (stryCov_9fa48("770"), false)));
    // Check if user is volunteer
    const isVolunteer = stryMutAct_9fa48("773") ? user?.role !== 'volunteer' : stryMutAct_9fa48("772") ? false : stryMutAct_9fa48("771") ? true : (stryCov_9fa48("771", "772", "773"), (stryMutAct_9fa48("774") ? user.role : (stryCov_9fa48("774"), user?.role)) === (stryMutAct_9fa48("775") ? "" : (stryCov_9fa48("775"), 'volunteer')));
    const [isLoading, setIsLoading] = useState(stryMutAct_9fa48("776") ? false : (stryCov_9fa48("776"), true));
    const [error, setError] = useState(null);
    const [currentDay, setCurrentDay] = useState(null);
    const [dailyTasks, setDailyTasks] = useState(stryMutAct_9fa48("777") ? ["Stryker was here"] : (stryCov_9fa48("777"), []));
    const [objectives, setObjectives] = useState(stryMutAct_9fa48("778") ? ["Stryker was here"] : (stryCov_9fa48("778"), []));
    const [cohortFilter, setCohortFilter] = useState(null);
    const [missedAssignmentsCount, setMissedAssignmentsCount] = useState(0);
    const [weekData, setWeekData] = useState(stryMutAct_9fa48("779") ? ["Stryker was here"] : (stryCov_9fa48("779"), []));
    const [currentWeek, setCurrentWeek] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(null);
    const [weeklyGoal, setWeeklyGoal] = useState(stryMutAct_9fa48("780") ? "Stryker was here!" : (stryCov_9fa48("780"), ''));
    const [isLoadingWeek, setIsLoadingWeek] = useState(stryMutAct_9fa48("781") ? true : (stryCov_9fa48("781"), false));
    const [slideDirection, setSlideDirection] = useState(null); // 'left' or 'right'
    const [isSidebarOpen, setIsSidebarOpen] = useState(stryMutAct_9fa48("782") ? true : (stryCov_9fa48("782"), false));
    const [weekCache, setWeekCache] = useState({}); // Cache all weeks data

    useEffect(() => {
      if (stryMutAct_9fa48("783")) {
        {}
      } else {
        stryCov_9fa48("783");
        // Only fetch dashboard data if user is active
        if (stryMutAct_9fa48("785") ? false : stryMutAct_9fa48("784") ? true : (stryCov_9fa48("784", "785"), isActive)) {
          if (stryMutAct_9fa48("786")) {
            {}
          } else {
            stryCov_9fa48("786");
            fetchDashboardData();
          }
        } else {
          if (stryMutAct_9fa48("787")) {
            {}
          } else {
            stryCov_9fa48("787");
            // If user is inactive, we don't need to load the dashboard data
            setIsLoading(stryMutAct_9fa48("788") ? true : (stryCov_9fa48("788"), false));
          }
        }
      }
    }, stryMutAct_9fa48("789") ? [] : (stryCov_9fa48("789"), [token, cohortFilter, stryMutAct_9fa48("790") ? user.role : (stryCov_9fa48("790"), user?.role), isActive]));
    const fetchDashboardData = async () => {
      if (stryMutAct_9fa48("791")) {
        {}
      } else {
        stryCov_9fa48("791");
        try {
          if (stryMutAct_9fa48("792")) {
            {}
          } else {
            stryCov_9fa48("792");
            setIsLoading(stryMutAct_9fa48("793") ? false : (stryCov_9fa48("793"), true));
            setError(null);
            let url = stryMutAct_9fa48("794") ? `` : (stryCov_9fa48("794"), `${import.meta.env.VITE_API_URL}/api/progress/current-day`);

            // Add cohort parameter for staff/admin if selected
            if (stryMutAct_9fa48("797") ? user?.role === 'staff' || user?.role === 'admin' || cohortFilter : stryMutAct_9fa48("796") ? false : stryMutAct_9fa48("795") ? true : (stryCov_9fa48("795", "796", "797"), (stryMutAct_9fa48("799") ? user?.role === 'staff' && user?.role === 'admin' : stryMutAct_9fa48("798") ? true : (stryCov_9fa48("798", "799"), (stryMutAct_9fa48("801") ? user?.role !== 'staff' : stryMutAct_9fa48("800") ? false : (stryCov_9fa48("800", "801"), (stryMutAct_9fa48("802") ? user.role : (stryCov_9fa48("802"), user?.role)) === (stryMutAct_9fa48("803") ? "" : (stryCov_9fa48("803"), 'staff')))) || (stryMutAct_9fa48("805") ? user?.role !== 'admin' : stryMutAct_9fa48("804") ? false : (stryCov_9fa48("804", "805"), (stryMutAct_9fa48("806") ? user.role : (stryCov_9fa48("806"), user?.role)) === (stryMutAct_9fa48("807") ? "" : (stryCov_9fa48("807"), 'admin')))))) && cohortFilter)) {
              if (stryMutAct_9fa48("808")) {
                {}
              } else {
                stryCov_9fa48("808");
                url += stryMutAct_9fa48("809") ? `` : (stryCov_9fa48("809"), `?cohort=${encodeURIComponent(cohortFilter)}`);
              }
            }
            const response = await fetch(url, stryMutAct_9fa48("810") ? {} : (stryCov_9fa48("810"), {
              headers: stryMutAct_9fa48("811") ? {} : (stryCov_9fa48("811"), {
                'Authorization': stryMutAct_9fa48("812") ? `` : (stryCov_9fa48("812"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("815") ? false : stryMutAct_9fa48("814") ? true : stryMutAct_9fa48("813") ? response.ok : (stryCov_9fa48("813", "814", "815"), !response.ok)) {
              if (stryMutAct_9fa48("816")) {
                {}
              } else {
                stryCov_9fa48("816");
                const errorData = await response.json().catch(stryMutAct_9fa48("817") ? () => undefined : (stryCov_9fa48("817"), () => ({})));
                const error = new Error(stryMutAct_9fa48("820") ? errorData.error && 'Failed to fetch dashboard data' : stryMutAct_9fa48("819") ? false : stryMutAct_9fa48("818") ? true : (stryCov_9fa48("818", "819", "820"), errorData.error || (stryMutAct_9fa48("821") ? "" : (stryCov_9fa48("821"), 'Failed to fetch dashboard data'))));
                error.response = stryMutAct_9fa48("822") ? {} : (stryCov_9fa48("822"), {
                  status: response.status,
                  data: errorData
                });
                throw error;
              }
            }
            const data = await response.json();
            if (stryMutAct_9fa48("825") ? data.message !== 'No schedule for today' : stryMutAct_9fa48("824") ? false : stryMutAct_9fa48("823") ? true : (stryCov_9fa48("823", "824", "825"), data.message === (stryMutAct_9fa48("826") ? "" : (stryCov_9fa48("826"), 'No schedule for today')))) {
              if (stryMutAct_9fa48("827")) {
                {}
              } else {
                stryCov_9fa48("827");
                setIsLoading(stryMutAct_9fa48("828") ? true : (stryCov_9fa48("828"), false));
                return;
              }
            }

            // Process the data
            const timeBlocks = stryMutAct_9fa48("831") ? data.timeBlocks && [] : stryMutAct_9fa48("830") ? false : stryMutAct_9fa48("829") ? true : (stryCov_9fa48("829", "830", "831"), data.timeBlocks || (stryMutAct_9fa48("832") ? ["Stryker was here"] : (stryCov_9fa48("832"), [])));
            const taskProgress = Array.isArray(data.taskProgress) ? data.taskProgress : stryMutAct_9fa48("833") ? ["Stryker was here"] : (stryCov_9fa48("833"), []);

            // Extract tasks from all time blocks
            const allTasks = stryMutAct_9fa48("834") ? ["Stryker was here"] : (stryCov_9fa48("834"), []);
            timeBlocks.forEach(block => {
              if (stryMutAct_9fa48("835")) {
                {}
              } else {
                stryCov_9fa48("835");
                // Add tasks with their completion status
                block.tasks.forEach(task => {
                  if (stryMutAct_9fa48("836")) {
                    {}
                  } else {
                    stryCov_9fa48("836");
                    const taskCompleted = stryMutAct_9fa48("839") ? taskProgress.find(progress => progress.task_id === task.id)?.status !== 'completed' : stryMutAct_9fa48("838") ? false : stryMutAct_9fa48("837") ? true : (stryCov_9fa48("837", "838", "839"), (stryMutAct_9fa48("840") ? taskProgress.find(progress => progress.task_id === task.id).status : (stryCov_9fa48("840"), taskProgress.find(stryMutAct_9fa48("841") ? () => undefined : (stryCov_9fa48("841"), progress => stryMutAct_9fa48("844") ? progress.task_id !== task.id : stryMutAct_9fa48("843") ? false : stryMutAct_9fa48("842") ? true : (stryCov_9fa48("842", "843", "844"), progress.task_id === task.id)))?.status)) === (stryMutAct_9fa48("845") ? "" : (stryCov_9fa48("845"), 'completed')));
                    allTasks.push(stryMutAct_9fa48("846") ? {} : (stryCov_9fa48("846"), {
                      id: task.id,
                      time: formatTime(block.start_time),
                      title: task.task_title,
                      duration: stryMutAct_9fa48("847") ? `` : (stryCov_9fa48("847"), `${task.duration_minutes} min`),
                      type: task.task_type,
                      completed: taskCompleted
                    }));
                  }
                });
              }
            });

            // Set state with the processed data
            setCurrentDay(stryMutAct_9fa48("850") ? data.day && {} : stryMutAct_9fa48("849") ? false : stryMutAct_9fa48("848") ? true : (stryCov_9fa48("848", "849", "850"), data.day || {}));
            setDailyTasks(allTasks);

            // Get learning objectives from the day object
            const dayObjectives = (stryMutAct_9fa48("853") ? data.day || data.day.learning_objectives : stryMutAct_9fa48("852") ? false : stryMutAct_9fa48("851") ? true : (stryCov_9fa48("851", "852", "853"), data.day && data.day.learning_objectives)) ? data.day.learning_objectives : stryMutAct_9fa48("854") ? ["Stryker was here"] : (stryCov_9fa48("854"), []);
            setObjectives(dayObjectives);

            // Set missed assignments count
            setMissedAssignmentsCount(stryMutAct_9fa48("857") ? data.missedAssignmentsCount && 0 : stryMutAct_9fa48("856") ? false : stryMutAct_9fa48("855") ? true : (stryCov_9fa48("855", "856", "857"), data.missedAssignmentsCount || 0));

            // Set level, week, and weekly goal
            if (stryMutAct_9fa48("859") ? false : stryMutAct_9fa48("858") ? true : (stryCov_9fa48("858", "859"), data.day)) {
              if (stryMutAct_9fa48("860")) {
                {}
              } else {
                stryCov_9fa48("860");
                setCurrentLevel(stryMutAct_9fa48("863") ? data.day.level && 1 : stryMutAct_9fa48("862") ? false : stryMutAct_9fa48("861") ? true : (stryCov_9fa48("861", "862", "863"), data.day.level || 1));
                setCurrentWeek(data.day.week);
                setWeeklyGoal(stryMutAct_9fa48("866") ? data.day.weekly_goal && '' : stryMutAct_9fa48("865") ? false : stryMutAct_9fa48("864") ? true : (stryCov_9fa48("864", "865", "866"), data.day.weekly_goal || (stryMutAct_9fa48("867") ? "Stryker was here!" : (stryCov_9fa48("867"), ''))));

                // Preload all weeks and fetch current week data
                if (stryMutAct_9fa48("869") ? false : stryMutAct_9fa48("868") ? true : (stryCov_9fa48("868", "869"), data.day.week)) {
                  if (stryMutAct_9fa48("870")) {
                    {}
                  } else {
                    stryCov_9fa48("870");
                    // Preload all weeks in parallel (don't await)
                    preloadAllWeeks(data.day.week);

                    // Fetch current week data
                    await fetchWeekData(data.day.week);
                  }
                }
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("871")) {
            {}
          } else {
            stryCov_9fa48("871");
            console.error(stryMutAct_9fa48("872") ? "" : (stryCov_9fa48("872"), 'Error fetching dashboard data:'), error);
            setError(stryMutAct_9fa48("873") ? "" : (stryCov_9fa48("873"), 'Failed to load dashboard data. Please try again later.'));
          }
        } finally {
          if (stryMutAct_9fa48("874")) {
            {}
          } else {
            stryCov_9fa48("874");
            setIsLoading(stryMutAct_9fa48("875") ? true : (stryCov_9fa48("875"), false));
          }
        }
      }
    };

    // Preload all weeks data on initial load
    const preloadAllWeeks = async currentWeekNum => {
      if (stryMutAct_9fa48("876")) {
        {}
      } else {
        stryCov_9fa48("876");
        try {
          if (stryMutAct_9fa48("877")) {
            {}
          } else {
            stryCov_9fa48("877");
            const cohortParam = (stryMutAct_9fa48("880") ? user?.role === 'staff' || user?.role === 'admin' || cohortFilter : stryMutAct_9fa48("879") ? false : stryMutAct_9fa48("878") ? true : (stryCov_9fa48("878", "879", "880"), (stryMutAct_9fa48("882") ? user?.role === 'staff' && user?.role === 'admin' : stryMutAct_9fa48("881") ? true : (stryCov_9fa48("881", "882"), (stryMutAct_9fa48("884") ? user?.role !== 'staff' : stryMutAct_9fa48("883") ? false : (stryCov_9fa48("883", "884"), (stryMutAct_9fa48("885") ? user.role : (stryCov_9fa48("885"), user?.role)) === (stryMutAct_9fa48("886") ? "" : (stryCov_9fa48("886"), 'staff')))) || (stryMutAct_9fa48("888") ? user?.role !== 'admin' : stryMutAct_9fa48("887") ? false : (stryCov_9fa48("887", "888"), (stryMutAct_9fa48("889") ? user.role : (stryCov_9fa48("889"), user?.role)) === (stryMutAct_9fa48("890") ? "" : (stryCov_9fa48("890"), 'admin')))))) && cohortFilter)) ? stryMutAct_9fa48("891") ? `` : (stryCov_9fa48("891"), `?cohort=${encodeURIComponent(cohortFilter)}`) : stryMutAct_9fa48("892") ? "Stryker was here!" : (stryCov_9fa48("892"), '');

            // Fetch weeks 1 through current week
            const weekPromises = stryMutAct_9fa48("893") ? ["Stryker was here"] : (stryCov_9fa48("893"), []);
            for (let week = 1; stryMutAct_9fa48("896") ? week > currentWeekNum : stryMutAct_9fa48("895") ? week < currentWeekNum : stryMutAct_9fa48("894") ? false : (stryCov_9fa48("894", "895", "896"), week <= currentWeekNum); stryMutAct_9fa48("897") ? week-- : (stryCov_9fa48("897"), week++)) {
              if (stryMutAct_9fa48("898")) {
                {}
              } else {
                stryCov_9fa48("898");
                weekPromises.push(fetch(stryMutAct_9fa48("899") ? `` : (stryCov_9fa48("899"), `${import.meta.env.VITE_API_URL}/api/curriculum/weeks/${week}${cohortParam}`), stryMutAct_9fa48("900") ? {} : (stryCov_9fa48("900"), {
                  headers: stryMutAct_9fa48("901") ? {} : (stryCov_9fa48("901"), {
                    'Authorization': stryMutAct_9fa48("902") ? `` : (stryCov_9fa48("902"), `Bearer ${token}`)
                  })
                })).then(stryMutAct_9fa48("903") ? () => undefined : (stryCov_9fa48("903"), res => res.ok ? res.json() : null)));
              }
            }
            const allWeeksData = await Promise.all(weekPromises);

            // Build cache object
            const cache = {};
            allWeeksData.forEach((days, index) => {
              if (stryMutAct_9fa48("904")) {
                {}
              } else {
                stryCov_9fa48("904");
                if (stryMutAct_9fa48("906") ? false : stryMutAct_9fa48("905") ? true : (stryCov_9fa48("905", "906"), days)) {
                  if (stryMutAct_9fa48("907")) {
                    {}
                  } else {
                    stryCov_9fa48("907");
                    cache[stryMutAct_9fa48("908") ? index - 1 : (stryCov_9fa48("908"), index + 1)] = days; // week number is index + 1
                  }
                }
              }
            });
            setWeekCache(cache);
          }
        } catch (error) {
          if (stryMutAct_9fa48("909")) {
            {}
          } else {
            stryCov_9fa48("909");
            console.error(stryMutAct_9fa48("910") ? "" : (stryCov_9fa48("910"), 'Error preloading weeks:'), error);
          }
        }
      }
    };
    const fetchWeekData = async weekNumber => {
      if (stryMutAct_9fa48("911")) {
        {}
      } else {
        stryCov_9fa48("911");
        try {
          if (stryMutAct_9fa48("912")) {
            {}
          } else {
            stryCov_9fa48("912");
            // Check cache first
            if (stryMutAct_9fa48("914") ? false : stryMutAct_9fa48("913") ? true : (stryCov_9fa48("913", "914"), weekCache[weekNumber])) {
              if (stryMutAct_9fa48("915")) {
                {}
              } else {
                stryCov_9fa48("915");
                const days = weekCache[weekNumber];
                setWeekData(days);

                // Update weekly goal from the first day of the week
                if (stryMutAct_9fa48("918") ? days && days.length > 0 || days[0].weekly_goal : stryMutAct_9fa48("917") ? false : stryMutAct_9fa48("916") ? true : (stryCov_9fa48("916", "917", "918"), (stryMutAct_9fa48("920") ? days || days.length > 0 : stryMutAct_9fa48("919") ? true : (stryCov_9fa48("919", "920"), days && (stryMutAct_9fa48("923") ? days.length <= 0 : stryMutAct_9fa48("922") ? days.length >= 0 : stryMutAct_9fa48("921") ? true : (stryCov_9fa48("921", "922", "923"), days.length > 0)))) && days[0].weekly_goal)) {
                  if (stryMutAct_9fa48("924")) {
                    {}
                  } else {
                    stryCov_9fa48("924");
                    setWeeklyGoal(days[0].weekly_goal);
                  }
                }
                return;
              }
            }

            // If not in cache, fetch it
            const cohortParam = (stryMutAct_9fa48("927") ? user?.role === 'staff' || user?.role === 'admin' || cohortFilter : stryMutAct_9fa48("926") ? false : stryMutAct_9fa48("925") ? true : (stryCov_9fa48("925", "926", "927"), (stryMutAct_9fa48("929") ? user?.role === 'staff' && user?.role === 'admin' : stryMutAct_9fa48("928") ? true : (stryCov_9fa48("928", "929"), (stryMutAct_9fa48("931") ? user?.role !== 'staff' : stryMutAct_9fa48("930") ? false : (stryCov_9fa48("930", "931"), (stryMutAct_9fa48("932") ? user.role : (stryCov_9fa48("932"), user?.role)) === (stryMutAct_9fa48("933") ? "" : (stryCov_9fa48("933"), 'staff')))) || (stryMutAct_9fa48("935") ? user?.role !== 'admin' : stryMutAct_9fa48("934") ? false : (stryCov_9fa48("934", "935"), (stryMutAct_9fa48("936") ? user.role : (stryCov_9fa48("936"), user?.role)) === (stryMutAct_9fa48("937") ? "" : (stryCov_9fa48("937"), 'admin')))))) && cohortFilter)) ? stryMutAct_9fa48("938") ? `` : (stryCov_9fa48("938"), `?cohort=${encodeURIComponent(cohortFilter)}`) : stryMutAct_9fa48("939") ? "Stryker was here!" : (stryCov_9fa48("939"), '');
            const response = await fetch(stryMutAct_9fa48("940") ? `` : (stryCov_9fa48("940"), `${import.meta.env.VITE_API_URL}/api/curriculum/weeks/${weekNumber}${cohortParam}`), stryMutAct_9fa48("941") ? {} : (stryCov_9fa48("941"), {
              headers: stryMutAct_9fa48("942") ? {} : (stryCov_9fa48("942"), {
                'Authorization': stryMutAct_9fa48("943") ? `` : (stryCov_9fa48("943"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("946") ? false : stryMutAct_9fa48("945") ? true : stryMutAct_9fa48("944") ? response.ok : (stryCov_9fa48("944", "945", "946"), !response.ok)) {
              if (stryMutAct_9fa48("947")) {
                {}
              } else {
                stryCov_9fa48("947");
                throw new Error(stryMutAct_9fa48("948") ? "" : (stryCov_9fa48("948"), 'Failed to fetch week data'));
              }
            }
            const days = await response.json();
            setWeekData(days);

            // Add to cache
            setWeekCache(stryMutAct_9fa48("949") ? () => undefined : (stryCov_9fa48("949"), prev => stryMutAct_9fa48("950") ? {} : (stryCov_9fa48("950"), {
              ...prev,
              [weekNumber]: days
            })));

            // Update weekly goal from the first day of the week
            if (stryMutAct_9fa48("953") ? days && days.length > 0 || days[0].weekly_goal : stryMutAct_9fa48("952") ? false : stryMutAct_9fa48("951") ? true : (stryCov_9fa48("951", "952", "953"), (stryMutAct_9fa48("955") ? days || days.length > 0 : stryMutAct_9fa48("954") ? true : (stryCov_9fa48("954", "955"), days && (stryMutAct_9fa48("958") ? days.length <= 0 : stryMutAct_9fa48("957") ? days.length >= 0 : stryMutAct_9fa48("956") ? true : (stryCov_9fa48("956", "957", "958"), days.length > 0)))) && days[0].weekly_goal)) {
              if (stryMutAct_9fa48("959")) {
                {}
              } else {
                stryCov_9fa48("959");
                setWeeklyGoal(days[0].weekly_goal);
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("960")) {
            {}
          } else {
            stryCov_9fa48("960");
            console.error(stryMutAct_9fa48("961") ? "" : (stryCov_9fa48("961"), 'Error fetching week data:'), error);
          }
        }
      }
    };
    const navigateToWeek = async direction => {
      if (stryMutAct_9fa48("962")) {
        {}
      } else {
        stryCov_9fa48("962");
        if (stryMutAct_9fa48("965") ? !currentWeek && isLoadingWeek : stryMutAct_9fa48("964") ? false : stryMutAct_9fa48("963") ? true : (stryCov_9fa48("963", "964", "965"), (stryMutAct_9fa48("966") ? currentWeek : (stryCov_9fa48("966"), !currentWeek)) || isLoadingWeek)) return;
        const newWeek = (stryMutAct_9fa48("969") ? direction !== 'prev' : stryMutAct_9fa48("968") ? false : stryMutAct_9fa48("967") ? true : (stryCov_9fa48("967", "968", "969"), direction === (stryMutAct_9fa48("970") ? "" : (stryCov_9fa48("970"), 'prev')))) ? stryMutAct_9fa48("971") ? currentWeek + 1 : (stryCov_9fa48("971"), currentWeek - 1) : stryMutAct_9fa48("972") ? currentWeek - 1 : (stryCov_9fa48("972"), currentWeek + 1);

        // Don't go below week 1
        if (stryMutAct_9fa48("976") ? newWeek >= 1 : stryMutAct_9fa48("975") ? newWeek <= 1 : stryMutAct_9fa48("974") ? false : stryMutAct_9fa48("973") ? true : (stryCov_9fa48("973", "974", "975", "976"), newWeek < 1)) return;

        // Don't go past the current week (the week from currentDay)
        if (stryMutAct_9fa48("979") ? direction === 'next' && currentDay?.week || newWeek > currentDay.week : stryMutAct_9fa48("978") ? false : stryMutAct_9fa48("977") ? true : (stryCov_9fa48("977", "978", "979"), (stryMutAct_9fa48("981") ? direction === 'next' || currentDay?.week : stryMutAct_9fa48("980") ? true : (stryCov_9fa48("980", "981"), (stryMutAct_9fa48("983") ? direction !== 'next' : stryMutAct_9fa48("982") ? true : (stryCov_9fa48("982", "983"), direction === (stryMutAct_9fa48("984") ? "" : (stryCov_9fa48("984"), 'next')))) && (stryMutAct_9fa48("985") ? currentDay.week : (stryCov_9fa48("985"), currentDay?.week)))) && (stryMutAct_9fa48("988") ? newWeek <= currentDay.week : stryMutAct_9fa48("987") ? newWeek >= currentDay.week : stryMutAct_9fa48("986") ? true : (stryCov_9fa48("986", "987", "988"), newWeek > currentDay.week)))) {
          if (stryMutAct_9fa48("989")) {
            {}
          } else {
            stryCov_9fa48("989");
            return;
          }
        }
        console.log(stryMutAct_9fa48("990") ? "" : (stryCov_9fa48("990"), '🎬 Navigate to week:'), direction, stryMutAct_9fa48("991") ? "" : (stryCov_9fa48("991"), 'New week:'), newWeek);

        // Phase 1: Slide out old cards
        const slideOutDirection = (stryMutAct_9fa48("994") ? direction !== 'prev' : stryMutAct_9fa48("993") ? false : stryMutAct_9fa48("992") ? true : (stryCov_9fa48("992", "993", "994"), direction === (stryMutAct_9fa48("995") ? "" : (stryCov_9fa48("995"), 'prev')))) ? stryMutAct_9fa48("996") ? "" : (stryCov_9fa48("996"), 'out-left') : stryMutAct_9fa48("997") ? "" : (stryCov_9fa48("997"), 'out-right');
        setSlideDirection(slideOutDirection);
        console.log(stryMutAct_9fa48("998") ? "" : (stryCov_9fa48("998"), '📤 Slide OUT direction:'), slideOutDirection);

        // Wait for slide-out animation (0.6s animation + 0.4s for 5 card stagger)
        await new Promise(stryMutAct_9fa48("999") ? () => undefined : (stryCov_9fa48("999"), resolve => setTimeout(resolve, 1000)));

        // Phase 2: Fetch new data while cards are off-screen
        setCurrentWeek(newWeek);
        await fetchWeekData(newWeek);

        // Phase 3: Slide in new cards from opposite direction
        const slideInDirection = (stryMutAct_9fa48("1002") ? direction !== 'prev' : stryMutAct_9fa48("1001") ? false : stryMutAct_9fa48("1000") ? true : (stryCov_9fa48("1000", "1001", "1002"), direction === (stryMutAct_9fa48("1003") ? "" : (stryCov_9fa48("1003"), 'prev')))) ? stryMutAct_9fa48("1004") ? "" : (stryCov_9fa48("1004"), 'in-from-right') : stryMutAct_9fa48("1005") ? "" : (stryCov_9fa48("1005"), 'in-from-left');
        console.log(stryMutAct_9fa48("1006") ? "" : (stryCov_9fa48("1006"), '📥 Slide IN direction:'), slideInDirection);
        setSlideDirection(slideInDirection);
        setIsLoadingWeek(stryMutAct_9fa48("1007") ? true : (stryCov_9fa48("1007"), false));

        // Reset after slide-in completes (0.6s animation + 0.4s stagger)
        setTimeout(() => {
          if (stryMutAct_9fa48("1008")) {
            {}
          } else {
            stryCov_9fa48("1008");
            console.log(stryMutAct_9fa48("1009") ? "" : (stryCov_9fa48("1009"), '✅ Animation complete, resetting'));
            setSlideDirection(null);
          }
        }, 1000);
      }
    };

    // Handle continue session button click
    const handleContinueSession = () => {
      if (stryMutAct_9fa48("1010")) {
        {}
      } else {
        stryCov_9fa48("1010");
        if (stryMutAct_9fa48("1013") ? false : stryMutAct_9fa48("1012") ? true : stryMutAct_9fa48("1011") ? isActive : (stryCov_9fa48("1011", "1012", "1013"), !isActive)) {
          if (stryMutAct_9fa48("1014")) {
            {}
          } else {
            stryCov_9fa48("1014");
            setError(stryMutAct_9fa48("1015") ? "" : (stryCov_9fa48("1015"), 'You have historical access only and cannot access new learning sessions.'));
            return;
          }
        }
        const cohortParam = (stryMutAct_9fa48("1018") ? user?.role === 'staff' || user?.role === 'admin' || cohortFilter : stryMutAct_9fa48("1017") ? false : stryMutAct_9fa48("1016") ? true : (stryCov_9fa48("1016", "1017", "1018"), (stryMutAct_9fa48("1020") ? user?.role === 'staff' && user?.role === 'admin' : stryMutAct_9fa48("1019") ? true : (stryCov_9fa48("1019", "1020"), (stryMutAct_9fa48("1022") ? user?.role !== 'staff' : stryMutAct_9fa48("1021") ? false : (stryCov_9fa48("1021", "1022"), (stryMutAct_9fa48("1023") ? user.role : (stryCov_9fa48("1023"), user?.role)) === (stryMutAct_9fa48("1024") ? "" : (stryCov_9fa48("1024"), 'staff')))) || (stryMutAct_9fa48("1026") ? user?.role !== 'admin' : stryMutAct_9fa48("1025") ? false : (stryCov_9fa48("1025", "1026"), (stryMutAct_9fa48("1027") ? user.role : (stryCov_9fa48("1027"), user?.role)) === (stryMutAct_9fa48("1028") ? "" : (stryCov_9fa48("1028"), 'admin')))))) && cohortFilter)) ? stryMutAct_9fa48("1029") ? `` : (stryCov_9fa48("1029"), `?cohort=${encodeURIComponent(cohortFilter)}`) : stryMutAct_9fa48("1030") ? "Stryker was here!" : (stryCov_9fa48("1030"), '');
        navigate(stryMutAct_9fa48("1031") ? `` : (stryCov_9fa48("1031"), `/learning${cohortParam}`));
      }
    };

    // Navigate to the specific task in the Learning page
    const navigateToTask = taskId => {
      if (stryMutAct_9fa48("1032")) {
        {}
      } else {
        stryCov_9fa48("1032");
        if (stryMutAct_9fa48("1035") ? false : stryMutAct_9fa48("1034") ? true : stryMutAct_9fa48("1033") ? isActive : (stryCov_9fa48("1033", "1034", "1035"), !isActive)) {
          if (stryMutAct_9fa48("1036")) {
            {}
          } else {
            stryCov_9fa48("1036");
            setError(stryMutAct_9fa48("1037") ? "" : (stryCov_9fa48("1037"), 'You have historical access only and cannot access new learning sessions.'));
            return;
          }
        }
        const cohortParam = (stryMutAct_9fa48("1040") ? user?.role === 'staff' || user?.role === 'admin' || cohortFilter : stryMutAct_9fa48("1039") ? false : stryMutAct_9fa48("1038") ? true : (stryCov_9fa48("1038", "1039", "1040"), (stryMutAct_9fa48("1042") ? user?.role === 'staff' && user?.role === 'admin' : stryMutAct_9fa48("1041") ? true : (stryCov_9fa48("1041", "1042"), (stryMutAct_9fa48("1044") ? user?.role !== 'staff' : stryMutAct_9fa48("1043") ? false : (stryCov_9fa48("1043", "1044"), (stryMutAct_9fa48("1045") ? user.role : (stryCov_9fa48("1045"), user?.role)) === (stryMutAct_9fa48("1046") ? "" : (stryCov_9fa48("1046"), 'staff')))) || (stryMutAct_9fa48("1048") ? user?.role !== 'admin' : stryMutAct_9fa48("1047") ? false : (stryCov_9fa48("1047", "1048"), (stryMutAct_9fa48("1049") ? user.role : (stryCov_9fa48("1049"), user?.role)) === (stryMutAct_9fa48("1050") ? "" : (stryCov_9fa48("1050"), 'admin')))))) && cohortFilter)) ? stryMutAct_9fa48("1051") ? `` : (stryCov_9fa48("1051"), `&cohort=${encodeURIComponent(cohortFilter)}`) : stryMutAct_9fa48("1052") ? "Stryker was here!" : (stryCov_9fa48("1052"), '');
        navigate(stryMutAct_9fa48("1053") ? `` : (stryCov_9fa48("1053"), `/learning?taskId=${taskId}${cohortParam}`));
      }
    };

    // Navigate to calendar for historical viewing
    const navigateToCalendar = () => {
      if (stryMutAct_9fa48("1054")) {
        {}
      } else {
        stryCov_9fa48("1054");
        navigate(stryMutAct_9fa48("1055") ? "" : (stryCov_9fa48("1055"), '/calendar'));
      }
    };

    // Add a helper function to format time from 24-hour to 12-hour format
    const formatTime = timeString => {
      if (stryMutAct_9fa48("1056")) {
        {}
      } else {
        stryCov_9fa48("1056");
        if (stryMutAct_9fa48("1059") ? false : stryMutAct_9fa48("1058") ? true : stryMutAct_9fa48("1057") ? timeString : (stryCov_9fa48("1057", "1058", "1059"), !timeString)) return stryMutAct_9fa48("1060") ? "Stryker was here!" : (stryCov_9fa48("1060"), '');
        const timeParts = timeString.split(stryMutAct_9fa48("1061") ? "" : (stryCov_9fa48("1061"), ':'));
        const hours = parseInt(timeParts[0], 10);
        const minutes = timeParts[1];
        const period = (stryMutAct_9fa48("1065") ? hours < 12 : stryMutAct_9fa48("1064") ? hours > 12 : stryMutAct_9fa48("1063") ? false : stryMutAct_9fa48("1062") ? true : (stryCov_9fa48("1062", "1063", "1064", "1065"), hours >= 12)) ? stryMutAct_9fa48("1066") ? "" : (stryCov_9fa48("1066"), 'PM') : stryMutAct_9fa48("1067") ? "" : (stryCov_9fa48("1067"), 'AM');
        const formattedHours = stryMutAct_9fa48("1070") ? hours % 12 && 12 : stryMutAct_9fa48("1069") ? false : stryMutAct_9fa48("1068") ? true : (stryCov_9fa48("1068", "1069", "1070"), (stryMutAct_9fa48("1071") ? hours * 12 : (stryCov_9fa48("1071"), hours % 12)) || 12);
        return stryMutAct_9fa48("1072") ? `` : (stryCov_9fa48("1072"), `${formattedHours}:${minutes} ${period}`);
      }
    };

    // Format date for display (e.g., "10.2 SAT" or "TODAY 10.22 MON")
    const formatDayDate = (dateString, isToday = stryMutAct_9fa48("1073") ? true : (stryCov_9fa48("1073"), false)) => {
      if (stryMutAct_9fa48("1074")) {
        {}
      } else {
        stryCov_9fa48("1074");
        if (stryMutAct_9fa48("1077") ? false : stryMutAct_9fa48("1076") ? true : stryMutAct_9fa48("1075") ? dateString : (stryCov_9fa48("1075", "1076", "1077"), !dateString)) return stryMutAct_9fa48("1078") ? {} : (stryCov_9fa48("1078"), {
          prefix: stryMutAct_9fa48("1079") ? "Stryker was here!" : (stryCov_9fa48("1079"), ''),
          date: stryMutAct_9fa48("1080") ? "Stryker was here!" : (stryCov_9fa48("1080"), ''),
          full: stryMutAct_9fa48("1081") ? "Stryker was here!" : (stryCov_9fa48("1081"), '')
        });
        // Handle ISO timestamps or simple date strings
        const date = new Date(dateString);
        const month = stryMutAct_9fa48("1082") ? date.getMonth() - 1 : (stryCov_9fa48("1082"), date.getMonth() + 1);
        const day = date.getDate();
        const dayOfWeek = stryMutAct_9fa48("1083") ? date.toLocaleDateString('en-US', {
          weekday: 'short'
        }).toLowerCase() : (stryCov_9fa48("1083"), date.toLocaleDateString(stryMutAct_9fa48("1084") ? "" : (stryCov_9fa48("1084"), 'en-US'), stryMutAct_9fa48("1085") ? {} : (stryCov_9fa48("1085"), {
          weekday: stryMutAct_9fa48("1086") ? "" : (stryCov_9fa48("1086"), 'short')
        })).toUpperCase());
        const dateStr = stryMutAct_9fa48("1087") ? `` : (stryCov_9fa48("1087"), `${month}.${day} ${dayOfWeek}`);
        if (stryMutAct_9fa48("1089") ? false : stryMutAct_9fa48("1088") ? true : (stryCov_9fa48("1088", "1089"), isToday)) {
          if (stryMutAct_9fa48("1090")) {
            {}
          } else {
            stryCov_9fa48("1090");
            return stryMutAct_9fa48("1091") ? {} : (stryCov_9fa48("1091"), {
              prefix: stryMutAct_9fa48("1092") ? "" : (stryCov_9fa48("1092"), 'TODAY '),
              date: dateStr,
              full: stryMutAct_9fa48("1093") ? `` : (stryCov_9fa48("1093"), `TODAY ${dateStr}`)
            });
          }
        }
        return stryMutAct_9fa48("1094") ? {} : (stryCov_9fa48("1094"), {
          prefix: stryMutAct_9fa48("1095") ? "Stryker was here!" : (stryCov_9fa48("1095"), ''),
          date: dateStr,
          full: dateStr
        });
      }
    };

    // Check if a date is today
    const isDateToday = dateString => {
      if (stryMutAct_9fa48("1096")) {
        {}
      } else {
        stryCov_9fa48("1096");
        if (stryMutAct_9fa48("1099") ? false : stryMutAct_9fa48("1098") ? true : stryMutAct_9fa48("1097") ? dateString : (stryCov_9fa48("1097", "1098", "1099"), !dateString)) return stryMutAct_9fa48("1100") ? true : (stryCov_9fa48("1100"), false);
        const date = new Date(dateString);
        const today = new Date();
        return stryMutAct_9fa48("1103") ? date.getDate() === today.getDate() && date.getMonth() === today.getMonth() || date.getFullYear() === today.getFullYear() : stryMutAct_9fa48("1102") ? false : stryMutAct_9fa48("1101") ? true : (stryCov_9fa48("1101", "1102", "1103"), (stryMutAct_9fa48("1105") ? date.getDate() === today.getDate() || date.getMonth() === today.getMonth() : stryMutAct_9fa48("1104") ? true : (stryCov_9fa48("1104", "1105"), (stryMutAct_9fa48("1107") ? date.getDate() !== today.getDate() : stryMutAct_9fa48("1106") ? true : (stryCov_9fa48("1106", "1107"), date.getDate() === today.getDate())) && (stryMutAct_9fa48("1109") ? date.getMonth() !== today.getMonth() : stryMutAct_9fa48("1108") ? true : (stryCov_9fa48("1108", "1109"), date.getMonth() === today.getMonth())))) && (stryMutAct_9fa48("1111") ? date.getFullYear() !== today.getFullYear() : stryMutAct_9fa48("1110") ? true : (stryCov_9fa48("1110", "1111"), date.getFullYear() === today.getFullYear())));
      }
    };

    // Check if date is in the past
    const isDatePast = dateString => {
      if (stryMutAct_9fa48("1112")) {
        {}
      } else {
        stryCov_9fa48("1112");
        if (stryMutAct_9fa48("1115") ? false : stryMutAct_9fa48("1114") ? true : stryMutAct_9fa48("1113") ? dateString : (stryCov_9fa48("1113", "1114", "1115"), !dateString)) return stryMutAct_9fa48("1116") ? true : (stryCov_9fa48("1116"), false);
        const date = new Date(dateString);
        const today = new Date();
        stryMutAct_9fa48("1117") ? today.setMinutes(0, 0, 0, 0) : (stryCov_9fa48("1117"), today.setHours(0, 0, 0, 0));
        return stryMutAct_9fa48("1121") ? date >= today : stryMutAct_9fa48("1120") ? date <= today : stryMutAct_9fa48("1119") ? false : stryMutAct_9fa48("1118") ? true : (stryCov_9fa48("1118", "1119", "1120", "1121"), date < today);
      }
    };

    // Navigate to volunteer feedback
    const navigateToVolunteerFeedback = () => {
      if (stryMutAct_9fa48("1122")) {
        {}
      } else {
        stryCov_9fa48("1122");
        navigate(stryMutAct_9fa48("1123") ? "" : (stryCov_9fa48("1123"), '/volunteer-feedback'));
      }
    };

    // Handle opening missed assignments sidebar
    const handleMissedAssignmentsClick = () => {
      if (stryMutAct_9fa48("1124")) {
        {}
      } else {
        stryCov_9fa48("1124");
        setIsSidebarOpen(stryMutAct_9fa48("1125") ? false : (stryCov_9fa48("1125"), true));
      }
    };

    // Handle closing sidebar
    const handleCloseSidebar = () => {
      if (stryMutAct_9fa48("1126")) {
        {}
      } else {
        stryCov_9fa48("1126");
        setIsSidebarOpen(stryMutAct_9fa48("1127") ? true : (stryCov_9fa48("1127"), false));
      }
    };

    // Handle navigation from sidebar to specific day/task
    const handleNavigateToDay = (dayId, taskId) => {
      if (stryMutAct_9fa48("1128")) {
        {}
      } else {
        stryCov_9fa48("1128");
        // Navigate to the day view with the task highlighted
        navigate(stryMutAct_9fa48("1129") ? `` : (stryCov_9fa48("1129"), `/calendar?day=${dayId}&task=${taskId}`));
      }
    };

    // Render skeleton loading cards
    const renderSkeletonCards = () => {
      if (stryMutAct_9fa48("1130")) {
        {}
      } else {
        stryCov_9fa48("1130");
        return stryMutAct_9fa48("1131") ? Array().fill(0).map((_, index) => <div key={`skeleton-${index}`} className="dashboard__day-card dashboard__day-card--skeleton">
        <div className="skeleton-line skeleton-date"></div>
        <div className="skeleton-divider"></div>
        <div className="skeleton-section">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line skeleton-short"></div>
        </div>
        <div className="skeleton-section">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line"></div>
        </div>
      </div>) : (stryCov_9fa48("1131"), Array(5).fill(0).map(stryMutAct_9fa48("1132") ? () => undefined : (stryCov_9fa48("1132"), (_, index) => <div key={stryMutAct_9fa48("1133") ? `` : (stryCov_9fa48("1133"), `skeleton-${index}`)} className="dashboard__day-card dashboard__day-card--skeleton">
        <div className="skeleton-line skeleton-date"></div>
        <div className="skeleton-divider"></div>
        <div className="skeleton-section">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line skeleton-short"></div>
        </div>
        <div className="skeleton-section">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line"></div>
        </div>
      </div>)));
      }
    };

    // Render historical access view
    const renderHistoricalView = () => {
      if (stryMutAct_9fa48("1134")) {
        {}
      } else {
        stryCov_9fa48("1134");
        return <div className="flex items-center justify-center min-h-screen p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Historical Access Only</CardTitle>
            <CardDescription>
              You have historical access only. You can view your past activities but cannot 
              participate in new sessions. Please visit the calendar to access your completed work.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={navigateToCalendar}>
              <Calendar className="h-4 w-4 mr-2" />
              View Past Sessions
            </Button>
          </CardContent>
        </Card>
      </div>;
      }
    };

    // Render volunteer dashboard view
    const renderVolunteerView = () => {
      if (stryMutAct_9fa48("1135")) {
        {}
      } else {
        stryCov_9fa48("1135");
        return <div className="flex items-center justify-center min-h-screen p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome, Volunteer!</CardTitle>
            <CardDescription>
              Thank you for volunteering with us. You can provide feedback on learner sessions below.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={navigateToVolunteerFeedback}>
              <BookOpen className="h-4 w-4 mr-2" />
              Go to Volunteer Feedback
            </Button>
          </CardContent>
        </Card>
      </div>;
      }
    };

    // Mock data for the Figma wireframe
    const upcomingEvents = stryMutAct_9fa48("1136") ? [] : (stryCov_9fa48("1136"), [stryMutAct_9fa48("1137") ? {} : (stryCov_9fa48("1137"), {
      date: stryMutAct_9fa48("1138") ? "" : (stryCov_9fa48("1138"), "10.15.25"),
      title: stryMutAct_9fa48("1139") ? "" : (stryCov_9fa48("1139"), "Demo Day"),
      time: stryMutAct_9fa48("1140") ? "" : (stryCov_9fa48("1140"), "8:30PM - 11:00 PM"),
      location: stryMutAct_9fa48("1141") ? "" : (stryCov_9fa48("1141"), "Blackrock")
    }), stryMutAct_9fa48("1142") ? {} : (stryCov_9fa48("1142"), {
      date: stryMutAct_9fa48("1143") ? "" : (stryCov_9fa48("1143"), "10.25.25"),
      title: stryMutAct_9fa48("1144") ? "" : (stryCov_9fa48("1144"), "Fireside Chat with David Yang"),
      time: stryMutAct_9fa48("1145") ? "" : (stryCov_9fa48("1145"), "2:30PM - 4:00 PM"),
      location: stryMutAct_9fa48("1146") ? "" : (stryCov_9fa48("1146"), "Pursuit HQ")
    }), stryMutAct_9fa48("1147") ? {} : (stryCov_9fa48("1147"), {
      date: stryMutAct_9fa48("1148") ? "" : (stryCov_9fa48("1148"), "10.26.25"),
      title: stryMutAct_9fa48("1149") ? "" : (stryCov_9fa48("1149"), "Presentation"),
      time: stryMutAct_9fa48("1150") ? "" : (stryCov_9fa48("1150"), "8:30PM - 11:00 PM"),
      location: stryMutAct_9fa48("1151") ? "Stryker was here!" : (stryCov_9fa48("1151"), "")
    })]);

    // Render regular dashboard content matching the Figma wireframe
    const renderDashboardContent = () => {
      if (stryMutAct_9fa48("1152")) {
        {}
      } else {
        stryCov_9fa48("1152");
        return <div className="dashboard">
        {/* Desktop View */}
        <div className="dashboard__desktop hidden md:block">
          {/* Greeting Section */}
          <div className="dashboard__greeting">
            <h1 className="dashboard__greeting-text">
              Hey {stryMutAct_9fa48("1155") ? user?.firstName && 'there' : stryMutAct_9fa48("1154") ? false : stryMutAct_9fa48("1153") ? true : (stryCov_9fa48("1153", "1154", "1155"), (stryMutAct_9fa48("1156") ? user.firstName : (stryCov_9fa48("1156"), user?.firstName)) || (stryMutAct_9fa48("1157") ? "" : (stryCov_9fa48("1157"), 'there')))}. Good to see you!
            </h1>
            <button className={stryMutAct_9fa48("1158") ? `` : (stryCov_9fa48("1158"), `dashboard__missed-assignments ${(stryMutAct_9fa48("1162") ? missedAssignmentsCount <= 0 : stryMutAct_9fa48("1161") ? missedAssignmentsCount >= 0 : stryMutAct_9fa48("1160") ? false : stryMutAct_9fa48("1159") ? true : (stryCov_9fa48("1159", "1160", "1161", "1162"), missedAssignmentsCount > 0)) ? stryMutAct_9fa48("1163") ? "" : (stryCov_9fa48("1163"), 'dashboard__missed-assignments--active') : stryMutAct_9fa48("1164") ? "Stryker was here!" : (stryCov_9fa48("1164"), '')}`)} onClick={handleMissedAssignmentsClick}>
              <div className="dashboard__missed-icon" />
              <span>( {missedAssignmentsCount} ) missed assignments</span>
            </button>
          </div>
          
          {/* Top Grid: Today's Goal and Upcoming */}
          <div className="dashboard__top-grid">
            {/* Today's Goal Section */}
            <div className="dashboard__todays-goal">
              <h2 className="dashboard__section-title">Today's Goal</h2>
              <p className="dashboard__goal-text">
                {stryMutAct_9fa48("1167") ? currentDay?.daily_goal && 'No goal set for today' : stryMutAct_9fa48("1166") ? false : stryMutAct_9fa48("1165") ? true : (stryCov_9fa48("1165", "1166", "1167"), (stryMutAct_9fa48("1168") ? currentDay.daily_goal : (stryCov_9fa48("1168"), currentDay?.daily_goal)) || (stryMutAct_9fa48("1169") ? "" : (stryCov_9fa48("1169"), 'No goal set for today')))}
              </p>
              <button className="dashboard__start-btn" onClick={handleContinueSession}>Start</button>
            </div>

            {/* Vertical Divider */}
            <div className="dashboard__vertical-divider"></div>

            {/* Upcoming Section */}
            <div className="dashboard__upcoming">
              <h2 className="dashboard__section-title">Upcoming</h2>
              <div className="dashboard__upcoming-list">
                {upcomingEvents.map(stryMutAct_9fa48("1170") ? () => undefined : (stryCov_9fa48("1170"), (event, index) => <div key={index} className="dashboard__upcoming-item">
                    <div className="dashboard__upcoming-content">
                      <span className="dashboard__upcoming-date">{event.date}</span>
                      <div className="dashboard__upcoming-details">
                        <p className="dashboard__upcoming-title">{event.title}</p>
                        <p className="dashboard__upcoming-time">{event.time}</p>
                        {stryMutAct_9fa48("1173") ? event.location || <p className="dashboard__upcoming-location">{event.location}</p> : stryMutAct_9fa48("1172") ? false : stryMutAct_9fa48("1171") ? true : (stryCov_9fa48("1171", "1172", "1173"), event.location && <p className="dashboard__upcoming-location">{event.location}</p>)}
                      </div>
                    </div>
                    <button className="dashboard__signup-btn">Sign up</button>
                  </div>))}
              </div>
            </div>
          </div>

          {/* Divider 2 */}
          <div className="dashboard__divider-2" />

          {/* Week Header: Title and Date Picker */}
          <div className="dashboard__week-header">
            <div className="dashboard__week-title">
              <span className="dashboard__week-label">
                <span className="dashboard__week-level">L{currentLevel}</span>: Week {currentWeek}
              </span>
              <span className={stryMutAct_9fa48("1174") ? `` : (stryCov_9fa48("1174"), `dashboard__week-subtitle ${(stryMutAct_9fa48("1177") ? slideDirection !== 'out-left' : stryMutAct_9fa48("1176") ? false : stryMutAct_9fa48("1175") ? true : (stryCov_9fa48("1175", "1176", "1177"), slideDirection === (stryMutAct_9fa48("1178") ? "" : (stryCov_9fa48("1178"), 'out-left')))) ? stryMutAct_9fa48("1179") ? "" : (stryCov_9fa48("1179"), 'animate__animated animate__fadeOutLeft') : (stryMutAct_9fa48("1182") ? slideDirection !== 'out-right' : stryMutAct_9fa48("1181") ? false : stryMutAct_9fa48("1180") ? true : (stryCov_9fa48("1180", "1181", "1182"), slideDirection === (stryMutAct_9fa48("1183") ? "" : (stryCov_9fa48("1183"), 'out-right')))) ? stryMutAct_9fa48("1184") ? "" : (stryCov_9fa48("1184"), 'animate__animated animate__fadeOutRight') : (stryMutAct_9fa48("1187") ? slideDirection !== 'in-from-left' : stryMutAct_9fa48("1186") ? false : stryMutAct_9fa48("1185") ? true : (stryCov_9fa48("1185", "1186", "1187"), slideDirection === (stryMutAct_9fa48("1188") ? "" : (stryCov_9fa48("1188"), 'in-from-left')))) ? stryMutAct_9fa48("1189") ? "" : (stryCov_9fa48("1189"), 'animate__animated animate__fadeInLeft') : (stryMutAct_9fa48("1192") ? slideDirection !== 'in-from-right' : stryMutAct_9fa48("1191") ? false : stryMutAct_9fa48("1190") ? true : (stryCov_9fa48("1190", "1191", "1192"), slideDirection === (stryMutAct_9fa48("1193") ? "" : (stryCov_9fa48("1193"), 'in-from-right')))) ? stryMutAct_9fa48("1194") ? "" : (stryCov_9fa48("1194"), 'animate__animated animate__fadeInRight') : stryMutAct_9fa48("1195") ? "Stryker was here!" : (stryCov_9fa48("1195"), '')}`)} style={stryMutAct_9fa48("1196") ? {} : (stryCov_9fa48("1196"), {
                  animationDuration: stryMutAct_9fa48("1197") ? "" : (stryCov_9fa48("1197"), '0.6s')
                })}>
                {weeklyGoal}
              </span>
            </div>

            <div className="dashboard__date-picker">
              <RippleButton variant="outline" size="icon" className={stryMutAct_9fa48("1198") ? `` : (stryCov_9fa48("1198"), `dashboard__date-btn ${(stryMutAct_9fa48("1202") ? currentWeek <= 1 : stryMutAct_9fa48("1201") ? currentWeek >= 1 : stryMutAct_9fa48("1200") ? false : stryMutAct_9fa48("1199") ? true : (stryCov_9fa48("1199", "1200", "1201", "1202"), currentWeek > 1)) ? stryMutAct_9fa48("1203") ? "" : (stryCov_9fa48("1203"), 'dashboard__date-btn--active') : stryMutAct_9fa48("1204") ? "Stryker was here!" : (stryCov_9fa48("1204"), '')} ${(stryMutAct_9fa48("1208") ? currentWeek > 1 : stryMutAct_9fa48("1207") ? currentWeek < 1 : stryMutAct_9fa48("1206") ? false : stryMutAct_9fa48("1205") ? true : (stryCov_9fa48("1205", "1206", "1207", "1208"), currentWeek <= 1)) ? stryMutAct_9fa48("1209") ? "" : (stryCov_9fa48("1209"), '!opacity-100') : stryMutAct_9fa48("1210") ? "Stryker was here!" : (stryCov_9fa48("1210"), '')}`)} style={stryMutAct_9fa48("1211") ? {} : (stryCov_9fa48("1211"), {
                  backgroundColor: stryMutAct_9fa48("1212") ? "" : (stryCov_9fa48("1212"), 'var(--color-background)'),
                  borderColor: (stryMutAct_9fa48("1216") ? currentWeek <= 1 : stryMutAct_9fa48("1215") ? currentWeek >= 1 : stryMutAct_9fa48("1214") ? false : stryMutAct_9fa48("1213") ? true : (stryCov_9fa48("1213", "1214", "1215", "1216"), currentWeek > 1)) ? stryMutAct_9fa48("1217") ? "" : (stryCov_9fa48("1217"), 'var(--color-pursuit-purple)') : stryMutAct_9fa48("1218") ? "" : (stryCov_9fa48("1218"), 'var(--color-divider)'),
                  color: (stryMutAct_9fa48("1222") ? currentWeek <= 1 : stryMutAct_9fa48("1221") ? currentWeek >= 1 : stryMutAct_9fa48("1220") ? false : stryMutAct_9fa48("1219") ? true : (stryCov_9fa48("1219", "1220", "1221", "1222"), currentWeek > 1)) ? stryMutAct_9fa48("1223") ? "" : (stryCov_9fa48("1223"), 'var(--color-pursuit-purple)') : stryMutAct_9fa48("1224") ? "" : (stryCov_9fa48("1224"), 'var(--color-divider)'),
                  '--ripple-button-ripple-color': (stryMutAct_9fa48("1228") ? currentWeek <= 1 : stryMutAct_9fa48("1227") ? currentWeek >= 1 : stryMutAct_9fa48("1226") ? false : stryMutAct_9fa48("1225") ? true : (stryCov_9fa48("1225", "1226", "1227", "1228"), currentWeek > 1)) ? stryMutAct_9fa48("1229") ? "" : (stryCov_9fa48("1229"), 'var(--color-pursuit-purple)') : stryMutAct_9fa48("1230") ? "" : (stryCov_9fa48("1230"), 'var(--color-divider)')
                })} onClick={stryMutAct_9fa48("1231") ? () => undefined : (stryCov_9fa48("1231"), () => navigateToWeek(stryMutAct_9fa48("1232") ? "" : (stryCov_9fa48("1232"), 'prev')))} disabled={stryMutAct_9fa48("1235") ? (currentWeek <= 1 || isLoadingWeek) && slideDirection !== null : stryMutAct_9fa48("1234") ? false : stryMutAct_9fa48("1233") ? true : (stryCov_9fa48("1233", "1234", "1235"), (stryMutAct_9fa48("1237") ? currentWeek <= 1 && isLoadingWeek : stryMutAct_9fa48("1236") ? false : (stryCov_9fa48("1236", "1237"), (stryMutAct_9fa48("1240") ? currentWeek > 1 : stryMutAct_9fa48("1239") ? currentWeek < 1 : stryMutAct_9fa48("1238") ? false : (stryCov_9fa48("1238", "1239", "1240"), currentWeek <= 1)) || isLoadingWeek)) || (stryMutAct_9fa48("1242") ? slideDirection === null : stryMutAct_9fa48("1241") ? false : (stryCov_9fa48("1241", "1242"), slideDirection !== null)))}>
                <ChevronLeft className="w-4 h-4" />
              </RippleButton>
              <span className="dashboard__date-label">Week {currentWeek}</span>
              <RippleButton variant="outline" size="icon" className={stryMutAct_9fa48("1243") ? `` : (stryCov_9fa48("1243"), `dashboard__date-btn ${(stryMutAct_9fa48("1246") ? currentDay?.week || currentWeek < currentDay.week : stryMutAct_9fa48("1245") ? false : stryMutAct_9fa48("1244") ? true : (stryCov_9fa48("1244", "1245", "1246"), (stryMutAct_9fa48("1247") ? currentDay.week : (stryCov_9fa48("1247"), currentDay?.week)) && (stryMutAct_9fa48("1250") ? currentWeek >= currentDay.week : stryMutAct_9fa48("1249") ? currentWeek <= currentDay.week : stryMutAct_9fa48("1248") ? true : (stryCov_9fa48("1248", "1249", "1250"), currentWeek < currentDay.week)))) ? stryMutAct_9fa48("1251") ? "" : (stryCov_9fa48("1251"), 'dashboard__date-btn--active') : stryMutAct_9fa48("1252") ? "Stryker was here!" : (stryCov_9fa48("1252"), '')} ${(stryMutAct_9fa48("1255") ? !currentDay?.week && currentWeek >= currentDay.week : stryMutAct_9fa48("1254") ? false : stryMutAct_9fa48("1253") ? true : (stryCov_9fa48("1253", "1254", "1255"), (stryMutAct_9fa48("1256") ? currentDay?.week : (stryCov_9fa48("1256"), !(stryMutAct_9fa48("1257") ? currentDay.week : (stryCov_9fa48("1257"), currentDay?.week)))) || (stryMutAct_9fa48("1260") ? currentWeek < currentDay.week : stryMutAct_9fa48("1259") ? currentWeek > currentDay.week : stryMutAct_9fa48("1258") ? false : (stryCov_9fa48("1258", "1259", "1260"), currentWeek >= currentDay.week)))) ? stryMutAct_9fa48("1261") ? "" : (stryCov_9fa48("1261"), '!opacity-100') : stryMutAct_9fa48("1262") ? "Stryker was here!" : (stryCov_9fa48("1262"), '')}`)} style={stryMutAct_9fa48("1263") ? {} : (stryCov_9fa48("1263"), {
                  backgroundColor: stryMutAct_9fa48("1264") ? "" : (stryCov_9fa48("1264"), 'var(--color-background)'),
                  borderColor: (stryMutAct_9fa48("1267") ? currentDay?.week || currentWeek < currentDay.week : stryMutAct_9fa48("1266") ? false : stryMutAct_9fa48("1265") ? true : (stryCov_9fa48("1265", "1266", "1267"), (stryMutAct_9fa48("1268") ? currentDay.week : (stryCov_9fa48("1268"), currentDay?.week)) && (stryMutAct_9fa48("1271") ? currentWeek >= currentDay.week : stryMutAct_9fa48("1270") ? currentWeek <= currentDay.week : stryMutAct_9fa48("1269") ? true : (stryCov_9fa48("1269", "1270", "1271"), currentWeek < currentDay.week)))) ? stryMutAct_9fa48("1272") ? "" : (stryCov_9fa48("1272"), 'var(--color-pursuit-purple)') : stryMutAct_9fa48("1273") ? "" : (stryCov_9fa48("1273"), 'var(--color-divider)'),
                  color: (stryMutAct_9fa48("1276") ? currentDay?.week || currentWeek < currentDay.week : stryMutAct_9fa48("1275") ? false : stryMutAct_9fa48("1274") ? true : (stryCov_9fa48("1274", "1275", "1276"), (stryMutAct_9fa48("1277") ? currentDay.week : (stryCov_9fa48("1277"), currentDay?.week)) && (stryMutAct_9fa48("1280") ? currentWeek >= currentDay.week : stryMutAct_9fa48("1279") ? currentWeek <= currentDay.week : stryMutAct_9fa48("1278") ? true : (stryCov_9fa48("1278", "1279", "1280"), currentWeek < currentDay.week)))) ? stryMutAct_9fa48("1281") ? "" : (stryCov_9fa48("1281"), 'var(--color-pursuit-purple)') : stryMutAct_9fa48("1282") ? "" : (stryCov_9fa48("1282"), 'var(--color-divider)'),
                  '--ripple-button-ripple-color': (stryMutAct_9fa48("1285") ? currentDay?.week || currentWeek < currentDay.week : stryMutAct_9fa48("1284") ? false : stryMutAct_9fa48("1283") ? true : (stryCov_9fa48("1283", "1284", "1285"), (stryMutAct_9fa48("1286") ? currentDay.week : (stryCov_9fa48("1286"), currentDay?.week)) && (stryMutAct_9fa48("1289") ? currentWeek >= currentDay.week : stryMutAct_9fa48("1288") ? currentWeek <= currentDay.week : stryMutAct_9fa48("1287") ? true : (stryCov_9fa48("1287", "1288", "1289"), currentWeek < currentDay.week)))) ? stryMutAct_9fa48("1290") ? "" : (stryCov_9fa48("1290"), 'var(--color-pursuit-purple)') : stryMutAct_9fa48("1291") ? "" : (stryCov_9fa48("1291"), 'var(--color-divider)')
                })} onClick={stryMutAct_9fa48("1292") ? () => undefined : (stryCov_9fa48("1292"), () => navigateToWeek(stryMutAct_9fa48("1293") ? "" : (stryCov_9fa48("1293"), 'next')))} disabled={stryMutAct_9fa48("1296") ? (!currentDay?.week || currentWeek >= currentDay.week || isLoadingWeek) && slideDirection !== null : stryMutAct_9fa48("1295") ? false : stryMutAct_9fa48("1294") ? true : (stryCov_9fa48("1294", "1295", "1296"), (stryMutAct_9fa48("1298") ? (!currentDay?.week || currentWeek >= currentDay.week) && isLoadingWeek : stryMutAct_9fa48("1297") ? false : (stryCov_9fa48("1297", "1298"), (stryMutAct_9fa48("1300") ? !currentDay?.week && currentWeek >= currentDay.week : stryMutAct_9fa48("1299") ? false : (stryCov_9fa48("1299", "1300"), (stryMutAct_9fa48("1301") ? currentDay?.week : (stryCov_9fa48("1301"), !(stryMutAct_9fa48("1302") ? currentDay.week : (stryCov_9fa48("1302"), currentDay?.week)))) || (stryMutAct_9fa48("1305") ? currentWeek < currentDay.week : stryMutAct_9fa48("1304") ? currentWeek > currentDay.week : stryMutAct_9fa48("1303") ? false : (stryCov_9fa48("1303", "1304", "1305"), currentWeek >= currentDay.week)))) || isLoadingWeek)) || (stryMutAct_9fa48("1307") ? slideDirection === null : stryMutAct_9fa48("1306") ? false : (stryCov_9fa48("1306", "1307"), slideDirection !== null)))}>
                <ChevronRight className="w-4 h-4" />
              </RippleButton>
            </div>
          </div>

          {/* Weekly Agenda Cards */}
          <div className="dashboard__weekly-grid">
            {isLoadingWeek ? renderSkeletonCards() : weekData.map((day, index) => {
                if (stryMutAct_9fa48("1308")) {
                  {}
                } else {
                  stryCov_9fa48("1308");
                  const dayIsToday = isDateToday(day.day_date);
                  const dayIsPast = isDatePast(day.day_date);
                  const showCheckbox = stryMutAct_9fa48("1311") ? dayIsPast || !dayIsToday : stryMutAct_9fa48("1310") ? false : stryMutAct_9fa48("1309") ? true : (stryCov_9fa48("1309", "1310", "1311"), dayIsPast && (stryMutAct_9fa48("1312") ? dayIsToday : (stryCov_9fa48("1312"), !dayIsToday)));

                  // For slide-out-right and slide-in-from-left (next week flow), reverse the stagger
                  // so the animation flows from right to left
                  const isRightToLeft = stryMutAct_9fa48("1315") ? slideDirection === 'out-right' && slideDirection === 'in-from-left' : stryMutAct_9fa48("1314") ? false : stryMutAct_9fa48("1313") ? true : (stryCov_9fa48("1313", "1314", "1315"), (stryMutAct_9fa48("1317") ? slideDirection !== 'out-right' : stryMutAct_9fa48("1316") ? false : (stryCov_9fa48("1316", "1317"), slideDirection === (stryMutAct_9fa48("1318") ? "" : (stryCov_9fa48("1318"), 'out-right')))) || (stryMutAct_9fa48("1320") ? slideDirection !== 'in-from-left' : stryMutAct_9fa48("1319") ? false : (stryCov_9fa48("1319", "1320"), slideDirection === (stryMutAct_9fa48("1321") ? "" : (stryCov_9fa48("1321"), 'in-from-left')))));
                  const cardCount = weekData.length;
                  const delayIndex = isRightToLeft ? stryMutAct_9fa48("1322") ? cardCount - 1 + index : (stryCov_9fa48("1322"), (stryMutAct_9fa48("1323") ? cardCount + 1 : (stryCov_9fa48("1323"), cardCount - 1)) - index) : index;

                  // Determine Animate.css classes based on slide direction
                  let animateClass = stryMutAct_9fa48("1324") ? "Stryker was here!" : (stryCov_9fa48("1324"), '');
                  if (stryMutAct_9fa48("1327") ? slideDirection !== 'out-left' : stryMutAct_9fa48("1326") ? false : stryMutAct_9fa48("1325") ? true : (stryCov_9fa48("1325", "1326", "1327"), slideDirection === (stryMutAct_9fa48("1328") ? "" : (stryCov_9fa48("1328"), 'out-left')))) animateClass = stryMutAct_9fa48("1329") ? "" : (stryCov_9fa48("1329"), 'animate__animated animate__fadeOutLeft');else if (stryMutAct_9fa48("1332") ? slideDirection !== 'out-right' : stryMutAct_9fa48("1331") ? false : stryMutAct_9fa48("1330") ? true : (stryCov_9fa48("1330", "1331", "1332"), slideDirection === (stryMutAct_9fa48("1333") ? "" : (stryCov_9fa48("1333"), 'out-right')))) animateClass = stryMutAct_9fa48("1334") ? "" : (stryCov_9fa48("1334"), 'animate__animated animate__fadeOutRight');else if (stryMutAct_9fa48("1337") ? slideDirection !== 'in-from-left' : stryMutAct_9fa48("1336") ? false : stryMutAct_9fa48("1335") ? true : (stryCov_9fa48("1335", "1336", "1337"), slideDirection === (stryMutAct_9fa48("1338") ? "" : (stryCov_9fa48("1338"), 'in-from-left')))) animateClass = stryMutAct_9fa48("1339") ? "" : (stryCov_9fa48("1339"), 'animate__animated animate__fadeInLeft');else if (stryMutAct_9fa48("1342") ? slideDirection !== 'in-from-right' : stryMutAct_9fa48("1341") ? false : stryMutAct_9fa48("1340") ? true : (stryCov_9fa48("1340", "1341", "1342"), slideDirection === (stryMutAct_9fa48("1343") ? "" : (stryCov_9fa48("1343"), 'in-from-right')))) animateClass = stryMutAct_9fa48("1344") ? "" : (stryCov_9fa48("1344"), 'animate__animated animate__fadeInRight');

                  // Calculate completion status for past days
                  const deliverableTasks = stryMutAct_9fa48("1347") ? day.tasks?.filter(t => t.deliverable_type && ['video', 'document', 'link'].includes(t.deliverable_type)) && [] : stryMutAct_9fa48("1346") ? false : stryMutAct_9fa48("1345") ? true : (stryCov_9fa48("1345", "1346", "1347"), (stryMutAct_9fa48("1349") ? day.tasks.filter(t => t.deliverable_type && ['video', 'document', 'link'].includes(t.deliverable_type)) : stryMutAct_9fa48("1348") ? day.tasks : (stryCov_9fa48("1348", "1349"), day.tasks?.filter(stryMutAct_9fa48("1350") ? () => undefined : (stryCov_9fa48("1350"), t => stryMutAct_9fa48("1353") ? t.deliverable_type || ['video', 'document', 'link'].includes(t.deliverable_type) : stryMutAct_9fa48("1352") ? false : stryMutAct_9fa48("1351") ? true : (stryCov_9fa48("1351", "1352", "1353"), t.deliverable_type && (stryMutAct_9fa48("1354") ? [] : (stryCov_9fa48("1354"), [stryMutAct_9fa48("1355") ? "" : (stryCov_9fa48("1355"), 'video'), stryMutAct_9fa48("1356") ? "" : (stryCov_9fa48("1356"), 'document'), stryMutAct_9fa48("1357") ? "" : (stryCov_9fa48("1357"), 'link')])).includes(t.deliverable_type)))))) || (stryMutAct_9fa48("1358") ? ["Stryker was here"] : (stryCov_9fa48("1358"), [])));
                  const completedDeliverables = stryMutAct_9fa48("1359") ? deliverableTasks : (stryCov_9fa48("1359"), deliverableTasks.filter(stryMutAct_9fa48("1360") ? () => undefined : (stryCov_9fa48("1360"), t => t.hasSubmission)));
                  const isComplete = stryMutAct_9fa48("1363") ? deliverableTasks.length > 0 || deliverableTasks.length === completedDeliverables.length : stryMutAct_9fa48("1362") ? false : stryMutAct_9fa48("1361") ? true : (stryCov_9fa48("1361", "1362", "1363"), (stryMutAct_9fa48("1366") ? deliverableTasks.length <= 0 : stryMutAct_9fa48("1365") ? deliverableTasks.length >= 0 : stryMutAct_9fa48("1364") ? true : (stryCov_9fa48("1364", "1365", "1366"), deliverableTasks.length > 0)) && (stryMutAct_9fa48("1368") ? deliverableTasks.length !== completedDeliverables.length : stryMutAct_9fa48("1367") ? true : (stryCov_9fa48("1367", "1368"), deliverableTasks.length === completedDeliverables.length)));
                  return <div key={day.id} className={stryMutAct_9fa48("1369") ? `` : (stryCov_9fa48("1369"), `dashboard__day-card ${dayIsToday ? stryMutAct_9fa48("1370") ? "" : (stryCov_9fa48("1370"), 'dashboard__day-card--today') : stryMutAct_9fa48("1371") ? "Stryker was here!" : (stryCov_9fa48("1371"), '')} ${animateClass}`)} style={stryMutAct_9fa48("1372") ? {} : (stryCov_9fa48("1372"), {
                    animationDelay: stryMutAct_9fa48("1373") ? `` : (stryCov_9fa48("1373"), `${stryMutAct_9fa48("1374") ? delayIndex / 0.08 : (stryCov_9fa48("1374"), delayIndex * 0.08)}s`)
                  })}>
                  
                  {/* Date */}
                  <div className="dashboard__day-date">
                    {(() => {
                        if (stryMutAct_9fa48("1375")) {
                          {}
                        } else {
                          stryCov_9fa48("1375");
                          const formattedDate = formatDayDate(day.day_date, dayIsToday);
                          return <>
                          {stryMutAct_9fa48("1378") ? formattedDate.prefix || <strong>{formattedDate.prefix}</strong> : stryMutAct_9fa48("1377") ? false : stryMutAct_9fa48("1376") ? true : (stryCov_9fa48("1376", "1377", "1378"), formattedDate.prefix && <strong>{formattedDate.prefix}</strong>)}
                          {formattedDate.date}
                        </>;
                        }
                      })()}
                  </div>
                  
                  {/* Separator */}
                  <div className="dashboard__day-separator" />
                  
                  {/* Activities */}
                  {stryMutAct_9fa48("1381") ? day.tasks && day.tasks.length > 0 || <div className="dashboard__day-section">
                      <h4 className="dashboard__day-section-title">Activities</h4>
                      <div className="dashboard__day-activities">
                        {day.tasks.map((task, taskIndex) => {
                          const isDeliverable = task.deliverable_type && ['video', 'document', 'link'].includes(task.deliverable_type);
                          const showTaskCheckbox = dayIsPast && !dayIsToday;
                          const hasSubmission = task.hasSubmission;
                          return <div key={task.id}>
                              <div className="dashboard__day-activity">
                                {/* Task Checkbox */}
                                {showTaskCheckbox && <div className={`dashboard__task-checkbox ${hasSubmission ? 'dashboard__task-checkbox--complete' : isDeliverable ? 'dashboard__task-checkbox--incomplete' : 'dashboard__task-checkbox--complete'}`}>
                                    {isDeliverable && !hasSubmission ? <svg viewBox="0 0 8 8" className="dashboard__task-checkbox-x">
                                        <line x1="1" y1="1" x2="7" y2="7" />
                                        <line x1="7" y1="1" x2="1" y2="7" />
                                      </svg> : <svg viewBox="0 0 14 14" className="dashboard__task-checkbox-check">
                                        <polyline points="2.5,6 5.5,9 11.5,3" />
                                      </svg>}
                                  </div>}
                                
                                <div className="dashboard__day-activity-content">
                                  <span className="dashboard__task-title">{task.task_title}</span>
                                  
                                  {/* Deliverable Submit Button */}
                                  {isDeliverable && <button className={`dashboard__deliverable-link ${hasSubmission ? 'dashboard__deliverable-link--submitted' : 'dashboard__deliverable-link--pending'}`} onClick={() => navigate(`/learning?date=${day.day_date}&taskId=${task.id}`)}>
                                      Submit {task.deliverable_type}
                                    </button>}
                                </div>
                              </div>
                              {taskIndex < day.tasks.length - 1 && <div className="dashboard__activity-divider" />}
                            </div>;
                        })}
                      </div>
              </div> : stryMutAct_9fa48("1380") ? false : stryMutAct_9fa48("1379") ? true : (stryCov_9fa48("1379", "1380", "1381"), (stryMutAct_9fa48("1383") ? day.tasks || day.tasks.length > 0 : stryMutAct_9fa48("1382") ? true : (stryCov_9fa48("1382", "1383"), day.tasks && (stryMutAct_9fa48("1386") ? day.tasks.length <= 0 : stryMutAct_9fa48("1385") ? day.tasks.length >= 0 : stryMutAct_9fa48("1384") ? true : (stryCov_9fa48("1384", "1385", "1386"), day.tasks.length > 0)))) && <div className="dashboard__day-section">
                      <h4 className="dashboard__day-section-title">Activities</h4>
                      <div className="dashboard__day-activities">
                        {day.tasks.map((task, taskIndex) => {
                          if (stryMutAct_9fa48("1387")) {
                            {}
                          } else {
                            stryCov_9fa48("1387");
                            const isDeliverable = stryMutAct_9fa48("1390") ? task.deliverable_type || ['video', 'document', 'link'].includes(task.deliverable_type) : stryMutAct_9fa48("1389") ? false : stryMutAct_9fa48("1388") ? true : (stryCov_9fa48("1388", "1389", "1390"), task.deliverable_type && (stryMutAct_9fa48("1391") ? [] : (stryCov_9fa48("1391"), [stryMutAct_9fa48("1392") ? "" : (stryCov_9fa48("1392"), 'video'), stryMutAct_9fa48("1393") ? "" : (stryCov_9fa48("1393"), 'document'), stryMutAct_9fa48("1394") ? "" : (stryCov_9fa48("1394"), 'link')])).includes(task.deliverable_type));
                            const showTaskCheckbox = stryMutAct_9fa48("1397") ? dayIsPast || !dayIsToday : stryMutAct_9fa48("1396") ? false : stryMutAct_9fa48("1395") ? true : (stryCov_9fa48("1395", "1396", "1397"), dayIsPast && (stryMutAct_9fa48("1398") ? dayIsToday : (stryCov_9fa48("1398"), !dayIsToday)));
                            const hasSubmission = task.hasSubmission;
                            return <div key={task.id}>
                              <div className="dashboard__day-activity">
                                {/* Task Checkbox */}
                                {stryMutAct_9fa48("1401") ? showTaskCheckbox || <div className={`dashboard__task-checkbox ${hasSubmission ? 'dashboard__task-checkbox--complete' : isDeliverable ? 'dashboard__task-checkbox--incomplete' : 'dashboard__task-checkbox--complete'}`}>
                                    {isDeliverable && !hasSubmission ? <svg viewBox="0 0 8 8" className="dashboard__task-checkbox-x">
                                        <line x1="1" y1="1" x2="7" y2="7" />
                                        <line x1="7" y1="1" x2="1" y2="7" />
                                      </svg> : <svg viewBox="0 0 14 14" className="dashboard__task-checkbox-check">
                                        <polyline points="2.5,6 5.5,9 11.5,3" />
                                      </svg>}
                                  </div> : stryMutAct_9fa48("1400") ? false : stryMutAct_9fa48("1399") ? true : (stryCov_9fa48("1399", "1400", "1401"), showTaskCheckbox && <div className={stryMutAct_9fa48("1402") ? `` : (stryCov_9fa48("1402"), `dashboard__task-checkbox ${hasSubmission ? stryMutAct_9fa48("1403") ? "" : (stryCov_9fa48("1403"), 'dashboard__task-checkbox--complete') : isDeliverable ? stryMutAct_9fa48("1404") ? "" : (stryCov_9fa48("1404"), 'dashboard__task-checkbox--incomplete') : stryMutAct_9fa48("1405") ? "" : (stryCov_9fa48("1405"), 'dashboard__task-checkbox--complete')}`)}>
                                    {(stryMutAct_9fa48("1408") ? isDeliverable || !hasSubmission : stryMutAct_9fa48("1407") ? false : stryMutAct_9fa48("1406") ? true : (stryCov_9fa48("1406", "1407", "1408"), isDeliverable && (stryMutAct_9fa48("1409") ? hasSubmission : (stryCov_9fa48("1409"), !hasSubmission)))) ? <svg viewBox="0 0 8 8" className="dashboard__task-checkbox-x">
                                        <line x1="1" y1="1" x2="7" y2="7" />
                                        <line x1="7" y1="1" x2="1" y2="7" />
                                      </svg> : <svg viewBox="0 0 14 14" className="dashboard__task-checkbox-check">
                                        <polyline points="2.5,6 5.5,9 11.5,3" />
                                      </svg>}
                                  </div>)}
                                
                                <div className="dashboard__day-activity-content">
                                  <span className="dashboard__task-title">{task.task_title}</span>
                                  
                                  {/* Deliverable Submit Button */}
                                  {stryMutAct_9fa48("1412") ? isDeliverable || <button className={`dashboard__deliverable-link ${hasSubmission ? 'dashboard__deliverable-link--submitted' : 'dashboard__deliverable-link--pending'}`} onClick={() => navigate(`/learning?date=${day.day_date}&taskId=${task.id}`)}>
                                      Submit {task.deliverable_type}
                                    </button> : stryMutAct_9fa48("1411") ? false : stryMutAct_9fa48("1410") ? true : (stryCov_9fa48("1410", "1411", "1412"), isDeliverable && <button className={stryMutAct_9fa48("1413") ? `` : (stryCov_9fa48("1413"), `dashboard__deliverable-link ${hasSubmission ? stryMutAct_9fa48("1414") ? "" : (stryCov_9fa48("1414"), 'dashboard__deliverable-link--submitted') : stryMutAct_9fa48("1415") ? "" : (stryCov_9fa48("1415"), 'dashboard__deliverable-link--pending')}`)} onClick={stryMutAct_9fa48("1416") ? () => undefined : (stryCov_9fa48("1416"), () => navigate(stryMutAct_9fa48("1417") ? `` : (stryCov_9fa48("1417"), `/learning?date=${day.day_date}&taskId=${task.id}`)))}>
                                      Submit {task.deliverable_type}
                                    </button>)}
                                </div>
                              </div>
                              {stryMutAct_9fa48("1420") ? taskIndex < day.tasks.length - 1 || <div className="dashboard__activity-divider" /> : stryMutAct_9fa48("1419") ? false : stryMutAct_9fa48("1418") ? true : (stryCov_9fa48("1418", "1419", "1420"), (stryMutAct_9fa48("1423") ? taskIndex >= day.tasks.length - 1 : stryMutAct_9fa48("1422") ? taskIndex <= day.tasks.length - 1 : stryMutAct_9fa48("1421") ? true : (stryCov_9fa48("1421", "1422", "1423"), taskIndex < (stryMutAct_9fa48("1424") ? day.tasks.length + 1 : (stryCov_9fa48("1424"), day.tasks.length - 1)))) && <div className="dashboard__activity-divider" />)}
                            </div>;
                          }
                        })}
                      </div>
              </div>)}

                  {/* Go Button */}
                  {stryMutAct_9fa48("1427") ? dayIsToday || <button className="dashboard__go-btn dashboard__go-btn--today" onClick={handleContinueSession}>
                      Go
                    </button> : stryMutAct_9fa48("1426") ? false : stryMutAct_9fa48("1425") ? true : (stryCov_9fa48("1425", "1426", "1427"), dayIsToday && <button className="dashboard__go-btn dashboard__go-btn--today" onClick={handleContinueSession}>
                      Go
                    </button>)}
                  {stryMutAct_9fa48("1430") ? !dayIsToday && showCheckbox || <button className="dashboard__go-btn" onClick={handleContinueSession}>
                      Go
                    </button> : stryMutAct_9fa48("1429") ? false : stryMutAct_9fa48("1428") ? true : (stryCov_9fa48("1428", "1429", "1430"), (stryMutAct_9fa48("1432") ? !dayIsToday || showCheckbox : stryMutAct_9fa48("1431") ? true : (stryCov_9fa48("1431", "1432"), (stryMutAct_9fa48("1433") ? dayIsToday : (stryCov_9fa48("1433"), !dayIsToday)) && showCheckbox)) && <button className="dashboard__go-btn" onClick={handleContinueSession}>
                      Go
                    </button>)}
                </div>;
                }
              })}
          </div>

          {/* Divider 3 */}
          <div className="dashboard__divider-3" />
        </div>
        
        {/* Mobile View */}
        <div className="dashboard__mobile block md:hidden">
          {/* Divider at top */}
          <div className="dashboard__mobile-divider-top" />

          {/* Today's Goal */}
          <div className="dashboard__mobile-goal">
            <h2 className="dashboard__mobile-section-title">Today's Goal</h2>
            <p className="dashboard__mobile-goal-text">
              {stryMutAct_9fa48("1436") ? currentDay?.daily_goal && 'No goal set for today' : stryMutAct_9fa48("1435") ? false : stryMutAct_9fa48("1434") ? true : (stryCov_9fa48("1434", "1435", "1436"), (stryMutAct_9fa48("1437") ? currentDay.daily_goal : (stryCov_9fa48("1437"), currentDay?.daily_goal)) || (stryMutAct_9fa48("1438") ? "" : (stryCov_9fa48("1438"), 'No goal set for today')))}
            </p>
          </div>

          {/* Start Button */}
          <button className="dashboard__mobile-start-btn" onClick={handleContinueSession}>Start</button>

          {/* L1 Week 5 Title */}
          <div className="dashboard__mobile-week-title">
            L{currentLevel}: Week {currentWeek} <br />
            {weeklyGoal}
          </div>

          {/* Divider 2 */}
          <div className="dashboard__mobile-divider-2" />

          {/* Date Picker */}
          <div className="dashboard__mobile-date-picker">
            <RippleButton variant="outline" size="icon" className={stryMutAct_9fa48("1439") ? `` : (stryCov_9fa48("1439"), `dashboard__mobile-date-btn ${(stryMutAct_9fa48("1443") ? currentWeek <= 1 : stryMutAct_9fa48("1442") ? currentWeek >= 1 : stryMutAct_9fa48("1441") ? false : stryMutAct_9fa48("1440") ? true : (stryCov_9fa48("1440", "1441", "1442", "1443"), currentWeek > 1)) ? stryMutAct_9fa48("1444") ? "" : (stryCov_9fa48("1444"), 'dashboard__mobile-date-btn--active') : stryMutAct_9fa48("1445") ? "Stryker was here!" : (stryCov_9fa48("1445"), '')} ${(stryMutAct_9fa48("1449") ? currentWeek > 1 : stryMutAct_9fa48("1448") ? currentWeek < 1 : stryMutAct_9fa48("1447") ? false : stryMutAct_9fa48("1446") ? true : (stryCov_9fa48("1446", "1447", "1448", "1449"), currentWeek <= 1)) ? stryMutAct_9fa48("1450") ? "" : (stryCov_9fa48("1450"), '!opacity-100') : stryMutAct_9fa48("1451") ? "Stryker was here!" : (stryCov_9fa48("1451"), '')}`)} style={stryMutAct_9fa48("1452") ? {} : (stryCov_9fa48("1452"), {
                backgroundColor: stryMutAct_9fa48("1453") ? "" : (stryCov_9fa48("1453"), 'var(--color-background)'),
                borderColor: (stryMutAct_9fa48("1457") ? currentWeek <= 1 : stryMutAct_9fa48("1456") ? currentWeek >= 1 : stryMutAct_9fa48("1455") ? false : stryMutAct_9fa48("1454") ? true : (stryCov_9fa48("1454", "1455", "1456", "1457"), currentWeek > 1)) ? stryMutAct_9fa48("1458") ? "" : (stryCov_9fa48("1458"), 'var(--color-pursuit-purple)') : stryMutAct_9fa48("1459") ? "" : (stryCov_9fa48("1459"), 'var(--color-divider)'),
                color: (stryMutAct_9fa48("1463") ? currentWeek <= 1 : stryMutAct_9fa48("1462") ? currentWeek >= 1 : stryMutAct_9fa48("1461") ? false : stryMutAct_9fa48("1460") ? true : (stryCov_9fa48("1460", "1461", "1462", "1463"), currentWeek > 1)) ? stryMutAct_9fa48("1464") ? "" : (stryCov_9fa48("1464"), 'var(--color-pursuit-purple)') : stryMutAct_9fa48("1465") ? "" : (stryCov_9fa48("1465"), 'var(--color-divider)'),
                '--ripple-button-ripple-color': (stryMutAct_9fa48("1469") ? currentWeek <= 1 : stryMutAct_9fa48("1468") ? currentWeek >= 1 : stryMutAct_9fa48("1467") ? false : stryMutAct_9fa48("1466") ? true : (stryCov_9fa48("1466", "1467", "1468", "1469"), currentWeek > 1)) ? stryMutAct_9fa48("1470") ? "" : (stryCov_9fa48("1470"), 'var(--color-pursuit-purple)') : stryMutAct_9fa48("1471") ? "" : (stryCov_9fa48("1471"), 'var(--color-divider)')
              })} onClick={stryMutAct_9fa48("1472") ? () => undefined : (stryCov_9fa48("1472"), () => navigateToWeek(stryMutAct_9fa48("1473") ? "" : (stryCov_9fa48("1473"), 'prev')))} disabled={stryMutAct_9fa48("1476") ? (currentWeek <= 1 || isLoadingWeek) && slideDirection !== null : stryMutAct_9fa48("1475") ? false : stryMutAct_9fa48("1474") ? true : (stryCov_9fa48("1474", "1475", "1476"), (stryMutAct_9fa48("1478") ? currentWeek <= 1 && isLoadingWeek : stryMutAct_9fa48("1477") ? false : (stryCov_9fa48("1477", "1478"), (stryMutAct_9fa48("1481") ? currentWeek > 1 : stryMutAct_9fa48("1480") ? currentWeek < 1 : stryMutAct_9fa48("1479") ? false : (stryCov_9fa48("1479", "1480", "1481"), currentWeek <= 1)) || isLoadingWeek)) || (stryMutAct_9fa48("1483") ? slideDirection === null : stryMutAct_9fa48("1482") ? false : (stryCov_9fa48("1482", "1483"), slideDirection !== null)))}>
              <ChevronLeft className="w-4 h-4" />
            </RippleButton>
            <span className="dashboard__mobile-date-label">Week {currentWeek}</span>
            <RippleButton variant="outline" size="icon" className={stryMutAct_9fa48("1484") ? `` : (stryCov_9fa48("1484"), `dashboard__mobile-date-btn ${(stryMutAct_9fa48("1487") ? currentDay?.week || currentWeek < currentDay.week : stryMutAct_9fa48("1486") ? false : stryMutAct_9fa48("1485") ? true : (stryCov_9fa48("1485", "1486", "1487"), (stryMutAct_9fa48("1488") ? currentDay.week : (stryCov_9fa48("1488"), currentDay?.week)) && (stryMutAct_9fa48("1491") ? currentWeek >= currentDay.week : stryMutAct_9fa48("1490") ? currentWeek <= currentDay.week : stryMutAct_9fa48("1489") ? true : (stryCov_9fa48("1489", "1490", "1491"), currentWeek < currentDay.week)))) ? stryMutAct_9fa48("1492") ? "" : (stryCov_9fa48("1492"), 'dashboard__mobile-date-btn--active') : stryMutAct_9fa48("1493") ? "Stryker was here!" : (stryCov_9fa48("1493"), '')} ${(stryMutAct_9fa48("1496") ? !currentDay?.week && currentWeek >= currentDay.week : stryMutAct_9fa48("1495") ? false : stryMutAct_9fa48("1494") ? true : (stryCov_9fa48("1494", "1495", "1496"), (stryMutAct_9fa48("1497") ? currentDay?.week : (stryCov_9fa48("1497"), !(stryMutAct_9fa48("1498") ? currentDay.week : (stryCov_9fa48("1498"), currentDay?.week)))) || (stryMutAct_9fa48("1501") ? currentWeek < currentDay.week : stryMutAct_9fa48("1500") ? currentWeek > currentDay.week : stryMutAct_9fa48("1499") ? false : (stryCov_9fa48("1499", "1500", "1501"), currentWeek >= currentDay.week)))) ? stryMutAct_9fa48("1502") ? "" : (stryCov_9fa48("1502"), '!opacity-100') : stryMutAct_9fa48("1503") ? "Stryker was here!" : (stryCov_9fa48("1503"), '')}`)} style={stryMutAct_9fa48("1504") ? {} : (stryCov_9fa48("1504"), {
                backgroundColor: stryMutAct_9fa48("1505") ? "" : (stryCov_9fa48("1505"), 'var(--color-background)'),
                borderColor: (stryMutAct_9fa48("1508") ? currentDay?.week || currentWeek < currentDay.week : stryMutAct_9fa48("1507") ? false : stryMutAct_9fa48("1506") ? true : (stryCov_9fa48("1506", "1507", "1508"), (stryMutAct_9fa48("1509") ? currentDay.week : (stryCov_9fa48("1509"), currentDay?.week)) && (stryMutAct_9fa48("1512") ? currentWeek >= currentDay.week : stryMutAct_9fa48("1511") ? currentWeek <= currentDay.week : stryMutAct_9fa48("1510") ? true : (stryCov_9fa48("1510", "1511", "1512"), currentWeek < currentDay.week)))) ? stryMutAct_9fa48("1513") ? "" : (stryCov_9fa48("1513"), 'var(--color-pursuit-purple)') : stryMutAct_9fa48("1514") ? "" : (stryCov_9fa48("1514"), 'var(--color-divider)'),
                color: (stryMutAct_9fa48("1517") ? currentDay?.week || currentWeek < currentDay.week : stryMutAct_9fa48("1516") ? false : stryMutAct_9fa48("1515") ? true : (stryCov_9fa48("1515", "1516", "1517"), (stryMutAct_9fa48("1518") ? currentDay.week : (stryCov_9fa48("1518"), currentDay?.week)) && (stryMutAct_9fa48("1521") ? currentWeek >= currentDay.week : stryMutAct_9fa48("1520") ? currentWeek <= currentDay.week : stryMutAct_9fa48("1519") ? true : (stryCov_9fa48("1519", "1520", "1521"), currentWeek < currentDay.week)))) ? stryMutAct_9fa48("1522") ? "" : (stryCov_9fa48("1522"), 'var(--color-pursuit-purple)') : stryMutAct_9fa48("1523") ? "" : (stryCov_9fa48("1523"), 'var(--color-divider)'),
                '--ripple-button-ripple-color': (stryMutAct_9fa48("1526") ? currentDay?.week || currentWeek < currentDay.week : stryMutAct_9fa48("1525") ? false : stryMutAct_9fa48("1524") ? true : (stryCov_9fa48("1524", "1525", "1526"), (stryMutAct_9fa48("1527") ? currentDay.week : (stryCov_9fa48("1527"), currentDay?.week)) && (stryMutAct_9fa48("1530") ? currentWeek >= currentDay.week : stryMutAct_9fa48("1529") ? currentWeek <= currentDay.week : stryMutAct_9fa48("1528") ? true : (stryCov_9fa48("1528", "1529", "1530"), currentWeek < currentDay.week)))) ? stryMutAct_9fa48("1531") ? "" : (stryCov_9fa48("1531"), 'var(--color-pursuit-purple)') : stryMutAct_9fa48("1532") ? "" : (stryCov_9fa48("1532"), 'var(--color-divider)')
              })} onClick={stryMutAct_9fa48("1533") ? () => undefined : (stryCov_9fa48("1533"), () => navigateToWeek(stryMutAct_9fa48("1534") ? "" : (stryCov_9fa48("1534"), 'next')))} disabled={stryMutAct_9fa48("1537") ? (!currentDay?.week || currentWeek >= currentDay.week || isLoadingWeek) && slideDirection !== null : stryMutAct_9fa48("1536") ? false : stryMutAct_9fa48("1535") ? true : (stryCov_9fa48("1535", "1536", "1537"), (stryMutAct_9fa48("1539") ? (!currentDay?.week || currentWeek >= currentDay.week) && isLoadingWeek : stryMutAct_9fa48("1538") ? false : (stryCov_9fa48("1538", "1539"), (stryMutAct_9fa48("1541") ? !currentDay?.week && currentWeek >= currentDay.week : stryMutAct_9fa48("1540") ? false : (stryCov_9fa48("1540", "1541"), (stryMutAct_9fa48("1542") ? currentDay?.week : (stryCov_9fa48("1542"), !(stryMutAct_9fa48("1543") ? currentDay.week : (stryCov_9fa48("1543"), currentDay?.week)))) || (stryMutAct_9fa48("1546") ? currentWeek < currentDay.week : stryMutAct_9fa48("1545") ? currentWeek > currentDay.week : stryMutAct_9fa48("1544") ? false : (stryCov_9fa48("1544", "1545", "1546"), currentWeek >= currentDay.week)))) || isLoadingWeek)) || (stryMutAct_9fa48("1548") ? slideDirection === null : stryMutAct_9fa48("1547") ? false : (stryCov_9fa48("1547", "1548"), slideDirection !== null)))}>
              <ChevronRight className="w-4 h-4" />
            </RippleButton>
          </div>

          {/* Weekly Agenda - Mobile */}
          <div className="dashboard__mobile-agenda">
            {weekData.map((day, index) => {
                if (stryMutAct_9fa48("1549")) {
                  {}
                } else {
                  stryCov_9fa48("1549");
                  const dayIsToday = isDateToday(day.day_date);
                  const dayIsPast = isDatePast(day.day_date);
                  if (stryMutAct_9fa48("1551") ? false : stryMutAct_9fa48("1550") ? true : (stryCov_9fa48("1550", "1551"), dayIsToday)) {
                    if (stryMutAct_9fa48("1552")) {
                      {}
                    } else {
                      stryCov_9fa48("1552");
                      // Today Card - expanded
                      return <div key={day.id} className="dashboard__mobile-today-card">
                    <div className="dashboard__mobile-today-header">
                      {(() => {
                            if (stryMutAct_9fa48("1553")) {
                              {}
                            } else {
                              stryCov_9fa48("1553");
                              const formattedDate = formatDayDate(day.day_date, stryMutAct_9fa48("1554") ? false : (stryCov_9fa48("1554"), true));
                              return <>
                            {stryMutAct_9fa48("1557") ? formattedDate.prefix || <strong>{formattedDate.prefix}</strong> : stryMutAct_9fa48("1556") ? false : stryMutAct_9fa48("1555") ? true : (stryCov_9fa48("1555", "1556", "1557"), formattedDate.prefix && <strong>{formattedDate.prefix}</strong>)}
                            {formattedDate.date}
                          </>;
                            }
                          })()}
                    </div>
                    <div className="dashboard__mobile-today-separator" />
                    {stryMutAct_9fa48("1560") ? day.tasks && day.tasks.length > 0 || <div className="dashboard__mobile-today-section">
                        <h4 className="dashboard__mobile-today-section-title">Activities</h4>
                        <div className="dashboard__mobile-today-activities">
                          {day.tasks.map((task, taskIndex) => <div key={task.id}>
                              <div className="dashboard__mobile-today-activity">{task.task_title}</div>
                              {taskIndex < day.tasks.length - 1 && <div className="dashboard__mobile-activity-divider" />}
                            </div>)}
                        </div>
                      </div> : stryMutAct_9fa48("1559") ? false : stryMutAct_9fa48("1558") ? true : (stryCov_9fa48("1558", "1559", "1560"), (stryMutAct_9fa48("1562") ? day.tasks || day.tasks.length > 0 : stryMutAct_9fa48("1561") ? true : (stryCov_9fa48("1561", "1562"), day.tasks && (stryMutAct_9fa48("1565") ? day.tasks.length <= 0 : stryMutAct_9fa48("1564") ? day.tasks.length >= 0 : stryMutAct_9fa48("1563") ? true : (stryCov_9fa48("1563", "1564", "1565"), day.tasks.length > 0)))) && <div className="dashboard__mobile-today-section">
                        <h4 className="dashboard__mobile-today-section-title">Activities</h4>
                        <div className="dashboard__mobile-today-activities">
                          {day.tasks.map(stryMutAct_9fa48("1566") ? () => undefined : (stryCov_9fa48("1566"), (task, taskIndex) => <div key={task.id}>
                              <div className="dashboard__mobile-today-activity">{task.task_title}</div>
                              {stryMutAct_9fa48("1569") ? taskIndex < day.tasks.length - 1 || <div className="dashboard__mobile-activity-divider" /> : stryMutAct_9fa48("1568") ? false : stryMutAct_9fa48("1567") ? true : (stryCov_9fa48("1567", "1568", "1569"), (stryMutAct_9fa48("1572") ? taskIndex >= day.tasks.length - 1 : stryMutAct_9fa48("1571") ? taskIndex <= day.tasks.length - 1 : stryMutAct_9fa48("1570") ? true : (stryCov_9fa48("1570", "1571", "1572"), taskIndex < (stryMutAct_9fa48("1573") ? day.tasks.length + 1 : (stryCov_9fa48("1573"), day.tasks.length - 1)))) && <div className="dashboard__mobile-activity-divider" />)}
                            </div>))}
                        </div>
                      </div>)}
          <button className="dashboard__mobile-go-btn" onClick={handleContinueSession}>
                      Go
          </button>
                  </div>;
                    }
                  } else {
                    if (stryMutAct_9fa48("1574")) {
                      {}
                    } else {
                      stryCov_9fa48("1574");
                      // Regular day card - condensed
                      return <div key={day.id} className="dashboard__mobile-day">
                    <div className="dashboard__mobile-day-header">
                      {formatDayDate(day.day_date, stryMutAct_9fa48("1575") ? true : (stryCov_9fa48("1575"), false)).full}
                    </div>
                    {stryMutAct_9fa48("1578") ? dayIsPast || <div className={`dashboard__mobile-checkbox ${day.completed ? 'dashboard__mobile-checkbox--checked' : ''}`} /> : stryMutAct_9fa48("1577") ? false : stryMutAct_9fa48("1576") ? true : (stryCov_9fa48("1576", "1577", "1578"), dayIsPast && <div className={stryMutAct_9fa48("1579") ? `` : (stryCov_9fa48("1579"), `dashboard__mobile-checkbox ${day.completed ? stryMutAct_9fa48("1580") ? "" : (stryCov_9fa48("1580"), 'dashboard__mobile-checkbox--checked') : stryMutAct_9fa48("1581") ? "Stryker was here!" : (stryCov_9fa48("1581"), '')}`)} />)}
                  </div>;
                    }
                  }
                }
              })}
          </div>

          {/* Divider 3 */}
          <div className="dashboard__mobile-divider-3" />

          {/* Upcoming Section */}
          <div className="dashboard__mobile-upcoming">
            <h2 className="dashboard__mobile-section-title">Upcoming</h2>
            <div className="dashboard__mobile-upcoming-list">
              {upcomingEvents.map(stryMutAct_9fa48("1582") ? () => undefined : (stryCov_9fa48("1582"), (event, index) => <div key={index} className="dashboard__mobile-upcoming-item">
                  <div className="dashboard__mobile-upcoming-content">
                    <span className="dashboard__mobile-upcoming-date">{event.date}</span>
                    <div className="dashboard__mobile-upcoming-details">
                      <p className="dashboard__mobile-upcoming-title">{event.title}</p>
                      <p className="dashboard__mobile-upcoming-time">{event.time}</p>
                      {stryMutAct_9fa48("1585") ? event.location || <p className="dashboard__mobile-upcoming-location">{event.location}</p> : stryMutAct_9fa48("1584") ? false : stryMutAct_9fa48("1583") ? true : (stryCov_9fa48("1583", "1584", "1585"), event.location && <p className="dashboard__mobile-upcoming-location">{event.location}</p>)}
                    </div>
                  </div>
                  <button className="dashboard__mobile-signup-btn">Sign up</button>
                </div>))}
            </div>
          </div>
        </div>
      </div>;
      }
    };
    if (stryMutAct_9fa48("1587") ? false : stryMutAct_9fa48("1586") ? true : (stryCov_9fa48("1586", "1587"), isLoading)) {
      if (stryMutAct_9fa48("1588")) {
        {}
      } else {
        stryCov_9fa48("1588");
        return <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground">Loading dashboard data...</div>
      </div>;
      }
    }
    return <>
      {stryMutAct_9fa48("1591") ? error || <div className="p-4 mx-6 mt-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
          </div> : stryMutAct_9fa48("1590") ? false : stryMutAct_9fa48("1589") ? true : (stryCov_9fa48("1589", "1590", "1591"), error && <div className="p-4 mx-6 mt-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
          </div>)}
      
      {/* Conditionally render based on user status and role */}
      {(stryMutAct_9fa48("1592") ? isActive : (stryCov_9fa48("1592"), !isActive)) ? renderHistoricalView() : isVolunteer ? renderVolunteerView() : renderDashboardContent()}

      {/* Missed Assignments Sidebar */}
      <MissedAssignmentsSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} onNavigateToDay={handleNavigateToDay} />
    </>;
  }
}
export default Dashboard;