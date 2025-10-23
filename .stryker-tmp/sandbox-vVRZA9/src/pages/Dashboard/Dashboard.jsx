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

                // Fetch week data if week is available
                if (stryMutAct_9fa48("869") ? false : stryMutAct_9fa48("868") ? true : (stryCov_9fa48("868", "869"), data.day.week)) {
                  if (stryMutAct_9fa48("870")) {
                    {}
                  } else {
                    stryCov_9fa48("870");
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
    const fetchWeekData = async weekNumber => {
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
            const response = await fetch(stryMutAct_9fa48("893") ? `` : (stryCov_9fa48("893"), `${import.meta.env.VITE_API_URL}/api/curriculum/weeks/${weekNumber}${cohortParam}`), stryMutAct_9fa48("894") ? {} : (stryCov_9fa48("894"), {
              headers: stryMutAct_9fa48("895") ? {} : (stryCov_9fa48("895"), {
                'Authorization': stryMutAct_9fa48("896") ? `` : (stryCov_9fa48("896"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("899") ? false : stryMutAct_9fa48("898") ? true : stryMutAct_9fa48("897") ? response.ok : (stryCov_9fa48("897", "898", "899"), !response.ok)) {
              if (stryMutAct_9fa48("900")) {
                {}
              } else {
                stryCov_9fa48("900");
                throw new Error(stryMutAct_9fa48("901") ? "" : (stryCov_9fa48("901"), 'Failed to fetch week data'));
              }
            }
            const days = await response.json();
            setWeekData(days);

            // Update weekly goal from the first day of the week
            if (stryMutAct_9fa48("904") ? days && days.length > 0 || days[0].weekly_goal : stryMutAct_9fa48("903") ? false : stryMutAct_9fa48("902") ? true : (stryCov_9fa48("902", "903", "904"), (stryMutAct_9fa48("906") ? days || days.length > 0 : stryMutAct_9fa48("905") ? true : (stryCov_9fa48("905", "906"), days && (stryMutAct_9fa48("909") ? days.length <= 0 : stryMutAct_9fa48("908") ? days.length >= 0 : stryMutAct_9fa48("907") ? true : (stryCov_9fa48("907", "908", "909"), days.length > 0)))) && days[0].weekly_goal)) {
              if (stryMutAct_9fa48("910")) {
                {}
              } else {
                stryCov_9fa48("910");
                setWeeklyGoal(days[0].weekly_goal);
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("911")) {
            {}
          } else {
            stryCov_9fa48("911");
            console.error(stryMutAct_9fa48("912") ? "" : (stryCov_9fa48("912"), 'Error fetching week data:'), error);
          }
        }
      }
    };
    const navigateToWeek = async direction => {
      if (stryMutAct_9fa48("913")) {
        {}
      } else {
        stryCov_9fa48("913");
        if (stryMutAct_9fa48("916") ? !currentWeek && isLoadingWeek : stryMutAct_9fa48("915") ? false : stryMutAct_9fa48("914") ? true : (stryCov_9fa48("914", "915", "916"), (stryMutAct_9fa48("917") ? currentWeek : (stryCov_9fa48("917"), !currentWeek)) || isLoadingWeek)) return;
        const newWeek = (stryMutAct_9fa48("920") ? direction !== 'prev' : stryMutAct_9fa48("919") ? false : stryMutAct_9fa48("918") ? true : (stryCov_9fa48("918", "919", "920"), direction === (stryMutAct_9fa48("921") ? "" : (stryCov_9fa48("921"), 'prev')))) ? stryMutAct_9fa48("922") ? currentWeek + 1 : (stryCov_9fa48("922"), currentWeek - 1) : stryMutAct_9fa48("923") ? currentWeek - 1 : (stryCov_9fa48("923"), currentWeek + 1);

        // Don't go below week 1
        if (stryMutAct_9fa48("927") ? newWeek >= 1 : stryMutAct_9fa48("926") ? newWeek <= 1 : stryMutAct_9fa48("925") ? false : stryMutAct_9fa48("924") ? true : (stryCov_9fa48("924", "925", "926", "927"), newWeek < 1)) return;

        // Don't go past the current week (the week from currentDay)
        if (stryMutAct_9fa48("930") ? direction === 'next' && currentDay?.week || newWeek > currentDay.week : stryMutAct_9fa48("929") ? false : stryMutAct_9fa48("928") ? true : (stryCov_9fa48("928", "929", "930"), (stryMutAct_9fa48("932") ? direction === 'next' || currentDay?.week : stryMutAct_9fa48("931") ? true : (stryCov_9fa48("931", "932"), (stryMutAct_9fa48("934") ? direction !== 'next' : stryMutAct_9fa48("933") ? true : (stryCov_9fa48("933", "934"), direction === (stryMutAct_9fa48("935") ? "" : (stryCov_9fa48("935"), 'next')))) && (stryMutAct_9fa48("936") ? currentDay.week : (stryCov_9fa48("936"), currentDay?.week)))) && (stryMutAct_9fa48("939") ? newWeek <= currentDay.week : stryMutAct_9fa48("938") ? newWeek >= currentDay.week : stryMutAct_9fa48("937") ? true : (stryCov_9fa48("937", "938", "939"), newWeek > currentDay.week)))) {
          if (stryMutAct_9fa48("940")) {
            {}
          } else {
            stryCov_9fa48("940");
            return;
          }
        }
        console.log(stryMutAct_9fa48("941") ? "" : (stryCov_9fa48("941"), '🎬 Navigate to week:'), direction, stryMutAct_9fa48("942") ? "" : (stryCov_9fa48("942"), 'New week:'), newWeek);

        // Phase 1: Slide out old cards
        const slideOutDirection = (stryMutAct_9fa48("945") ? direction !== 'prev' : stryMutAct_9fa48("944") ? false : stryMutAct_9fa48("943") ? true : (stryCov_9fa48("943", "944", "945"), direction === (stryMutAct_9fa48("946") ? "" : (stryCov_9fa48("946"), 'prev')))) ? stryMutAct_9fa48("947") ? "" : (stryCov_9fa48("947"), 'out-left') : stryMutAct_9fa48("948") ? "" : (stryCov_9fa48("948"), 'out-right');
        setSlideDirection(slideOutDirection);
        console.log(stryMutAct_9fa48("949") ? "" : (stryCov_9fa48("949"), '📤 Slide OUT direction:'), slideOutDirection);

        // Wait for slide-out animation (0.6s animation + 0.4s for 5 card stagger)
        await new Promise(stryMutAct_9fa48("950") ? () => undefined : (stryCov_9fa48("950"), resolve => setTimeout(resolve, 1000)));

        // Phase 2: Fetch new data while cards are off-screen
        setCurrentWeek(newWeek);
        await fetchWeekData(newWeek);

        // Phase 3: Slide in new cards from opposite direction
        const slideInDirection = (stryMutAct_9fa48("953") ? direction !== 'prev' : stryMutAct_9fa48("952") ? false : stryMutAct_9fa48("951") ? true : (stryCov_9fa48("951", "952", "953"), direction === (stryMutAct_9fa48("954") ? "" : (stryCov_9fa48("954"), 'prev')))) ? stryMutAct_9fa48("955") ? "" : (stryCov_9fa48("955"), 'in-from-right') : stryMutAct_9fa48("956") ? "" : (stryCov_9fa48("956"), 'in-from-left');
        console.log(stryMutAct_9fa48("957") ? "" : (stryCov_9fa48("957"), '📥 Slide IN direction:'), slideInDirection);
        setSlideDirection(slideInDirection);
        setIsLoadingWeek(stryMutAct_9fa48("958") ? true : (stryCov_9fa48("958"), false));

        // Reset after slide-in completes (0.6s animation + 0.4s stagger)
        setTimeout(() => {
          if (stryMutAct_9fa48("959")) {
            {}
          } else {
            stryCov_9fa48("959");
            console.log(stryMutAct_9fa48("960") ? "" : (stryCov_9fa48("960"), '✅ Animation complete, resetting'));
            setSlideDirection(null);
          }
        }, 1000);
      }
    };

    // Handle continue session button click
    const handleContinueSession = () => {
      if (stryMutAct_9fa48("961")) {
        {}
      } else {
        stryCov_9fa48("961");
        if (stryMutAct_9fa48("964") ? false : stryMutAct_9fa48("963") ? true : stryMutAct_9fa48("962") ? isActive : (stryCov_9fa48("962", "963", "964"), !isActive)) {
          if (stryMutAct_9fa48("965")) {
            {}
          } else {
            stryCov_9fa48("965");
            setError(stryMutAct_9fa48("966") ? "" : (stryCov_9fa48("966"), 'You have historical access only and cannot access new learning sessions.'));
            return;
          }
        }
        const cohortParam = (stryMutAct_9fa48("969") ? user?.role === 'staff' || user?.role === 'admin' || cohortFilter : stryMutAct_9fa48("968") ? false : stryMutAct_9fa48("967") ? true : (stryCov_9fa48("967", "968", "969"), (stryMutAct_9fa48("971") ? user?.role === 'staff' && user?.role === 'admin' : stryMutAct_9fa48("970") ? true : (stryCov_9fa48("970", "971"), (stryMutAct_9fa48("973") ? user?.role !== 'staff' : stryMutAct_9fa48("972") ? false : (stryCov_9fa48("972", "973"), (stryMutAct_9fa48("974") ? user.role : (stryCov_9fa48("974"), user?.role)) === (stryMutAct_9fa48("975") ? "" : (stryCov_9fa48("975"), 'staff')))) || (stryMutAct_9fa48("977") ? user?.role !== 'admin' : stryMutAct_9fa48("976") ? false : (stryCov_9fa48("976", "977"), (stryMutAct_9fa48("978") ? user.role : (stryCov_9fa48("978"), user?.role)) === (stryMutAct_9fa48("979") ? "" : (stryCov_9fa48("979"), 'admin')))))) && cohortFilter)) ? stryMutAct_9fa48("980") ? `` : (stryCov_9fa48("980"), `?cohort=${encodeURIComponent(cohortFilter)}`) : stryMutAct_9fa48("981") ? "Stryker was here!" : (stryCov_9fa48("981"), '');
        navigate(stryMutAct_9fa48("982") ? `` : (stryCov_9fa48("982"), `/learning${cohortParam}`));
      }
    };

    // Navigate to the specific task in the Learning page
    const navigateToTask = taskId => {
      if (stryMutAct_9fa48("983")) {
        {}
      } else {
        stryCov_9fa48("983");
        if (stryMutAct_9fa48("986") ? false : stryMutAct_9fa48("985") ? true : stryMutAct_9fa48("984") ? isActive : (stryCov_9fa48("984", "985", "986"), !isActive)) {
          if (stryMutAct_9fa48("987")) {
            {}
          } else {
            stryCov_9fa48("987");
            setError(stryMutAct_9fa48("988") ? "" : (stryCov_9fa48("988"), 'You have historical access only and cannot access new learning sessions.'));
            return;
          }
        }
        const cohortParam = (stryMutAct_9fa48("991") ? user?.role === 'staff' || user?.role === 'admin' || cohortFilter : stryMutAct_9fa48("990") ? false : stryMutAct_9fa48("989") ? true : (stryCov_9fa48("989", "990", "991"), (stryMutAct_9fa48("993") ? user?.role === 'staff' && user?.role === 'admin' : stryMutAct_9fa48("992") ? true : (stryCov_9fa48("992", "993"), (stryMutAct_9fa48("995") ? user?.role !== 'staff' : stryMutAct_9fa48("994") ? false : (stryCov_9fa48("994", "995"), (stryMutAct_9fa48("996") ? user.role : (stryCov_9fa48("996"), user?.role)) === (stryMutAct_9fa48("997") ? "" : (stryCov_9fa48("997"), 'staff')))) || (stryMutAct_9fa48("999") ? user?.role !== 'admin' : stryMutAct_9fa48("998") ? false : (stryCov_9fa48("998", "999"), (stryMutAct_9fa48("1000") ? user.role : (stryCov_9fa48("1000"), user?.role)) === (stryMutAct_9fa48("1001") ? "" : (stryCov_9fa48("1001"), 'admin')))))) && cohortFilter)) ? stryMutAct_9fa48("1002") ? `` : (stryCov_9fa48("1002"), `&cohort=${encodeURIComponent(cohortFilter)}`) : stryMutAct_9fa48("1003") ? "Stryker was here!" : (stryCov_9fa48("1003"), '');
        navigate(stryMutAct_9fa48("1004") ? `` : (stryCov_9fa48("1004"), `/learning?taskId=${taskId}${cohortParam}`));
      }
    };

    // Navigate to calendar for historical viewing
    const navigateToCalendar = () => {
      if (stryMutAct_9fa48("1005")) {
        {}
      } else {
        stryCov_9fa48("1005");
        navigate(stryMutAct_9fa48("1006") ? "" : (stryCov_9fa48("1006"), '/calendar'));
      }
    };

    // Add a helper function to format time from 24-hour to 12-hour format
    const formatTime = timeString => {
      if (stryMutAct_9fa48("1007")) {
        {}
      } else {
        stryCov_9fa48("1007");
        if (stryMutAct_9fa48("1010") ? false : stryMutAct_9fa48("1009") ? true : stryMutAct_9fa48("1008") ? timeString : (stryCov_9fa48("1008", "1009", "1010"), !timeString)) return stryMutAct_9fa48("1011") ? "Stryker was here!" : (stryCov_9fa48("1011"), '');
        const timeParts = timeString.split(stryMutAct_9fa48("1012") ? "" : (stryCov_9fa48("1012"), ':'));
        const hours = parseInt(timeParts[0], 10);
        const minutes = timeParts[1];
        const period = (stryMutAct_9fa48("1016") ? hours < 12 : stryMutAct_9fa48("1015") ? hours > 12 : stryMutAct_9fa48("1014") ? false : stryMutAct_9fa48("1013") ? true : (stryCov_9fa48("1013", "1014", "1015", "1016"), hours >= 12)) ? stryMutAct_9fa48("1017") ? "" : (stryCov_9fa48("1017"), 'PM') : stryMutAct_9fa48("1018") ? "" : (stryCov_9fa48("1018"), 'AM');
        const formattedHours = stryMutAct_9fa48("1021") ? hours % 12 && 12 : stryMutAct_9fa48("1020") ? false : stryMutAct_9fa48("1019") ? true : (stryCov_9fa48("1019", "1020", "1021"), (stryMutAct_9fa48("1022") ? hours * 12 : (stryCov_9fa48("1022"), hours % 12)) || 12);
        return stryMutAct_9fa48("1023") ? `` : (stryCov_9fa48("1023"), `${formattedHours}:${minutes} ${period}`);
      }
    };

    // Format date for display (e.g., "10.2 SAT" or "TODAY 10.22 MON")
    const formatDayDate = (dateString, isToday = stryMutAct_9fa48("1024") ? true : (stryCov_9fa48("1024"), false)) => {
      if (stryMutAct_9fa48("1025")) {
        {}
      } else {
        stryCov_9fa48("1025");
        if (stryMutAct_9fa48("1028") ? false : stryMutAct_9fa48("1027") ? true : stryMutAct_9fa48("1026") ? dateString : (stryCov_9fa48("1026", "1027", "1028"), !dateString)) return stryMutAct_9fa48("1029") ? {} : (stryCov_9fa48("1029"), {
          prefix: stryMutAct_9fa48("1030") ? "Stryker was here!" : (stryCov_9fa48("1030"), ''),
          date: stryMutAct_9fa48("1031") ? "Stryker was here!" : (stryCov_9fa48("1031"), ''),
          full: stryMutAct_9fa48("1032") ? "Stryker was here!" : (stryCov_9fa48("1032"), '')
        });
        // Handle ISO timestamps or simple date strings
        const date = new Date(dateString);
        const month = stryMutAct_9fa48("1033") ? date.getMonth() - 1 : (stryCov_9fa48("1033"), date.getMonth() + 1);
        const day = date.getDate();
        const dayOfWeek = stryMutAct_9fa48("1034") ? date.toLocaleDateString('en-US', {
          weekday: 'short'
        }).toLowerCase() : (stryCov_9fa48("1034"), date.toLocaleDateString(stryMutAct_9fa48("1035") ? "" : (stryCov_9fa48("1035"), 'en-US'), stryMutAct_9fa48("1036") ? {} : (stryCov_9fa48("1036"), {
          weekday: stryMutAct_9fa48("1037") ? "" : (stryCov_9fa48("1037"), 'short')
        })).toUpperCase());
        const dateStr = stryMutAct_9fa48("1038") ? `` : (stryCov_9fa48("1038"), `${month}.${day} ${dayOfWeek}`);
        if (stryMutAct_9fa48("1040") ? false : stryMutAct_9fa48("1039") ? true : (stryCov_9fa48("1039", "1040"), isToday)) {
          if (stryMutAct_9fa48("1041")) {
            {}
          } else {
            stryCov_9fa48("1041");
            return stryMutAct_9fa48("1042") ? {} : (stryCov_9fa48("1042"), {
              prefix: stryMutAct_9fa48("1043") ? "" : (stryCov_9fa48("1043"), 'TODAY '),
              date: dateStr,
              full: stryMutAct_9fa48("1044") ? `` : (stryCov_9fa48("1044"), `TODAY ${dateStr}`)
            });
          }
        }
        return stryMutAct_9fa48("1045") ? {} : (stryCov_9fa48("1045"), {
          prefix: stryMutAct_9fa48("1046") ? "Stryker was here!" : (stryCov_9fa48("1046"), ''),
          date: dateStr,
          full: dateStr
        });
      }
    };

    // Check if a date is today
    const isDateToday = dateString => {
      if (stryMutAct_9fa48("1047")) {
        {}
      } else {
        stryCov_9fa48("1047");
        if (stryMutAct_9fa48("1050") ? false : stryMutAct_9fa48("1049") ? true : stryMutAct_9fa48("1048") ? dateString : (stryCov_9fa48("1048", "1049", "1050"), !dateString)) return stryMutAct_9fa48("1051") ? true : (stryCov_9fa48("1051"), false);
        const date = new Date(dateString);
        const today = new Date();
        return stryMutAct_9fa48("1054") ? date.getDate() === today.getDate() && date.getMonth() === today.getMonth() || date.getFullYear() === today.getFullYear() : stryMutAct_9fa48("1053") ? false : stryMutAct_9fa48("1052") ? true : (stryCov_9fa48("1052", "1053", "1054"), (stryMutAct_9fa48("1056") ? date.getDate() === today.getDate() || date.getMonth() === today.getMonth() : stryMutAct_9fa48("1055") ? true : (stryCov_9fa48("1055", "1056"), (stryMutAct_9fa48("1058") ? date.getDate() !== today.getDate() : stryMutAct_9fa48("1057") ? true : (stryCov_9fa48("1057", "1058"), date.getDate() === today.getDate())) && (stryMutAct_9fa48("1060") ? date.getMonth() !== today.getMonth() : stryMutAct_9fa48("1059") ? true : (stryCov_9fa48("1059", "1060"), date.getMonth() === today.getMonth())))) && (stryMutAct_9fa48("1062") ? date.getFullYear() !== today.getFullYear() : stryMutAct_9fa48("1061") ? true : (stryCov_9fa48("1061", "1062"), date.getFullYear() === today.getFullYear())));
      }
    };

    // Check if date is in the past
    const isDatePast = dateString => {
      if (stryMutAct_9fa48("1063")) {
        {}
      } else {
        stryCov_9fa48("1063");
        if (stryMutAct_9fa48("1066") ? false : stryMutAct_9fa48("1065") ? true : stryMutAct_9fa48("1064") ? dateString : (stryCov_9fa48("1064", "1065", "1066"), !dateString)) return stryMutAct_9fa48("1067") ? true : (stryCov_9fa48("1067"), false);
        const date = new Date(dateString);
        const today = new Date();
        stryMutAct_9fa48("1068") ? today.setMinutes(0, 0, 0, 0) : (stryCov_9fa48("1068"), today.setHours(0, 0, 0, 0));
        return stryMutAct_9fa48("1072") ? date >= today : stryMutAct_9fa48("1071") ? date <= today : stryMutAct_9fa48("1070") ? false : stryMutAct_9fa48("1069") ? true : (stryCov_9fa48("1069", "1070", "1071", "1072"), date < today);
      }
    };

    // Navigate to volunteer feedback
    const navigateToVolunteerFeedback = () => {
      if (stryMutAct_9fa48("1073")) {
        {}
      } else {
        stryCov_9fa48("1073");
        navigate(stryMutAct_9fa48("1074") ? "" : (stryCov_9fa48("1074"), '/volunteer-feedback'));
      }
    };

    // Handle opening missed assignments sidebar
    const handleMissedAssignmentsClick = () => {
      if (stryMutAct_9fa48("1075")) {
        {}
      } else {
        stryCov_9fa48("1075");
        setIsSidebarOpen(stryMutAct_9fa48("1076") ? false : (stryCov_9fa48("1076"), true));
      }
    };

    // Handle closing sidebar
    const handleCloseSidebar = () => {
      if (stryMutAct_9fa48("1077")) {
        {}
      } else {
        stryCov_9fa48("1077");
        setIsSidebarOpen(stryMutAct_9fa48("1078") ? true : (stryCov_9fa48("1078"), false));
      }
    };

    // Handle navigation from sidebar to specific day/task
    const handleNavigateToDay = (dayId, taskId) => {
      if (stryMutAct_9fa48("1079")) {
        {}
      } else {
        stryCov_9fa48("1079");
        // Navigate to the day view with the task highlighted
        navigate(stryMutAct_9fa48("1080") ? `` : (stryCov_9fa48("1080"), `/calendar?day=${dayId}&task=${taskId}`));
      }
    };

    // Render skeleton loading cards
    const renderSkeletonCards = () => {
      if (stryMutAct_9fa48("1081")) {
        {}
      } else {
        stryCov_9fa48("1081");
        return stryMutAct_9fa48("1082") ? Array().fill(0).map((_, index) => <div key={`skeleton-${index}`} className="dashboard__day-card dashboard__day-card--skeleton">
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
      </div>) : (stryCov_9fa48("1082"), Array(5).fill(0).map(stryMutAct_9fa48("1083") ? () => undefined : (stryCov_9fa48("1083"), (_, index) => <div key={stryMutAct_9fa48("1084") ? `` : (stryCov_9fa48("1084"), `skeleton-${index}`)} className="dashboard__day-card dashboard__day-card--skeleton">
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
      if (stryMutAct_9fa48("1085")) {
        {}
      } else {
        stryCov_9fa48("1085");
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
      if (stryMutAct_9fa48("1086")) {
        {}
      } else {
        stryCov_9fa48("1086");
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
    const upcomingEvents = stryMutAct_9fa48("1087") ? [] : (stryCov_9fa48("1087"), [stryMutAct_9fa48("1088") ? {} : (stryCov_9fa48("1088"), {
      date: stryMutAct_9fa48("1089") ? "" : (stryCov_9fa48("1089"), "10.15.25"),
      title: stryMutAct_9fa48("1090") ? "" : (stryCov_9fa48("1090"), "Demo Day"),
      time: stryMutAct_9fa48("1091") ? "" : (stryCov_9fa48("1091"), "8:30PM - 11:00 PM"),
      location: stryMutAct_9fa48("1092") ? "" : (stryCov_9fa48("1092"), "Blackrock")
    }), stryMutAct_9fa48("1093") ? {} : (stryCov_9fa48("1093"), {
      date: stryMutAct_9fa48("1094") ? "" : (stryCov_9fa48("1094"), "10.25.25"),
      title: stryMutAct_9fa48("1095") ? "" : (stryCov_9fa48("1095"), "Fireside Chat with David Yang"),
      time: stryMutAct_9fa48("1096") ? "" : (stryCov_9fa48("1096"), "2:30PM - 4:00 PM"),
      location: stryMutAct_9fa48("1097") ? "" : (stryCov_9fa48("1097"), "Pursuit HQ")
    }), stryMutAct_9fa48("1098") ? {} : (stryCov_9fa48("1098"), {
      date: stryMutAct_9fa48("1099") ? "" : (stryCov_9fa48("1099"), "10.26.25"),
      title: stryMutAct_9fa48("1100") ? "" : (stryCov_9fa48("1100"), "Presentation"),
      time: stryMutAct_9fa48("1101") ? "" : (stryCov_9fa48("1101"), "8:30PM - 11:00 PM"),
      location: stryMutAct_9fa48("1102") ? "Stryker was here!" : (stryCov_9fa48("1102"), "")
    })]);

    // Render regular dashboard content matching the Figma wireframe
    const renderDashboardContent = () => {
      if (stryMutAct_9fa48("1103")) {
        {}
      } else {
        stryCov_9fa48("1103");
        return <div className="dashboard">
        {/* Desktop View */}
        <div className="dashboard__desktop hidden md:block">
          {/* Greeting Section */}
          <div className="dashboard__greeting">
            <h1 className="dashboard__greeting-text">
              Hey {stryMutAct_9fa48("1106") ? user?.firstName && 'there' : stryMutAct_9fa48("1105") ? false : stryMutAct_9fa48("1104") ? true : (stryCov_9fa48("1104", "1105", "1106"), (stryMutAct_9fa48("1107") ? user.firstName : (stryCov_9fa48("1107"), user?.firstName)) || (stryMutAct_9fa48("1108") ? "" : (stryCov_9fa48("1108"), 'there')))}. Good to see you!
            </h1>
            <button className={stryMutAct_9fa48("1109") ? `` : (stryCov_9fa48("1109"), `dashboard__missed-assignments ${(stryMutAct_9fa48("1113") ? missedAssignmentsCount <= 0 : stryMutAct_9fa48("1112") ? missedAssignmentsCount >= 0 : stryMutAct_9fa48("1111") ? false : stryMutAct_9fa48("1110") ? true : (stryCov_9fa48("1110", "1111", "1112", "1113"), missedAssignmentsCount > 0)) ? stryMutAct_9fa48("1114") ? "" : (stryCov_9fa48("1114"), 'dashboard__missed-assignments--active') : stryMutAct_9fa48("1115") ? "Stryker was here!" : (stryCov_9fa48("1115"), '')}`)} onClick={handleMissedAssignmentsClick}>
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
                {stryMutAct_9fa48("1118") ? currentDay?.daily_goal && 'No goal set for today' : stryMutAct_9fa48("1117") ? false : stryMutAct_9fa48("1116") ? true : (stryCov_9fa48("1116", "1117", "1118"), (stryMutAct_9fa48("1119") ? currentDay.daily_goal : (stryCov_9fa48("1119"), currentDay?.daily_goal)) || (stryMutAct_9fa48("1120") ? "" : (stryCov_9fa48("1120"), 'No goal set for today')))}
              </p>
              <button className="dashboard__start-btn" onClick={handleContinueSession}>Start</button>
            </div>

            {/* Vertical Divider */}
            <div className="dashboard__vertical-divider"></div>

            {/* Upcoming Section */}
            <div className="dashboard__upcoming">
              <h2 className="dashboard__section-title">Upcoming</h2>
              <div className="dashboard__upcoming-list">
                {upcomingEvents.map(stryMutAct_9fa48("1121") ? () => undefined : (stryCov_9fa48("1121"), (event, index) => <div key={index} className="dashboard__upcoming-item">
                    <div className="dashboard__upcoming-content">
                      <span className="dashboard__upcoming-date">{event.date}</span>
                      <div className="dashboard__upcoming-details">
                        <p className="dashboard__upcoming-title">{event.title}</p>
                        <p className="dashboard__upcoming-time">{event.time}</p>
                        {stryMutAct_9fa48("1124") ? event.location || <p className="dashboard__upcoming-location">{event.location}</p> : stryMutAct_9fa48("1123") ? false : stryMutAct_9fa48("1122") ? true : (stryCov_9fa48("1122", "1123", "1124"), event.location && <p className="dashboard__upcoming-location">{event.location}</p>)}
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
              <span className={stryMutAct_9fa48("1125") ? `` : (stryCov_9fa48("1125"), `dashboard__week-subtitle ${(stryMutAct_9fa48("1128") ? slideDirection !== 'out-left' : stryMutAct_9fa48("1127") ? false : stryMutAct_9fa48("1126") ? true : (stryCov_9fa48("1126", "1127", "1128"), slideDirection === (stryMutAct_9fa48("1129") ? "" : (stryCov_9fa48("1129"), 'out-left')))) ? stryMutAct_9fa48("1130") ? "" : (stryCov_9fa48("1130"), 'animate__animated animate__fadeOutLeft') : (stryMutAct_9fa48("1133") ? slideDirection !== 'out-right' : stryMutAct_9fa48("1132") ? false : stryMutAct_9fa48("1131") ? true : (stryCov_9fa48("1131", "1132", "1133"), slideDirection === (stryMutAct_9fa48("1134") ? "" : (stryCov_9fa48("1134"), 'out-right')))) ? stryMutAct_9fa48("1135") ? "" : (stryCov_9fa48("1135"), 'animate__animated animate__fadeOutRight') : (stryMutAct_9fa48("1138") ? slideDirection !== 'in-from-left' : stryMutAct_9fa48("1137") ? false : stryMutAct_9fa48("1136") ? true : (stryCov_9fa48("1136", "1137", "1138"), slideDirection === (stryMutAct_9fa48("1139") ? "" : (stryCov_9fa48("1139"), 'in-from-left')))) ? stryMutAct_9fa48("1140") ? "" : (stryCov_9fa48("1140"), 'animate__animated animate__fadeInLeft') : (stryMutAct_9fa48("1143") ? slideDirection !== 'in-from-right' : stryMutAct_9fa48("1142") ? false : stryMutAct_9fa48("1141") ? true : (stryCov_9fa48("1141", "1142", "1143"), slideDirection === (stryMutAct_9fa48("1144") ? "" : (stryCov_9fa48("1144"), 'in-from-right')))) ? stryMutAct_9fa48("1145") ? "" : (stryCov_9fa48("1145"), 'animate__animated animate__fadeInRight') : stryMutAct_9fa48("1146") ? "Stryker was here!" : (stryCov_9fa48("1146"), '')}`)} style={stryMutAct_9fa48("1147") ? {} : (stryCov_9fa48("1147"), {
                  animationDuration: stryMutAct_9fa48("1148") ? "" : (stryCov_9fa48("1148"), '0.6s')
                })}>
                {weeklyGoal}
              </span>
            </div>

            <div className="dashboard__date-picker">
              <RippleButton variant="outline" size="icon" className={stryMutAct_9fa48("1149") ? `` : (stryCov_9fa48("1149"), `dashboard__date-btn ${(stryMutAct_9fa48("1153") ? currentWeek <= 1 : stryMutAct_9fa48("1152") ? currentWeek >= 1 : stryMutAct_9fa48("1151") ? false : stryMutAct_9fa48("1150") ? true : (stryCov_9fa48("1150", "1151", "1152", "1153"), currentWeek > 1)) ? stryMutAct_9fa48("1154") ? "" : (stryCov_9fa48("1154"), 'dashboard__date-btn--active') : stryMutAct_9fa48("1155") ? "Stryker was here!" : (stryCov_9fa48("1155"), '')}`)} style={stryMutAct_9fa48("1156") ? {} : (stryCov_9fa48("1156"), {
                  backgroundColor: stryMutAct_9fa48("1157") ? "" : (stryCov_9fa48("1157"), 'var(--color-background)'),
                  borderColor: stryMutAct_9fa48("1158") ? "" : (stryCov_9fa48("1158"), 'var(--color-pursuit-purple)'),
                  color: stryMutAct_9fa48("1159") ? "" : (stryCov_9fa48("1159"), 'var(--color-pursuit-purple)'),
                  '--ripple-button-ripple-color': stryMutAct_9fa48("1160") ? "" : (stryCov_9fa48("1160"), 'var(--color-pursuit-purple)')
                })} onClick={stryMutAct_9fa48("1161") ? () => undefined : (stryCov_9fa48("1161"), () => navigateToWeek(stryMutAct_9fa48("1162") ? "" : (stryCov_9fa48("1162"), 'prev')))} disabled={stryMutAct_9fa48("1165") ? (currentWeek <= 1 || isLoadingWeek) && slideDirection !== null : stryMutAct_9fa48("1164") ? false : stryMutAct_9fa48("1163") ? true : (stryCov_9fa48("1163", "1164", "1165"), (stryMutAct_9fa48("1167") ? currentWeek <= 1 && isLoadingWeek : stryMutAct_9fa48("1166") ? false : (stryCov_9fa48("1166", "1167"), (stryMutAct_9fa48("1170") ? currentWeek > 1 : stryMutAct_9fa48("1169") ? currentWeek < 1 : stryMutAct_9fa48("1168") ? false : (stryCov_9fa48("1168", "1169", "1170"), currentWeek <= 1)) || isLoadingWeek)) || (stryMutAct_9fa48("1172") ? slideDirection === null : stryMutAct_9fa48("1171") ? false : (stryCov_9fa48("1171", "1172"), slideDirection !== null)))}>
                <ChevronLeft className="w-4 h-4" />
              </RippleButton>
              <span className="dashboard__date-label">Week {currentWeek}</span>
              <RippleButton variant="outline" size="icon" className={stryMutAct_9fa48("1173") ? `` : (stryCov_9fa48("1173"), `dashboard__date-btn ${(stryMutAct_9fa48("1176") ? currentDay?.week || currentWeek < currentDay.week : stryMutAct_9fa48("1175") ? false : stryMutAct_9fa48("1174") ? true : (stryCov_9fa48("1174", "1175", "1176"), (stryMutAct_9fa48("1177") ? currentDay.week : (stryCov_9fa48("1177"), currentDay?.week)) && (stryMutAct_9fa48("1180") ? currentWeek >= currentDay.week : stryMutAct_9fa48("1179") ? currentWeek <= currentDay.week : stryMutAct_9fa48("1178") ? true : (stryCov_9fa48("1178", "1179", "1180"), currentWeek < currentDay.week)))) ? stryMutAct_9fa48("1181") ? "" : (stryCov_9fa48("1181"), 'dashboard__date-btn--active') : stryMutAct_9fa48("1182") ? "Stryker was here!" : (stryCov_9fa48("1182"), '')}`)} style={stryMutAct_9fa48("1183") ? {} : (stryCov_9fa48("1183"), {
                  backgroundColor: stryMutAct_9fa48("1184") ? "" : (stryCov_9fa48("1184"), 'var(--color-background)'),
                  borderColor: stryMutAct_9fa48("1185") ? "" : (stryCov_9fa48("1185"), 'var(--color-pursuit-purple)'),
                  color: stryMutAct_9fa48("1186") ? "" : (stryCov_9fa48("1186"), 'var(--color-pursuit-purple)'),
                  '--ripple-button-ripple-color': stryMutAct_9fa48("1187") ? "" : (stryCov_9fa48("1187"), 'var(--color-pursuit-purple)')
                })} onClick={stryMutAct_9fa48("1188") ? () => undefined : (stryCov_9fa48("1188"), () => navigateToWeek(stryMutAct_9fa48("1189") ? "" : (stryCov_9fa48("1189"), 'next')))} disabled={stryMutAct_9fa48("1192") ? (!currentDay?.week || currentWeek >= currentDay.week || isLoadingWeek) && slideDirection !== null : stryMutAct_9fa48("1191") ? false : stryMutAct_9fa48("1190") ? true : (stryCov_9fa48("1190", "1191", "1192"), (stryMutAct_9fa48("1194") ? (!currentDay?.week || currentWeek >= currentDay.week) && isLoadingWeek : stryMutAct_9fa48("1193") ? false : (stryCov_9fa48("1193", "1194"), (stryMutAct_9fa48("1196") ? !currentDay?.week && currentWeek >= currentDay.week : stryMutAct_9fa48("1195") ? false : (stryCov_9fa48("1195", "1196"), (stryMutAct_9fa48("1197") ? currentDay?.week : (stryCov_9fa48("1197"), !(stryMutAct_9fa48("1198") ? currentDay.week : (stryCov_9fa48("1198"), currentDay?.week)))) || (stryMutAct_9fa48("1201") ? currentWeek < currentDay.week : stryMutAct_9fa48("1200") ? currentWeek > currentDay.week : stryMutAct_9fa48("1199") ? false : (stryCov_9fa48("1199", "1200", "1201"), currentWeek >= currentDay.week)))) || isLoadingWeek)) || (stryMutAct_9fa48("1203") ? slideDirection === null : stryMutAct_9fa48("1202") ? false : (stryCov_9fa48("1202", "1203"), slideDirection !== null)))}>
                <ChevronRight className="w-4 h-4" />
              </RippleButton>
            </div>
          </div>

          {/* Weekly Agenda Cards */}
          <div className="dashboard__weekly-grid">
            {isLoadingWeek ? renderSkeletonCards() : weekData.map((day, index) => {
                if (stryMutAct_9fa48("1204")) {
                  {}
                } else {
                  stryCov_9fa48("1204");
                  const dayIsToday = isDateToday(day.day_date);
                  const dayIsPast = isDatePast(day.day_date);
                  const showCheckbox = stryMutAct_9fa48("1207") ? dayIsPast || !dayIsToday : stryMutAct_9fa48("1206") ? false : stryMutAct_9fa48("1205") ? true : (stryCov_9fa48("1205", "1206", "1207"), dayIsPast && (stryMutAct_9fa48("1208") ? dayIsToday : (stryCov_9fa48("1208"), !dayIsToday)));

                  // For slide-out-right and slide-in-from-left (next week flow), reverse the stagger
                  // so the animation flows from right to left
                  const isRightToLeft = stryMutAct_9fa48("1211") ? slideDirection === 'out-right' && slideDirection === 'in-from-left' : stryMutAct_9fa48("1210") ? false : stryMutAct_9fa48("1209") ? true : (stryCov_9fa48("1209", "1210", "1211"), (stryMutAct_9fa48("1213") ? slideDirection !== 'out-right' : stryMutAct_9fa48("1212") ? false : (stryCov_9fa48("1212", "1213"), slideDirection === (stryMutAct_9fa48("1214") ? "" : (stryCov_9fa48("1214"), 'out-right')))) || (stryMutAct_9fa48("1216") ? slideDirection !== 'in-from-left' : stryMutAct_9fa48("1215") ? false : (stryCov_9fa48("1215", "1216"), slideDirection === (stryMutAct_9fa48("1217") ? "" : (stryCov_9fa48("1217"), 'in-from-left')))));
                  const cardCount = weekData.length;
                  const delayIndex = isRightToLeft ? stryMutAct_9fa48("1218") ? cardCount - 1 + index : (stryCov_9fa48("1218"), (stryMutAct_9fa48("1219") ? cardCount + 1 : (stryCov_9fa48("1219"), cardCount - 1)) - index) : index;

                  // Determine Animate.css classes based on slide direction
                  let animateClass = stryMutAct_9fa48("1220") ? "Stryker was here!" : (stryCov_9fa48("1220"), '');
                  if (stryMutAct_9fa48("1223") ? slideDirection !== 'out-left' : stryMutAct_9fa48("1222") ? false : stryMutAct_9fa48("1221") ? true : (stryCov_9fa48("1221", "1222", "1223"), slideDirection === (stryMutAct_9fa48("1224") ? "" : (stryCov_9fa48("1224"), 'out-left')))) animateClass = stryMutAct_9fa48("1225") ? "" : (stryCov_9fa48("1225"), 'animate__animated animate__fadeOutLeft');else if (stryMutAct_9fa48("1228") ? slideDirection !== 'out-right' : stryMutAct_9fa48("1227") ? false : stryMutAct_9fa48("1226") ? true : (stryCov_9fa48("1226", "1227", "1228"), slideDirection === (stryMutAct_9fa48("1229") ? "" : (stryCov_9fa48("1229"), 'out-right')))) animateClass = stryMutAct_9fa48("1230") ? "" : (stryCov_9fa48("1230"), 'animate__animated animate__fadeOutRight');else if (stryMutAct_9fa48("1233") ? slideDirection !== 'in-from-left' : stryMutAct_9fa48("1232") ? false : stryMutAct_9fa48("1231") ? true : (stryCov_9fa48("1231", "1232", "1233"), slideDirection === (stryMutAct_9fa48("1234") ? "" : (stryCov_9fa48("1234"), 'in-from-left')))) animateClass = stryMutAct_9fa48("1235") ? "" : (stryCov_9fa48("1235"), 'animate__animated animate__fadeInLeft');else if (stryMutAct_9fa48("1238") ? slideDirection !== 'in-from-right' : stryMutAct_9fa48("1237") ? false : stryMutAct_9fa48("1236") ? true : (stryCov_9fa48("1236", "1237", "1238"), slideDirection === (stryMutAct_9fa48("1239") ? "" : (stryCov_9fa48("1239"), 'in-from-right')))) animateClass = stryMutAct_9fa48("1240") ? "" : (stryCov_9fa48("1240"), 'animate__animated animate__fadeInRight');

                  // Calculate completion status for past days
                  const deliverableTasks = stryMutAct_9fa48("1243") ? day.tasks?.filter(t => t.deliverable_type && ['video', 'document', 'link'].includes(t.deliverable_type)) && [] : stryMutAct_9fa48("1242") ? false : stryMutAct_9fa48("1241") ? true : (stryCov_9fa48("1241", "1242", "1243"), (stryMutAct_9fa48("1245") ? day.tasks.filter(t => t.deliverable_type && ['video', 'document', 'link'].includes(t.deliverable_type)) : stryMutAct_9fa48("1244") ? day.tasks : (stryCov_9fa48("1244", "1245"), day.tasks?.filter(stryMutAct_9fa48("1246") ? () => undefined : (stryCov_9fa48("1246"), t => stryMutAct_9fa48("1249") ? t.deliverable_type || ['video', 'document', 'link'].includes(t.deliverable_type) : stryMutAct_9fa48("1248") ? false : stryMutAct_9fa48("1247") ? true : (stryCov_9fa48("1247", "1248", "1249"), t.deliverable_type && (stryMutAct_9fa48("1250") ? [] : (stryCov_9fa48("1250"), [stryMutAct_9fa48("1251") ? "" : (stryCov_9fa48("1251"), 'video'), stryMutAct_9fa48("1252") ? "" : (stryCov_9fa48("1252"), 'document'), stryMutAct_9fa48("1253") ? "" : (stryCov_9fa48("1253"), 'link')])).includes(t.deliverable_type)))))) || (stryMutAct_9fa48("1254") ? ["Stryker was here"] : (stryCov_9fa48("1254"), [])));
                  const completedDeliverables = stryMutAct_9fa48("1255") ? deliverableTasks : (stryCov_9fa48("1255"), deliverableTasks.filter(stryMutAct_9fa48("1256") ? () => undefined : (stryCov_9fa48("1256"), t => t.hasSubmission)));
                  const isComplete = stryMutAct_9fa48("1259") ? deliverableTasks.length > 0 || deliverableTasks.length === completedDeliverables.length : stryMutAct_9fa48("1258") ? false : stryMutAct_9fa48("1257") ? true : (stryCov_9fa48("1257", "1258", "1259"), (stryMutAct_9fa48("1262") ? deliverableTasks.length <= 0 : stryMutAct_9fa48("1261") ? deliverableTasks.length >= 0 : stryMutAct_9fa48("1260") ? true : (stryCov_9fa48("1260", "1261", "1262"), deliverableTasks.length > 0)) && (stryMutAct_9fa48("1264") ? deliverableTasks.length !== completedDeliverables.length : stryMutAct_9fa48("1263") ? true : (stryCov_9fa48("1263", "1264"), deliverableTasks.length === completedDeliverables.length)));
                  return <div key={day.id} className={stryMutAct_9fa48("1265") ? `` : (stryCov_9fa48("1265"), `dashboard__day-card ${dayIsToday ? stryMutAct_9fa48("1266") ? "" : (stryCov_9fa48("1266"), 'dashboard__day-card--today') : stryMutAct_9fa48("1267") ? "Stryker was here!" : (stryCov_9fa48("1267"), '')} ${animateClass}`)} style={stryMutAct_9fa48("1268") ? {} : (stryCov_9fa48("1268"), {
                    animationDelay: stryMutAct_9fa48("1269") ? `` : (stryCov_9fa48("1269"), `${stryMutAct_9fa48("1270") ? delayIndex / 0.08 : (stryCov_9fa48("1270"), delayIndex * 0.08)}s`)
                  })}>
                  {/* Completion Badge (for past days only) */}
                  {stryMutAct_9fa48("1273") ? dayIsPast && !dayIsToday && deliverableTasks.length > 0 || <div className={`dashboard__completion-badge ${isComplete ? 'dashboard__completion-badge--complete' : 'dashboard__completion-badge--incomplete'}`}>
                      {isComplete ? 'Complete' : 'Incomplete'}
                    </div> : stryMutAct_9fa48("1272") ? false : stryMutAct_9fa48("1271") ? true : (stryCov_9fa48("1271", "1272", "1273"), (stryMutAct_9fa48("1275") ? dayIsPast && !dayIsToday || deliverableTasks.length > 0 : stryMutAct_9fa48("1274") ? true : (stryCov_9fa48("1274", "1275"), (stryMutAct_9fa48("1277") ? dayIsPast || !dayIsToday : stryMutAct_9fa48("1276") ? true : (stryCov_9fa48("1276", "1277"), dayIsPast && (stryMutAct_9fa48("1278") ? dayIsToday : (stryCov_9fa48("1278"), !dayIsToday)))) && (stryMutAct_9fa48("1281") ? deliverableTasks.length <= 0 : stryMutAct_9fa48("1280") ? deliverableTasks.length >= 0 : stryMutAct_9fa48("1279") ? true : (stryCov_9fa48("1279", "1280", "1281"), deliverableTasks.length > 0)))) && <div className={stryMutAct_9fa48("1282") ? `` : (stryCov_9fa48("1282"), `dashboard__completion-badge ${isComplete ? stryMutAct_9fa48("1283") ? "" : (stryCov_9fa48("1283"), 'dashboard__completion-badge--complete') : stryMutAct_9fa48("1284") ? "" : (stryCov_9fa48("1284"), 'dashboard__completion-badge--incomplete')}`)}>
                      {isComplete ? stryMutAct_9fa48("1285") ? "" : (stryCov_9fa48("1285"), 'Complete') : stryMutAct_9fa48("1286") ? "" : (stryCov_9fa48("1286"), 'Incomplete')}
                    </div>)}
                  
                  {/* Date */}
                  <div className="dashboard__day-date">
                    {(() => {
                        if (stryMutAct_9fa48("1287")) {
                          {}
                        } else {
                          stryCov_9fa48("1287");
                          const formattedDate = formatDayDate(day.day_date, dayIsToday);
                          return <>
                          {stryMutAct_9fa48("1290") ? formattedDate.prefix || <strong>{formattedDate.prefix}</strong> : stryMutAct_9fa48("1289") ? false : stryMutAct_9fa48("1288") ? true : (stryCov_9fa48("1288", "1289", "1290"), formattedDate.prefix && <strong>{formattedDate.prefix}</strong>)}
                          {formattedDate.date}
                        </>;
                        }
                      })()}
                  </div>
                  
                  {/* Separator */}
                  <div className="dashboard__day-separator" />
                  
                  {/* Activities */}
                  {stryMutAct_9fa48("1293") ? day.tasks && day.tasks.length > 0 || <div className="dashboard__day-section">
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
                                        <polyline points="2,7 5,10 12,3" />
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
              </div> : stryMutAct_9fa48("1292") ? false : stryMutAct_9fa48("1291") ? true : (stryCov_9fa48("1291", "1292", "1293"), (stryMutAct_9fa48("1295") ? day.tasks || day.tasks.length > 0 : stryMutAct_9fa48("1294") ? true : (stryCov_9fa48("1294", "1295"), day.tasks && (stryMutAct_9fa48("1298") ? day.tasks.length <= 0 : stryMutAct_9fa48("1297") ? day.tasks.length >= 0 : stryMutAct_9fa48("1296") ? true : (stryCov_9fa48("1296", "1297", "1298"), day.tasks.length > 0)))) && <div className="dashboard__day-section">
                      <h4 className="dashboard__day-section-title">Activities</h4>
                      <div className="dashboard__day-activities">
                        {day.tasks.map((task, taskIndex) => {
                          if (stryMutAct_9fa48("1299")) {
                            {}
                          } else {
                            stryCov_9fa48("1299");
                            const isDeliverable = stryMutAct_9fa48("1302") ? task.deliverable_type || ['video', 'document', 'link'].includes(task.deliverable_type) : stryMutAct_9fa48("1301") ? false : stryMutAct_9fa48("1300") ? true : (stryCov_9fa48("1300", "1301", "1302"), task.deliverable_type && (stryMutAct_9fa48("1303") ? [] : (stryCov_9fa48("1303"), [stryMutAct_9fa48("1304") ? "" : (stryCov_9fa48("1304"), 'video'), stryMutAct_9fa48("1305") ? "" : (stryCov_9fa48("1305"), 'document'), stryMutAct_9fa48("1306") ? "" : (stryCov_9fa48("1306"), 'link')])).includes(task.deliverable_type));
                            const showTaskCheckbox = stryMutAct_9fa48("1309") ? dayIsPast || !dayIsToday : stryMutAct_9fa48("1308") ? false : stryMutAct_9fa48("1307") ? true : (stryCov_9fa48("1307", "1308", "1309"), dayIsPast && (stryMutAct_9fa48("1310") ? dayIsToday : (stryCov_9fa48("1310"), !dayIsToday)));
                            const hasSubmission = task.hasSubmission;
                            return <div key={task.id}>
                              <div className="dashboard__day-activity">
                                {/* Task Checkbox */}
                                {stryMutAct_9fa48("1313") ? showTaskCheckbox || <div className={`dashboard__task-checkbox ${hasSubmission ? 'dashboard__task-checkbox--complete' : isDeliverable ? 'dashboard__task-checkbox--incomplete' : 'dashboard__task-checkbox--complete'}`}>
                                    {isDeliverable && !hasSubmission ? <svg viewBox="0 0 8 8" className="dashboard__task-checkbox-x">
                                        <line x1="1" y1="1" x2="7" y2="7" />
                                        <line x1="7" y1="1" x2="1" y2="7" />
                                      </svg> : <svg viewBox="0 0 14 14" className="dashboard__task-checkbox-check">
                                        <polyline points="2,7 5,10 12,3" />
                                      </svg>}
                                  </div> : stryMutAct_9fa48("1312") ? false : stryMutAct_9fa48("1311") ? true : (stryCov_9fa48("1311", "1312", "1313"), showTaskCheckbox && <div className={stryMutAct_9fa48("1314") ? `` : (stryCov_9fa48("1314"), `dashboard__task-checkbox ${hasSubmission ? stryMutAct_9fa48("1315") ? "" : (stryCov_9fa48("1315"), 'dashboard__task-checkbox--complete') : isDeliverable ? stryMutAct_9fa48("1316") ? "" : (stryCov_9fa48("1316"), 'dashboard__task-checkbox--incomplete') : stryMutAct_9fa48("1317") ? "" : (stryCov_9fa48("1317"), 'dashboard__task-checkbox--complete')}`)}>
                                    {(stryMutAct_9fa48("1320") ? isDeliverable || !hasSubmission : stryMutAct_9fa48("1319") ? false : stryMutAct_9fa48("1318") ? true : (stryCov_9fa48("1318", "1319", "1320"), isDeliverable && (stryMutAct_9fa48("1321") ? hasSubmission : (stryCov_9fa48("1321"), !hasSubmission)))) ? <svg viewBox="0 0 8 8" className="dashboard__task-checkbox-x">
                                        <line x1="1" y1="1" x2="7" y2="7" />
                                        <line x1="7" y1="1" x2="1" y2="7" />
                                      </svg> : <svg viewBox="0 0 14 14" className="dashboard__task-checkbox-check">
                                        <polyline points="2,7 5,10 12,3" />
                                      </svg>}
                                  </div>)}
                                
                                <div className="dashboard__day-activity-content">
                                  <span className="dashboard__task-title">{task.task_title}</span>
                                  
                                  {/* Deliverable Submit Button */}
                                  {stryMutAct_9fa48("1324") ? isDeliverable || <button className={`dashboard__deliverable-link ${hasSubmission ? 'dashboard__deliverable-link--submitted' : 'dashboard__deliverable-link--pending'}`} onClick={() => navigate(`/learning?date=${day.day_date}&taskId=${task.id}`)}>
                                      Submit {task.deliverable_type}
                                    </button> : stryMutAct_9fa48("1323") ? false : stryMutAct_9fa48("1322") ? true : (stryCov_9fa48("1322", "1323", "1324"), isDeliverable && <button className={stryMutAct_9fa48("1325") ? `` : (stryCov_9fa48("1325"), `dashboard__deliverable-link ${hasSubmission ? stryMutAct_9fa48("1326") ? "" : (stryCov_9fa48("1326"), 'dashboard__deliverable-link--submitted') : stryMutAct_9fa48("1327") ? "" : (stryCov_9fa48("1327"), 'dashboard__deliverable-link--pending')}`)} onClick={stryMutAct_9fa48("1328") ? () => undefined : (stryCov_9fa48("1328"), () => navigate(stryMutAct_9fa48("1329") ? `` : (stryCov_9fa48("1329"), `/learning?date=${day.day_date}&taskId=${task.id}`)))}>
                                      Submit {task.deliverable_type}
                                    </button>)}
                                </div>
                              </div>
                              {stryMutAct_9fa48("1332") ? taskIndex < day.tasks.length - 1 || <div className="dashboard__activity-divider" /> : stryMutAct_9fa48("1331") ? false : stryMutAct_9fa48("1330") ? true : (stryCov_9fa48("1330", "1331", "1332"), (stryMutAct_9fa48("1335") ? taskIndex >= day.tasks.length - 1 : stryMutAct_9fa48("1334") ? taskIndex <= day.tasks.length - 1 : stryMutAct_9fa48("1333") ? true : (stryCov_9fa48("1333", "1334", "1335"), taskIndex < (stryMutAct_9fa48("1336") ? day.tasks.length + 1 : (stryCov_9fa48("1336"), day.tasks.length - 1)))) && <div className="dashboard__activity-divider" />)}
                            </div>;
                          }
                        })}
                      </div>
              </div>)}

                  {/* Go Button */}
                  {stryMutAct_9fa48("1339") ? dayIsToday || <button className="dashboard__go-btn dashboard__go-btn--today" onClick={handleContinueSession}>
                      Go
                    </button> : stryMutAct_9fa48("1338") ? false : stryMutAct_9fa48("1337") ? true : (stryCov_9fa48("1337", "1338", "1339"), dayIsToday && <button className="dashboard__go-btn dashboard__go-btn--today" onClick={handleContinueSession}>
                      Go
                    </button>)}
                  {stryMutAct_9fa48("1342") ? !dayIsToday && showCheckbox || <button className="dashboard__go-btn" onClick={handleContinueSession}>
                      Go
                    </button> : stryMutAct_9fa48("1341") ? false : stryMutAct_9fa48("1340") ? true : (stryCov_9fa48("1340", "1341", "1342"), (stryMutAct_9fa48("1344") ? !dayIsToday || showCheckbox : stryMutAct_9fa48("1343") ? true : (stryCov_9fa48("1343", "1344"), (stryMutAct_9fa48("1345") ? dayIsToday : (stryCov_9fa48("1345"), !dayIsToday)) && showCheckbox)) && <button className="dashboard__go-btn" onClick={handleContinueSession}>
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
              {stryMutAct_9fa48("1348") ? currentDay?.daily_goal && 'No goal set for today' : stryMutAct_9fa48("1347") ? false : stryMutAct_9fa48("1346") ? true : (stryCov_9fa48("1346", "1347", "1348"), (stryMutAct_9fa48("1349") ? currentDay.daily_goal : (stryCov_9fa48("1349"), currentDay?.daily_goal)) || (stryMutAct_9fa48("1350") ? "" : (stryCov_9fa48("1350"), 'No goal set for today')))}
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
            <RippleButton variant="outline" size="icon" className={stryMutAct_9fa48("1351") ? `` : (stryCov_9fa48("1351"), `dashboard__mobile-date-btn ${(stryMutAct_9fa48("1355") ? currentWeek <= 1 : stryMutAct_9fa48("1354") ? currentWeek >= 1 : stryMutAct_9fa48("1353") ? false : stryMutAct_9fa48("1352") ? true : (stryCov_9fa48("1352", "1353", "1354", "1355"), currentWeek > 1)) ? stryMutAct_9fa48("1356") ? "" : (stryCov_9fa48("1356"), 'dashboard__mobile-date-btn--active') : stryMutAct_9fa48("1357") ? "Stryker was here!" : (stryCov_9fa48("1357"), '')}`)} style={stryMutAct_9fa48("1358") ? {} : (stryCov_9fa48("1358"), {
                backgroundColor: stryMutAct_9fa48("1359") ? "" : (stryCov_9fa48("1359"), 'var(--color-background)'),
                borderColor: stryMutAct_9fa48("1360") ? "" : (stryCov_9fa48("1360"), 'var(--color-pursuit-purple)'),
                color: stryMutAct_9fa48("1361") ? "" : (stryCov_9fa48("1361"), 'var(--color-pursuit-purple)'),
                '--ripple-button-ripple-color': stryMutAct_9fa48("1362") ? "" : (stryCov_9fa48("1362"), 'var(--color-pursuit-purple)')
              })} onClick={stryMutAct_9fa48("1363") ? () => undefined : (stryCov_9fa48("1363"), () => navigateToWeek(stryMutAct_9fa48("1364") ? "" : (stryCov_9fa48("1364"), 'prev')))} disabled={stryMutAct_9fa48("1367") ? (currentWeek <= 1 || isLoadingWeek) && slideDirection !== null : stryMutAct_9fa48("1366") ? false : stryMutAct_9fa48("1365") ? true : (stryCov_9fa48("1365", "1366", "1367"), (stryMutAct_9fa48("1369") ? currentWeek <= 1 && isLoadingWeek : stryMutAct_9fa48("1368") ? false : (stryCov_9fa48("1368", "1369"), (stryMutAct_9fa48("1372") ? currentWeek > 1 : stryMutAct_9fa48("1371") ? currentWeek < 1 : stryMutAct_9fa48("1370") ? false : (stryCov_9fa48("1370", "1371", "1372"), currentWeek <= 1)) || isLoadingWeek)) || (stryMutAct_9fa48("1374") ? slideDirection === null : stryMutAct_9fa48("1373") ? false : (stryCov_9fa48("1373", "1374"), slideDirection !== null)))}>
              <ChevronLeft className="w-4 h-4" />
            </RippleButton>
            <span className="dashboard__mobile-date-label">Week {currentWeek}</span>
            <RippleButton variant="outline" size="icon" className={stryMutAct_9fa48("1375") ? `` : (stryCov_9fa48("1375"), `dashboard__mobile-date-btn ${(stryMutAct_9fa48("1378") ? currentDay?.week || currentWeek < currentDay.week : stryMutAct_9fa48("1377") ? false : stryMutAct_9fa48("1376") ? true : (stryCov_9fa48("1376", "1377", "1378"), (stryMutAct_9fa48("1379") ? currentDay.week : (stryCov_9fa48("1379"), currentDay?.week)) && (stryMutAct_9fa48("1382") ? currentWeek >= currentDay.week : stryMutAct_9fa48("1381") ? currentWeek <= currentDay.week : stryMutAct_9fa48("1380") ? true : (stryCov_9fa48("1380", "1381", "1382"), currentWeek < currentDay.week)))) ? stryMutAct_9fa48("1383") ? "" : (stryCov_9fa48("1383"), 'dashboard__mobile-date-btn--active') : stryMutAct_9fa48("1384") ? "Stryker was here!" : (stryCov_9fa48("1384"), '')}`)} style={stryMutAct_9fa48("1385") ? {} : (stryCov_9fa48("1385"), {
                backgroundColor: stryMutAct_9fa48("1386") ? "" : (stryCov_9fa48("1386"), 'var(--color-background)'),
                borderColor: stryMutAct_9fa48("1387") ? "" : (stryCov_9fa48("1387"), 'var(--color-pursuit-purple)'),
                color: stryMutAct_9fa48("1388") ? "" : (stryCov_9fa48("1388"), 'var(--color-pursuit-purple)'),
                '--ripple-button-ripple-color': stryMutAct_9fa48("1389") ? "" : (stryCov_9fa48("1389"), 'var(--color-pursuit-purple)')
              })} onClick={stryMutAct_9fa48("1390") ? () => undefined : (stryCov_9fa48("1390"), () => navigateToWeek(stryMutAct_9fa48("1391") ? "" : (stryCov_9fa48("1391"), 'next')))} disabled={stryMutAct_9fa48("1394") ? (!currentDay?.week || currentWeek >= currentDay.week || isLoadingWeek) && slideDirection !== null : stryMutAct_9fa48("1393") ? false : stryMutAct_9fa48("1392") ? true : (stryCov_9fa48("1392", "1393", "1394"), (stryMutAct_9fa48("1396") ? (!currentDay?.week || currentWeek >= currentDay.week) && isLoadingWeek : stryMutAct_9fa48("1395") ? false : (stryCov_9fa48("1395", "1396"), (stryMutAct_9fa48("1398") ? !currentDay?.week && currentWeek >= currentDay.week : stryMutAct_9fa48("1397") ? false : (stryCov_9fa48("1397", "1398"), (stryMutAct_9fa48("1399") ? currentDay?.week : (stryCov_9fa48("1399"), !(stryMutAct_9fa48("1400") ? currentDay.week : (stryCov_9fa48("1400"), currentDay?.week)))) || (stryMutAct_9fa48("1403") ? currentWeek < currentDay.week : stryMutAct_9fa48("1402") ? currentWeek > currentDay.week : stryMutAct_9fa48("1401") ? false : (stryCov_9fa48("1401", "1402", "1403"), currentWeek >= currentDay.week)))) || isLoadingWeek)) || (stryMutAct_9fa48("1405") ? slideDirection === null : stryMutAct_9fa48("1404") ? false : (stryCov_9fa48("1404", "1405"), slideDirection !== null)))}>
              <ChevronRight className="w-4 h-4" />
            </RippleButton>
          </div>

          {/* Weekly Agenda - Mobile */}
          <div className="dashboard__mobile-agenda">
            {weekData.map((day, index) => {
                if (stryMutAct_9fa48("1406")) {
                  {}
                } else {
                  stryCov_9fa48("1406");
                  const dayIsToday = isDateToday(day.day_date);
                  const dayIsPast = isDatePast(day.day_date);
                  if (stryMutAct_9fa48("1408") ? false : stryMutAct_9fa48("1407") ? true : (stryCov_9fa48("1407", "1408"), dayIsToday)) {
                    if (stryMutAct_9fa48("1409")) {
                      {}
                    } else {
                      stryCov_9fa48("1409");
                      // Today Card - expanded
                      return <div key={day.id} className="dashboard__mobile-today-card">
                    <div className="dashboard__mobile-today-header">
                      {(() => {
                            if (stryMutAct_9fa48("1410")) {
                              {}
                            } else {
                              stryCov_9fa48("1410");
                              const formattedDate = formatDayDate(day.day_date, stryMutAct_9fa48("1411") ? false : (stryCov_9fa48("1411"), true));
                              return <>
                            {stryMutAct_9fa48("1414") ? formattedDate.prefix || <strong>{formattedDate.prefix}</strong> : stryMutAct_9fa48("1413") ? false : stryMutAct_9fa48("1412") ? true : (stryCov_9fa48("1412", "1413", "1414"), formattedDate.prefix && <strong>{formattedDate.prefix}</strong>)}
                            {formattedDate.date}
                          </>;
                            }
                          })()}
                    </div>
                    <div className="dashboard__mobile-today-separator" />
                    {stryMutAct_9fa48("1417") ? day.tasks && day.tasks.length > 0 || <div className="dashboard__mobile-today-section">
                        <h4 className="dashboard__mobile-today-section-title">Activities</h4>
                        <div className="dashboard__mobile-today-activities">
                          {day.tasks.map((task, taskIndex) => <div key={task.id}>
                              <div className="dashboard__mobile-today-activity">{task.task_title}</div>
                              {taskIndex < day.tasks.length - 1 && <div className="dashboard__mobile-activity-divider" />}
                            </div>)}
                        </div>
                      </div> : stryMutAct_9fa48("1416") ? false : stryMutAct_9fa48("1415") ? true : (stryCov_9fa48("1415", "1416", "1417"), (stryMutAct_9fa48("1419") ? day.tasks || day.tasks.length > 0 : stryMutAct_9fa48("1418") ? true : (stryCov_9fa48("1418", "1419"), day.tasks && (stryMutAct_9fa48("1422") ? day.tasks.length <= 0 : stryMutAct_9fa48("1421") ? day.tasks.length >= 0 : stryMutAct_9fa48("1420") ? true : (stryCov_9fa48("1420", "1421", "1422"), day.tasks.length > 0)))) && <div className="dashboard__mobile-today-section">
                        <h4 className="dashboard__mobile-today-section-title">Activities</h4>
                        <div className="dashboard__mobile-today-activities">
                          {day.tasks.map(stryMutAct_9fa48("1423") ? () => undefined : (stryCov_9fa48("1423"), (task, taskIndex) => <div key={task.id}>
                              <div className="dashboard__mobile-today-activity">{task.task_title}</div>
                              {stryMutAct_9fa48("1426") ? taskIndex < day.tasks.length - 1 || <div className="dashboard__mobile-activity-divider" /> : stryMutAct_9fa48("1425") ? false : stryMutAct_9fa48("1424") ? true : (stryCov_9fa48("1424", "1425", "1426"), (stryMutAct_9fa48("1429") ? taskIndex >= day.tasks.length - 1 : stryMutAct_9fa48("1428") ? taskIndex <= day.tasks.length - 1 : stryMutAct_9fa48("1427") ? true : (stryCov_9fa48("1427", "1428", "1429"), taskIndex < (stryMutAct_9fa48("1430") ? day.tasks.length + 1 : (stryCov_9fa48("1430"), day.tasks.length - 1)))) && <div className="dashboard__mobile-activity-divider" />)}
                            </div>))}
                        </div>
                      </div>)}
          <button className="dashboard__mobile-go-btn" onClick={handleContinueSession}>
                      Go
          </button>
                  </div>;
                    }
                  } else {
                    if (stryMutAct_9fa48("1431")) {
                      {}
                    } else {
                      stryCov_9fa48("1431");
                      // Regular day card - condensed
                      return <div key={day.id} className="dashboard__mobile-day">
                    <div className="dashboard__mobile-day-header">
                      {formatDayDate(day.day_date, stryMutAct_9fa48("1432") ? true : (stryCov_9fa48("1432"), false)).full}
                    </div>
                    {stryMutAct_9fa48("1435") ? dayIsPast || <div className={`dashboard__mobile-checkbox ${day.completed ? 'dashboard__mobile-checkbox--checked' : ''}`} /> : stryMutAct_9fa48("1434") ? false : stryMutAct_9fa48("1433") ? true : (stryCov_9fa48("1433", "1434", "1435"), dayIsPast && <div className={stryMutAct_9fa48("1436") ? `` : (stryCov_9fa48("1436"), `dashboard__mobile-checkbox ${day.completed ? stryMutAct_9fa48("1437") ? "" : (stryCov_9fa48("1437"), 'dashboard__mobile-checkbox--checked') : stryMutAct_9fa48("1438") ? "Stryker was here!" : (stryCov_9fa48("1438"), '')}`)} />)}
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
              {upcomingEvents.map(stryMutAct_9fa48("1439") ? () => undefined : (stryCov_9fa48("1439"), (event, index) => <div key={index} className="dashboard__mobile-upcoming-item">
                  <div className="dashboard__mobile-upcoming-content">
                    <span className="dashboard__mobile-upcoming-date">{event.date}</span>
                    <div className="dashboard__mobile-upcoming-details">
                      <p className="dashboard__mobile-upcoming-title">{event.title}</p>
                      <p className="dashboard__mobile-upcoming-time">{event.time}</p>
                      {stryMutAct_9fa48("1442") ? event.location || <p className="dashboard__mobile-upcoming-location">{event.location}</p> : stryMutAct_9fa48("1441") ? false : stryMutAct_9fa48("1440") ? true : (stryCov_9fa48("1440", "1441", "1442"), event.location && <p className="dashboard__mobile-upcoming-location">{event.location}</p>)}
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
    if (stryMutAct_9fa48("1444") ? false : stryMutAct_9fa48("1443") ? true : (stryCov_9fa48("1443", "1444"), isLoading)) {
      if (stryMutAct_9fa48("1445")) {
        {}
      } else {
        stryCov_9fa48("1445");
        return <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground">Loading dashboard data...</div>
      </div>;
      }
    }
    return <>
      {stryMutAct_9fa48("1448") ? error || <div className="p-4 mx-6 mt-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
          </div> : stryMutAct_9fa48("1447") ? false : stryMutAct_9fa48("1446") ? true : (stryCov_9fa48("1446", "1447", "1448"), error && <div className="p-4 mx-6 mt-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
          </div>)}
      
      {/* Conditionally render based on user status and role */}
      {(stryMutAct_9fa48("1449") ? isActive : (stryCov_9fa48("1449"), !isActive)) ? renderHistoricalView() : isVolunteer ? renderVolunteerView() : renderDashboardContent()}

      {/* Missed Assignments Sidebar */}
      <MissedAssignmentsSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} onNavigateToDay={handleNavigateToDay} />
    </>;
  }
}
export default Dashboard;