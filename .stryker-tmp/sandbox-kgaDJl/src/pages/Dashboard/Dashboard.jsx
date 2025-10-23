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
    }, stryMutAct_9fa48("789") ? [] : (stryCov_9fa48("789"), [token, cohortFilter, user.role, isActive]));
    const fetchDashboardData = async () => {
      if (stryMutAct_9fa48("790")) {
        {}
      } else {
        stryCov_9fa48("790");
        try {
          if (stryMutAct_9fa48("791")) {
            {}
          } else {
            stryCov_9fa48("791");
            setIsLoading(stryMutAct_9fa48("792") ? false : (stryCov_9fa48("792"), true));
            setError(null);
            let url = stryMutAct_9fa48("793") ? `` : (stryCov_9fa48("793"), `${import.meta.env.VITE_API_URL}/api/progress/current-day`);

            // Add cohort parameter for staff/admin if selected
            if (stryMutAct_9fa48("796") ? user.role === 'staff' || user.role === 'admin' || cohortFilter : stryMutAct_9fa48("795") ? false : stryMutAct_9fa48("794") ? true : (stryCov_9fa48("794", "795", "796"), (stryMutAct_9fa48("798") ? user.role === 'staff' && user.role === 'admin' : stryMutAct_9fa48("797") ? true : (stryCov_9fa48("797", "798"), (stryMutAct_9fa48("800") ? user.role !== 'staff' : stryMutAct_9fa48("799") ? false : (stryCov_9fa48("799", "800"), user.role === (stryMutAct_9fa48("801") ? "" : (stryCov_9fa48("801"), 'staff')))) || (stryMutAct_9fa48("803") ? user.role !== 'admin' : stryMutAct_9fa48("802") ? false : (stryCov_9fa48("802", "803"), user.role === (stryMutAct_9fa48("804") ? "" : (stryCov_9fa48("804"), 'admin')))))) && cohortFilter)) {
              if (stryMutAct_9fa48("805")) {
                {}
              } else {
                stryCov_9fa48("805");
                url += stryMutAct_9fa48("806") ? `` : (stryCov_9fa48("806"), `?cohort=${encodeURIComponent(cohortFilter)}`);
              }
            }
            const response = await fetch(url, stryMutAct_9fa48("807") ? {} : (stryCov_9fa48("807"), {
              headers: stryMutAct_9fa48("808") ? {} : (stryCov_9fa48("808"), {
                'Authorization': stryMutAct_9fa48("809") ? `` : (stryCov_9fa48("809"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("812") ? false : stryMutAct_9fa48("811") ? true : stryMutAct_9fa48("810") ? response.ok : (stryCov_9fa48("810", "811", "812"), !response.ok)) {
              if (stryMutAct_9fa48("813")) {
                {}
              } else {
                stryCov_9fa48("813");
                const errorData = await response.json().catch(stryMutAct_9fa48("814") ? () => undefined : (stryCov_9fa48("814"), () => ({})));
                const error = new Error(stryMutAct_9fa48("817") ? errorData.error && 'Failed to fetch dashboard data' : stryMutAct_9fa48("816") ? false : stryMutAct_9fa48("815") ? true : (stryCov_9fa48("815", "816", "817"), errorData.error || (stryMutAct_9fa48("818") ? "" : (stryCov_9fa48("818"), 'Failed to fetch dashboard data'))));
                error.response = stryMutAct_9fa48("819") ? {} : (stryCov_9fa48("819"), {
                  status: response.status,
                  data: errorData
                });
                throw error;
              }
            }
            const data = await response.json();
            if (stryMutAct_9fa48("822") ? data.message !== 'No schedule for today' : stryMutAct_9fa48("821") ? false : stryMutAct_9fa48("820") ? true : (stryCov_9fa48("820", "821", "822"), data.message === (stryMutAct_9fa48("823") ? "" : (stryCov_9fa48("823"), 'No schedule for today')))) {
              if (stryMutAct_9fa48("824")) {
                {}
              } else {
                stryCov_9fa48("824");
                setIsLoading(stryMutAct_9fa48("825") ? true : (stryCov_9fa48("825"), false));
                return;
              }
            }

            // Process the data
            const timeBlocks = stryMutAct_9fa48("828") ? data.timeBlocks && [] : stryMutAct_9fa48("827") ? false : stryMutAct_9fa48("826") ? true : (stryCov_9fa48("826", "827", "828"), data.timeBlocks || (stryMutAct_9fa48("829") ? ["Stryker was here"] : (stryCov_9fa48("829"), [])));
            const taskProgress = Array.isArray(data.taskProgress) ? data.taskProgress : stryMutAct_9fa48("830") ? ["Stryker was here"] : (stryCov_9fa48("830"), []);

            // Extract tasks from all time blocks
            const allTasks = stryMutAct_9fa48("831") ? ["Stryker was here"] : (stryCov_9fa48("831"), []);
            timeBlocks.forEach(block => {
              if (stryMutAct_9fa48("832")) {
                {}
              } else {
                stryCov_9fa48("832");
                // Add tasks with their completion status
                block.tasks.forEach(task => {
                  if (stryMutAct_9fa48("833")) {
                    {}
                  } else {
                    stryCov_9fa48("833");
                    const taskCompleted = stryMutAct_9fa48("836") ? taskProgress.find(progress => progress.task_id === task.id)?.status !== 'completed' : stryMutAct_9fa48("835") ? false : stryMutAct_9fa48("834") ? true : (stryCov_9fa48("834", "835", "836"), (stryMutAct_9fa48("837") ? taskProgress.find(progress => progress.task_id === task.id).status : (stryCov_9fa48("837"), taskProgress.find(stryMutAct_9fa48("838") ? () => undefined : (stryCov_9fa48("838"), progress => stryMutAct_9fa48("841") ? progress.task_id !== task.id : stryMutAct_9fa48("840") ? false : stryMutAct_9fa48("839") ? true : (stryCov_9fa48("839", "840", "841"), progress.task_id === task.id)))?.status)) === (stryMutAct_9fa48("842") ? "" : (stryCov_9fa48("842"), 'completed')));
                    allTasks.push(stryMutAct_9fa48("843") ? {} : (stryCov_9fa48("843"), {
                      id: task.id,
                      time: formatTime(block.start_time),
                      title: task.task_title,
                      duration: stryMutAct_9fa48("844") ? `` : (stryCov_9fa48("844"), `${task.duration_minutes} min`),
                      type: task.task_type,
                      completed: taskCompleted
                    }));
                  }
                });
              }
            });

            // Set state with the processed data
            setCurrentDay(stryMutAct_9fa48("847") ? data.day && {} : stryMutAct_9fa48("846") ? false : stryMutAct_9fa48("845") ? true : (stryCov_9fa48("845", "846", "847"), data.day || {}));
            setDailyTasks(allTasks);

            // Get learning objectives from the day object
            const dayObjectives = (stryMutAct_9fa48("850") ? data.day || data.day.learning_objectives : stryMutAct_9fa48("849") ? false : stryMutAct_9fa48("848") ? true : (stryCov_9fa48("848", "849", "850"), data.day && data.day.learning_objectives)) ? data.day.learning_objectives : stryMutAct_9fa48("851") ? ["Stryker was here"] : (stryCov_9fa48("851"), []);
            setObjectives(dayObjectives);

            // Set missed assignments count
            setMissedAssignmentsCount(stryMutAct_9fa48("854") ? data.missedAssignmentsCount && 0 : stryMutAct_9fa48("853") ? false : stryMutAct_9fa48("852") ? true : (stryCov_9fa48("852", "853", "854"), data.missedAssignmentsCount || 0));

            // Set level, week, and weekly goal
            if (stryMutAct_9fa48("856") ? false : stryMutAct_9fa48("855") ? true : (stryCov_9fa48("855", "856"), data.day)) {
              if (stryMutAct_9fa48("857")) {
                {}
              } else {
                stryCov_9fa48("857");
                setCurrentLevel(stryMutAct_9fa48("860") ? data.day.level && 1 : stryMutAct_9fa48("859") ? false : stryMutAct_9fa48("858") ? true : (stryCov_9fa48("858", "859", "860"), data.day.level || 1));
                setCurrentWeek(data.day.week);
                setWeeklyGoal(stryMutAct_9fa48("863") ? data.day.weekly_goal && '' : stryMutAct_9fa48("862") ? false : stryMutAct_9fa48("861") ? true : (stryCov_9fa48("861", "862", "863"), data.day.weekly_goal || (stryMutAct_9fa48("864") ? "Stryker was here!" : (stryCov_9fa48("864"), ''))));

                // Fetch week data if week is available
                if (stryMutAct_9fa48("866") ? false : stryMutAct_9fa48("865") ? true : (stryCov_9fa48("865", "866"), data.day.week)) {
                  if (stryMutAct_9fa48("867")) {
                    {}
                  } else {
                    stryCov_9fa48("867");
                    await fetchWeekData(data.day.week);
                  }
                }
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("868")) {
            {}
          } else {
            stryCov_9fa48("868");
            console.error(stryMutAct_9fa48("869") ? "" : (stryCov_9fa48("869"), 'Error fetching dashboard data:'), error);
            setError(stryMutAct_9fa48("870") ? "" : (stryCov_9fa48("870"), 'Failed to load dashboard data. Please try again later.'));
          }
        } finally {
          if (stryMutAct_9fa48("871")) {
            {}
          } else {
            stryCov_9fa48("871");
            setIsLoading(stryMutAct_9fa48("872") ? true : (stryCov_9fa48("872"), false));
          }
        }
      }
    };
    const fetchWeekData = async weekNumber => {
      if (stryMutAct_9fa48("873")) {
        {}
      } else {
        stryCov_9fa48("873");
        try {
          if (stryMutAct_9fa48("874")) {
            {}
          } else {
            stryCov_9fa48("874");
            const cohortParam = (stryMutAct_9fa48("877") ? user.role === 'staff' || user.role === 'admin' || cohortFilter : stryMutAct_9fa48("876") ? false : stryMutAct_9fa48("875") ? true : (stryCov_9fa48("875", "876", "877"), (stryMutAct_9fa48("879") ? user.role === 'staff' && user.role === 'admin' : stryMutAct_9fa48("878") ? true : (stryCov_9fa48("878", "879"), (stryMutAct_9fa48("881") ? user.role !== 'staff' : stryMutAct_9fa48("880") ? false : (stryCov_9fa48("880", "881"), user.role === (stryMutAct_9fa48("882") ? "" : (stryCov_9fa48("882"), 'staff')))) || (stryMutAct_9fa48("884") ? user.role !== 'admin' : stryMutAct_9fa48("883") ? false : (stryCov_9fa48("883", "884"), user.role === (stryMutAct_9fa48("885") ? "" : (stryCov_9fa48("885"), 'admin')))))) && cohortFilter)) ? stryMutAct_9fa48("886") ? `` : (stryCov_9fa48("886"), `?cohort=${encodeURIComponent(cohortFilter)}`) : stryMutAct_9fa48("887") ? "Stryker was here!" : (stryCov_9fa48("887"), '');
            const response = await fetch(stryMutAct_9fa48("888") ? `` : (stryCov_9fa48("888"), `${import.meta.env.VITE_API_URL}/api/curriculum/weeks/${weekNumber}${cohortParam}`), stryMutAct_9fa48("889") ? {} : (stryCov_9fa48("889"), {
              headers: stryMutAct_9fa48("890") ? {} : (stryCov_9fa48("890"), {
                'Authorization': stryMutAct_9fa48("891") ? `` : (stryCov_9fa48("891"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("894") ? false : stryMutAct_9fa48("893") ? true : stryMutAct_9fa48("892") ? response.ok : (stryCov_9fa48("892", "893", "894"), !response.ok)) {
              if (stryMutAct_9fa48("895")) {
                {}
              } else {
                stryCov_9fa48("895");
                throw new Error(stryMutAct_9fa48("896") ? "" : (stryCov_9fa48("896"), 'Failed to fetch week data'));
              }
            }
            const days = await response.json();
            setWeekData(days);

            // Update weekly goal from the first day of the week
            if (stryMutAct_9fa48("899") ? days && days.length > 0 || days[0].weekly_goal : stryMutAct_9fa48("898") ? false : stryMutAct_9fa48("897") ? true : (stryCov_9fa48("897", "898", "899"), (stryMutAct_9fa48("901") ? days || days.length > 0 : stryMutAct_9fa48("900") ? true : (stryCov_9fa48("900", "901"), days && (stryMutAct_9fa48("904") ? days.length <= 0 : stryMutAct_9fa48("903") ? days.length >= 0 : stryMutAct_9fa48("902") ? true : (stryCov_9fa48("902", "903", "904"), days.length > 0)))) && days[0].weekly_goal)) {
              if (stryMutAct_9fa48("905")) {
                {}
              } else {
                stryCov_9fa48("905");
                setWeeklyGoal(days[0].weekly_goal);
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("906")) {
            {}
          } else {
            stryCov_9fa48("906");
            console.error(stryMutAct_9fa48("907") ? "" : (stryCov_9fa48("907"), 'Error fetching week data:'), error);
          }
        }
      }
    };
    const navigateToWeek = async direction => {
      if (stryMutAct_9fa48("908")) {
        {}
      } else {
        stryCov_9fa48("908");
        if (stryMutAct_9fa48("911") ? !currentWeek && isLoadingWeek : stryMutAct_9fa48("910") ? false : stryMutAct_9fa48("909") ? true : (stryCov_9fa48("909", "910", "911"), (stryMutAct_9fa48("912") ? currentWeek : (stryCov_9fa48("912"), !currentWeek)) || isLoadingWeek)) return;
        const newWeek = (stryMutAct_9fa48("915") ? direction !== 'prev' : stryMutAct_9fa48("914") ? false : stryMutAct_9fa48("913") ? true : (stryCov_9fa48("913", "914", "915"), direction === (stryMutAct_9fa48("916") ? "" : (stryCov_9fa48("916"), 'prev')))) ? stryMutAct_9fa48("917") ? currentWeek + 1 : (stryCov_9fa48("917"), currentWeek - 1) : stryMutAct_9fa48("918") ? currentWeek - 1 : (stryCov_9fa48("918"), currentWeek + 1);

        // Don't go below week 1
        if (stryMutAct_9fa48("922") ? newWeek >= 1 : stryMutAct_9fa48("921") ? newWeek <= 1 : stryMutAct_9fa48("920") ? false : stryMutAct_9fa48("919") ? true : (stryCov_9fa48("919", "920", "921", "922"), newWeek < 1)) return;

        // Don't go past the current week (the week from currentDay)
        if (stryMutAct_9fa48("925") ? direction === 'next' && currentDay?.week || newWeek > currentDay.week : stryMutAct_9fa48("924") ? false : stryMutAct_9fa48("923") ? true : (stryCov_9fa48("923", "924", "925"), (stryMutAct_9fa48("927") ? direction === 'next' || currentDay?.week : stryMutAct_9fa48("926") ? true : (stryCov_9fa48("926", "927"), (stryMutAct_9fa48("929") ? direction !== 'next' : stryMutAct_9fa48("928") ? true : (stryCov_9fa48("928", "929"), direction === (stryMutAct_9fa48("930") ? "" : (stryCov_9fa48("930"), 'next')))) && (stryMutAct_9fa48("931") ? currentDay.week : (stryCov_9fa48("931"), currentDay?.week)))) && (stryMutAct_9fa48("934") ? newWeek <= currentDay.week : stryMutAct_9fa48("933") ? newWeek >= currentDay.week : stryMutAct_9fa48("932") ? true : (stryCov_9fa48("932", "933", "934"), newWeek > currentDay.week)))) {
          if (stryMutAct_9fa48("935")) {
            {}
          } else {
            stryCov_9fa48("935");
            return;
          }
        }
        console.log(stryMutAct_9fa48("936") ? "" : (stryCov_9fa48("936"), '🎬 Navigate to week:'), direction, stryMutAct_9fa48("937") ? "" : (stryCov_9fa48("937"), 'New week:'), newWeek);

        // Phase 1: Slide out old cards
        const slideOutDirection = (stryMutAct_9fa48("940") ? direction !== 'prev' : stryMutAct_9fa48("939") ? false : stryMutAct_9fa48("938") ? true : (stryCov_9fa48("938", "939", "940"), direction === (stryMutAct_9fa48("941") ? "" : (stryCov_9fa48("941"), 'prev')))) ? stryMutAct_9fa48("942") ? "" : (stryCov_9fa48("942"), 'out-left') : stryMutAct_9fa48("943") ? "" : (stryCov_9fa48("943"), 'out-right');
        setSlideDirection(slideOutDirection);
        console.log(stryMutAct_9fa48("944") ? "" : (stryCov_9fa48("944"), '📤 Slide OUT direction:'), slideOutDirection);

        // Wait for slide-out animation (0.6s animation + 0.4s for 5 card stagger)
        await new Promise(stryMutAct_9fa48("945") ? () => undefined : (stryCov_9fa48("945"), resolve => setTimeout(resolve, 1000)));

        // Phase 2: Fetch new data while cards are off-screen
        setCurrentWeek(newWeek);
        await fetchWeekData(newWeek);

        // Phase 3: Slide in new cards from opposite direction
        const slideInDirection = (stryMutAct_9fa48("948") ? direction !== 'prev' : stryMutAct_9fa48("947") ? false : stryMutAct_9fa48("946") ? true : (stryCov_9fa48("946", "947", "948"), direction === (stryMutAct_9fa48("949") ? "" : (stryCov_9fa48("949"), 'prev')))) ? stryMutAct_9fa48("950") ? "" : (stryCov_9fa48("950"), 'in-from-right') : stryMutAct_9fa48("951") ? "" : (stryCov_9fa48("951"), 'in-from-left');
        console.log(stryMutAct_9fa48("952") ? "" : (stryCov_9fa48("952"), '📥 Slide IN direction:'), slideInDirection);
        setSlideDirection(slideInDirection);
        setIsLoadingWeek(stryMutAct_9fa48("953") ? true : (stryCov_9fa48("953"), false));

        // Reset after slide-in completes (0.6s animation + 0.4s stagger)
        setTimeout(() => {
          if (stryMutAct_9fa48("954")) {
            {}
          } else {
            stryCov_9fa48("954");
            console.log(stryMutAct_9fa48("955") ? "" : (stryCov_9fa48("955"), '✅ Animation complete, resetting'));
            setSlideDirection(null);
          }
        }, 1000);
      }
    };

    // Handle continue session button click
    const handleContinueSession = () => {
      if (stryMutAct_9fa48("956")) {
        {}
      } else {
        stryCov_9fa48("956");
        if (stryMutAct_9fa48("959") ? false : stryMutAct_9fa48("958") ? true : stryMutAct_9fa48("957") ? isActive : (stryCov_9fa48("957", "958", "959"), !isActive)) {
          if (stryMutAct_9fa48("960")) {
            {}
          } else {
            stryCov_9fa48("960");
            setError(stryMutAct_9fa48("961") ? "" : (stryCov_9fa48("961"), 'You have historical access only and cannot access new learning sessions.'));
            return;
          }
        }
        const cohortParam = (stryMutAct_9fa48("964") ? user.role === 'staff' || user.role === 'admin' || cohortFilter : stryMutAct_9fa48("963") ? false : stryMutAct_9fa48("962") ? true : (stryCov_9fa48("962", "963", "964"), (stryMutAct_9fa48("966") ? user.role === 'staff' && user.role === 'admin' : stryMutAct_9fa48("965") ? true : (stryCov_9fa48("965", "966"), (stryMutAct_9fa48("968") ? user.role !== 'staff' : stryMutAct_9fa48("967") ? false : (stryCov_9fa48("967", "968"), user.role === (stryMutAct_9fa48("969") ? "" : (stryCov_9fa48("969"), 'staff')))) || (stryMutAct_9fa48("971") ? user.role !== 'admin' : stryMutAct_9fa48("970") ? false : (stryCov_9fa48("970", "971"), user.role === (stryMutAct_9fa48("972") ? "" : (stryCov_9fa48("972"), 'admin')))))) && cohortFilter)) ? stryMutAct_9fa48("973") ? `` : (stryCov_9fa48("973"), `?cohort=${encodeURIComponent(cohortFilter)}`) : stryMutAct_9fa48("974") ? "Stryker was here!" : (stryCov_9fa48("974"), '');
        navigate(stryMutAct_9fa48("975") ? `` : (stryCov_9fa48("975"), `/learning${cohortParam}`));
      }
    };

    // Navigate to the specific task in the Learning page
    const navigateToTask = taskId => {
      if (stryMutAct_9fa48("976")) {
        {}
      } else {
        stryCov_9fa48("976");
        if (stryMutAct_9fa48("979") ? false : stryMutAct_9fa48("978") ? true : stryMutAct_9fa48("977") ? isActive : (stryCov_9fa48("977", "978", "979"), !isActive)) {
          if (stryMutAct_9fa48("980")) {
            {}
          } else {
            stryCov_9fa48("980");
            setError(stryMutAct_9fa48("981") ? "" : (stryCov_9fa48("981"), 'You have historical access only and cannot access new learning sessions.'));
            return;
          }
        }
        const cohortParam = (stryMutAct_9fa48("984") ? user.role === 'staff' || user.role === 'admin' || cohortFilter : stryMutAct_9fa48("983") ? false : stryMutAct_9fa48("982") ? true : (stryCov_9fa48("982", "983", "984"), (stryMutAct_9fa48("986") ? user.role === 'staff' && user.role === 'admin' : stryMutAct_9fa48("985") ? true : (stryCov_9fa48("985", "986"), (stryMutAct_9fa48("988") ? user.role !== 'staff' : stryMutAct_9fa48("987") ? false : (stryCov_9fa48("987", "988"), user.role === (stryMutAct_9fa48("989") ? "" : (stryCov_9fa48("989"), 'staff')))) || (stryMutAct_9fa48("991") ? user.role !== 'admin' : stryMutAct_9fa48("990") ? false : (stryCov_9fa48("990", "991"), user.role === (stryMutAct_9fa48("992") ? "" : (stryCov_9fa48("992"), 'admin')))))) && cohortFilter)) ? stryMutAct_9fa48("993") ? `` : (stryCov_9fa48("993"), `&cohort=${encodeURIComponent(cohortFilter)}`) : stryMutAct_9fa48("994") ? "Stryker was here!" : (stryCov_9fa48("994"), '');
        navigate(stryMutAct_9fa48("995") ? `` : (stryCov_9fa48("995"), `/learning?taskId=${taskId}${cohortParam}`));
      }
    };

    // Navigate to calendar for historical viewing
    const navigateToCalendar = () => {
      if (stryMutAct_9fa48("996")) {
        {}
      } else {
        stryCov_9fa48("996");
        navigate(stryMutAct_9fa48("997") ? "" : (stryCov_9fa48("997"), '/calendar'));
      }
    };

    // Add a helper function to format time from 24-hour to 12-hour format
    const formatTime = timeString => {
      if (stryMutAct_9fa48("998")) {
        {}
      } else {
        stryCov_9fa48("998");
        if (stryMutAct_9fa48("1001") ? false : stryMutAct_9fa48("1000") ? true : stryMutAct_9fa48("999") ? timeString : (stryCov_9fa48("999", "1000", "1001"), !timeString)) return stryMutAct_9fa48("1002") ? "Stryker was here!" : (stryCov_9fa48("1002"), '');
        const timeParts = timeString.split(stryMutAct_9fa48("1003") ? "" : (stryCov_9fa48("1003"), ':'));
        const hours = parseInt(timeParts[0], 10);
        const minutes = timeParts[1];
        const period = (stryMutAct_9fa48("1007") ? hours < 12 : stryMutAct_9fa48("1006") ? hours > 12 : stryMutAct_9fa48("1005") ? false : stryMutAct_9fa48("1004") ? true : (stryCov_9fa48("1004", "1005", "1006", "1007"), hours >= 12)) ? stryMutAct_9fa48("1008") ? "" : (stryCov_9fa48("1008"), 'PM') : stryMutAct_9fa48("1009") ? "" : (stryCov_9fa48("1009"), 'AM');
        const formattedHours = stryMutAct_9fa48("1012") ? hours % 12 && 12 : stryMutAct_9fa48("1011") ? false : stryMutAct_9fa48("1010") ? true : (stryCov_9fa48("1010", "1011", "1012"), (stryMutAct_9fa48("1013") ? hours * 12 : (stryCov_9fa48("1013"), hours % 12)) || 12);
        return stryMutAct_9fa48("1014") ? `` : (stryCov_9fa48("1014"), `${formattedHours}:${minutes} ${period}`);
      }
    };

    // Format date for display (e.g., "10.2 SAT" or "TODAY 10.22 MON")
    const formatDayDate = (dateString, isToday = stryMutAct_9fa48("1015") ? true : (stryCov_9fa48("1015"), false)) => {
      if (stryMutAct_9fa48("1016")) {
        {}
      } else {
        stryCov_9fa48("1016");
        if (stryMutAct_9fa48("1019") ? false : stryMutAct_9fa48("1018") ? true : stryMutAct_9fa48("1017") ? dateString : (stryCov_9fa48("1017", "1018", "1019"), !dateString)) return stryMutAct_9fa48("1020") ? {} : (stryCov_9fa48("1020"), {
          prefix: stryMutAct_9fa48("1021") ? "Stryker was here!" : (stryCov_9fa48("1021"), ''),
          date: stryMutAct_9fa48("1022") ? "Stryker was here!" : (stryCov_9fa48("1022"), ''),
          full: stryMutAct_9fa48("1023") ? "Stryker was here!" : (stryCov_9fa48("1023"), '')
        });
        // Handle ISO timestamps or simple date strings
        const date = new Date(dateString);
        const month = stryMutAct_9fa48("1024") ? date.getMonth() - 1 : (stryCov_9fa48("1024"), date.getMonth() + 1);
        const day = date.getDate();
        const dayOfWeek = stryMutAct_9fa48("1025") ? date.toLocaleDateString('en-US', {
          weekday: 'short'
        }).toLowerCase() : (stryCov_9fa48("1025"), date.toLocaleDateString(stryMutAct_9fa48("1026") ? "" : (stryCov_9fa48("1026"), 'en-US'), stryMutAct_9fa48("1027") ? {} : (stryCov_9fa48("1027"), {
          weekday: stryMutAct_9fa48("1028") ? "" : (stryCov_9fa48("1028"), 'short')
        })).toUpperCase());
        const dateStr = stryMutAct_9fa48("1029") ? `` : (stryCov_9fa48("1029"), `${month}.${day} ${dayOfWeek}`);
        if (stryMutAct_9fa48("1031") ? false : stryMutAct_9fa48("1030") ? true : (stryCov_9fa48("1030", "1031"), isToday)) {
          if (stryMutAct_9fa48("1032")) {
            {}
          } else {
            stryCov_9fa48("1032");
            return stryMutAct_9fa48("1033") ? {} : (stryCov_9fa48("1033"), {
              prefix: stryMutAct_9fa48("1034") ? "" : (stryCov_9fa48("1034"), 'TODAY '),
              date: dateStr,
              full: stryMutAct_9fa48("1035") ? `` : (stryCov_9fa48("1035"), `TODAY ${dateStr}`)
            });
          }
        }
        return stryMutAct_9fa48("1036") ? {} : (stryCov_9fa48("1036"), {
          prefix: stryMutAct_9fa48("1037") ? "Stryker was here!" : (stryCov_9fa48("1037"), ''),
          date: dateStr,
          full: dateStr
        });
      }
    };

    // Check if a date is today
    const isDateToday = dateString => {
      if (stryMutAct_9fa48("1038")) {
        {}
      } else {
        stryCov_9fa48("1038");
        if (stryMutAct_9fa48("1041") ? false : stryMutAct_9fa48("1040") ? true : stryMutAct_9fa48("1039") ? dateString : (stryCov_9fa48("1039", "1040", "1041"), !dateString)) return stryMutAct_9fa48("1042") ? true : (stryCov_9fa48("1042"), false);
        const date = new Date(dateString);
        const today = new Date();
        return stryMutAct_9fa48("1045") ? date.getDate() === today.getDate() && date.getMonth() === today.getMonth() || date.getFullYear() === today.getFullYear() : stryMutAct_9fa48("1044") ? false : stryMutAct_9fa48("1043") ? true : (stryCov_9fa48("1043", "1044", "1045"), (stryMutAct_9fa48("1047") ? date.getDate() === today.getDate() || date.getMonth() === today.getMonth() : stryMutAct_9fa48("1046") ? true : (stryCov_9fa48("1046", "1047"), (stryMutAct_9fa48("1049") ? date.getDate() !== today.getDate() : stryMutAct_9fa48("1048") ? true : (stryCov_9fa48("1048", "1049"), date.getDate() === today.getDate())) && (stryMutAct_9fa48("1051") ? date.getMonth() !== today.getMonth() : stryMutAct_9fa48("1050") ? true : (stryCov_9fa48("1050", "1051"), date.getMonth() === today.getMonth())))) && (stryMutAct_9fa48("1053") ? date.getFullYear() !== today.getFullYear() : stryMutAct_9fa48("1052") ? true : (stryCov_9fa48("1052", "1053"), date.getFullYear() === today.getFullYear())));
      }
    };

    // Check if date is in the past
    const isDatePast = dateString => {
      if (stryMutAct_9fa48("1054")) {
        {}
      } else {
        stryCov_9fa48("1054");
        if (stryMutAct_9fa48("1057") ? false : stryMutAct_9fa48("1056") ? true : stryMutAct_9fa48("1055") ? dateString : (stryCov_9fa48("1055", "1056", "1057"), !dateString)) return stryMutAct_9fa48("1058") ? true : (stryCov_9fa48("1058"), false);
        const date = new Date(dateString);
        const today = new Date();
        stryMutAct_9fa48("1059") ? today.setMinutes(0, 0, 0, 0) : (stryCov_9fa48("1059"), today.setHours(0, 0, 0, 0));
        return stryMutAct_9fa48("1063") ? date >= today : stryMutAct_9fa48("1062") ? date <= today : stryMutAct_9fa48("1061") ? false : stryMutAct_9fa48("1060") ? true : (stryCov_9fa48("1060", "1061", "1062", "1063"), date < today);
      }
    };

    // Navigate to volunteer feedback
    const navigateToVolunteerFeedback = () => {
      if (stryMutAct_9fa48("1064")) {
        {}
      } else {
        stryCov_9fa48("1064");
        navigate(stryMutAct_9fa48("1065") ? "" : (stryCov_9fa48("1065"), '/volunteer-feedback'));
      }
    };

    // Handle opening missed assignments sidebar
    const handleMissedAssignmentsClick = () => {
      if (stryMutAct_9fa48("1066")) {
        {}
      } else {
        stryCov_9fa48("1066");
        setIsSidebarOpen(stryMutAct_9fa48("1067") ? false : (stryCov_9fa48("1067"), true));
      }
    };

    // Handle closing sidebar
    const handleCloseSidebar = () => {
      if (stryMutAct_9fa48("1068")) {
        {}
      } else {
        stryCov_9fa48("1068");
        setIsSidebarOpen(stryMutAct_9fa48("1069") ? true : (stryCov_9fa48("1069"), false));
      }
    };

    // Handle navigation from sidebar to specific day/task
    const handleNavigateToDay = (dayId, taskId) => {
      if (stryMutAct_9fa48("1070")) {
        {}
      } else {
        stryCov_9fa48("1070");
        // Navigate to the day view with the task highlighted
        navigate(stryMutAct_9fa48("1071") ? `` : (stryCov_9fa48("1071"), `/calendar?day=${dayId}&task=${taskId}`));
      }
    };

    // Render skeleton loading cards
    const renderSkeletonCards = () => {
      if (stryMutAct_9fa48("1072")) {
        {}
      } else {
        stryCov_9fa48("1072");
        return stryMutAct_9fa48("1073") ? Array().fill(0).map((_, index) => <div key={`skeleton-${index}`} className="dashboard__day-card dashboard__day-card--skeleton">
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
      </div>) : (stryCov_9fa48("1073"), Array(5).fill(0).map(stryMutAct_9fa48("1074") ? () => undefined : (stryCov_9fa48("1074"), (_, index) => <div key={stryMutAct_9fa48("1075") ? `` : (stryCov_9fa48("1075"), `skeleton-${index}`)} className="dashboard__day-card dashboard__day-card--skeleton">
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
      if (stryMutAct_9fa48("1076")) {
        {}
      } else {
        stryCov_9fa48("1076");
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
      if (stryMutAct_9fa48("1077")) {
        {}
      } else {
        stryCov_9fa48("1077");
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
    const upcomingEvents = stryMutAct_9fa48("1078") ? [] : (stryCov_9fa48("1078"), [stryMutAct_9fa48("1079") ? {} : (stryCov_9fa48("1079"), {
      date: stryMutAct_9fa48("1080") ? "" : (stryCov_9fa48("1080"), "10.15.25"),
      title: stryMutAct_9fa48("1081") ? "" : (stryCov_9fa48("1081"), "Demo Day"),
      time: stryMutAct_9fa48("1082") ? "" : (stryCov_9fa48("1082"), "8:30PM - 11:00 PM"),
      location: stryMutAct_9fa48("1083") ? "" : (stryCov_9fa48("1083"), "Blackrock")
    }), stryMutAct_9fa48("1084") ? {} : (stryCov_9fa48("1084"), {
      date: stryMutAct_9fa48("1085") ? "" : (stryCov_9fa48("1085"), "10.25.25"),
      title: stryMutAct_9fa48("1086") ? "" : (stryCov_9fa48("1086"), "Fireside Chat with David Yang"),
      time: stryMutAct_9fa48("1087") ? "" : (stryCov_9fa48("1087"), "2:30PM - 4:00 PM"),
      location: stryMutAct_9fa48("1088") ? "" : (stryCov_9fa48("1088"), "Pursuit HQ")
    }), stryMutAct_9fa48("1089") ? {} : (stryCov_9fa48("1089"), {
      date: stryMutAct_9fa48("1090") ? "" : (stryCov_9fa48("1090"), "10.26.25"),
      title: stryMutAct_9fa48("1091") ? "" : (stryCov_9fa48("1091"), "Presentation"),
      time: stryMutAct_9fa48("1092") ? "" : (stryCov_9fa48("1092"), "8:30PM - 11:00 PM"),
      location: stryMutAct_9fa48("1093") ? "Stryker was here!" : (stryCov_9fa48("1093"), "")
    })]);

    // Render regular dashboard content matching the Figma wireframe
    const renderDashboardContent = () => {
      if (stryMutAct_9fa48("1094")) {
        {}
      } else {
        stryCov_9fa48("1094");
        return <div className="dashboard">
        {/* Desktop View */}
        <div className="dashboard__desktop hidden md:block">
          {/* Greeting Section */}
          <div className="dashboard__greeting">
            <h1 className="dashboard__greeting-text">
              Hey {stryMutAct_9fa48("1097") ? user?.firstName && 'there' : stryMutAct_9fa48("1096") ? false : stryMutAct_9fa48("1095") ? true : (stryCov_9fa48("1095", "1096", "1097"), (stryMutAct_9fa48("1098") ? user.firstName : (stryCov_9fa48("1098"), user?.firstName)) || (stryMutAct_9fa48("1099") ? "" : (stryCov_9fa48("1099"), 'there')))}. Good to see you!
            </h1>
            <button className={stryMutAct_9fa48("1100") ? `` : (stryCov_9fa48("1100"), `dashboard__missed-assignments ${(stryMutAct_9fa48("1104") ? missedAssignmentsCount <= 0 : stryMutAct_9fa48("1103") ? missedAssignmentsCount >= 0 : stryMutAct_9fa48("1102") ? false : stryMutAct_9fa48("1101") ? true : (stryCov_9fa48("1101", "1102", "1103", "1104"), missedAssignmentsCount > 0)) ? stryMutAct_9fa48("1105") ? "" : (stryCov_9fa48("1105"), 'dashboard__missed-assignments--active') : stryMutAct_9fa48("1106") ? "Stryker was here!" : (stryCov_9fa48("1106"), '')}`)} onClick={handleMissedAssignmentsClick}>
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
                {stryMutAct_9fa48("1109") ? currentDay?.daily_goal && 'No goal set for today' : stryMutAct_9fa48("1108") ? false : stryMutAct_9fa48("1107") ? true : (stryCov_9fa48("1107", "1108", "1109"), (stryMutAct_9fa48("1110") ? currentDay.daily_goal : (stryCov_9fa48("1110"), currentDay?.daily_goal)) || (stryMutAct_9fa48("1111") ? "" : (stryCov_9fa48("1111"), 'No goal set for today')))}
              </p>
              <button className="dashboard__start-btn" onClick={handleContinueSession}>Start</button>
            </div>

            {/* Vertical Divider */}
            <div className="dashboard__vertical-divider"></div>

            {/* Upcoming Section */}
            <div className="dashboard__upcoming">
              <h2 className="dashboard__section-title">Upcoming</h2>
              <div className="dashboard__upcoming-list">
                {upcomingEvents.map(stryMutAct_9fa48("1112") ? () => undefined : (stryCov_9fa48("1112"), (event, index) => <div key={index} className="dashboard__upcoming-item">
                    <div className="dashboard__upcoming-content">
                      <span className="dashboard__upcoming-date">{event.date}</span>
                      <div className="dashboard__upcoming-details">
                        <p className="dashboard__upcoming-title">{event.title}</p>
                        <p className="dashboard__upcoming-time">{event.time}</p>
                        {stryMutAct_9fa48("1115") ? event.location || <p className="dashboard__upcoming-location">{event.location}</p> : stryMutAct_9fa48("1114") ? false : stryMutAct_9fa48("1113") ? true : (stryCov_9fa48("1113", "1114", "1115"), event.location && <p className="dashboard__upcoming-location">{event.location}</p>)}
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
              <span className={stryMutAct_9fa48("1116") ? `` : (stryCov_9fa48("1116"), `dashboard__week-subtitle ${(stryMutAct_9fa48("1119") ? slideDirection !== 'out-left' : stryMutAct_9fa48("1118") ? false : stryMutAct_9fa48("1117") ? true : (stryCov_9fa48("1117", "1118", "1119"), slideDirection === (stryMutAct_9fa48("1120") ? "" : (stryCov_9fa48("1120"), 'out-left')))) ? stryMutAct_9fa48("1121") ? "" : (stryCov_9fa48("1121"), 'animate__animated animate__fadeOutLeft') : (stryMutAct_9fa48("1124") ? slideDirection !== 'out-right' : stryMutAct_9fa48("1123") ? false : stryMutAct_9fa48("1122") ? true : (stryCov_9fa48("1122", "1123", "1124"), slideDirection === (stryMutAct_9fa48("1125") ? "" : (stryCov_9fa48("1125"), 'out-right')))) ? stryMutAct_9fa48("1126") ? "" : (stryCov_9fa48("1126"), 'animate__animated animate__fadeOutRight') : (stryMutAct_9fa48("1129") ? slideDirection !== 'in-from-left' : stryMutAct_9fa48("1128") ? false : stryMutAct_9fa48("1127") ? true : (stryCov_9fa48("1127", "1128", "1129"), slideDirection === (stryMutAct_9fa48("1130") ? "" : (stryCov_9fa48("1130"), 'in-from-left')))) ? stryMutAct_9fa48("1131") ? "" : (stryCov_9fa48("1131"), 'animate__animated animate__fadeInLeft') : (stryMutAct_9fa48("1134") ? slideDirection !== 'in-from-right' : stryMutAct_9fa48("1133") ? false : stryMutAct_9fa48("1132") ? true : (stryCov_9fa48("1132", "1133", "1134"), slideDirection === (stryMutAct_9fa48("1135") ? "" : (stryCov_9fa48("1135"), 'in-from-right')))) ? stryMutAct_9fa48("1136") ? "" : (stryCov_9fa48("1136"), 'animate__animated animate__fadeInRight') : stryMutAct_9fa48("1137") ? "Stryker was here!" : (stryCov_9fa48("1137"), '')}`)} style={stryMutAct_9fa48("1138") ? {} : (stryCov_9fa48("1138"), {
                  animationDuration: stryMutAct_9fa48("1139") ? "" : (stryCov_9fa48("1139"), '0.6s')
                })}>
                {weeklyGoal}
              </span>
            </div>

            <div className="dashboard__date-picker">
              <RippleButton variant="outline" size="icon" className={stryMutAct_9fa48("1140") ? `` : (stryCov_9fa48("1140"), `dashboard__date-btn ${(stryMutAct_9fa48("1144") ? currentWeek <= 1 : stryMutAct_9fa48("1143") ? currentWeek >= 1 : stryMutAct_9fa48("1142") ? false : stryMutAct_9fa48("1141") ? true : (stryCov_9fa48("1141", "1142", "1143", "1144"), currentWeek > 1)) ? stryMutAct_9fa48("1145") ? "" : (stryCov_9fa48("1145"), 'dashboard__date-btn--active') : stryMutAct_9fa48("1146") ? "Stryker was here!" : (stryCov_9fa48("1146"), '')}`)} style={stryMutAct_9fa48("1147") ? {} : (stryCov_9fa48("1147"), {
                  backgroundColor: stryMutAct_9fa48("1148") ? "" : (stryCov_9fa48("1148"), 'var(--color-background)'),
                  borderColor: stryMutAct_9fa48("1149") ? "" : (stryCov_9fa48("1149"), 'var(--color-pursuit-purple)'),
                  color: stryMutAct_9fa48("1150") ? "" : (stryCov_9fa48("1150"), 'var(--color-pursuit-purple)'),
                  '--ripple-button-ripple-color': stryMutAct_9fa48("1151") ? "" : (stryCov_9fa48("1151"), 'var(--color-pursuit-purple)')
                })} onClick={stryMutAct_9fa48("1152") ? () => undefined : (stryCov_9fa48("1152"), () => navigateToWeek(stryMutAct_9fa48("1153") ? "" : (stryCov_9fa48("1153"), 'prev')))} disabled={stryMutAct_9fa48("1156") ? (currentWeek <= 1 || isLoadingWeek) && slideDirection !== null : stryMutAct_9fa48("1155") ? false : stryMutAct_9fa48("1154") ? true : (stryCov_9fa48("1154", "1155", "1156"), (stryMutAct_9fa48("1158") ? currentWeek <= 1 && isLoadingWeek : stryMutAct_9fa48("1157") ? false : (stryCov_9fa48("1157", "1158"), (stryMutAct_9fa48("1161") ? currentWeek > 1 : stryMutAct_9fa48("1160") ? currentWeek < 1 : stryMutAct_9fa48("1159") ? false : (stryCov_9fa48("1159", "1160", "1161"), currentWeek <= 1)) || isLoadingWeek)) || (stryMutAct_9fa48("1163") ? slideDirection === null : stryMutAct_9fa48("1162") ? false : (stryCov_9fa48("1162", "1163"), slideDirection !== null)))}>
                <ChevronLeft className="w-4 h-4" />
              </RippleButton>
              <span className="dashboard__date-label">Week {currentWeek}</span>
              <RippleButton variant="outline" size="icon" className={stryMutAct_9fa48("1164") ? `` : (stryCov_9fa48("1164"), `dashboard__date-btn ${(stryMutAct_9fa48("1167") ? currentDay?.week || currentWeek < currentDay.week : stryMutAct_9fa48("1166") ? false : stryMutAct_9fa48("1165") ? true : (stryCov_9fa48("1165", "1166", "1167"), (stryMutAct_9fa48("1168") ? currentDay.week : (stryCov_9fa48("1168"), currentDay?.week)) && (stryMutAct_9fa48("1171") ? currentWeek >= currentDay.week : stryMutAct_9fa48("1170") ? currentWeek <= currentDay.week : stryMutAct_9fa48("1169") ? true : (stryCov_9fa48("1169", "1170", "1171"), currentWeek < currentDay.week)))) ? stryMutAct_9fa48("1172") ? "" : (stryCov_9fa48("1172"), 'dashboard__date-btn--active') : stryMutAct_9fa48("1173") ? "Stryker was here!" : (stryCov_9fa48("1173"), '')}`)} style={stryMutAct_9fa48("1174") ? {} : (stryCov_9fa48("1174"), {
                  backgroundColor: stryMutAct_9fa48("1175") ? "" : (stryCov_9fa48("1175"), 'var(--color-background)'),
                  borderColor: stryMutAct_9fa48("1176") ? "" : (stryCov_9fa48("1176"), 'var(--color-pursuit-purple)'),
                  color: stryMutAct_9fa48("1177") ? "" : (stryCov_9fa48("1177"), 'var(--color-pursuit-purple)'),
                  '--ripple-button-ripple-color': stryMutAct_9fa48("1178") ? "" : (stryCov_9fa48("1178"), 'var(--color-pursuit-purple)')
                })} onClick={stryMutAct_9fa48("1179") ? () => undefined : (stryCov_9fa48("1179"), () => navigateToWeek(stryMutAct_9fa48("1180") ? "" : (stryCov_9fa48("1180"), 'next')))} disabled={stryMutAct_9fa48("1183") ? (!currentDay?.week || currentWeek >= currentDay.week || isLoadingWeek) && slideDirection !== null : stryMutAct_9fa48("1182") ? false : stryMutAct_9fa48("1181") ? true : (stryCov_9fa48("1181", "1182", "1183"), (stryMutAct_9fa48("1185") ? (!currentDay?.week || currentWeek >= currentDay.week) && isLoadingWeek : stryMutAct_9fa48("1184") ? false : (stryCov_9fa48("1184", "1185"), (stryMutAct_9fa48("1187") ? !currentDay?.week && currentWeek >= currentDay.week : stryMutAct_9fa48("1186") ? false : (stryCov_9fa48("1186", "1187"), (stryMutAct_9fa48("1188") ? currentDay?.week : (stryCov_9fa48("1188"), !(stryMutAct_9fa48("1189") ? currentDay.week : (stryCov_9fa48("1189"), currentDay?.week)))) || (stryMutAct_9fa48("1192") ? currentWeek < currentDay.week : stryMutAct_9fa48("1191") ? currentWeek > currentDay.week : stryMutAct_9fa48("1190") ? false : (stryCov_9fa48("1190", "1191", "1192"), currentWeek >= currentDay.week)))) || isLoadingWeek)) || (stryMutAct_9fa48("1194") ? slideDirection === null : stryMutAct_9fa48("1193") ? false : (stryCov_9fa48("1193", "1194"), slideDirection !== null)))}>
                <ChevronRight className="w-4 h-4" />
              </RippleButton>
            </div>
          </div>

          {/* Weekly Agenda Cards */}
          <div className="dashboard__weekly-grid">
            {isLoadingWeek ? renderSkeletonCards() : weekData.map((day, index) => {
                if (stryMutAct_9fa48("1195")) {
                  {}
                } else {
                  stryCov_9fa48("1195");
                  const dayIsToday = isDateToday(day.day_date);
                  const dayIsPast = isDatePast(day.day_date);
                  const showCheckbox = stryMutAct_9fa48("1198") ? dayIsPast || !dayIsToday : stryMutAct_9fa48("1197") ? false : stryMutAct_9fa48("1196") ? true : (stryCov_9fa48("1196", "1197", "1198"), dayIsPast && (stryMutAct_9fa48("1199") ? dayIsToday : (stryCov_9fa48("1199"), !dayIsToday)));

                  // For slide-out-right and slide-in-from-left (next week flow), reverse the stagger
                  // so the animation flows from right to left
                  const isRightToLeft = stryMutAct_9fa48("1202") ? slideDirection === 'out-right' && slideDirection === 'in-from-left' : stryMutAct_9fa48("1201") ? false : stryMutAct_9fa48("1200") ? true : (stryCov_9fa48("1200", "1201", "1202"), (stryMutAct_9fa48("1204") ? slideDirection !== 'out-right' : stryMutAct_9fa48("1203") ? false : (stryCov_9fa48("1203", "1204"), slideDirection === (stryMutAct_9fa48("1205") ? "" : (stryCov_9fa48("1205"), 'out-right')))) || (stryMutAct_9fa48("1207") ? slideDirection !== 'in-from-left' : stryMutAct_9fa48("1206") ? false : (stryCov_9fa48("1206", "1207"), slideDirection === (stryMutAct_9fa48("1208") ? "" : (stryCov_9fa48("1208"), 'in-from-left')))));
                  const cardCount = weekData.length;
                  const delayIndex = isRightToLeft ? stryMutAct_9fa48("1209") ? cardCount - 1 + index : (stryCov_9fa48("1209"), (stryMutAct_9fa48("1210") ? cardCount + 1 : (stryCov_9fa48("1210"), cardCount - 1)) - index) : index;

                  // Determine Animate.css classes based on slide direction
                  let animateClass = stryMutAct_9fa48("1211") ? "Stryker was here!" : (stryCov_9fa48("1211"), '');
                  if (stryMutAct_9fa48("1214") ? slideDirection !== 'out-left' : stryMutAct_9fa48("1213") ? false : stryMutAct_9fa48("1212") ? true : (stryCov_9fa48("1212", "1213", "1214"), slideDirection === (stryMutAct_9fa48("1215") ? "" : (stryCov_9fa48("1215"), 'out-left')))) animateClass = stryMutAct_9fa48("1216") ? "" : (stryCov_9fa48("1216"), 'animate__animated animate__fadeOutLeft');else if (stryMutAct_9fa48("1219") ? slideDirection !== 'out-right' : stryMutAct_9fa48("1218") ? false : stryMutAct_9fa48("1217") ? true : (stryCov_9fa48("1217", "1218", "1219"), slideDirection === (stryMutAct_9fa48("1220") ? "" : (stryCov_9fa48("1220"), 'out-right')))) animateClass = stryMutAct_9fa48("1221") ? "" : (stryCov_9fa48("1221"), 'animate__animated animate__fadeOutRight');else if (stryMutAct_9fa48("1224") ? slideDirection !== 'in-from-left' : stryMutAct_9fa48("1223") ? false : stryMutAct_9fa48("1222") ? true : (stryCov_9fa48("1222", "1223", "1224"), slideDirection === (stryMutAct_9fa48("1225") ? "" : (stryCov_9fa48("1225"), 'in-from-left')))) animateClass = stryMutAct_9fa48("1226") ? "" : (stryCov_9fa48("1226"), 'animate__animated animate__fadeInLeft');else if (stryMutAct_9fa48("1229") ? slideDirection !== 'in-from-right' : stryMutAct_9fa48("1228") ? false : stryMutAct_9fa48("1227") ? true : (stryCov_9fa48("1227", "1228", "1229"), slideDirection === (stryMutAct_9fa48("1230") ? "" : (stryCov_9fa48("1230"), 'in-from-right')))) animateClass = stryMutAct_9fa48("1231") ? "" : (stryCov_9fa48("1231"), 'animate__animated animate__fadeInRight');

                  // Calculate completion status for past days
                  const deliverableTasks = stryMutAct_9fa48("1234") ? day.tasks?.filter(t => t.deliverable_type && ['video', 'document', 'link'].includes(t.deliverable_type)) && [] : stryMutAct_9fa48("1233") ? false : stryMutAct_9fa48("1232") ? true : (stryCov_9fa48("1232", "1233", "1234"), (stryMutAct_9fa48("1236") ? day.tasks.filter(t => t.deliverable_type && ['video', 'document', 'link'].includes(t.deliverable_type)) : stryMutAct_9fa48("1235") ? day.tasks : (stryCov_9fa48("1235", "1236"), day.tasks?.filter(stryMutAct_9fa48("1237") ? () => undefined : (stryCov_9fa48("1237"), t => stryMutAct_9fa48("1240") ? t.deliverable_type || ['video', 'document', 'link'].includes(t.deliverable_type) : stryMutAct_9fa48("1239") ? false : stryMutAct_9fa48("1238") ? true : (stryCov_9fa48("1238", "1239", "1240"), t.deliverable_type && (stryMutAct_9fa48("1241") ? [] : (stryCov_9fa48("1241"), [stryMutAct_9fa48("1242") ? "" : (stryCov_9fa48("1242"), 'video'), stryMutAct_9fa48("1243") ? "" : (stryCov_9fa48("1243"), 'document'), stryMutAct_9fa48("1244") ? "" : (stryCov_9fa48("1244"), 'link')])).includes(t.deliverable_type)))))) || (stryMutAct_9fa48("1245") ? ["Stryker was here"] : (stryCov_9fa48("1245"), [])));
                  const completedDeliverables = stryMutAct_9fa48("1246") ? deliverableTasks : (stryCov_9fa48("1246"), deliverableTasks.filter(stryMutAct_9fa48("1247") ? () => undefined : (stryCov_9fa48("1247"), t => t.hasSubmission)));
                  const isComplete = stryMutAct_9fa48("1250") ? deliverableTasks.length > 0 || deliverableTasks.length === completedDeliverables.length : stryMutAct_9fa48("1249") ? false : stryMutAct_9fa48("1248") ? true : (stryCov_9fa48("1248", "1249", "1250"), (stryMutAct_9fa48("1253") ? deliverableTasks.length <= 0 : stryMutAct_9fa48("1252") ? deliverableTasks.length >= 0 : stryMutAct_9fa48("1251") ? true : (stryCov_9fa48("1251", "1252", "1253"), deliverableTasks.length > 0)) && (stryMutAct_9fa48("1255") ? deliverableTasks.length !== completedDeliverables.length : stryMutAct_9fa48("1254") ? true : (stryCov_9fa48("1254", "1255"), deliverableTasks.length === completedDeliverables.length)));
                  return <div key={day.id} className={stryMutAct_9fa48("1256") ? `` : (stryCov_9fa48("1256"), `dashboard__day-card ${dayIsToday ? stryMutAct_9fa48("1257") ? "" : (stryCov_9fa48("1257"), 'dashboard__day-card--today') : stryMutAct_9fa48("1258") ? "Stryker was here!" : (stryCov_9fa48("1258"), '')} ${animateClass}`)} style={stryMutAct_9fa48("1259") ? {} : (stryCov_9fa48("1259"), {
                    animationDelay: stryMutAct_9fa48("1260") ? `` : (stryCov_9fa48("1260"), `${stryMutAct_9fa48("1261") ? delayIndex / 0.08 : (stryCov_9fa48("1261"), delayIndex * 0.08)}s`)
                  })}>
                  {/* Completion Badge (for past days only) */}
                  {stryMutAct_9fa48("1264") ? dayIsPast && !dayIsToday && deliverableTasks.length > 0 || <div className={`dashboard__completion-badge ${isComplete ? 'dashboard__completion-badge--complete' : 'dashboard__completion-badge--incomplete'}`}>
                      {isComplete ? 'Complete' : 'Incomplete'}
                    </div> : stryMutAct_9fa48("1263") ? false : stryMutAct_9fa48("1262") ? true : (stryCov_9fa48("1262", "1263", "1264"), (stryMutAct_9fa48("1266") ? dayIsPast && !dayIsToday || deliverableTasks.length > 0 : stryMutAct_9fa48("1265") ? true : (stryCov_9fa48("1265", "1266"), (stryMutAct_9fa48("1268") ? dayIsPast || !dayIsToday : stryMutAct_9fa48("1267") ? true : (stryCov_9fa48("1267", "1268"), dayIsPast && (stryMutAct_9fa48("1269") ? dayIsToday : (stryCov_9fa48("1269"), !dayIsToday)))) && (stryMutAct_9fa48("1272") ? deliverableTasks.length <= 0 : stryMutAct_9fa48("1271") ? deliverableTasks.length >= 0 : stryMutAct_9fa48("1270") ? true : (stryCov_9fa48("1270", "1271", "1272"), deliverableTasks.length > 0)))) && <div className={stryMutAct_9fa48("1273") ? `` : (stryCov_9fa48("1273"), `dashboard__completion-badge ${isComplete ? stryMutAct_9fa48("1274") ? "" : (stryCov_9fa48("1274"), 'dashboard__completion-badge--complete') : stryMutAct_9fa48("1275") ? "" : (stryCov_9fa48("1275"), 'dashboard__completion-badge--incomplete')}`)}>
                      {isComplete ? stryMutAct_9fa48("1276") ? "" : (stryCov_9fa48("1276"), 'Complete') : stryMutAct_9fa48("1277") ? "" : (stryCov_9fa48("1277"), 'Incomplete')}
                    </div>)}
                  
                  {/* Date */}
                  <div className="dashboard__day-date">
                    {(() => {
                        if (stryMutAct_9fa48("1278")) {
                          {}
                        } else {
                          stryCov_9fa48("1278");
                          const formattedDate = formatDayDate(day.day_date, dayIsToday);
                          return <>
                          {stryMutAct_9fa48("1281") ? formattedDate.prefix || <strong>{formattedDate.prefix}</strong> : stryMutAct_9fa48("1280") ? false : stryMutAct_9fa48("1279") ? true : (stryCov_9fa48("1279", "1280", "1281"), formattedDate.prefix && <strong>{formattedDate.prefix}</strong>)}
                          {formattedDate.date}
                        </>;
                        }
                      })()}
                  </div>
                  
                  {/* Separator */}
                  <div className="dashboard__day-separator" />
                  
                  {/* Activities */}
                  {stryMutAct_9fa48("1284") ? day.tasks && day.tasks.length > 0 || <div className="dashboard__day-section">
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
              </div> : stryMutAct_9fa48("1283") ? false : stryMutAct_9fa48("1282") ? true : (stryCov_9fa48("1282", "1283", "1284"), (stryMutAct_9fa48("1286") ? day.tasks || day.tasks.length > 0 : stryMutAct_9fa48("1285") ? true : (stryCov_9fa48("1285", "1286"), day.tasks && (stryMutAct_9fa48("1289") ? day.tasks.length <= 0 : stryMutAct_9fa48("1288") ? day.tasks.length >= 0 : stryMutAct_9fa48("1287") ? true : (stryCov_9fa48("1287", "1288", "1289"), day.tasks.length > 0)))) && <div className="dashboard__day-section">
                      <h4 className="dashboard__day-section-title">Activities</h4>
                      <div className="dashboard__day-activities">
                        {day.tasks.map((task, taskIndex) => {
                          if (stryMutAct_9fa48("1290")) {
                            {}
                          } else {
                            stryCov_9fa48("1290");
                            const isDeliverable = stryMutAct_9fa48("1293") ? task.deliverable_type || ['video', 'document', 'link'].includes(task.deliverable_type) : stryMutAct_9fa48("1292") ? false : stryMutAct_9fa48("1291") ? true : (stryCov_9fa48("1291", "1292", "1293"), task.deliverable_type && (stryMutAct_9fa48("1294") ? [] : (stryCov_9fa48("1294"), [stryMutAct_9fa48("1295") ? "" : (stryCov_9fa48("1295"), 'video'), stryMutAct_9fa48("1296") ? "" : (stryCov_9fa48("1296"), 'document'), stryMutAct_9fa48("1297") ? "" : (stryCov_9fa48("1297"), 'link')])).includes(task.deliverable_type));
                            const showTaskCheckbox = stryMutAct_9fa48("1300") ? dayIsPast || !dayIsToday : stryMutAct_9fa48("1299") ? false : stryMutAct_9fa48("1298") ? true : (stryCov_9fa48("1298", "1299", "1300"), dayIsPast && (stryMutAct_9fa48("1301") ? dayIsToday : (stryCov_9fa48("1301"), !dayIsToday)));
                            const hasSubmission = task.hasSubmission;
                            return <div key={task.id}>
                              <div className="dashboard__day-activity">
                                {/* Task Checkbox */}
                                {stryMutAct_9fa48("1304") ? showTaskCheckbox || <div className={`dashboard__task-checkbox ${hasSubmission ? 'dashboard__task-checkbox--complete' : isDeliverable ? 'dashboard__task-checkbox--incomplete' : 'dashboard__task-checkbox--complete'}`}>
                                    {isDeliverable && !hasSubmission ? <svg viewBox="0 0 8 8" className="dashboard__task-checkbox-x">
                                        <line x1="1" y1="1" x2="7" y2="7" />
                                        <line x1="7" y1="1" x2="1" y2="7" />
                                      </svg> : <svg viewBox="0 0 14 14" className="dashboard__task-checkbox-check">
                                        <polyline points="2,7 5,10 12,3" />
                                      </svg>}
                                  </div> : stryMutAct_9fa48("1303") ? false : stryMutAct_9fa48("1302") ? true : (stryCov_9fa48("1302", "1303", "1304"), showTaskCheckbox && <div className={stryMutAct_9fa48("1305") ? `` : (stryCov_9fa48("1305"), `dashboard__task-checkbox ${hasSubmission ? stryMutAct_9fa48("1306") ? "" : (stryCov_9fa48("1306"), 'dashboard__task-checkbox--complete') : isDeliverable ? stryMutAct_9fa48("1307") ? "" : (stryCov_9fa48("1307"), 'dashboard__task-checkbox--incomplete') : stryMutAct_9fa48("1308") ? "" : (stryCov_9fa48("1308"), 'dashboard__task-checkbox--complete')}`)}>
                                    {(stryMutAct_9fa48("1311") ? isDeliverable || !hasSubmission : stryMutAct_9fa48("1310") ? false : stryMutAct_9fa48("1309") ? true : (stryCov_9fa48("1309", "1310", "1311"), isDeliverable && (stryMutAct_9fa48("1312") ? hasSubmission : (stryCov_9fa48("1312"), !hasSubmission)))) ? <svg viewBox="0 0 8 8" className="dashboard__task-checkbox-x">
                                        <line x1="1" y1="1" x2="7" y2="7" />
                                        <line x1="7" y1="1" x2="1" y2="7" />
                                      </svg> : <svg viewBox="0 0 14 14" className="dashboard__task-checkbox-check">
                                        <polyline points="2,7 5,10 12,3" />
                                      </svg>}
                                  </div>)}
                                
                                <div className="dashboard__day-activity-content">
                                  <span className="dashboard__task-title">{task.task_title}</span>
                                  
                                  {/* Deliverable Submit Button */}
                                  {stryMutAct_9fa48("1315") ? isDeliverable || <button className={`dashboard__deliverable-link ${hasSubmission ? 'dashboard__deliverable-link--submitted' : 'dashboard__deliverable-link--pending'}`} onClick={() => navigate(`/learning?date=${day.day_date}&taskId=${task.id}`)}>
                                      Submit {task.deliverable_type}
                                    </button> : stryMutAct_9fa48("1314") ? false : stryMutAct_9fa48("1313") ? true : (stryCov_9fa48("1313", "1314", "1315"), isDeliverable && <button className={stryMutAct_9fa48("1316") ? `` : (stryCov_9fa48("1316"), `dashboard__deliverable-link ${hasSubmission ? stryMutAct_9fa48("1317") ? "" : (stryCov_9fa48("1317"), 'dashboard__deliverable-link--submitted') : stryMutAct_9fa48("1318") ? "" : (stryCov_9fa48("1318"), 'dashboard__deliverable-link--pending')}`)} onClick={stryMutAct_9fa48("1319") ? () => undefined : (stryCov_9fa48("1319"), () => navigate(stryMutAct_9fa48("1320") ? `` : (stryCov_9fa48("1320"), `/learning?date=${day.day_date}&taskId=${task.id}`)))}>
                                      Submit {task.deliverable_type}
                                    </button>)}
                                </div>
                              </div>
                              {stryMutAct_9fa48("1323") ? taskIndex < day.tasks.length - 1 || <div className="dashboard__activity-divider" /> : stryMutAct_9fa48("1322") ? false : stryMutAct_9fa48("1321") ? true : (stryCov_9fa48("1321", "1322", "1323"), (stryMutAct_9fa48("1326") ? taskIndex >= day.tasks.length - 1 : stryMutAct_9fa48("1325") ? taskIndex <= day.tasks.length - 1 : stryMutAct_9fa48("1324") ? true : (stryCov_9fa48("1324", "1325", "1326"), taskIndex < (stryMutAct_9fa48("1327") ? day.tasks.length + 1 : (stryCov_9fa48("1327"), day.tasks.length - 1)))) && <div className="dashboard__activity-divider" />)}
                            </div>;
                          }
                        })}
                      </div>
              </div>)}

                  {/* Go Button */}
                  {stryMutAct_9fa48("1330") ? dayIsToday || <button className="dashboard__go-btn dashboard__go-btn--today" onClick={handleContinueSession}>
                      Go
                    </button> : stryMutAct_9fa48("1329") ? false : stryMutAct_9fa48("1328") ? true : (stryCov_9fa48("1328", "1329", "1330"), dayIsToday && <button className="dashboard__go-btn dashboard__go-btn--today" onClick={handleContinueSession}>
                      Go
                    </button>)}
                  {stryMutAct_9fa48("1333") ? !dayIsToday && showCheckbox || <button className="dashboard__go-btn" onClick={handleContinueSession}>
                      Go
                    </button> : stryMutAct_9fa48("1332") ? false : stryMutAct_9fa48("1331") ? true : (stryCov_9fa48("1331", "1332", "1333"), (stryMutAct_9fa48("1335") ? !dayIsToday || showCheckbox : stryMutAct_9fa48("1334") ? true : (stryCov_9fa48("1334", "1335"), (stryMutAct_9fa48("1336") ? dayIsToday : (stryCov_9fa48("1336"), !dayIsToday)) && showCheckbox)) && <button className="dashboard__go-btn" onClick={handleContinueSession}>
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
              {stryMutAct_9fa48("1339") ? currentDay?.daily_goal && 'No goal set for today' : stryMutAct_9fa48("1338") ? false : stryMutAct_9fa48("1337") ? true : (stryCov_9fa48("1337", "1338", "1339"), (stryMutAct_9fa48("1340") ? currentDay.daily_goal : (stryCov_9fa48("1340"), currentDay?.daily_goal)) || (stryMutAct_9fa48("1341") ? "" : (stryCov_9fa48("1341"), 'No goal set for today')))}
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
            <RippleButton variant="outline" size="icon" className={stryMutAct_9fa48("1342") ? `` : (stryCov_9fa48("1342"), `dashboard__mobile-date-btn ${(stryMutAct_9fa48("1346") ? currentWeek <= 1 : stryMutAct_9fa48("1345") ? currentWeek >= 1 : stryMutAct_9fa48("1344") ? false : stryMutAct_9fa48("1343") ? true : (stryCov_9fa48("1343", "1344", "1345", "1346"), currentWeek > 1)) ? stryMutAct_9fa48("1347") ? "" : (stryCov_9fa48("1347"), 'dashboard__mobile-date-btn--active') : stryMutAct_9fa48("1348") ? "Stryker was here!" : (stryCov_9fa48("1348"), '')}`)} style={stryMutAct_9fa48("1349") ? {} : (stryCov_9fa48("1349"), {
                backgroundColor: stryMutAct_9fa48("1350") ? "" : (stryCov_9fa48("1350"), 'var(--color-background)'),
                borderColor: stryMutAct_9fa48("1351") ? "" : (stryCov_9fa48("1351"), 'var(--color-pursuit-purple)'),
                color: stryMutAct_9fa48("1352") ? "" : (stryCov_9fa48("1352"), 'var(--color-pursuit-purple)'),
                '--ripple-button-ripple-color': stryMutAct_9fa48("1353") ? "" : (stryCov_9fa48("1353"), 'var(--color-pursuit-purple)')
              })} onClick={stryMutAct_9fa48("1354") ? () => undefined : (stryCov_9fa48("1354"), () => navigateToWeek(stryMutAct_9fa48("1355") ? "" : (stryCov_9fa48("1355"), 'prev')))} disabled={stryMutAct_9fa48("1358") ? (currentWeek <= 1 || isLoadingWeek) && slideDirection !== null : stryMutAct_9fa48("1357") ? false : stryMutAct_9fa48("1356") ? true : (stryCov_9fa48("1356", "1357", "1358"), (stryMutAct_9fa48("1360") ? currentWeek <= 1 && isLoadingWeek : stryMutAct_9fa48("1359") ? false : (stryCov_9fa48("1359", "1360"), (stryMutAct_9fa48("1363") ? currentWeek > 1 : stryMutAct_9fa48("1362") ? currentWeek < 1 : stryMutAct_9fa48("1361") ? false : (stryCov_9fa48("1361", "1362", "1363"), currentWeek <= 1)) || isLoadingWeek)) || (stryMutAct_9fa48("1365") ? slideDirection === null : stryMutAct_9fa48("1364") ? false : (stryCov_9fa48("1364", "1365"), slideDirection !== null)))}>
              <ChevronLeft className="w-4 h-4" />
            </RippleButton>
            <span className="dashboard__mobile-date-label">Week {currentWeek}</span>
            <RippleButton variant="outline" size="icon" className={stryMutAct_9fa48("1366") ? `` : (stryCov_9fa48("1366"), `dashboard__mobile-date-btn ${(stryMutAct_9fa48("1369") ? currentDay?.week || currentWeek < currentDay.week : stryMutAct_9fa48("1368") ? false : stryMutAct_9fa48("1367") ? true : (stryCov_9fa48("1367", "1368", "1369"), (stryMutAct_9fa48("1370") ? currentDay.week : (stryCov_9fa48("1370"), currentDay?.week)) && (stryMutAct_9fa48("1373") ? currentWeek >= currentDay.week : stryMutAct_9fa48("1372") ? currentWeek <= currentDay.week : stryMutAct_9fa48("1371") ? true : (stryCov_9fa48("1371", "1372", "1373"), currentWeek < currentDay.week)))) ? stryMutAct_9fa48("1374") ? "" : (stryCov_9fa48("1374"), 'dashboard__mobile-date-btn--active') : stryMutAct_9fa48("1375") ? "Stryker was here!" : (stryCov_9fa48("1375"), '')}`)} style={stryMutAct_9fa48("1376") ? {} : (stryCov_9fa48("1376"), {
                backgroundColor: stryMutAct_9fa48("1377") ? "" : (stryCov_9fa48("1377"), 'var(--color-background)'),
                borderColor: stryMutAct_9fa48("1378") ? "" : (stryCov_9fa48("1378"), 'var(--color-pursuit-purple)'),
                color: stryMutAct_9fa48("1379") ? "" : (stryCov_9fa48("1379"), 'var(--color-pursuit-purple)'),
                '--ripple-button-ripple-color': stryMutAct_9fa48("1380") ? "" : (stryCov_9fa48("1380"), 'var(--color-pursuit-purple)')
              })} onClick={stryMutAct_9fa48("1381") ? () => undefined : (stryCov_9fa48("1381"), () => navigateToWeek(stryMutAct_9fa48("1382") ? "" : (stryCov_9fa48("1382"), 'next')))} disabled={stryMutAct_9fa48("1385") ? (!currentDay?.week || currentWeek >= currentDay.week || isLoadingWeek) && slideDirection !== null : stryMutAct_9fa48("1384") ? false : stryMutAct_9fa48("1383") ? true : (stryCov_9fa48("1383", "1384", "1385"), (stryMutAct_9fa48("1387") ? (!currentDay?.week || currentWeek >= currentDay.week) && isLoadingWeek : stryMutAct_9fa48("1386") ? false : (stryCov_9fa48("1386", "1387"), (stryMutAct_9fa48("1389") ? !currentDay?.week && currentWeek >= currentDay.week : stryMutAct_9fa48("1388") ? false : (stryCov_9fa48("1388", "1389"), (stryMutAct_9fa48("1390") ? currentDay?.week : (stryCov_9fa48("1390"), !(stryMutAct_9fa48("1391") ? currentDay.week : (stryCov_9fa48("1391"), currentDay?.week)))) || (stryMutAct_9fa48("1394") ? currentWeek < currentDay.week : stryMutAct_9fa48("1393") ? currentWeek > currentDay.week : stryMutAct_9fa48("1392") ? false : (stryCov_9fa48("1392", "1393", "1394"), currentWeek >= currentDay.week)))) || isLoadingWeek)) || (stryMutAct_9fa48("1396") ? slideDirection === null : stryMutAct_9fa48("1395") ? false : (stryCov_9fa48("1395", "1396"), slideDirection !== null)))}>
              <ChevronRight className="w-4 h-4" />
            </RippleButton>
          </div>

          {/* Weekly Agenda - Mobile */}
          <div className="dashboard__mobile-agenda">
            {weekData.map((day, index) => {
                if (stryMutAct_9fa48("1397")) {
                  {}
                } else {
                  stryCov_9fa48("1397");
                  const dayIsToday = isDateToday(day.day_date);
                  const dayIsPast = isDatePast(day.day_date);
                  if (stryMutAct_9fa48("1399") ? false : stryMutAct_9fa48("1398") ? true : (stryCov_9fa48("1398", "1399"), dayIsToday)) {
                    if (stryMutAct_9fa48("1400")) {
                      {}
                    } else {
                      stryCov_9fa48("1400");
                      // Today Card - expanded
                      return <div key={day.id} className="dashboard__mobile-today-card">
                    <div className="dashboard__mobile-today-header">
                      {(() => {
                            if (stryMutAct_9fa48("1401")) {
                              {}
                            } else {
                              stryCov_9fa48("1401");
                              const formattedDate = formatDayDate(day.day_date, stryMutAct_9fa48("1402") ? false : (stryCov_9fa48("1402"), true));
                              return <>
                            {stryMutAct_9fa48("1405") ? formattedDate.prefix || <strong>{formattedDate.prefix}</strong> : stryMutAct_9fa48("1404") ? false : stryMutAct_9fa48("1403") ? true : (stryCov_9fa48("1403", "1404", "1405"), formattedDate.prefix && <strong>{formattedDate.prefix}</strong>)}
                            {formattedDate.date}
                          </>;
                            }
                          })()}
                    </div>
                    <div className="dashboard__mobile-today-separator" />
                    {stryMutAct_9fa48("1408") ? day.tasks && day.tasks.length > 0 || <div className="dashboard__mobile-today-section">
                        <h4 className="dashboard__mobile-today-section-title">Activities</h4>
                        <div className="dashboard__mobile-today-activities">
                          {day.tasks.map((task, taskIndex) => <div key={task.id}>
                              <div className="dashboard__mobile-today-activity">{task.task_title}</div>
                              {taskIndex < day.tasks.length - 1 && <div className="dashboard__mobile-activity-divider" />}
                            </div>)}
                        </div>
                      </div> : stryMutAct_9fa48("1407") ? false : stryMutAct_9fa48("1406") ? true : (stryCov_9fa48("1406", "1407", "1408"), (stryMutAct_9fa48("1410") ? day.tasks || day.tasks.length > 0 : stryMutAct_9fa48("1409") ? true : (stryCov_9fa48("1409", "1410"), day.tasks && (stryMutAct_9fa48("1413") ? day.tasks.length <= 0 : stryMutAct_9fa48("1412") ? day.tasks.length >= 0 : stryMutAct_9fa48("1411") ? true : (stryCov_9fa48("1411", "1412", "1413"), day.tasks.length > 0)))) && <div className="dashboard__mobile-today-section">
                        <h4 className="dashboard__mobile-today-section-title">Activities</h4>
                        <div className="dashboard__mobile-today-activities">
                          {day.tasks.map(stryMutAct_9fa48("1414") ? () => undefined : (stryCov_9fa48("1414"), (task, taskIndex) => <div key={task.id}>
                              <div className="dashboard__mobile-today-activity">{task.task_title}</div>
                              {stryMutAct_9fa48("1417") ? taskIndex < day.tasks.length - 1 || <div className="dashboard__mobile-activity-divider" /> : stryMutAct_9fa48("1416") ? false : stryMutAct_9fa48("1415") ? true : (stryCov_9fa48("1415", "1416", "1417"), (stryMutAct_9fa48("1420") ? taskIndex >= day.tasks.length - 1 : stryMutAct_9fa48("1419") ? taskIndex <= day.tasks.length - 1 : stryMutAct_9fa48("1418") ? true : (stryCov_9fa48("1418", "1419", "1420"), taskIndex < (stryMutAct_9fa48("1421") ? day.tasks.length + 1 : (stryCov_9fa48("1421"), day.tasks.length - 1)))) && <div className="dashboard__mobile-activity-divider" />)}
                            </div>))}
                        </div>
                      </div>)}
          <button className="dashboard__mobile-go-btn" onClick={handleContinueSession}>
                      Go
          </button>
                  </div>;
                    }
                  } else {
                    if (stryMutAct_9fa48("1422")) {
                      {}
                    } else {
                      stryCov_9fa48("1422");
                      // Regular day card - condensed
                      return <div key={day.id} className="dashboard__mobile-day">
                    <div className="dashboard__mobile-day-header">
                      {formatDayDate(day.day_date, stryMutAct_9fa48("1423") ? true : (stryCov_9fa48("1423"), false)).full}
                    </div>
                    {stryMutAct_9fa48("1426") ? dayIsPast || <div className={`dashboard__mobile-checkbox ${day.completed ? 'dashboard__mobile-checkbox--checked' : ''}`} /> : stryMutAct_9fa48("1425") ? false : stryMutAct_9fa48("1424") ? true : (stryCov_9fa48("1424", "1425", "1426"), dayIsPast && <div className={stryMutAct_9fa48("1427") ? `` : (stryCov_9fa48("1427"), `dashboard__mobile-checkbox ${day.completed ? stryMutAct_9fa48("1428") ? "" : (stryCov_9fa48("1428"), 'dashboard__mobile-checkbox--checked') : stryMutAct_9fa48("1429") ? "Stryker was here!" : (stryCov_9fa48("1429"), '')}`)} />)}
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
              {upcomingEvents.map(stryMutAct_9fa48("1430") ? () => undefined : (stryCov_9fa48("1430"), (event, index) => <div key={index} className="dashboard__mobile-upcoming-item">
                  <div className="dashboard__mobile-upcoming-content">
                    <span className="dashboard__mobile-upcoming-date">{event.date}</span>
                    <div className="dashboard__mobile-upcoming-details">
                      <p className="dashboard__mobile-upcoming-title">{event.title}</p>
                      <p className="dashboard__mobile-upcoming-time">{event.time}</p>
                      {stryMutAct_9fa48("1433") ? event.location || <p className="dashboard__mobile-upcoming-location">{event.location}</p> : stryMutAct_9fa48("1432") ? false : stryMutAct_9fa48("1431") ? true : (stryCov_9fa48("1431", "1432", "1433"), event.location && <p className="dashboard__mobile-upcoming-location">{event.location}</p>)}
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
    if (stryMutAct_9fa48("1435") ? false : stryMutAct_9fa48("1434") ? true : (stryCov_9fa48("1434", "1435"), isLoading)) {
      if (stryMutAct_9fa48("1436")) {
        {}
      } else {
        stryCov_9fa48("1436");
        return <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground">Loading dashboard data...</div>
      </div>;
      }
    }
    return <>
      {stryMutAct_9fa48("1439") ? error || <div className="p-4 mx-6 mt-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
          </div> : stryMutAct_9fa48("1438") ? false : stryMutAct_9fa48("1437") ? true : (stryCov_9fa48("1437", "1438", "1439"), error && <div className="p-4 mx-6 mt-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
          </div>)}
      
      {/* Conditionally render based on user status and role */}
      {(stryMutAct_9fa48("1440") ? isActive : (stryCov_9fa48("1440"), !isActive)) ? renderHistoricalView() : isVolunteer ? renderVolunteerView() : renderDashboardContent()}

      {/* Missed Assignments Sidebar */}
      <MissedAssignmentsSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} onNavigateToDay={handleNavigateToDay} />
    </>;
  }
}
export default Dashboard;