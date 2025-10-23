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
import './FacilitatorView.css';
const FacilitatorView = () => {
  if (stryMutAct_9fa48("20099")) {
    {}
  } else {
    stryCov_9fa48("20099");
    const {
      token
    } = useAuth();
    const [facilitatorNotes, setFacilitatorNotes] = useState(null);
    const [loading, setLoading] = useState(stryMutAct_9fa48("20100") ? true : (stryCov_9fa48("20100"), false));
    const [error, setError] = useState(stryMutAct_9fa48("20101") ? "Stryker was here!" : (stryCov_9fa48("20101"), ''));
    const [dayNumber, setDayNumber] = useState(stryMutAct_9fa48("20102") ? "Stryker was here!" : (stryCov_9fa48("20102"), ''));
    const fetchFacilitatorNotes = async () => {
      if (stryMutAct_9fa48("20103")) {
        {}
      } else {
        stryCov_9fa48("20103");
        if (stryMutAct_9fa48("20106") ? false : stryMutAct_9fa48("20105") ? true : stryMutAct_9fa48("20104") ? dayNumber : (stryCov_9fa48("20104", "20105", "20106"), !dayNumber)) {
          if (stryMutAct_9fa48("20107")) {
            {}
          } else {
            stryCov_9fa48("20107");
            setError(stryMutAct_9fa48("20108") ? "" : (stryCov_9fa48("20108"), 'Please enter a Day Number'));
            return;
          }
        }
        try {
          if (stryMutAct_9fa48("20109")) {
            {}
          } else {
            stryCov_9fa48("20109");
            setLoading(stryMutAct_9fa48("20110") ? false : (stryCov_9fa48("20110"), true));
            setError(stryMutAct_9fa48("20111") ? "Stryker was here!" : (stryCov_9fa48("20111"), ''));
            const response = await fetch(stryMutAct_9fa48("20112") ? `` : (stryCov_9fa48("20112"), `${import.meta.env.VITE_API_URL}/api/facilitator-notes/day/${dayNumber}`), stryMutAct_9fa48("20113") ? {} : (stryCov_9fa48("20113"), {
              headers: stryMutAct_9fa48("20114") ? {} : (stryCov_9fa48("20114"), {
                'Authorization': stryMutAct_9fa48("20115") ? `` : (stryCov_9fa48("20115"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("20118") ? false : stryMutAct_9fa48("20117") ? true : stryMutAct_9fa48("20116") ? response.ok : (stryCov_9fa48("20116", "20117", "20118"), !response.ok)) {
              if (stryMutAct_9fa48("20119")) {
                {}
              } else {
                stryCov_9fa48("20119");
                if (stryMutAct_9fa48("20122") ? response.status !== 404 : stryMutAct_9fa48("20121") ? false : stryMutAct_9fa48("20120") ? true : (stryCov_9fa48("20120", "20121", "20122"), response.status === 404)) {
                  if (stryMutAct_9fa48("20123")) {
                    {}
                  } else {
                    stryCov_9fa48("20123");
                    throw new Error(stryMutAct_9fa48("20124") ? "" : (stryCov_9fa48("20124"), 'No facilitator notes found for this day'));
                  }
                }
                throw new Error(stryMutAct_9fa48("20125") ? `` : (stryCov_9fa48("20125"), `HTTP error! status: ${response.status}`));
              }
            }
            const result = await response.json();
            if (stryMutAct_9fa48("20127") ? false : stryMutAct_9fa48("20126") ? true : (stryCov_9fa48("20126", "20127"), result.success)) {
              if (stryMutAct_9fa48("20128")) {
                {}
              } else {
                stryCov_9fa48("20128");
                setFacilitatorNotes(result.data);
              }
            } else {
              if (stryMutAct_9fa48("20129")) {
                {}
              } else {
                stryCov_9fa48("20129");
                throw new Error(stryMutAct_9fa48("20132") ? result.message && 'Failed to fetch facilitator notes' : stryMutAct_9fa48("20131") ? false : stryMutAct_9fa48("20130") ? true : (stryCov_9fa48("20130", "20131", "20132"), result.message || (stryMutAct_9fa48("20133") ? "" : (stryCov_9fa48("20133"), 'Failed to fetch facilitator notes'))));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("20134")) {
            {}
          } else {
            stryCov_9fa48("20134");
            console.error(stryMutAct_9fa48("20135") ? "" : (stryCov_9fa48("20135"), 'Error fetching facilitator notes:'), error);
            setError(error.message);
            setFacilitatorNotes(null);
          }
        } finally {
          if (stryMutAct_9fa48("20136")) {
            {}
          } else {
            stryCov_9fa48("20136");
            setLoading(stryMutAct_9fa48("20137") ? true : (stryCov_9fa48("20137"), false));
          }
        }
      }
    };
    const handleSubmit = e => {
      if (stryMutAct_9fa48("20138")) {
        {}
      } else {
        stryCov_9fa48("20138");
        e.preventDefault();
        fetchFacilitatorNotes();
      }
    };
    return <div className="facilitator-view">
      <div className="facilitator-view__content">
        <div className="facilitator-view__header">
          <h1>Facilitator View</h1>
          <p>Access facilitator notes and delivery guidance for session days</p>
        </div>

        <form onSubmit={handleSubmit} className="facilitator-view__search">
          <div className="facilitator-view__search-fields">
            <div className="facilitator-view__field">
              <label htmlFor="dayNumber">Day Number</label>
              <input type="number" id="dayNumber" value={dayNumber} onChange={stryMutAct_9fa48("20139") ? () => undefined : (stryCov_9fa48("20139"), e => setDayNumber(e.target.value))} placeholder="e.g., 9" className="facilitator-view__input" min="1" />
            </div>
          </div>
          <button type="submit" disabled={stryMutAct_9fa48("20142") ? loading && !dayNumber : stryMutAct_9fa48("20141") ? false : stryMutAct_9fa48("20140") ? true : (stryCov_9fa48("20140", "20141", "20142"), loading || (stryMutAct_9fa48("20143") ? dayNumber : (stryCov_9fa48("20143"), !dayNumber)))} className="facilitator-view__search-btn">
            {loading ? stryMutAct_9fa48("20144") ? "" : (stryCov_9fa48("20144"), 'Loading...') : stryMutAct_9fa48("20145") ? "" : (stryCov_9fa48("20145"), 'Load Notes')}
          </button>
        </form>

        {stryMutAct_9fa48("20148") ? error || <div className="facilitator-view__error">
            {error}
          </div> : stryMutAct_9fa48("20147") ? false : stryMutAct_9fa48("20146") ? true : (stryCov_9fa48("20146", "20147", "20148"), error && <div className="facilitator-view__error">
            {error}
          </div>)}

        {stryMutAct_9fa48("20151") ? facilitatorNotes || <div className="facilitator-view__notes">
            <div className="facilitator-view__session-info">
              <h2>Day {facilitatorNotes.dayNumber}</h2>
              {facilitatorNotes.tasks.length > 0 && facilitatorNotes.tasks[0].day_date && <p className="facilitator-view__date">{facilitatorNotes.tasks[0].day_date}</p>}
              {facilitatorNotes.tasks.length > 0 && facilitatorNotes.tasks[0].daily_goal && <div className="facilitator-view__daily-goal">
                  <strong>Daily Goal:</strong> {facilitatorNotes.tasks[0].daily_goal}
                </div>}
            </div>

            <div className="facilitator-view__tasks">
              <h3>Task-by-Task Facilitation Notes ({facilitatorNotes.taskCount} tasks)</h3>
              
              {facilitatorNotes.tasks.map((task, index) => <div key={task.id || index} className="facilitator-view__task">
                  <div className="facilitator-view__task-header">
                    <h4>{task.task_title}</h4>
                    <div className="facilitator-view__task-time">
                      {task.start_time} - {task.end_time}
                    </div>
                  </div>
                  <div className="facilitator-view__task-notes">
                    {task.facilitator_notes}
                  </div>
                </div>)}
              
              {facilitatorNotes.taskCount === 0 && <p>No tasks with facilitator notes found for this day.</p>}
            </div>
          </div> : stryMutAct_9fa48("20150") ? false : stryMutAct_9fa48("20149") ? true : (stryCov_9fa48("20149", "20150", "20151"), facilitatorNotes && <div className="facilitator-view__notes">
            <div className="facilitator-view__session-info">
              <h2>Day {facilitatorNotes.dayNumber}</h2>
              {stryMutAct_9fa48("20154") ? facilitatorNotes.tasks.length > 0 && facilitatorNotes.tasks[0].day_date || <p className="facilitator-view__date">{facilitatorNotes.tasks[0].day_date}</p> : stryMutAct_9fa48("20153") ? false : stryMutAct_9fa48("20152") ? true : (stryCov_9fa48("20152", "20153", "20154"), (stryMutAct_9fa48("20156") ? facilitatorNotes.tasks.length > 0 || facilitatorNotes.tasks[0].day_date : stryMutAct_9fa48("20155") ? true : (stryCov_9fa48("20155", "20156"), (stryMutAct_9fa48("20159") ? facilitatorNotes.tasks.length <= 0 : stryMutAct_9fa48("20158") ? facilitatorNotes.tasks.length >= 0 : stryMutAct_9fa48("20157") ? true : (stryCov_9fa48("20157", "20158", "20159"), facilitatorNotes.tasks.length > 0)) && facilitatorNotes.tasks[0].day_date)) && <p className="facilitator-view__date">{facilitatorNotes.tasks[0].day_date}</p>)}
              {stryMutAct_9fa48("20162") ? facilitatorNotes.tasks.length > 0 && facilitatorNotes.tasks[0].daily_goal || <div className="facilitator-view__daily-goal">
                  <strong>Daily Goal:</strong> {facilitatorNotes.tasks[0].daily_goal}
                </div> : stryMutAct_9fa48("20161") ? false : stryMutAct_9fa48("20160") ? true : (stryCov_9fa48("20160", "20161", "20162"), (stryMutAct_9fa48("20164") ? facilitatorNotes.tasks.length > 0 || facilitatorNotes.tasks[0].daily_goal : stryMutAct_9fa48("20163") ? true : (stryCov_9fa48("20163", "20164"), (stryMutAct_9fa48("20167") ? facilitatorNotes.tasks.length <= 0 : stryMutAct_9fa48("20166") ? facilitatorNotes.tasks.length >= 0 : stryMutAct_9fa48("20165") ? true : (stryCov_9fa48("20165", "20166", "20167"), facilitatorNotes.tasks.length > 0)) && facilitatorNotes.tasks[0].daily_goal)) && <div className="facilitator-view__daily-goal">
                  <strong>Daily Goal:</strong> {facilitatorNotes.tasks[0].daily_goal}
                </div>)}
            </div>

            <div className="facilitator-view__tasks">
              <h3>Task-by-Task Facilitation Notes ({facilitatorNotes.taskCount} tasks)</h3>
              
              {facilitatorNotes.tasks.map(stryMutAct_9fa48("20168") ? () => undefined : (stryCov_9fa48("20168"), (task, index) => <div key={stryMutAct_9fa48("20171") ? task.id && index : stryMutAct_9fa48("20170") ? false : stryMutAct_9fa48("20169") ? true : (stryCov_9fa48("20169", "20170", "20171"), task.id || index)} className="facilitator-view__task">
                  <div className="facilitator-view__task-header">
                    <h4>{task.task_title}</h4>
                    <div className="facilitator-view__task-time">
                      {task.start_time} - {task.end_time}
                    </div>
                  </div>
                  <div className="facilitator-view__task-notes">
                    {task.facilitator_notes}
                  </div>
                </div>))}
              
              {stryMutAct_9fa48("20174") ? facilitatorNotes.taskCount === 0 || <p>No tasks with facilitator notes found for this day.</p> : stryMutAct_9fa48("20173") ? false : stryMutAct_9fa48("20172") ? true : (stryCov_9fa48("20172", "20173", "20174"), (stryMutAct_9fa48("20176") ? facilitatorNotes.taskCount !== 0 : stryMutAct_9fa48("20175") ? true : (stryCov_9fa48("20175", "20176"), facilitatorNotes.taskCount === 0)) && <p>No tasks with facilitator notes found for this day.</p>)}
            </div>
          </div>)}

        {stryMutAct_9fa48("20179") ? !facilitatorNotes && !loading && !error || <div className="facilitator-view__empty-state">
            <p>Enter a Day Number above to load facilitator notes</p>
            <div className="facilitator-view__examples">
              <h4>Examples:</h4>
              <ul>
                <li><strong>Day Number:</strong> 1, 9, 15, 25</li>
              </ul>
              <p>This will show all tasks for that day that have facilitator notes.</p>
            </div>
          </div> : stryMutAct_9fa48("20178") ? false : stryMutAct_9fa48("20177") ? true : (stryCov_9fa48("20177", "20178", "20179"), (stryMutAct_9fa48("20181") ? !facilitatorNotes && !loading || !error : stryMutAct_9fa48("20180") ? true : (stryCov_9fa48("20180", "20181"), (stryMutAct_9fa48("20183") ? !facilitatorNotes || !loading : stryMutAct_9fa48("20182") ? true : (stryCov_9fa48("20182", "20183"), (stryMutAct_9fa48("20184") ? facilitatorNotes : (stryCov_9fa48("20184"), !facilitatorNotes)) && (stryMutAct_9fa48("20185") ? loading : (stryCov_9fa48("20185"), !loading)))) && (stryMutAct_9fa48("20186") ? error : (stryCov_9fa48("20186"), !error)))) && <div className="facilitator-view__empty-state">
            <p>Enter a Day Number above to load facilitator notes</p>
            <div className="facilitator-view__examples">
              <h4>Examples:</h4>
              <ul>
                <li><strong>Day Number:</strong> 1, 9, 15, 25</li>
              </ul>
              <p>This will show all tasks for that day that have facilitator notes.</p>
            </div>
          </div>)}
      </div>
    </div>;
  }
};
export default FacilitatorView;