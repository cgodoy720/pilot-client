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
  if (stryMutAct_9fa48("19423")) {
    {}
  } else {
    stryCov_9fa48("19423");
    const navigate = useNavigate();
    const {
      token,
      user
    } = useAuth();

    // Check if user has active status
    const isActive = stryMutAct_9fa48("19426") ? user?.active === false : stryMutAct_9fa48("19425") ? false : stryMutAct_9fa48("19424") ? true : (stryCov_9fa48("19424", "19425", "19426"), (stryMutAct_9fa48("19427") ? user.active : (stryCov_9fa48("19427"), user?.active)) !== (stryMutAct_9fa48("19428") ? true : (stryCov_9fa48("19428"), false)));
    // Check if user is volunteer
    const isVolunteer = stryMutAct_9fa48("19431") ? user?.role !== 'volunteer' : stryMutAct_9fa48("19430") ? false : stryMutAct_9fa48("19429") ? true : (stryCov_9fa48("19429", "19430", "19431"), (stryMutAct_9fa48("19432") ? user.role : (stryCov_9fa48("19432"), user?.role)) === (stryMutAct_9fa48("19433") ? "" : (stryCov_9fa48("19433"), 'volunteer')));
    const [isLoading, setIsLoading] = useState(stryMutAct_9fa48("19434") ? false : (stryCov_9fa48("19434"), true));
    const [error, setError] = useState(null);
    const [currentDay, setCurrentDay] = useState(null);
    const [dailyTasks, setDailyTasks] = useState(stryMutAct_9fa48("19435") ? ["Stryker was here"] : (stryCov_9fa48("19435"), []));
    const [objectives, setObjectives] = useState(stryMutAct_9fa48("19436") ? ["Stryker was here"] : (stryCov_9fa48("19436"), []));
    const [cohortFilter, setCohortFilter] = useState(null);
    const [missedAssignmentsCount, setMissedAssignmentsCount] = useState(0);
    const [weekData, setWeekData] = useState(stryMutAct_9fa48("19437") ? ["Stryker was here"] : (stryCov_9fa48("19437"), []));
    const [currentWeek, setCurrentWeek] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(null);
    const [weeklyGoal, setWeeklyGoal] = useState(stryMutAct_9fa48("19438") ? "Stryker was here!" : (stryCov_9fa48("19438"), ''));
    const [isLoadingWeek, setIsLoadingWeek] = useState(stryMutAct_9fa48("19439") ? true : (stryCov_9fa48("19439"), false));
    const [slideDirection, setSlideDirection] = useState(null); // 'left' or 'right'
    const [isSidebarOpen, setIsSidebarOpen] = useState(stryMutAct_9fa48("19440") ? true : (stryCov_9fa48("19440"), false));
    useEffect(() => {
      if (stryMutAct_9fa48("19441")) {
        {}
      } else {
        stryCov_9fa48("19441");
        // Only fetch dashboard data if user is active
        if (stryMutAct_9fa48("19443") ? false : stryMutAct_9fa48("19442") ? true : (stryCov_9fa48("19442", "19443"), isActive)) {
          if (stryMutAct_9fa48("19444")) {
            {}
          } else {
            stryCov_9fa48("19444");
            fetchDashboardData();
          }
        } else {
          if (stryMutAct_9fa48("19445")) {
            {}
          } else {
            stryCov_9fa48("19445");
            // If user is inactive, we don't need to load the dashboard data
            setIsLoading(stryMutAct_9fa48("19446") ? true : (stryCov_9fa48("19446"), false));
          }
        }
      }
    }, stryMutAct_9fa48("19447") ? [] : (stryCov_9fa48("19447"), [token, cohortFilter, user.role, isActive]));
    const fetchDashboardData = async () => {
      if (stryMutAct_9fa48("19448")) {
        {}
      } else {
        stryCov_9fa48("19448");
        try {
          if (stryMutAct_9fa48("19449")) {
            {}
          } else {
            stryCov_9fa48("19449");
            setIsLoading(stryMutAct_9fa48("19450") ? false : (stryCov_9fa48("19450"), true));
            setError(null);
            let url = stryMutAct_9fa48("19451") ? `` : (stryCov_9fa48("19451"), `${import.meta.env.VITE_API_URL}/api/progress/current-day`);

            // Add cohort parameter for staff/admin if selected
            if (stryMutAct_9fa48("19454") ? user.role === 'staff' || user.role === 'admin' || cohortFilter : stryMutAct_9fa48("19453") ? false : stryMutAct_9fa48("19452") ? true : (stryCov_9fa48("19452", "19453", "19454"), (stryMutAct_9fa48("19456") ? user.role === 'staff' && user.role === 'admin' : stryMutAct_9fa48("19455") ? true : (stryCov_9fa48("19455", "19456"), (stryMutAct_9fa48("19458") ? user.role !== 'staff' : stryMutAct_9fa48("19457") ? false : (stryCov_9fa48("19457", "19458"), user.role === (stryMutAct_9fa48("19459") ? "" : (stryCov_9fa48("19459"), 'staff')))) || (stryMutAct_9fa48("19461") ? user.role !== 'admin' : stryMutAct_9fa48("19460") ? false : (stryCov_9fa48("19460", "19461"), user.role === (stryMutAct_9fa48("19462") ? "" : (stryCov_9fa48("19462"), 'admin')))))) && cohortFilter)) {
              if (stryMutAct_9fa48("19463")) {
                {}
              } else {
                stryCov_9fa48("19463");
                url += stryMutAct_9fa48("19464") ? `` : (stryCov_9fa48("19464"), `?cohort=${encodeURIComponent(cohortFilter)}`);
              }
            }
            const response = await fetch(url, stryMutAct_9fa48("19465") ? {} : (stryCov_9fa48("19465"), {
              headers: stryMutAct_9fa48("19466") ? {} : (stryCov_9fa48("19466"), {
                'Authorization': stryMutAct_9fa48("19467") ? `` : (stryCov_9fa48("19467"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("19470") ? false : stryMutAct_9fa48("19469") ? true : stryMutAct_9fa48("19468") ? response.ok : (stryCov_9fa48("19468", "19469", "19470"), !response.ok)) {
              if (stryMutAct_9fa48("19471")) {
                {}
              } else {
                stryCov_9fa48("19471");
                const errorData = await response.json().catch(stryMutAct_9fa48("19472") ? () => undefined : (stryCov_9fa48("19472"), () => ({})));
                const error = new Error(stryMutAct_9fa48("19475") ? errorData.error && 'Failed to fetch dashboard data' : stryMutAct_9fa48("19474") ? false : stryMutAct_9fa48("19473") ? true : (stryCov_9fa48("19473", "19474", "19475"), errorData.error || (stryMutAct_9fa48("19476") ? "" : (stryCov_9fa48("19476"), 'Failed to fetch dashboard data'))));
                error.response = stryMutAct_9fa48("19477") ? {} : (stryCov_9fa48("19477"), {
                  status: response.status,
                  data: errorData
                });
                throw error;
              }
            }
            const data = await response.json();
            if (stryMutAct_9fa48("19480") ? data.message !== 'No schedule for today' : stryMutAct_9fa48("19479") ? false : stryMutAct_9fa48("19478") ? true : (stryCov_9fa48("19478", "19479", "19480"), data.message === (stryMutAct_9fa48("19481") ? "" : (stryCov_9fa48("19481"), 'No schedule for today')))) {
              if (stryMutAct_9fa48("19482")) {
                {}
              } else {
                stryCov_9fa48("19482");
                setIsLoading(stryMutAct_9fa48("19483") ? true : (stryCov_9fa48("19483"), false));
                return;
              }
            }

            // Process the data
            const timeBlocks = stryMutAct_9fa48("19486") ? data.timeBlocks && [] : stryMutAct_9fa48("19485") ? false : stryMutAct_9fa48("19484") ? true : (stryCov_9fa48("19484", "19485", "19486"), data.timeBlocks || (stryMutAct_9fa48("19487") ? ["Stryker was here"] : (stryCov_9fa48("19487"), [])));
            const taskProgress = Array.isArray(data.taskProgress) ? data.taskProgress : stryMutAct_9fa48("19488") ? ["Stryker was here"] : (stryCov_9fa48("19488"), []);

            // Extract tasks from all time blocks
            const allTasks = stryMutAct_9fa48("19489") ? ["Stryker was here"] : (stryCov_9fa48("19489"), []);
            timeBlocks.forEach(block => {
              if (stryMutAct_9fa48("19490")) {
                {}
              } else {
                stryCov_9fa48("19490");
                // Add tasks with their completion status
                block.tasks.forEach(task => {
                  if (stryMutAct_9fa48("19491")) {
                    {}
                  } else {
                    stryCov_9fa48("19491");
                    const taskCompleted = stryMutAct_9fa48("19494") ? taskProgress.find(progress => progress.task_id === task.id)?.status !== 'completed' : stryMutAct_9fa48("19493") ? false : stryMutAct_9fa48("19492") ? true : (stryCov_9fa48("19492", "19493", "19494"), (stryMutAct_9fa48("19495") ? taskProgress.find(progress => progress.task_id === task.id).status : (stryCov_9fa48("19495"), taskProgress.find(stryMutAct_9fa48("19496") ? () => undefined : (stryCov_9fa48("19496"), progress => stryMutAct_9fa48("19499") ? progress.task_id !== task.id : stryMutAct_9fa48("19498") ? false : stryMutAct_9fa48("19497") ? true : (stryCov_9fa48("19497", "19498", "19499"), progress.task_id === task.id)))?.status)) === (stryMutAct_9fa48("19500") ? "" : (stryCov_9fa48("19500"), 'completed')));
                    allTasks.push(stryMutAct_9fa48("19501") ? {} : (stryCov_9fa48("19501"), {
                      id: task.id,
                      time: formatTime(block.start_time),
                      title: task.task_title,
                      duration: stryMutAct_9fa48("19502") ? `` : (stryCov_9fa48("19502"), `${task.duration_minutes} min`),
                      type: task.task_type,
                      completed: taskCompleted
                    }));
                  }
                });
              }
            });

            // Set state with the processed data
            setCurrentDay(stryMutAct_9fa48("19505") ? data.day && {} : stryMutAct_9fa48("19504") ? false : stryMutAct_9fa48("19503") ? true : (stryCov_9fa48("19503", "19504", "19505"), data.day || {}));
            setDailyTasks(allTasks);

            // Get learning objectives from the day object
            const dayObjectives = (stryMutAct_9fa48("19508") ? data.day || data.day.learning_objectives : stryMutAct_9fa48("19507") ? false : stryMutAct_9fa48("19506") ? true : (stryCov_9fa48("19506", "19507", "19508"), data.day && data.day.learning_objectives)) ? data.day.learning_objectives : stryMutAct_9fa48("19509") ? ["Stryker was here"] : (stryCov_9fa48("19509"), []);
            setObjectives(dayObjectives);

            // Set missed assignments count
            setMissedAssignmentsCount(stryMutAct_9fa48("19512") ? data.missedAssignmentsCount && 0 : stryMutAct_9fa48("19511") ? false : stryMutAct_9fa48("19510") ? true : (stryCov_9fa48("19510", "19511", "19512"), data.missedAssignmentsCount || 0));

            // Set level, week, and weekly goal
            if (stryMutAct_9fa48("19514") ? false : stryMutAct_9fa48("19513") ? true : (stryCov_9fa48("19513", "19514"), data.day)) {
              if (stryMutAct_9fa48("19515")) {
                {}
              } else {
                stryCov_9fa48("19515");
                setCurrentLevel(stryMutAct_9fa48("19518") ? data.day.level && 1 : stryMutAct_9fa48("19517") ? false : stryMutAct_9fa48("19516") ? true : (stryCov_9fa48("19516", "19517", "19518"), data.day.level || 1));
                setCurrentWeek(data.day.week);
                setWeeklyGoal(stryMutAct_9fa48("19521") ? data.day.weekly_goal && '' : stryMutAct_9fa48("19520") ? false : stryMutAct_9fa48("19519") ? true : (stryCov_9fa48("19519", "19520", "19521"), data.day.weekly_goal || (stryMutAct_9fa48("19522") ? "Stryker was here!" : (stryCov_9fa48("19522"), ''))));

                // Fetch week data if week is available
                if (stryMutAct_9fa48("19524") ? false : stryMutAct_9fa48("19523") ? true : (stryCov_9fa48("19523", "19524"), data.day.week)) {
                  if (stryMutAct_9fa48("19525")) {
                    {}
                  } else {
                    stryCov_9fa48("19525");
                    await fetchWeekData(data.day.week);
                  }
                }
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("19526")) {
            {}
          } else {
            stryCov_9fa48("19526");
            console.error(stryMutAct_9fa48("19527") ? "" : (stryCov_9fa48("19527"), 'Error fetching dashboard data:'), error);
            setError(stryMutAct_9fa48("19528") ? "" : (stryCov_9fa48("19528"), 'Failed to load dashboard data. Please try again later.'));
          }
        } finally {
          if (stryMutAct_9fa48("19529")) {
            {}
          } else {
            stryCov_9fa48("19529");
            setIsLoading(stryMutAct_9fa48("19530") ? true : (stryCov_9fa48("19530"), false));
          }
        }
      }
    };
    const fetchWeekData = async weekNumber => {
      if (stryMutAct_9fa48("19531")) {
        {}
      } else {
        stryCov_9fa48("19531");
        try {
          if (stryMutAct_9fa48("19532")) {
            {}
          } else {
            stryCov_9fa48("19532");
            const cohortParam = (stryMutAct_9fa48("19535") ? user.role === 'staff' || user.role === 'admin' || cohortFilter : stryMutAct_9fa48("19534") ? false : stryMutAct_9fa48("19533") ? true : (stryCov_9fa48("19533", "19534", "19535"), (stryMutAct_9fa48("19537") ? user.role === 'staff' && user.role === 'admin' : stryMutAct_9fa48("19536") ? true : (stryCov_9fa48("19536", "19537"), (stryMutAct_9fa48("19539") ? user.role !== 'staff' : stryMutAct_9fa48("19538") ? false : (stryCov_9fa48("19538", "19539"), user.role === (stryMutAct_9fa48("19540") ? "" : (stryCov_9fa48("19540"), 'staff')))) || (stryMutAct_9fa48("19542") ? user.role !== 'admin' : stryMutAct_9fa48("19541") ? false : (stryCov_9fa48("19541", "19542"), user.role === (stryMutAct_9fa48("19543") ? "" : (stryCov_9fa48("19543"), 'admin')))))) && cohortFilter)) ? stryMutAct_9fa48("19544") ? `` : (stryCov_9fa48("19544"), `?cohort=${encodeURIComponent(cohortFilter)}`) : stryMutAct_9fa48("19545") ? "Stryker was here!" : (stryCov_9fa48("19545"), '');
            const response = await fetch(stryMutAct_9fa48("19546") ? `` : (stryCov_9fa48("19546"), `${import.meta.env.VITE_API_URL}/api/curriculum/weeks/${weekNumber}${cohortParam}`), stryMutAct_9fa48("19547") ? {} : (stryCov_9fa48("19547"), {
              headers: stryMutAct_9fa48("19548") ? {} : (stryCov_9fa48("19548"), {
                'Authorization': stryMutAct_9fa48("19549") ? `` : (stryCov_9fa48("19549"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("19552") ? false : stryMutAct_9fa48("19551") ? true : stryMutAct_9fa48("19550") ? response.ok : (stryCov_9fa48("19550", "19551", "19552"), !response.ok)) {
              if (stryMutAct_9fa48("19553")) {
                {}
              } else {
                stryCov_9fa48("19553");
                throw new Error(stryMutAct_9fa48("19554") ? "" : (stryCov_9fa48("19554"), 'Failed to fetch week data'));
              }
            }
            const days = await response.json();
            setWeekData(days);

            // Update weekly goal from the first day of the week
            if (stryMutAct_9fa48("19557") ? days && days.length > 0 || days[0].weekly_goal : stryMutAct_9fa48("19556") ? false : stryMutAct_9fa48("19555") ? true : (stryCov_9fa48("19555", "19556", "19557"), (stryMutAct_9fa48("19559") ? days || days.length > 0 : stryMutAct_9fa48("19558") ? true : (stryCov_9fa48("19558", "19559"), days && (stryMutAct_9fa48("19562") ? days.length <= 0 : stryMutAct_9fa48("19561") ? days.length >= 0 : stryMutAct_9fa48("19560") ? true : (stryCov_9fa48("19560", "19561", "19562"), days.length > 0)))) && days[0].weekly_goal)) {
              if (stryMutAct_9fa48("19563")) {
                {}
              } else {
                stryCov_9fa48("19563");
                setWeeklyGoal(days[0].weekly_goal);
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("19564")) {
            {}
          } else {
            stryCov_9fa48("19564");
            console.error(stryMutAct_9fa48("19565") ? "" : (stryCov_9fa48("19565"), 'Error fetching week data:'), error);
          }
        }
      }
    };
    const navigateToWeek = async direction => {
      if (stryMutAct_9fa48("19566")) {
        {}
      } else {
        stryCov_9fa48("19566");
        if (stryMutAct_9fa48("19569") ? !currentWeek && isLoadingWeek : stryMutAct_9fa48("19568") ? false : stryMutAct_9fa48("19567") ? true : (stryCov_9fa48("19567", "19568", "19569"), (stryMutAct_9fa48("19570") ? currentWeek : (stryCov_9fa48("19570"), !currentWeek)) || isLoadingWeek)) return;
        const newWeek = (stryMutAct_9fa48("19573") ? direction !== 'prev' : stryMutAct_9fa48("19572") ? false : stryMutAct_9fa48("19571") ? true : (stryCov_9fa48("19571", "19572", "19573"), direction === (stryMutAct_9fa48("19574") ? "" : (stryCov_9fa48("19574"), 'prev')))) ? stryMutAct_9fa48("19575") ? currentWeek + 1 : (stryCov_9fa48("19575"), currentWeek - 1) : stryMutAct_9fa48("19576") ? currentWeek - 1 : (stryCov_9fa48("19576"), currentWeek + 1);

        // Don't go below week 1
        if (stryMutAct_9fa48("19580") ? newWeek >= 1 : stryMutAct_9fa48("19579") ? newWeek <= 1 : stryMutAct_9fa48("19578") ? false : stryMutAct_9fa48("19577") ? true : (stryCov_9fa48("19577", "19578", "19579", "19580"), newWeek < 1)) return;

        // Don't go past the current week (the week from currentDay)
        if (stryMutAct_9fa48("19583") ? direction === 'next' && currentDay?.week || newWeek > currentDay.week : stryMutAct_9fa48("19582") ? false : stryMutAct_9fa48("19581") ? true : (stryCov_9fa48("19581", "19582", "19583"), (stryMutAct_9fa48("19585") ? direction === 'next' || currentDay?.week : stryMutAct_9fa48("19584") ? true : (stryCov_9fa48("19584", "19585"), (stryMutAct_9fa48("19587") ? direction !== 'next' : stryMutAct_9fa48("19586") ? true : (stryCov_9fa48("19586", "19587"), direction === (stryMutAct_9fa48("19588") ? "" : (stryCov_9fa48("19588"), 'next')))) && (stryMutAct_9fa48("19589") ? currentDay.week : (stryCov_9fa48("19589"), currentDay?.week)))) && (stryMutAct_9fa48("19592") ? newWeek <= currentDay.week : stryMutAct_9fa48("19591") ? newWeek >= currentDay.week : stryMutAct_9fa48("19590") ? true : (stryCov_9fa48("19590", "19591", "19592"), newWeek > currentDay.week)))) {
          if (stryMutAct_9fa48("19593")) {
            {}
          } else {
            stryCov_9fa48("19593");
            return;
          }
        }
        console.log(stryMutAct_9fa48("19594") ? "" : (stryCov_9fa48("19594"), '🎬 Navigate to week:'), direction, stryMutAct_9fa48("19595") ? "" : (stryCov_9fa48("19595"), 'New week:'), newWeek);

        // Phase 1: Slide out old cards
        const slideOutDirection = (stryMutAct_9fa48("19598") ? direction !== 'prev' : stryMutAct_9fa48("19597") ? false : stryMutAct_9fa48("19596") ? true : (stryCov_9fa48("19596", "19597", "19598"), direction === (stryMutAct_9fa48("19599") ? "" : (stryCov_9fa48("19599"), 'prev')))) ? stryMutAct_9fa48("19600") ? "" : (stryCov_9fa48("19600"), 'out-left') : stryMutAct_9fa48("19601") ? "" : (stryCov_9fa48("19601"), 'out-right');
        setSlideDirection(slideOutDirection);
        console.log(stryMutAct_9fa48("19602") ? "" : (stryCov_9fa48("19602"), '📤 Slide OUT direction:'), slideOutDirection);

        // Wait for slide-out animation (0.6s animation + 0.4s for 5 card stagger)
        await new Promise(stryMutAct_9fa48("19603") ? () => undefined : (stryCov_9fa48("19603"), resolve => setTimeout(resolve, 1000)));

        // Phase 2: Fetch new data while cards are off-screen
        setCurrentWeek(newWeek);
        await fetchWeekData(newWeek);

        // Phase 3: Slide in new cards from opposite direction
        const slideInDirection = (stryMutAct_9fa48("19606") ? direction !== 'prev' : stryMutAct_9fa48("19605") ? false : stryMutAct_9fa48("19604") ? true : (stryCov_9fa48("19604", "19605", "19606"), direction === (stryMutAct_9fa48("19607") ? "" : (stryCov_9fa48("19607"), 'prev')))) ? stryMutAct_9fa48("19608") ? "" : (stryCov_9fa48("19608"), 'in-from-right') : stryMutAct_9fa48("19609") ? "" : (stryCov_9fa48("19609"), 'in-from-left');
        console.log(stryMutAct_9fa48("19610") ? "" : (stryCov_9fa48("19610"), '📥 Slide IN direction:'), slideInDirection);
        setSlideDirection(slideInDirection);
        setIsLoadingWeek(stryMutAct_9fa48("19611") ? true : (stryCov_9fa48("19611"), false));

        // Reset after slide-in completes (0.6s animation + 0.4s stagger)
        setTimeout(() => {
          if (stryMutAct_9fa48("19612")) {
            {}
          } else {
            stryCov_9fa48("19612");
            console.log(stryMutAct_9fa48("19613") ? "" : (stryCov_9fa48("19613"), '✅ Animation complete, resetting'));
            setSlideDirection(null);
          }
        }, 1000);
      }
    };

    // Handle continue session button click
    const handleContinueSession = () => {
      if (stryMutAct_9fa48("19614")) {
        {}
      } else {
        stryCov_9fa48("19614");
        if (stryMutAct_9fa48("19617") ? false : stryMutAct_9fa48("19616") ? true : stryMutAct_9fa48("19615") ? isActive : (stryCov_9fa48("19615", "19616", "19617"), !isActive)) {
          if (stryMutAct_9fa48("19618")) {
            {}
          } else {
            stryCov_9fa48("19618");
            setError(stryMutAct_9fa48("19619") ? "" : (stryCov_9fa48("19619"), 'You have historical access only and cannot access new learning sessions.'));
            return;
          }
        }
        const cohortParam = (stryMutAct_9fa48("19622") ? user.role === 'staff' || user.role === 'admin' || cohortFilter : stryMutAct_9fa48("19621") ? false : stryMutAct_9fa48("19620") ? true : (stryCov_9fa48("19620", "19621", "19622"), (stryMutAct_9fa48("19624") ? user.role === 'staff' && user.role === 'admin' : stryMutAct_9fa48("19623") ? true : (stryCov_9fa48("19623", "19624"), (stryMutAct_9fa48("19626") ? user.role !== 'staff' : stryMutAct_9fa48("19625") ? false : (stryCov_9fa48("19625", "19626"), user.role === (stryMutAct_9fa48("19627") ? "" : (stryCov_9fa48("19627"), 'staff')))) || (stryMutAct_9fa48("19629") ? user.role !== 'admin' : stryMutAct_9fa48("19628") ? false : (stryCov_9fa48("19628", "19629"), user.role === (stryMutAct_9fa48("19630") ? "" : (stryCov_9fa48("19630"), 'admin')))))) && cohortFilter)) ? stryMutAct_9fa48("19631") ? `` : (stryCov_9fa48("19631"), `?cohort=${encodeURIComponent(cohortFilter)}`) : stryMutAct_9fa48("19632") ? "Stryker was here!" : (stryCov_9fa48("19632"), '');
        navigate(stryMutAct_9fa48("19633") ? `` : (stryCov_9fa48("19633"), `/learning${cohortParam}`));
      }
    };

    // Navigate to the specific task in the Learning page
    const navigateToTask = taskId => {
      if (stryMutAct_9fa48("19634")) {
        {}
      } else {
        stryCov_9fa48("19634");
        if (stryMutAct_9fa48("19637") ? false : stryMutAct_9fa48("19636") ? true : stryMutAct_9fa48("19635") ? isActive : (stryCov_9fa48("19635", "19636", "19637"), !isActive)) {
          if (stryMutAct_9fa48("19638")) {
            {}
          } else {
            stryCov_9fa48("19638");
            setError(stryMutAct_9fa48("19639") ? "" : (stryCov_9fa48("19639"), 'You have historical access only and cannot access new learning sessions.'));
            return;
          }
        }
        const cohortParam = (stryMutAct_9fa48("19642") ? user.role === 'staff' || user.role === 'admin' || cohortFilter : stryMutAct_9fa48("19641") ? false : stryMutAct_9fa48("19640") ? true : (stryCov_9fa48("19640", "19641", "19642"), (stryMutAct_9fa48("19644") ? user.role === 'staff' && user.role === 'admin' : stryMutAct_9fa48("19643") ? true : (stryCov_9fa48("19643", "19644"), (stryMutAct_9fa48("19646") ? user.role !== 'staff' : stryMutAct_9fa48("19645") ? false : (stryCov_9fa48("19645", "19646"), user.role === (stryMutAct_9fa48("19647") ? "" : (stryCov_9fa48("19647"), 'staff')))) || (stryMutAct_9fa48("19649") ? user.role !== 'admin' : stryMutAct_9fa48("19648") ? false : (stryCov_9fa48("19648", "19649"), user.role === (stryMutAct_9fa48("19650") ? "" : (stryCov_9fa48("19650"), 'admin')))))) && cohortFilter)) ? stryMutAct_9fa48("19651") ? `` : (stryCov_9fa48("19651"), `&cohort=${encodeURIComponent(cohortFilter)}`) : stryMutAct_9fa48("19652") ? "Stryker was here!" : (stryCov_9fa48("19652"), '');
        navigate(stryMutAct_9fa48("19653") ? `` : (stryCov_9fa48("19653"), `/learning?taskId=${taskId}${cohortParam}`));
      }
    };

    // Navigate to calendar for historical viewing
    const navigateToCalendar = () => {
      if (stryMutAct_9fa48("19654")) {
        {}
      } else {
        stryCov_9fa48("19654");
        navigate(stryMutAct_9fa48("19655") ? "" : (stryCov_9fa48("19655"), '/calendar'));
      }
    };

    // Add a helper function to format time from 24-hour to 12-hour format
    const formatTime = timeString => {
      if (stryMutAct_9fa48("19656")) {
        {}
      } else {
        stryCov_9fa48("19656");
        if (stryMutAct_9fa48("19659") ? false : stryMutAct_9fa48("19658") ? true : stryMutAct_9fa48("19657") ? timeString : (stryCov_9fa48("19657", "19658", "19659"), !timeString)) return stryMutAct_9fa48("19660") ? "Stryker was here!" : (stryCov_9fa48("19660"), '');
        const timeParts = timeString.split(stryMutAct_9fa48("19661") ? "" : (stryCov_9fa48("19661"), ':'));
        const hours = parseInt(timeParts[0], 10);
        const minutes = timeParts[1];
        const period = (stryMutAct_9fa48("19665") ? hours < 12 : stryMutAct_9fa48("19664") ? hours > 12 : stryMutAct_9fa48("19663") ? false : stryMutAct_9fa48("19662") ? true : (stryCov_9fa48("19662", "19663", "19664", "19665"), hours >= 12)) ? stryMutAct_9fa48("19666") ? "" : (stryCov_9fa48("19666"), 'PM') : stryMutAct_9fa48("19667") ? "" : (stryCov_9fa48("19667"), 'AM');
        const formattedHours = stryMutAct_9fa48("19670") ? hours % 12 && 12 : stryMutAct_9fa48("19669") ? false : stryMutAct_9fa48("19668") ? true : (stryCov_9fa48("19668", "19669", "19670"), (stryMutAct_9fa48("19671") ? hours * 12 : (stryCov_9fa48("19671"), hours % 12)) || 12);
        return stryMutAct_9fa48("19672") ? `` : (stryCov_9fa48("19672"), `${formattedHours}:${minutes} ${period}`);
      }
    };

    // Format date for display (e.g., "10.2 SAT" or "TODAY 10.22 MON")
    const formatDayDate = (dateString, isToday = stryMutAct_9fa48("19673") ? true : (stryCov_9fa48("19673"), false)) => {
      if (stryMutAct_9fa48("19674")) {
        {}
      } else {
        stryCov_9fa48("19674");
        if (stryMutAct_9fa48("19677") ? false : stryMutAct_9fa48("19676") ? true : stryMutAct_9fa48("19675") ? dateString : (stryCov_9fa48("19675", "19676", "19677"), !dateString)) return stryMutAct_9fa48("19678") ? {} : (stryCov_9fa48("19678"), {
          prefix: stryMutAct_9fa48("19679") ? "Stryker was here!" : (stryCov_9fa48("19679"), ''),
          date: stryMutAct_9fa48("19680") ? "Stryker was here!" : (stryCov_9fa48("19680"), ''),
          full: stryMutAct_9fa48("19681") ? "Stryker was here!" : (stryCov_9fa48("19681"), '')
        });
        // Handle ISO timestamps or simple date strings
        const date = new Date(dateString);
        const month = stryMutAct_9fa48("19682") ? date.getMonth() - 1 : (stryCov_9fa48("19682"), date.getMonth() + 1);
        const day = date.getDate();
        const dayOfWeek = stryMutAct_9fa48("19683") ? date.toLocaleDateString('en-US', {
          weekday: 'short'
        }).toLowerCase() : (stryCov_9fa48("19683"), date.toLocaleDateString(stryMutAct_9fa48("19684") ? "" : (stryCov_9fa48("19684"), 'en-US'), stryMutAct_9fa48("19685") ? {} : (stryCov_9fa48("19685"), {
          weekday: stryMutAct_9fa48("19686") ? "" : (stryCov_9fa48("19686"), 'short')
        })).toUpperCase());
        const dateStr = stryMutAct_9fa48("19687") ? `` : (stryCov_9fa48("19687"), `${month}.${day} ${dayOfWeek}`);
        if (stryMutAct_9fa48("19689") ? false : stryMutAct_9fa48("19688") ? true : (stryCov_9fa48("19688", "19689"), isToday)) {
          if (stryMutAct_9fa48("19690")) {
            {}
          } else {
            stryCov_9fa48("19690");
            return stryMutAct_9fa48("19691") ? {} : (stryCov_9fa48("19691"), {
              prefix: stryMutAct_9fa48("19692") ? "" : (stryCov_9fa48("19692"), 'TODAY '),
              date: dateStr,
              full: stryMutAct_9fa48("19693") ? `` : (stryCov_9fa48("19693"), `TODAY ${dateStr}`)
            });
          }
        }
        return stryMutAct_9fa48("19694") ? {} : (stryCov_9fa48("19694"), {
          prefix: stryMutAct_9fa48("19695") ? "Stryker was here!" : (stryCov_9fa48("19695"), ''),
          date: dateStr,
          full: dateStr
        });
      }
    };

    // Check if a date is today
    const isDateToday = dateString => {
      if (stryMutAct_9fa48("19696")) {
        {}
      } else {
        stryCov_9fa48("19696");
        if (stryMutAct_9fa48("19699") ? false : stryMutAct_9fa48("19698") ? true : stryMutAct_9fa48("19697") ? dateString : (stryCov_9fa48("19697", "19698", "19699"), !dateString)) return stryMutAct_9fa48("19700") ? true : (stryCov_9fa48("19700"), false);
        const date = new Date(dateString);
        const today = new Date();
        return stryMutAct_9fa48("19703") ? date.getDate() === today.getDate() && date.getMonth() === today.getMonth() || date.getFullYear() === today.getFullYear() : stryMutAct_9fa48("19702") ? false : stryMutAct_9fa48("19701") ? true : (stryCov_9fa48("19701", "19702", "19703"), (stryMutAct_9fa48("19705") ? date.getDate() === today.getDate() || date.getMonth() === today.getMonth() : stryMutAct_9fa48("19704") ? true : (stryCov_9fa48("19704", "19705"), (stryMutAct_9fa48("19707") ? date.getDate() !== today.getDate() : stryMutAct_9fa48("19706") ? true : (stryCov_9fa48("19706", "19707"), date.getDate() === today.getDate())) && (stryMutAct_9fa48("19709") ? date.getMonth() !== today.getMonth() : stryMutAct_9fa48("19708") ? true : (stryCov_9fa48("19708", "19709"), date.getMonth() === today.getMonth())))) && (stryMutAct_9fa48("19711") ? date.getFullYear() !== today.getFullYear() : stryMutAct_9fa48("19710") ? true : (stryCov_9fa48("19710", "19711"), date.getFullYear() === today.getFullYear())));
      }
    };

    // Check if date is in the past
    const isDatePast = dateString => {
      if (stryMutAct_9fa48("19712")) {
        {}
      } else {
        stryCov_9fa48("19712");
        if (stryMutAct_9fa48("19715") ? false : stryMutAct_9fa48("19714") ? true : stryMutAct_9fa48("19713") ? dateString : (stryCov_9fa48("19713", "19714", "19715"), !dateString)) return stryMutAct_9fa48("19716") ? true : (stryCov_9fa48("19716"), false);
        const date = new Date(dateString);
        const today = new Date();
        stryMutAct_9fa48("19717") ? today.setMinutes(0, 0, 0, 0) : (stryCov_9fa48("19717"), today.setHours(0, 0, 0, 0));
        return stryMutAct_9fa48("19721") ? date >= today : stryMutAct_9fa48("19720") ? date <= today : stryMutAct_9fa48("19719") ? false : stryMutAct_9fa48("19718") ? true : (stryCov_9fa48("19718", "19719", "19720", "19721"), date < today);
      }
    };

    // Navigate to volunteer feedback
    const navigateToVolunteerFeedback = () => {
      if (stryMutAct_9fa48("19722")) {
        {}
      } else {
        stryCov_9fa48("19722");
        navigate(stryMutAct_9fa48("19723") ? "" : (stryCov_9fa48("19723"), '/volunteer-feedback'));
      }
    };

    // Handle opening missed assignments sidebar
    const handleMissedAssignmentsClick = () => {
      if (stryMutAct_9fa48("19724")) {
        {}
      } else {
        stryCov_9fa48("19724");
        setIsSidebarOpen(stryMutAct_9fa48("19725") ? false : (stryCov_9fa48("19725"), true));
      }
    };

    // Handle closing sidebar
    const handleCloseSidebar = () => {
      if (stryMutAct_9fa48("19726")) {
        {}
      } else {
        stryCov_9fa48("19726");
        setIsSidebarOpen(stryMutAct_9fa48("19727") ? true : (stryCov_9fa48("19727"), false));
      }
    };

    // Handle navigation from sidebar to specific day/task
    const handleNavigateToDay = (dayId, taskId) => {
      if (stryMutAct_9fa48("19728")) {
        {}
      } else {
        stryCov_9fa48("19728");
        // Navigate to the day view with the task highlighted
        navigate(stryMutAct_9fa48("19729") ? `` : (stryCov_9fa48("19729"), `/calendar?day=${dayId}&task=${taskId}`));
      }
    };

    // Render skeleton loading cards
    const renderSkeletonCards = () => {
      if (stryMutAct_9fa48("19730")) {
        {}
      } else {
        stryCov_9fa48("19730");
        return stryMutAct_9fa48("19731") ? Array().fill(0).map((_, index) => <div key={`skeleton-${index}`} className="dashboard__day-card dashboard__day-card--skeleton">
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
      </div>) : (stryCov_9fa48("19731"), Array(5).fill(0).map(stryMutAct_9fa48("19732") ? () => undefined : (stryCov_9fa48("19732"), (_, index) => <div key={stryMutAct_9fa48("19733") ? `` : (stryCov_9fa48("19733"), `skeleton-${index}`)} className="dashboard__day-card dashboard__day-card--skeleton">
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
      if (stryMutAct_9fa48("19734")) {
        {}
      } else {
        stryCov_9fa48("19734");
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
      if (stryMutAct_9fa48("19735")) {
        {}
      } else {
        stryCov_9fa48("19735");
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
    const upcomingEvents = stryMutAct_9fa48("19736") ? [] : (stryCov_9fa48("19736"), [stryMutAct_9fa48("19737") ? {} : (stryCov_9fa48("19737"), {
      date: stryMutAct_9fa48("19738") ? "" : (stryCov_9fa48("19738"), "10.15.25"),
      title: stryMutAct_9fa48("19739") ? "" : (stryCov_9fa48("19739"), "Demo Day"),
      time: stryMutAct_9fa48("19740") ? "" : (stryCov_9fa48("19740"), "8:30PM - 11:00 PM"),
      location: stryMutAct_9fa48("19741") ? "" : (stryCov_9fa48("19741"), "Blackrock")
    }), stryMutAct_9fa48("19742") ? {} : (stryCov_9fa48("19742"), {
      date: stryMutAct_9fa48("19743") ? "" : (stryCov_9fa48("19743"), "10.25.25"),
      title: stryMutAct_9fa48("19744") ? "" : (stryCov_9fa48("19744"), "Fireside Chat with David Yang"),
      time: stryMutAct_9fa48("19745") ? "" : (stryCov_9fa48("19745"), "2:30PM - 4:00 PM"),
      location: stryMutAct_9fa48("19746") ? "" : (stryCov_9fa48("19746"), "Pursuit HQ")
    }), stryMutAct_9fa48("19747") ? {} : (stryCov_9fa48("19747"), {
      date: stryMutAct_9fa48("19748") ? "" : (stryCov_9fa48("19748"), "10.26.25"),
      title: stryMutAct_9fa48("19749") ? "" : (stryCov_9fa48("19749"), "Presentation"),
      time: stryMutAct_9fa48("19750") ? "" : (stryCov_9fa48("19750"), "8:30PM - 11:00 PM"),
      location: stryMutAct_9fa48("19751") ? "Stryker was here!" : (stryCov_9fa48("19751"), "")
    })]);

    // Render regular dashboard content matching the Figma wireframe
    const renderDashboardContent = () => {
      if (stryMutAct_9fa48("19752")) {
        {}
      } else {
        stryCov_9fa48("19752");
        return <div className="dashboard">
        {/* Desktop View */}
        <div className="dashboard__desktop hidden md:block">
          {/* Greeting Section */}
          <div className="dashboard__greeting">
            <h1 className="dashboard__greeting-text">
              Hey {stryMutAct_9fa48("19755") ? user?.firstName && 'there' : stryMutAct_9fa48("19754") ? false : stryMutAct_9fa48("19753") ? true : (stryCov_9fa48("19753", "19754", "19755"), (stryMutAct_9fa48("19756") ? user.firstName : (stryCov_9fa48("19756"), user?.firstName)) || (stryMutAct_9fa48("19757") ? "" : (stryCov_9fa48("19757"), 'there')))}. Good to see you!
            </h1>
            <button className={stryMutAct_9fa48("19758") ? `` : (stryCov_9fa48("19758"), `dashboard__missed-assignments ${(stryMutAct_9fa48("19762") ? missedAssignmentsCount <= 0 : stryMutAct_9fa48("19761") ? missedAssignmentsCount >= 0 : stryMutAct_9fa48("19760") ? false : stryMutAct_9fa48("19759") ? true : (stryCov_9fa48("19759", "19760", "19761", "19762"), missedAssignmentsCount > 0)) ? stryMutAct_9fa48("19763") ? "" : (stryCov_9fa48("19763"), 'dashboard__missed-assignments--active') : stryMutAct_9fa48("19764") ? "Stryker was here!" : (stryCov_9fa48("19764"), '')}`)} onClick={handleMissedAssignmentsClick}>
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
                {stryMutAct_9fa48("19767") ? currentDay?.daily_goal && 'No goal set for today' : stryMutAct_9fa48("19766") ? false : stryMutAct_9fa48("19765") ? true : (stryCov_9fa48("19765", "19766", "19767"), (stryMutAct_9fa48("19768") ? currentDay.daily_goal : (stryCov_9fa48("19768"), currentDay?.daily_goal)) || (stryMutAct_9fa48("19769") ? "" : (stryCov_9fa48("19769"), 'No goal set for today')))}
              </p>
              <button className="dashboard__start-btn" onClick={handleContinueSession}>Start</button>
            </div>

            {/* Vertical Divider */}
            <div className="dashboard__vertical-divider"></div>

            {/* Upcoming Section */}
            <div className="dashboard__upcoming">
              <h2 className="dashboard__section-title">Upcoming</h2>
              <div className="dashboard__upcoming-list">
                {upcomingEvents.map(stryMutAct_9fa48("19770") ? () => undefined : (stryCov_9fa48("19770"), (event, index) => <div key={index} className="dashboard__upcoming-item">
                    <div className="dashboard__upcoming-content">
                      <span className="dashboard__upcoming-date">{event.date}</span>
                      <div className="dashboard__upcoming-details">
                        <p className="dashboard__upcoming-title">{event.title}</p>
                        <p className="dashboard__upcoming-time">{event.time}</p>
                        {stryMutAct_9fa48("19773") ? event.location || <p className="dashboard__upcoming-location">{event.location}</p> : stryMutAct_9fa48("19772") ? false : stryMutAct_9fa48("19771") ? true : (stryCov_9fa48("19771", "19772", "19773"), event.location && <p className="dashboard__upcoming-location">{event.location}</p>)}
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
              <span className={stryMutAct_9fa48("19774") ? `` : (stryCov_9fa48("19774"), `dashboard__week-subtitle ${(stryMutAct_9fa48("19777") ? slideDirection !== 'out-left' : stryMutAct_9fa48("19776") ? false : stryMutAct_9fa48("19775") ? true : (stryCov_9fa48("19775", "19776", "19777"), slideDirection === (stryMutAct_9fa48("19778") ? "" : (stryCov_9fa48("19778"), 'out-left')))) ? stryMutAct_9fa48("19779") ? "" : (stryCov_9fa48("19779"), 'animate__animated animate__fadeOutLeft') : (stryMutAct_9fa48("19782") ? slideDirection !== 'out-right' : stryMutAct_9fa48("19781") ? false : stryMutAct_9fa48("19780") ? true : (stryCov_9fa48("19780", "19781", "19782"), slideDirection === (stryMutAct_9fa48("19783") ? "" : (stryCov_9fa48("19783"), 'out-right')))) ? stryMutAct_9fa48("19784") ? "" : (stryCov_9fa48("19784"), 'animate__animated animate__fadeOutRight') : (stryMutAct_9fa48("19787") ? slideDirection !== 'in-from-left' : stryMutAct_9fa48("19786") ? false : stryMutAct_9fa48("19785") ? true : (stryCov_9fa48("19785", "19786", "19787"), slideDirection === (stryMutAct_9fa48("19788") ? "" : (stryCov_9fa48("19788"), 'in-from-left')))) ? stryMutAct_9fa48("19789") ? "" : (stryCov_9fa48("19789"), 'animate__animated animate__fadeInLeft') : (stryMutAct_9fa48("19792") ? slideDirection !== 'in-from-right' : stryMutAct_9fa48("19791") ? false : stryMutAct_9fa48("19790") ? true : (stryCov_9fa48("19790", "19791", "19792"), slideDirection === (stryMutAct_9fa48("19793") ? "" : (stryCov_9fa48("19793"), 'in-from-right')))) ? stryMutAct_9fa48("19794") ? "" : (stryCov_9fa48("19794"), 'animate__animated animate__fadeInRight') : stryMutAct_9fa48("19795") ? "Stryker was here!" : (stryCov_9fa48("19795"), '')}`)} style={stryMutAct_9fa48("19796") ? {} : (stryCov_9fa48("19796"), {
                  animationDuration: stryMutAct_9fa48("19797") ? "" : (stryCov_9fa48("19797"), '0.6s')
                })}>
                {weeklyGoal}
              </span>
            </div>

            <div className="dashboard__date-picker">
              <RippleButton variant="outline" size="icon" className={stryMutAct_9fa48("19798") ? `` : (stryCov_9fa48("19798"), `dashboard__date-btn ${(stryMutAct_9fa48("19802") ? currentWeek <= 1 : stryMutAct_9fa48("19801") ? currentWeek >= 1 : stryMutAct_9fa48("19800") ? false : stryMutAct_9fa48("19799") ? true : (stryCov_9fa48("19799", "19800", "19801", "19802"), currentWeek > 1)) ? stryMutAct_9fa48("19803") ? "" : (stryCov_9fa48("19803"), 'dashboard__date-btn--active') : stryMutAct_9fa48("19804") ? "Stryker was here!" : (stryCov_9fa48("19804"), '')}`)} style={stryMutAct_9fa48("19805") ? {} : (stryCov_9fa48("19805"), {
                  backgroundColor: stryMutAct_9fa48("19806") ? "" : (stryCov_9fa48("19806"), 'var(--color-background)'),
                  borderColor: stryMutAct_9fa48("19807") ? "" : (stryCov_9fa48("19807"), 'var(--color-pursuit-purple)'),
                  color: stryMutAct_9fa48("19808") ? "" : (stryCov_9fa48("19808"), 'var(--color-pursuit-purple)'),
                  '--ripple-button-ripple-color': stryMutAct_9fa48("19809") ? "" : (stryCov_9fa48("19809"), 'var(--color-pursuit-purple)')
                })} onClick={stryMutAct_9fa48("19810") ? () => undefined : (stryCov_9fa48("19810"), () => navigateToWeek(stryMutAct_9fa48("19811") ? "" : (stryCov_9fa48("19811"), 'prev')))} disabled={stryMutAct_9fa48("19814") ? (currentWeek <= 1 || isLoadingWeek) && slideDirection !== null : stryMutAct_9fa48("19813") ? false : stryMutAct_9fa48("19812") ? true : (stryCov_9fa48("19812", "19813", "19814"), (stryMutAct_9fa48("19816") ? currentWeek <= 1 && isLoadingWeek : stryMutAct_9fa48("19815") ? false : (stryCov_9fa48("19815", "19816"), (stryMutAct_9fa48("19819") ? currentWeek > 1 : stryMutAct_9fa48("19818") ? currentWeek < 1 : stryMutAct_9fa48("19817") ? false : (stryCov_9fa48("19817", "19818", "19819"), currentWeek <= 1)) || isLoadingWeek)) || (stryMutAct_9fa48("19821") ? slideDirection === null : stryMutAct_9fa48("19820") ? false : (stryCov_9fa48("19820", "19821"), slideDirection !== null)))}>
                <ChevronLeft className="w-4 h-4" />
              </RippleButton>
              <span className="dashboard__date-label">Week {currentWeek}</span>
              <RippleButton variant="outline" size="icon" className={stryMutAct_9fa48("19822") ? `` : (stryCov_9fa48("19822"), `dashboard__date-btn ${(stryMutAct_9fa48("19825") ? currentDay?.week || currentWeek < currentDay.week : stryMutAct_9fa48("19824") ? false : stryMutAct_9fa48("19823") ? true : (stryCov_9fa48("19823", "19824", "19825"), (stryMutAct_9fa48("19826") ? currentDay.week : (stryCov_9fa48("19826"), currentDay?.week)) && (stryMutAct_9fa48("19829") ? currentWeek >= currentDay.week : stryMutAct_9fa48("19828") ? currentWeek <= currentDay.week : stryMutAct_9fa48("19827") ? true : (stryCov_9fa48("19827", "19828", "19829"), currentWeek < currentDay.week)))) ? stryMutAct_9fa48("19830") ? "" : (stryCov_9fa48("19830"), 'dashboard__date-btn--active') : stryMutAct_9fa48("19831") ? "Stryker was here!" : (stryCov_9fa48("19831"), '')}`)} style={stryMutAct_9fa48("19832") ? {} : (stryCov_9fa48("19832"), {
                  backgroundColor: stryMutAct_9fa48("19833") ? "" : (stryCov_9fa48("19833"), 'var(--color-background)'),
                  borderColor: stryMutAct_9fa48("19834") ? "" : (stryCov_9fa48("19834"), 'var(--color-pursuit-purple)'),
                  color: stryMutAct_9fa48("19835") ? "" : (stryCov_9fa48("19835"), 'var(--color-pursuit-purple)'),
                  '--ripple-button-ripple-color': stryMutAct_9fa48("19836") ? "" : (stryCov_9fa48("19836"), 'var(--color-pursuit-purple)')
                })} onClick={stryMutAct_9fa48("19837") ? () => undefined : (stryCov_9fa48("19837"), () => navigateToWeek(stryMutAct_9fa48("19838") ? "" : (stryCov_9fa48("19838"), 'next')))} disabled={stryMutAct_9fa48("19841") ? (!currentDay?.week || currentWeek >= currentDay.week || isLoadingWeek) && slideDirection !== null : stryMutAct_9fa48("19840") ? false : stryMutAct_9fa48("19839") ? true : (stryCov_9fa48("19839", "19840", "19841"), (stryMutAct_9fa48("19843") ? (!currentDay?.week || currentWeek >= currentDay.week) && isLoadingWeek : stryMutAct_9fa48("19842") ? false : (stryCov_9fa48("19842", "19843"), (stryMutAct_9fa48("19845") ? !currentDay?.week && currentWeek >= currentDay.week : stryMutAct_9fa48("19844") ? false : (stryCov_9fa48("19844", "19845"), (stryMutAct_9fa48("19846") ? currentDay?.week : (stryCov_9fa48("19846"), !(stryMutAct_9fa48("19847") ? currentDay.week : (stryCov_9fa48("19847"), currentDay?.week)))) || (stryMutAct_9fa48("19850") ? currentWeek < currentDay.week : stryMutAct_9fa48("19849") ? currentWeek > currentDay.week : stryMutAct_9fa48("19848") ? false : (stryCov_9fa48("19848", "19849", "19850"), currentWeek >= currentDay.week)))) || isLoadingWeek)) || (stryMutAct_9fa48("19852") ? slideDirection === null : stryMutAct_9fa48("19851") ? false : (stryCov_9fa48("19851", "19852"), slideDirection !== null)))}>
                <ChevronRight className="w-4 h-4" />
              </RippleButton>
            </div>
          </div>

          {/* Weekly Agenda Cards */}
          <div className="dashboard__weekly-grid">
            {isLoadingWeek ? renderSkeletonCards() : weekData.map((day, index) => {
                if (stryMutAct_9fa48("19853")) {
                  {}
                } else {
                  stryCov_9fa48("19853");
                  const dayIsToday = isDateToday(day.day_date);
                  const dayIsPast = isDatePast(day.day_date);
                  const showCheckbox = stryMutAct_9fa48("19856") ? dayIsPast || !dayIsToday : stryMutAct_9fa48("19855") ? false : stryMutAct_9fa48("19854") ? true : (stryCov_9fa48("19854", "19855", "19856"), dayIsPast && (stryMutAct_9fa48("19857") ? dayIsToday : (stryCov_9fa48("19857"), !dayIsToday)));

                  // For slide-out-right and slide-in-from-left (next week flow), reverse the stagger
                  // so the animation flows from right to left
                  const isRightToLeft = stryMutAct_9fa48("19860") ? slideDirection === 'out-right' && slideDirection === 'in-from-left' : stryMutAct_9fa48("19859") ? false : stryMutAct_9fa48("19858") ? true : (stryCov_9fa48("19858", "19859", "19860"), (stryMutAct_9fa48("19862") ? slideDirection !== 'out-right' : stryMutAct_9fa48("19861") ? false : (stryCov_9fa48("19861", "19862"), slideDirection === (stryMutAct_9fa48("19863") ? "" : (stryCov_9fa48("19863"), 'out-right')))) || (stryMutAct_9fa48("19865") ? slideDirection !== 'in-from-left' : stryMutAct_9fa48("19864") ? false : (stryCov_9fa48("19864", "19865"), slideDirection === (stryMutAct_9fa48("19866") ? "" : (stryCov_9fa48("19866"), 'in-from-left')))));
                  const cardCount = weekData.length;
                  const delayIndex = isRightToLeft ? stryMutAct_9fa48("19867") ? cardCount - 1 + index : (stryCov_9fa48("19867"), (stryMutAct_9fa48("19868") ? cardCount + 1 : (stryCov_9fa48("19868"), cardCount - 1)) - index) : index;

                  // Determine Animate.css classes based on slide direction
                  let animateClass = stryMutAct_9fa48("19869") ? "Stryker was here!" : (stryCov_9fa48("19869"), '');
                  if (stryMutAct_9fa48("19872") ? slideDirection !== 'out-left' : stryMutAct_9fa48("19871") ? false : stryMutAct_9fa48("19870") ? true : (stryCov_9fa48("19870", "19871", "19872"), slideDirection === (stryMutAct_9fa48("19873") ? "" : (stryCov_9fa48("19873"), 'out-left')))) animateClass = stryMutAct_9fa48("19874") ? "" : (stryCov_9fa48("19874"), 'animate__animated animate__fadeOutLeft');else if (stryMutAct_9fa48("19877") ? slideDirection !== 'out-right' : stryMutAct_9fa48("19876") ? false : stryMutAct_9fa48("19875") ? true : (stryCov_9fa48("19875", "19876", "19877"), slideDirection === (stryMutAct_9fa48("19878") ? "" : (stryCov_9fa48("19878"), 'out-right')))) animateClass = stryMutAct_9fa48("19879") ? "" : (stryCov_9fa48("19879"), 'animate__animated animate__fadeOutRight');else if (stryMutAct_9fa48("19882") ? slideDirection !== 'in-from-left' : stryMutAct_9fa48("19881") ? false : stryMutAct_9fa48("19880") ? true : (stryCov_9fa48("19880", "19881", "19882"), slideDirection === (stryMutAct_9fa48("19883") ? "" : (stryCov_9fa48("19883"), 'in-from-left')))) animateClass = stryMutAct_9fa48("19884") ? "" : (stryCov_9fa48("19884"), 'animate__animated animate__fadeInLeft');else if (stryMutAct_9fa48("19887") ? slideDirection !== 'in-from-right' : stryMutAct_9fa48("19886") ? false : stryMutAct_9fa48("19885") ? true : (stryCov_9fa48("19885", "19886", "19887"), slideDirection === (stryMutAct_9fa48("19888") ? "" : (stryCov_9fa48("19888"), 'in-from-right')))) animateClass = stryMutAct_9fa48("19889") ? "" : (stryCov_9fa48("19889"), 'animate__animated animate__fadeInRight');

                  // Calculate completion status for past days
                  const deliverableTasks = stryMutAct_9fa48("19892") ? day.tasks?.filter(t => t.deliverable_type && ['video', 'document', 'link'].includes(t.deliverable_type)) && [] : stryMutAct_9fa48("19891") ? false : stryMutAct_9fa48("19890") ? true : (stryCov_9fa48("19890", "19891", "19892"), (stryMutAct_9fa48("19894") ? day.tasks.filter(t => t.deliverable_type && ['video', 'document', 'link'].includes(t.deliverable_type)) : stryMutAct_9fa48("19893") ? day.tasks : (stryCov_9fa48("19893", "19894"), day.tasks?.filter(stryMutAct_9fa48("19895") ? () => undefined : (stryCov_9fa48("19895"), t => stryMutAct_9fa48("19898") ? t.deliverable_type || ['video', 'document', 'link'].includes(t.deliverable_type) : stryMutAct_9fa48("19897") ? false : stryMutAct_9fa48("19896") ? true : (stryCov_9fa48("19896", "19897", "19898"), t.deliverable_type && (stryMutAct_9fa48("19899") ? [] : (stryCov_9fa48("19899"), [stryMutAct_9fa48("19900") ? "" : (stryCov_9fa48("19900"), 'video'), stryMutAct_9fa48("19901") ? "" : (stryCov_9fa48("19901"), 'document'), stryMutAct_9fa48("19902") ? "" : (stryCov_9fa48("19902"), 'link')])).includes(t.deliverable_type)))))) || (stryMutAct_9fa48("19903") ? ["Stryker was here"] : (stryCov_9fa48("19903"), [])));
                  const completedDeliverables = stryMutAct_9fa48("19904") ? deliverableTasks : (stryCov_9fa48("19904"), deliverableTasks.filter(stryMutAct_9fa48("19905") ? () => undefined : (stryCov_9fa48("19905"), t => t.hasSubmission)));
                  const isComplete = stryMutAct_9fa48("19908") ? deliverableTasks.length > 0 || deliverableTasks.length === completedDeliverables.length : stryMutAct_9fa48("19907") ? false : stryMutAct_9fa48("19906") ? true : (stryCov_9fa48("19906", "19907", "19908"), (stryMutAct_9fa48("19911") ? deliverableTasks.length <= 0 : stryMutAct_9fa48("19910") ? deliverableTasks.length >= 0 : stryMutAct_9fa48("19909") ? true : (stryCov_9fa48("19909", "19910", "19911"), deliverableTasks.length > 0)) && (stryMutAct_9fa48("19913") ? deliverableTasks.length !== completedDeliverables.length : stryMutAct_9fa48("19912") ? true : (stryCov_9fa48("19912", "19913"), deliverableTasks.length === completedDeliverables.length)));
                  return <div key={day.id} className={stryMutAct_9fa48("19914") ? `` : (stryCov_9fa48("19914"), `dashboard__day-card ${dayIsToday ? stryMutAct_9fa48("19915") ? "" : (stryCov_9fa48("19915"), 'dashboard__day-card--today') : stryMutAct_9fa48("19916") ? "Stryker was here!" : (stryCov_9fa48("19916"), '')} ${animateClass}`)} style={stryMutAct_9fa48("19917") ? {} : (stryCov_9fa48("19917"), {
                    animationDelay: stryMutAct_9fa48("19918") ? `` : (stryCov_9fa48("19918"), `${stryMutAct_9fa48("19919") ? delayIndex / 0.08 : (stryCov_9fa48("19919"), delayIndex * 0.08)}s`)
                  })}>
                  {/* Completion Badge (for past days only) */}
                  {stryMutAct_9fa48("19922") ? dayIsPast && !dayIsToday && deliverableTasks.length > 0 || <div className={`dashboard__completion-badge ${isComplete ? 'dashboard__completion-badge--complete' : 'dashboard__completion-badge--incomplete'}`}>
                      {isComplete ? 'Complete' : 'Incomplete'}
                    </div> : stryMutAct_9fa48("19921") ? false : stryMutAct_9fa48("19920") ? true : (stryCov_9fa48("19920", "19921", "19922"), (stryMutAct_9fa48("19924") ? dayIsPast && !dayIsToday || deliverableTasks.length > 0 : stryMutAct_9fa48("19923") ? true : (stryCov_9fa48("19923", "19924"), (stryMutAct_9fa48("19926") ? dayIsPast || !dayIsToday : stryMutAct_9fa48("19925") ? true : (stryCov_9fa48("19925", "19926"), dayIsPast && (stryMutAct_9fa48("19927") ? dayIsToday : (stryCov_9fa48("19927"), !dayIsToday)))) && (stryMutAct_9fa48("19930") ? deliverableTasks.length <= 0 : stryMutAct_9fa48("19929") ? deliverableTasks.length >= 0 : stryMutAct_9fa48("19928") ? true : (stryCov_9fa48("19928", "19929", "19930"), deliverableTasks.length > 0)))) && <div className={stryMutAct_9fa48("19931") ? `` : (stryCov_9fa48("19931"), `dashboard__completion-badge ${isComplete ? stryMutAct_9fa48("19932") ? "" : (stryCov_9fa48("19932"), 'dashboard__completion-badge--complete') : stryMutAct_9fa48("19933") ? "" : (stryCov_9fa48("19933"), 'dashboard__completion-badge--incomplete')}`)}>
                      {isComplete ? stryMutAct_9fa48("19934") ? "" : (stryCov_9fa48("19934"), 'Complete') : stryMutAct_9fa48("19935") ? "" : (stryCov_9fa48("19935"), 'Incomplete')}
                    </div>)}
                  
                  {/* Date */}
                  <div className="dashboard__day-date">
                    {(() => {
                        if (stryMutAct_9fa48("19936")) {
                          {}
                        } else {
                          stryCov_9fa48("19936");
                          const formattedDate = formatDayDate(day.day_date, dayIsToday);
                          return <>
                          {stryMutAct_9fa48("19939") ? formattedDate.prefix || <strong>{formattedDate.prefix}</strong> : stryMutAct_9fa48("19938") ? false : stryMutAct_9fa48("19937") ? true : (stryCov_9fa48("19937", "19938", "19939"), formattedDate.prefix && <strong>{formattedDate.prefix}</strong>)}
                          {formattedDate.date}
                        </>;
                        }
                      })()}
                  </div>
                  
                  {/* Separator */}
                  <div className="dashboard__day-separator" />
                  
                  {/* Activities */}
                  {stryMutAct_9fa48("19942") ? day.tasks && day.tasks.length > 0 || <div className="dashboard__day-section">
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
              </div> : stryMutAct_9fa48("19941") ? false : stryMutAct_9fa48("19940") ? true : (stryCov_9fa48("19940", "19941", "19942"), (stryMutAct_9fa48("19944") ? day.tasks || day.tasks.length > 0 : stryMutAct_9fa48("19943") ? true : (stryCov_9fa48("19943", "19944"), day.tasks && (stryMutAct_9fa48("19947") ? day.tasks.length <= 0 : stryMutAct_9fa48("19946") ? day.tasks.length >= 0 : stryMutAct_9fa48("19945") ? true : (stryCov_9fa48("19945", "19946", "19947"), day.tasks.length > 0)))) && <div className="dashboard__day-section">
                      <h4 className="dashboard__day-section-title">Activities</h4>
                      <div className="dashboard__day-activities">
                        {day.tasks.map((task, taskIndex) => {
                          if (stryMutAct_9fa48("19948")) {
                            {}
                          } else {
                            stryCov_9fa48("19948");
                            const isDeliverable = stryMutAct_9fa48("19951") ? task.deliverable_type || ['video', 'document', 'link'].includes(task.deliverable_type) : stryMutAct_9fa48("19950") ? false : stryMutAct_9fa48("19949") ? true : (stryCov_9fa48("19949", "19950", "19951"), task.deliverable_type && (stryMutAct_9fa48("19952") ? [] : (stryCov_9fa48("19952"), [stryMutAct_9fa48("19953") ? "" : (stryCov_9fa48("19953"), 'video'), stryMutAct_9fa48("19954") ? "" : (stryCov_9fa48("19954"), 'document'), stryMutAct_9fa48("19955") ? "" : (stryCov_9fa48("19955"), 'link')])).includes(task.deliverable_type));
                            const showTaskCheckbox = stryMutAct_9fa48("19958") ? dayIsPast || !dayIsToday : stryMutAct_9fa48("19957") ? false : stryMutAct_9fa48("19956") ? true : (stryCov_9fa48("19956", "19957", "19958"), dayIsPast && (stryMutAct_9fa48("19959") ? dayIsToday : (stryCov_9fa48("19959"), !dayIsToday)));
                            const hasSubmission = task.hasSubmission;
                            return <div key={task.id}>
                              <div className="dashboard__day-activity">
                                {/* Task Checkbox */}
                                {stryMutAct_9fa48("19962") ? showTaskCheckbox || <div className={`dashboard__task-checkbox ${hasSubmission ? 'dashboard__task-checkbox--complete' : isDeliverable ? 'dashboard__task-checkbox--incomplete' : 'dashboard__task-checkbox--complete'}`}>
                                    {isDeliverable && !hasSubmission ? <svg viewBox="0 0 8 8" className="dashboard__task-checkbox-x">
                                        <line x1="1" y1="1" x2="7" y2="7" />
                                        <line x1="7" y1="1" x2="1" y2="7" />
                                      </svg> : <svg viewBox="0 0 14 14" className="dashboard__task-checkbox-check">
                                        <polyline points="2,7 5,10 12,3" />
                                      </svg>}
                                  </div> : stryMutAct_9fa48("19961") ? false : stryMutAct_9fa48("19960") ? true : (stryCov_9fa48("19960", "19961", "19962"), showTaskCheckbox && <div className={stryMutAct_9fa48("19963") ? `` : (stryCov_9fa48("19963"), `dashboard__task-checkbox ${hasSubmission ? stryMutAct_9fa48("19964") ? "" : (stryCov_9fa48("19964"), 'dashboard__task-checkbox--complete') : isDeliverable ? stryMutAct_9fa48("19965") ? "" : (stryCov_9fa48("19965"), 'dashboard__task-checkbox--incomplete') : stryMutAct_9fa48("19966") ? "" : (stryCov_9fa48("19966"), 'dashboard__task-checkbox--complete')}`)}>
                                    {(stryMutAct_9fa48("19969") ? isDeliverable || !hasSubmission : stryMutAct_9fa48("19968") ? false : stryMutAct_9fa48("19967") ? true : (stryCov_9fa48("19967", "19968", "19969"), isDeliverable && (stryMutAct_9fa48("19970") ? hasSubmission : (stryCov_9fa48("19970"), !hasSubmission)))) ? <svg viewBox="0 0 8 8" className="dashboard__task-checkbox-x">
                                        <line x1="1" y1="1" x2="7" y2="7" />
                                        <line x1="7" y1="1" x2="1" y2="7" />
                                      </svg> : <svg viewBox="0 0 14 14" className="dashboard__task-checkbox-check">
                                        <polyline points="2,7 5,10 12,3" />
                                      </svg>}
                                  </div>)}
                                
                                <div className="dashboard__day-activity-content">
                                  <span className="dashboard__task-title">{task.task_title}</span>
                                  
                                  {/* Deliverable Submit Button */}
                                  {stryMutAct_9fa48("19973") ? isDeliverable || <button className={`dashboard__deliverable-link ${hasSubmission ? 'dashboard__deliverable-link--submitted' : 'dashboard__deliverable-link--pending'}`} onClick={() => navigate(`/learning?date=${day.day_date}&taskId=${task.id}`)}>
                                      Submit {task.deliverable_type}
                                    </button> : stryMutAct_9fa48("19972") ? false : stryMutAct_9fa48("19971") ? true : (stryCov_9fa48("19971", "19972", "19973"), isDeliverable && <button className={stryMutAct_9fa48("19974") ? `` : (stryCov_9fa48("19974"), `dashboard__deliverable-link ${hasSubmission ? stryMutAct_9fa48("19975") ? "" : (stryCov_9fa48("19975"), 'dashboard__deliverable-link--submitted') : stryMutAct_9fa48("19976") ? "" : (stryCov_9fa48("19976"), 'dashboard__deliverable-link--pending')}`)} onClick={stryMutAct_9fa48("19977") ? () => undefined : (stryCov_9fa48("19977"), () => navigate(stryMutAct_9fa48("19978") ? `` : (stryCov_9fa48("19978"), `/learning?date=${day.day_date}&taskId=${task.id}`)))}>
                                      Submit {task.deliverable_type}
                                    </button>)}
                                </div>
                              </div>
                              {stryMutAct_9fa48("19981") ? taskIndex < day.tasks.length - 1 || <div className="dashboard__activity-divider" /> : stryMutAct_9fa48("19980") ? false : stryMutAct_9fa48("19979") ? true : (stryCov_9fa48("19979", "19980", "19981"), (stryMutAct_9fa48("19984") ? taskIndex >= day.tasks.length - 1 : stryMutAct_9fa48("19983") ? taskIndex <= day.tasks.length - 1 : stryMutAct_9fa48("19982") ? true : (stryCov_9fa48("19982", "19983", "19984"), taskIndex < (stryMutAct_9fa48("19985") ? day.tasks.length + 1 : (stryCov_9fa48("19985"), day.tasks.length - 1)))) && <div className="dashboard__activity-divider" />)}
                            </div>;
                          }
                        })}
                      </div>
              </div>)}

                  {/* Go Button */}
                  {stryMutAct_9fa48("19988") ? dayIsToday || <button className="dashboard__go-btn dashboard__go-btn--today" onClick={handleContinueSession}>
                      Go
                    </button> : stryMutAct_9fa48("19987") ? false : stryMutAct_9fa48("19986") ? true : (stryCov_9fa48("19986", "19987", "19988"), dayIsToday && <button className="dashboard__go-btn dashboard__go-btn--today" onClick={handleContinueSession}>
                      Go
                    </button>)}
                  {stryMutAct_9fa48("19991") ? !dayIsToday && showCheckbox || <button className="dashboard__go-btn" onClick={handleContinueSession}>
                      Go
                    </button> : stryMutAct_9fa48("19990") ? false : stryMutAct_9fa48("19989") ? true : (stryCov_9fa48("19989", "19990", "19991"), (stryMutAct_9fa48("19993") ? !dayIsToday || showCheckbox : stryMutAct_9fa48("19992") ? true : (stryCov_9fa48("19992", "19993"), (stryMutAct_9fa48("19994") ? dayIsToday : (stryCov_9fa48("19994"), !dayIsToday)) && showCheckbox)) && <button className="dashboard__go-btn" onClick={handleContinueSession}>
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
              {stryMutAct_9fa48("19997") ? currentDay?.daily_goal && 'No goal set for today' : stryMutAct_9fa48("19996") ? false : stryMutAct_9fa48("19995") ? true : (stryCov_9fa48("19995", "19996", "19997"), (stryMutAct_9fa48("19998") ? currentDay.daily_goal : (stryCov_9fa48("19998"), currentDay?.daily_goal)) || (stryMutAct_9fa48("19999") ? "" : (stryCov_9fa48("19999"), 'No goal set for today')))}
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
            <RippleButton variant="outline" size="icon" className={stryMutAct_9fa48("20000") ? `` : (stryCov_9fa48("20000"), `dashboard__mobile-date-btn ${(stryMutAct_9fa48("20004") ? currentWeek <= 1 : stryMutAct_9fa48("20003") ? currentWeek >= 1 : stryMutAct_9fa48("20002") ? false : stryMutAct_9fa48("20001") ? true : (stryCov_9fa48("20001", "20002", "20003", "20004"), currentWeek > 1)) ? stryMutAct_9fa48("20005") ? "" : (stryCov_9fa48("20005"), 'dashboard__mobile-date-btn--active') : stryMutAct_9fa48("20006") ? "Stryker was here!" : (stryCov_9fa48("20006"), '')}`)} style={stryMutAct_9fa48("20007") ? {} : (stryCov_9fa48("20007"), {
                backgroundColor: stryMutAct_9fa48("20008") ? "" : (stryCov_9fa48("20008"), 'var(--color-background)'),
                borderColor: stryMutAct_9fa48("20009") ? "" : (stryCov_9fa48("20009"), 'var(--color-pursuit-purple)'),
                color: stryMutAct_9fa48("20010") ? "" : (stryCov_9fa48("20010"), 'var(--color-pursuit-purple)'),
                '--ripple-button-ripple-color': stryMutAct_9fa48("20011") ? "" : (stryCov_9fa48("20011"), 'var(--color-pursuit-purple)')
              })} onClick={stryMutAct_9fa48("20012") ? () => undefined : (stryCov_9fa48("20012"), () => navigateToWeek(stryMutAct_9fa48("20013") ? "" : (stryCov_9fa48("20013"), 'prev')))} disabled={stryMutAct_9fa48("20016") ? (currentWeek <= 1 || isLoadingWeek) && slideDirection !== null : stryMutAct_9fa48("20015") ? false : stryMutAct_9fa48("20014") ? true : (stryCov_9fa48("20014", "20015", "20016"), (stryMutAct_9fa48("20018") ? currentWeek <= 1 && isLoadingWeek : stryMutAct_9fa48("20017") ? false : (stryCov_9fa48("20017", "20018"), (stryMutAct_9fa48("20021") ? currentWeek > 1 : stryMutAct_9fa48("20020") ? currentWeek < 1 : stryMutAct_9fa48("20019") ? false : (stryCov_9fa48("20019", "20020", "20021"), currentWeek <= 1)) || isLoadingWeek)) || (stryMutAct_9fa48("20023") ? slideDirection === null : stryMutAct_9fa48("20022") ? false : (stryCov_9fa48("20022", "20023"), slideDirection !== null)))}>
              <ChevronLeft className="w-4 h-4" />
            </RippleButton>
            <span className="dashboard__mobile-date-label">Week {currentWeek}</span>
            <RippleButton variant="outline" size="icon" className={stryMutAct_9fa48("20024") ? `` : (stryCov_9fa48("20024"), `dashboard__mobile-date-btn ${(stryMutAct_9fa48("20027") ? currentDay?.week || currentWeek < currentDay.week : stryMutAct_9fa48("20026") ? false : stryMutAct_9fa48("20025") ? true : (stryCov_9fa48("20025", "20026", "20027"), (stryMutAct_9fa48("20028") ? currentDay.week : (stryCov_9fa48("20028"), currentDay?.week)) && (stryMutAct_9fa48("20031") ? currentWeek >= currentDay.week : stryMutAct_9fa48("20030") ? currentWeek <= currentDay.week : stryMutAct_9fa48("20029") ? true : (stryCov_9fa48("20029", "20030", "20031"), currentWeek < currentDay.week)))) ? stryMutAct_9fa48("20032") ? "" : (stryCov_9fa48("20032"), 'dashboard__mobile-date-btn--active') : stryMutAct_9fa48("20033") ? "Stryker was here!" : (stryCov_9fa48("20033"), '')}`)} style={stryMutAct_9fa48("20034") ? {} : (stryCov_9fa48("20034"), {
                backgroundColor: stryMutAct_9fa48("20035") ? "" : (stryCov_9fa48("20035"), 'var(--color-background)'),
                borderColor: stryMutAct_9fa48("20036") ? "" : (stryCov_9fa48("20036"), 'var(--color-pursuit-purple)'),
                color: stryMutAct_9fa48("20037") ? "" : (stryCov_9fa48("20037"), 'var(--color-pursuit-purple)'),
                '--ripple-button-ripple-color': stryMutAct_9fa48("20038") ? "" : (stryCov_9fa48("20038"), 'var(--color-pursuit-purple)')
              })} onClick={stryMutAct_9fa48("20039") ? () => undefined : (stryCov_9fa48("20039"), () => navigateToWeek(stryMutAct_9fa48("20040") ? "" : (stryCov_9fa48("20040"), 'next')))} disabled={stryMutAct_9fa48("20043") ? (!currentDay?.week || currentWeek >= currentDay.week || isLoadingWeek) && slideDirection !== null : stryMutAct_9fa48("20042") ? false : stryMutAct_9fa48("20041") ? true : (stryCov_9fa48("20041", "20042", "20043"), (stryMutAct_9fa48("20045") ? (!currentDay?.week || currentWeek >= currentDay.week) && isLoadingWeek : stryMutAct_9fa48("20044") ? false : (stryCov_9fa48("20044", "20045"), (stryMutAct_9fa48("20047") ? !currentDay?.week && currentWeek >= currentDay.week : stryMutAct_9fa48("20046") ? false : (stryCov_9fa48("20046", "20047"), (stryMutAct_9fa48("20048") ? currentDay?.week : (stryCov_9fa48("20048"), !(stryMutAct_9fa48("20049") ? currentDay.week : (stryCov_9fa48("20049"), currentDay?.week)))) || (stryMutAct_9fa48("20052") ? currentWeek < currentDay.week : stryMutAct_9fa48("20051") ? currentWeek > currentDay.week : stryMutAct_9fa48("20050") ? false : (stryCov_9fa48("20050", "20051", "20052"), currentWeek >= currentDay.week)))) || isLoadingWeek)) || (stryMutAct_9fa48("20054") ? slideDirection === null : stryMutAct_9fa48("20053") ? false : (stryCov_9fa48("20053", "20054"), slideDirection !== null)))}>
              <ChevronRight className="w-4 h-4" />
            </RippleButton>
          </div>

          {/* Weekly Agenda - Mobile */}
          <div className="dashboard__mobile-agenda">
            {weekData.map((day, index) => {
                if (stryMutAct_9fa48("20055")) {
                  {}
                } else {
                  stryCov_9fa48("20055");
                  const dayIsToday = isDateToday(day.day_date);
                  const dayIsPast = isDatePast(day.day_date);
                  if (stryMutAct_9fa48("20057") ? false : stryMutAct_9fa48("20056") ? true : (stryCov_9fa48("20056", "20057"), dayIsToday)) {
                    if (stryMutAct_9fa48("20058")) {
                      {}
                    } else {
                      stryCov_9fa48("20058");
                      // Today Card - expanded
                      return <div key={day.id} className="dashboard__mobile-today-card">
                    <div className="dashboard__mobile-today-header">
                      {(() => {
                            if (stryMutAct_9fa48("20059")) {
                              {}
                            } else {
                              stryCov_9fa48("20059");
                              const formattedDate = formatDayDate(day.day_date, stryMutAct_9fa48("20060") ? false : (stryCov_9fa48("20060"), true));
                              return <>
                            {stryMutAct_9fa48("20063") ? formattedDate.prefix || <strong>{formattedDate.prefix}</strong> : stryMutAct_9fa48("20062") ? false : stryMutAct_9fa48("20061") ? true : (stryCov_9fa48("20061", "20062", "20063"), formattedDate.prefix && <strong>{formattedDate.prefix}</strong>)}
                            {formattedDate.date}
                          </>;
                            }
                          })()}
                    </div>
                    <div className="dashboard__mobile-today-separator" />
                    {stryMutAct_9fa48("20066") ? day.tasks && day.tasks.length > 0 || <div className="dashboard__mobile-today-section">
                        <h4 className="dashboard__mobile-today-section-title">Activities</h4>
                        <div className="dashboard__mobile-today-activities">
                          {day.tasks.map((task, taskIndex) => <div key={task.id}>
                              <div className="dashboard__mobile-today-activity">{task.task_title}</div>
                              {taskIndex < day.tasks.length - 1 && <div className="dashboard__mobile-activity-divider" />}
                            </div>)}
                        </div>
                      </div> : stryMutAct_9fa48("20065") ? false : stryMutAct_9fa48("20064") ? true : (stryCov_9fa48("20064", "20065", "20066"), (stryMutAct_9fa48("20068") ? day.tasks || day.tasks.length > 0 : stryMutAct_9fa48("20067") ? true : (stryCov_9fa48("20067", "20068"), day.tasks && (stryMutAct_9fa48("20071") ? day.tasks.length <= 0 : stryMutAct_9fa48("20070") ? day.tasks.length >= 0 : stryMutAct_9fa48("20069") ? true : (stryCov_9fa48("20069", "20070", "20071"), day.tasks.length > 0)))) && <div className="dashboard__mobile-today-section">
                        <h4 className="dashboard__mobile-today-section-title">Activities</h4>
                        <div className="dashboard__mobile-today-activities">
                          {day.tasks.map(stryMutAct_9fa48("20072") ? () => undefined : (stryCov_9fa48("20072"), (task, taskIndex) => <div key={task.id}>
                              <div className="dashboard__mobile-today-activity">{task.task_title}</div>
                              {stryMutAct_9fa48("20075") ? taskIndex < day.tasks.length - 1 || <div className="dashboard__mobile-activity-divider" /> : stryMutAct_9fa48("20074") ? false : stryMutAct_9fa48("20073") ? true : (stryCov_9fa48("20073", "20074", "20075"), (stryMutAct_9fa48("20078") ? taskIndex >= day.tasks.length - 1 : stryMutAct_9fa48("20077") ? taskIndex <= day.tasks.length - 1 : stryMutAct_9fa48("20076") ? true : (stryCov_9fa48("20076", "20077", "20078"), taskIndex < (stryMutAct_9fa48("20079") ? day.tasks.length + 1 : (stryCov_9fa48("20079"), day.tasks.length - 1)))) && <div className="dashboard__mobile-activity-divider" />)}
                            </div>))}
                        </div>
                      </div>)}
          <button className="dashboard__mobile-go-btn" onClick={handleContinueSession}>
                      Go
          </button>
                  </div>;
                    }
                  } else {
                    if (stryMutAct_9fa48("20080")) {
                      {}
                    } else {
                      stryCov_9fa48("20080");
                      // Regular day card - condensed
                      return <div key={day.id} className="dashboard__mobile-day">
                    <div className="dashboard__mobile-day-header">
                      {formatDayDate(day.day_date, stryMutAct_9fa48("20081") ? true : (stryCov_9fa48("20081"), false)).full}
                    </div>
                    {stryMutAct_9fa48("20084") ? dayIsPast || <div className={`dashboard__mobile-checkbox ${day.completed ? 'dashboard__mobile-checkbox--checked' : ''}`} /> : stryMutAct_9fa48("20083") ? false : stryMutAct_9fa48("20082") ? true : (stryCov_9fa48("20082", "20083", "20084"), dayIsPast && <div className={stryMutAct_9fa48("20085") ? `` : (stryCov_9fa48("20085"), `dashboard__mobile-checkbox ${day.completed ? stryMutAct_9fa48("20086") ? "" : (stryCov_9fa48("20086"), 'dashboard__mobile-checkbox--checked') : stryMutAct_9fa48("20087") ? "Stryker was here!" : (stryCov_9fa48("20087"), '')}`)} />)}
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
              {upcomingEvents.map(stryMutAct_9fa48("20088") ? () => undefined : (stryCov_9fa48("20088"), (event, index) => <div key={index} className="dashboard__mobile-upcoming-item">
                  <div className="dashboard__mobile-upcoming-content">
                    <span className="dashboard__mobile-upcoming-date">{event.date}</span>
                    <div className="dashboard__mobile-upcoming-details">
                      <p className="dashboard__mobile-upcoming-title">{event.title}</p>
                      <p className="dashboard__mobile-upcoming-time">{event.time}</p>
                      {stryMutAct_9fa48("20091") ? event.location || <p className="dashboard__mobile-upcoming-location">{event.location}</p> : stryMutAct_9fa48("20090") ? false : stryMutAct_9fa48("20089") ? true : (stryCov_9fa48("20089", "20090", "20091"), event.location && <p className="dashboard__mobile-upcoming-location">{event.location}</p>)}
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
    if (stryMutAct_9fa48("20093") ? false : stryMutAct_9fa48("20092") ? true : (stryCov_9fa48("20092", "20093"), isLoading)) {
      if (stryMutAct_9fa48("20094")) {
        {}
      } else {
        stryCov_9fa48("20094");
        return <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground">Loading dashboard data...</div>
      </div>;
      }
    }
    return <>
      {stryMutAct_9fa48("20097") ? error || <div className="p-4 mx-6 mt-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
          </div> : stryMutAct_9fa48("20096") ? false : stryMutAct_9fa48("20095") ? true : (stryCov_9fa48("20095", "20096", "20097"), error && <div className="p-4 mx-6 mt-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
          </div>)}
      
      {/* Conditionally render based on user status and role */}
      {(stryMutAct_9fa48("20098") ? isActive : (stryCov_9fa48("20098"), !isActive)) ? renderHistoricalView() : isVolunteer ? renderVolunteerView() : renderDashboardContent()}

      {/* Missed Assignments Sidebar */}
      <MissedAssignmentsSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} onNavigateToDay={handleNavigateToDay} />
    </>;
  }
}
export default Dashboard;